"""
Core application configuration.
Supports SQLite (local development/testing) and PostgreSQL (production).
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Poultry Farm Management System"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./poultry_farm.db")
    
    # PostgreSQL specific configs (used if DATABASE_URL not set directly)
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "poultry_farm")
    
    # JWT Authentication configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "poultry-farm-secret-key-production-ready-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Broiler standards
    STANDARD_BENCHMARK_FCR: float = 1.60
    STANDARD_MORTALITY_PCT: float = 5.0

    model_config = SettingsConfigDict(case_sensitive=True)

    def get_database_url(self) -> str:
        """Return configured DATABASE_URL or assemble PostgreSQL URL if configured."""
        if os.getenv("DATABASE_URL"):
            return self.DATABASE_URL
        if os.getenv("POSTGRES_SERVER"):
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self.DATABASE_URL


settings = Settings()
