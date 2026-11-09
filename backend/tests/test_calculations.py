"""
Comprehensive tests for poultry calculations engine.
Verifies flock health, feed intake, FCR, EPEF, bird lifting balance, and settlement formulas.
"""

import pytest
from app.core.calculations import (
    calculate_flock_health,
    calculate_feed_intake,
    calculate_fcr,
    calculate_epef,
    calculate_flock_performance,
    calculate_lifting_balance,
    calculate_settlement,
)


def test_flock_health_standard():
    health = calculate_flock_health(initial_chicks=5000, cumulative_mortality=150)
    assert health.estimated_live_birds == 4850
    assert health.mortality_percentage == 3.0
    assert health.livability_percentage == 97.0


def test_flock_health_validation_errors():
    with pytest.raises(ValueError, match="Initial placed chicks must be greater than zero"):
        calculate_flock_health(0, 0)

    with pytest.raises(ValueError, match="Cumulative mortality cannot be negative"):
        calculate_flock_health(5000, -5)

    with pytest.raises(ValueError, match="Cumulative mortality cannot exceed total placed chicks"):
        calculate_flock_health(5000, 5001)


def test_feed_intake():
    feed = calculate_feed_intake(
        daily_feed_kg=480.0,
        total_feed_consumed_kg=6000.0,
        initial_chicks=5000,
        estimated_live_birds=4800,
    )
    # (480 * 1000) / 4800 = 100g per bird
    assert feed.feed_intake_per_bird_grams == 100.0
    # 6000 / 5000 = 1.2 kg per chick placed
    assert feed.cumulative_feed_per_bird_kg == 1.200


def test_fcr_calculation():
    # 7500 kg feed consumed / 5000 kg total live weight = 1.50
    fcr = calculate_fcr(total_feed_consumed_kg=7500.0, total_live_weight_kg=5000.0)
    assert fcr == 1.500

    # Zero live weight handles cleanly
    assert calculate_fcr(500.0, 0.0) == 0.0


def test_epef_calculation():
    # Formula: (Livability % * Average Body Weight (kg)) / (Age in Days * FCR) * 100
    # Example: (96.5% * 2.2kg) / (38 days * 1.55 FCR) * 100 = 212.3 / 58.9 * 100 = 360.44
    epef = calculate_epef(
        livability_percentage=96.5,
        avg_body_weight_kg=2.2,
        flock_age_days=38,
        fcr=1.55,
    )
    assert epef == 360.44


def test_flock_performance():
    perf = calculate_flock_performance(
        total_feed_consumed_kg=15000.0,
        estimated_live_birds=4800,
        avg_body_weight_kg=2.0,
        flock_age_days=35,
        livability_percentage=96.0,
        standard_benchmark_fcr=1.60,
    )
    # Total live weight = 4800 * 2.0 = 9600 kg
    # FCR = 15000 / 9600 = 1.5625 -> 1.562 (bankers rounding)
    assert perf.fcr == pytest.approx(1.562, abs=0.001)
    assert perf.is_fcr_favorable is True
    assert perf.epef > 300


def test_lifting_balance():
    summary = calculate_lifting_balance(
        total_placed_chicks=5000,
        cumulative_mortality=150,
        total_birds_lifted=3000,
        total_lifted_weight_kg=6600.0,
    )
    # Live was 4850, lifted 3000 -> 1850 remaining
    assert summary.remaining_birds == 1850
    assert summary.avg_lifted_weight_kg == 2.2
    assert summary.lifting_completion_rate == 61.9


def test_lifting_balance_error_when_exceeding():
    with pytest.raises(ValueError, match="cannot exceed live birds"):
        calculate_lifting_balance(
            total_placed_chicks=1000,
            cumulative_mortality=100,
            total_birds_lifted=950, # only 900 are live
            total_lifted_weight_kg=1900.0,
        )


def test_settlement_calculation():
    settlement = calculate_settlement(
        total_lifted_weight_kg=10000.0,
        base_rate_per_kg=12.0, # ₹12 / kg
        actual_fcr=1.52,
        standard_benchmark_fcr=1.60,
        fcr_incentive_rate_per_point=0.50, # 0.08 difference * 0.50 * 10000 = ₹400
        mortality_pct=3.5, # under 5.0% threshold -> no deduction
        standard_mortality_pct=5.0,
        other_incentives=500.0,
        medicine_deduction=200.0,
    )
    # Base GC = 10,000 * 12 = 120,000
    assert settlement.base_growing_charge == 120000.0
    assert settlement.fcr_incentive == 400.0
    assert settlement.mortality_deduction == 0.0
    assert settlement.gross_earnings == 120900.0
    assert settlement.total_deductions == 200.0
    assert settlement.net_payable_amount == 120700.0
