from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.products import schemas, service
from app.modules.products.models import Product, Category

product_router = APIRouter(prefix="/products", tags=["Products"])

@product_router.get("/", response_model=list[schemas.ProductRead])
def get_products(db: Session = Depends(get_db),
                 category_id: Optional[int] = None,
                 skip: int = Query(0, ge=0),
                 limit: int = Query(100, ge=1, le=100)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    products = query.offset(skip).limit(limit).all()

    return products


@product_router.get("/{slug}", response_model=schemas.ProductRead)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug).first()

    if not product:
        raise HTTPException(404, detail=f"Product with slug '{slug}' not found")


    return product



category_router = APIRouter(prefix='/categories', tags=['Categories'])

@category_router.get("/", response_model=List[schemas.CategoryRead])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories


@category_router.get("/tree", response_model=List[schemas.CategoryWithChildren])
def get_category_tree(db: Session = Depends(get_db)):
    all_categories = db.query(Category).all()
    category_dict = {cat.id: cat for cat in all_categories}

    root_categories = []

    for category in all_categories:
        if category.parent_id is None:
            # Это корневая категория
            root_categories.append(category)
        else:
            # Это дочерняя категория - добавим её в children родителя
            parent = category_dict.get(category.parent_id)
            if parent:
                if not hasattr(parent, '_children'):
                    parent._children = []
                parent._children.append(category)
    
    # Теперь в root_categories у категорий есть _children
    return root_categories