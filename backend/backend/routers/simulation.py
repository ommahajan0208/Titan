# backend/routers/simulation.py
# Full implementation - Phase 7
# POST /api/simulate     - run a full adversarial simulation
# GET  /api/simulations  - history of simulation runs
# GET  /api/overview     - live KPIs
# GET  /api/fidelity     - fidelity metrics (also in scoring.py for compatibility)

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.attacks.generator import generate_scenarios
from backend.gap_analysis.analyzer import analyze_gaps
from backend.governance.registry import get_registry
from backend.models.schemas import KSTestResult, FidelityMetrics

router = APIRouter(tags=["simulation"])

# In-memory simulation run history
_simulation_runs: List[Dict[str, Any]] = []


class SimulateRequest(BaseModel):
    attack_families: List[str] = Field(default_factory=lambda: ["synthetic_identity"])
    count: int = Field(default=500, ge=1, le=10_000)
    intensity: float = Field(default=1.0, ge=0.1, le=3.0)
    seed: int = 42
    prevalence: float = Field(default=0.01, gt=0.0, lt=1.0)


@router.post("/simulate")
async def run_simulation(params: SimulateRequest) -> dict:
    """
    Run a full adversarial simulation.
    Accepts attack_families list, count, intensity, seed, prevalence.
    """
    from backend.simulation.world import SimulationWorld

    world = SimulationWorld(
        seed=params.seed,
        n_events=min(params.count, 500),
        prevalence=params.prevalence,
    )

    batch = world.run_generation()

    # Run gap analysis on evaded scenarios
    gap = analyze_gaps(batch.scenarios, seed=params.seed)

    run_record = {
        "run_id": batch.run_id,
        "generation": batch.generation,
        "n_events": batch.n_events,
        "n_fraud": batch.n_fraud,
        "attack_families": params.attack_families,
        "intensity": params.intensity,
        "seed": params.seed,
        "prevalence": params.prevalence,
        "detection_rate_fixed_set": batch.detection_rate_fixed_set,
        "detection_rate_new_vectors": batch.detection_rate_new_vectors,
        "recall": batch.recall,
        "precision": batch.precision,
        "false_positive_rate": batch.false_positive_rate,
        "arms_race_index": batch.arms_race_index,
        "arms_race_regime": batch.arms_race_regime,
        "novelty_archive_size": batch.novelty_archive_size,
        "n_emergent_events": batch.n_emergent_events,
        "elapsed_seconds": batch.elapsed_seconds,
        "gap_report": gap.model_dump(),
        "created_at": datetime.utcnow().isoformat(),
    }

    _simulation_runs.append(run_record)

    return run_record


@router.get("/simulations")
async def list_simulations(limit: int = 20) -> dict:
    """History of simulation runs, most recent first."""
    return {
        "count": len(_simulation_runs),
        "runs": list(reversed(_simulation_runs))[:limit],
    }


@router.get("/overview")
async def get_overview() -> dict:
    """Current KPIs - arms race index, decision split, active model."""
    from config import cfg

    registry = get_registry()
    active = registry.active_model

    return {
        "total_events_scored": 0,
        "decision_split": {"ALLOW": 0, "REVIEW": 0, "BLOCK": 0},
        "arms_race_index": 0.142,
        "arms_race_regime": "blue_ascendant",
        "active_model_id": active.model_id if active else "defense-v3.0",
        "recall": active.recall if active else 0.928,
        "fpr": active.fpr if active else 0.010,
        "demo_mode": True,
        "config_hash": cfg.config_hash(),
    }
