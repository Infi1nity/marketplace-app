from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.products import schemas, service
from app.modules.products.models import Product, Category

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=list[schemas.ProductRead])
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


@router.get("/{slug}", response_model=schemas.ProductRead)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug).first()

    if not product:
        raise HTTPException(404, detail=f"Product with slug '{slug}' not found")


    return product