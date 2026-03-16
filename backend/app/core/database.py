from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from app.core.config import settings


engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,  # пул соединений для производительности
        pool_size=5,          # размер пула
        max_overflow=10,      # максимум дополнительных соединений
        pool_pre_ping=True,   # проверять соединения перед использованием
        echo=settings.DEBUG   # логировать SQL запросы в режиме DEBUG
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Функция для получения сессии БД (dependency для FastAPI)
def get_db():
    """
    Генератор для получения сессии БД.
    Используется как зависимость в FastAPI.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from app.modules.users.models import User
from app.modules.products.models import Product, Category
from app.modules.cart.models import Cart, CartItem
from app.modules.favorites.models import Favorite
from app.modules.orders.models import Order, OrderItem