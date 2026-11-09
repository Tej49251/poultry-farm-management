"""
Unit tests for Feed Management and Stock Inventory.
Verifies inward deliveries, consumption tracking, live warehouse stock, and low-stock warnings.
"""

from datetime import date
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.records import FeedInventory
from app.schemas.feed import FeedTransactionCreate
from app.api.feed import record_feed_transaction, list_feed_transactions, get_feed_overview


@pytest.fixture
def db_session():
    """In-memory SQLite database session."""
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()
    yield db
    db.close()


def test_record_inward_delivery(db_session):
    tx_in = FeedTransactionCreate(
        transaction_date=date.today(),
        feed_type="Starter",
        transaction_type="Inward",
        bags_count=100.0,
        weight_kg_per_bag=50.0,
        supplier_name="Godrej Agrovet Feed Mill",
        supplier_invoice_no="INV-2026-901",
        cost_per_bag=2150.0,
        remarks="Batch lot #88A delivery received in good condition",
    )

    result = record_feed_transaction(transaction_in=tx_in, db=db_session)
    assert result.bags_count == 100.0
    assert result.total_weight_kg == 5000.0  # 100 * 50 = 5,000 kg
    assert result.supplier_name == "Godrej Agrovet Feed Mill"


def test_feed_stock_summary_calculation(db_session):
    # 1. Pre-Starter: 40 inward, 25 consumed -> 15 bags left
    record_feed_transaction(
        FeedTransactionCreate(
            transaction_date=date.today(),
            feed_type="Pre-Starter",
            transaction_type="Inward",
            bags_count=40.0,
        ),
        db=db_session,
    )
    record_feed_transaction(
        FeedTransactionCreate(
            transaction_date=date.today(),
            feed_type="Pre-Starter",
            transaction_type="Consumption",
            bags_count=25.0,
        ),
        db=db_session,
    )

    # 2. Starter: 80 inward -> 80 bags left
    record_feed_transaction(
        FeedTransactionCreate(
            transaction_date=date.today(),
            feed_type="Starter",
            transaction_type="Inward",
            bags_count=80.0,
        ),
        db=db_session,
    )

    # 3. Finisher: 10 inward -> 10 bags left (Critical low stock)
    record_feed_transaction(
        FeedTransactionCreate(
            transaction_date=date.today(),
            feed_type="Finisher",
            transaction_type="Inward",
            bags_count=10.0,
        ),
        db=db_session,
    )

    overview = get_feed_overview(db=db_session)

    # Total warehouse bags = 15 + 80 + 10 = 105 bags
    assert overview.total_warehouse_bags == 105.0
    assert overview.total_warehouse_tonnes == 5.25  # 105 * 50 / 1000 = 5.25 tonnes

    pre_starter = next(s for s in overview.stocks if s.feed_type == "Pre-Starter")
    assert pre_starter.current_stock_bags == 15.0
    assert pre_starter.stock_status == "Low Stock"

    starter = next(s for s in overview.stocks if s.feed_type == "Starter")
    assert starter.current_stock_bags == 80.0
    assert starter.stock_status == "Adequate"

    finisher = next(s for s in overview.stocks if s.feed_type == "Finisher")
    assert finisher.current_stock_bags == 10.0
    assert finisher.stock_status == "Critical"


def test_list_transactions_with_filter(db_session):
    record_feed_transaction(
        FeedTransactionCreate(
            transaction_date=date.today(),
            feed_type="Pre-Starter",
            transaction_type="Inward",
            bags_count=50.0,
        ),
        db=db_session,
    )
    record_feed_transaction(
        FeedTransactionCreate(
            transaction_date=date.today(),
            feed_type="Starter",
            transaction_type="Inward",
            bags_count=60.0,
        ),
        db=db_session,
    )

    starter_txs = list_feed_transactions(feed_type="Starter", db=db_session)
    assert len(starter_txs) == 1
    assert starter_txs[0].feed_type == "Starter"
