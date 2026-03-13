from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Связи
    user = relationship("User", back_populates="favorites")
    product = relationship("Product", back_populates="favorited_by")
    
    # Уникальность (пользователь может добавить товар в избранное только 1 раз)
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='unique_user_product_favorite'),
    )