// services/api.ts - Centralized Axios API client
// Spec: frontend_spec.md Section 4.1
// Falls back silently to mock data when backend is unavailable (VITE_DEMO_MODE=true or API unreachable)

import axios from 'axios'
import type {
  DashboardData, AttackVector, ScenarioItem,
  FidelityMetrics, ModelRecord, AtlasCell,
} from '../types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const client = axios.create({ baseURL: BASE, timeout: 30_000 })

// Add response interceptor for consistent error shape
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail
      ?? err.response?.data?.message
      ?? err.message
      ?? 'Unknown API error'
    return Promise.reject(new Error(message))
  }
)

// ---- Request parameter types ----

export interface GenerateParams {
  count?: number
  family?: string
  sophistication?: number
  mutation_strength?: number
  seed?: number
}

export interface SimulationParams {
  n_events?: number
  attack_family?: string
  sophistication?: number
}

export interface RetrainParams {
  target_version: string
  gate_fpr_budget?: number
  gate_recall_delta?: number
}

// ---- API object ----

export const api = {
  // Health
  checkHealth: () => client.get<{ status: string; version: string; model: string }>('/health').then(r => r.data),

  // Dashboard
  getDashboardData: () => client.get<DashboardData>('/overview').then(r => r.data),

  // Taxonomy
  getTaxonomy: () => client.get<AttackVector[]>('/taxonomy').then(r => r.data),
  getKnowledgeGraph: () => client.get<{ nodes: unknown[]; edges: unknown[] }>('/graph/mules').then(r => r.data),

  // Red Team / Attacks
  generateAttacks: (params: GenerateParams = {}) =>
    client.post<ScenarioItem[]>('/attacks/generate', params).then(r => r.data),

  // Scoring
  scoreEvent: (event: Record<string, unknown>) =>
    client.post<{ decision: string; fused_score: number; scores: Record<string, number> }>('/score', event).then(r => r.data),

  // Simulation
  runSimulation: (params: SimulationParams = {}) =>
    client.post<{ scenarios: ScenarioItem[]; summary: Record<string, unknown> }>('/simulate', params).then(r => r.data),

  // Fidelity
  getFidelityMetrics: () => client.get<FidelityMetrics>('/fidelity').then(r => r.data),

  // Models / Blue Team
  getModelBenchmarks: () => client.get<ModelRecord[]>('/models').then(r => r.data),
  executeRetraining: (params: RetrainParams) =>
    client.post<{ status: string; job_id: string }>('/retrain', params).then(r => r.data),
  rollbackModel: (modelId: string) =>
    client.post<{ status: string }>('/models/rollback', { model_id: modelId }).then(r => r.data),

  // Gap Analysis
  getGapAnalysis: () => client.get<{ clusters: unknown[]; evasion_summary: unknown }>('/gap-analysis').then(r => r.data),

  // Evolution history
  getEvolutionHistory: () => client.get<unknown[]>('/evolution').then(r => r.data),

  // MAP-Elites Atlas
  getAtlas: () => client.get<AtlasCell[]>('/atlas').then(r => r.data),

  // Judge Demo (9-step pipeline)
  runJudgeDemo: () =>
    client.post<{ steps: Array<{ step: number; title: string; status: string; details: string }> }>('/judge-demo/run').then(r => r.data),

  // Audit log
  getAuditLog: () => client.get<unknown[]>('/audit').then(r => r.data),

  // Demo mode toggle
  setDemoMode: (enabled: boolean) =>
    client.post<{ status: string }>('/demo-mode', { enabled }).then(r => r.data),
}
