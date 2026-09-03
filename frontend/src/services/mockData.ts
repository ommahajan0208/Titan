// services/mockData.ts
// Complete mock data for demo mode (VITE_DEMO_MODE=true)
// All data is deterministic and illustrative.

import type {
  DashboardData, AttackVector, ScenarioItem, GenerationRecord,
  AtlasCell, NebulaNode, NebulaEdge, WarRoomState, ModelRecord, FidelityMetrics
} from '../types'

export const MOCK_DASHBOARD: DashboardData = {
  kpis: {
    arms_race_index: 0.142,
    arms_race_regime: 'blue_ascendant',
    recall: 92.8,
    fpr: 1.0,
    model_version: 'v3.0',
  },
  decision_split: { block: 58, review: 23, allow: 19 },
  recent_scenarios: [
    { id: 's1', attack_family: 'mule_network',        attack_vector_id: 'MUL-02', sophistication_level: 8.2, is_fraud: true,  ml_score: 0.91, graph_score: 0.87, rule_score: 0.72, fused_score: 0.88, decision: 'BLOCK',  evaded_detection: false, mutation_log: ['jitter:3', 'stealth+0.12'] },
    { id: 's2', attack_family: 'card_testing',        attack_vector_id: 'CNP-01', sophistication_level: 5.1, is_fraud: true,  ml_score: 0.64, graph_score: 0.55, rule_score: 0.90, fused_score: 0.69, decision: 'REVIEW', evaded_detection: false, mutation_log: ['velocity-0.14'] },
    { id: 's3', attack_family: 'synthetic_identity',  attack_vector_id: 'SYN-03', sophistication_level: 9.0, is_fraud: true,  ml_score: 0.29, graph_score: 0.18, rule_score: 0.12, fused_score: 0.23, decision: 'ALLOW',  evaded_detection: true,  mutation_log: ['compose+mule_network', 'guided:ml+graph'] },
    { id: 's4', attack_family: 'account_takeover',    attack_vector_id: 'ATO-01', sophistication_level: 7.5, is_fraud: true,  ml_score: 0.82, graph_score: 0.79, rule_score: 0.68, fused_score: 0.79, decision: 'BLOCK',  evaded_detection: false, mutation_log: ['jitter:2'] },
    { id: 's5', attack_family: 'mule_network',        attack_vector_id: 'MUL-04', sophistication_level: 8.9, is_fraud: true,  ml_score: 0.41, graph_score: 0.88, rule_score: 0.30, fused_score: 0.55, decision: 'REVIEW', evaded_detection: false, mutation_log: ['footprint-0.13'] },
  ],
  attack_families: {
    mule_network: 32, card_testing: 21, account_takeover: 18,
    synthetic_identity: 12, cnp_social_engineering: 9, refund_abuse: 5, promo_abuse: 3,
  },
}

export const MOCK_TAXONOMY: AttackVector[] = [
  { id: 'ATO-01', family: 'Account Takeover', name: 'Distributed Credential Probing', gen_ai: false, sophistication: 6.5, severity: 'HIGH',     detectability: 'MEDIUM',   evasion_strategy: 'Spread probes across thousands of IPs with micro-delays', signals: ['velocity_1h', 'ip_diversity', 'decline_rate'], description: 'Automated probing of credential pairs using rotating residential proxies with jitter to stay below velocity thresholds.', mitigation_policy: 'Progressive CAPTCHA + IP reputation scoring + OTP step-up after 3 failures', affected_channel: 'Online Banking', threat_actor_profile: 'Organized criminal group' },
  { id: 'ATO-02', family: 'Account Takeover', name: 'Carrier Migration Liquidity Drain', gen_ai: false, sophistication: 8.0, severity: 'CRITICAL', detectability: 'LOW',     evasion_strategy: 'Port SIM before account drain to intercept OTPs', signals: ['sim_port_flag', 'carrier_change', 'high_value_transfer'], description: 'SIM swap attack exploiting carrier porting APIs. Once the number is ported, all SMS OTPs are redirected to attacker.', mitigation_policy: 'Carrier migration hold + 24h velocity cap + biometric step-up', affected_channel: 'Mobile Banking', threat_actor_profile: 'Insider threat + external actor' },
  { id: 'ATO-03', family: 'Account Takeover', name: 'Passkey WebAuthn Downgrade', gen_ai: true,  sophistication: 9.2, severity: 'CRITICAL', detectability: 'VERY LOW', evasion_strategy: 'Force SMS OTP fallback on high-value transactions', signals: ['auth_downgrade', 'transaction_value', 'device_mismatch'], description: 'GenAI-assisted attack that triggers a silent WebAuthn-to-SMS downgrade for transactions over the configurable threshold.', mitigation_policy: 'Hard block on silent downgrade attempts above threshold', affected_channel: 'All Digital', threat_actor_profile: 'State-sponsored advanced group' },
  { id: 'BIO-01', family: 'Behavioral Impersonation', name: 'GAN Keystroke Synthesis', gen_ai: true,  sophistication: 9.5, severity: 'CRITICAL', detectability: 'VERY LOW', evasion_strategy: 'GAN synthesizes victim-specific keystroke + pointer dynamics', signals: ['behavioral_anomaly', 'typing_rhythm_mismatch', 'pointer_acceleration'], description: 'Generative model trained on captured keystroke data synthesizes plausible behavioral biometrics for a target victim.', mitigation_policy: 'Adversarially trained behavioral model + liveness challenge', affected_channel: 'Web Portal', threat_actor_profile: 'Advanced persistent threat' },
  { id: 'SYN-01', family: 'Synthetic Identity', name: 'Frankenstein KYC Bypass', gen_ai: true,  sophistication: 8.8, severity: 'HIGH',     detectability: 'LOW',     evasion_strategy: 'Combine real SSN with synthetic face + address', signals: ['ssn_age_mismatch', 'face_match_score', 'address_velocity'], description: 'Synthetic identity created from real SSN (often a minor or deceased), synthetic face generated by diffusion model, real address.', mitigation_policy: 'SSN age graph + ArcFace face match + velocity on SSN linkage', affected_channel: 'Onboarding', threat_actor_profile: 'Identity fraud ring' },
  { id: 'MUL-01', family: 'Mule Network', name: 'LLM-Designed Fan-Out Layering', gen_ai: true,  sophistication: 9.0, severity: 'CRITICAL', detectability: 'VERY LOW', evasion_strategy: 'LLM designs mule topology to maximize layering complexity', signals: ['fan_out_degree', 'passthrough_ratio', 'network_centrality'], description: 'LLM analyzes the target bank\'s published fraud detection signals and designs a mule network topology that minimizes detectable graph footprint.', mitigation_policy: 'GraphSAGE fan-in percentile + passthrough ratio threshold', affected_channel: 'Wire Transfers', threat_actor_profile: 'Transnational organized crime' },
  { id: 'CNP-01', family: 'Card-Not-Present', name: 'Salami Slicing', gen_ai: false, sophistication: 4.5, severity: 'MEDIUM',   detectability: 'HIGH',    evasion_strategy: 'Keep transaction amounts just below alert thresholds', signals: ['is_round_amount', 'velocity_1h', 'merchant_category'], description: 'Systematic harvesting of small amounts from many accounts. Each individual transaction is below the review threshold.', mitigation_policy: 'Aggregate velocity window + cumulative amount monitoring per account', affected_channel: 'E-commerce', threat_actor_profile: 'Opportunistic fraudster' },
  { id: 'ADV-01', family: 'Model Inversion', name: 'Zero-Shot Gradient Perturbation', gen_ai: true,  sophistication: 9.8, severity: 'CRITICAL', detectability: 'VERY LOW', evasion_strategy: 'Black-box model boundary probing via repeated queries', signals: ['query_volume', 'near_threshold_decisions', 'feature_perturbation'], description: 'Advanced attacker probes the production model decision boundary using a surrogate model trained on responses. NOTE: Academic research only.', mitigation_policy: 'Query rate limiting + decision boundary noise injection + honeypot transactions', affected_channel: 'API', threat_actor_profile: 'State-sponsored researcher' },
]

export const MOCK_GENERATIONS: GenerationRecord[] = Array.from({ length: 10 }, (_, i) => ({
  generation: i + 1,
  run_id: 'mock-run-001',
  detection_rate_fixed_set: 0.70 + i * 0.025,
  detection_rate_new_vectors: 0.55 + i * 0.035,
  recall: 0.82 + i * 0.012,
  precision: 0.91 + i * 0.003,
  false_positive_rate: 0.018 - i * 0.001,
  arms_race_index: -0.1 + i * 0.03,
  arms_race_regime: i < 3 ? 'red_ascendant' : i < 7 ? 'contested' : 'blue_ascendant',
  novelty_archive_size: 5 + i * 3,
  n_emergent_events: Math.max(0, 4 - i),
  economy: { red_treasury: 1240 - i * 30, blue_treasury: 890 + i * 20, balanced: true },
  blue_policy: { ml_threshold: 0.55 + i * 0.008, graph_weight: 0.22 + i * 0.003, fpr_target: 0.01, trust_region: 0.05, adaptation_rate: 0.002 + i * 0.0001 },
  red_strategy_summary: { dominant_family: i < 5 ? 'card_testing' : 'mule_network', composite_share: 0.25 + i * 0.01, population_size: 12 },
  elapsed_seconds: 4.2 + i * 1.1,
}))

export const MOCK_ATLAS_CELLS: AtlasCell[] = Array.from({ length: 120 }, (_, i) => {
  const x = i % 10
  const y = Math.floor(i / 10)
  const seed = (x * 7 + y * 13) % 100
  const visited = seed > 30
  const hardened = visited && seed < 50
  const evasion_rate = visited ? (seed % 70) / 100 : 0
  return {
    cell_id: `${x}-${y}`,
    x, y, visited,
    evasion_rate,
    hardened,
    elite_genome_id: visited ? `g-${x}-${y}` : undefined,
  }
})

export const MOCK_MULE_NODES: NebulaNode[] = Array.from({ length: 40 }, (_, i) => ({
  id: `n${i}`,
  passthrough: i < 8 ? 0.88 + Math.random() * 0.1 : Math.random() * 0.6,
  degree: Math.floor(Math.random() * 12) + 1,
  isMule: i < 8,
}))

export const MOCK_MULE_EDGES: NebulaEdge[] = Array.from({ length: 60 }, (_, i) => ({
  source: Math.floor(Math.random() * 40),
  target: Math.floor(Math.random() * 40),
}))

export const MOCK_WAR_ROOM_STATE: WarRoomState = {
  n_generations: 7,
  arms_race: { value: 0.142, regime: 'blue_ascendant' },
  red: {
    population_size: 12,
    composite_share: 0.33,
    family_distribution: { card_testing: 0.45, mule_network: 0.33, synthetic_identity: 0.22 },
    memory_size: 47,
  },
  blue: {
    adaptation_rate: 0.0023,
    adaptive: true,
    policy: { ml_threshold: 0.62, fpr_target: 0.01, graph_weight: 0.25 },
  },
  novelty: { archive_size: 31, n_emergent_events: 4 },
  economy: {
    balanced: true,
    balances: { 'red.treasury': 1240.50, 'blue.treasury': 890.30 },
  },
  latest_generation: { recall: 0.928, false_positive_rate: 0.0102 },
}

export const MOCK_MODELS: ModelRecord[] = [
  { model_id: 'm1', version: 'v1.0', recall: 0.82, precision: 0.89, f1: 0.854, fpr: 0.028, roc_auc: 0.94, fidelity_score: 0.82, created_at: '2026-08-01T10:00:00Z', is_active: false, training_notes: 'Baseline XGBoost on clean synthetic data' },
  { model_id: 'm2', version: 'v2.0', recall: 0.91, precision: 0.93, f1: 0.920, fpr: 0.015, roc_auc: 0.97, fidelity_score: 0.85, created_at: '2026-08-10T14:00:00Z', is_active: false, training_notes: 'Adversarial hardening round 1 - 250 counter-examples' },
  { model_id: 'm3', version: 'v3.0', recall: 0.928, precision: 0.941, f1: 0.934, fpr: 0.010, roc_auc: 0.986, fidelity_score: 0.88, created_at: '2026-08-20T09:00:00Z', is_active: true,  training_notes: 'Adversarial hardening round 2 - mule network focus' },
]

export const MOCK_FIDELITY: FidelityMetrics = {
  simulator_calibrated_phi: 0.847,
  ks_stats: {
    amount:           { ks: 0.042, p_value: 0.31, pass: true },
    velocity_1h:      { ks: 0.038, p_value: 0.44, pass: true },
    decline_rate_24h: { ks: 0.071, p_value: 0.09, pass: true },
    geo_mismatch:     { ks: 0.029, p_value: 0.62, pass: true },
    new_device_flag:  { ks: 0.055, p_value: 0.18, pass: true },
  },
  wasserstein_distance: 0.083,
  provenance_auc: 0.512,
  fidelity_score: 84.7,
}
