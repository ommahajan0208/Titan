// types/index.ts - All shared TypeScript interfaces for Project Titan
// Derived from frontend_spec.md Section 3

export type AppMode = 'defender' | 'attacker'

export type NavId =
  | 'dashboard'
  | 'threat-catalog'
  | 'red-team'
  | 'blue-team'
  | 'gap-analysis'
  | 'evolution'
  | 'war-room'
  | 'fidelity'
  | 'kyc-lab'
  | 'audit'
  | 'docs'

// The 10 behavioral traits of an attack genome (from sudoWin/genome.py)
export interface GenomeTraits {
  velocity: number
  volume: number
  timing_spread: number
  infra_diversity: number
  graph_footprint: number
  persistence: number
  behavioral_variance: number
  economic_aggression: number
  economic_efficiency: number
  stealth: number
}

// Attack genome (from sudoWin/genome.py)
export interface AttackGenome {
  genome_id: string
  generation: number
  traits: GenomeTraits
  composition: Record<string, number>  // family -> weight
  parent_ids: string[]
  origin: 'mutation' | 'crossover' | 'immigrant'
  operator_log: string[]
  infra_cost?: number
}

// Per-genome attack outcome (from sudoWin/outcomes.py)
export interface AttackOutcome {
  genome_id: string
  generation: number
  n_events: number
  n_evaded: number
  evasion_rate: number
  value_extracted: number
  cost: number
  net_value: number
  novelty_score: number
  mean_scores: { ml: number; graph: number; rule: number }
}

// Per-generation fitness record
export interface FitnessScore {
  evasion_rate: number
  extracted_value: number
  novelty_score: number
  efficiency: number
  composite: number
  pareto_rank: number
  crowding_distance: number
}

export interface EconomySnapshot {
  red_treasury: number
  blue_treasury: number
  balanced: boolean
}

export interface DefensePolicy {
  ml_threshold: number
  graph_weight: number
  fpr_target: number
  trust_region: number
  adaptation_rate: number
}

export interface RedStrategySummary {
  dominant_family: string
  composite_share: number
  population_size: number
}

// One generation's complete record (from sudoWin/records.py)
export interface GenerationRecord {
  generation: number
  run_id: string
  detection_rate_fixed_set: number
  detection_rate_new_vectors: number
  recall: number
  precision: number
  false_positive_rate: number
  arms_race_index: number
  arms_race_regime: 'red_ascendant' | 'blue_ascendant' | 'contested' | 'stalemate'
  novelty_archive_size: number
  n_emergent_events: number
  economy: EconomySnapshot
  blue_policy: DefensePolicy
  red_strategy_summary: RedStrategySummary
  elapsed_seconds: number
}

// From AegisPay/frontend/src/types.ts
export interface AttackVector {
  id: string
  family: string
  name: string
  gen_ai: boolean
  sophistication: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  detectability: 'VERY LOW' | 'LOW' | 'MEDIUM' | 'HIGH'
  evasion_strategy: string
  signals: string[]
  description: string
  mitigation_policy: string
  affected_channel?: string
  threat_actor_profile?: string
}

export interface ScenarioItem {
  id: string
  attack_family: string
  attack_vector_id: string
  sophistication_level: number
  is_fraud: boolean
  ml_score: number
  graph_score: number
  rule_score: number
  fused_score: number
  decision: 'BLOCK' | 'REVIEW' | 'ALLOW'
  evaded_detection: boolean
  mutation_log: string[]
}

// From ai-defense-lab/web/src/lib/contracts.ts
export interface Generation {
  generation: number
  detection_rate_fixed_set?: number
  detection_rate_new_vectors?: number
  detection_rate?: number
  metrics_seen: { recall: number; precision: number; fpr: number }
}

export interface MissesFile {
  generation: number
  misses: string[]
}

// Graph nodes for AccountNebula3D (from ai-defense-lab)
export interface NebulaNode {
  id: string
  passthrough: number   // 0..1, > 0.85 = likely mule
  degree: number
  isMule: boolean
}

export interface NebulaEdge {
  source: number
  target: number
}

// MAP-Elites atlas cell
export interface AtlasCell {
  cell_id: string
  x: number              // velocity bin (0..9)
  y: number              // graph_footprint bin (0..11)
  visited: boolean
  evasion_rate: number
  hardened: boolean
  elite_genome_id?: string
}

// War Room live state
export interface WarRoomState {
  n_generations: number
  arms_race: { value: number; regime: string }
  red: {
    population_size: number
    composite_share: number
    family_distribution: Record<string, number>
    memory_size?: number
  }
  blue: {
    adaptation_rate: number
    adaptive: boolean
    policy: Record<string, number>
  }
  novelty: { archive_size: number; n_emergent_events: number }
  economy: {
    balanced: boolean
    balances: Record<string, number>
  }
  latest_generation: Partial<GenerationRecord>
}

export interface RunSummary {
  run_id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  mode: string
  generations: number
  seed: number
  created_at: string
}

export interface OracleReport {
  regime: 'red_ascendant' | 'blue_ascendant' | 'contested' | 'stalemate'
  arms_race: { value: number }
  findings: Array<{ key: string; detail: string }>
  summary: string
}

// Fidelity metrics
export interface FidelityMetrics {
  simulator_calibrated_phi: number
  ks_stats: Record<string, { ks: number; p_value: number; pass: boolean }>
  wasserstein_distance: number
  provenance_auc: number
  fidelity_score: number
}

// Dashboard data
export interface DashboardData {
  kpis: {
    arms_race_index: number
    arms_race_regime: string
    recall: number
    fpr: number
    model_version: string
  }
  decision_split: { block: number; review: number; allow: number }
  recent_scenarios: ScenarioItem[]
  attack_families: Record<string, number>
}

// Notification
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warn' | 'error'
  message: string
  timestamp: number
}

// Model record
export interface ModelRecord {
  model_id: string
  version: string
  recall: number
  precision: number
  f1: number
  fpr: number
  roc_auc: number
  fidelity_score: number
  created_at: string
  is_active: boolean
  training_notes?: string
}

// Live payment stream row (Phase 3)
export type PaymentRail = 'UPI_P2M' | 'IMPS' | 'NEFT' | 'RTP_FEDNOW' | 'SEPA_INST' | 'CARD_CNP'
export type PaymentChannel = 'mobile' | 'web' | 'agentic' | 'IVR'
export type StreamDecision = 'APPROVE' | 'ALERT' | 'BLOCK'
export type DetectionLayer = 'L0' | 'L1' | 'L2' | 'L3'
export type StreamOutcome = 'TP' | 'TN' | 'FP' | 'FN'

export interface ScoredPayment {
  txn_id: string
  timestamp: string          // HH:MM:SS format
  payer_id: string           // short anonymised ID, e.g. "TXN_7F2A"
  amount: number             // INR
  rail: PaymentRail
  channel: PaymentChannel
  attack_family: string | null   // from Titan's 36-vector taxonomy, null if legit
  attack_vector_id: string | null
  score: number              // 0.0 - 1.0
  decision: StreamDecision
  layer_fired: DetectionLayer | null  // null for APPROVEs
  is_fraud: boolean          // ground truth label
  // outcome (TP/TN/FP/FN) is derived at render time from { decision, is_fraud }
}

export interface StreamCounters {
  scored: number
  blocksRaised: number
  alertsRaised: number
  approvalsIssued: number
  valueStopped: number       // INR, only climbs on BLOCK/ALERT where is_fraud=true
  fraudSeen: number
  fraudStopped: number
  legitimateCount: number
  falsePositives: number
  realisedFpr: number | null // null until legitimateCount >= 200
}

/** Derive the confusion-matrix outcome from decision + ground truth */
export function deriveOutcome(decision: StreamDecision, is_fraud: boolean): StreamOutcome {
  if (is_fraud && decision !== 'APPROVE') return 'TP'
  if (!is_fraud && decision === 'APPROVE') return 'TN'
  if (!is_fraud && decision !== 'APPROVE') return 'FP'
  return 'FN' // is_fraud && decision === 'APPROVE'
}
