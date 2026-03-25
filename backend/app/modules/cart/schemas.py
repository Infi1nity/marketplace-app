# backend/app/modules/cart/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# ========== БАЗОВЫЕ СХЕМЫ ==========

class CartItemBase(BaseModel):
    """Базовые поля элемента корзины"""
    product_id: int
    quantity: int = Field(..., ge=1, description="Количество товара")

class CartItemCreate(CartItemBase):
    """Создание/добавление элемента в корзину"""
    pass

class CartItemUpdate(BaseModel):
    """Обновление элемента корзины (количество)"""
    quantity: int = Field(..., ge=0, le=999, description="Новое количество")

# ========== ПРОДУКТ В КОРЗИНЕ ==========

class ProductInCart(BaseModel):
    """Информация о продукте внутри корзины"""
    id: int
    name: str
    price: float
    image: Optional[str] = None
    slug: str
    description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# ========== СХЕМЫ ДЛЯ ОТВЕТОВ ==========

class CartItemRead(BaseModel):
    """Ответ с данными элемента корзины"""
    id: int
    cart_id: int
    product_id: int
    quantity: int
    added_at: datetime
    
    # Вложенные данные о товаре (для удобства фронтенда)
    product: Optional[ProductInCart] = None
    
    model_config = ConfigDict(from_attributes=True)

class CartRead(BaseModel):
    """Ответ с данными корзины"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Список товаров в корзине
    items: List[CartItemRead] = []
    
    # Вычисляемые поля (не из БД)
    total_items: int = Field(0, description="Общее количество товаров")
    total_price: float = Field(0.0, description="Общая стоимость")
    
    model_config = ConfigDict(from_attributes=True)
    
    @property
    def total(self) -> float:
        """Общая стоимость корзины"""
        return sum(
            item.quantity * (item.product.price if item.product else 0) 
            for item in self.items
        )

# ========== ДЛЯ СИНХРОНИЗАЦИИ КОРЗИНЫ (гость -> авторизованный) ==========

class CartSyncItem(BaseModel):
    """Элемент для синхронизации корзины"""
    product_id: int
    quantity: int = Field(..., ge=1)

class CartSync(BaseModel):
    """Синхронизация локальной корзины с сервером"""
    items: List[CartSyncItem] = []

# ========== ОПЕРАЦИИ С КОРЗИНОЙ ==========

class CartItemBulkCreate(BaseModel):
    """Массовое добавление товаров в корзину"""
    items: List[CartItemCreate]

class CartItemBulkResponse(BaseModel):
    """Ответ на массовое добавление"""
    added: List[int]
    errors: List[dict]

# ========== УДАЛЕНИЕ ИЗ КОРЗИНЫ ==========

class CartClearResponse(BaseModel):
    """Ответ на очистку корзины"""
    success: bool = True
    message: str = "Cart cleared successfully"
