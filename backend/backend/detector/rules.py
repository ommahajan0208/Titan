# backend/detector/rules.py
# Deterministic L0 rule engine for payment fraud detection.
# Fires in <1ms - no ML required.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from backend.models.schemas import ScoreRequest


@dataclass
class RuleResult:
    fired: bool
    rule_id: str
    score: float
    reason: str


class RuleEngine:
    """
    L0 deterministic rule bank.
    Each rule returns a RuleResult with a score contribution [0, 1].
    The maximum score across all fired rules is the L0 rule_score.
    """

    def __init__(self, ml_threshold: float = 0.65, fpr_target: float = 0.01):
        self.ml_threshold = ml_threshold
        self.fpr_target = fpr_target

    def _rule_high_velocity(self, req: ScoreRequest) -> RuleResult:
        if req.velocity_1h > 0.85:
            return RuleResult(True, "R-VEL-01", 0.88, "High 1h velocity")
        if req.velocity_1h > 0.65:
            return RuleResult(True, "R-VEL-02", 0.60, "Elevated 1h velocity")
        return RuleResult(False, "R-VEL-01", 0.0, "")

    def _rule_high_decline_rate(self, req: ScoreRequest) -> RuleResult:
        if req.decline_rate_24h > 0.70:
            return RuleResult(True, "R-DEC-01", 0.85, "Very high 24h decline rate")
        if req.decline_rate_24h > 0.50:
            return RuleResult(True, "R-DEC-02", 0.55, "Elevated 24h decline rate")
        return RuleResult(False, "R-DEC-01", 0.0, "")

    def _rule_geo_device_combo(self, req: ScoreRequest) -> RuleResult:
        if req.geo_mismatch and req.new_device_flag:
            return RuleResult(True, "R-GEO-01", 0.92, "Geo mismatch + new device - high risk")
        if req.geo_mismatch:
            return RuleResult(True, "R-GEO-02", 0.45, "Geo mismatch")
        if req.new_device_flag:
            return RuleResult(True, "R-DEV-01", 0.35, "New device flag")
        return RuleResult(False, "R-GEO-01", 0.0, "")

    def _rule_new_account_large_amount(self, req: ScoreRequest) -> RuleResult:
        if req.account_age_days < 7 and req.amount > 50_000:
            return RuleResult(True, "R-ACT-01", 0.90, "New account + large amount")
        if req.account_age_days < 30 and req.amount > 200_000:
            return RuleResult(True, "R-ACT-02", 0.82, "Young account + very large amount")
        return RuleResult(False, "R-ACT-01", 0.0, "")

    def _rule_protocol(self, req: ScoreRequest) -> RuleResult:
        """Hard L0 protocol checks - always fire first."""
        if req.amount <= 0:
            return RuleResult(True, "R-PRO-01", 1.0, "Zero or negative amount")
        if req.amount > 2_000_000:
            return RuleResult(True, "R-PRO-02", 0.95, "Amount exceeds single-transaction limit")
        return RuleResult(False, "R-PRO-01", 0.0, "")

    def score(self, req: ScoreRequest) -> tuple[float, list[str]]:
        """
        Returns (rule_score [0-1], list_of_fired_rule_ids).
        Runs in O(n_rules), typically <1ms.
        """
        results = [
            self._rule_protocol(req),
            self._rule_high_velocity(req),
            self._rule_high_decline_rate(req),
            self._rule_geo_device_combo(req),
            self._rule_new_account_large_amount(req),
        ]

        fired = [r for r in results if r.fired]
        if not fired:
            return 0.0, []

        # Max-fired rule score with additive bonus
        max_score = max(r.score for r in fired)
        bonus = min(len(fired) * 0.05, 0.15)
        final = min(max_score + bonus, 1.0)

        return round(final, 4), [r.rule_id for r in fired]
