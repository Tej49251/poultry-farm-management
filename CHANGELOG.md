# Changelog

All notable changes to the Poultry Farm Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Phase 3 — Full Stack Integration & Authentication:
  - Centralized TypeScript REST client `ApiService` (`frontend/src/services/api.ts`) connecting all views to FastAPI.
  - Resilient hybrid data strategy: Automatic sync with live PostgreSQL / SQLite backend when online, graceful offline demo fallback when offline.
  - Role-Based Authentication (Owner, Supervisor, Worker) with bcrypt password hashing and PyJWT token generation.
  - Security endpoints: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/register`, and auto-seeding of default farm users.
  - Interactive `LoginModal` and dynamic user avatar / status badge in top `Navbar`.
  - Production database configuration: PostgreSQL support via environment parameters (`POSTGRES_SERVER`, `POSTGRES_USER`, etc.) with SQLAlchemy connection pooling (`pool_size=10`, `max_overflow=20`, `pool_recycle=1800`).
  - Historical batch management: Ability to view completed batches, inspect performance summaries, and track settled growing charge payouts.
  - Pytest unit tests in `backend/tests/test_auth.py` covering hashing, tokens, registration, and login verification (total 43/43 tests passing).
- Phase 2 — Modules 6 & 7: Bird Lifting Records & Final Grower Contract Settlement:
  - `BirdLifting` and `Settlement` SQLAlchemy models with weighbridge gross/tare tracking.
  - Automatic net weight ($Gross - Tare$), average bird weight ($Net / Birds$), and shed remaining flock calculations.
  - Validation against live birds in shed to prevent exceeding flock availability during harvest.
  - Deterministic final grower contract settlement calculations: Base Growing Charges, FCR performance bonuses, and deductions.
  - REST API endpoints (`/api/v1/harvest/liftings`, `/api/v1/harvest/settlement`).
  - Pytest test suite in `backend/tests/test_harvest.py` with 5 test cases.
  - Frontend `LiftingView` featuring weighbridge ledger, harvest completion progress bar, and "+ Log Lifting Slip" modal.
  - Frontend `SettlementView` featuring printable/exportable itemized contract settlement vouchers with "Mark as Paid" action.
- Phase 2 — Modules 4 & 5: Weight Tracking, Breed Growth Curves & FCR Analytics:
  - `WeightSample` SQLAlchemy model and Pydantic schemas with flock age indexing.
  - Cobb 500 & Ross 308 breed standard benchmark tables with daily weight interpolation.
  - Average Daily Gain (ADG) calculations and flock weight uniformity % metrics.
  - REST API endpoints (`/api/v1/growth/samples`, `/api/v1/growth/overview/{batch_id}`).
  - Pytest test suite in `backend/tests/test_growth.py` with 4 test cases verifying growth formulas and checkpoints.
  - Frontend `WeightAndFcrView` featuring visual growth comparison bars vs breed targets (Day 0 to Day 42) and cumulative FCR trajectories.
  - Fast farmer modal `RecordWeightSampleModal` for live weigh-in logging.
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
