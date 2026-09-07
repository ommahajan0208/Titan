# backend/routers/audit.py
# Full implementation - Phase 7
# GET /api/audit/events - paginated audit log

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query

from backend.governance.audit import get_audit_log
from backend.models.schemas import AuditEvent

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/events", response_model=List[AuditEvent])
async def get_events(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    event_type: str = Query(default=None),
) -> List[AuditEvent]:
    """Return paginated audit log events, most recent first."""
    log = get_audit_log()
    if event_type:
        return log.get_by_type(event_type)[:limit]
    return log.get_all(limit=limit, offset=offset)


@router.get("/summary")
async def get_audit_summary() -> dict:
    """Return audit log statistics."""
    log = get_audit_log()
    all_events = log.get_all(limit=1000)
    type_counts: dict = {}
    for e in all_events:
        type_counts[e.event_type] = type_counts.get(e.event_type, 0) + 1

    return {
        "total_events": log.count,
        "by_type": type_counts,
        "latest_event": all_events[0].model_dump() if all_events else None,
    }
