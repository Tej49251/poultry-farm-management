"""
REST API endpoints for Feed Management, Deliveries, and Stock Inventory.
"""

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.base import get_db, Base, engine
from app.models.records import FeedInventory, DailyLog
from app.schemas.feed import (
    FeedTransactionCreate,
    FeedTransactionResponse,
    FeedStockItem,
    FeedOverviewResponse,
)

router = APIRouter(prefix="/feed", tags=["Feed Management"])

FEED_METADATA = {
    "Pre-Starter": {
        "description": "High-protein starter crumbs (22-23% CP)",
        "target_age": "Day 1 to 10",
    },
    "Starter": {
        "description": "Growth & skeletal frame pellets (20-21% CP)",
        "target_age": "Day 11 to 20",
    },
    "Finisher": {
        "description": "High-energy finishing pellets (18-19% CP)",
        "target_age": "Day 21 to Harvest",
    },
}


@router.post("/transactions", response_model=FeedTransactionResponse, status_code=status.HTTP_201_CREATED)
def record_feed_transaction(transaction_in: FeedTransactionCreate, db: Session = Depends(get_db)):
    """
    Records an inward feed delivery, flock consumption, or stock adjustment.
    Calculates total kg automatically based on bag count.
    """
    Base.metadata.create_all(bind=engine)

    total_kg = round(transaction_in.bags_count * transaction_in.weight_kg_per_bag, 2)

    new_tx = FeedInventory(
        transaction_date=transaction_in.transaction_date,
        feed_type=transaction_in.feed_type,
        transaction_type=transaction_in.transaction_type,
        bags_count=transaction_in.bags_count,
        weight_kg_per_bag=transaction_in.weight_kg_per_bag,
        total_weight_kg=total_kg,
        supplier_name=transaction_in.supplier_name,
        supplier_invoice_no=transaction_in.supplier_invoice_no,
        cost_per_bag=transaction_in.cost_per_bag,
        batch_id=transaction_in.batch_id,
        remarks=transaction_in.remarks,
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    return new_tx


@router.get("/transactions", response_model=List[FeedTransactionResponse])
def list_feed_transactions(
    feed_type: Optional[str] = None,
    transaction_type: Optional[str] = None,
    batch_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Lists all feed inventory transactions with optional filtering."""
    Base.metadata.create_all(bind=engine)
    query = db.query(FeedInventory)

    if feed_type:
        query = query.filter(FeedInventory.feed_type == feed_type)
    if transaction_type:
        query = query.filter(FeedInventory.transaction_type == transaction_type)
    if batch_id:
        query = query.filter(FeedInventory.batch_id == batch_id)

    return query.order_by(FeedInventory.transaction_date.desc(), FeedInventory.id.desc()).all()


@router.get("/overview", response_model=FeedOverviewResponse)
def get_feed_overview(db: Session = Depends(get_db)):
    """
    Calculates live feed stock inventory across all 3 broiler stages:
    Pre-Starter, Starter, and Finisher.
    Provides low-stock reorder warnings and days of feed left.
    """
    Base.metadata.create_all(bind=engine)

    # Calculate average daily consumption across recent logs
    recent_logs = db.query(DailyLog).order_by(DailyLog.log_date.desc()).limit(7).all()
    if recent_logs:
        avg_daily_bags = sum(l.daily_feed_bags for l in recent_logs) / len(recent_logs)
    else:
        avg_daily_bags = 8.5  # standard commercial baseline for 5,000 birds at week 5

    stock_items: List[FeedStockItem] = []
    total_warehouse_bags = 0.0

    for f_type, meta in FEED_METADATA.items():
        inward_bags = (
            db.query(func.sum(FeedInventory.bags_count))
            .filter(FeedInventory.feed_type == f_type, FeedInventory.transaction_type == "Inward")
            .scalar()
            or 0.0
        )

        consumed_bags = (
            db.query(func.sum(FeedInventory.bags_count))
            .filter(FeedInventory.feed_type == f_type, FeedInventory.transaction_type == "Consumption")
            .scalar()
            or 0.0
        )

        adj_bags = (
            db.query(func.sum(FeedInventory.bags_count))
            .filter(FeedInventory.feed_type == f_type, FeedInventory.transaction_type == "Adjustment")
            .scalar()
            or 0.0
        )

        current_bags = max(0.0, round(inward_bags - consumed_bags + adj_bags, 1))
        current_kg = round(current_bags * 50.0, 2)
        total_warehouse_bags += current_bags

        # Determine stock status & estimated days left
        days_left = round(current_bags / avg_daily_bags, 1) if avg_daily_bags > 0 else 99.0
        if current_bags < 15:
            stock_status = "Critical"
        elif current_bags < 30:
            stock_status = "Low Stock"
        else:
            stock_status = "Adequate"

        stock_items.append(
            FeedStockItem(
                feed_type=f_type,
                stage_description=meta["description"],
                target_flock_age=meta["target_age"],
                inward_bags=round(inward_bags, 1),
                consumed_bags=round(consumed_bags, 1),
                current_stock_bags=current_bags,
                current_stock_kg=current_kg,
                stock_status=stock_status,
                estimated_days_left=days_left,
            )
        )

    total_warehouse_tonnes = round((total_warehouse_bags * 50.0) / 1000.0, 2)
    flock_days_left = round(total_warehouse_bags / avg_daily_bags, 1) if avg_daily_bags > 0 else 0.0

    recent_transactions = (
        db.query(FeedInventory)
        .order_by(FeedInventory.transaction_date.desc(), FeedInventory.id.desc())
        .limit(10)
        .all()
    )

    return FeedOverviewResponse(
        total_warehouse_bags=round(total_warehouse_bags, 1),
        total_warehouse_tonnes=total_warehouse_tonnes,
        estimated_flock_days_left=flock_days_left,
        stocks=stock_items,
        recent_transactions=recent_transactions,
    )
