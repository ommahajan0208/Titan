# backend/routers/kyc.py
# BP1 stub - ArcFace ONNX liveness + face match. Implemented in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse

router = APIRouter(tags=["kyc"])


@router.post("/kyc/liveness")
async def check_liveness() -> StubResponse:
    """Liveness detection from uploaded frame. Accepts multipart/form-data. Implemented in BP6."""
    return StubResponse(
        message="POST /kyc/liveness - accepts image bytes, returns KYCResult with liveness_score."
    )


@router.post("/kyc/match")
async def face_match() -> StubResponse:
    """ArcFace cosine similarity face match. Accepts two image files. Implemented in BP6."""
    return StubResponse(
        message="POST /kyc/match - accepts probe + gallery images, returns KYCResult with similarity_score."
    )
