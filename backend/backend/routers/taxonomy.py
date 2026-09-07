# backend/routers/taxonomy.py
# Full implementation - Phase 7
# GET /api/taxonomy - full 36-vector taxonomy
# GET /api/taxonomy/{vector_id} - single vector detail

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException

from backend.attacks.taxonomy import (
    get_all_vectors,
    get_families,
    get_vector_by_id,
    get_vectors_by_family,
)
from backend.models.schemas import AttackVector

router = APIRouter(tags=["taxonomy"])


def _to_schema(v) -> AttackVector:
    return AttackVector(
        id=v.id,
        family=v.family,
        name=v.name,
        gen_ai=v.gen_ai,
        sophistication=v.sophistication,
        severity=v.severity,
        detectability=v.detectability,
        evasion_strategy=v.evasion_strategy,
        signals=v.signals,
        description=v.description,
        mitigation_policy=v.mitigation_policy,
        affected_channel=v.affected_channel,
        threat_actor_profile=v.threat_actor_profile,
    )


@router.get("/taxonomy", response_model=List[AttackVector])
async def get_taxonomy(family: Optional[str] = None) -> List[AttackVector]:
    """Return all attack vectors, optionally filtered by family."""
    if family:
        vectors = get_vectors_by_family(family)
        if not vectors:
            raise HTTPException(status_code=404, detail=f"Family '{family}' not found")
    else:
        vectors = get_all_vectors()
    return [_to_schema(v) for v in vectors]


@router.get("/taxonomy/families")
async def get_taxonomy_families() -> dict:
    """Return all 8 attack families with vector counts."""
    families = get_families()
    result = {}
    for f in families:
        vecs = get_vectors_by_family(f)
        result[f] = {
            "count": len(vecs),
            "gen_ai_count": sum(1 for v in vecs if v.gen_ai),
            "vectors": [v.id for v in vecs],
        }
    return {
        "total_vectors": len(get_all_vectors()),
        "total_families": len(families),
        "families": result,
    }


@router.get("/taxonomy/{vector_id}", response_model=AttackVector)
async def get_vector(vector_id: str) -> AttackVector:
    """Return a single attack vector by ID."""
    v = get_vector_by_id(vector_id)
    if v is None:
        raise HTTPException(status_code=404, detail=f"Vector '{vector_id}' not found")
    return _to_schema(v)
