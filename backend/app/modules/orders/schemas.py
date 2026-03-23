# backend/app/modules/orders/schemas.py
from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from app.modules.products.schemas import ProductRead
    from app.modules.users.schemas import UserRead

# ========== ENUM ДЛЯ СТАТУСОВ ==========
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# ========== БАЗОВЫЕ СХЕМЫ ==========
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1, le=999)
    price: float = Field(..., ge=0)

class OrderBase(BaseModel):
    shipping_address: str = Field(..., min_length=5, max_length=500)
    contact_phone: str = Field(..., min_length=10, max_length=20)

# ========== ВХОДНЫЕ ДАННЫЕ ==========
class OrderItemCreate(OrderItemBase):
    """Создание позиции заказа (используется внутри)"""
    pass

class OrderCreate(OrderBase):
    """Создание заказа (фронтенд отправляет)"""
    pass

class OrderUpdate(BaseModel):
    """Обновление заказа (статус)"""
    status: OrderStatus

# ========== ВЫХОДНЫЕ ДАННЫЕ ==========
class OrderItemRead(OrderItemBase):
    id: int
    order_id: int
    product: Optional['ProductRead'] = None
    
    model_config = ConfigDict(from_attributes=True)

class OrderRead(OrderBase):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemRead] = []
    
    model_config = ConfigDict(from_attributes=True)

# ========== ДЛЯ СПИСКА ЗАКАЗОВ ==========
class OrderListResponse(BaseModel):
    items: List[OrderRead]
    total: int
    page: int
    size: int
    pages: int

# ========== ДЛЯ АДМИНИСТРИРОВАНИЯ ==========
class OrderAdminUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    shipping_address: Optional[str] = Field(None, min_length=5, max_length=500)
    contact_phone: Optional[str] = Field(None, min_length=10, max_length=20)

# ========== РЕБИЛД ДЛЯ ЦИКЛИЧЕСКИХ ССЫЛОК ==========
try:
    from app.modules.products.schemas import ProductRead
    OrderItemRead.model_rebuild()
except ImportError:
    pass