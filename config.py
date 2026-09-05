# config.py
# Single source of truth for ALL seeds, thresholds, and simulation defaults.
# Every other module imports from here. Nothing is hardcoded elsewhere.
#
# Design rule: determinism first. Given the same master_seed the entire
# pipeline must produce the same output bit-for-bit.

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import hashlib, json


class TitanConfig(BaseSettings):
    """
    Loaded once at startup. Environment variables (prefixed TITAN_) override
    any default. A config_hash is derived from the serialized values and
    embedded in every run_manifest for full reproducibility.
    """

    model_config = SettingsConfigDict(
        env_prefix="TITAN_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------
    app_title: str = "Project Titan - AI Defense Lab"
    app_version: str = "1.0.0"

    # ------------------------------------------------------------------
    # Randomness - master seed + per-component derived seeds
    # ------------------------------------------------------------------
    master_seed: int = Field(default=42, description="Master random seed")

    # Derived seeds (master + fixed offset to keep components independent)
    @property
    def seed_simulation(self) -> int:
        return self.master_seed + 1

    @property
    def seed_genome(self) -> int:
        return self.master_seed + 2

    @property
    def seed_evolution(self) -> int:
        return self.master_seed + 3

    @property
    def seed_novelty(self) -> int:
        return self.master_seed + 4

    @property
    def seed_ml_train(self) -> int:
        return self.master_seed + 5

    @property
    def seed_gap_analysis(self) -> int:
        return self.master_seed + 6

    @property
    def seed_kyc(self) -> int:
        return self.master_seed + 7

    # ------------------------------------------------------------------
    # Simulation defaults
    # ------------------------------------------------------------------
    prevalence: float = Field(default=0.01, description="Fraud prevalence rate")
    n_events_per_generation: int = Field(default=500)
    n_legitimate_per_generation: int = Field(default=9_800)
    alert_budget: int = Field(default=100, description="Max alerts per generation")
    retrain_interval: int = Field(
        default=3, description="Retrain every N generations automatically"
    )
    n_generations_default: int = Field(default=10)
    population_size: int = Field(default=12, description="NSGA-II population size")

    # ------------------------------------------------------------------
    # Detector thresholds
    # ------------------------------------------------------------------
    ml_threshold: float = Field(
        default=0.62, description="Fused score BLOCK cutoff (above = BLOCK)"
    )
    review_threshold: float = Field(
        default=0.35, description="Fused score REVIEW cutoff (above = REVIEW)"
    )
    fpr_target: float = Field(default=0.01, description="Maximum allowable FPR")

    # Ensemble weights (must sum to 1.0)
    weight_ml: float = Field(default=0.50)
    weight_graph: float = Field(default=0.25)
    weight_rule: float = Field(default=0.25)

    # Graph detector
    graph_fan_in_percentile: float = Field(
        default=0.90,
        description="Fan-in percentile above which a node is flagged",
    )

    # ------------------------------------------------------------------
    # Promotion gates
    # ------------------------------------------------------------------
    gate_recall_delta: float = Field(
        default=0.005, description="Minimum recall improvement to promote"
    )
    gate_fpr_regression_limit: float = Field(
        default=0.002, description="Max allowable FPR worsening"
    )
    gate_provenance_auc_max: float = Field(
        default=0.55,
        description="Provenance AUC must stay near 0.5 (indistinguishable from real)",
    )
    gate_fidelity_min: float = Field(
        default=80.0, description="Fidelity score floor for promotion"
    )

    # ------------------------------------------------------------------
    # Novelty / MAP-Elites
    # ------------------------------------------------------------------
    novelty_k_neighbors: int = Field(default=15, description="k for novelty score")
    novelty_archive_threshold: float = Field(
        default=0.1, description="Minimum novelty to add to archive"
    )
    atlas_x_bins: int = Field(default=10, description="Velocity dimension bins")
    atlas_y_bins: int = Field(default=12, description="Graph footprint dimension bins")

    # ------------------------------------------------------------------
    # Evolution (NSGA-II)
    # ------------------------------------------------------------------
    crossover_alpha: float = Field(default=0.5, description="BLX-alpha crossover blend")
    mutation_sigma: float = Field(
        default=0.12, description="Gaussian mutation standard deviation"
    )
    elite_fraction: float = Field(
        default=0.2, description="Fraction of elites preserved each generation"
    )

    # ------------------------------------------------------------------
    # Economy / ledger
    # ------------------------------------------------------------------
    red_starting_treasury: float = Field(default=1000.0)
    blue_starting_treasury: float = Field(default=1000.0)
    red_value_per_evaded_dollar: float = Field(default=1.0)
    blue_cost_per_alert: float = Field(default=2.5)

    # ------------------------------------------------------------------
    # KYC (ArcFace ONNX)
    # ------------------------------------------------------------------
    kyc_model_path: str = Field(default="models/arcface_r50.onnx")
    kyc_similarity_threshold: float = Field(
        default=0.40, description="Cosine similarity floor for face match"
    )
    kyc_liveness_threshold: float = Field(
        default=0.80, description="Liveness score floor"
    )

    # ------------------------------------------------------------------
    # Config hash - embedded in run manifests for reproducibility
    # ------------------------------------------------------------------
    def config_hash(self) -> str:
        """SHA-256 of the canonical config values (seeds + thresholds only)."""
        canonical = {
            "master_seed": self.master_seed,
            "ml_threshold": self.ml_threshold,
            "review_threshold": self.review_threshold,
            "fpr_target": self.fpr_target,
            "weight_ml": self.weight_ml,
            "weight_graph": self.weight_graph,
            "weight_rule": self.weight_rule,
            "prevalence": self.prevalence,
            "population_size": self.population_size,
            "crossover_alpha": self.crossover_alpha,
            "mutation_sigma": self.mutation_sigma,
        }
        payload = json.dumps(canonical, sort_keys=True).encode()
        return hashlib.sha256(payload).hexdigest()[:16]


# Module-level singleton - import this everywhere
cfg = TitanConfig()
