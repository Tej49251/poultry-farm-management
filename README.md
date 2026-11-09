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
- **Farmer-Centric UX**:
  - Intuitive, low-friction daily record entry.
  - Automated math & real-time validation to eliminate repetitive manual calculations.
  - Clean neutral palette with professional emerald green accents, high contrast typography, and distraction-free cards.
- **Future-Ready Architecture**:
  - Decoupled React + TypeScript frontend with Tailwind CSS.
  - Scalable Python FastAPI backend with SQLAlchemy ORM and PostgreSQL support.
  - Comprehensive business calculation engine with 100% automated test coverage.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+ & **npm**
- **Python** 3.10+ & **pip**

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The web dashboard will start on `http://localhost:5173`.

### 3. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API documentation available at `http://localhost:8000/docs`.

### 4. Running Tests
```bash
# Backend business calculations and API tests
cd backend
pytest -v
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

## 📂 Repository Structure

```
poultry-farm-management/
├── frontend/             # React 18, TypeScript, TailwindCSS, Lucide Icons, Vite
│   ├── src/
│   │   ├── components/   # Header, Sidebar, MetricCard, ShedCard, Charts, Badges
│   │   ├── types/        # TypeScript interfaces for Batch, DailyLog, Shed, Settlement
│   │   ├── data/         # Demo data clearly identified for initial UI stage
│   │   ├── utils/        # Calculation helpers and currency formatters
│   │   └── App.tsx       # Main dashboard layout and routing
├── backend/              # FastAPI, SQLAlchemy, Pydantic, Pytest
│   ├── app/
│   │   ├── core/         # Calculations, domain logic, configuration
│   │   ├── models/       # Database models (Shed, Batch, DailyLog, Lifting, Settlement)
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── api/          # REST API endpoints
│   └── tests/            # Pytest test suite for business calculations
├── docs/                 # System architecture, schemas, and specifications
├── CHANGELOG.md          # Release and milestone tracking
└── README.md             # Project documentation
```

---

## 🛡️ License
Private & Proprietary - Developed for poultry farm operations.
