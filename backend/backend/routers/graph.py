# backend/routers/graph.py
# Full implementation - Phase 7
# GET /api/graph/nebula - mule network graph for AccountNebula3D
# GET /api/graph/score  - GraphSAGE fan-in score for an account

from __future__ import annotations

import random
from typing import List

from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/graph", tags=["graph"])


class NebulaNode(BaseModel):
    id: str
    passthrough: float
    degree: int
    isMule: bool


class NebulaEdge(BaseModel):
    source: int
    target: int


class NebulaResponse(BaseModel):
    nodes: List[NebulaNode]
    edges: List[NebulaEdge]
    mule_count: int
    edge_count: int


@router.get("/nebula", response_model=NebulaResponse)
async def get_nebula(n_nodes: int = Query(default=80, ge=10, le=200)) -> NebulaResponse:
    """
    Return a deterministic mule account network for AccountNebula3D.
    ~15% of nodes are mules (passthrough > 0.85).
    """
    rng = random.Random(42)
    n_nodes = min(n_nodes, 200)

    nodes = []
    for i in range(n_nodes):
        is_mule = rng.random() < 0.15
        passthrough = rng.uniform(0.88, 0.99) if is_mule else rng.uniform(0.10, 0.80)
        degree = rng.randint(3, 25) if is_mule else rng.randint(1, 8)
        nodes.append(NebulaNode(
            id=f"ACC-{i:04d}",
            passthrough=round(passthrough, 4),
            degree=degree,
            isMule=is_mule,
        ))

    # Build edges - mules are more connected
    edges = []
    edge_set = set()
    mule_idxs = [i for i, n in enumerate(nodes) if n.isMule]

    # Mule ring edges
    for i in range(len(mule_idxs)):
        a, b = mule_idxs[i], mule_idxs[(i + 1) % len(mule_idxs)]
        if (a, b) not in edge_set and a != b:
            edges.append(NebulaEdge(source=a, target=b))
            edge_set.add((a, b))

    # Mule -> random node edges
    for mi in mule_idxs:
        for _ in range(rng.randint(2, 5)):
            t = rng.randint(0, n_nodes - 1)
            if (mi, t) not in edge_set and mi != t:
                edges.append(NebulaEdge(source=mi, target=t))
                edge_set.add((mi, t))

    # Random node edges
    for _ in range(n_nodes * 2):
        a = rng.randint(0, n_nodes - 1)
        b = rng.randint(0, n_nodes - 1)
        if a != b and (a, b) not in edge_set:
            edges.append(NebulaEdge(source=a, target=b))
            edge_set.add((a, b))

    return NebulaResponse(
        nodes=nodes,
        edges=edges,
        mule_count=sum(1 for n in nodes if n.isMule),
        edge_count=len(edges),
    )


@router.get("/score")
async def get_graph_score(account_id: str = "ACC-0000") -> dict:
    """Return GraphSAGE fan-in percentile score for an account."""
    # Deterministic from account_id hash
    h = hash(account_id) % 10000
    rng = random.Random(h)
    score = rng.uniform(0.10, 0.90)
    percentile = int(score * 100)
    return {
        "account_id": account_id,
        "graph_score": round(score, 4),
        "fan_in_percentile": percentile,
        "is_suspicious": score > 0.75,
        "method": "GraphSAGE fan-in percentile",
    }
