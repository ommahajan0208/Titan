# backend/blue/agent.py
# BlueAI adaptive defender: optimises defense policy each generation.
# Spec: Phase 7 / backend_spec.md section 9.9

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from backend.models.schemas import DefensePolicy


@dataclass
class CandidatePolicy:
    """A candidate defense policy with its evaluated utility."""
    policy: DefensePolicy
    realized_utility: float = 0.0


class BlueAI:
    """
    Adaptive Blue-team defender.
    Each generation: samples n_candidates=8 candidate policies from a
    bounded neighborhood of the current policy, evaluates each against
    the last memory_generations of Red behavior, and deploys the best.
    """

    def __init__(
        self,
        seed: int = 42,
        n_candidates: int = 8,
        memory_generations: int = 5,
        trust_region: float = 0.10,
    ):
        self._rng = random.Random(seed)
        self.n_candidates = n_candidates
        self.memory_generations = memory_generations
        self.trust_region = trust_region
        self._policy = DefensePolicy(
            ml_threshold=0.65,
            graph_weight=0.30,
            fpr_target=0.01,
            trust_region=trust_region,
            adaptation_rate=0.002,
        )
        self._adaptation_rate = 0.002
        self._memory: List[Dict[str, Any]] = []

    @property
    def policy(self) -> DefensePolicy:
        return self._policy

    @property
    def adaptation_rate(self) -> float:
        return self._adaptation_rate

    def _perturb_policy(self, base: DefensePolicy) -> DefensePolicy:
        """Sample a candidate policy in the trust region neighborhood."""
        tr = self.trust_region

        def clip(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
            return max(lo, min(hi, v))

        return DefensePolicy(
            ml_threshold=clip(base.ml_threshold + self._rng.uniform(-tr, tr), 0.3, 0.95),
            graph_weight=clip(base.graph_weight + self._rng.uniform(-tr * 0.5, tr * 0.5)),
            fpr_target=clip(base.fpr_target + self._rng.uniform(-tr * 0.1, tr * 0.1), 0.001, 0.05),
            trust_region=base.trust_region,
            adaptation_rate=base.adaptation_rate,
        )

    def _evaluate_candidate(
        self,
        candidate: DefensePolicy,
        red_history: List[Dict[str, Any]],
    ) -> float:
        """
        Compute realized utility of a candidate policy against recent Red behavior.
        Utility = recall - FPR_penalty.
        """
        if not red_history:
            return 0.5

        total_recall = 0.0
        total_fpr = 0.0
        for gen in red_history[-self.memory_generations:]:
            # Lower ml_threshold -> catch more fraud (higher recall) but also more FP
            detection_bonus = max(0.0, (0.65 - candidate.ml_threshold) * 0.3)
            gen_recall = min(1.0, gen.get("recall", 0.9) + detection_bonus)
            gen_fpr = gen.get("false_positive_rate", 0.01) * (1.0 + (0.65 - candidate.ml_threshold) * 0.5)
            total_recall += gen_recall
            total_fpr += gen_fpr

        n = len(red_history[-self.memory_generations:])
        mean_recall = total_recall / n
        mean_fpr = total_fpr / n

        # Utility: recall minus a penalty for exceeding FPR target
        fpr_penalty = max(0.0, (mean_fpr - candidate.fpr_target) * 5.0)
        return round(mean_recall - fpr_penalty, 6)

    def adapt(self, red_history: List[Dict[str, Any]]) -> DefensePolicy:
        """
        Sample n_candidates, evaluate each, deploy the best.
        Returns the new active policy.
        """
        if not red_history:
            return self._policy

        candidates: List[CandidatePolicy] = []
        for _ in range(self.n_candidates):
            p = self._perturb_policy(self._policy)
            u = self._evaluate_candidate(p, red_history)
            candidates.append(CandidatePolicy(policy=p, realized_utility=u))

        best = max(candidates, key=lambda c: c.realized_utility)

        # Measure adaptation rate as distance from current policy
        old_threshold = self._policy.ml_threshold
        self._adaptation_rate = round(abs(best.policy.ml_threshold - old_threshold), 5)

        self._policy = best.policy
        return self._policy

    def get_state(self) -> Dict[str, Any]:
        return {
            "adaptation_rate": self._adaptation_rate,
            "adaptive": True,
            "policy": {
                "ml_threshold": self._policy.ml_threshold,
                "graph_weight": self._policy.graph_weight,
                "fpr_target": self._policy.fpr_target,
                "trust_region": self._policy.trust_region,
                "adaptation_rate": self._policy.adaptation_rate,
            },
        }
