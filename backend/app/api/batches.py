"""
REST API endpoints for Batch Management and Shed Administration.
"""

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.models.base import get_db, Base, engine
from app.models.farm import Farm, Shed, Batch
from app.schemas.batch import (
    BatchCreate,
    BatchUpdate,
    BatchResponse,
    BatchDetailResponse,
    ShedCreate,
    ShedResponse,
)
from app.core.calculations import calculate_flock_health

router = APIRouter(tags=["Batch Management"])


def ensure_db_initialized(db: Session):
    """Initializes tables and default demo farm & sheds if not present."""
    Base.metadata.create_all(bind=engine)
    if not db.query(Farm).first():
        farm = Farm(
            name="Green Valley Broiler Farm",
            location="Nashik, Maharashtra",
            owner_name="Tejas D.",
            contact_phone="+91-9876543210",
        )
        db.add(farm)
        db.flush()

        shed1 = Shed(farm_id=farm.id, name="Shed 1 — North Commercial", capacity=5000, status="Active")
        shed2 = Shed(farm_id=farm.id, name="Shed 2 — South Broiler Unit", capacity=6000, status="Active")
        shed3 = Shed(farm_id=farm.id, name="Shed 3 — East Environmentally Controlled", capacity=8000, status="Sanitizing")
        db.add_all([shed1, shed2, shed3])
        db.commit()


@router.get("/sheds", response_model=List[ShedResponse])
def list_sheds(db: Session = Depends(get_db)):
    """Lists all sheds on the farm."""
    ensure_db_initialized(db)
    return db.query(Shed).all()


@router.post("/sheds", response_model=ShedResponse, status_code=status.HTTP_201_CREATED)
def create_shed(shed_in: ShedCreate, db: Session = Depends(get_db)):
    """Registers a new poultry shed."""
    ensure_db_initialized(db)
    shed = Shed(
        farm_id=shed_in.farm_id,
        name=shed_in.name,
        capacity=shed_in.capacity,
        dimensions_feet=shed_in.dimensions_feet,
        status=shed_in.status,
    )
    db.add(shed)
    db.commit()
    db.refresh(shed)
    return shed


@router.get("/batches", response_model=List[BatchResponse])
def list_batches(
    status_filter: Optional[str] = Query(None, alias="status"),
    shed_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    Lists batches with optional filtering by status (Active, Completed, Settled) or shed.
    Computes real-time flock age.
    """
    ensure_db_initialized(db)
    query = db.query(Batch)
    if status_filter:
        query = query.filter(Batch.status == status_filter)
    if shed_id:
        query = query.filter(Batch.shed_id == shed_id)

    batches = query.order_by(Batch.placement_date.desc()).all()
    today = date.today()

    response = []
    for b in batches:
        # Compute flock age in days
        if b.status == "Active":
            age = max(1, (today - b.placement_date).days + 1)
        elif b.closed_date:
            age = max(1, (b.closed_date - b.placement_date).days)
        else:
            age = b.target_harvest_age_days

        batch_dict = {
            "id": b.id,
            "batch_code": b.batch_code,
            "shed_id": b.shed_id,
            "breed": b.breed,
            "placement_date": b.placement_date,
            "initial_chicks": b.initial_chicks,
            "chick_supplier": b.chick_supplier,
            "chick_cost_per_bird": b.chick_cost_per_bird,
            "target_fcr": b.target_fcr,
            "standard_mortality_pct": b.standard_mortality_pct,
            "target_harvest_age_days": b.target_harvest_age_days,
            "status": b.status,
            "closed_date": b.closed_date,
            "remarks": b.remarks,
            "created_at": b.created_at,
            "flock_age_days": age,
        }
        response.append(BatchResponse(**batch_dict))

    return response


@router.post("/batches", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(batch_in: BatchCreate, db: Session = Depends(get_db)):
    """
    Registers a new chick placement batch.
    Validates shed availability and marks shed status as Active.
    """
    ensure_db_initialized(db)

    # Validate shed exists
    shed = db.query(Shed).filter(Shed.id == batch_in.shed_id).first()
    if not shed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shed with ID {batch_in.shed_id} does not exist.",
        )

    # Check for duplicate batch code
    existing_code = db.query(Batch).filter(Batch.batch_code == batch_in.batch_code).first()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch with code '{batch_in.batch_code}' already exists.",
        )

    # Check if shed already has an active batch
    active_in_shed = (
        db.query(Batch)
        .filter(Batch.shed_id == batch_in.shed_id, Batch.status == "Active")
        .first()
    )
    if active_in_shed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Shed '{shed.name}' already has an active flock ({active_in_shed.batch_code}). Complete or close it first.",
        )

    # Create batch
    new_batch = Batch(
        batch_code=batch_in.batch_code,
        shed_id=batch_in.shed_id,
        breed=batch_in.breed,
        placement_date=batch_in.placement_date,
        initial_chicks=batch_in.initial_chicks,
        chick_supplier=batch_in.chick_supplier,
        chick_cost_per_bird=batch_in.chick_cost_per_bird,
        target_fcr=batch_in.target_fcr,
        standard_mortality_pct=batch_in.standard_mortality_pct,
        target_harvest_age_days=batch_in.target_harvest_age_days,
        status="Active",
        remarks=batch_in.remarks,
    )
    db.add(new_batch)

    # Mark shed active
    shed.status = "Active"

    db.commit()
    db.refresh(new_batch)

    age = max(1, (date.today() - new_batch.placement_date).days + 1)
    batch_dict = {
        "id": new_batch.id,
        "batch_code": new_batch.batch_code,
        "shed_id": new_batch.shed_id,
        "breed": new_batch.breed,
        "placement_date": new_batch.placement_date,
        "initial_chicks": new_batch.initial_chicks,
        "chick_supplier": new_batch.chick_supplier,
        "chick_cost_per_bird": new_batch.chick_cost_per_bird,
        "target_fcr": new_batch.target_fcr,
        "standard_mortality_pct": new_batch.standard_mortality_pct,
        "target_harvest_age_days": new_batch.target_harvest_age_days,
        "status": new_batch.status,
        "closed_date": new_batch.closed_date,
        "remarks": new_batch.remarks,
        "created_at": new_batch.created_at,
        "flock_age_days": age,
    }
    return BatchResponse(**batch_dict)


@router.get("/batches/{batch_id}", response_model=BatchDetailResponse)
def get_batch_detail(batch_id: int, db: Session = Depends(get_db)):
    """Retrieves full batch details and computed performance metrics."""
    ensure_db_initialized(db)
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {batch_id} not found.",
        )

    today = date.today()
    if batch.status == "Active":
        age = max(1, (today - batch.placement_date).days + 1)
    elif batch.closed_date:
        age = max(1, (batch.closed_date - batch.placement_date).days)
    else:
        age = batch.target_harvest_age_days

    # Initial mock mortality for new batch if no daily logs yet
    health = calculate_flock_health(batch.initial_chicks, cumulative_mortality=0)

    shed = db.query(Shed).filter(Shed.id == batch.shed_id).first()

    return BatchDetailResponse(
        id=batch.id,
        batch_code=batch.batch_code,
        shed_id=batch.shed_id,
        shed_name=shed.name if shed else None,
        breed=batch.breed,
        placement_date=batch.placement_date,
        initial_chicks=batch.initial_chicks,
        chick_supplier=batch.chick_supplier,
        chick_cost_per_bird=batch.chick_cost_per_bird,
        target_fcr=batch.target_fcr,
        standard_mortality_pct=batch.standard_mortality_pct,
        target_harvest_age_days=batch.target_harvest_age_days,
        status=batch.status,
        closed_date=batch.closed_date,
        remarks=batch.remarks,
        created_at=batch.created_at,
        flock_age_days=age,
        cumulative_mortality=health.cumulative_mortality,
        estimated_live_birds=health.estimated_live_birds,
        mortality_percentage=health.mortality_percentage,
        livability_percentage=health.livability_percentage,
    )


@router.patch("/batches/{batch_id}", response_model=BatchResponse)
def update_batch(batch_id: int, batch_update: BatchUpdate, db: Session = Depends(get_db)):
    """
    Updates batch configuration or closes the batch.
    When a batch is marked 'Completed' or 'Settled', the associated shed is set to 'Sanitizing'.
    """
    ensure_db_initialized(db)
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch with ID {batch_id} not found.",
        )

    update_data = batch_update.model_dump(exclude_unset=True)

    # Check if batch status is transitioning to Completed/Settled
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status in ["Completed", "Settled"]:
            if not update_data.get("closed_date"):
                batch.closed_date = date.today()
            # Free up the shed for sanitization
            shed = db.query(Shed).filter(Shed.id == batch.shed_id).first()
            if shed:
                shed.status = "Sanitizing"

    for key, value in update_data.items():
        setattr(batch, key, value)

    db.commit()
    db.refresh(batch)

    age = max(1, (date.today() - batch.placement_date).days + 1)
    batch_dict = {
        "id": batch.id,
        "batch_code": batch.batch_code,
        "shed_id": batch.shed_id,
        "breed": batch.breed,
        "placement_date": batch.placement_date,
        "initial_chicks": batch.initial_chicks,
        "chick_supplier": batch.chick_supplier,
        "chick_cost_per_bird": batch.chick_cost_per_bird,
        "target_fcr": batch.target_fcr,
        "standard_mortality_pct": batch.standard_mortality_pct,
        "target_harvest_age_days": batch.target_harvest_age_days,
        "status": batch.status,
        "closed_date": batch.closed_date,
        "remarks": batch.remarks,
        "created_at": batch.created_at,
        "flock_age_days": age,
    }
    return BatchResponse(**batch_dict)

