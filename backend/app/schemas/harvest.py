"""
Pydantic schemas for Bird Lifting (Harvesting) Slips and Grower Settlement Vouchers.
"""

from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class BirdLiftingBase(BaseModel):
    batch_id: int
    slip_no: str = Field(..., max_length=50)
    lifting_date: date
    buyer_name: str = Field(..., max_length=100)
    vehicle_no: str = Field(..., max_length=50)
    driver_name: Optional[str] = None
    cages_count: int = Field(..., gt=0)
    birds_count: int = Field(..., gt=0)
    gross_weight_kg: float = Field(..., gt=0)
    tare_weight_kg: float = Field(..., gt=0)
    transit_mortality_birds: int = Field(0, ge=0)


class BirdLiftingCreate(BirdLiftingBase):
    pass


class BirdLiftingResponse(BirdLiftingBase):
    id: int
    net_weight_kg: float
    avg_weight_kg: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LiftingProgressResponse(BaseModel):
    batch_id: int
    total_placed_chicks: int
    cumulative_mortality: int
    total_live_before_harvest: int
    total_birds_lifted: int
    remaining_birds_in_shed: int
    total_net_weight_kg: float
    overall_avg_weight_kg: float
    lifting_completion_rate_pct: float
    slips: List[BirdLiftingResponse]


class SettlementCreate(BaseModel):
    batch_id: int
    voucher_no: Optional[str] = None
    settlement_date: date
    base_gc_rate_per_kg: float = Field(12.50, gt=0)
    benchmark_fcr: float = Field(1.60, gt=0)
    fcr_incentive_rate_per_point: float = Field(0.50, ge=0)
    standard_mortality_pct: float = Field(5.0, ge=0)
    other_incentives: float = Field(1200.0, ge=0)
    medicine_deduction: float = Field(350.0, ge=0)
    remarks: Optional[str] = None


class SettlementStatusUpdate(BaseModel):
    status: str = Field(..., description="Draft, Approved, or Paid")


class SettlementResponse(BaseModel):
    id: int
    batch_id: int
    settlement_date: date
    voucher_no: str
    total_birds_lifted: int
    total_net_weight_kg: float
    actual_fcr: float
    benchmark_fcr: float
    actual_mortality_pct: float
    standard_mortality_pct: float
    base_gc_rate_per_kg: float
    base_growing_charges: float
    fcr_incentive: float
    other_incentives: float
    mortality_deduction: float
    medicine_deduction: float
    total_deductions: float
    net_payable_amount: float
    status: str
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

