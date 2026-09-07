# backend/governance/audit.py
# Immutable in-memory audit log.
# All governance events are appended here in chronological order.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional, Literal, Any, Dict

from backend.models.schemas import AuditEvent


class AuditLog:
    """
    Append-only in-memory audit log.
    In production this would write to an immutable ledger (WORM storage).
    For the hackathon, in-memory is sufficient.
    """

    def __init__(self):
        # Seed with some historical events
        self._events: List[AuditEvent] = [
            AuditEvent(
                event_id=str(uuid.uuid4()),
                timestamp=datetime(2026, 8, 1, 10, 5, 0),
                event_type="MODEL_PROMOTED",
                actor="system",
                model_id="defense-v1.0",
                result="SUCCESS",
                details={"recall": 0.872, "fpr": 0.018, "gates_passed": 3},
            ),
            AuditEvent(
                event_id=str(uuid.uuid4()),
                timestamp=datetime(2026, 8, 15, 14, 35, 0),
                event_type="RETRAIN_COMPLETED",
                actor="system",
                model_id="defense-v2.0",
                result="SUCCESS",
                details={"trigger": "adversarial_retraining", "f1": 0.907},
            ),
            AuditEvent(
                event_id=str(uuid.uuid4()),
                timestamp=datetime(2026, 8, 15, 14, 40, 0),
                event_type="MODEL_PROMOTED",
                actor="system",
                model_id="defense-v2.0",
                result="SUCCESS",
                details={"recall": 0.911, "fpr": 0.013, "gates_passed": 4},
            ),
            AuditEvent(
                event_id=str(uuid.uuid4()),
                timestamp=datetime(2026, 9, 1, 9, 10, 0),
                event_type="RETRAIN_COMPLETED",
                actor="system",
                model_id="defense-v3.0",
                result="SUCCESS",
                details={"trigger": "nsga2_co_evolution", "f1": 0.924},
            ),
            AuditEvent(
                event_id=str(uuid.uuid4()),
                timestamp=datetime(2026, 9, 1, 9, 15, 0),
                event_type="MODEL_PROMOTED",
                actor="system",
                model_id="defense-v3.0",
                result="SUCCESS",
                details={"recall": 0.928, "fpr": 0.010, "gates_passed": 4},
            ),
        ]

    def append(
        self,
        event_type: str,
        result: str,
        actor: str = "system",
        model_id: Optional[str] = None,
        run_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            event_type=event_type,    # type: ignore[arg-type]
            actor=actor,
            model_id=model_id,
            run_id=run_id,
            result=result,
            details=details or {},
        )
        self._events.append(event)
        return event

    def get_all(self, limit: int = 100, offset: int = 0) -> List[AuditEvent]:
        # Most recent first
        return list(reversed(self._events))[offset:offset + limit]

    def get_by_type(self, event_type: str) -> List[AuditEvent]:
        return [e for e in reversed(self._events) if e.event_type == event_type]

    @property
    def count(self) -> int:
        return len(self._events)


# Module-level singleton
_audit_log = AuditLog()


def get_audit_log() -> AuditLog:
    return _audit_log
