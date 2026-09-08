# backend/evolution/selection.py
# NSGA-II selection: Pareto front ranking + crowding distance.
# Spec: Phase 7 / backend_spec.md section 9.3

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import List

import numpy as np


@dataclass
class Individual:
    genome_id: str
    evasion_rate: float
    extracted_value: float
    novelty_score: float
    efficiency: float
    pareto_rank: int = 0
    crowding_distance: float = 0.0


def pareto_dominates(a: Individual, b: Individual) -> bool:
    """Return True if a dominates b (better or equal on all objectives, strictly better on at least one)."""
    objectives = ["evasion_rate", "extracted_value", "novelty_score", "efficiency"]
    a_better_any = False
    for obj in objectives:
        a_val = getattr(a, obj)
        b_val = getattr(b, obj)
        if a_val < b_val:
            return False
        if a_val > b_val:
            a_better_any = True
    return a_better_any


def fast_non_dominated_sort(population: List[Individual]) -> List[List[Individual]]:
    """
    NSGA-II fast non-dominated sort.
    Returns a list of Pareto fronts (each front is a list of individuals).
    """
    n = len(population)
    domination_count = [0] * n
    dominated_by: list[list[int]] = [[] for _ in range(n)]
    fronts: list[list[int]] = [[]]

    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            if pareto_dominates(population[i], population[j]):
                dominated_by[i].append(j)
            elif pareto_dominates(population[j], population[i]):
                domination_count[i] += 1

        if domination_count[i] == 0:
            population[i].pareto_rank = 1
            fronts[0].append(i)

    current_front = 0
    while fronts[current_front]:
        next_front: list[int] = []
        for i in fronts[current_front]:
            for j in dominated_by[i]:
                domination_count[j] -= 1
                if domination_count[j] == 0:
                    population[j].pareto_rank = current_front + 2
                    next_front.append(j)
        fronts.append(next_front)
        current_front += 1

    return [[population[i] for i in front] for front in fronts if front]


def crowding_distance_assignment(front: List[Individual]) -> None:
    """Assign crowding distances to individuals in a single Pareto front."""
    n = len(front)
    if n == 0:
        return

    for ind in front:
        ind.crowding_distance = 0.0

    objectives = ["evasion_rate", "extracted_value", "novelty_score", "efficiency"]
    for obj in objectives:
        front.sort(key=lambda x: getattr(x, obj))
        front[0].crowding_distance = float("inf")
        front[-1].crowding_distance = float("inf")

        obj_min = getattr(front[0], obj)
        obj_max = getattr(front[-1], obj)
        obj_range = obj_max - obj_min if obj_max != obj_min else 1.0

        for i in range(1, n - 1):
            front[i].crowding_distance += (
                getattr(front[i + 1], obj) - getattr(front[i - 1], obj)
            ) / obj_range


def tournament_select(
    population: List[Individual],
    k: int = 3,
    rng: random.Random | None = None,
) -> Individual:
    """Tournament selection: pick k candidates, return the best by Pareto rank then crowding distance."""
    if rng is None:
        rng = random.Random()

    candidates = rng.choices(population, k=k)
    # Best = lowest rank, then highest crowding distance on ties
    candidates.sort(key=lambda x: (x.pareto_rank, -x.crowding_distance))
    return candidates[0]


def nsga2_select(
    population: List[Individual],
    n_select: int,
    elite_fraction: float = 0.2,
    rng: random.Random | None = None,
) -> List[Individual]:
    """
    Full NSGA-II selection:
    1. Non-dominated sort -> Pareto fronts
    2. Crowding distance assignment per front
    3. Select n_select individuals preserving elite_fraction elites
    """
    if rng is None:
        rng = random.Random()

    if not population:
        return []

    fronts = fast_non_dominated_sort(population)
    for front in fronts:
        crowding_distance_assignment(front)

    n_elites = max(1, int(n_select * elite_fraction))
    selected: List[Individual] = []

    # Elites: top individuals from first front
    first_front = fronts[0] if fronts else []
    first_front.sort(key=lambda x: -x.crowding_distance)
    selected.extend(first_front[:n_elites])

    # Fill rest via tournament
    while len(selected) < n_select:
        winner = tournament_select(population, k=3, rng=rng)
        selected.append(winner)

    return selected[:n_select]
