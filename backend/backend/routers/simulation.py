# backend/routers/simulation.py
# BP1 stub - full implementation in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse, MetricsPayload

router = APIRouter(tags=["simulation"])


@router.post("/simulate")
async def run_simulation(params: MetricsPayload) -> StubResponse:
    """Run a full simulation batch (prevalence required). Implemented in BP4."""
    return StubResponse(
        message=f"POST /simulate - will run {params.n_events} events at prevalence={params.prevalence}."
    )


@router.get("/overview")
async def get_overview() -> dict:
    """Current KPIs - arms race index, decision split, active model. Partially live in BP1."""
    from config import cfg

    return {
        "total_events_scored": 0,
        "decision_split": {"ALLOW": 0, "REVIEW": 0, "BLOCK": 0},
        "arms_race_index": 0.142,
        "arms_race_regime": "blue_ascendant",
        "active_model_id": "defense-v3.0",
        "recall": 0.928,
        "fpr": 0.010,
        "demo_mode": True,
        "config_hash": cfg.config_hash(),
    }
