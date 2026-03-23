# backend/app/modules/favorites/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.favorites import schemas
from app.modules.favorites.models import Favorite
from app.modules.users.models import User
from app.modules.products.models import Product

router = APIRouter(prefix="/favorites", tags=["Favorites"])

# ========== HELPER ФУНКЦИИ ==========

def check_product_exists(db: Session, product_id: int) -> Product:
    """Проверить существование товара"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return product

def get_favorite(db: Session, user_id: int, product_id: int) -> Favorite | None:
    """Получить избранное по пользователю и товару"""
    return db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.product_id == product_id
    ).first()

# ========== ЭНДПОИНТЫ ==========

@router.get("/", response_model=List[schemas.FavoriteRead])
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получить список избранных товаров текущего пользователя.
    """
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()
    
    # Подгружаем информацию о товарах
    for fav in favorites:
        fav.product = db.query(Product).filter(Product.id == fav.product_id).first()
    
    return favorites


@router.post("/{product_id}", response_model=schemas.FavoriteRead, status_code=status.HTTP_201_CREATED)
def add_to_favorites(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Добавить товар в избранное.
    """
    # Проверяем существование товара
    product = check_product_exists(db, product_id)
    
    # Проверяем, не добавлен ли уже
    existing = get_favorite(db, current_user.id, product_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in favorites"
        )
    
    # Создаем запись
    favorite = Favorite(
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    
    # Добавляем информацию о товаре для ответа
    favorite.product = product
    
    return favorite


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_favorites(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Удалить товар из избранного.
    """
    favorite = get_favorite(db, current_user.id, product_id)
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    db.delete(favorite)
    db.commit()
    
    return None


@router.get("/check/{product_id}", response_model=bool)
def check_favorite(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Проверить, находится ли товар в избранном у текущего пользователя.
    """
    favorite = get_favorite(db, current_user.id, product_id)
    return favorite is not None