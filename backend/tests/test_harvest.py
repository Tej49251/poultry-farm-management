"""
Unit tests for Bird Lifting Records and Grower Contract Settlement.
Verifies weighbridge calculations, remaining bird balances, and final GC payout vouchers.
"""

from datetime import date, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.farm import Farm, Shed, Batch
from app.models.records import BirdLifting, Settlement, DailyLog
from app.schemas.harvest import BirdLiftingCreate, SettlementCreate, SettlementStatusUpdate
from app.api.harvest import (
    record_bird_lifting_slip,
    get_lifting_progress,
    generate_batch_settlement,
    get_batch_settlement,
    update_settlement_status,
)
from fastapi import HTTPException


@pytest.fixture
def db_session():
    """In-memory SQLite database session."""
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    farm = Farm(name="Test Farm", owner_name="Tejas")
    db.add(farm)
    db.flush()

    shed = Shed(farm_id=farm.id, name="Shed 1", capacity=5000)
    db.add(shed)
    db.flush()

    batch = Batch(
        batch_code="BATCH-HARVEST-TEST",
        shed_id=shed.id,
        placement_date=date.today() - timedelta(days=36),
        initial_chicks=5000,
        status="Active",
        target_fcr=1.60,
    )
    db.add(batch)
    db.flush()

    # Seed daily logs with 100 mortality and 10,000 kg feed
    log = DailyLog(
        batch_id=batch.id,
        log_date=date.today() - timedelta(days=1),
        flock_age_days=35,
        daily_mortality=100,
        daily_feed_bags=200.0,
        daily_feed_kg=10000.0,
    )
    db.add(log)
    db.commit()

    yield db
    db.close()


def test_record_bird_lifting_slip_success(db_session):
    batch = db_session.query(Batch).first()
    slip_in = BirdLiftingCreate(
        batch_id=batch.id,
        slip_no="LIFT-TEST-001",
        lifting_date=date.today(),
        buyer_name="Venkateshwara Poultry Traders",
        vehicle_no="MH-12-BP-4890",
        cages_count=105,
        birds_count=2100,
        gross_weight_kg=5120.0,
        tare_weight_kg=900.0,
        transit_mortality_birds=2,
    )

    result = record_bird_lifting_slip(slip_in=slip_in, db=db_session)
    assert result.slip_no == "LIFT-TEST-001"
    assert result.net_weight_kg == 4220.0  # 5120 - 900 = 4,220 kg
    assert result.avg_weight_kg == 2.010  # 4220 / 2100 = 2.010 kg


def test_record_lifting_gross_less_than_tare_fails(db_session):
    batch = db_session.query(Batch).first()
    slip_in = BirdLiftingCreate(
        batch_id=batch.id,
        slip_no="INVALID-WEIGHT",
        lifting_date=date.today(),
        buyer_name="Trader",
        vehicle_no="MH-04-1234",
        cages_count=10,
        birds_count=200,
        gross_weight_kg=500.0,
        tare_weight_kg=800.0,  # Invalid: tare > gross
    )
    with pytest.raises(HTTPException) as exc:
        record_bird_lifting_slip(slip_in=slip_in, db=db_session)
    assert exc.value.status_code == 400
    assert "greater than tare" in exc.value.detail


def test_record_lifting_exceeding_live_flock_fails(db_session):
    batch = db_session.query(Batch).first()
    # Batch has 5,000 initial - 100 mortality = 4,900 live birds
    slip_in = BirdLiftingCreate(
        batch_id=batch.id,
        slip_no="TOO-MANY-BIRDS",
        lifting_date=date.today(),
        buyer_name="Trader",
        vehicle_no="MH-04-1234",
        cages_count=250,
        birds_count=5000,  # Only 4,900 live
        gross_weight_kg=12000.0,
        tare_weight_kg=2000.0,
    )
    with pytest.raises(HTTPException) as exc:
        record_bird_lifting_slip(slip_in=slip_in, db=db_session)
    assert exc.value.status_code == 400
    assert "Only 4900 live birds remain" in exc.value.detail


def test_get_lifting_progress(db_session):
    batch = db_session.query(Batch).first()
    record_bird_lifting_slip(
        BirdLiftingCreate(
            batch_id=batch.id,
            slip_no="LIFT-P1",
            lifting_date=date.today(),
            buyer_name="Buyer 1",
            vehicle_no="MH-12-1111",
            cages_count=100,
            birds_count=2000,
            gross_weight_kg=5000.0,
            tare_weight_kg=1000.0,
        ),
        db=db_session,
    )

    progress = get_lifting_progress(batch_id=batch.id, db=db_session)
    assert progress.total_placed_chicks == 5000
    assert progress.cumulative_mortality == 100
    assert progress.total_live_before_harvest == 4900
    assert progress.total_birds_lifted == 2000
    assert progress.remaining_birds_in_shed == 2900  # 4900 - 2000
    assert progress.total_net_weight_kg == 4000.0
    assert progress.overall_avg_weight_kg == 2.0


def test_generate_and_update_settlement(db_session):
    batch = db_session.query(Batch).first()
    # First record lifting of 2,000 birds at 4,000 kg
    record_bird_lifting_slip(
        BirdLiftingCreate(
            batch_id=batch.id,
            slip_no="LIFT-SETTLE",
            lifting_date=date.today(),
            buyer_name="Suguna Plant",
            vehicle_no="MH-12-7777",
            cages_count=100,
            birds_count=2000,
            gross_weight_kg=5000.0,
            tare_weight_kg=1000.0,
        ),
        db=db_session,
    )

    settle_in = SettlementCreate(
        batch_id=batch.id,
        voucher_no="VOUCHER-TEST-001",
        settlement_date=date.today(),
        base_gc_rate_per_kg=12.50,
        benchmark_fcr=1.60,
        other_incentives=1000.0,
        medicine_deduction=200.0,
    )

    settlement = generate_batch_settlement(settle_in=settle_in, db=db_session)
    assert settlement.voucher_no == "VOUCHER-TEST-001"
    # Base GC = 4000 kg * 12.50 = 50,000
    assert settlement.base_growing_charges == 50000.0
    assert settlement.other_incentives == 1000.0
    assert settlement.medicine_deduction == 200.0
    assert settlement.status == "Approved"
    assert settlement.net_payable_amount > 50000.0

    # Test update status to Paid
    updated = update_settlement_status(
        settlement_id=settlement.id,
        update_in=SettlementStatusUpdate(status="Paid"),
        db=db_session,
    )
    assert updated.status == "Paid"
