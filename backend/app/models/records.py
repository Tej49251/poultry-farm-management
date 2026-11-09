"""
SQLAlchemy models for Daily Logs, Feed Inventory, Bird Lifting, and Grower Settlement.
"""

from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    log_date = Column(Date, nullable=False, index=True)
    flock_age_days = Column(Integer, nullable=False)
    daily_mortality = Column(Integer, default=0, nullable=False)
    daily_feed_bags = Column(Float, default=0.0, nullable=False)
    daily_feed_kg = Column(Float, default=0.0, nullable=False)
    avg_body_weight_grams = Column(Float, nullable=True)
    water_consumption_litres = Column(Float, nullable=True)
    medicine_administered = Column(String(200), nullable=True)
    temperature_celsius = Column(Float, nullable=True)
    humidity_pct = Column(Float, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", backref="daily_logs")


class FeedInventory(Base):
    __tablename__ = "feed_inventory"

    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    feed_type = Column(String(50), nullable=False)  # Pre-Starter, Starter, Finisher
    transaction_type = Column(String(20), nullable=False)  # Inward, Consumption, Adjustment
    bags_count = Column(Float, nullable=False)
    weight_kg_per_bag = Column(Float, default=50.0)
    total_weight_kg = Column(Float, nullable=False)
    supplier_name = Column(String(100), nullable=True)
    supplier_invoice_no = Column(String(50), nullable=True)
    cost_per_bag = Column(Float, default=0.0)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WeightSample(Base):
    __tablename__ = "weight_samples"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    sample_date = Column(Date, nullable=False, index=True)
    flock_age_days = Column(Integer, nullable=False)
    sample_birds_count = Column(Integer, default=100, nullable=False)
    avg_weight_grams = Column(Float, nullable=False)
    uniformity_pct = Column(Float, default=85.0)
    breed_standard_target_grams = Column(Float, nullable=False)
    variance_grams = Column(Float, nullable=False)
    computed_cumulative_fcr = Column(Float, default=1.60)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", backref="weight_samples")


class BirdLifting(Base):
    __tablename__ = "bird_liftings"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    slip_no = Column(String(50), unique=True, index=True, nullable=False)
    lifting_date = Column(Date, nullable=False)
    buyer_name = Column(String(100), nullable=False)
    vehicle_no = Column(String(50), nullable=False)
    driver_name = Column(String(100), nullable=True)
    cages_count = Column(Integer, nullable=False)
    birds_count = Column(Integer, nullable=False)
    gross_weight_kg = Column(Float, nullable=False)
    tare_weight_kg = Column(Float, nullable=False)
    net_weight_kg = Column(Float, nullable=False)
    avg_weight_kg = Column(Float, nullable=False)
    transit_mortality_birds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), unique=True, nullable=False)
    settlement_date = Column(Date, nullable=False)
    voucher_no = Column(String(50), unique=True, nullable=False)
    total_birds_lifted = Column(Integer, nullable=False)
    total_net_weight_kg = Column(Float, nullable=False)
    actual_fcr = Column(Float, nullable=False)
    benchmark_fcr = Column(Float, default=1.60)
    actual_mortality_pct = Column(Float, nullable=False)
    standard_mortality_pct = Column(Float, default=5.0)
    base_gc_rate_per_kg = Column(Float, nullable=False)
    base_growing_charges = Column(Float, nullable=False)
    fcr_incentive = Column(Float, default=0.0)
    other_incentives = Column(Float, default=0.0)
    mortality_deduction = Column(Float, default=0.0)
    medicine_deduction = Column(Float, default=0.0)
    total_deductions = Column(Float, default=0.0)
    net_payable_amount = Column(Float, nullable=False)
    status = Column(String(20), default="Approved")  # Draft, Approved, Paid
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
