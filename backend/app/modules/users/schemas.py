from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Общие поля пользователя"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)


class UserCreate(UserBase):
    """Регистрация нового пользователя"""
    password: str = Field(..., min_length=6, max_length=72)
    
    @model_validator(mode='after')
    def validate_password_length(self) -> 'UserCreate':
        """Проверка длины пароля в байтах (ограничение bcrypt)"""
        if self.password and len(self.password.encode('utf-8')) > 72:
            raise ValueError('Password too long for bcrypt (max 72 bytes)')
        return self

class UserLogin(BaseModel):
    """Вход в систему"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str
    
    @model_validator(mode='after')
    def check_email_or_username(self) -> 'UserLogin':
        """Хотя бы одно из полей (email или username) должно быть заполнено"""
        if not self.email and not self.username:
            raise ValueError('Either email or username is required')
        return self


class UserUpdate(BaseModel):
    """Обновление данных пользователя (все поля опциональные)"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)


class UserPasswordChange(BaseModel):
    """Смена пароля"""
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=72)
    
    @model_validator(mode='after')
    def validate_passwords(self) -> 'UserPasswordChange':
        """Проверка, что новый пароль отличается от старого"""
        if self.old_password and self.new_password and self.old_password == self.new_password:
            raise ValueError('New password must be different from old password')
        return self
    
    @model_validator(mode='after')
    def validate_new_password_length(self) -> 'UserPasswordChange':
        """Проверка длины нового пароля в байтах"""
        if self.new_password and len(self.new_password.encode('utf-8')) > 72:
            raise ValueError('New password too long for bcrypt (max 72 bytes)')
        return self


class UserRead(BaseModel):
    """Данные пользователя для ответа (без пароля)"""
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# class UserCreate(BaseModel):
#     email: EmailStr
#     username: str = Field(..., min_length=3, max_length=50)
#     full_name: Optional[str] = Field(None, min_length=1, max_length=100)
#     password: str = Field(..., min_length=6, max_length=72)


# class UserLogin(BaseModel):
#     email: Optional[EmailStr] = None
#     username: Optional[str] = None
#     password: str

#     @model_validator(mode='after')
#     def check_email_or_username(self):
#         if not self.email and not self.username:
#             raise ValueError('Email or username is required')
#         return self

class TokenRefresh(BaseModel):
    """Обновление токена"""
    refresh_token: str

class Token(BaseModel):
    """Токен доступа"""
    access_token: str
    refresh_token: Optional[str] = None  # если используешь refresh токены
    token_type: str = "bearer"
    expires_in: int  # время жизни в секундах


class TokenPayload(BaseModel):
    """Содержимое JWT токена (для внутреннего использования)"""
    sub: str  # user_id
    exp: Optional[int] = None  # expiration time
    iat: Optional[int] = None  # issued at
    email: Optional[str] = None
    username: Optional[str] = None
    is_superuser: bool = False

# class UserRead(BaseModel):
#     """Данные пользователя (без секретов)"""
#     id: int
#     email: EmailStr
#     username: str
#     full_name: Optional[str] = None
#     is_active: bool = True
#     is_superuser: bool = False
#     created_at: datetime
    
#     model_config = ConfigDict(from_attributes=True)



# ========== ДЛЯ АДМИНИСТРИРОВАНИЯ ==========

class UserAdminCreate(UserCreate):
    """Создание пользователя администратором"""
    is_active: bool = True
    is_superuser: bool = False

class UserAdminUpdate(BaseModel):
    """Обновление пользователя администратором"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6)

# ========== ДЛЯ СПИСКОВ ==========

# class UserList(BaseModel):
#     """Список пользователей с пагинацией"""
#     items: List[UserRead]
#     total: int
#     page: int
#     size: int
#     pages: int