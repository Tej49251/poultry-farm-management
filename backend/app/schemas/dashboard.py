"""
Pydantic schemas for the poultry dashboard, batches, daily entries, and settlements.
"""

from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ShedSummary(BaseModel):
    id: int
    name: str
    capacity: int
    status: str  # Active, Empty, Sanitizing
    active_batch_code: Optional[str] = None
    flock_age_days: Optional[int] = None
    live_birds: Optional[int] = None
    mortality_rate: Optional[float] = None
    fcr: Optional[float] = None


class ActiveBatchMetrics(BaseModel):
    batch_id: int
    batch_code: str
    shed_id: int
    shed_name: str
    placement_date: date
    flock_age_days: int
    breed: str
    initial_chicks: int
    cumulative_mortality: int
    mortality_percentage: float
    livability_percentage: float
    estimated_live_birds: int
    total_feed_consumed_kg: float
    feed_intake_per_bird_grams: float
    avg_body_weight_kg: float
    current_fcr: float
    is_fcr_favorable: bool
    epef: float
    total_birds_lifted: int
    remaining_birds: int
    estimated_growing_charges: float
    settlement_status: str  # Pending, In Progress, Settled
    is_demo: bool = True


class DailyLogEntry(BaseModel):
    log_date: date
    flock_age_days: int
    daily_mortality: int
    daily_feed_bags: float
    daily_feed_kg: float
    avg_body_weight_grams: Optional[float] = None
    water_consumption_litres: Optional[float] = None
    medicine_administered: Optional[str] = None
    remarks: Optional[str] = None


class BirdLiftingEntry(BaseModel):
    slip_no: str
    lifting_date: date
    buyer_name: str
    vehicle_no: str
    cages_count: int
    birds_count: int
    gross_weight_kg: float
    tare_weight_kg: float
    net_weight_kg: float
    avg_weight_kg: float


class DashboardOverviewResponse(BaseModel):
    generated_at: datetime
    active_batch: Optional[ActiveBatchMetrics] = None
    all_sheds: List[ShedSummary]
    recent_logs: List[DailyLogEntry]
    lifting_records: List[BirdLiftingEntry]
    system_status: str = "healthy"
