from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from app.modules.users.schemas import UserRole


class AdminUserUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified_seller: Optional[bool] = None


class AdminUserRead(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    is_superuser: bool = False
    shop_name: Optional[str] = None
    is_verified_seller: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseModel):
    items: List[AdminUserRead]
    total: int
    page: int
    size: int
    pages: int


class AdminCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None


class AdminCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None


class AdminDashboard(BaseModel):
    total_users: int
    total_sellers: int
    total_products: int
    total_orders: int
    total_revenue: float
