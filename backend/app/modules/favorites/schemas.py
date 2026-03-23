# backend/app/modules/favorites/schemas.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.products.schemas import ProductRead

# ========== ВХОДНЫЕ ДАННЫЕ ==========

class FavoriteCreate(BaseModel):
    """Создание избранного (по product_id)"""
    product_id: int

# ========== ВЫХОДНЫЕ ДАННЫЕ ==========

class FavoriteRead(BaseModel):
    """Ответ с данными избранного"""
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    
    # Вложенный товар (опционально)
    product: Optional['ProductRead'] = None
    
    model_config = ConfigDict(from_attributes=True)

# Для списка избранного
class FavoriteListResponse(BaseModel):
    """Ответ со списком избранного"""
    items: list['FavoriteRead']
    total: int

# Для ребилда (после импорта ProductRead)
try:
    from app.modules.products.schemas import ProductRead
    FavoriteRead.model_rebuild()
except ImportError:
    pass