# System Architecture Specification

## 1. Overview
The Poultry Farm Management System (PFMS) provides end-to-end commercial broiler flock tracking. The architecture follows a clean, decoupled design to ensure modularity, high testability, and future scalability.

```
+-----------------------------------------------------------+
|                      Client Layer                         |
|     React 18 + TypeScript + Tailwind CSS (Responsive Web) |
+-----------------------------+-----------------------------+
                              | REST JSON API
+-----------------------------v-----------------------------+
|                      Backend API                          |
|         FastAPI + Pydantic v2 Validation Layer            |
+-----------------------------+-----------------------------+
                              |
+-----------------------------v-----------------------------+
|                  Core Calculation Engine                  |
|    Mortality, Cumulative Intake, FCR, EPEF, Settlement    |
+-----------------------------+-----------------------------+
                              |
+-----------------------------v-----------------------------+
|                     Data Persistence                      |
|         SQLAlchemy ORM + SQLite (Dev) / PostgreSQL (Prod) |
+-----------------------------------------------------------+
```

## 2. Design Tenets
1. **Separation of Concerns**:
   - The Core Calculation Engine (`app/core/calculations.py`) is pure and framework-agnostic. It contains zero database or HTTP framework dependencies, enabling 100% deterministic unit testing.
2. **Farmer Experience First**:
   - High contrast, distraction-free typography.
   - Minimal required manual inputs: automatically computes age from placement date, estimated live birds from mortality, FCR from cumulative feed and weight sample.
3. **Multi-Shed & Multi-Batch Support**:
   - Farm entity owns multiple Sheds.
   - Shed houses active and historical Batches.
   - Batch owns DailyLogs, FeedInventory transactions, BirdLifting slips, and final Settlement records.
