# Poultry Farm Management System (PFMS)

A modern, responsive, enterprise-grade Web Dashboard for commercial broiler and poultry farm operations. Designed with a clean SaaS aesthetic, farmer-first simplicity, and robust mathematical accuracy for flock metrics, FCR, feed tracking, bird lifting, and final grower settlement.

---

## 🌟 Key Features

- **Phase 1 — Modern Executive Dashboard**:
  - Live Flock Health & Metrics Overview (Active batch, flock age, live bird estimates, cumulative mortality).
  - Feed & Nutrition Analysis (Total feed consumed, feed intake per bird, remaining feed bags).
  - Performance Metrics (Feed Conversion Ratio - FCR, average body weight, European Production Efficiency Factor - EPEF).
  - Bird Lifting & Harvesting Register (Total lifted, mortality in transit, remaining flock).
  - Financial & Settlement Projections (Estimated growing charges, incentives, deductions, net payout).
  - Multi-Shed & Multi-Batch Monitoring with clean status badges and responsive layouts.
- **Phase 2 — Functional Domain Modules**:
  - Batch Management: DOC intake, breed selection (Cobb 500, Ross 308), shed allocation, benchmark parameters.
  - Daily Flock Register: 1-click simple entry for daily mortality, feed bags, water consumption, and bird health.
  - Feed Inventory Management: Inward deliveries, bags-to-kg conversion, stock balance, and lot traceability.
  - Weight Tracking & FCR Analytics: Weekly sample weights, uniformity %, Cobb 500 standard comparison.
  - Bird Lifting Records: Delivery challans, vehicle gross/tare weights, average bird weights.
  - Payment & Final Settlement: Growing Charges (GC) voucher generator with FCR incentives and deductions.
- **Phase 3 — Full Stack Integration & Authentication**:
  - Centralized TypeScript API service (`frontend/src/services/api.ts`) connecting all screens to FastAPI endpoints.
  - Seamless dual-mode connectivity: Live API synchronization when backend is online, with resilient offline demo fallback.
  - Role-Based Authentication (Owner, Supervisor, Worker) using secure bcrypt hashing and PyJWT tokens.
  - Dual Database Engine: SQLite for rapid local development/testing; PostgreSQL connection pooling ready for production.
  - Historical Batch Records: Completed flock archive with full historical settlement and performance audit trail.
- **Farmer-Centric UX**:
  - Minimal fields, automated calculations, and sensible defaults.
  - Clean neutral palette with professional emerald green accents, high contrast typography, and distraction-free cards.

---

## 🚀 Quick Start & How to Run

### 1. Prerequisites
- **Node.js** v18+ & **npm**
- **Python** 3.10+ & **pip**

### 2. Running Backend (FastAPI + SQLite / PostgreSQL)
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API docs: `http://localhost:8000/docs`
- Default Test Logins:
  - **Owner**: `owner` / `admin123`
  - **Supervisor**: `supervisor` / `super123`

### 3. Running Frontend (Vite + React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.
- The UI automatically detects the backend and displays the `API CONNECTED` status badge. If the backend is stopped, it cleanly falls back to offline mode without interrupting the user.

### 4. Running Automated Tests
```bash
# Run 43 automated backend tests (calculations, APIs, auth, feed, harvest)
cd backend
pytest -v
```

```bash
# Verify frontend TypeScript build
cd frontend
npm run build
```

---

## 📐 Poultry Calculations Reference

| Metric | Formula |
| :--- | :--- |
| **Mortality Rate (%)** | `(Cumulative Mortality / Total Placed Chicks) * 100` |
| **Estimated Live Birds** | `Total Placed Chicks - Cumulative Mortality` |
| **FCR (Feed Conversion Ratio)** | `Total Feed Consumed (kg) / Total Live Body Weight (kg)` |
| **EPEF (European Production Efficiency Factor)**| `(Livability % * Average Weight (kg)) / (Age in Days * FCR) * 100` |
| **Net Bird Lifting Weight** | `Gross Weight - Tare Weight (Crates & Truck)` |
| **Growing Charges (GC)** | `Total Net Weight Lifted (kg) * GC Rate per kg + Performance Incentives - Deductions` |

---

## 🛡️ License
Private & Proprietary - Developed for poultry farm operations.
