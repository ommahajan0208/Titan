# backend/routers/attacks.py
# BP1 stub - full implementation in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse, GenerateRequest

router = APIRouter(tags=["attacks"])


@router.post("/attacks/generate")
async def generate_attacks(params: GenerateRequest) -> StubResponse:
    """Parametric attack generation via genome grammar. Implemented in BP3."""
    return StubResponse(
        message=f"POST /attacks/generate - will return GenerateResponse with {params.count} scenarios."
    )
