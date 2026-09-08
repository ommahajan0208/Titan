# backend/novelty/engine.py
# NoveltyEngine: k-NN archive + DBSCAN emergence detection.
# Spec: Phase 7 / backend_spec.md section 9.5

from __future__ import annotations

from typing import List, Tuple, Dict, Any, Optional
import numpy as np


class NoveltyEngine:
    """
    Maintains a sliding archive of behavior descriptors.
    Scores novelty as mean distance to k nearest neighbors.
    Detects emergent clusters via DBSCAN.
    """

    def __init__(
        self,
        k: int = 5,
        archive_max_size: int = 500,
        eps: float = 0.3,
        min_samples: int = 3,
        seed: int = 42,
    ):
        self.k = k
        self.archive_max_size = archive_max_size
        self.eps = eps
        self.min_samples = min_samples
        self._archive: List[np.ndarray] = []
        self._rng = np.random.default_rng(seed)
        self._previous_cluster_count: int = 0
        self.n_emergent_events: int = 0

    def descriptor_from_traits(self, traits: Dict[str, float]) -> np.ndarray:
        """Extract a 2D behavior descriptor: [velocity, graph_footprint]."""
        return np.array([
            traits.get("velocity", 0.5),
            traits.get("graph_footprint", 0.5),
        ], dtype=np.float32)

    def novelty_score(self, descriptor: np.ndarray) -> float:
        """Compute novelty as mean distance to k nearest archive neighbors."""
        if len(self._archive) < self.k:
            return 1.0  # trivially novel if archive too small

        archive_arr = np.array(self._archive)
        dists = np.linalg.norm(archive_arr - descriptor, axis=1)
        k_nearest = np.sort(dists)[:self.k]
        return float(np.mean(k_nearest))

    def add_to_archive(self, descriptor: np.ndarray) -> None:
        """Add a descriptor to the archive, evict oldest if at capacity."""
        self._archive.append(descriptor)
        if len(self._archive) > self.archive_max_size:
            self._archive.pop(0)

    def detect_emergence(self) -> int:
        """
        Run DBSCAN on current archive. Returns number of new clusters
        compared to previous run (emergent cluster count).
        """
        if len(self._archive) < self.min_samples:
            return 0

        try:
            from sklearn.cluster import DBSCAN
            archive_arr = np.array(self._archive)
            labels = DBSCAN(eps=self.eps, min_samples=self.min_samples).fit_predict(archive_arr)
            n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        except Exception:
            n_clusters = max(0, len(self._archive) // 10)

        emergent = max(0, n_clusters - self._previous_cluster_count)
        self._previous_cluster_count = n_clusters
        self.n_emergent_events += emergent
        return emergent

    def get_state(self) -> Dict[str, Any]:
        return {
            "archive_size": len(self._archive),
            "n_emergent_events": self.n_emergent_events,
            "k": self.k,
            "eps": self.eps,
        }

    @property
    def archive_size(self) -> int:
        return len(self._archive)
