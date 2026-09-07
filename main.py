# main.py
# FastAPI application entry point for Project Titan - AI Defense Lab.
#
# Run:   uvicorn main:app --reload --port 8000
# Docs:  http://localhost:8000/docs
#
# Design rules for this file:
#   - No business logic lives here. All logic is in backend/
#   - The lifespan context owns ML model loading and world bootstrap
#   - CORS is open for the hackathon (tighten before production)
#   - All routers mount under /api - no exceptions

from __future__ import annotations

import logging
import os
import sys
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator

# Ensure backend package is importable when uvicorn runs from the Titan/ root.
_BACKEND_DIR = os.path.join(os.path.dirname(__file__), "backend")
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


from config import cfg

# Routers
from backend.routers import health as health_router
from backend.routers import taxonomy as taxonomy_router
from backend.routers import attacks as attacks_router
from backend.routers import scoring as scoring_router
from backend.routers import simulation as simulation_router
from backend.routers import gap as gap_router
from backend.routers import governance as governance_router
from backend.routers import graph as graph_router
from backend.routers import adaptive as adaptive_router
from backend.routers import audit as audit_router
from backend.routers import kyc as kyc_router
from backend.routers import demo as demo_router
from backend.routers import stream as stream_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("titan")


# ---------------------------------------------------------------------------
# Application lifespan - runs once on startup and once on shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Startup:
      1. Log config hash for reproducibility
      2. (Future phases) Load ML models, bootstrap SimulationWorld, warm caches
    Shutdown:
      1. Flush audit log
    """
    log.info("=" * 60)
    log.info("Project Titan - AI Defense Lab  v%s", cfg.app_version)
    log.info("Config hash : %s", cfg.config_hash())
    log.info("Master seed : %d", cfg.master_seed)
    log.info("ML threshold: %.2f  |  FPR target: %.3f", cfg.ml_threshold, cfg.fpr_target)
    log.info("=" * 60)

    # -------------------------------------------------------------------
    # BP1: placeholder hooks - future phases fill these in
    # -------------------------------------------------------------------
    # Phase 4 will add:  ml_ensemble = MLEnsemble.load(); app.state.ml = ml_ensemble
    # Phase 4 will add:  rule_engine = RuleEngine(cfg);   app.state.rules = rule_engine
    # Phase 5 will add:  simulation_world = SimulationWorld(cfg); app.state.world = sw
    # Phase 6 will add:  novelty_engine = NoveltyEngine(cfg); app.state.novelty = ne
    # ---------------------f-------------------------------------------------

    log.info("Phase 7 startup complete - all 36 endpoints live, stream router active.")

    yield  # Application runs here

    log.info("Titan shutting down. Bye.")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title=cfg.app_title,
    version=cfg.app_version,
    description=(
        "AI Defense Lab for Payment Security. "
        "Full-stack red-vs-blue co-evolution with real-time NSGA-II, "
        "XGBoost + GraphSAGE ensemble scoring, and MAP-Elites blind-spot analysis."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS - open for hackathon; tighten before production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,        # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request timing middleware (attaches X-Response-Time header)
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_response_time(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - t0) * 1000
    response.headers["X-Response-Time"] = f"{elapsed_ms:.1f}ms"
    return response


# ---------------------------------------------------------------------------
# Global exception handler - never return a raw 500
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": str(exc),
            "path": str(request.url.path),
        },
    )


# ---------------------------------------------------------------------------
# Mount all routers under /api
# ---------------------------------------------------------------------------
# Health + overview are the two endpoints that must return 200 in BP1.
app.include_router(health_router.router,     prefix="/api")
app.include_router(simulation_router.router, prefix="/api")   # contains /overview

# Remaining routers - stubs in BP1, filled in later phases
app.include_router(taxonomy_router.router,   prefix="/api")
app.include_router(attacks_router.router,    prefix="/api")
app.include_router(scoring_router.router,    prefix="/api")
app.include_router(gap_router.router,        prefix="/api")
app.include_router(governance_router.router, prefix="/api")
app.include_router(graph_router.router,      prefix="/api")
app.include_router(adaptive_router.router,   prefix="/api")
app.include_router(audit_router.router,      prefix="/api")
app.include_router(kyc_router.router,        prefix="/api")
app.include_router(demo_router.router,       prefix="/api")
app.include_router(stream_router.router,     prefix="/api")


# ---------------------------------------------------------------------------
# Root redirect - makes browsing to / informative instead of 404
# ---------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": cfg.app_title,
        "version": cfg.app_version,
        "status": "ok",
        "docs": "/docs",
        "health": "/api/health",
        "overview": "/api/overview",
        "config_hash": cfg.config_hash(),
    }
