"""
Core poultry domain calculation engine.
Provides deterministic, strictly typed business logic for broiler farm management.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class FlockHealthMetrics:
    initial_chicks: int
    cumulative_mortality: int
    estimated_live_birds: int
    mortality_percentage: float
    livability_percentage: float


@dataclass(frozen=True)
class FeedMetrics:
    total_feed_consumed_kg: float
    estimated_live_birds: int
    feed_intake_per_bird_grams: float
    cumulative_feed_per_bird_kg: float


@dataclass(frozen=True)
class PerformanceMetrics:
    fcr: float
    epef: float
    flock_age_days: int
    avg_body_weight_kg: float
    is_fcr_favorable: bool


@dataclass(frozen=True)
class LiftingSummary:
    total_placed_chicks: int
    cumulative_mortality: int
    total_birds_lifted: int
    remaining_birds: int
    total_lifted_weight_kg: float
    avg_lifted_weight_kg: float
    lifting_completion_rate: float


@dataclass(frozen=True)
class SettlementProjection:
    total_lifted_weight_kg: float
    base_rate_per_kg: float
    base_growing_charge: float
    fcr_incentive: float
    mortality_deduction: float
    medicine_deduction: float
    chick_cost_deduction: float
    other_incentives: float
    gross_earnings: float
    total_deductions: float
    net_payable_amount: float


def calculate_flock_health(initial_chicks: int, cumulative_mortality: int) -> FlockHealthMetrics:
    """
    Computes live bird count, mortality percentage, and livability percentage.
    """
    if initial_chicks <= 0:
        raise ValueError("Initial placed chicks must be greater than zero.")
    if cumulative_mortality < 0:
        raise ValueError("Cumulative mortality cannot be negative.")
    if cumulative_mortality > initial_chicks:
        raise ValueError("Cumulative mortality cannot exceed total placed chicks.")

    estimated_live = initial_chicks - cumulative_mortality
    mortality_pct = round((cumulative_mortality / initial_chicks) * 100, 2)
    livability_pct = round(100.0 - mortality_pct, 2)

    return FlockHealthMetrics(
        initial_chicks=initial_chicks,
        cumulative_mortality=cumulative_mortality,
        estimated_live_birds=estimated_live,
        mortality_percentage=mortality_pct,
        livability_percentage=livability_pct,
    )


def calculate_feed_intake(
    daily_feed_kg: float,
    total_feed_consumed_kg: float,
    initial_chicks: int,
    estimated_live_birds: int,
) -> FeedMetrics:
    """
    Computes daily per-bird grams intake and total feed consumed per placed chick.
    """
    if estimated_live_birds <= 0:
        feed_per_bird_grams = 0.0
    else:
        feed_per_bird_grams = round((daily_feed_kg * 1000.0) / estimated_live_birds, 2)

    if initial_chicks <= 0:
        cum_feed_per_chick = 0.0
    else:
        cum_feed_per_chick = round(total_feed_consumed_kg / initial_chicks, 3)

    return FeedMetrics(
        total_feed_consumed_kg=round(total_feed_consumed_kg, 2),
        estimated_live_birds=estimated_live_birds,
        feed_intake_per_bird_grams=feed_per_bird_grams,
        cumulative_feed_per_bird_kg=cum_feed_per_chick,
    )


def calculate_fcr(
    total_feed_consumed_kg: float,
    total_live_weight_kg: float,
    standard_benchmark_fcr: float = 1.60,
) -> float:
    """
    Calculates Feed Conversion Ratio: Total Feed (kg) / Total Weight (kg).
    Lower is better.
    """
    if total_live_weight_kg <= 0:
        return 0.0
    fcr_val = round(total_feed_consumed_kg / total_live_weight_kg, 3)
    return fcr_val


def calculate_epef(
    livability_percentage: float,
    avg_body_weight_kg: float,
    flock_age_days: int,
    fcr: float,
) -> float:
    """
    Calculates European Production Efficiency Factor (EPEF / EEF).
    Formula: (Livability % * Average Body Weight (kg)) / (Age (days) * FCR) * 100
    Higher is better (>350 is excellent).
    """
    if flock_age_days <= 0 or fcr <= 0:
        return 0.0
    
    denominator = flock_age_days * fcr
    if denominator == 0:
        return 0.0
    
    epef_val = round((livability_percentage * avg_body_weight_kg * 100.0) / denominator, 2)
    return epef_val


def calculate_flock_performance(
    total_feed_consumed_kg: float,
    estimated_live_birds: int,
    avg_body_weight_kg: float,
    flock_age_days: int,
    livability_percentage: float,
    standard_benchmark_fcr: float = 1.60,
) -> PerformanceMetrics:
    """
    Computes comprehensive performance indicators for the flock.
    """
    total_live_weight_kg = estimated_live_birds * avg_body_weight_kg
    fcr_val = calculate_fcr(total_feed_consumed_kg, total_live_weight_kg, standard_benchmark_fcr)
    epef_val = calculate_epef(livability_percentage, avg_body_weight_kg, flock_age_days, fcr_val)

    return PerformanceMetrics(
        fcr=fcr_val,
        epef=epef_val,
        flock_age_days=flock_age_days,
        avg_body_weight_kg=round(avg_body_weight_kg, 3),
        is_fcr_favorable=(0.0 < fcr_val <= standard_benchmark_fcr),
    )


def calculate_lifting_balance(
    total_placed_chicks: int,
    cumulative_mortality: int,
    total_birds_lifted: int,
    total_lifted_weight_kg: float,
) -> LiftingSummary:
    """
    Calculates lifting status and remaining birds inside the shed.
    """
    live_before_lifting = total_placed_chicks - cumulative_mortality
    if total_birds_lifted > live_before_lifting:
        raise ValueError(f"Total birds lifted ({total_birds_lifted}) cannot exceed live birds ({live_before_lifting}).")
    
    remaining = live_before_lifting - total_birds_lifted
    avg_wt = round(total_lifted_weight_kg / total_birds_lifted, 3) if total_birds_lifted > 0 else 0.0
    completion_rate = round((total_birds_lifted / live_before_lifting) * 100, 1) if live_before_lifting > 0 else 0.0

    return LiftingSummary(
        total_placed_chicks=total_placed_chicks,
        cumulative_mortality=cumulative_mortality,
        total_birds_lifted=total_birds_lifted,
        remaining_birds=remaining,
        total_lifted_weight_kg=round(total_lifted_weight_kg, 2),
        avg_lifted_weight_kg=avg_wt,
        lifting_completion_rate=completion_rate,
    )


def calculate_settlement(
    total_lifted_weight_kg: float,
    base_rate_per_kg: float,
    actual_fcr: float,
    standard_benchmark_fcr: float = 1.60,
    fcr_incentive_rate_per_point: float = 0.50,
    mortality_pct: float = 0.0,
    standard_mortality_pct: float = 5.0,
    mortality_penalty_rate: float = 0.20,
    other_incentives: float = 0.0,
    medicine_deduction: float = 0.0,
    chick_cost_deduction: float = 0.0,
) -> SettlementProjection:
    """
    Computes Growing Charges (GC) and financial settlement for contract or commercial farming.
    """
    base_gc = round(total_lifted_weight_kg * base_rate_per_kg, 2)

    # FCR Incentive (if farmer beats company standard FCR)
    fcr_diff = standard_benchmark_fcr - actual_fcr
    fcr_incentive = 0.0
    if fcr_diff > 0 and actual_fcr > 0:
        fcr_incentive = round(fcr_diff * fcr_incentive_rate_per_point * total_lifted_weight_kg, 2)

    # Mortality penalty (if mortality exceeds contract allowance)
    mortality_deduction = 0.0
    if mortality_pct > standard_mortality_pct:
        excess_pct = mortality_pct - standard_mortality_pct
        mortality_deduction = round(excess_pct * mortality_penalty_rate * total_lifted_weight_kg, 2)

    gross_earnings = round(base_gc + fcr_incentive + other_incentives, 2)
    total_deductions = round(mortality_deduction + medicine_deduction + chick_cost_deduction, 2)
    net_payable = round(gross_earnings - total_deductions, 2)

    return SettlementProjection(
        total_lifted_weight_kg=round(total_lifted_weight_kg, 2),
        base_rate_per_kg=base_rate_per_kg,
        base_growing_charge=base_gc,
        fcr_incentive=fcr_incentive,
        mortality_deduction=mortality_deduction,
        medicine_deduction=medicine_deduction,
        chick_cost_deduction=chick_cost_deduction,
        other_incentives=other_incentives,
        gross_earnings=gross_earnings,
        total_deductions=total_deductions,
        net_payable_amount=net_payable,
    )


# Standard commercial broiler growth curve benchmarks (Cobb 500 / Ross 308)
BREED_STANDARD_BENCHMARKS = [
    (0, 42.0),
    (7, 205.0),
    (14, 510.0),
    (21, 1010.0),
    (28, 1590.0),
    (35, 2240.0),
    (42, 2890.0),
]


def get_breed_standard_weight(age_days: int) -> float:
    """
    Interpolates breed standard target body weight in grams for any given flock age.
    """
    if age_days <= 0:
        return 42.0
    if age_days >= BREED_STANDARD_BENCHMARKS[-1][0]:
        return BREED_STANDARD_BENCHMARKS[-1][1]

    for i in range(len(BREED_STANDARD_BENCHMARKS) - 1):
        day_a, wt_a = BREED_STANDARD_BENCHMARKS[i]
        day_b, wt_b = BREED_STANDARD_BENCHMARKS[i + 1]
        if day_a <= age_days <= day_b:
            ratio = (age_days - day_a) / (day_b - day_a)
            return round(wt_a + ratio * (wt_b - wt_a), 1)

    return 2240.0


def calculate_adg(
    prev_weight_grams: float,
    current_weight_grams: float,
    days_elapsed: int,
) -> float:
    """
    Calculates Average Daily Gain (ADG) in grams per bird per day.
    """
    if days_elapsed <= 0:
        return 0.0
    return round((current_weight_grams - prev_weight_grams) / days_elapsed, 1)

