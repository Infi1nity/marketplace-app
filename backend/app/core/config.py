from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    DEBUG: bool = True

    DATABASE_URL: str = Field(...)

    DB_POOL_SIZE: int = Field(
        default=5,
        ge=1,
        le=50
    )

    DB_MAX_OVERFLOW: int = Field(
        default=10,
        ge=0,
        le=100
    )

    DB_POOL_PRE_PING: bool = True

    DB_ECHO: bool = False

    SECRET_KEY: Optional[str] = None

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        ge=1
    )

settings = Settings()