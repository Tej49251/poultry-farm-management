"""
Unit tests for dashboard and health route handlers.
Tests the endpoints directly without requiring loopback networking.
"""

import pytest
from app.main import health_check
from app.api.dashboard import get_dashboard_overview


def test_health_check_handler():
    result = health_check()
    assert result["status"] == "online"
    assert "Phase 1" in result["phase"]


def test_dashboard_overview_handler():
    overview = get_dashboard_overview()

    assert overview.system_status == "healthy"
    assert overview.active_batch is not None
    batch = overview.active_batch
    assert batch.batch_code == "BATCH-2026-03-A"
    assert batch.initial_chicks == 5000
    assert batch.cumulative_mortality == 142
    assert batch.estimated_live_birds == 4858
    assert batch.remaining_birds == 2758
    assert batch.is_demo is True
    assert batch.current_fcr > 0
    assert batch.epef > 300

    # Verify multi-sheds structure
    assert len(overview.all_sheds) == 3
    shed1 = overview.all_sheds[0]
    assert shed1.name == "Shed 1 — North Commercial"
    assert shed1.status == "Active"

    # Verify logs and lifting records
    assert len(overview.recent_logs) == 5
    assert len(overview.lifting_records) == 1
    assert overview.lifting_records[0].birds_count == 2100
