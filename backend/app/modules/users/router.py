from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta

from app.core import security
from app.core.security import get_current_user, get_password_hash
from app.core.database import get_db
from app.core.config import settings
from app.modules.users import schemas
from app.modules.users.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

# ========== ПУБЛИЧНЫЕ ЭНДПОИНТЫ (НЕ ТРЕБУЮТ АВТОРИЗАЦИИ) ==========

@router.post('/register', response_model=schemas.UserRead)
def register(
    userData: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Регистрация нового пользователя"""
    # Проверка email
    existing_email = db.query(User).filter(User.email == userData.email).first()
    if existing_email:
        raise HTTPException(400, detail='Email already registered')
    
    # Проверка username
    existing_username = db.query(User).filter(User.username == userData.username).first()
    if existing_username:
        raise HTTPException(400, detail='Username already taken')
    
    # Хеширование пароля
    hashed_password = get_password_hash(userData.password)
    
    # Создание пользователя
    new_user = User(
        email=userData.email,
        username=userData.username,
        full_name=userData.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login")
def login(
    user_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """Вход в систему (получение токена)"""
    # Поиск пользователя по email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Проверка активности
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User is inactive")
    
    # Проверка пароля
    if not security.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Создание токена
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    
    # Возврат токена и данных пользователя
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": schemas.UserRead.model_validate(user)
    }

# ========== ЭНДПОИНТЫ, ТРЕБУЮЩИЕ АВТОРИЗАЦИИ ==========

@router.get("/profile", response_model=schemas.UserRead)
def get_profile(
    current_user: User = Depends(get_current_user)  # 👈 автоматическая проверка токена
):
    """
    Получить профиль текущего пользователя
    Требуется: валидный токен в заголовке Authorization
    """
    return current_user

@router.put("/profile", response_model=schemas.UserRead)
def update_profile(
    user_update: schemas.UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновить профиль текущего пользователя
    Требуется: валидный токен
    """
    # Проверка уникальности email (если меняется)
    if user_update.email and user_update.email != current_user.email:
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing:
            raise HTTPException(400, detail="Email already taken")
    
    # Проверка уникальности username (если меняется)
    if user_update.username and user_update.username != current_user.username:
        existing = db.query(User).filter(User.username == user_update.username).first()
        if existing:
            raise HTTPException(400, detail="Username already taken")
    
    # Обновление полей
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Выход из системы
    В JWT клиент просто удаляет токен на своей стороне,
    но можно добавить в черный список при необходимости
    """
    # Здесь можно добавить токен в черный список
    # или просто вернуть подтверждение
    return {"message": "Successfully logged out"}

@router.post("/change-password")
def change_password(
    passwords: schemas.UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Смена пароля (требуется старый пароль)"""
    # Проверка старого пароля
    if not security.verify_password(passwords.old_password, current_user.hashed_password):
        raise HTTPException(400, detail="Incorrect old password")
    
    # Хеширование нового пароля
    current_user.hashed_password = get_password_hash(passwords.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.delete("/profile", status_code=204)
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Удалить свой аккаунт (деактивация)
    """
    # Мягкое удаление (деактивация)
    current_user.is_active = False
    db.commit()
    
    return None  # 204 No Content

# ========== ДОПОЛНИТЕЛЬНЫЕ ПОЛЕЗНЫЕ ЭНДПОИНТЫ ==========

@router.get("/verify-token")
def verify_token(
    current_user: User = Depends(get_current_user)
):
    """
    Проверить, что токен валиден
    Полезно для фронтенда при загрузке приложения
    """
    return {
        "valid": True,
        "user": schemas.UserRead.model_validate(current_user)
    }