from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    price: float
    stock: int = 0
    category_id: int | None = None

class ProductRead(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    price: float
    stock: int
    is_active: bool
    category_id: int | None = None
    created_at: datetime
    updated_at: datetime | None = None

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryRead(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class CategoryWithChildren(CategoryRead):
    children: List["CategoryRead"] = []  # вложенные подкатегории