# backend/routers/demo.py
# BP1 stub - Judge Demo 9-step pipeline. Implemented in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse

router = APIRouter(tags=["demo"])


@router.post("/judge-demo/run")
async def run_judge_demo() -> StubResponse:
    """Execute the 9-step AI Defense pipeline demo end-to-end. Implemented in BP5."""
    return StubResponse(
        message=(
            "POST /judge-demo/run - runs the full pipeline: "
            "IDENTIFY -> GENERATE -> SIMULATE -> DETECT -> EXPLAIN -> "
            "ANALYZE -> SYNTHESIZE -> RETRAIN -> EVOLVE. "
            "Returns streaming SSE or a final summary JSON."
        )
    )


@router.post("/demo-mode")
async def set_demo_mode(body: dict) -> dict:
    """Toggle demo mode (switches backend to mock data path). Live in BP1."""
    enabled = bool(body.get("enabled", True))
    return {"demo_mode": enabled, "status": "ok"}
