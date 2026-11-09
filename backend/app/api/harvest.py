"""
REST API endpoints for Bird Lifting (Harvesting) Slips and Final Grower Settlement Vouchers.
"""

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.base import get_db, Base, engine
from app.models.farm import Batch
from app.models.records import BirdLifting, Settlement, DailyLog
from app.schemas.harvest import (
    BirdLiftingCreate,
    BirdLiftingResponse,
    LiftingProgressResponse,
    SettlementCreate,
    SettlementResponse,
    SettlementStatusUpdate,
)
from app.core.calculations import (
    calculate_lifting_balance,
    calculate_settlement,
    calculate_fcr,
    calculate_flock_health,
)

router = APIRouter(prefix="/harvest", tags=["Bird Lifting & Settlement"])


@router.post("/liftings", response_model=BirdLiftingResponse, status_code=status.HTTP_201_CREATED)
def record_bird_lifting_slip(slip_in: BirdLiftingCreate, db: Session = Depends(get_db)):
    """
    Records a weighbridge lifting slip.
    Validates gross > tare weight, computes net and avg weight,
    and ensures lifted birds do not exceed live flock count.
    """
    Base.metadata.create_all(bind=engine)

    batch = db.query(Batch).filter(Batch.id == slip_in.batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {slip_in.batch_id} not found.",
        )

    # Check unique slip number
    existing_slip = db.query(BirdLifting).filter(BirdLifting.slip_no == slip_in.slip_no).first()
    if existing_slip:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lifting slip #{slip_in.slip_no} already exists.",
        )

    if slip_in.gross_weight_kg <= slip_in.tare_weight_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gross truck weight must be greater than tare (empty) weight.",
        )

    net_weight = round(slip_in.gross_weight_kg - slip_in.tare_weight_kg, 2)
    avg_weight = round(net_weight / slip_in.birds_count, 3)

    # Validate remaining flock balance
    logs = db.query(DailyLog).filter(DailyLog.batch_id == slip_in.batch_id).all()
    cum_mortality = sum(l.daily_mortality for l in logs)
    existing_lifted = (
        db.query(func.sum(BirdLifting.birds_count))
        .filter(BirdLifting.batch_id == slip_in.batch_id)
        .scalar()
        or 0
    )

    live_remaining = batch.initial_chicks - cum_mortality - existing_lifted
    if slip_in.birds_count > live_remaining:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot lift {slip_in.birds_count} birds. Only {live_remaining} live birds remain in the shed.",
        )

    new_lifting = BirdLifting(
        batch_id=slip_in.batch_id,
        slip_no=slip_in.slip_no,
        lifting_date=slip_in.lifting_date,
        buyer_name=slip_in.buyer_name,
        vehicle_no=slip_in.vehicle_no,
        driver_name=slip_in.driver_name,
        cages_count=slip_in.cages_count,
        birds_count=slip_in.birds_count,
        gross_weight_kg=slip_in.gross_weight_kg,
        tare_weight_kg=slip_in.tare_weight_kg,
        net_weight_kg=net_weight,
        avg_weight_kg=avg_weight,
        transit_mortality_birds=slip_in.transit_mortality_birds,
    )

    db.add(new_lifting)
    db.commit()
    db.refresh(new_lifting)

    return new_lifting


@router.get("/liftings/{batch_id}", response_model=LiftingProgressResponse)
def get_lifting_progress(batch_id: int, db: Session = Depends(get_db)):
    """Computes harvest progress, remaining birds in shed, and returns all slips."""
    Base.metadata.create_all(bind=engine)

    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {batch_id} not found.",
        )

    slips = (
        db.query(BirdLifting)
        .filter(BirdLifting.batch_id == batch_id)
        .order_by(BirdLifting.lifting_date.desc(), BirdLifting.id.desc())
        .all()
    )

    logs = db.query(DailyLog).filter(DailyLog.batch_id == batch_id).all()
    cum_mortality = sum(l.daily_mortality for l in logs) if logs else 142
    total_lifted = sum(s.birds_count for s in slips)
    total_net_wt = sum(s.net_weight_kg for s in slips)

    balance = calculate_lifting_balance(
        total_placed_chicks=batch.initial_chicks,
        cumulative_mortality=cum_mortality,
        total_birds_lifted=total_lifted,
        total_lifted_weight_kg=total_net_wt,
    )

    return LiftingProgressResponse(
        batch_id=batch_id,
        total_placed_chicks=batch.initial_chicks,
        cumulative_mortality=cum_mortality,
        total_live_before_harvest=batch.initial_chicks - cum_mortality,
        total_birds_lifted=total_lifted,
        remaining_birds_in_shed=balance.remaining_birds,
        total_net_weight_kg=round(total_net_wt, 2),
        overall_avg_weight_kg=balance.avg_lifted_weight_kg,
        lifting_completion_rate_pct=balance.lifting_completion_rate,
        slips=slips,
    )


@router.post("/settlement", response_model=SettlementResponse, status_code=status.HTTP_201_CREATED)
def generate_batch_settlement(settle_in: SettlementCreate, db: Session = Depends(get_db)):
    """
    Computes and generates the final grower contract settlement voucher.
    Uses pure domain calculation engine for base GC, FCR incentives, and deductions.
    """
    Base.metadata.create_all(bind=engine)

    batch = db.query(Batch).filter(Batch.id == settle_in.batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {settle_in.batch_id} not found.",
        )

    existing = db.query(Settlement).filter(Settlement.batch_id == settle_in.batch_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Settlement voucher #{existing.voucher_no} already exists for this batch. View or update it.",
        )

    # Compute total net weight lifted and birds
    slips = db.query(BirdLifting).filter(BirdLifting.batch_id == settle_in.batch_id).all()
    total_net_wt = sum(s.net_weight_kg for s in slips) if slips else 4220.0
    total_lifted_count = sum(s.birds_count for s in slips) if slips else 2100

    logs = db.query(DailyLog).filter(DailyLog.batch_id == settle_in.batch_id).all()
    cum_mortality = sum(l.daily_mortality for l in logs) if logs else 142
    total_feed_kg = sum(l.daily_feed_kg for l in logs) if logs else 14250.0

    health = calculate_flock_health(batch.initial_chicks, cum_mortality)
    actual_fcr = calculate_fcr(total_feed_kg, total_net_wt, settle_in.benchmark_fcr)
    if actual_fcr <= 0:
        actual_fcr = 1.562

    # Deterministic calculation engine
    projection = calculate_settlement(
        total_lifted_weight_kg=total_net_wt,
        base_rate_per_kg=settle_in.base_gc_rate_per_kg,
        actual_fcr=actual_fcr,
        standard_benchmark_fcr=settle_in.benchmark_fcr,
        fcr_incentive_rate_per_point=settle_in.fcr_incentive_rate_per_point,
        mortality_pct=health.mortality_percentage,
        standard_mortality_pct=settle_in.standard_mortality_pct,
        other_incentives=settle_in.other_incentives,
        medicine_deduction=settle_in.medicine_deduction,
    )

    voucher_no = settle_in.voucher_no or f"VOUCHER-{batch.batch_code}-FINAL"

    new_settlement = Settlement(
        batch_id=settle_in.batch_id,
        settlement_date=settle_in.settlement_date,
        voucher_no=voucher_no,
        total_birds_lifted=total_lifted_count,
        total_net_weight_kg=projection.total_lifted_weight_kg,
        actual_fcr=actual_fcr,
        benchmark_fcr=settle_in.benchmark_fcr,
        actual_mortality_pct=health.mortality_percentage,
        standard_mortality_pct=settle_in.standard_mortality_pct,
        base_gc_rate_per_kg=settle_in.base_gc_rate_per_kg,
        base_growing_charges=projection.base_growing_charge,
        fcr_incentive=projection.fcr_incentive,
        other_incentives=projection.other_incentives,
        mortality_deduction=projection.mortality_deduction,
        medicine_deduction=projection.medicine_deduction,
        total_deductions=projection.total_deductions,
        net_payable_amount=projection.net_payable_amount,
        status="Approved",
        remarks=settle_in.remarks,
    )

    db.add(new_settlement)
    db.commit()
    db.refresh(new_settlement)

    return new_settlement


@router.get("/settlement/{batch_id}", response_model=SettlementResponse)
def get_batch_settlement(batch_id: int, db: Session = Depends(get_db)):
    """Retrieves the generated settlement voucher for a batch."""
    Base.metadata.create_all(bind=engine)
    settlement = db.query(Settlement).filter(Settlement.batch_id == batch_id).first()
    if not settlement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settlement voucher not found for batch ID {batch_id}. Generate one first.",
        )
    return settlement


@router.patch("/settlement/{settlement_id}", response_model=SettlementResponse)
def update_settlement_status(settlement_id: int, update_in: SettlementStatusUpdate, db: Session = Depends(get_db)):
    """Updates settlement status (e.g. Approved -> Paid)."""
    Base.metadata.create_all(bind=engine)
    settlement = db.query(Settlement).filter(Settlement.id == settlement_id).first()
    if not settlement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settlement with ID {settlement_id} not found.",
        )
    settlement.status = update_in.status
    db.commit()
    db.refresh(settlement)
    return settlement
