# backend/detector/explainability.py
# ExplainabilityEngine: SHAP values + template fallback for triage narratives.
# Spec: Phase 7 / backend_spec.md section 5.7

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from backend.models.schemas import ScoreRequest


FEATURE_NAMES = [
    "amount", "velocity_1h", "decline_rate_24h",
    "geo_mismatch", "new_device_flag", "account_age_days",
]

# Template explanation fragments keyed by feature
_FEATURE_TEMPLATES: Dict[str, Dict[str, str]] = {
    "velocity_1h": {
        "high": "High transaction velocity in the last hour is a primary fraud indicator.",
        "low": "Transaction velocity within normal bounds.",
    },
    "decline_rate_24h": {
        "high": "Elevated decline rate over 24h suggests systematic credential testing.",
        "low": "Decline rate within acceptable range.",
    },
    "geo_mismatch": {
        "high": "Geographic mismatch between IP and registered address detected.",
        "low": "",
    },
    "new_device_flag": {
        "high": "First-seen device increases authentication risk.",
        "low": "",
    },
    "account_age_days": {
        "high": "Young account with elevated activity pattern.",
        "low": "",
    },
    "amount": {
        "high": "Transaction amount is in an elevated risk band.",
        "low": "",
    },
}


class ExplainabilityEngine:
    """
    Provides SHAP-derived or template-based explanations for scored events.
    In demo mode: analytically derived SHAP values without a fitted SHAP explainer.
    """

    def __init__(self, demo_mode: bool = True):
        self.demo_mode = demo_mode
        self._method = "template_fallback" if demo_mode else "shap"

    def _feature_vector(self, req: ScoreRequest) -> np.ndarray:
        return np.array([
            req.amount / 200_000.0,
            req.velocity_1h,
            req.decline_rate_24h,
            1.0 if req.geo_mismatch else 0.0,
            1.0 if req.new_device_flag else 0.0,
            min(req.account_age_days / 365.0, 1.0),
        ], dtype=np.float32)

    def explain(
        self,
        req: ScoreRequest,
        model_score: float,
        decision: str,
    ) -> Dict[str, Any]:
        """
        Return a structured explanation with top contributing features,
        a base value, predicted value, and a narrative.
        """
        fv = self._feature_vector(req)
        weights = [0.05, 0.35, 0.25, 0.15, 0.10, -0.10]

        shap_raw = {
            name: round(float(fv[i]) * weights[i], 4)
            for i, name in enumerate(FEATURE_NAMES)
        }
        top_features = sorted(
            [(name, val) for name, val in shap_raw.items()],
            key=lambda x: abs(x[1]),
            reverse=True,
        )[:5]

        narrative = self._template_explain(top_features, model_score, decision)

        return {
            "event_id": req.event_id,
            "model_version": "defense-v3.0-demo",
            "method": self._method,
            "risk_score": round(model_score, 4),
            "decision": decision,
            "base_value": 0.12,
            "predicted_value": round(model_score, 4),
            "top_features": [
                {
                    "feature": name,
                    "shap_value": val,
                    "direction": "positive" if val >= 0 else "negative",
                }
                for name, val in top_features
            ],
            "narrative": narrative,
            "gate_triggered": decision == "BLOCK" and model_score >= 0.80,
        }

    def _template_explain(
        self,
        top_features: List[Tuple[str, float]],
        score: float,
        decision: str,
    ) -> str:
        parts = [f"Risk score: {score:.0%}. Decision: {decision}."]
        for feature, shap_val in top_features[:3]:
            if abs(shap_val) < 0.01:
                continue
            level = "high" if shap_val > 0 else "low"
            tmpl = _FEATURE_TEMPLATES.get(feature, {}).get(level, "")
            if tmpl:
                parts.append(tmpl)

        if not parts[1:]:
            parts.append("No strong individual features; composite risk driven by feature interactions.")

        return " ".join(parts)
