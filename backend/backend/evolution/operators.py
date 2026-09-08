# backend/evolution/operators.py
# Guided mutation (detector-pressure-response) + BLX-alpha crossover.
# Spec: Phase 7 / backend_spec.md section 9.4

from __future__ import annotations

import random
from typing import Dict, List

import numpy as np


# ── Detector pressure response: which traits to adjust when each layer catches you ──

DETECTOR_PRESSURE_RESPONSE: Dict[str, Dict[str, float]] = {
    "ml": {
        "velocity": -0.14,
        "timing_spread": +0.12,
        "behavioral_variance": +0.10,
    },
    "graph": {
        "infra_diversity": +0.15,
        "graph_footprint": -0.13,
    },
    "rule": {
        "stealth": +0.15,
        "velocity": -0.05,
    },
    "l0": {
        "stealth": +0.20,
        "timing_spread": +0.10,
    },
}

TRAIT_NAMES = [
    "velocity", "volume", "timing_spread", "infra_diversity",
    "graph_footprint", "persistence", "behavioral_variance",
    "economic_aggression", "economic_efficiency", "stealth",
]


def guided_mutation(
    traits: Dict[str, float],
    composition: Dict[str, float],
    detector_pressure: str,
    sigma: float = 0.09,
    rng: random.Random | None = None,
) -> Dict[str, float]:
    """
    Guided mutation:
      1. Apply detector pressure nudge (directed)
      2. Add undirected Gaussian jitter (sigma)
      3. Clip all traits to [0, 1]
    """
    if rng is None:
        rng = random.Random()

    new_traits = dict(traits)
    pressure = DETECTOR_PRESSURE_RESPONSE.get(detector_pressure, {})

    # Apply pressure nudge
    for trait, delta in pressure.items():
        if trait in new_traits:
            new_traits[trait] = float(np.clip(new_traits[trait] + delta, 0.0, 1.0))

    # Add Gaussian jitter to all traits
    for trait in TRAIT_NAMES:
        if trait in new_traits:
            jitter = rng.gauss(0.0, sigma)
            new_traits[trait] = float(np.clip(new_traits[trait] + jitter, 0.0, 1.0))

    return new_traits


def blx_crossover(
    traits_a: Dict[str, float],
    traits_b: Dict[str, float],
    composition_a: Dict[str, float],
    composition_b: Dict[str, float],
    alpha: float = 0.25,
    rng: random.Random | None = None,
) -> tuple[Dict[str, float], Dict[str, float]]:
    """
    BLX-alpha crossover:
    - Traits: sample from [lo - alpha*spread, hi + alpha*spread]
    - Composition: offspring may inherit families from both parents (50% probability)
    """
    if rng is None:
        rng = random.Random()

    child_traits: Dict[str, float] = {}
    for trait in TRAIT_NAMES:
        a_val = traits_a.get(trait, 0.5)
        b_val = traits_b.get(trait, 0.5)
        lo, hi = min(a_val, b_val), max(a_val, b_val)
        spread = hi - lo
        sampled = rng.uniform(lo - alpha * spread, hi + alpha * spread)
        child_traits[trait] = float(np.clip(sampled, 0.0, 1.0))

    # Composition union: inherit families from both parents
    all_families = set(composition_a.keys()) | set(composition_b.keys())
    child_comp: Dict[str, float] = {}
    for family in all_families:
        a_w = composition_a.get(family, 0.0)
        b_w = composition_b.get(family, 0.0)
        if rng.random() < 0.5:
            child_comp[family] = a_w
        else:
            child_comp[family] = b_w

    # Normalise composition weights to sum to 1
    total = sum(child_comp.values())
    if total > 0:
        child_comp = {k: round(v / total, 4) for k, v in child_comp.items() if v > 0}
    else:
        child_comp = dict(composition_a)

    return child_traits, child_comp
