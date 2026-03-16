from pydantic import BaseModel
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
