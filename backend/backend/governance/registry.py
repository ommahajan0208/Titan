# backend/governance/registry.py
# ModelRegistry - tracks all model versions, handles promotion + rollback.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from backend.models.schemas import (
    DefensePolicy,
    ModelRecord,
    PromotionGateResult,
    PromotionResult,
)


# ── Promotion gates ─────────────────────────────────────────────────────────

def _gate_recall(recall: float, threshold: float = 0.90) -> PromotionGateResult:
    return PromotionGateResult(**{
        "gate_id": "G1",
        "label": "Recall >= 90%",
        "pass": recall >= threshold,
        "value": recall,
        "threshold": threshold,
    })

def _gate_fpr(fpr: float, budget: float = 0.01) -> PromotionGateResult:
    return PromotionGateResult(**{
        "gate_id": "G2",
        "label": f"FPR <= {budget * 100:.1f}%",
        "pass": fpr <= budget,
        "value": fpr,
        "threshold": budget,
    })

def _gate_fidelity(fidelity_score: float, threshold: float = 0.75) -> PromotionGateResult:
    return PromotionGateResult(**{
        "gate_id": "G3",
        "label": "Fidelity score >= 75%",
        "pass": fidelity_score >= threshold,
        "value": fidelity_score,
        "threshold": threshold,
    })

def _gate_improvement(f1: float, prev_f1: float) -> PromotionGateResult:
    delta = round(f1 - prev_f1, 4)
    return PromotionGateResult(**{
        "gate_id": "G4",
        "label": "F1 improved vs predecessor",
        "pass": delta >= 0.0,
        "value": f1,
        "threshold": prev_f1,
        "delta": delta,
    })


class ModelRegistry:
    """
    Single-process in-memory model registry.
    Tracks versions, gates, and active model.
    """

    def __init__(self):
        # Seed with two pre-existing model versions
        self._records: List[ModelRecord] = [
            ModelRecord(
                model_id="defense-v1.0",
                version="1.0",
                recall=0.872,
                precision=0.881,
                f1=0.876,
                fpr=0.018,
                roc_auc=0.944,
                fidelity_score=0.71,
                created_at=datetime(2026, 8, 1, 10, 0, 0),
                is_active=False,
                training_notes="Initial baseline model",
            ),
            ModelRecord(
                model_id="defense-v2.0",
                version="2.0",
                recall=0.911,
                precision=0.904,
                f1=0.907,
                fpr=0.013,
                roc_auc=0.962,
                fidelity_score=0.78,
                created_at=datetime(2026, 8, 15, 14, 30, 0),
                is_active=False,
                training_notes="Adversarial retraining with velocity features",
            ),
            ModelRecord(
                model_id="defense-v3.0",
                version="3.0",
                recall=0.928,
                precision=0.921,
                f1=0.924,
                fpr=0.010,
                roc_auc=0.978,
                fidelity_score=0.84,
                created_at=datetime(2026, 9, 1, 9, 0, 0),
                is_active=True,
                training_notes="GraphSAGE ensemble + SHAP-guided adversarial retraining",
            ),
        ]

    @property
    def active_model(self) -> Optional[ModelRecord]:
        for r in reversed(self._records):
            if r.is_active:
                return r
        return None

    def get_all(self) -> List[ModelRecord]:
        return list(reversed(self._records))

    def promote(self, recall: float, precision: float, f1: float, fpr: float,
                fidelity_score: float, notes: str = "") -> PromotionResult:
        """Evaluate 4 gates and promote if all pass."""
        prev = self.active_model
        prev_f1 = prev.f1 if prev else 0.0

        gates = [
            _gate_recall(recall),
            _gate_fpr(fpr),
            _gate_fidelity(fidelity_score),
            _gate_improvement(f1, prev_f1),
        ]

        all_pass = all(g.pass_ for g in gates)

        new_model_id = None
        if all_pass:
            # Deactivate current
            for r in self._records:
                r.is_active = False

            version_num = len(self._records) + 1
            new_id = f"defense-v{version_num}.0"
            new_record = ModelRecord(
                model_id=new_id,
                version=f"{version_num}.0",
                recall=recall,
                precision=precision,
                f1=f1,
                fpr=fpr,
                roc_auc=round(0.95 + f1 * 0.04, 4),
                fidelity_score=fidelity_score,
                created_at=datetime.utcnow(),
                is_active=True,
                training_notes=notes or "Promoted via governance gates",
            )
            self._records.append(new_record)
            new_model_id = new_id

        return PromotionResult(
            promoted=all_pass,
            new_model_id=new_model_id,
            gates=gates,
            reason="All 4 gates passed" if all_pass else "One or more gates failed",
        )

    def rollback(self) -> Optional[ModelRecord]:
        """Deactivate current model and restore the previous one."""
        active_idx = None
        for i, r in enumerate(self._records):
            if r.is_active:
                active_idx = i
                break

        if active_idx is None or active_idx == 0:
            return None

        self._records[active_idx].is_active = False
        self._records[active_idx - 1].is_active = True
        return self._records[active_idx - 1]


# Module-level singleton
_registry = ModelRegistry()


def get_registry() -> ModelRegistry:
    return _registry
