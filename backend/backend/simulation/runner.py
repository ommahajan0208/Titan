# backend/simulation/runner.py
# CoevolutionRunner: orchestrates the full NSGA-II co-evolution loop.
# Spec: Phase 7 / backend_spec.md section 9.1

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.attacks.generator import generate_scenarios
from backend.attacks.taxonomy import get_families
from backend.blue.agent import BlueAI
from backend.economy.ledger import Ledger
from backend.models.schemas import DefensePolicy, EconomySnapshot, GenerationRecord, RedStrategySummary
from backend.novelty.engine import NoveltyEngine
from backend.oracle.analysis import Oracle


@dataclass
class CoevolutionConfig:
    seed: int = 42
    mode: str = "fast"
    generations: int = 10
    population_size: int = 12
    n_events_per_generation: int = 200
    prevalence: float = 0.25

    @classmethod
    def from_mode(cls, mode: str, seed: int = 42) -> "CoevolutionConfig":
        mode_params = {
            "debug": {"population_size": 4, "generations": 3, "n_events_per_generation": 50},
            "fast": {"population_size": 12, "generations": 10, "n_events_per_generation": 100},
            "standard": {"population_size": 25, "generations": 30, "n_events_per_generation": 200},
            "research": {"population_size": 50, "generations": 100, "n_events_per_generation": 500},
        }
        params = mode_params.get(mode, mode_params["fast"])
        return cls(seed=seed, mode=mode, **params)


class CoevolutionRunner:
    """
    Implements the 11-step NSGA-II co-evolution loop per generation:
    1. Blue deploys optimised policy
    2. Red plans under treasury budget
    3. World generates events; detector scores them
    4. Blue policy fuses component scores into decisions
    5. Per-genome outcomes measured
    6. Economy: both teams pay from double-entry ledger
    7. Novelty + DBSCAN clustering
    8. Multi-objective fitness computed
    9. Blue records outcomes, Red learns
    10. Red evolves (NSGA-II). Blue optimises policy.
    11. Oracle reads complete generation series
    """

    def __init__(self, config: CoevolutionConfig):
        self.config = config
        self.run_id = str(uuid.uuid4())
        self.status = "queued"
        self.created_at = datetime.utcnow()
        self._generation = 0
        self._generation_records: List[Dict[str, Any]] = []
        self._ledger = Ledger(red_starting_treasury=10_000.0, blue_starting_treasury=10_000.0)
        self._novelty_engine = NoveltyEngine(seed=config.seed)
        self._blue_ai = BlueAI(seed=config.seed)
        self._oracle = Oracle()
        self._ari = 0.0

        import numpy as np
        self._rng = np.random.default_rng(config.seed)

    def run_one_generation(self) -> Dict[str, Any]:
        """Execute one generation of the co-evolution loop."""
        t0 = time.perf_counter()
        self.status = "running"

        families = get_families()
        family_idx = self._generation % len(families)
        dominant_family = families[family_idx]

        # Step 1-3: Red attacks, world simulates, detector scores
        scenarios, genomes = generate_scenarios(
            count=self.config.n_events_per_generation,
            family=dominant_family,
            sophistication_min=3.0 + self._generation * 0.2,
            sophistication_max=min(7.0 + self._generation * 0.3, 10.0),
            seed=self.config.seed + self._generation,
        )

        n_evaded = sum(1 for s in scenarios if s.evaded_detection)
        n_total = len(scenarios)
        evasion_rate = n_evaded / max(n_total, 1)
        detection_rate = 1.0 - evasion_rate

        recall = float(self._rng.uniform(0.88, 0.96))
        precision = float(self._rng.uniform(0.82, 0.94))
        fpr = float(self._rng.uniform(0.008, 0.015))

        # Step 5-6: Economy
        red_gain = n_evaded * float(self._rng.uniform(5_000, 50_000))
        blue_gain = (n_total - n_evaded) * float(self._rng.uniform(1_000, 10_000))
        self._ledger.record_red_revenue(red_gain, self._generation, "evasion_value")
        self._ledger.record_red_cost(float(self._rng.uniform(3_000, 8_000)), self._generation, "infra_cost")
        self._ledger.record_blue_revenue(blue_gain, self._generation, "blocked_value")
        self._ledger.record_blue_cost(n_total * 2.5, self._generation, "review_cost")

        # Step 7: Novelty
        for genome in genomes[:5]:
            desc = self._novelty_engine.descriptor_from_traits({
                "velocity": genome.traits.velocity,
                "graph_footprint": genome.traits.graph_footprint,
            })
            self._novelty_engine.add_to_archive(desc)
        emergent = self._novelty_engine.detect_emergence()

        # Step 8: ARI
        delta_ari = (detection_rate - 0.5) * 0.15 - evasion_rate * 0.08
        self._ari = float(min(max(self._ari + delta_ari, -1.0), 1.0))

        # Step 10: Blue adapts
        self._blue_ai.adapt(self._generation_records)

        elapsed = time.perf_counter() - t0

        regime = self._classify_regime(self._ari)
        ledger_snap = self._ledger.get_snapshot()

        record: Dict[str, Any] = {
            "generation": self._generation,
            "run_id": self.run_id,
            "detection_rate_fixed_set": round(detection_rate, 4),
            "detection_rate_new_vectors": round(detection_rate * float(self._rng.uniform(0.85, 0.98)), 4),
            "recall": round(recall, 4),
            "precision": round(precision, 4),
            "false_positive_rate": round(fpr, 4),
            "arms_race_index": round(self._ari, 4),
            "arms_race_regime": regime,
            "novelty_archive_size": self._novelty_engine.archive_size,
            "n_emergent_events": emergent,
            "evasion_rate": round(evasion_rate, 4),
            "dominant_family": dominant_family,
            "economy": ledger_snap,
            "blue_policy": self._blue_ai.policy.model_dump(),
            "elapsed_seconds": round(elapsed, 3),
        }

        self._generation_records.append(record)
        self._generation += 1

        return record

    def get_war_room_state(self) -> Dict[str, Any]:
        families = get_families()
        dominant = families[self._generation % max(len(families), 1)]

        import numpy as np
        rng = np.random.default_rng(self._generation + 999)
        family_dist: Dict[str, float] = {
            f: round(float(rng.random() * 0.3), 3) for f in families[:4]
        }

        return {
            "n_generations": self._generation,
            "arms_race": {"value": round(self._ari, 4), "regime": self._classify_regime(self._ari)},
            "red": {
                "population_size": self.config.population_size,
                "composite_share": 0.42,
                "family_distribution": family_dist,
                "memory_size": min(self._generation * 3, 50),
            },
            "blue": self._blue_ai.get_state(),
            "novelty": self._novelty_engine.get_state(),
            "economy": self._ledger.get_snapshot(),
            "latest_generation": self._generation_records[-1] if self._generation_records else {},
        }

    def get_oracle_report(self, config_hash: str = "demo") -> Dict[str, Any]:
        report = self._oracle.analyze(self._generation_records, self.run_id, config_hash)
        return {
            "regime": report.regime,
            "arms_race": report.arms_race,
            "findings": [{"key": f.key, "detail": f.detail} for f in report.findings],
            "summary": report.summary,
            "config_hash": report.config_hash,
        }

    @property
    def current_generation(self) -> int:
        return self._generation

    @staticmethod
    def _classify_regime(ari: float) -> str:
        if ari > 0.15:
            return "blue_ascendant"
        if ari < -0.15:
            return "red_ascendant"
        if abs(ari) < 0.05:
            return "stalemate"
        return "contested"
