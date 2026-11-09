"""
Pydantic schemas for Feed Management and Stock Inventory.
"""

from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class FeedTransactionBase(BaseModel):
    transaction_date: date
    feed_type: str = Field(..., description="Pre-Starter, Starter, or Finisher")
    transaction_type: str = Field(..., description="Inward, Consumption, or Adjustment")
    bags_count: float = Field(..., gt=0)
    weight_kg_per_bag: float = Field(50.0, gt=0)
    supplier_name: Optional[str] = None
    supplier_invoice_no: Optional[str] = None
    cost_per_bag: float = Field(0.0, ge=0.0)
    batch_id: Optional[int] = None
    remarks: Optional[str] = None


class FeedTransactionCreate(FeedTransactionBase):
    pass


class FeedTransactionResponse(FeedTransactionBase):
    id: int
    total_weight_kg: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeedStockItem(BaseModel):
    feed_type: str
    stage_description: str
    target_flock_age: str
    inward_bags: float
    consumed_bags: float
    current_stock_bags: float
    current_stock_kg: float
    stock_status: str  # Adequate, Low Stock, Critical
    estimated_days_left: float


class FeedOverviewResponse(BaseModel):
    total_warehouse_bags: float
    total_warehouse_tonnes: float
    estimated_flock_days_left: float
    stocks: List[FeedStockItem]
    recent_transactions: List[FeedTransactionResponse]
