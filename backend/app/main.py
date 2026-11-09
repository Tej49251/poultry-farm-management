"""
Poultry Farm Management System API Server.
FastAPI entrypoint with CORS, route registration, and health check.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.dashboard import router as dashboard_router
from app.api.batches import router as batches_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0-phase1",
    description="Professional poultry farm operations API: flock metrics, FCR, feed, and settlement.",
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
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(batches_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "phase": "Phase 1 - Dashboard Foundation",
    }
