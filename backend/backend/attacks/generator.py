# backend/attacks/generator.py
# Parametric attack scenario generator.
# Given a genome (trait vector) and attack vector, generates a ScenarioItem.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

import random
import uuid
from typing import List, Optional

from backend.attacks.taxonomy import TAXONOMY, get_families
from backend.models.schemas import AttackGenome, GenomeTraits, ScenarioItem


def _make_rng(seed: Optional[int]) -> random.Random:
    return random.Random(seed)


def _genome_from_traits(rng: random.Random, family: Optional[str] = None) -> AttackGenome:
    """Generate a random AttackGenome biased toward the given family."""
    families = get_families()
    if family and family not in families:
        family = None

    def r() -> float:
        return round(rng.random(), 4)

    traits = GenomeTraits(
        velocity=r(), volume=r(), timing_spread=r(),
        infra_diversity=r(), graph_footprint=r(), persistence=r(),
        behavioral_variance=r(), economic_aggression=r(),
        economic_efficiency=r(), stealth=r(),
    )

    # Build composition biased toward selected family
    composition: dict[str, float] = {}
    for f in families:
        if f == family:
            composition[f] = rng.uniform(0.4, 0.7)
        else:
            composition[f] = rng.uniform(0.0, 0.15)
    total = sum(composition.values())
    composition = {k: round(v / total, 4) for k, v in composition.items()}

    return AttackGenome(
        genome_id=f"G-{uuid.uuid4().hex[:8].upper()}",
        generation=0,
        traits=traits,
        composition=composition,
        parent_ids=[],
        origin="immigrant",
        operator_log=[f"Generated for family={family or 'all'}"],
        infra_cost=round(rng.uniform(50.0, 5000.0), 2),
    )


def _compute_fused_score(
    amount: float,
    velocity_1h: float,
    decline_rate_24h: float,
    geo_mismatch: bool,
    new_device_flag: bool,
    sophistication: float,
    genome: AttackGenome,
) -> tuple[float, float, float, float]:
    """Return (ml_score, graph_score, rule_score, fused_score)."""
    # ML score: weighted trait contribution
    traits = genome.traits
    ml = (
        traits.velocity * 0.20 +
        traits.graph_footprint * 0.18 +
        traits.stealth * (-0.10) +          # high stealth suppresses ML
        traits.behavioral_variance * 0.12 +
        velocity_1h * 0.25 +
        decline_rate_24h * 0.15 +
        (0.08 if geo_mismatch else 0.0) +
        (0.05 if new_device_flag else 0.0)
    )
    ml = min(max(ml, 0.0), 1.0)

    # Graph score: driven by graph_footprint trait
    graph = min(traits.graph_footprint * 1.3 + velocity_1h * 0.2, 1.0)

    # Rule score: deterministic protocol checks
    rule = 0.0
    if velocity_1h > 0.8:
        rule = max(rule, 0.85)
    if decline_rate_24h > 0.6:
        rule = max(rule, 0.75)
    if geo_mismatch and new_device_flag:
        rule = max(rule, 0.90)

    # Fused: weighted ensemble
    fused = ml * 0.50 + graph * 0.30 + rule * 0.20

    # Sophistication suppresses detection slightly (evasion effect)
    suppression = (sophistication / 10.0) * traits.stealth * 0.25
    fused = max(fused - suppression, 0.0)

    return (
        round(ml, 4),
        round(graph, 4),
        round(rule, 4),
        round(min(fused, 1.0), 4),
    )


def generate_scenarios(
    count: int = 25,
    family: Optional[str] = None,
    sophistication_min: float = 0.0,
    sophistication_max: float = 10.0,
    mutation_strength: float = 0.6,
    seed: Optional[int] = None,
) -> tuple[list[ScenarioItem], list[AttackGenome]]:
    """
    Generate 'count' synthetic attack scenarios with associated genomes.
    Returns (scenarios, genomes).
    """
    rng = _make_rng(seed)
    scenarios: list[ScenarioItem] = []
    genomes: list[AttackGenome] = []

    for _ in range(count):
        genome = _genome_from_traits(rng, family)
        genomes.append(genome)

        # Pick a random attack vector from the taxonomy filtered by family
        candidates = [v for v in TAXONOMY if (not family or v.family == family)]
        if not candidates:
            candidates = TAXONOMY
        vector = rng.choice(candidates)

        # Sophistication within bounds
        sophistication = rng.uniform(sophistication_min, sophistication_max)

        # Feature values
        amount = rng.lognormvariate(10.5, 1.2)         # lognormal INR
        velocity_1h = rng.random()
        decline_rate = rng.random() * 0.5
        geo_mismatch = rng.random() > 0.7
        new_device = rng.random() > 0.75

        ml, graph, rule, fused = _compute_fused_score(
            amount, velocity_1h, decline_rate, geo_mismatch, new_device,
            sophistication, genome,
        )

        # Decision thresholds (from config defaults)
        ml_threshold = 0.65
        review_threshold = 0.40

        if fused >= ml_threshold:
            decision = "BLOCK"
        elif fused >= review_threshold:
            decision = "REVIEW"
        else:
            decision = "ALLOW"

        evaded = decision == "ALLOW"

        mutation_log = genome.operator_log.copy()
        if mutation_strength > 0.5:
            mutation_log.append(f"high-strength mutation applied ({mutation_strength:.2f})")

        scenarios.append(ScenarioItem(
            id=f"SCN-{uuid.uuid4().hex[:10].upper()}",
            attack_family=vector.family,
            attack_vector_id=vector.id,
            sophistication_level=round(sophistication, 2),
            is_fraud=True,
            ml_score=ml,
            graph_score=graph,
            rule_score=rule,
            fused_score=fused,
            decision=decision,
            evaded_detection=evaded,
            mutation_log=mutation_log,
        ))

    return scenarios, genomes
