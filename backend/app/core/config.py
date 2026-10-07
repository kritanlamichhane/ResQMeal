"""
ResQMeal Application Configuration Module
==========================================
Defines global environment settings, security keys, token expiration policies,
and CORS whitelist origins using Pydantic Settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application settings schema loaded from environment variables or defaults."""
    PROJECT_NAME: str = "ResQMeal API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    SECRET_KEY: str = "supersecretkey-resqmeal-production-grade-jwt-token-key-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # SQLite default for local zero-setup execution (supports PostgreSQL in production)
    DATABASE_URL: str = "sqlite:///./resqmeal.db"
    
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
    
    DEFAULT_RESERVATION_EXPIRY_MINUTES: int = 30
    DEFAULT_SURPLUS_DISCOUNT_PERCENT: float = 40.0
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse comma-separated origin strings into a clean list for FastAPI CORS middleware."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", "../backend/.env"),
        extra="ignore"
    )

settings = Settings()
