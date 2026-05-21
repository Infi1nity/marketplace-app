from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.core.database import get_db
from app.modules.users.dependencies import require_admin
from app.modules.users.models import User, UserRole
from app.modules.products.models import Product, Category
from app.modules.orders.models import Order, OrderItem, OrderStatus
from app.modules.admin import schemas
from app.modules.users.schemas import UserRole as UserRoleSchema

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=schemas.AdminDashboard)
def get_admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_sellers = db.query(User).filter(User.role == UserRole.SELLER).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()

    total_revenue = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .join(Order)
        .filter(Order.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED]))
        .scalar()
        or 0.0
    )

    return schemas.AdminDashboard(
        total_users=total_users,
        total_sellers=total_sellers,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
    )


@router.get("/users", response_model=schemas.AdminUserListResponse)
def get_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
):
    query = db.query(User)

    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid role")

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            User.username.ilike(pattern) | User.email.ilike(pattern)
        )

    total = query.count()
    users = query.order_by(User.id.desc()).offset(skip).limit(limit).all()

    return schemas.AdminUserListResponse(
        items=users,
        total=total,
        page=skip // limit + 1 if limit else 1,
        size=limit,
        pages=(total + limit - 1) // limit if limit else 1,
    )


@router.patch("/users/{user_id}", response_model=schemas.AdminUserRead)
def update_user(
    user_id: int,
    update_data: schemas.AdminUserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot modify yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    return None


@router.get("/products", response_model=dict)
def get_all_products(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
):
    query = db.query(Product)

    if search:
        pattern = f"%{search}%"
        query = query.filter(Product.name.ilike(pattern))

    total = query.count()
    products = query.order_by(Product.id.desc()).offset(skip).limit(limit).all()

    return {
        "items": [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "price": p.price,
                "stock": p.stock,
                "is_active": p.is_active,
                "seller_id": p.seller_id,
                "created_at": p.created_at,
            }
            for p in products
        ],
        "total": total,
    }


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product(
    product_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return None


@router.get("/orders", response_model=dict)
def get_all_orders(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
):
    query = db.query(Order)

    if status_filter:
        try:
            status_enum = OrderStatus(status_filter)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid order status")

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "items": [
            {
                "id": o.id,
                "user_id": o.user_id,
                "status": o.status.value if hasattr(o.status, 'value') else o.status,
                "total_amount": o.total_amount,
                "created_at": o.created_at,
            }
            for o in orders
        ],
        "total": total,
    }


@router.post("/categories", response_model=dict, status_code=status.HTTP_201_CREATED)
def admin_create_category(
    category_data: schemas.AdminCategoryCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Category)
        .filter(
            (Category.name == category_data.name) | (Category.slug == category_data.slug)
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category name or slug already exists")

    category = Category(
        name=category_data.name,
        slug=category_data.slug,
        description=category_data.description,
        parent_id=category_data.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
    }


@router.put("/categories/{category_id}", response_model=dict)
def admin_update_category(
    category_id: int,
    category_data: schemas.AdminCategoryUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_dict = category_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return {"id": category.id, "name": category.name, "slug": category.slug}


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_category(
    category_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product_count = db.query(Product).filter(Product.category_id == category_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category with {product_count} products",
        )

    db.delete(category)
    db.commit()
    return None