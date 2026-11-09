"""
Pydantic schemas for Shed and Batch management.
"""

from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ShedBase(BaseModel):
    name: str = Field(..., max_length=100)
    capacity: int = Field(..., gt=0)
    dimensions_feet: Optional[str] = None
    status: str = "Empty"


class ShedCreate(ShedBase):
    farm_id: int = 1


class ShedResponse(ShedBase):
    id: int
    farm_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BatchBase(BaseModel):
    batch_code: str = Field(..., max_length=50)
    shed_id: int
    breed: str = "Cobb 500"
    placement_date: date
    initial_chicks: int = Field(..., gt=0)
    chick_supplier: Optional[str] = None
    chick_cost_per_bird: float = Field(0.0, ge=0.0)
    target_fcr: float = Field(1.60, gt=0.0)
    standard_mortality_pct: float = Field(5.0, ge=0.0, le=100.0)
    target_harvest_age_days: int = Field(40, gt=0)
    remarks: Optional[str] = None


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    breed: Optional[str] = None
    chick_supplier: Optional[str] = None
    target_fcr: Optional[float] = None
    standard_mortality_pct: Optional[float] = None
    target_harvest_age_days: Optional[int] = None
    status: Optional[str] = None  # Active, Completed, Settled
    closed_date: Optional[date] = None
    remarks: Optional[str] = None


class BatchResponse(BatchBase):
    id: int
    status: str
    closed_date: Optional[date] = None
    created_at: datetime
    flock_age_days: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class BatchDetailResponse(BatchResponse):
    shed_name: Optional[str] = None
    cumulative_mortality: int = 0
    estimated_live_birds: int = 0
    mortality_percentage: float = 0.0
    livability_percentage: float = 100.0

