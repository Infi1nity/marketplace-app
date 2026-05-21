from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)

    role = Column(SAEnum(UserRole), default=UserRole.BUYER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Seller fields
    shop_name = Column(String(200), nullable=True)
    shop_description = Column(String(1000), nullable=True)
    shop_logo = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    is_verified_seller = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())
    last_login = Column(DateTime, nullable=True)

    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    products = relationship("Product", back_populates="seller", foreign_keys="[Product.seller_id]")

    def __repr__(self):
        return f"<User {self.username} ({self.role.value})>"