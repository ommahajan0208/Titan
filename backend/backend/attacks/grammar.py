# backend/attacks/grammar.py
# 19-primitive attack grammar validator.
# Spec: Phase 7 / backend_spec.md section 3.2

from __future__ import annotations

from typing import List, Optional

# ── 19 attack primitives and their allowed successors ────────────────────────

PRIMITIVES: dict[str, dict] = {
    "credential_stuffing": {
        "stage": "compromise",
        "successors": ["session_hijack", "device_swap", "account_probe"],
    },
    "session_hijack": {
        "stage": "compromise",
        "successors": ["payment_initiation", "profile_manipulation"],
    },
    "device_swap": {
        "stage": "compromise",
        "successors": ["account_probe", "payment_initiation"],
    },
    "account_probe": {
        "stage": "compromise",
        "successors": ["payment_initiation", "session_hijack"],
    },
    "persona_fabrication": {
        "stage": "establish",
        "successors": ["trust_building", "document_forgery"],
    },
    "document_forgery": {
        "stage": "establish",
        "successors": ["trust_building", "payment_initiation"],
    },
    "trust_building": {
        "stage": "establish",
        "successors": ["payment_initiation", "fan_out"],
    },
    "profile_manipulation": {
        "stage": "establish",
        "successors": ["payment_initiation"],
    },
    "payment_initiation": {
        "stage": "extract",
        "successors": ["fan_out", "smurfing", "cash_out"],
    },
    "fan_out": {
        "stage": "launder",
        "successors": ["smurfing", "layering", "cash_out"],
    },
    "smurfing": {
        "stage": "launder",
        "successors": ["layering", "cash_out"],
    },
    "layering": {
        "stage": "launder",
        "successors": ["cash_out"],
    },
    "cash_out": {
        "stage": "extract",
        "successors": [],
    },
    "social_engineering": {
        "stage": "compromise",
        "successors": ["payment_initiation", "credential_stuffing"],
    },
    "deepfake_injection": {
        "stage": "establish",
        "successors": ["persona_fabrication", "document_forgery"],
    },
    "gradient_perturbation": {
        "stage": "compromise",
        "successors": ["payment_initiation"],
    },
    "shadow_model_probe": {
        "stage": "compromise",
        "successors": ["gradient_perturbation", "payment_initiation"],
    },
    "synthetic_voice": {
        "stage": "establish",
        "successors": ["social_engineering", "payment_initiation"],
    },
    "replay_attack": {
        "stage": "compromise",
        "successors": ["payment_initiation", "session_hijack"],
    },
}

STAGES = ["compromise", "establish", "launder", "extract"]


def validate_chain(primitives: List[str]) -> tuple[bool, Optional[str]]:
    """
    Validate that a sequence of primitives forms a valid attack chain.
    Returns (is_valid, error_message).
    """
    if not primitives:
        return False, "Empty chain"

    for p in primitives:
        if p not in PRIMITIVES:
            return False, f"Unknown primitive: {p}"

    for i in range(len(primitives) - 1):
        current = primitives[i]
        next_p = primitives[i + 1]
        allowed = PRIMITIVES[current]["successors"]
        if next_p not in allowed:
            return False, (
                f"Invalid transition {current!r} -> {next_p!r}. "
                f"Allowed successors: {allowed}"
            )

    return True, None


def get_primitives() -> dict[str, dict]:
    """Return the full primitive dictionary."""
    return PRIMITIVES


def get_primitive_count() -> int:
    return len(PRIMITIVES)
