# backend/app/modules/cart/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.cart import schemas
from app.modules.cart.models import Cart, CartItem
from app.modules.users.models import User
from app.modules.products.models import Product

router = APIRouter(prefix="/cart", tags=["Cart"])

# ========== HELPER ФУНКЦИИ ==========

def get_or_create_cart(db: Session, user_id: int) -> Cart:
    """Получить корзину пользователя или создать новую"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def validate_product_exists(db: Session, product_id: int) -> Product:
    """Проверить существование товара и вернуть его"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product {product.name} is not active"
        )
    if product.stock <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product {product.name} is out of stock"
        )
    return product

def validate_cart_item_ownership(db: Session, item_id: int, user_id: int) -> CartItem:
    """Проверить, что элемент корзины принадлежит пользователю"""
    item = db.query(CartItem).join(Cart).filter(
        CartItem.id == item_id,
        Cart.user_id == user_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    return item

def check_stock(product: Product, requested_quantity: int) -> None:
    """Проверить наличие товара на складе"""
    if product.stock < requested_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock. Available: {product.stock}, Requested: {requested_quantity}"
        )

# ========== ЭНДПОИНТЫ ==========

@router.get("/", response_model=schemas.CartRead)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить корзину текущего пользователя.
    Возвращает все товары в корзине с информацией о количестве и цене.
    """
    cart = get_or_create_cart(db, current_user.id)
    
    # Загружаем товары в корзине
    items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    # Для каждого элемента подгружаем информацию о товаре
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        item.product = product  # Добавляем для схемы
    
    cart.items = items
    
    return cart


@router.post("/items", response_model=schemas.CartItemRead, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item: schemas.CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Добавить товар в корзину.
    Если товар уже есть в корзине — увеличивает количество.
    """
    # Проверяем существование товара
    product = validate_product_exists(db, item.product_id)
    
    # Проверяем наличие на складе
    check_stock(product, item.quantity)
    
    # Получаем или создаем корзину
    cart = get_or_create_cart(db, current_user.id)
    
    # Проверяем, есть ли уже такой товар в корзине
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item.product_id
    ).first()
    
    if existing_item:
        # Если товар уже есть — увеличиваем количество
        new_quantity = existing_item.quantity + item.quantity
        check_stock(product, new_quantity)
        
        existing_item.quantity = new_quantity
        existing_item.added_at = datetime.now()  # обновляем дату добавления
        db.commit()
        db.refresh(existing_item)
        
        # Подгружаем информацию о товаре
        existing_item.product = product
        return existing_item
    else:
        # Если нет — создаём новый элемент
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        # Подгружаем информацию о товаре
        new_item.product = product
        return new_item


@router.put("/items/{item_id}", response_model=schemas.CartItemRead)
def update_cart_item(
    item_id: int,
    update: schemas.CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Изменить количество товара в корзине.
    """
    # Проверяем, что элемент принадлежит пользователю
    item = validate_cart_item_ownership(db, item_id, current_user.id)
    
    # Проверяем товар и наличие на складе
    product = validate_product_exists(db, item.product_id)
    check_stock(product, update.quantity)
    
    # Если количество = 0, удаляем элемент
    if update.quantity <= 0:
        db.delete(item)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Item removed from cart"
        )
    
    # Обновляем количество
    item.quantity = update.quantity
    db.commit()
    db.refresh(item)
    
    # Подгружаем информацию о товаре
    item.product = product
    
    return item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Удалить товар из корзины полностью.
    """
    # Проверяем, что элемент принадлежит пользователю
    item = validate_cart_item_ownership(db, item_id, current_user.id)
    
    db.delete(item)
    db.commit()
    
    return None


# ========== ДОПОЛНИТЕЛЬНЫЕ ЭНДПОИНТЫ ==========

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Очистить всю корзину (удалить все товары).
    """
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    
    return None


@router.post("/items/{item_id}/increase", response_model=schemas.CartItemRead)
def increase_item_quantity(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Увеличить количество товара на 1 (удобно для фронтенда).
    """
    item = validate_cart_item_ownership(db, item_id, current_user.id)
    product = validate_product_exists(db, item.product_id)
    
    new_quantity = item.quantity + 1
    check_stock(product, new_quantity)
    
    item.quantity = new_quantity
    db.commit()
    db.refresh(item)
    item.product = product
    
    return item


@router.post("/items/{item_id}/decrease", response_model=schemas.CartItemRead)
def decrease_item_quantity(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Уменьшить количество товара на 1.
    Если количество станет 0 — удаляет элемент.
    """
    item = validate_cart_item_ownership(db, item_id, current_user.id)
    product = validate_product_exists(db, item.product_id)
    
    new_quantity = item.quantity - 1
    
    if new_quantity <= 0:
        db.delete(item)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Item removed from cart"
        )
    
    item.quantity = new_quantity
    db.commit()
    db.refresh(item)
    item.product = product
    
    return item