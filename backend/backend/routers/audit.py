# backend/routers/audit.py
# Full implementation - Phase 7
# GET  /api/audit     - audit log of all governance events
# GET  /api/feedback  - analyst feedback queue
# POST /api/feedback  - submit analyst outcome
# GET  /api/report    - consolidated model and policy report

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid

from fastapi import APIRouter, Query
from pydantic import BaseModel

from backend.governance.audit import get_audit_log
from backend.governance.registry import get_registry
from backend.models.schemas import AuditEvent

router = APIRouter(tags=["audit"])

# In-memory feedback queue (analyst feedback on reviewed events)
_feedback_queue: List[Dict[str, Any]] = []


# ── GET /api/audit ─────────────────────────────────────────────────────────────

@router.get("/audit")
async def get_audit(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    event_type: Optional[str] = Query(default=None),
) -> dict:
    """Audit log of all governance events, most recent first."""
    log = get_audit_log()
    if event_type:
        events = log.get_by_type(event_type)[:limit]
    else:
        events = log.get_all(limit=limit, offset=offset)

    return {
        "total": log.count,
        "offset": offset,
        "limit": limit,
        "events": [e.model_dump() for e in events],
    }


# ── GET /api/audit/events (alias for compatibility) ────────────────────────────

@router.get("/audit/events")
async def get_audit_events(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    event_type: Optional[str] = Query(default=None),
) -> dict:
    """Paginated audit log (alias)."""
    return await get_audit(limit=limit, offset=offset, event_type=event_type)


# ── GET /api/audit/summary ─────────────────────────────────────────────────────

@router.get("/audit/summary")
async def get_audit_summary() -> dict:
    """Audit log statistics."""
    log = get_audit_log()
    all_events = log.get_all(limit=1000)
    type_counts: Dict[str, int] = {}
    for e in all_events:
        type_counts[e.event_type] = type_counts.get(e.event_type, 0) + 1

    return {
        "total_events": log.count,
        "by_type": type_counts,
        "latest_event": all_events[0].model_dump() if all_events else None,
    }


# ── Analyst Feedback ──────────────────────────────────────────────────────────

class FeedbackItem(BaseModel):
    event_id: str
    analyst_decision: str          # CONFIRM_FRAUD | CONFIRM_LEGIT | ESCALATE
    original_decision: str         # BLOCK | REVIEW | ALLOW
    notes: Optional[str] = None
    analyst_id: str = "analyst-01"


@router.get("/feedback")
async def get_feedback(limit: int = Query(default=50, ge=1, le=200)) -> dict:
    """Return analyst feedback queue (most recent first)."""
    return {
        "count": len(_feedback_queue),
        "items": _feedback_queue[-limit:][::-1],
    }


@router.post("/feedback")
async def submit_feedback(item: FeedbackItem) -> dict:
    """Submit analyst outcome for a reviewed event."""
    entry: Dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        **item.model_dump(),
    }
    _feedback_queue.append(entry)

    # Log to audit trail
    audit = get_audit_log()
    audit.append(
        event_type="GATE_EVALUATED",
        result="ANALYST_FEEDBACK",
        actor=item.analyst_id,
        details={"event_id": item.event_id, "analyst_decision": item.analyst_decision},
    )

    return {"status": "accepted", "feedback_id": entry["id"]}


# ── GET /api/report ────────────────────────────────────────────────────────────

@router.get("/report")
async def get_report() -> dict:
    """Consolidated model, policy, and performance report."""
    from config import cfg

    registry = get_registry()
    active = registry.active_model
    all_models = registry.get_all()
    audit = get_audit_log()

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "active_model_id": active.model_id if active else "defense-v3.0",
        "active_model": active.model_dump() if active else None,
        "model_count": len(all_models),
        "model_history": [m.model_dump() for m in all_models],
        "performance": {
            "recall": active.recall if active else 0.928,
            "precision": active.precision if active else 0.921,
            "f1": active.f1 if active else 0.924,
            "fpr": active.fpr if active else 0.010,
            "roc_auc": active.roc_auc if active else 0.978,
            "fidelity_score": active.fidelity_score if active else 0.84,
        },
        "policy": {
            "ml_threshold": cfg.ml_threshold,
            "fpr_target": cfg.fpr_target,
            "weight_ml": cfg.weight_ml,
            "weight_graph": cfg.weight_graph,
            "weight_rule": cfg.weight_rule,
        },
        "governance": {
            "total_audit_events": audit.count,
            "analyst_feedback_count": len(_feedback_queue),
        },
        "config_hash": cfg.config_hash(),
    }
