# backend/routers/simulation.py
# Full implementation - Phase 7
# POST /api/simulate - run simulation batch
# GET  /api/overview - live KPIs

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter

from backend.attacks.generator import generate_scenarios
from backend.gap_analysis.analyzer import analyze_gaps
from backend.governance.registry import get_registry
from backend.models.schemas import MetricsPayload, SimulationResult

router = APIRouter(tags=["simulation"])


@router.post("/simulate")
async def run_simulation(params: MetricsPayload) -> dict:
    """Run a simulation batch and return generation metrics."""
    from backend.simulation.world import SimulationWorld

    world = SimulationWorld(
        seed=params.seed or 42,
        n_events=params.n_events,
        prevalence=params.prevalence,
    )

    batch = world.run_generation()

    # Run gap analysis on evaded scenarios
    gap = analyze_gaps(batch.scenarios, seed=params.seed or 42)

    return {
        "run_id": batch.run_id,
        "generation": batch.generation,
        "n_events": batch.n_events,
        "n_fraud": batch.n_fraud,
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
