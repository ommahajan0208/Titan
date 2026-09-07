# backend/routers/gap.py
# Full implementation - Phase 7
# POST /api/gap/analyze  - run K-Means gap analysis on a scenario set
# GET  /api/gap/atlas    - MAP-Elites archive state

from __future__ import annotations

from typing import List

from fastapi import APIRouter

from backend.atlas.map_elites import get_archive
from backend.gap_analysis.analyzer import analyze_gaps
from backend.models.schemas import GapReport, ScenarioItem

router = APIRouter(prefix="/gap", tags=["gap"])


@router.post("/analyze", response_model=GapReport)
async def run_gap_analysis(scenarios: List[ScenarioItem]) -> GapReport:
    """Run K-Means clustering on evaded scenarios to find blind spots."""
    return analyze_gaps(scenarios)


@router.get("/atlas")
async def get_atlas() -> dict:
    """Return the current MAP-Elites archive (120 cells, 10x12 grid)."""
    archive = get_archive()
    return {
        "cells": [c.model_dump() for c in archive.get_cells()],
        "summary": archive.get_summary(),
    }


@router.post("/atlas/harden")
async def harden_cell(x: int, y: int) -> dict:
    """Mark a MAP-Elites cell as hardened (counterexamples synthesised)."""
    archive = get_archive()
    cell = archive.harden_cell(x, y)
    if cell is None:
        return {"error": f"Cell ({x},{y}) not found"}
    return {"hardened": True, "cell": cell.model_dump()}
