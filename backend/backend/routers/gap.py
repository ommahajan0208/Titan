# backend/routers/gap.py
# Full implementation - Phase 7
# GET  /api/gap-analysis      - current evasion clustering report
# GET  /api/atlas             - 120-cell MAP-Elites blind-spot grid
# POST /api/gap/analyze       - run K-Means gap analysis on a scenario set (internal)
# GET  /api/gap/atlas         - alias
# POST /api/gap/atlas/harden  - mark a cell as hardened

from __future__ import annotations

from typing import List

from fastapi import APIRouter

from backend.atlas.map_elites import get_archive
from backend.gap_analysis.analyzer import analyze_gaps
from backend.models.schemas import GapReport, ScenarioItem
from backend.attacks.generator import generate_scenarios

router = APIRouter(tags=["gap"])


# ── Top-level spec endpoints ───────────────────────────────────────────────────

@router.get("/gap-analysis", response_model=GapReport)
async def get_gap_analysis() -> GapReport:
    """
    GET /api/gap-analysis
    Current evasion clustering report.
    Uses the latest generated scenario set (or generates a demo set).
    """
    scenarios, _ = generate_scenarios(count=100, seed=42)
    return analyze_gaps(scenarios, seed=42)


@router.get("/atlas")
async def get_atlas() -> dict:
    """
    GET /api/atlas
    Return the 120-cell MAP-Elites blind-spot grid for visualization.
    """
    archive = get_archive()
    return {
        "cells": [c.model_dump() for c in archive.get_cells()],
        "summary": archive.get_summary(),
        "bsc_lower": archive.get_summary().get("bsc_lower", 0.0),
        "bsc_upper": archive.get_summary().get("bsc_upper", 0.0),
    }


# ── Secondary /gap/* endpoints ─────────────────────────────────────────────────

@router.post("/gap/analyze", response_model=GapReport)
async def run_gap_analysis(scenarios: List[ScenarioItem]) -> GapReport:
    """POST /api/gap/analyze - run K-Means clustering on evaded scenarios."""
    return analyze_gaps(scenarios)


@router.get("/gap/atlas")
async def get_gap_atlas() -> dict:
    """GET /api/gap/atlas - MAP-Elites archive (alias)."""
    return await get_atlas()


@router.post("/gap/atlas/harden")
async def harden_cell(x: int, y: int) -> dict:
    """Mark a MAP-Elites cell as hardened (counter-examples synthesised)."""
    archive = get_archive()
    cell = archive.harden_cell(x, y)
    if cell is None:
        return {"error": f"Cell ({x},{y}) not found"}
    return {"hardened": True, "cell": cell.model_dump()}
