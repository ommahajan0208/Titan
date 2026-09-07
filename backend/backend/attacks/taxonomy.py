# backend/attacks/taxonomy.py
# 36-vector AttackVector taxonomy.
# Each vector maps to one of 8 attack families.
# Spec: Phase 7 / backend_spec.md

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional, Literal


@dataclass
class AttackVectorDef:
    id: str
    family: str
    name: str
    gen_ai: bool
    sophistication: float           # 0-10
    severity: str                   # LOW / MEDIUM / HIGH / CRITICAL
    detectability: str              # VERY LOW / LOW / MEDIUM / HIGH
    evasion_strategy: str
    signals: List[str]
    description: str
    mitigation_policy: str
    affected_channel: Optional[str] = None
    threat_actor_profile: Optional[str] = None


TAXONOMY: List[AttackVectorDef] = [
    # ── Family 1: Synthetic Identity ─────────────────────────────────────────
    AttackVectorDef(
        id="SYN-001", family="synthetic_identity", name="Document Synthesis",
        gen_ai=True, sophistication=7.5, severity="HIGH", detectability="LOW",
        evasion_strategy="GAN-generated identity documents bypass OCR checks",
        signals=["new_account_flag", "doc_entropy_anomaly", "velocity_1h"],
        description="AI-generated PAN/Aadhaar documents submitted during onboarding.",
        mitigation_policy="ArcFace liveness + document entropy threshold gate",
        threat_actor_profile="Organised fraud ring"
    ),
    AttackVectorDef(
        id="SYN-002", family="synthetic_identity", name="Profile Stitching",
        gen_ai=False, sophistication=5.0, severity="MEDIUM", detectability="MEDIUM",
        evasion_strategy="Legitimate sub-documents combined to form a coherent synthetic identity",
        signals=["dob_velocity_mismatch", "address_graph_novelty", "credit_thin_file"],
        description="Real document fragments combined to create a non-existent persona.",
        mitigation_policy="Cross-bureau graph check + thin-file rule",
    ),
    AttackVectorDef(
        id="SYN-003", family="synthetic_identity", name="Deepfake KYC Video",
        gen_ai=True, sophistication=9.0, severity="CRITICAL", detectability="VERY LOW",
        evasion_strategy="Diffusion-model face swap defeats passive liveness",
        signals=["liveness_score", "frame_consistency", "lip_sync_delta"],
        description="Real-time deepfake video submitted during video-KYC session.",
        mitigation_policy="ArcFace active liveness + frame coherence check",
        affected_channel="web"
    ),
    AttackVectorDef(
        id="SYN-004", family="synthetic_identity", name="Nominee Account Hijack",
        gen_ai=False, sophistication=4.5, severity="MEDIUM", detectability="HIGH",
        evasion_strategy="Legitimate dormant account repurposed via OTP intercept",
        signals=["device_change_flag", "geo_mismatch", "new_payee_spike"],
        description="Fraudster takes over a low-activity account using SIM swap + OTP.",
        mitigation_policy="Device-bind + 7-day payee cooling period",
    ),

    # ── Family 2: Mule Network ────────────────────────────────────────────────
    AttackVectorDef(
        id="MUL-001", family="mule_network", name="Fan-In Mule Chain",
        gen_ai=False, sophistication=6.0, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="Funds routed through 4-6 mule accounts before cash-out",
        signals=["graph_footprint", "fan_in_percentile", "velocity_1h"],
        description="Layered mule chain obscures origin of stolen funds.",
        mitigation_policy="GraphSAGE fan-in >95th percentile = BLOCK",
    ),
    AttackVectorDef(
        id="MUL-002", family="mule_network", name="Micro-Structuring",
        gen_ai=False, sophistication=5.5, severity="MEDIUM", detectability="MEDIUM",
        evasion_strategy="Splits large transfer into sub-threshold amounts over multiple mules",
        signals=["amount_clustering", "velocity_24h", "structuring_ratio"],
        description="Smurfing below INR 50,000 to avoid automatic reporting.",
        mitigation_policy="Rolling 24h aggregation rule + structuring ratio gate",
    ),
    AttackVectorDef(
        id="MUL-003", family="mule_network", name="Agentic Mule Pivot",
        gen_ai=True, sophistication=8.0, severity="CRITICAL", detectability="VERY LOW",
        evasion_strategy="LLM agent autonomously routes funds via lowest-graph-degree path",
        signals=["graph_footprint", "api_call_pattern", "session_timing"],
        description="AI agent selects optimal mule path to minimise graph detection score.",
        mitigation_policy="Agentic-channel rate limit + GraphSAGE hard gate",
        affected_channel="agentic"
    ),
    AttackVectorDef(
        id="MUL-004", family="mule_network", name="Offshore Bridge",
        gen_ai=False, sophistication=7.0, severity="HIGH", detectability="LOW",
        evasion_strategy="Funds cross international bridge account before final UPI pull",
        signals=["cross_border_flag", "fednow_to_upi_bridge", "counterparty_novelty"],
        description="SEPA_INST or RTP_FedNow used as bridge before final UPI P2P leg.",
        mitigation_policy="Cross-border velocity + counterparty novelty check",
    ),

    # ── Family 3: Credential Theft ────────────────────────────────────────────
    AttackVectorDef(
        id="CRD-001", family="credential_theft", name="SIM Swap OTP Bypass",
        gen_ai=False, sophistication=6.5, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="Ported SIM receives OTP; transaction appears from known device",
        signals=["sim_swap_flag", "otp_reuse", "new_device_flag"],
        description="Fraudster bribes telco employee to port victim SIM.",
        mitigation_policy="SIM swap freshness gate + device fingerprint lock",
    ),
    AttackVectorDef(
        id="CRD-002", family="credential_theft", name="Phishing Kit AiTM",
        gen_ai=True, sophistication=7.0, severity="HIGH", detectability="LOW",
        evasion_strategy="Adversary-in-the-middle proxy replays session tokens in real time",
        signals=["session_token_age", "ip_hop", "geo_velocity"],
        description="LLM-personalised phishing email with evilginx2 proxy.",
        mitigation_policy="Session binding + geo-velocity impossible-travel rule",
        affected_channel="web"
    ),
    AttackVectorDef(
        id="CRD-003", family="credential_theft", name="Stealer Malware Exfil",
        gen_ai=False, sophistication=5.0, severity="MEDIUM", detectability="HIGH",
        evasion_strategy="Credentials extracted from browser keychain; UPI PIN exposed",
        signals=["new_device_flag", "clip_paste_pattern", "typing_cadence"],
        description="Infostealer malware extracts UPI credentials from Android keychain.",
        mitigation_policy="Device attestation + typing-cadence behavioural check",
        affected_channel="mobile"
    ),
    AttackVectorDef(
        id="CRD-004", family="credential_theft", name="Vishing OTP Relay",
        gen_ai=True, sophistication=5.5, severity="MEDIUM", detectability="MEDIUM",
        evasion_strategy="Victim verbally relays OTP; real-time voice cloning masks caller ID",
        signals=["otp_relay_pattern", "call_duration", "voice_clone_flag"],
        description="Scammer clones bank IVR voice to extract OTP from victim.",
        mitigation_policy="OTP rate limit + call-origination check",
        affected_channel="IVR"
    ),

    # ── Family 4: Account Takeover ────────────────────────────────────────────
    AttackVectorDef(
        id="ATO-001", family="account_takeover", name="Credential Stuffing",
        gen_ai=False, sophistication=3.0, severity="MEDIUM", detectability="HIGH",
        evasion_strategy="Distributed login attempts from residential proxy pool",
        signals=["login_fail_rate", "ip_diversity", "velocity_1h"],
        description="Leaked credential list tested at scale against payment app.",
        mitigation_policy="Rate limit + CAPTCHA + IP reputation",
    ),
    AttackVectorDef(
        id="ATO-002", family="account_takeover", name="Session Hijack",
        gen_ai=False, sophistication=6.0, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="Bearer token stolen from unencrypted local storage",
        signals=["session_token_age", "ua_mismatch", "geo_mismatch"],
        description="Victim's app session token lifted via XSS or network intercept.",
        mitigation_policy="Token binding + IP/device consistency check",
    ),
    AttackVectorDef(
        id="ATO-003", family="account_takeover", name="Push-Payment Coercion",
        gen_ai=False, sophistication=4.0, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="Victim coerced to initiate authorised push payment",
        signals=["new_payee_flag", "amount_spike", "auth_time_pressure"],
        description="APP (Authorised Push Payment) fraud via social engineering.",
        mitigation_policy="Payee cooling period + amount-spike alert",
    ),
    AttackVectorDef(
        id="ATO-004", family="account_takeover", name="RAT Mobile Overlay",
        gen_ai=False, sophistication=7.5, severity="CRITICAL", detectability="LOW",
        evasion_strategy="Remote-access trojan overlays fake UPI UI; victim unknowingly authorises",
        signals=["overlay_detection", "accessibility_service_abuse", "new_device_flag"],
        description="Android RAT with overlay capability mimics legitimate UPI screen.",
        mitigation_policy="Accessibility-service anomaly + device attestation gate",
        affected_channel="mobile"
    ),

    # ── Family 5: Velocity / Timing ────────────────────────────────────────────
    AttackVectorDef(
        id="VEL-001", family="velocity_timing", name="Burst Flooding",
        gen_ai=False, sophistication=4.0, severity="MEDIUM", detectability="HIGH",
        evasion_strategy="High-rate transactions in short window exhaust limit monitoring",
        signals=["velocity_1h", "txn_count_5m", "amount_total_5m"],
        description="Automated burst of micro-transactions within a short window.",
        mitigation_policy="Rolling 5-minute count + amount velocity rules",
    ),
    AttackVectorDef(
        id="VEL-002", family="velocity_timing", name="Off-Peak Stealth",
        gen_ai=True, sophistication=6.0, severity="MEDIUM", detectability="LOW",
        evasion_strategy="LLM schedules transactions in analyst blind-spot hours (02:00-04:30 IST)",
        signals=["hour_of_day", "txn_timing_entropy", "velocity_24h"],
        description="Transactions timed to exploit reduced monitoring during low-staffing hours.",
        mitigation_policy="24/7 ML scoring + timing-entropy anomaly gate",
    ),
    AttackVectorDef(
        id="VEL-003", family="velocity_timing", name="Drip Exfiltration",
        gen_ai=False, sophistication=5.0, severity="LOW", detectability="MEDIUM",
        evasion_strategy="Slow bleed over 7-14 days mimics legitimate subscription behaviour",
        signals=["recurrence_pattern", "amount_stability", "payee_age"],
        description="Small recurring payments that mimic legitimate subscriptions.",
        mitigation_policy="Long-window velocity check (7-day) + payee novelty",
    ),

    # ── Family 6: Social Engineering ──────────────────────────────────────────
    AttackVectorDef(
        id="SOC-001", family="social_engineering", name="Investment Scam",
        gen_ai=True, sophistication=7.0, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="Victim voluntarily transfers large sums to 'investment' payee",
        signals=["new_payee_flag", "large_amount_flag", "transfer_pattern"],
        description="Pig-butchering or fake-returns investment scheme.",
        mitigation_policy="Large-value new-payee friction + delay gate",
    ),
    AttackVectorDef(
        id="SOC-002", family="social_engineering", name="Romance Fraud",
        gen_ai=True, sophistication=6.5, severity="HIGH", detectability="LOW",
        evasion_strategy="Gradual trust building over weeks before fund request",
        signals=["payee_age_days", "cumulative_to_payee", "amount_ramp"],
        description="Long-duration social engineering resulting in authorised push payments.",
        mitigation_policy="Payee relationship age + cumulative transfer limit",
    ),
    AttackVectorDef(
        id="SOC-003", family="social_engineering", name="QR Code Substitution",
        gen_ai=False, sophistication=3.5, severity="MEDIUM", detectability="HIGH",
        evasion_strategy="Physical QR code replaced at merchant with fraudster's VPA",
        signals=["merchant_vpa_change", "geo_merchant_mismatch", "amount_mismatch"],
        description="Fraudster sticker over legitimate merchant QR at physical POS.",
        mitigation_policy="Dynamic QR with merchant binding + amount pre-fill",
        affected_channel="mobile"
    ),

    # ── Family 7: Card / CNP ──────────────────────────────────────────────────
    AttackVectorDef(
        id="CNP-001", family="card_cnp", name="BIN Attack",
        gen_ai=False, sophistication=4.0, severity="MEDIUM", detectability="HIGH",
        evasion_strategy="Systematic enumeration of card numbers within a stolen BIN range",
        signals=["bin_diversity", "velocity_5m", "decline_rate"],
        description="Automated card number enumeration within a compromised BIN.",
        mitigation_policy="BIN velocity + decline-rate gate",
        affected_channel="web"
    ),
    AttackVectorDef(
        id="CNP-002", family="card_cnp", name="EMV Replay",
        gen_ai=False, sophistication=6.5, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="Stolen EMV chip data replayed in CNP context with matching CVV",
        signals=["emv_token_reuse", "device_mismatch", "geo_mismatch"],
        description="EMV chip intercept data replayed for CNP transaction.",
        mitigation_policy="EMV token freshness + device fingerprint",
    ),
    AttackVectorDef(
        id="CNP-003", family="card_cnp", name="Click-Farm Carding",
        gen_ai=False, sophistication=5.0, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="Human click farm provides real browser fingerprints to bypass bot detection",
        signals=["ip_diversity", "fingerprint_reuse", "mouse_behaviour"],
        description="Human click farms used to test stolen card credentials at scale.",
        mitigation_policy="Behavioural biometrics + residential-proxy detection",
    ),

    # ── Family 8: Emergent / Adaptive ─────────────────────────────────────────
    AttackVectorDef(
        id="EMG-001", family="emergent_adaptive", name="NSGA-II Evolved Evasion",
        gen_ai=True, sophistication=9.5, severity="CRITICAL", detectability="VERY LOW",
        evasion_strategy="Co-evolutionary NSGA-II discovers Pareto-optimal evasion genome",
        signals=["behavioral_variance", "stealth", "graph_footprint"],
        description="Genome optimised by NSGA-II to simultaneously maximise evasion and value.",
        mitigation_policy="Novelty engine + MAP-Elites blind-spot hardening",
    ),
    AttackVectorDef(
        id="EMG-002", family="emergent_adaptive", name="Feature Masking",
        gen_ai=True, sophistication=8.5, severity="CRITICAL", detectability="VERY LOW",
        evasion_strategy="Adversarial perturbation targets top SHAP features to suppress ML score",
        signals=["shap_feature_drift", "score_delta", "feature_completeness"],
        description="Gradient-based attack on SHAP-identified features to drive score below threshold.",
        mitigation_policy="Adversarial retraining + feature-drift monitoring",
    ),
    AttackVectorDef(
        id="EMG-003", family="emergent_adaptive", name="Concept Drift Exploit",
        gen_ai=True, sophistication=8.0, severity="HIGH", detectability="LOW",
        evasion_strategy="Gradual behavioural shift exploits stale model reference distribution",
        signals=["distribution_shift_score", "psi_score", "model_age_days"],
        description="Long-horizon campaign exploits window between model training cycles.",
        mitigation_policy="PSI drift monitoring + continuous retraining trigger",
    ),
    AttackVectorDef(
        id="EMG-004", family="emergent_adaptive", name="Multimodal Fusion Attack",
        gen_ai=True, sophistication=9.0, severity="CRITICAL", detectability="VERY LOW",
        evasion_strategy="Simultaneous manipulation of transaction + graph + KYC signals",
        signals=["cross_modal_consistency", "graph_footprint", "liveness_score"],
        description="Coordinated attack across transaction, graph, and identity signals.",
        mitigation_policy="Cross-modal coherence gate + ensemble voting floor",
    ),
    AttackVectorDef(
        id="EMG-005", family="emergent_adaptive", name="Shadow Account Preparation",
        gen_ai=False, sophistication=6.5, severity="HIGH", detectability="LOW",
        evasion_strategy="Sleeper mule accounts seeded over months with legitimate micro-transactions",
        signals=["account_age_days", "micro_txn_pattern", "payee_graph_centrality"],
        description="Accounts built up over long periods to appear legitimate before large fraud event.",
        mitigation_policy="Long-window trust score + sudden-behaviour-change alert",
    ),
    AttackVectorDef(
        id="EMG-006", family="emergent_adaptive", name="API Probing",
        gen_ai=True, sophistication=7.5, severity="HIGH", detectability="MEDIUM",
        evasion_strategy="LLM agent systematically probes scoring API to map decision boundary",
        signals=["api_call_pattern", "score_probe_count", "boundary_mapping"],
        description="Automated probing of the scoring API to reverse-engineer the decision threshold.",
        mitigation_policy="API rate limit + probe-pattern anomaly detection",
        affected_channel="agentic"
    ),
]


def get_all_vectors() -> List[AttackVectorDef]:
    return TAXONOMY


def get_vector_by_id(vector_id: str) -> Optional[AttackVectorDef]:
    for v in TAXONOMY:
        if v.id == vector_id:
            return v
    return None


def get_vectors_by_family(family: str) -> List[AttackVectorDef]:
    return [v for v in TAXONOMY if v.family == family]


def get_families() -> List[str]:
    seen = []
    for v in TAXONOMY:
        if v.family not in seen:
            seen.append(v.family)
    return seen
