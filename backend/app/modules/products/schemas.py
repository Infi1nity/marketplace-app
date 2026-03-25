from pydantic import BaseModel
from typing import List, Optional


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None


class ProductCreate(ProductBase):
    category_id: int
    slug: str


class ProductRead(ProductBase):
    id: int
    slug: str
    category_id: int
    
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
