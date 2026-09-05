# backend/models/schemas.py
# All Pydantic request/response models for the Titan API.
# These are the canonical contracts between frontend and backend.
# Frontend types/index.ts must stay in sync with these schemas.

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Primitive / shared
# ---------------------------------------------------------------------------


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded", "error"] = "ok"
    version: str
    active_model_id: Optional[str] = None
    config_hash: str
    capabilities: List[str] = Field(
        default_factory=lambda: [
            "taxonomy",
            "red-team",
            "scoring",
            "simulation",
            "gap-analysis",
            "governance",
            "graph",
            "adaptive",
            "audit",
            "kyc",
            "demo",
        ]
    )
    uptime_seconds: float = 0.0


class OverviewResponse(BaseModel):
    """Current KPIs returned by GET /api/overview."""

    total_events_scored: int = 0
    decision_split: Dict[Literal["ALLOW", "REVIEW", "BLOCK"], int] = Field(
        default_factory=lambda: {"ALLOW": 0, "REVIEW": 0, "BLOCK": 0}
    )
    arms_race_index: float = 0.0
    arms_race_regime: str = "stalemate"
    active_model_id: Optional[str] = None
    recall: float = 0.0
    fpr: float = 0.0
    demo_mode: bool = False


# ---------------------------------------------------------------------------
# Taxonomy / Attack Vector
# ---------------------------------------------------------------------------


class AttackVector(BaseModel):
    id: str
    family: str
    name: str
    gen_ai: bool = False
    sophistication: float = Field(ge=0.0, le=10.0)
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    detectability: Literal["VERY LOW", "LOW", "MEDIUM", "HIGH"]
    evasion_strategy: str
    signals: List[str] = Field(default_factory=list)
    description: str
    mitigation_policy: str
    affected_channel: Optional[str] = None
    threat_actor_profile: Optional[str] = None


# ---------------------------------------------------------------------------
# Genome / Evolution
# ---------------------------------------------------------------------------


class GenomeTraits(BaseModel):
    velocity: float = Field(ge=0.0, le=1.0)
    volume: float = Field(ge=0.0, le=1.0)
    timing_spread: float = Field(ge=0.0, le=1.0)
    infra_diversity: float = Field(ge=0.0, le=1.0)
    graph_footprint: float = Field(ge=0.0, le=1.0)
    persistence: float = Field(ge=0.0, le=1.0)
    behavioral_variance: float = Field(ge=0.0, le=1.0)
    economic_aggression: float = Field(ge=0.0, le=1.0)
    economic_efficiency: float = Field(ge=0.0, le=1.0)
    stealth: float = Field(ge=0.0, le=1.0)


class AttackGenome(BaseModel):
    genome_id: str
    generation: int = Field(ge=0)
    traits: GenomeTraits
    composition: Dict[str, float] = Field(
        description="Attack family -> weight (values sum to 1.0)"
    )
    parent_ids: List[str] = Field(default_factory=list)
    origin: Literal["mutation", "crossover", "immigrant"]
    operator_log: List[str] = Field(default_factory=list)
    infra_cost: Optional[float] = None


class FitnessScore(BaseModel):
    evasion_rate: float = Field(ge=0.0, le=1.0)
    extracted_value: float
    novelty_score: float = Field(ge=0.0)
    efficiency: float
    composite: float
    pareto_rank: int = Field(ge=1)
    crowding_distance: float


# ---------------------------------------------------------------------------
# Scenarios / Scoring
# ---------------------------------------------------------------------------


class ScenarioItem(BaseModel):
    id: str
    attack_family: str
    attack_vector_id: str
    sophistication_level: float = Field(ge=0.0, le=10.0)
    is_fraud: bool
    ml_score: float = Field(ge=0.0, le=1.0)
    graph_score: float = Field(ge=0.0, le=1.0)
    rule_score: float = Field(ge=0.0, le=1.0)
    fused_score: float = Field(ge=0.0, le=1.0)
    decision: Literal["BLOCK", "REVIEW", "ALLOW"]
    evaded_detection: bool
    mutation_log: List[str] = Field(default_factory=list)


class ScoreRequest(BaseModel):
    """Single-event scoring request."""

    event_id: str
    amount: float
    velocity_1h: float = 0.0
    decline_rate_24h: float = 0.0
    geo_mismatch: bool = False
    new_device_flag: bool = False
    account_age_days: int = 0
    is_fraud: Optional[bool] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ScoreResponse(BaseModel):
    event_id: str
    ml_score: float
    graph_score: float
    rule_score: float
    fused_score: float
    decision: Literal["BLOCK", "REVIEW", "ALLOW"]
    shap_values: Optional[Dict[str, float]] = None
    elapsed_ms: float


# ---------------------------------------------------------------------------
# Simulation
# ---------------------------------------------------------------------------


class MetricsPayload(BaseModel):
    """
    Core simulation metrics payload.
    prevalence is required - it drives everything downstream.
    """

    prevalence: float = Field(
        gt=0.0, lt=1.0, description="Fraud prevalence rate (required)"
    )
    n_events: int = Field(default=500, ge=1, le=50_000)
    seed: Optional[int] = None
    attack_family: Optional[str] = None
    sophistication_min: float = Field(default=0.0, ge=0.0, le=10.0)
    sophistication_max: float = Field(default=10.0, ge=0.0, le=10.0)


class GenerationBatch(BaseModel):
    """Result of one generation's simulation."""

    generation: int
    run_id: str
    n_events: int
    n_fraud: int
    scenarios: List[ScenarioItem]
    detection_rate_fixed_set: float
    detection_rate_new_vectors: float
    recall: float
    precision: float
    false_positive_rate: float
    arms_race_index: float
    arms_race_regime: Literal[
        "red_ascendant", "blue_ascendant", "contested", "stalemate"
    ]
    novelty_archive_size: int
    n_emergent_events: int
    elapsed_seconds: float


class SimulationResult(BaseModel):
    run_id: str
    status: Literal["queued", "running", "completed", "failed"]
    mode: str
    generations_completed: int
    total_generations: int
    batches: List[GenerationBatch] = Field(default_factory=list)
    started_at: datetime
    completed_at: Optional[datetime] = None
    config_hash: str


# ---------------------------------------------------------------------------
# Gap Analysis
# ---------------------------------------------------------------------------


class EvasionCluster(BaseModel):
    cluster_id: int
    size: int
    centroid_family: str
    weak_feature: str
    evasion_rate: float = Field(ge=0.0, le=1.0)
    genome_ids: List[str] = Field(default_factory=list)


class GapReport(BaseModel):
    n_evaded: int
    n_tested: int
    evasion_rate: float
    clusters: List[EvasionCluster]
    recommended_counterexamples: int
    target_features: List[str]
    atlas_snapshot: Optional[Dict[str, Any]] = None


# ---------------------------------------------------------------------------
# Models / Governance
# ---------------------------------------------------------------------------


class ModelRecord(BaseModel):
    model_id: str
    version: str
    recall: float
    precision: float
    f1: float
    fpr: float
    roc_auc: float
    fidelity_score: float
    created_at: datetime
    is_active: bool
    training_notes: Optional[str] = None


class PromotionGateResult(BaseModel):
    gate_id: str
    label: str
    pass_: bool = Field(alias="pass")
    value: float
    threshold: float
    delta: Optional[float] = None

    model_config = {"populate_by_name": True}


class PromotionResult(BaseModel):
    promoted: bool
    new_model_id: Optional[str] = None
    gates: List[PromotionGateResult]
    reason: Optional[str] = None


class DefensePolicy(BaseModel):
    ml_threshold: float = Field(ge=0.0, le=1.0)
    graph_weight: float = Field(ge=0.0, le=1.0)
    fpr_target: float = Field(ge=0.0, le=1.0)
    trust_region: float = Field(ge=0.0, le=1.0)
    adaptation_rate: float = Field(ge=0.0, le=1.0)


# ---------------------------------------------------------------------------
# Oracle / War Room
# ---------------------------------------------------------------------------


class OracleFinding(BaseModel):
    key: str
    detail: str


class OracleReport(BaseModel):
    regime: Literal["red_ascendant", "blue_ascendant", "contested", "stalemate"]
    arms_race: Dict[str, float]
    findings: List[OracleFinding]
    summary: str
    config_hash: str


class RedStrategySummary(BaseModel):
    dominant_family: str
    composite_share: float
    population_size: int
    memory_size: int = 0


class WarRoomState(BaseModel):
    n_generations: int
    arms_race: Dict[str, Any]
    red: Dict[str, Any]
    blue: Dict[str, Any]
    novelty: Dict[str, Any]
    economy: Dict[str, Any]
    latest_generation: Dict[str, Any] = Field(default_factory=dict)


class RunSummary(BaseModel):
    run_id: str
    status: Literal["queued", "running", "completed", "failed"]
    mode: str
    generations: int
    seed: int
    created_at: datetime


# ---------------------------------------------------------------------------
# Explainability
# ---------------------------------------------------------------------------


class SHAPValue(BaseModel):
    feature: str
    value: float
    direction: Literal["positive", "negative"]


class ExplanationResult(BaseModel):
    event_id: str
    model_version: str
    method: Literal["shap", "template_fallback"]
    top_features: List[SHAPValue]
    base_value: float
    predicted_value: float


# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------


class AuditEvent(BaseModel):
    event_id: str
    timestamp: datetime
    event_type: Literal[
        "MODEL_PROMOTED",
        "MODEL_ROLLBACK",
        "POLICY_CHANGED",
        "RETRAIN_STARTED",
        "RETRAIN_COMPLETED",
        "GATE_EVALUATED",
        "RUN_STARTED",
        "RUN_COMPLETED",
        "RUN_STOPPED",
    ]
    actor: str = "system"
    model_id: Optional[str] = None
    run_id: Optional[str] = None
    result: str
    details: Dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Fidelity
# ---------------------------------------------------------------------------


class KSTestResult(BaseModel):
    ks: float
    p_value: float
    pass_: bool = Field(alias="pass")

    model_config = {"populate_by_name": True}


class FidelityMetrics(BaseModel):
    simulator_calibrated_phi: float
    ks_stats: Dict[str, KSTestResult]
    wasserstein_distance: float
    provenance_auc: float
    fidelity_score: float


# ---------------------------------------------------------------------------
# Attack generation (Red Team)
# ---------------------------------------------------------------------------


class GenerateRequest(BaseModel):
    count: int = Field(default=25, ge=1, le=500)
    family: Optional[str] = None
    sophistication_min: float = Field(default=0.0, ge=0.0, le=10.0)
    sophistication_max: float = Field(default=10.0, ge=0.0, le=10.0)
    mutation_strength: float = Field(default=0.6, ge=0.0, le=1.0)
    seed: Optional[int] = None


class GenerateResponse(BaseModel):
    scenarios: List[ScenarioItem]
    genomes: List[AttackGenome]
    elapsed_ms: float


# ---------------------------------------------------------------------------
# KYC
# ---------------------------------------------------------------------------


class KYCResult(BaseModel):
    request_id: str
    liveness_score: float = Field(ge=0.0, le=1.0)
    liveness_pass: bool
    similarity_score: Optional[float] = None
    face_match_pass: Optional[bool] = None
    decision: Literal["PASS", "REVIEW", "FAIL"]
    elapsed_ms: float


# ---------------------------------------------------------------------------
# Stub response (used during BP1 while routers are not yet implemented)
# ---------------------------------------------------------------------------


class StubResponse(BaseModel):
    status: str = "stub"
    phase: str = "BP1"
    message: str = "This endpoint will be fully implemented in a later build phase."
