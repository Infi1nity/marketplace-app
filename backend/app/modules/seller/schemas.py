from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ShopProfileUpdate(BaseModel):
    shop_name: Optional[str] = Field(None, min_length=1, max_length=200)
    shop_description: Optional[str] = Field(None, max_length=1000)
    shop_logo: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)


class SellerProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    image: Optional[str] = None
    stock: int = Field(0, ge=0)
    category_id: int


class SellerProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    image: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None


class SellerProductRead(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    stock: int
    is_active: bool
    category_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SellerOrderItem(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: float

    class Config:
        from_attributes = True


class SellerOrder(BaseModel):
    id: int
    status: str
    total_amount: float
    shipping_address: str
    contact_phone: str
    created_at: Optional[datetime] = None
    items: List[SellerOrderItem] = []

    class Config:
        from_attributes = True


class SellerOrderListResponse(BaseModel):
    items: List[SellerOrder]
    total: int


class SellerDashboard(BaseModel):
    total_products: int
    active_products: int
    total_orders: int
    pending_orders: int
    total_revenue: float
    shop_name: Optional[str] = None
    is_verified_seller: bool = False
