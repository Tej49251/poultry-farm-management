"""
Pydantic schemas for Daily Flock Register.
"""

from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class DailyLogBase(BaseModel):
    batch_id: int
    log_date: date
    flock_age_days: int = Field(..., gt=0)
    daily_mortality: int = Field(0, ge=0)
    daily_feed_bags: float = Field(..., ge=0.0)
    avg_body_weight_grams: Optional[float] = Field(None, ge=0.0)
    water_consumption_litres: Optional[float] = Field(None, ge=0.0)
    medicine_administered: Optional[str] = None
    temperature_celsius: Optional[float] = None
    humidity_pct: Optional[float] = None
    remarks: Optional[str] = None


class DailyLogCreate(DailyLogBase):
    pass


class DailyLogUpdate(BaseModel):
    daily_mortality: Optional[int] = Field(None, ge=0)
    daily_feed_bags: Optional[float] = Field(None, ge=0.0)
    avg_body_weight_grams: Optional[float] = None
    water_consumption_litres: Optional[float] = None
    medicine_administered: Optional[str] = None
    temperature_celsius: Optional[float] = None
    humidity_pct: Optional[float] = None
    remarks: Optional[str] = None


class DailyLogResponse(DailyLogBase):
    id: int
    daily_feed_kg: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DailyLogSummaryResponse(BaseModel):
    total_logs: int
    total_mortality: int
    total_feed_consumed_kg: float
    total_feed_bags: float
    avg_daily_feed_per_bird_grams: float
    latest_avg_weight_grams: Optional[float] = None
    logs: List[DailyLogResponse]
