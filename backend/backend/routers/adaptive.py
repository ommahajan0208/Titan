# backend/routers/adaptive.py
# BP1 stub - full War Room / NSGA-II co-evolution API. Implemented in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse

router = APIRouter(prefix="/adaptive", tags=["adaptive"])


@router.post("/runs")
async def start_run() -> StubResponse:
    """Start a new NSGA-II co-evolution run. Returns {run_id}. Implemented in BP6."""
    return StubResponse(message="POST /adaptive/runs - starts run, returns {run_id: str}.")


@router.get("/runs")
async def list_runs() -> StubResponse:
    """List all runs with their status. Implemented in BP6."""
    return StubResponse(message="GET /adaptive/runs - returns RunSummary[].")


@router.get("/runs/{run_id}/state")
async def get_run_state(run_id: str) -> StubResponse:
    """Live WarRoomState for an active run. Polled every 3s by frontend. Implemented in BP6."""
    return StubResponse(message=f"GET /adaptive/runs/{run_id}/state - returns WarRoomState.")


@router.get("/runs/{run_id}/generations")
async def get_generations(run_id: str) -> StubResponse:
    """All completed GenerationRecord objects for a run. Implemented in BP6."""
    return StubResponse(message=f"GET /adaptive/runs/{run_id}/generations - returns GenerationRecord[].")


@router.get("/runs/{run_id}/oracle")
async def get_oracle(run_id: str) -> StubResponse:
    """Oracle regime analysis after run completion. Implemented in BP6."""
    return StubResponse(message=f"GET /adaptive/runs/{run_id}/oracle - returns OracleReport.")


@router.get("/runs/{run_id}/red/library")
async def get_red_library(run_id: str) -> StubResponse:
    """Top AttackGenome objects from the run's Red population. Implemented in BP6."""
    return StubResponse(message=f"GET /adaptive/runs/{run_id}/red/library - returns AttackGenome[].")


@router.delete("/runs/{run_id}")
async def stop_run(run_id: str) -> StubResponse:
    """Stop an active run gracefully. Implemented in BP6."""
    return StubResponse(message=f"DELETE /adaptive/runs/{run_id} - stops run.")
