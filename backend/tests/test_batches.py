"""
Comprehensive unit tests for Batch Management and Shed Administration.
Tests CRUD operations, validations, business rules, and status lifecycle transitions.
"""

from datetime import date, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.farm import Farm, Shed, Batch
from app.schemas.batch import BatchCreate, BatchUpdate
from app.api.batches import (
    list_sheds,
    create_batch,
    list_batches,
    get_batch_detail,
    update_batch,
)
from fastapi import HTTPException


@pytest.fixture
def db_session():
    """In-memory SQLite database session for isolated testing."""
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    # Seed farm and sheds
    farm = Farm(name="Test Farm", owner_name="Tejas", contact_phone="1234567890")
    db.add(farm)
    db.flush()

    s1 = Shed(farm_id=farm.id, name="Shed 1", capacity=5000, status="Empty")
    s2 = Shed(farm_id=farm.id, name="Shed 2", capacity=6000, status="Empty")
    db.add_all([s1, s2])
    db.commit()

    yield db
    db.close()


def test_list_sheds(db_session):
    sheds = list_sheds(db=db_session)
    assert len(sheds) == 2
    assert sheds[0].name == "Shed 1"
    assert sheds[0].status == "Empty"


def test_create_batch_success(db_session):
    batch_in = BatchCreate(
        batch_code="BATCH-2026-TEST-1",
        shed_id=1,
        breed="Cobb 500",
        placement_date=date.today() - timedelta(days=5),
        initial_chicks=5000,
        chick_supplier="Venkateshwara Hatcheries",
        chick_cost_per_bird=38.5,
        target_fcr=1.60,
        standard_mortality_pct=5.0,
        target_harvest_age_days=40,
        remarks="Test initial placement",
    )

    result = create_batch(batch_in=batch_in, db=db_session)
    assert result.batch_code == "BATCH-2026-TEST-1"
    assert result.status == "Active"
    assert result.flock_age_days == 6  # 5 days ago + 1 = day 6

    # Verify shed status transitioned to Active
    shed = db_session.query(Shed).filter(Shed.id == 1).first()
    assert shed.status == "Active"


def test_create_batch_duplicate_code_fails(db_session):
    batch_in1 = BatchCreate(
        batch_code="DUP-BATCH",
        shed_id=1,
        placement_date=date.today(),
        initial_chicks=4000,
    )
    create_batch(batch_in=batch_in1, db=db_session)

    # Attempt second batch with identical code in shed 2
    batch_in2 = BatchCreate(
        batch_code="DUP-BATCH",
        shed_id=2,
        placement_date=date.today(),
        initial_chicks=4000,
    )
    with pytest.raises(HTTPException) as exc_info:
        create_batch(batch_in=batch_in2, db=db_session)
    assert exc_info.value.status_code == 400
    assert "already exists" in exc_info.value.detail


def test_create_batch_nonexistent_shed_fails(db_session):
    batch_in = BatchCreate(
        batch_code="INVALID-SHED",
        shed_id=999,
        placement_date=date.today(),
        initial_chicks=5000,
    )
    with pytest.raises(HTTPException) as exc_info:
        create_batch(batch_in=batch_in, db=db_session)
    assert exc_info.value.status_code == 404


def test_create_batch_conflict_active_shed_fails(db_session):
    batch_in1 = BatchCreate(
        batch_code="FIRST-BATCH",
        shed_id=1,
        placement_date=date.today(),
        initial_chicks=5000,
    )
    create_batch(batch_in=batch_in1, db=db_session)

    # Try placing another active batch in Shed 1 before closing the first
    batch_in2 = BatchCreate(
        batch_code="SECOND-BATCH",
        shed_id=1,
        placement_date=date.today(),
        initial_chicks=5000,
    )
    with pytest.raises(HTTPException) as exc_info:
        create_batch(batch_in=batch_in2, db=db_session)
    assert exc_info.value.status_code == 400
    assert "already has an active flock" in exc_info.value.detail


def test_get_batch_detail(db_session):
    batch_in = BatchCreate(
        batch_code="DETAIL-TEST",
        shed_id=2,
        placement_date=date.today(),
        initial_chicks=6000,
        breed="Ross 308",
    )
    created = create_batch(batch_in=batch_in, db=db_session)

    detail = get_batch_detail(batch_id=created.id, db=db_session)
    assert detail.batch_code == "DETAIL-TEST"
    assert detail.shed_name == "Shed 2"
    assert detail.estimated_live_birds == 6000
    assert detail.livability_percentage == 100.0


def test_update_and_close_batch(db_session):
    batch_in = BatchCreate(
        batch_code="CLOSE-TEST",
        shed_id=1,
        placement_date=date.today() - timedelta(days=40),
        initial_chicks=5000,
    )
    created = create_batch(batch_in=batch_in, db=db_session)

    # Close batch
    update_in = BatchUpdate(status="Completed")
    updated = update_batch(batch_id=created.id, batch_update=update_in, db=db_session)

    assert updated.status == "Completed"
    assert updated.closed_date == date.today()

    # Verify shed is now set to Sanitizing
    shed = db_session.query(Shed).filter(Shed.id == 1).first()
    assert shed.status == "Sanitizing"


def test_list_batches_with_filter(db_session):
    b1 = BatchCreate(batch_code="B-ACTIVE", shed_id=1, placement_date=date.today(), initial_chicks=5000)
    b2 = BatchCreate(batch_code="B-CLOSE", shed_id=2, placement_date=date.today(), initial_chicks=6000)
    created1 = create_batch(batch_in=b1, db=db_session)
    created2 = create_batch(batch_in=b2, db=db_session)

    update_batch(batch_id=created2.id, batch_update=BatchUpdate(status="Completed"), db=db_session)

    active_batches = list_batches(status_filter="Active", db=db_session)
    assert len(active_batches) == 1
    assert active_batches[0].batch_code == "B-ACTIVE"

    completed_batches = list_batches(status_filter="Completed", db=db_session)
    assert len(completed_batches) == 1
    assert completed_batches[0].batch_code == "B-CLOSE"
