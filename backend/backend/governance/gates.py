# backend/governance/gates.py
# PromotionGates: 4 gates that a challenger model must pass before promotion.
# Spec: Phase 7 / backend_spec.md section 7.2

from __future__ import annotations

from typing import List

from backend.models.schemas import PromotionGateResult, PromotionResult


class PromotionGates:
    """
    4 promotion gates:
    1. Recall improvement on holdout (>= 0.5% delta)
    2. FPR must not regress beyond 0.2%
    3. No data leakage (provenance AUC near 0.5)
    4. Fidelity score >= 0.80
    """

    def __init__(
        self,
        recall_delta_min: float = 0.005,
        fpr_regression_limit: float = 0.002,
        provenance_auc_tolerance: float = 0.05,
        fidelity_min: float = 0.80,
    ):
        self.recall_delta_min = recall_delta_min
        self.fpr_regression_limit = fpr_regression_limit
        self.provenance_auc_tolerance = provenance_auc_tolerance
        self.fidelity_min = fidelity_min

    def evaluate(
        self,
        challenger_recall: float,
        challenger_fpr: float,
        challenger_fidelity: float,
        provenance_auc: float,
        champion_recall: float,
        champion_fpr: float,
    ) -> PromotionResult:
        """Evaluate all 4 gates and return a PromotionResult."""
        gates: List[PromotionGateResult] = []

        # Gate 1: Recall improvement
        recall_delta = challenger_recall - champion_recall
        gates.append(PromotionGateResult(**{
            "gate_id": "G1",
            "label": f"Recall improvement >= {self.recall_delta_min*100:.1f}%",
            "pass": recall_delta >= self.recall_delta_min,
            "value": round(recall_delta, 4),
            "threshold": self.recall_delta_min,
            "delta": round(recall_delta, 4),
        }))

        # Gate 2: FPR must not regress
        fpr_delta = challenger_fpr - champion_fpr
        gates.append(PromotionGateResult(**{
            "gate_id": "G2",
            "label": f"FPR regression < {self.fpr_regression_limit*100:.2f}%",
            "pass": fpr_delta < self.fpr_regression_limit,
            "value": round(fpr_delta, 5),
            "threshold": self.fpr_regression_limit,
            "delta": round(fpr_delta, 5),
        }))

        # Gate 3: No data leakage (provenance AUC near 0.5)
        provenance_deviation = abs(provenance_auc - 0.5)
        gates.append(PromotionGateResult(**{
            "gate_id": "G3",
            "label": f"|provenance AUC - 0.5| < {self.provenance_auc_tolerance:.2f}",
            "pass": provenance_deviation < self.provenance_auc_tolerance,
            "value": round(provenance_auc, 4),
            "threshold": 0.5 + self.provenance_auc_tolerance,
            "delta": round(provenance_deviation, 4),
        }))

        # Gate 4: Fidelity score
        gates.append(PromotionGateResult(**{
            "gate_id": "G4",
            "label": f"Fidelity score >= {self.fidelity_min:.0%}",
            "pass": challenger_fidelity >= self.fidelity_min,
            "value": round(challenger_fidelity, 4),
            "threshold": self.fidelity_min,
        }))

        all_pass = all(g.pass_ for g in gates)
        return PromotionResult(
            promoted=all_pass,
            gates=gates,
            reason="All 4 promotion gates passed" if all_pass else "One or more promotion gates failed",
        )
