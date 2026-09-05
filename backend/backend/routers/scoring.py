# backend/routers/scoring.py
# BP1 stub - full implementation in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse, ScoreRequest

router = APIRouter(tags=["scoring"])


@router.post("/score")
async def score_event(event: ScoreRequest) -> StubResponse:
    """Fused ML + Graph + Rule scoring for a single payment event. Implemented in BP4."""
    return StubResponse(
        message=f"POST /score - will return ScoreResponse with fused score for event {event.event_id}."
    )


@router.get("/fidelity")
async def get_fidelity() -> StubResponse:
    """Synthetic data fidelity metrics (KS test, Wasserstein). Implemented in BP4."""
    return StubResponse(message="GET /fidelity - returns FidelityMetrics.")
