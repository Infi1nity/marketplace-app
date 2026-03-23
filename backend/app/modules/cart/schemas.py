# backend/app/modules/cart/schemas.py
from pydantic import BaseModel, Field, ConfigDict, model_validator
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
    quantity: int = Field(..., ge=1, le=999, description="Новое количество")
    
    @model_validator(mode='after')
    def validate_quantity(self) -> 'CartItemUpdate':
        if self.quantity < 1:
            raise ValueError('Quantity must be at least 1')
        if self.quantity > 999:
            raise ValueError('Quantity cannot exceed 999')
        return self

# ========== СХЕМЫ ДЛЯ ОТВЕТОВ ==========

class CartItemRead(BaseModel):
    """Ответ с данными элемента корзины"""
    id: int
    cart_id: int
    product_id: int
    quantity: int
    added_at: datetime
    
    # Вложенные данные о товаре (для удобства фронтенда)
    # product: Optional['ProductRead'] = None
    
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
    
    @model_validator(mode='after')
    def calculate_totals(self) -> 'CartRead':
        """Вычисляем общее количество и стоимость"""
        self.total_items = sum(item.quantity for item in self.items)
        self.total_price = sum(
            item.quantity * (item.product.price if item.product else 0) 
            for item in self.items
        )
        return self

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
    added: List[int]  # id добавленных элементов
    errors: List[dict]  # ошибки по товарам

# ========== УДАЛЕНИЕ ИЗ КОРЗИНЫ ==========

class CartClearResponse(BaseModel):
    """Ответ на очистку корзины"""
    success: bool = True
    message: str = "Cart cleared successfully"

# ========== ДЛЯ СВЯЗИ С ДРУГИМИ МОДУЛЯМИ ==========

# Импортируем ProductRead из модуля products (для аннотации типов)
# Это нужно делать в конце файла, чтобы избежать циклических импортов
# from typing import TYPE_CHECKING
# if TYPE_CHECKING:
#     from app.modules.products.schemas import ProductRead

# # Обновляем аннотацию для product
# CartItemRead.model_rebuild()