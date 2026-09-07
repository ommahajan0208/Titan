# backend/routers/stream.py
# GET /api/stream/transactions - returns pre-scored payment stream
# POST /api/score - single-event scoring with server_compute_ms
# Spec: Phase 7 / backend_spec.md + implementation_plan Phase 7

from __future__ import annotations

import random
import time
import uuid
from typing import List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from backend.detector.rules import RuleEngine
from backend.detector.ml_ensemble import MLEnsemble
from backend.models.schemas import ScoreRequest

router = APIRouter(prefix="/stream", tags=["stream"])

# ── Scoring components (module-level, warm after first import) ────────────
_rules = RuleEngine()
_ensemble = MLEnsemble(seed=42, demo_mode=True)

# ── 36-vector attack family shortlist for stream generation ───────────────
_FAMILIES = [
    "synthetic_identity", "mule_network", "credential_theft",
    "account_takeover", "velocity_timing", "social_engineering",
    "card_cnp", "emergent_adaptive",
]

_RAILS = ["UPI_P2M", "IMPS", "NEFT", "RTP_FEDNOW", "SEPA_INST", "CARD_CNP"]
_CHANNELS = ["mobile", "web", "agentic", "IVR"]
_LAYERS = ["L0", "L1", "L2", "L3"]

_VECTOR_MAP = {
    "synthetic_identity": ["SYN-001", "SYN-002", "SYN-003", "SYN-004"],
    "mule_network": ["MUL-001", "MUL-002", "MUL-003", "MUL-004"],
    "credential_theft": ["CRD-001", "CRD-002", "CRD-003", "CRD-004"],
    "account_takeover": ["ATO-001", "ATO-002", "ATO-003", "ATO-004"],
    "velocity_timing": ["VEL-001", "VEL-002", "VEL-003"],
    "social_engineering": ["SOC-001", "SOC-002", "SOC-003"],
    "card_cnp": ["CNP-001", "CNP-002", "CNP-003"],
    "emergent_adaptive": ["EMG-001", "EMG-002", "EMG-003", "EMG-004", "EMG-005", "EMG-006"],
}


def _fmt_time(hour: int, minute: int, second: int) -> str:
    return f"{hour:02d}:{minute:02d}:{second:02d}"


def _lognormal_inr(rng: random.Random) -> float:
    """Realistic INR payment amount (mostly 500-50k, tail to 2L)."""
    import math
    raw = math.exp(rng.gauss(9.5, 1.1))  # lognormal
    return round(min(max(raw, 10.0), 200_000.0), 2)


def _score_event(amount: float, velocity_1h: float, decline_rate: float,
                 geo_mismatch: bool, new_device: bool) -> tuple[float, float, float, float, Optional[str]]:
    """Returns (ml, graph, rule, fused, layer_fired)."""
    req = ScoreRequest(
        event_id=str(uuid.uuid4()),
        amount=amount,
        velocity_1h=velocity_1h,
        decline_rate_24h=decline_rate,
        geo_mismatch=geo_mismatch,
        new_device_flag=new_device,
        account_age_days=int(velocity_1h * 365),
    )

    rule_score, fired_rules = _rules.score(req)
    scores = _ensemble.score(req)
    graph_score = _ensemble.graph_score(req)

    ml = scores["ml_score"]
    fused = ml * 0.50 + graph_score * 0.30 + rule_score * 0.20

    layer: Optional[str] = None
    if rule_score > 0.7:
        layer = "L0"
    elif ml > 0.7:
        layer = "L1"
    elif graph_score > 0.7:
        layer = "L2"
    elif fused > 0.45:
        layer = "L3"

    return (
        round(ml, 4),
        round(graph_score, 4),
        round(rule_score, 4),
        round(min(fused, 1.0), 4),
        layer,
    )


def _build_stream(n: int = 500, seed: int = 42) -> List[dict]:
    """
    Generate n pre-scored stream rows.
    - 75% legitimate, 25% fraud (25x oversampling vs ~1% production)
    - Deliberate false negatives (~18 rows): APPROVE on is_fraud=True
    - Deliberate false positives (~15 rows): BLOCK/ALERT on is_fraud=False
    - Timestamps cycle through 08:00-22:00 IST working day
    """
    rng = random.Random(seed)
    rows = []

    # Pre-assign FN and FP slots
    n_fraud = int(n * 0.25)
    n_legit = n - n_fraud

    # Build slot list
    is_fraud_list = [True] * n_fraud + [False] * n_legit
    rng.shuffle(is_fraud_list)

    # Deliberate FN indices (APPROVE on fraud) - ~18 of n_fraud
    fn_slots = set(rng.sample([i for i, f in enumerate(is_fraud_list) if f], min(18, n_fraud)))
    # Deliberate FP indices (BLOCK on legit) - ~15 of n_legit
    fp_slots = set(rng.sample([i for i, f in enumerate(is_fraud_list) if not f], min(15, n_legit)))

    for idx in range(n):
        is_fraud = is_fraud_list[idx]

        # Time in working day (08:00-22:00, 50400 seconds window)
        secs = 8 * 3600 + int((idx / n) * 14 * 3600) + rng.randint(0, 59)
        h, rem = divmod(secs, 3600)
        m, s = divmod(rem, 60)
        timestamp = _fmt_time(h % 24, m, s)

        rail = rng.choice(_RAILS)
        channel = rng.choice(_CHANNELS)

        # Feature values
        if is_fraud:
            velocity_1h = rng.uniform(0.55, 0.99)
            decline_rate = rng.uniform(0.40, 0.90)
            geo_mismatch = rng.random() > 0.3
            new_device = rng.random() > 0.4
        else:
            velocity_1h = rng.uniform(0.0, 0.45)
            decline_rate = rng.uniform(0.0, 0.30)
            geo_mismatch = rng.random() > 0.85
            new_device = rng.random() > 0.85

        amount = _lognormal_inr(rng)

        _, _, _, fused, layer = _score_event(
            amount, velocity_1h, decline_rate, geo_mismatch, new_device
        )

        # Deliberate overrides for FN/FP
        if is_fraud and idx in fn_slots:
            # Force false negative: suppress score
            fused = rng.uniform(0.15, 0.38)
            layer = None
        elif not is_fraud and idx in fp_slots:
            # Force false positive: inflate score
            fused = rng.uniform(0.68, 0.90)
            if layer is None:
                layer = "L1"

        # Decision
        if fused >= 0.65:
            decision = "BLOCK"
        elif fused >= 0.40:
            decision = "ALERT"
        else:
            decision = "APPROVE"

        if decision == "APPROVE":
            layer = None

        attack_family = rng.choice(_FAMILIES) if is_fraud else None
        attack_vector_id = rng.choice(_VECTOR_MAP[attack_family]) if attack_family else None

        payer_suffix = uuid.uuid4().hex[:4].upper()
        txn_prefix = uuid.uuid4().hex[:6].upper()

        rows.append({
            "txn_id": f"TXN-{txn_prefix}",
            "timestamp": timestamp,
            "payer_id": f"PAY-{payer_suffix}",
            "amount": amount,
            "rail": rail,
            "channel": channel,
            "attack_family": attack_family,
            "attack_vector_id": attack_vector_id,
            "score": round(fused, 4),
            "decision": decision,
            "layer_fired": layer,
            "is_fraud": is_fraud,
        })

    return rows


# Pre-build the 500-row stream at import time (fast, no ML loading)
_STREAM_CACHE: List[dict] = _build_stream(500)


@router.get("/transactions")
async def get_stream_transactions(
    limit: int = Query(default=500, ge=1, le=500),
) -> List[dict]:
    """
    GET /api/stream/transactions?limit=500
    Returns pre-scored payment rows for the live payment stream.
    - 25% fraud, 75% legitimate (oversampled for demo)
    - Includes deliberate FN and FP rows for intellectual honesty
    """
    return _STREAM_CACHE[:limit]


# ── Single-event POST /api/score ──────────────────────────────────────────

class LiveScoreRequest(BaseModel):
    event_id: Optional[str] = None
    amount: float = 1000.0
    velocity_1h: float = 0.0
    decline_rate_24h: float = 0.0
    geo_mismatch: bool = False
    new_device_flag: bool = False
    account_age_days: int = 365


class LiveScoreResponse(BaseModel):
    event_id: str
    ml_score: float
    graph_score: float
    rule_score: float
    fused_score: float
    decision: str
    layer_fired: Optional[str]
    shap_values: dict
    server_compute_ms: float
    feature_completeness: float


@router.post("/score", response_model=LiveScoreResponse)
async def score_single_event(req: LiveScoreRequest) -> LiveScoreResponse:
    """
    POST /api/stream/score
    Score a single payment event. Returns fused score + server_compute_ms.
    Used by PerformanceProbe "Measure Now" button (fires 20 sequential calls).
    """
    t0 = time.perf_counter()

    score_req = ScoreRequest(
        event_id=req.event_id or str(uuid.uuid4()),
        amount=req.amount,
        velocity_1h=req.velocity_1h,
        decline_rate_24h=req.decline_rate_24h,
        geo_mismatch=req.geo_mismatch,
        new_device_flag=req.new_device_flag,
        account_age_days=req.account_age_days,
    )

    rule_score, _ = _rules.score(score_req)
    ml_scores = _ensemble.score(score_req)
    graph_score = _ensemble.graph_score(score_req)
    shap = _ensemble.get_shap_values(score_req)

    ml = ml_scores["ml_score"]
    fused = round(ml * 0.50 + graph_score * 0.30 + rule_score * 0.20, 4)

    layer: Optional[str] = None
    if rule_score > 0.7:
        layer = "L0"
    elif ml > 0.7:
        layer = "L1"
    elif graph_score > 0.7:
        layer = "L2"
    elif fused > 0.45:
        layer = "L3"

    if fused >= 0.65:
        decision = "BLOCK"
    elif fused >= 0.40:
        decision = "ALERT"
    else:
        decision = "APPROVE"
        layer = None

    server_ms = (time.perf_counter() - t0) * 1000

    # Feature completeness: 6 bare features out of 172 in full feature store
    feature_completeness = round(6 / 172, 4)

    return LiveScoreResponse(
        event_id=score_req.event_id,
        ml_score=ml,
        graph_score=round(graph_score, 4),
        rule_score=round(rule_score, 4),
        fused_score=fused,
        decision=decision,
        layer_fired=layer,
        shap_values=shap,
        server_compute_ms=round(server_ms, 3),
        feature_completeness=feature_completeness,
    )
