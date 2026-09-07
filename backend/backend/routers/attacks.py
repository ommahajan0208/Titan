# backend/routers/attacks.py
# Full implementation - Phase 7
# POST /api/attacks/generate - generate attack scenarios
# GET  /api/attacks/library  - list genomes from red library

from __future__ import annotations

from typing import List

from fastapi import APIRouter

from backend.attacks.generator import generate_scenarios
from backend.models.schemas import GenerateRequest, GenerateResponse

router = APIRouter(prefix="/attacks", tags=["attacks"])

import time


@router.post("/generate", response_model=GenerateResponse)
async def generate_attacks(req: GenerateRequest) -> GenerateResponse:
    """Generate parametric attack scenarios using the genome mutator."""
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
    """Return top genomes from the red team library (mock data)."""
    # Generate a stable set of library genomes
    _, genomes = generate_scenarios(count=min(limit, 50), seed=99)
    return {
        "count": len(genomes),
        "genomes": [g.model_dump() for g in genomes[:limit]],
    }
