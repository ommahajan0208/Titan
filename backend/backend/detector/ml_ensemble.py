# backend/detector/ml_ensemble.py
# XGBoost + IsolationForest + LightGBM ensemble scorer.
# Uses scikit-learn compatible API.
# In demo mode: returns calibrated mock scores derived from input features.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations

import time
from typing import Optional, Dict, Any
import numpy as np

from backend.models.schemas import ScoreRequest


def _feature_vector(req: ScoreRequest) -> np.ndarray:
    """Extract a fixed-length feature vector from ScoreRequest."""
    return np.array([
        req.amount / 200_000.0,       # normalised amount
        req.velocity_1h,
        req.decline_rate_24h,
        1.0 if req.geo_mismatch else 0.0,
        1.0 if req.new_device_flag else 0.0,
        min(req.account_age_days / 365.0, 1.0),
    ], dtype=np.float32)


class MLEnsemble:
    """
    Fused ensemble scorer: XGBoost * 0.5 + IsolationForest * 0.3 + LightGBM * 0.2
    In Phase 7 (hackathon mode), we run calibrated mock scoring that reproduces
    realistic score distributions without a trained model file.

    For real training:
      ensemble = MLEnsemble()
      ensemble.fit(X_train, y_train)
    """

    def __init__(self, seed: int = 42, demo_mode: bool = True):
        self.seed = seed
        self.demo_mode = demo_mode
        self._rng = np.random.default_rng(seed)
        self._is_fitted = False

    # ------------------------------------------------------------------ #
    # Mock scoring (demo mode - no file dependencies)                      #
    # ------------------------------------------------------------------ #

    def _mock_xgb_score(self, fv: np.ndarray) -> float:
        """Calibrated XGBoost-like score from feature vector."""
        base = (
            fv[1] * 0.35 +          # velocity_1h
            fv[2] * 0.25 +          # decline_rate_24h
            fv[3] * 0.15 +          # geo_mismatch
            fv[4] * 0.10 +          # new_device_flag
            (1 - fv[5]) * 0.10 +    # inverse account_age
            fv[0] * 0.05            # amount
        )
        noise = float(self._rng.normal(0.0, 0.04))
        return float(np.clip(base + noise, 0.0, 1.0))

    def _mock_isoforest_score(self, fv: np.ndarray) -> float:
        """IsolationForest anomaly score (higher = more anomalous)."""
        l2 = float(np.linalg.norm(fv - np.array([0.05, 0.1, 0.05, 0, 0, 0.8])))
        noise = float(self._rng.normal(0.0, 0.05))
        return float(np.clip(l2 / 2.0 + noise, 0.0, 1.0))

    def _mock_lgbm_score(self, fv: np.ndarray) -> float:
        """LightGBM-like gradient boosted score."""
        base = (
            fv[1] * 0.30 +
            fv[2] * 0.20 +
            fv[3] * 0.20 +
            fv[4] * 0.12 +
            fv[0] * 0.08 +
            (1 - fv[5]) * 0.10
        )
        noise = float(self._rng.normal(0.0, 0.03))
        return float(np.clip(base + noise, 0.0, 1.0))

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def score(self, req: ScoreRequest) -> Dict[str, float]:
        """
        Returns dict with keys: ml_score, xgb, iso, lgbm, elapsed_ms.
        Always returns in <50ms in demo mode.
        """
        t0 = time.perf_counter()
        fv = _feature_vector(req)

        xgb = self._mock_xgb_score(fv)
        iso = self._mock_isoforest_score(fv)
        lgb = self._mock_lgbm_score(fv)

        # Weighted fusion
        ml_score = xgb * 0.50 + iso * 0.30 + lgb * 0.20

        elapsed = (time.perf_counter() - t0) * 1000

        return {
            "ml_score": round(ml_score, 4),
            "xgb": round(xgb, 4),
            "iso": round(iso, 4),
            "lgbm": round(lgb, 4),
            "elapsed_ms": round(elapsed, 3),
        }

    def graph_score(self, req: ScoreRequest) -> float:
        """
        Simplified GraphSAGE fan-in percentile score.
        Returns a value in [0, 1] based on velocity and amount features.
        """
        fv = _feature_vector(req)
        # High fan-in pattern: high velocity + high amount => higher graph score
        g = fv[1] * 0.50 + fv[0] * 0.30 + fv[3] * 0.20
        noise = float(self._rng.normal(0.0, 0.04))
        return float(np.clip(g + noise, 0.0, 1.0))

    def get_shap_values(self, req: ScoreRequest) -> Dict[str, float]:
        """
        Returns top SHAP feature attributions.
        In demo mode: analytically derived from feature importances.
        """
        fv = _feature_vector(req)
        feature_names = [
            "amount", "velocity_1h", "decline_rate_24h",
            "geo_mismatch", "new_device_flag", "account_age_days"
        ]
        # Importances mimic typical XGBoost tree-SHAP for this feature set
        weights = [0.05, 0.35, 0.25, 0.15, 0.10, -0.10]
        shap_raw = {n: round(fv[i] * weights[i], 4) for i, n in enumerate(feature_names)}
        return shap_raw
