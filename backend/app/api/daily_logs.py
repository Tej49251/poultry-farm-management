"""
REST API endpoints for Daily Flock Register.
"""

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.base import get_db, Base, engine
from app.models.farm import Batch
from app.models.records import DailyLog
from app.schemas.daily_log import (
    DailyLogCreate,
    DailyLogUpdate,
    DailyLogResponse,
    DailyLogSummaryResponse,
)

router = APIRouter(prefix="/daily-logs", tags=["Daily Flock Register"])


@router.post("", response_model=DailyLogResponse, status_code=status.HTTP_201_CREATED)
def create_daily_log(log_in: DailyLogCreate, db: Session = Depends(get_db)):
    """
    Records a daily flock log entry.
    Validates batch existence and calculates feed kg automatically (1 bag = 50 kg).
    Prevents duplicate entries on the same date for the same batch.
    """
    Base.metadata.create_all(bind=engine)

    batch = db.query(Batch).filter(Batch.id == log_in.batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {log_in.batch_id} not found.",
        )

    # Check for duplicate entry on the same date for this batch
    existing = (
        db.query(DailyLog)
        .filter(DailyLog.batch_id == log_in.batch_id, DailyLog.log_date == log_in.log_date)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Daily record for {log_in.log_date} already exists for batch '{batch.batch_code}'. Edit existing record instead.",
        )

    feed_kg = round(log_in.daily_feed_bags * 50.0, 2)

    new_log = DailyLog(
        batch_id=log_in.batch_id,
        log_date=log_in.log_date,
        flock_age_days=log_in.flock_age_days,
        daily_mortality=log_in.daily_mortality,
        daily_feed_bags=log_in.daily_feed_bags,
        daily_feed_kg=feed_kg,
        avg_body_weight_grams=log_in.avg_body_weight_grams,
        water_consumption_litres=log_in.water_consumption_litres,
        medicine_administered=log_in.medicine_administered,
        temperature_celsius=log_in.temperature_celsius,
        humidity_pct=log_in.humidity_pct,
        remarks=log_in.remarks,
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


@router.get("", response_model=List[DailyLogResponse])
def list_daily_logs(
    batch_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    """Lists daily flock logs with optional filtering by batch and date range."""
    Base.metadata.create_all(bind=engine)
    query = db.query(DailyLog)

    if batch_id:
        query = query.filter(DailyLog.batch_id == batch_id)
    if from_date:
        query = query.filter(DailyLog.log_date >= from_date)
    if to_date:
        query = query.filter(DailyLog.log_date <= to_date)

    return query.order_by(DailyLog.log_date.desc()).all()


@router.get("/summary/{batch_id}", response_model=DailyLogSummaryResponse)
def get_batch_logs_summary(batch_id: int, db: Session = Depends(get_db)):
    """Computes aggregated mortality and feed consumption summary for a batch."""
    Base.metadata.create_all(bind=engine)

    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {batch_id} not found.",
        )

    logs = db.query(DailyLog).filter(DailyLog.batch_id == batch_id).order_by(DailyLog.log_date.desc()).all()

    total_mortality = sum(l.daily_mortality for l in logs)
    total_feed_bags = sum(l.daily_feed_bags for l in logs)
    total_feed_kg = sum(l.daily_feed_kg for l in logs)

    estimated_live = max(1, batch.initial_chicks - total_mortality)
    avg_intake = round((total_feed_kg * 1000.0) / (estimated_live * max(1, len(logs))), 1) if logs else 0.0

    latest_weight = logs[0].avg_body_weight_grams if logs and logs[0].avg_body_weight_grams else None

    return DailyLogSummaryResponse(
        total_logs=len(logs),
        total_mortality=total_mortality,
        total_feed_consumed_kg=round(total_feed_kg, 2),
        total_feed_bags=round(total_feed_bags, 1),
        avg_daily_feed_per_bird_grams=avg_intake,
        latest_avg_weight_grams=latest_weight,
        logs=logs,
    )


@router.patch("/{log_id}", response_model=DailyLogResponse)
def update_daily_log(log_id: int, log_update: DailyLogUpdate, db: Session = Depends(get_db)):
    """Updates an existing daily log entry."""
    Base.metadata.create_all(bind=engine)

    log_entry = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Daily log with ID {log_id} not found.",
        )

    update_data = log_update.model_dump(exclude_unset=True)

    if "daily_feed_bags" in update_data:
        update_data["daily_feed_kg"] = round(update_data["daily_feed_bags"] * 50.0, 2)

    for key, value in update_data.items():
        setattr(log_entry, key, value)

    db.commit()
    db.refresh(log_entry)
    return log_entry


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_daily_log(log_id: int, db: Session = Depends(get_db)):
    """Deletes an erroneous daily log entry."""
    Base.metadata.create_all(bind=engine)

    log_entry = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Daily log with ID {log_id} not found.",
        )

    db.delete(log_entry)
    db.commit()
    return None
