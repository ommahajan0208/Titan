# backend/atlas/map_elites.py
# MAP-Elites 120-cell archive (10 velocity bins x 12 graph_footprint bins).
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

import random
from typing import List, Optional

from backend.models.schemas import AtlasCell


def _make_cell(x: int, y: int, rng: random.Random) -> AtlasCell:
    visited = rng.random() > 0.35
    hardened = visited and rng.random() > 0.65
    evasion_rate = rng.uniform(0.1, 0.9) if visited else 0.0
    return AtlasCell(
        cell_id=f"C{x:02d}{y:02d}",
        x=x,
        y=y,
        visited=visited,
        evasion_rate=round(evasion_rate, 4),
        hardened=hardened,
        elite_genome_id=f"G-{rng.randint(1000, 9999):04X}" if visited else None,
    )


class MAPElitesArchive:
    """
    10x12 MAP-Elites grid archive.
    Dimensions:
      x: velocity bin (0-9)
      y: graph_footprint bin (0-11)
    """

    COLS = 10   # velocity bins
    ROWS = 12   # graph_footprint bins

    def __init__(self, seed: int = 42):
        rng = random.Random(seed)
        self._cells: List[AtlasCell] = [
            _make_cell(x, y, rng)
            for y in range(self.ROWS)
            for x in range(self.COLS)
        ]

    def get_cells(self) -> List[AtlasCell]:
        return self._cells

    def get_cell(self, x: int, y: int) -> Optional[AtlasCell]:
        for c in self._cells:
            if c.x == x and c.y == y:
                return c
        return None

    def mark_visited(self, x: int, y: int, evasion_rate: float, genome_id: str) -> AtlasCell:
        cell = self.get_cell(x, y)
        if cell is None:
            raise ValueError(f"Cell ({x},{y}) not found")
        updated = AtlasCell(
            cell_id=cell.cell_id,
            x=x,
            y=y,
            visited=True,
            evasion_rate=round(evasion_rate, 4),
            hardened=cell.hardened,
            elite_genome_id=genome_id,
        )
        idx = next(i for i, c in enumerate(self._cells) if c.x == x and c.y == y)
        self._cells[idx] = updated
        return updated

    def harden_cell(self, x: int, y: int) -> Optional[AtlasCell]:
        cell = self.get_cell(x, y)
        if cell is None:
            return None
        updated = AtlasCell(
            cell_id=cell.cell_id,
            x=x,
            y=y,
            visited=cell.visited,
            evasion_rate=cell.evasion_rate,
            hardened=True,
            elite_genome_id=cell.elite_genome_id,
        )
        idx = next(i for i, c in enumerate(self._cells) if c.x == x and c.y == y)
        self._cells[idx] = updated
        return updated

    @property
    def coverage(self) -> float:
        visited = sum(1 for c in self._cells if c.visited)
        return round(visited / len(self._cells), 4)

    @property
    def hardened_count(self) -> int:
        return sum(1 for c in self._cells if c.hardened)

    def get_summary(self) -> dict:
        visited_cells = [c for c in self._cells if c.visited]
        n_visited = len(visited_cells)
        n_total = len(self._cells)
        n_unvisited = n_total - n_visited

        # BSC lower bound: fraction of visited cells with evasion_rate > 0.5
        # (definitely exploitable blind spots)
        n_blindspots = sum(1 for c in visited_cells if c.evasion_rate > 0.5)
        bsc_lower = round(n_blindspots / max(n_total, 1), 4)

        # BSC upper bound: lower + unvisited fraction (could be exploitable)
        bsc_upper = round((n_blindspots + n_unvisited) / max(n_total, 1), 4)

        mean_evasion = round(
            sum(c.evasion_rate for c in visited_cells) / max(n_visited, 1), 4
        )

        return {
            "total_cells": n_total,
            "visited_cells": n_visited,
            "hardened_cells": self.hardened_count,
            "coverage": self.coverage,
            "mean_evasion_rate": mean_evasion,
            "bsc_lower": bsc_lower,
            "bsc_upper": bsc_upper,
        }


# Module-level singleton
_archive = MAPElitesArchive()


def get_archive() -> MAPElitesArchive:
    return _archive
