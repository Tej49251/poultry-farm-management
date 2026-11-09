"""
Dashboard API endpoints for executive summary, batch health, and shed overviews.
"""

from datetime import date, datetime, timedelta
from fastapi import APIRouter
from app.schemas.dashboard import (
    DashboardOverviewResponse,
    ActiveBatchMetrics,
    ShedSummary,
    DailyLogEntry,
    BirdLiftingEntry,
)
from app.core.calculations import (
    calculate_flock_health,
    calculate_flock_performance,
    calculate_lifting_balance,
    calculate_settlement,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview():
    """
    Returns the comprehensive dashboard overview:
    - Active batch metrics (live birds, mortality, feed, FCR, EPEF, remaining birds, growing charges)
    - Multi-shed status cards
    - Recent daily logs
    - Lifting slips
    Clearly marks whether initial data is demonstration data.
    """
    # Baseline Demonstration Farm Data (clearly marked is_demo = True)
    initial_chicks = 5000
    cumulative_mortality = 142
    total_feed_consumed_kg = 14250.0  # ~285 bags of 50kg
    avg_body_weight_kg = 1.980
    flock_age_days = 36
    placement_date = date.today() - timedelta(days=flock_age_days)
    total_birds_lifted = 2100
    total_lifted_weight_kg = 4220.0

    # Execute deterministic business calculation engine
    health = calculate_flock_health(initial_chicks, cumulative_mortality)
    perf = calculate_flock_performance(
        total_feed_consumed_kg=total_feed_consumed_kg,
        estimated_live_birds=health.estimated_live_birds,
        avg_body_weight_kg=avg_body_weight_kg,
        flock_age_days=flock_age_days,
        livability_percentage=health.livability_percentage,
        standard_benchmark_fcr=1.60,
    )
    lifting = calculate_lifting_balance(
        total_placed_chicks=initial_chicks,
        cumulative_mortality=cumulative_mortality,
        total_birds_lifted=total_birds_lifted,
        total_lifted_weight_kg=total_lifted_weight_kg,
    )
    settlement = calculate_settlement(
        total_lifted_weight_kg=total_lifted_weight_kg,
        base_rate_per_kg=12.50,
        actual_fcr=perf.fcr,
        standard_benchmark_fcr=1.60,
        fcr_incentive_rate_per_point=0.50,
        mortality_pct=health.mortality_percentage,
        other_incentives=1200.0,
        medicine_deduction=350.0,
    )

    active_batch = ActiveBatchMetrics(
        batch_id=101,
        batch_code="BATCH-2026-03-A",
        shed_id=1,
        shed_name="Shed 1 — North Commercial",
        placement_date=placement_date,
        flock_age_days=flock_age_days,
        breed="Cobb 500",
        initial_chicks=initial_chicks,
        cumulative_mortality=cumulative_mortality,
        mortality_percentage=health.mortality_percentage,
        livability_percentage=health.livability_percentage,
        estimated_live_birds=health.estimated_live_birds,
        total_feed_consumed_kg=total_feed_consumed_kg,
        feed_intake_per_bird_grams=145.0,
        avg_body_weight_kg=avg_body_weight_kg,
        current_fcr=perf.fcr,
        is_fcr_favorable=perf.is_fcr_favorable,
        epef=perf.epef,
        total_birds_lifted=total_birds_lifted,
        remaining_birds=lifting.remaining_birds,
        estimated_growing_charges=settlement.net_payable_amount,
        settlement_status="In Progress",
        is_demo=True,
    )

    sheds = [
        ShedSummary(
            id=1,
            name="Shed 1 — North Commercial",
            capacity=5000,
            status="Active",
            active_batch_code="BATCH-2026-03-A",
            flock_age_days=flock_age_days,
            live_birds=health.estimated_live_birds - total_birds_lifted,
            mortality_rate=health.mortality_percentage,
            fcr=perf.fcr,
        ),
        ShedSummary(
            id=2,
            name="Shed 2 — South Broiler Unit",
            capacity=6000,
            status="Active",
            active_batch_code="BATCH-2026-03-B",
            flock_age_days=18,
            live_birds=5880,
            mortality_rate=2.0,
            fcr=1.38,
        ),
        ShedSummary(
            id=3,
            name="Shed 3 — East Environmentally Controlled",
            capacity=8000,
            status="Sanitizing",
            active_batch_code=None,
            flock_age_days=None,
            live_birds=None,
            mortality_rate=None,
            fcr=None,
        ),
    ]

    recent_logs = [
        DailyLogEntry(
            log_date=date.today() - timedelta(days=i),
            flock_age_days=flock_age_days - i,
            daily_mortality=3 if i != 2 else 5,
            daily_feed_bags=8.5,
            daily_feed_kg=425.0,
            avg_body_weight_grams=1980 - (i * 65),
            water_consumption_litres=1280.0,
            medicine_administered="Electrolytes & Vitamin C" if i == 1 else "None",
            remarks="Litter dry, ventilation normal" if i != 0 else "First lifting partial batch completed",
        )
        for i in range(5)
    ]

    lifting_records = [
        BirdLiftingEntry(
            slip_no="LIFT-2026-001",
            lifting_date=date.today(),
            buyer_name="Venkateshwara Poultry Traders",
            vehicle_no="MH-12-BP-4890",
            cages_count=105,
            birds_count=2100,
            gross_weight_kg=5120.0,
            tare_weight_kg=900.0,
            net_weight_kg=4220.0,
            avg_weight_kg=2.01,
        )
    ]

    return DashboardOverviewResponse(
        generated_at=datetime.utcnow(),
        active_batch=active_batch,
        all_sheds=sheds,
        recent_logs=recent_logs,
        lifting_records=lifting_records,
        system_status="healthy",
    )
