from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    stock: int = 0


class ProductCreate(ProductBase):
    category_id: int
    slug: str


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    slug: Optional[str] = None
    is_active: Optional[bool] = None


class SellerBrief(BaseModel):
    id: int
    username: str
    shop_name: Optional[str] = None
    shop_logo: Optional[str] = None
    is_verified_seller: bool = False

    class Config:
        from_attributes = True


class ProductRead(ProductBase):
    id: int
    slug: str
    category_id: int
    seller_id: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    seller: Optional[SellerBrief] = None

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductRead]
    total: int


class CategoryBase(BaseModel):
    name: str
    slug: str


class CategoryCreate(CategoryBase):
    parent_id: Optional[int] = None


class CategoryRead(CategoryBase):
    id: int
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True


class CategoryWithChildren(CategoryRead):
    children: List["CategoryWithChildren"] = []

    class Config:
        from_attributes = True


CategoryWithChildren.model_rebuild()
