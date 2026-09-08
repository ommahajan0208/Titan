# backend/routers/attacks.py
# Full implementation - Phase 7
# GET  /api/attacks            - attack catalog with per-scenario detection performance
# POST /api/attacks/generate   - generate N adversarial scenarios with mutation strength
# Spec: backend_spec.md section 10

from __future__ import annotations

import time
from typing import List

from fastapi import APIRouter, Query

from backend.attacks.generator import generate_scenarios
from backend.models.schemas import GenerateRequest, GenerateResponse

router = APIRouter(prefix="/attacks", tags=["attacks"])


@router.get("")
async def get_attacks_catalog(limit: int = Query(default=50, ge=1, le=200)) -> dict:
    """
    GET /api/attacks
    Attack catalog with per-scenario detection performance.
    Returns a stable demo set of attack scenarios.
    """
    t0 = time.perf_counter()
    scenarios, genomes = generate_scenarios(count=min(limit, 50), seed=42)
    elapsed = (time.perf_counter() - t0) * 1000

    # Aggregate stats by family
    family_stats: dict = {}
    for s in scenarios:
        if s.attack_family not in family_stats:
            family_stats[s.attack_family] = {
                "count": 0, "detection_rate": 0.0, "mean_score": 0.0
            }
        family_stats[s.attack_family]["count"] += 1
        family_stats[s.attack_family]["detection_rate"] += (1.0 if not s.evaded_detection else 0.0)
        family_stats[s.attack_family]["mean_score"] += s.fused_score

    for family, stats in family_stats.items():
        n = stats["count"]
        stats["detection_rate"] = round(stats["detection_rate"] / n, 4)
        stats["mean_score"] = round(stats["mean_score"] / n, 4)

    return {
        "count": len(scenarios),
        "scenarios": [s.model_dump() for s in scenarios[:limit]],
        "family_stats": family_stats,
        "elapsed_ms": round(elapsed, 3),
    }


@router.post("/generate", response_model=GenerateResponse)
async def generate_attacks(req: GenerateRequest) -> GenerateResponse:
    """
    POST /api/attacks/generate
    Generate parametric attack scenarios using the genome mutator.
    """
    t0 = time.perf_counter()

    scenarios, genomes = generate_scenarios(
        count=req.count,
        family=req.family,
        sophistication_min=req.sophistication_min,
        sophistication_max=req.sophistication_max,
        mutation_strength=req.mutation_strength,
        seed=req.seed,
    )

    elapsed = (time.perf_counter() - t0) * 1000

    return GenerateResponse(
        scenarios=scenarios,
        genomes=genomes,
        elapsed_ms=round(elapsed, 3),
    )


@router.get("/library")
async def get_library(limit: int = 20) -> dict:
    """Return top genomes from the red team library."""
    _, genomes = generate_scenarios(count=min(limit, 50), seed=99)
    return {
        "count": len(genomes),
        "genomes": [g.model_dump() for g in genomes[:limit]],
    }
