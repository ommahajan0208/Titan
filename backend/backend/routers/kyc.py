# backend/routers/kyc.py
# Full implementation - Phase 7
# POST /api/kyc/verify - liveness + face match (mock ArcFace in demo mode)

from __future__ import annotations

import random
import time
import uuid

from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel

from backend.models.schemas import KYCResult

router = APIRouter(prefix="/kyc", tags=["kyc"])


class KYCRequest(BaseModel):
    selfie_b64: str = ""
    document_b64: str = ""
    threshold: float = 0.85


@router.post("/verify", response_model=KYCResult)
async def verify_kyc(
    selfie: UploadFile = File(default=None),
    document: UploadFile = File(default=None),
    threshold: float = Form(default=0.85),
) -> KYCResult:
    """
    Liveness detection + ArcFace face match.
    In demo mode: returns calibrated mock scores.
    Real implementation would run ArcFace ONNX model on the uploaded images.
    """
    t0 = time.perf_counter()
    request_id = str(uuid.uuid4())

    # Demo mode: calibrated realistic scores
    rng = random.Random(hash(request_id) % 10000)

    liveness_score = round(rng.uniform(0.72, 0.98), 4)
    liveness_pass = liveness_score >= threshold

    similarity_score = None
    face_match_pass = None

    if document is not None or selfie is not None:
        # Simulate face comparison
        similarity_score = round(rng.uniform(0.78, 0.97), 4)
        face_match_pass = similarity_score >= threshold

    if not liveness_pass:
        decision = "FAIL"
    elif face_match_pass is False:
        decision = "REVIEW"
    elif face_match_pass is True and liveness_pass:
        decision = "PASS"
    else:
        decision = "PASS" if liveness_pass else "REVIEW"

    elapsed = (time.perf_counter() - t0) * 1000

    return KYCResult(
        request_id=request_id,
        liveness_score=liveness_score,
        liveness_pass=liveness_pass,
        similarity_score=similarity_score,
        face_match_pass=face_match_pass,
        decision=decision,
        elapsed_ms=round(elapsed, 3),
    )


@router.post("/liveness")
async def check_liveness(selfie: UploadFile = File(default=None)) -> dict:
    """Passive liveness check only (no document required)."""
    rng = random.Random(time.time_ns() % 10000)
    score = round(rng.uniform(0.75, 0.99), 4)
    return {
        "liveness_score": score,
        "liveness_pass": score >= 0.85,
        "method": "ArcFace passive liveness (demo mode)",
        "model": "arcface-r100-demo",
    }
