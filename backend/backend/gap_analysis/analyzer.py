# backend/gap_analysis/analyzer.py
# K-Means clustering on evaded scenarios to find blind spots.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

from typing import List, Optional
import numpy as np

from backend.models.schemas import EvasionCluster, GapReport, ScenarioItem


def _scenario_to_vector(s: ScenarioItem) -> np.ndarray:
    return np.array([
        s.ml_score,
        s.graph_score,
        s.rule_score,
        s.fused_score,
        s.sophistication_level / 10.0,
    ], dtype=np.float32)


def analyze_gaps(
    scenarios: List[ScenarioItem],
    n_clusters: int = 3,
    seed: int = 42,
) -> GapReport:
    """
    Run K-Means on evaded scenarios (evaded_detection=True) to identify
    blind-spot clusters. Returns a GapReport with EvasionCluster details.
    """
    evaded = [s for s in scenarios if s.evaded_detection]

    if not evaded:
        return GapReport(
            n_evaded=0,
            n_tested=len(scenarios),
            evasion_rate=0.0,
            clusters=[],
            recommended_counterexamples=0,
            target_features=[],
        )

    n_evaded = len(evaded)
    n_tested = len(scenarios)
    evasion_rate = round(n_evaded / max(n_tested, 1), 4)

    # Feature matrix
    X = np.stack([_scenario_to_vector(s) for s in evaded])
    k = min(n_clusters, len(evaded))

    # Simple k-means implementation (no sklearn dependency for speed)
    rng = np.random.default_rng(seed)
    centroids = X[rng.choice(len(X), k, replace=False)]

    for _ in range(20):
        dists = np.linalg.norm(X[:, None] - centroids[None], axis=2)
        labels = np.argmin(dists, axis=1)
        new_centroids = np.array([
            X[labels == c].mean(axis=0) if (labels == c).any() else centroids[c]
            for c in range(k)
        ])
        if np.allclose(centroids, new_centroids, atol=1e-4):
            break
        centroids = new_centroids

    # Build cluster objects
    feature_names = ["ml_score", "graph_score", "rule_score", "fused_score", "sophistication"]
    clusters: List[EvasionCluster] = []

    for c in range(k):
        mask = labels == c
        cluster_scenarios = [evaded[i] for i in range(len(evaded)) if mask[i]]
        if not cluster_scenarios:
            continue

        centroid = centroids[c]
        weak_feature_idx = int(np.argmin(centroid))
        weak_feature = feature_names[weak_feature_idx]

        families = [s.attack_family for s in cluster_scenarios]
        centroid_family = max(set(families), key=families.count)

        evasion_rate_c = sum(1 for s in cluster_scenarios if s.evaded_detection) / len(cluster_scenarios)

        clusters.append(EvasionCluster(
            cluster_id=c,
            size=len(cluster_scenarios),
            centroid_family=centroid_family,
            weak_feature=weak_feature,
            evasion_rate=round(evasion_rate_c, 4),
            genome_ids=[s.id for s in cluster_scenarios[:5]],
        ))

    # Target features = weak features of top clusters
    target_features = list({cl.weak_feature for cl in clusters})

    return GapReport(
        n_evaded=n_evaded,
        n_tested=n_tested,
        evasion_rate=evasion_rate,
        clusters=clusters,
        recommended_counterexamples=n_evaded * 10,
        target_features=target_features,
    )
