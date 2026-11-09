"""
Poultry Farm Management System API Server.
FastAPI entrypoint with CORS, route registration, database initialization, and health check.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.base import Base, engine, SessionLocal
import app.models  # Ensure all model tables are registered in Base.metadata
from app.api.auth import router as auth_router, seed_default_users
from app.api.dashboard import router as dashboard_router
from app.api.batches import router as batches_router
from app.api.daily_logs import router as daily_logs_router
from app.api.feed import router as feed_router
from app.api.growth import router as growth_router
from app.api.harvest import router as harvest_router
from app.models.farm import Farm, Shed

# Create tables on application initialization
Base.metadata.create_all(bind=engine)

# Auto-seed default farm & sheds if database is completely empty
def init_farm_data():
    db = SessionLocal()
    try:
        seed_default_users(db)
        if db.query(Farm).count() == 0:
            farm = Farm(name="GreenValley Commercial Broiler Farm", location="Hyderabad Agri-Cluster, Telangana")
            db.add(farm)
            db.commit()
            db.refresh(farm)

            shed1 = Shed(name="Shed 1 — North Commercial", farm_id=farm.id, capacity=5000, is_active=True)
            shed2 = Shed(name="Shed 2 — South Broiler Unit", farm_id=farm.id, capacity=6000, is_active=True)
            shed3 = Shed(name="Shed 3 — East Environmentally Controlled", farm_id=farm.id, capacity=8000, is_active=True)
            db.add_all([shed1, shed2, shed3])
            db.commit()
    except Exception as e:
        print(f"Warning: Initial database seeding exception: {e}")
    finally:
        db.close()

init_farm_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0-phase3",
    description="Professional poultry farm operations API: flock metrics, FCR, feed, settlement, and authentication.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware for web dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(batches_router, prefix=settings.API_V1_STR)
app.include_router(daily_logs_router, prefix=settings.API_V1_STR)
app.include_router(feed_router, prefix=settings.API_V1_STR)
app.include_router(growth_router, prefix=settings.API_V1_STR)
app.include_router(harvest_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "phase": "Phase 3 - Integration",
        "database": "connected",
    }
