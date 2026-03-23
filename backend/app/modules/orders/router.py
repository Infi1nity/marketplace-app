# backend/app/modules/orders/router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.orders import schemas
from app.modules.orders.models import Order, OrderItem, OrderStatus
from app.modules.users.models import User
from app.modules.products.models import Product
from app.modules.cart.models import Cart, CartItem

router = APIRouter(prefix="/orders", tags=["Orders"])

# ========== HELPER ФУНКЦИИ ==========

def get_cart_items(db: Session, user_id: int) -> List[CartItem]:
    """Получить все товары из корзины пользователя"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        return []
    return db.query(CartItem).filter(CartItem.cart_id == cart.id).all()

def clear_cart(db: Session, user_id: int):
    """Очистить корзину пользователя после оформления заказа"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()

def get_order_with_items(db: Session, order_id: int, user_id: int) -> Order | None:
    """Получить заказ с позициями для конкретного пользователя"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user_id
    ).first()
    
    if order:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in items:
            item.product = db.query(Product).filter(Product.id == item.product_id).first()
        order.items = items
    
    return order

# ========== ЭНДПОИНТЫ ==========

@router.get("/", response_model=schemas.OrderListResponse)
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[schemas.OrderStatus] = None
):
    """
    Получить список заказов текущего пользователя.
    Поддерживает пагинацию и фильтрацию по статусу.
    """
    query = db.query(Order).filter(Order.user_id == current_user.id)
    
    if status:
        query = query.filter(Order.status == status)
    
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # Загружаем позиции для каждого заказа
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in items:
            item.product = db.query(Product).filter(Product.id == item.product_id).first()
        order.items = items
    
    return {
        "items": orders,
        "total": total,
        "page": skip // limit + 1 if limit else 1,
        "size": limit,
        "pages": (total + limit - 1) // limit if limit else 1
    }


@router.get("/{order_id}", response_model=schemas.OrderRead)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить детальную информацию о конкретном заказе.
    """
    order = get_order_with_items(db, order_id, current_user.id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order


@router.post("/", response_model=schemas.OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: schemas.OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Создать новый заказ из товаров в корзине.
    """
    # 1. Получаем товары из корзины
    cart_items = get_cart_items(db, current_user.id)
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # 2. Проверяем наличие товаров на складе и считаем сумму
    order_items = []
    total_amount = 0
    
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {cart_item.product_id} not found"
            )
        
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product.name}"
            )
        
        # Уменьшаем количество на складе
        product.stock -= cart_item.quantity
        
        order_items.append({
            "product_id": product.id,
            "quantity": cart_item.quantity,
            "price": product.price
        })
        total_amount += product.price * cart_item.quantity
    
    # 3. Создаем заказ
    new_order = Order(
        user_id=current_user.id,
        status=schemas.OrderStatus.PENDING,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        contact_phone=order_data.contact_phone
    )
    db.add(new_order)
    db.flush()  # чтобы получить id заказа
    
    # 4. Создаем позиции заказа
    for item_data in order_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price=item_data["price"]
        )
        db.add(order_item)
    
    # 5. Очищаем корзину
    clear_cart(db, current_user.id)
    
    db.commit()
    db.refresh(new_order)
    
    # 6. Загружаем позиции для ответа
    new_order.items = []
    items = db.query(OrderItem).filter(OrderItem.order_id == new_order.id).all()
    for item in items:
        item.product = db.query(Product).filter(Product.id == item.product_id).first()
        new_order.items.append(item)
    
    return new_order


@router.patch("/{order_id}", response_model=schemas.OrderRead)
def update_order_status(
    order_id: int,
    update: schemas.OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновить статус заказа (только для администраторов).
    """
    # Проверяем права админа
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.status = update.status
    order.updated_at = datetime.now()
    db.commit()
    db.refresh(order)
    
    # Загружаем позиции
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in items:
        item.product = db.query(Product).filter(Product.id == item.product_id).first()
    order.items = items
    
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Отменить заказ (только если он в статусе PENDING).
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.status != schemas.OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be cancelled"
        )
    
    # Возвращаем товары на склад
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
    
    order.status = schemas.OrderStatus.CANCELLED
    order.updated_at = datetime.now()
    db.commit()
    
    return None