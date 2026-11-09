"""
Unit tests for Daily Flock Register.
Verifies daily mortality and feed logging, 50kg bag conversion, duplicate prevention, and summaries.
"""

from datetime import date, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.farm import Farm, Shed, Batch
from app.models.records import DailyLog
from app.schemas.daily_log import DailyLogCreate, DailyLogUpdate
from app.api.daily_logs import (
    create_daily_log,
    list_daily_logs,
    get_batch_logs_summary,
    update_daily_log,
    delete_daily_log,
)
from fastapi import HTTPException


@pytest.fixture
def db_session():
    """In-memory SQLite database session."""
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    # Seed farm, shed, batch
    farm = Farm(name="Test Farm", owner_name="Tejas", contact_phone="1234567890")
    db.add(farm)
    db.flush()

    shed = Shed(farm_id=farm.id, name="Shed 1", capacity=5000, status="Active")
    db.add(shed)
    db.flush()

    batch = Batch(
        batch_code="BATCH-TEST-DAILY",
        shed_id=shed.id,
        placement_date=date.today() - timedelta(days=10),
        initial_chicks=5000,
        status="Active",
    )
    db.add(batch)
    db.commit()

    yield db
    db.close()


def test_create_daily_log_success(db_session):
    batch = db_session.query(Batch).first()
    log_in = DailyLogCreate(
        batch_id=batch.id,
        log_date=date.today(),
        flock_age_days=11,
        daily_mortality=3,
        daily_feed_bags=8.5,
        avg_body_weight_grams=450.0,
        water_consumption_litres=1200.0,
        remarks="Litter dry, ventilation normal",
    )

    result = create_daily_log(log_in=log_in, db=db_session)
    assert result.daily_mortality == 3
    assert result.daily_feed_bags == 8.5
    assert result.daily_feed_kg == 425.0  # 8.5 * 50kg = 425kg


def test_create_daily_log_duplicate_date_fails(db_session):
    batch = db_session.query(Batch).first()
    today = date.today()

    log_in1 = DailyLogCreate(
        batch_id=batch.id,
        log_date=today,
        flock_age_days=11,
        daily_mortality=2,
        daily_feed_bags=8.0,
    )
    create_daily_log(log_in=log_in1, db=db_session)

    # Attempt second entry on the same date for the same batch
    log_in2 = DailyLogCreate(
        batch_id=batch.id,
        log_date=today,
        flock_age_days=11,
        daily_mortality=4,
        daily_feed_bags=9.0,
    )
    with pytest.raises(HTTPException) as exc:
        create_daily_log(log_in=log_in2, db=db_session)
    assert exc.value.status_code == 400
    assert "already exists" in exc.value.detail


def test_create_daily_log_invalid_batch_fails(db_session):
    log_in = DailyLogCreate(
        batch_id=9999,
        log_date=date.today(),
        flock_age_days=1,
        daily_mortality=0,
        daily_feed_bags=5.0,
    )
    with pytest.raises(HTTPException) as exc:
        create_daily_log(log_in=log_in, db=db_session)
    assert exc.value.status_code == 404


def test_daily_logs_summary(db_session):
    batch = db_session.query(Batch).first()
    # Add two daily logs
    create_daily_log(
        DailyLogCreate(
            batch_id=batch.id,
            log_date=date.today() - timedelta(days=1),
            flock_age_days=10,
            daily_mortality=4,
            daily_feed_bags=8.0,
            avg_body_weight_grams=410.0,
        ),
        db=db_session,
    )
    create_daily_log(
        DailyLogCreate(
            batch_id=batch.id,
            log_date=date.today(),
            flock_age_days=11,
            daily_mortality=2,
            daily_feed_bags=9.0,
            avg_body_weight_grams=455.0,
        ),
        db=db_session,
    )

    summary = get_batch_logs_summary(batch_id=batch.id, db=db_session)
    assert summary.total_logs == 2
    assert summary.total_mortality == 6
    assert summary.total_feed_bags == 17.0
    assert summary.total_feed_consumed_kg == 850.0  # 17 * 50 = 850kg
    assert summary.latest_avg_weight_grams == 455.0


def test_update_daily_log(db_session):
    batch = db_session.query(Batch).first()
    created = create_daily_log(
        DailyLogCreate(
            batch_id=batch.id,
            log_date=date.today(),
            flock_age_days=11,
            daily_mortality=2,
            daily_feed_bags=8.0,
        ),
        db=db_session,
    )

    update_in = DailyLogUpdate(daily_feed_bags=10.0, daily_mortality=3)
    updated = update_daily_log(log_id=created.id, log_update=update_in, db=db_session)

    assert updated.daily_feed_bags == 10.0
    assert updated.daily_feed_kg == 500.0  # automatically recomputed to 500kg
    assert updated.daily_mortality == 3


def test_delete_daily_log(db_session):
    batch = db_session.query(Batch).first()
    created = create_daily_log(
        DailyLogCreate(
            batch_id=batch.id,
            log_date=date.today(),
            flock_age_days=11,
            daily_mortality=1,
            daily_feed_bags=7.0,
        ),
        db=db_session,
    )

    delete_daily_log(log_id=created.id, db=db_session)
    logs = list_daily_logs(batch_id=batch.id, db=db_session)
    assert len(logs) == 0
