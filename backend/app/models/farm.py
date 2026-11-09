"""
SQLAlchemy models for Farm, Shed, and Batch entities.
"""

from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=True)
    owner_name = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sheds = relationship("Shed", back_populates="farm", cascade="all, delete-orphan")


class Shed(Base):
    __tablename__ = "sheds"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(String(20), default="Empty")  # Active, Empty, Sanitizing
    dimensions_feet = Column(String(50), nullable=True)  # e.g., "250x30"
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="sheds")
    batches = relationship("Batch", back_populates="shed", order_by="desc(Batch.placement_date)")


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String(50), unique=True, index=True, nullable=False)
    shed_id = Column(Integer, ForeignKey("sheds.id"), nullable=False)
    breed = Column(String(50), default="Cobb 500", nullable=False)
    placement_date = Column(Date, nullable=False)
    initial_chicks = Column(Integer, nullable=False)
    chick_supplier = Column(String(100), nullable=True)
    chick_cost_per_bird = Column(Float, default=0.0)
    target_fcr = Column(Float, default=1.60)
    standard_mortality_pct = Column(Float, default=5.0)
    target_harvest_age_days = Column(Integer, default=40)
    status = Column(String(20), default="Active")  # Active, Completed, Settled
    closed_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    shed = relationship("Shed", back_populates="batches")

