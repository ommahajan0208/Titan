# backend/routers/graph.py
# BP1 stub - full implementation in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse

router = APIRouter(tags=["graph"])


@router.get("/graph/mules")
async def get_mule_graph() -> StubResponse:
    """Account entity graph for GraphSAGE nebula visualization. Implemented in BP4."""
    return StubResponse(message="GET /graph/mules - returns {nodes: NebulaNode[], edges: NebulaEdge[]}.")


@router.post("/graph/score")
async def score_graph_node() -> StubResponse:
    """Score a single account node via fan-in percentile. Implemented in BP4."""
    return StubResponse(message="POST /graph/score - returns graph_score for a single account.")
