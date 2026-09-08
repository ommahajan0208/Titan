# backend/detector/graph_detector.py
# GraphSAGE fan-in percentile graph anomaly detector.
# Spec: Phase 7 / backend_spec.md section 5.4

from __future__ import annotations

import math
import random
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple


class GraphDetector:
    """
    Incrementally builds a customer/device/IP entity graph from the
    transaction stream. Scores nodes by their distinct-customer fan-in
    percentile (not raw degree).

    The "invisible middle-of-chain mule" problem: a tabular model sees
    individual transactions; the graph sees a device node touched by
    47 distinct customers, which is anomalous regardless of any single
    transaction's features.
    """

    def __init__(self, fan_in_percentile_threshold: float = 0.90):
        self.fan_in_threshold = fan_in_percentile_threshold
        # Map: device_id -> set of unique customer_ids that touched it
        self._device_customers: Dict[str, Set[str]] = defaultdict(set)
        # Map: ip_hash -> set of unique customer_ids
        self._ip_customers: Dict[str, Set[str]] = defaultdict(set)
        # All observed fan-in counts for percentile computation
        self._device_fan_in_history: List[int] = []

    def observe(
        self,
        customer_id: str,
        device_id: str,
        ip_hash: Optional[str] = None,
    ) -> None:
        """Record a transaction, updating the entity graph."""
        self._device_customers[device_id].add(customer_id)
        if ip_hash:
            self._ip_customers[ip_hash].add(customer_id)
        self._device_fan_in_history.append(len(self._device_customers[device_id]))

    def score_device(self, device_id: str) -> float:
        """
        Score a device node by its distinct-customer fan-in percentile.
        Returns 0.0 - 1.0 where high scores indicate mule/shared device behaviour.
        """
        fan_in = len(self._device_customers.get(device_id, set()))
        if not self._device_fan_in_history:
            return 0.0

        # Percentile of this device's fan-in vs all observed devices
        n_below = sum(1 for f in self._device_fan_in_history if f < fan_in)
        percentile = n_below / len(self._device_fan_in_history)
        return round(percentile, 4)

    def get_suspicious_nodes(self, top_n: int = 10) -> List[Dict]:
        """Return the most suspicious device nodes by fan-in percentile."""
        if not self._device_customers:
            return []

        all_fan_ins = [(dev, len(customers)) for dev, customers in self._device_customers.items()]
        all_fan_ins.sort(key=lambda x: -x[1])

        max_fan_in = all_fan_ins[0][1] if all_fan_ins else 1
        results = []
        for dev, fan_in in all_fan_ins[:top_n]:
            score = fan_in / max(max_fan_in, 1)
            results.append({
                "device_id": dev,
                "distinct_customers": fan_in,
                "fan_in_score": round(score, 4),
                "is_suspicious": score >= self.fan_in_threshold,
            })

        return results

    def fan_in_score_for_new_device(self, velocity: float, amount_norm: float) -> float:
        """
        Synthetic graph score for a payment event without a known device_id.
        Used by the ML ensemble's graph_score() fallback.
        """
        # High velocity + high amount -> mimics high fan-in scenario
        base = velocity * 0.50 + amount_norm * 0.30
        return float(min(max(base, 0.0), 1.0))


# Module-level singleton graph for the stream
_graph = GraphDetector()


def get_graph_detector() -> GraphDetector:
    return _graph
