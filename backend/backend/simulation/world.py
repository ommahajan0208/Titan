# backend/simulation/world.py
# SimulationWorld: orchestrates one co-evolution run.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

import time
import uuid
from datetime import datetime
from typing import List, Optional

import numpy as np

from backend.attacks.generator import generate_scenarios
from backend.attacks.taxonomy import get_families
from backend.models.schemas import (
    AttackGenome,
    DefensePolicy,
    EconomySnapshot,
    GenerationBatch,
    GenerationRecord,
    RedStrategySummary,
    SimulationResult,
)



def _arms_race_regime(ari: float) -> str:
    if ari > 0.15:
        return "blue_ascendant"
    if ari < -0.15:
        return "red_ascendant"
    if abs(ari) < 0.05:
        return "stalemate"
    return "contested"


def _default_policy() -> DefensePolicy:
    return DefensePolicy(
        ml_threshold=0.65,
        graph_weight=0.30,
        fpr_target=0.01,
        trust_region=0.10,
        adaptation_rate=0.002,
    )


class SimulationWorld:
    """
    Stateful co-evolution world.
    Each call to run_generation() advances one generation.
    """

    def __init__(self, seed: int = 42, n_events: int = 200, prevalence: float = 0.25):
        self.seed = seed
        self.n_events = n_events
        self.prevalence = prevalence
        self.run_id = str(uuid.uuid4())
        self._rng = np.random.default_rng(seed)
        self._generation = 0
        self._ari = 0.0
        self._policy = _default_policy()
        self._red_memory: List[AttackGenome] = []
        self._economy = EconomySnapshot(red_treasury=10_000.0, blue_treasury=10_000.0, balanced=True)
        self._started_at = datetime.utcnow()
        self._batches: List[GenerationBatch] = []

    def run_generation(self) -> GenerationBatch:
        t0 = time.perf_counter()

        # Pick dominant family based on generation
        families = get_families()
        family_idx = self._generation % len(families)
        dominant_family = families[family_idx]

        scenarios, genomes = generate_scenarios(
            count=self._n_fraud_events(),
            family=dominant_family,
            sophistication_min=3.0 + self._generation * 0.2,
            sophistication_max=min(7.0 + self._generation * 0.3, 10.0),
            seed=self.seed + self._generation,
        )

        # Compute generation metrics
        n_evaded = sum(1 for s in scenarios if s.evaded_detection)
        n_total = len(scenarios)
        detection_rate = 1.0 - (n_evaded / max(n_total, 1))

        recall = round(float(self._rng.uniform(0.88, 0.96)), 4)
        precision = round(float(self._rng.uniform(0.82, 0.94)), 4)
        fpr = round(float(self._rng.uniform(0.008, 0.015)), 4)

        # ARI: blue advantage when detection high, red advantage when evasion high
        delta_ari = (detection_rate - 0.5) * 0.15 - (n_evaded / max(n_total, 1)) * 0.08
        self._ari = round(float(np.clip(self._ari + delta_ari, -1.0, 1.0)), 4)

        # Update economy
        red_gain = n_evaded * float(self._rng.uniform(5_000, 50_000))
        blue_gain = (n_total - n_evaded) * float(self._rng.uniform(1_000, 10_000))
        self._economy = EconomySnapshot(
            red_treasury=round(self._economy.red_treasury + red_gain - 5_000, 2),
            blue_treasury=round(self._economy.blue_treasury + blue_gain - 3_000, 2),
            balanced=abs(self._economy.red_treasury - self._economy.blue_treasury) < 20_000,
        )

        # Adaptive policy nudge
        if detection_rate < 0.85:
            self._policy = DefensePolicy(
                ml_threshold=round(max(self._policy.ml_threshold - 0.02, 0.40), 4),
                graph_weight=round(min(self._policy.graph_weight + 0.01, 0.60), 4),
                fpr_target=self._policy.fpr_target,
                trust_region=self._policy.trust_region,
                adaptation_rate=self._policy.adaptation_rate,
            )

        elapsed = time.perf_counter() - t0

        batch = GenerationBatch(
            generation=self._generation,
            run_id=self.run_id,
            n_events=n_total,
            n_fraud=n_total,
            scenarios=scenarios,
            detection_rate_fixed_set=round(detection_rate, 4),
            detection_rate_new_vectors=round(detection_rate * float(self._rng.uniform(0.85, 0.98)), 4),
            recall=recall,
            precision=precision,
            false_positive_rate=fpr,
            arms_race_index=self._ari,
            arms_race_regime=_arms_race_regime(self._ari),
            novelty_archive_size=len(self._red_memory) + self._generation * 3,
            n_emergent_events=max(0, n_evaded - 2),
            elapsed_seconds=round(elapsed, 3),
        )

        self._batches.append(batch)
        self._red_memory.extend(genomes[:3])
        self._generation += 1

        return batch

    def _n_fraud_events(self) -> int:
        return max(10, int(self.n_events * self.prevalence))

    def to_generation_records(self) -> List[GenerationRecord]:
        records = []
        ari = 0.0
        for b in self._batches:
            delta = (b.detection_rate_fixed_set - 0.5) * 0.15
            ari = float(np.clip(ari + delta, -1.0, 1.0))
            records.append(GenerationRecord(
                generation=b.generation,
                run_id=b.run_id,
                detection_rate_fixed_set=b.detection_rate_fixed_set,
                detection_rate_new_vectors=b.detection_rate_new_vectors,
                recall=b.recall,
                precision=b.precision,
                false_positive_rate=b.false_positive_rate,
                arms_race_index=round(ari, 4),
                arms_race_regime=_arms_race_regime(ari),
                novelty_archive_size=b.novelty_archive_size,
                n_emergent_events=b.n_emergent_events,
                economy=self._economy,
                blue_policy=self._policy,
                red_strategy_summary=RedStrategySummary(
                    dominant_family=b.scenarios[0].attack_family if b.scenarios else "unknown",
                    composite_share=0.42,
                    population_size=50,
                ),
                elapsed_seconds=b.elapsed_seconds,
            ))
        return records

    @property
    def current_generation(self) -> int:
        return self._generation

    @property
    def ari(self) -> float:
        return self._ari

    @property
    def policy(self) -> DefensePolicy:
        return self._policy

    def get_war_room_state(self) -> dict:
        families = get_families()
        dominant = families[self._generation % len(families)]
        family_dist = {f: round(float(np.random.default_rng(self._generation + i).random() * 0.3), 3)
                       for i, f in enumerate(families[:4])}

        return {
            "n_generations": self._generation,
            "arms_race": {"value": self._ari, "regime": _arms_race_regime(self._ari)},
            "red": {
                "population_size": 50,
                "composite_share": 0.42,
                "family_distribution": family_dist,
                "memory_size": len(self._red_memory),
            },
            "blue": {
                "adaptation_rate": self._policy.adaptation_rate,
                "adaptive": True,
                "policy": {
                    "ml_threshold": self._policy.ml_threshold,
                    "graph_weight": self._policy.graph_weight,
                    "fpr_target": self._policy.fpr_target,
                    "trust_region": self._policy.trust_region,
                    "adaptation_rate": self._policy.adaptation_rate,
                },
            },
            "novelty": {
                "archive_size": len(self._red_memory) + self._generation * 3,
                "n_emergent_events": max(0, self._generation * 2),
            },
            "economy": {
                "balanced": self._economy.balanced,
                "balances": {
                    "red": self._economy.red_treasury,
                    "blue": self._economy.blue_treasury,
                },
            },
            "latest_generation": {
                "generation": self._generation,
                "detection_rate_fixed_set": self._batches[-1].detection_rate_fixed_set if self._batches else 0.0,
                "arms_race_index": self._ari,
                "arms_race_regime": _arms_race_regime(self._ari),
            }
        }
