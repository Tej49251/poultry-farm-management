# Changelog

All notable changes to the Poultry Farm Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Phase 2 — Module 3: Feed Management & Stock Inventory:
  - `FeedInventory` ORM model and Pydantic schemas supporting Pre-Starter, Starter, and Finisher feeds.
  - REST endpoints (`/api/v1/feed/transactions`, `/api/v1/feed/overview`) with automatic kg calculation and real-time days-left estimation.
  - Reorder warning system alerting on Low Stock (< 30 bags) and Critical (< 15 bags).
  - Pytest suite in `backend/tests/test_feed.py` verifying stock calculations and warning thresholds.
  - Frontend `FeedManagementView` with live stage inventory cards, warehouse aggregate metrics, and searchable transactions ledger.
  - Farmer modal `RecordFeedDeliveryModal` for rapid inward mill receipt logging.
- Phase 2 — Module 2: Daily Flock Register:
  - SQLAlchemy `DailyLog` model in `backend/app/models/records.py` with multi-batch and date indexing.
  - Complete REST API endpoints (`POST`, `GET`, `PATCH`, `DELETE`) with date-range filters and summary calculations.
  - Automatic feed conversion (50kg bags to kg) and duplicate entry validation for identical dates.
  - Pytest test suite in `backend/tests/test_daily_logs.py` covering all CRUD and summary calculations.
  - Frontend `DailyRegisterView` with period mortality, feed totals, grams/bird intake, weight tracking, and real-time deletion.
- Phase 2 — Module 1: Batch Management:
  - Database models (`Farm`, `Shed`, `Batch`) with SQLAlchemy and SQLite/PostgreSQL support.
  - REST API endpoints for batch placement, listing, filtering, and lifecycle closing.
  - Pydantic v2 validation schemas with automated flock age computation.
  - Comprehensive unit test suite with 8 test cases verifying CRUD, validations, and shed sanitization transitions.
  - Modern web frontend `BatchManagementView` with filter tabs (`All`, `Active`, `Completed`, `Settled`).
  - Farmer-first `CreateBatchModal` for seamless Day-Old-Chick intake and shed allocation.
  - Integrated batch status lifecycle: completing a batch automatically frees and marks the assigned shed for sanitization.
- Phase 1 Foundation:
  - Repository structure initialized with `main` and `develop` branching model.
  - Architecture specifications, calculation documents, and system diagrams.
  - FastAPI backend structure with business calculation core engine (mortality, FCR, feed intake, bird lifting, and settlement).
  - Pytest automated test suite covering all farm business formulas.
  - Modern, responsive React + TypeScript frontend dashboard with emerald theme.
  - Multi-shed overview, active batch key performance indicator cards, mortality trajectory charts, and quick-action modals.
  - Clearly tagged demo dataset for initial UI validation.
