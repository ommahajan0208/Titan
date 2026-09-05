# backend/routers/health.py
# Implemented in BP1 - returns real service status.

from fastapi import APIRouter
from backend.models.schemas import HealthResponse
from config import cfg
import time

router = APIRouter(tags=["health"])

_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Service liveness + capability manifest."""
    return HealthResponse(
        status="ok",
        version=cfg.app_version,
        active_model_id="defense-v3.0",
        config_hash=cfg.config_hash(),
        uptime_seconds=round(time.time() - _start_time, 1),
    )
