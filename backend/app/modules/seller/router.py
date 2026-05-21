from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime
import uuid
import os

from app.core.database import get_db
from app.modules.users.dependencies import require_seller, require_admin
from app.modules.users.models import User
from app.modules.products.models import Product, Category
from app.modules.orders.models import Order, OrderItem, OrderStatus
from app.modules.seller import schemas

router = APIRouter(prefix="/seller", tags=["Seller"])


@router.get("/dashboard", response_model=schemas.SellerDashboard)
def get_seller_dashboard(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    seller_id = current_user.id

    total_products = db.query(Product).filter(Product.seller_id == seller_id).count()
    active_products = db.query(Product).filter(
        Product.seller_id == seller_id, Product.is_active == True
    ).count()

    product_ids = [
        p.id
        for p in db.query(Product.id).filter(Product.seller_id == seller_id).all()
    ]
    total_orders = (
        db.query(OrderItem)
        .filter(OrderItem.product_id.in_(product_ids))
        .distinct(OrderItem.order_id)
        .count()
        if product_ids
        else 0
    )

    pending_orders = (
        db.query(OrderItem)
        .join(Order)
        .filter(
            OrderItem.product_id.in_(product_ids),
            Order.status == OrderStatus.PENDING,
        )
        .distinct(OrderItem.order_id)
        .count()
        if product_ids
        else 0
    )

    total_revenue = (
        db.query(OrderItem)
        .join(Order)
        .filter(
            OrderItem.product_id.in_(product_ids),
            Order.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED]),
        )
        .with_entities(
            func.sum(OrderItem.price * OrderItem.quantity)
        )
        .scalar()
        or 0.0
    )

    return schemas.SellerDashboard(
        total_products=total_products,
        active_products=active_products,
        total_orders=total_orders,
        pending_orders=pending_orders,
        total_revenue=float(total_revenue),
        shop_name=current_user.shop_name,
        is_verified_seller=current_user.is_verified_seller,
    )


@router.get("/products", response_model=list[schemas.SellerProductRead])
def get_seller_products(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    products = (
        db.query(Product)
        .filter(Product.seller_id == current_user.id)
        .order_by(Product.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return products


@router.post(
    "/products",
    response_model=schemas.SellerProductRead,
    status_code=status.HTTP_201_CREATED,
)
def create_seller_product(
    product_data: schemas.SellerProductCreate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    existing = db.query(Product).filter(Product.slug == product_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product slug already exists")

    category = (
        db.query(Category).filter(Category.id == product_data.category_id).first()
    )
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    product = Product(
        name=product_data.name,
        slug=product_data.slug,
        description=product_data.description,
        price=product_data.price,
        image=product_data.image,
        stock=product_data.stock,
        category_id=product_data.category_id,
        seller_id=current_user.id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put(
    "/products/{product_id}", response_model=schemas.SellerProductRead
)
def update_seller_product(
    product_id: int,
    product_data: schemas.SellerProductUpdate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.seller_id == current_user.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product_data.slug and product_data.slug != product.slug:
        existing = (
            db.query(Product).filter(Product.slug == product_data.slug).first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Product slug already exists")

    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seller_product(
    product_id: int,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.seller_id == current_user.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return None


@router.get("/orders", response_model=schemas.SellerOrderListResponse)
def get_seller_orders(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    product_ids = [
        p.id
        for p in db.query(Product.id).filter(Product.seller_id == current_user.id).all()
    ]

    if not product_ids:
        return schemas.SellerOrderListResponse(items=[], total=0)

    order_items_query = (
        db.query(OrderItem)
        .join(Order)
        .filter(OrderItem.product_id.in_(product_ids))
    )

    if status_filter:
        try:
            status_enum = OrderStatus(status_filter)
            order_items_query = order_items_query.filter(Order.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid order status")

    total = order_items_query.distinct(OrderItem.order_id).count()

    order_ids = [
        r[0]
        for r in order_items_query.with_entities(OrderItem.order_id)
        .distinct()
        .offset(skip)
        .limit(limit)
        .all()
    ]

    orders = (
        db.query(Order).filter(Order.id.in_(order_ids)).order_by(Order.created_at.desc()).all()
        if order_ids
        else []
    )

    result = []
    for order in orders:
        items = (
            db.query(OrderItem)
            .filter(
                OrderItem.order_id == order.id,
                OrderItem.product_id.in_(product_ids),
            )
            .all()
        )
        order_items_out = []
        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            order_items_out.append(
                schemas.SellerOrderItem(
                    id=item.id,
                    product_id=item.product_id,
                    product_name=product.name if product else "Unknown",
                    quantity=item.quantity,
                    price=item.price,
                )
            )
        result.append(
            schemas.SellerOrder(
                id=order.id,
                status=order.status.value if hasattr(order.status, 'value') else order.status,
                total_amount=order.total_amount,
                shipping_address=order.shipping_address,
                contact_phone=order.contact_phone,
                created_at=order.created_at,
                items=order_items_out,
            )
        )

    return schemas.SellerOrderListResponse(items=result, total=total)


@router.put("/profile", response_model=dict)
def update_shop_profile(
    profile_data: schemas.ShopProfileUpdate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return {
        "shop_name": current_user.shop_name,
        "shop_description": current_user.shop_description,
        "shop_logo": current_user.shop_logo,
        "phone": current_user.phone,
    }


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_seller),
):
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    url = f"/uploads/{filename}"
    return {"url": url, "filename": filename}
