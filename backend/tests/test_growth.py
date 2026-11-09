"""
Unit tests for Weight Tracking, Growth Curve, and FCR Analytics.
Verifies sample recording, breed standard targets, variance calculations, and ADG formulas.
"""

from datetime import date, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.farm import Farm, Shed, Batch
from app.models.records import WeightSample
from app.schemas.growth import WeightSampleCreate
from app.api.growth import record_weight_sample, get_growth_overview
from app.core.calculations import get_breed_standard_weight, calculate_adg


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
        batch_code="BATCH-GROWTH-TEST",
        shed_id=shed.id,
        placement_date=date.today() - timedelta(days=35),
        initial_chicks=5000,
        status="Active",
        target_fcr=1.60,
    )
    db.add(batch)
    db.commit()

    yield db
    db.close()


def test_breed_standard_interpolation():
    # Day 0 is 42g
    assert get_breed_standard_weight(0) == 42.0
    # Day 7 is 205g
    assert get_breed_standard_weight(7) == 205.0
    # Day 28 is 1590g
    assert get_breed_standard_weight(28) == 1590.0
    # Non-checkpoint Day 10 (between Day 7 at 205g and Day 14 at 510g):
    # (10-7)/(14-7) = 3/7 * 305 + 205 = 335.7g
    val = get_breed_standard_weight(10)
    assert 330.0 < val < 340.0


def test_calculate_adg():
    # Gained 600g over 10 days = 60.0 g/day
    adg = calculate_adg(prev_weight_grams=1000.0, current_weight_grams=1600.0, days_elapsed=10)
    assert adg == 60.0


def test_record_weight_sample(db_session):
    batch = db_session.query(Batch).first()
    sample_in = WeightSampleCreate(
        batch_id=batch.id,
        sample_date=date.today() - timedelta(days=7),
        flock_age_days=28,
        sample_birds_count=100,
        avg_weight_grams=1620.0,
        uniformity_pct=88.0,
        remarks="Excellent uniformity across all feed lines",
    )

    result = record_weight_sample(sample_in=sample_in, db=db_session)
    assert result.avg_weight_grams == 1620.0
    assert result.breed_standard_target_grams == 1590.0  # Day 28 standard
    assert result.variance_grams == 30.0  # +30g ahead of target
    assert result.uniformity_pct == 88.0


def test_growth_overview(db_session):
    batch = db_session.query(Batch).first()
    # Add two weekly samples
    record_weight_sample(
        WeightSampleCreate(
            batch_id=batch.id,
            sample_date=date.today() - timedelta(days=7),
            flock_age_days=28,
            sample_birds_count=100,
            avg_weight_grams=1580.0,
        ),
        db=db_session,
    )
    record_weight_sample(
        WeightSampleCreate(
            batch_id=batch.id,
            sample_date=date.today(),
            flock_age_days=35,
            sample_birds_count=100,
            avg_weight_grams=2270.0,
        ),
        db=db_session,
    )

    overview = get_growth_overview(batch_id=batch.id, db=db_session)
    assert overview.current_avg_weight_grams == 2270.0
    assert overview.current_avg_weight_kg == 2.270
    # ADG between day 28 and 35 (7 days): (2270 - 1580) / 7 = 690 / 7 = 98.6 g/day
    assert overview.adg_grams_per_day == 98.6
    # Day 35 standard target is 2240 -> variance is +30g
    assert overview.variance_from_standard_grams == 30.0
    assert len(overview.growth_curve) == 7  # 7 checkpoints
    assert len(overview.samples) == 2
