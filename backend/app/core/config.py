"""
Core application configuration.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Poultry Farm Management System"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./poultry_farm.db")
    STANDARD_BENCHMARK_FCR: float = 1.60
    STANDARD_MORTALITY_PCT: float = 5.0

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
