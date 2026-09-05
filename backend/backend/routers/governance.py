# backend/routers/governance.py
# BP1 stub - full implementation in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse

router = APIRouter(tags=["governance"])


@router.get("/models")
async def get_models() -> StubResponse:
    """All model versions with benchmarks. Implemented in BP5."""
    return StubResponse(message="GET /models - returns ModelRecord[].")


@router.post("/retrain")
async def retrain_model() -> StubResponse:
    """Trigger adversarial retraining pipeline. Implemented in BP5."""
    return StubResponse(message="POST /retrain - triggers retraining, returns PromotionResult.")


@router.post("/models/rollback")
async def rollback_model() -> StubResponse:
    """Roll back to a previous model version. Implemented in BP5."""
    return StubResponse(message="POST /models/rollback - demotes active model and restores previous.")


@router.get("/evolution")
async def get_evolution_history() -> StubResponse:
    """Multi-round adversarial training history. Implemented in BP5."""
    return StubResponse(message="GET /evolution - returns per-round ModelRecord[] with metrics.")


@router.get("/holdout/evaluate")
async def evaluate_holdout() -> StubResponse:
    """Zero-shot holdout evaluation on ADV-01 family. Implemented in BP5."""
    return StubResponse(message="GET /holdout/evaluate - returns holdout detection rates.")
