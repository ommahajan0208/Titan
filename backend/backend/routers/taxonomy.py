# backend/routers/taxonomy.py
# BP1 stub - full implementation in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse

router = APIRouter(tags=["taxonomy"])


@router.get("/taxonomy")
async def get_taxonomy() -> StubResponse:
    """Full 36-vector attack taxonomy. Implemented in BP3."""
    return StubResponse(message="GET /taxonomy - returns all 36 AttackVector objects.")


@router.get("/graph/mules")
async def get_mule_graph() -> StubResponse:
    """Account graph (nodes + edges) for AccountNebula3D. Implemented in BP3."""
    return StubResponse(message="GET /graph/mules - returns NebulaNode[] and NebulaEdge[].")
