# backend/genome/genome.py
# AttackGenome with 10 behavioral traits and EXPRESSION tables.
# Spec: Phase 7 / backend_spec.md section 4.2

from __future__ import annotations

import hashlib
import json
import uuid
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class ParamBound:
    """Maps a genome trait to a concrete parameter range."""
    trait: str
    lo: float
    hi: float
    integer: bool = False

    def express(self, trait_value: float) -> float | int:
        value = self.lo + trait_value * (self.hi - self.lo)
        if self.hi < self.lo:
            # Inverted: high trait -> low parameter (e.g. stealth -> low decline rate)
            value = self.hi + (1 - trait_value) * (self.lo - self.hi)
        if self.integer:
            return int(round(value))
        return round(value, 4)


# ── EXPRESSION tables ─────────────────────────────────────────────────────────

EXPRESSION: Dict[str, Dict[str, ParamBound]] = {
    "card_testing": {
        "n_bots": ParamBound("graph_footprint", 1, 8, integer=True),
        "burst_width_minutes": ParamBound("timing_spread", 3, 180, integer=True),
        "decline_rate": ParamBound("stealth", 0.85, 0.10),
        "amount_max": ParamBound("economic_aggression", 500, 5000),
        "velocity_per_bot": ParamBound("velocity", 1, 20, integer=True),
        "device_pool_size": ParamBound("infra_diversity", 1, 50, integer=True),
        "persistence_cycles": ParamBound("persistence", 1, 5, integer=True),
        "behavioral_jitter": ParamBound("behavioral_variance", 0.0, 0.5),
        "economic_target": ParamBound("economic_aggression", 100, 50000),
        "stealth_profile": ParamBound("stealth", 0.1, 0.95),
    },
    "mule_network": {
        "n_smurfs": ParamBound("graph_footprint", 4, 30, integer=True),
        "fan_in_window_hours": ParamBound("timing_spread", 1, 72, integer=True),
        "structuring_threshold": ParamBound("stealth", 2000, 9500),
        "layering_hops": ParamBound("persistence", 1, 5, integer=True),
        "infrastructure_size": ParamBound("infra_diversity", 5, 100, integer=True),
    },
    "synthetic_identity": {
        "n_identities": ParamBound("graph_footprint", 1, 15, integer=True),
        "trust_building_days": ParamBound("persistence", 7, 180, integer=True),
        "bust_out_amount": ParamBound("economic_aggression", 1000, 100000),
        "document_quality": ParamBound("stealth", 0.3, 0.99),
        "velocity": ParamBound("velocity", 0.1, 0.9),
    },
    "cnp_social_engineering": {
        "phishing_sophistication": ParamBound("stealth", 0.2, 0.95),
        "n_targets": ParamBound("graph_footprint", 1, 50, integer=True),
        "contact_rate_per_hour": ParamBound("velocity", 1, 100, integer=True),
        "scam_amount": ParamBound("economic_aggression", 500, 50000),
        "timing_spread": ParamBound("timing_spread", 0.05, 1.0),
    },
    "refund_abuse": {
        "n_accounts": ParamBound("graph_footprint", 1, 20, integer=True),
        "refund_cycle_days": ParamBound("persistence", 1, 30, integer=True),
        "per_account_amount": ParamBound("economic_aggression", 50, 5000),
        "stealth": ParamBound("stealth", 0.3, 0.95),
        "velocity": ParamBound("velocity", 0.05, 0.5),
    },
    "account_takeover": {
        "credential_stuffing_rate": ParamBound("velocity", 10, 10000, integer=True),
        "device_diversity": ParamBound("infra_diversity", 1, 100, integer=True),
        "session_lifetime_minutes": ParamBound("timing_spread", 1, 60, integer=True),
        "extraction_amount": ParamBound("economic_aggression", 1000, 200000),
        "mfa_bypass_probability": ParamBound("stealth", 0.05, 0.80),
    },
    "promo_abuse": {
        "n_fake_accounts": ParamBound("graph_footprint", 5, 200, integer=True),
        "promo_value": ParamBound("economic_aggression", 50, 2000),
        "creation_rate_per_day": ParamBound("velocity", 1, 50, integer=True),
        "stealth": ParamBound("stealth", 0.3, 0.9),
        "persistence": ParamBound("persistence", 1, 10, integer=True),
    },
}


@dataclass
class AttackGenomeObj:
    """
    An attack genome: 10 continuous behavioral traits + a composition dict.
    This is the Python-level object; the Pydantic schema is in models/schemas.py.
    """
    genome_id: str = field(default_factory=lambda: f"G-{uuid.uuid4().hex[:8]}")
    generation: int = 0
    traits: Dict[str, float] = field(default_factory=lambda: {
        "velocity": 0.5,
        "volume": 0.5,
        "timing_spread": 0.5,
        "infra_diversity": 0.5,
        "graph_footprint": 0.5,
        "persistence": 0.5,
        "behavioral_variance": 0.5,
        "economic_aggression": 0.5,
        "economic_efficiency": 0.5,
        "stealth": 0.5,
    })
    composition: Dict[str, float] = field(default_factory=lambda: {"card_testing": 1.0})
    parent_ids: List[str] = field(default_factory=list)
    origin: str = "mutation"
    operator_log: List[str] = field(default_factory=list)

    def infra_cost(self) -> float:
        """Compute infrastructure cost for the double-entry ledger."""
        t = self.traits
        base = 40.0
        infra = 260.0 * t.get("infra_diversity", 0.5)
        footprint = 200.0 * t.get("graph_footprint", 0.5)
        stealth_premium = 150.0 * (t.get("stealth", 0.5) ** 2)
        coordination = 90.0 * (len(self.composition) - 1)
        gross = base + infra + footprint + stealth_premium + coordination
        discount = 0.45 * t.get("economic_efficiency", 0.5)
        return round(gross * (1.0 - discount), 4)

    def fingerprint(self) -> str:
        """SHA-1 of quantised traits + composition. Uniquely identifies a strategy."""
        quantised = {k: round(v, 2) for k, v in sorted(self.traits.items())}
        payload = json.dumps({"traits": quantised, "composition": self.composition}, sort_keys=True)
        return hashlib.sha1(payload.encode()).hexdigest()[:16]

    def express(self, family: str) -> dict:
        """Interpolate traits to concrete parameters for the given family."""
        table = EXPRESSION.get(family, {})
        if not table:
            return {}
        return {
            param: bound.express(self.traits.get(bound.trait, 0.5))
            for param, bound in table.items()
        }
