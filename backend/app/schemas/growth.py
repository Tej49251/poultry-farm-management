"""
Pydantic schemas for Weight Tracking, Growth Curve, and FCR Analytics.
"""

from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class WeightSampleBase(BaseModel):
    batch_id: int
    sample_date: date
    flock_age_days: int = Field(..., gt=0)
    sample_birds_count: int = Field(100, gt=0)
    avg_weight_grams: float = Field(..., gt=0)
    uniformity_pct: float = Field(85.0, ge=0.0, le=100.0)
    remarks: Optional[str] = None


class WeightSampleCreate(WeightSampleBase):
    pass


class WeightSampleResponse(WeightSampleBase):
    id: int
    breed_standard_target_grams: float
    variance_grams: float
    computed_cumulative_fcr: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GrowthCurvePoint(BaseModel):
    age_days: int
    actual_weight_grams: Optional[float] = None
    target_weight_grams: float
    cumulative_fcr: Optional[float] = None
    target_fcr: float


class GrowthOverviewResponse(BaseModel):
    batch_id: int
    current_avg_weight_grams: float
    current_avg_weight_kg: float
    adg_grams_per_day: float
    current_fcr: float
    is_fcr_favorable: bool
    variance_from_standard_grams: float
    uniformity_pct: float
    growth_curve: List[GrowthCurvePoint]
    samples: List[WeightSampleResponse]
