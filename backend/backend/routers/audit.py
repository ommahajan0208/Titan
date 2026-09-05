# backend/routers/audit.py
# BP1 stub - full implementation in Phase 7.

from fastapi import APIRouter
from backend.models.schemas import StubResponse

router = APIRouter(tags=["audit"])


@router.get("/audit")
async def get_audit_log() -> StubResponse:
    """Immutable governance event trail. Implemented in BP5."""
    return StubResponse(message="GET /audit - returns AuditEvent[] sorted by timestamp desc.")


@router.get("/audit/export")
async def export_audit_csv() -> StubResponse:
    """Export audit log as CSV. Implemented in BP5."""
    return StubResponse(message="GET /audit/export - returns CSV file of all audit events.")
