from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())
    last_login = Column(DateTime, nullable=True)

    cart = relationship("Cart", back_populates="user", uselist=False)  # один к одному
    orders = relationship("Order", back_populates="user")  # один ко многим
    favorites = relationship("Favorite", back_populates="user")  # один ко многим
    
    def __repr__(self):
        return f"<User {self.username}>"