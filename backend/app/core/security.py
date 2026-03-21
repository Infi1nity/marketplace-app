# backend/app/core/security.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.modules.users.models import User
from app.modules.users import schemas # Нам понадобятся схемы

# Создаем единый контекст для всех операций с паролями.
# schemes=["bcrypt"] - говорим, что используем алгоритм bcrypt.
# deprecated="auto" - автоматически обрабатывать устаревшие схемы.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_password_hash(password: str) -> str:
    """
    Принимает сырой пароль и возвращает его хеш.
    Этот хеш мы и сохраним в базе данных.
    """
    # Метод hash сам генерирует уникальную "соль" и применяет bcrypt.
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверяет, соответствует ли сырой пароль (plain_password)
    сохраненному хешу (hashed_password).
    Возвращает True или False.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создает JWT-токен."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme), # FastAPI вытащит токен из заголовка
    db: Session = Depends(get_db)
) -> User:
    """
    Основная зависимость для получения текущего пользователя.
    Пробрасывает 401, если пользователь не аутентифицирован.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Декодируем токен
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub") # "sub" - стандартное поле для идентификатора
        if user_id is None:
            raise credentials_exception
        # Валидируем данные из токена (опционально, через Pydantic)
        token_data = schemas.TokenPayload(sub=user_id)
    except JWTError:
        raise credentials_exception

    # Ищем пользователя в БД
    user = db.query(User).filter(User.id == int(token_data.sub)).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_optional_user(
    token: Optional[str] = Depends(oauth2_scheme), # Токен может быть None
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Опциональная зависимость. Возвращает пользователя, если он прислал валидный токен,
    иначе возвращает None. Не выбрасывает 401.
    Полезно для эндпоинтов вроде корзины или списка желаний.
    """
    if token is None:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    user = db.query(User).filter(User.id == int(user_id)).first()
    return user