// services/adaptiveApi.ts - War Room / Co-Evolution API
// Spec: frontend_spec.md Section 4.2
// Derived from sudoWin/frontend/src/api/client.ts

import { client } from './api'
import type { WarRoomState, GenerationRecord, AttackGenome, RunSummary, OracleReport } from '../types'

export interface StartRunParams {
  seed?: number
  generations?: number
  mode?: 'fast' | 'thorough' | 'stealth'
}

export const adaptiveApi = {
  // Start a new co-evolution run
  startRun: (params: StartRunParams = {}) =>
    client.post<{ run_id: string }>('/adaptive/runs', {
      seed: 42,
      generations: 10,
      mode: 'fast',
      ...params,
    }).then(r => r.data),

  // List all runs (for run selector UI)
  listRuns: () =>
    client.get<RunSummary[]>('/adaptive/runs').then(r => r.data),

  // Poll live state for a running run (every 3s in useWarRoom)
  getRunState: (runId: string) =>
    client.get<WarRoomState>(`/adaptive/runs/${runId}/state`).then(r => r.data),

  // Get all completed generation records
  getGenerations: (runId: string) =>
    client.get<GenerationRecord[]>(`/adaptive/runs/${runId}/generations`).then(r => r.data),

  // Get oracle analysis (available after run completes)
  getOracle: (runId: string) =>
    client.get<OracleReport>(`/adaptive/runs/${runId}/oracle`).then(r => r.data),

  // Get the red team's full genome library
  getRedLibrary: (runId: string) =>
    client.get<AttackGenome[]>(`/adaptive/runs/${runId}/red/library`).then(r => r.data),

  // Stop a running run
  stopRun: (runId: string) =>
    client.delete<{ status: string }>(`/adaptive/runs/${runId}`).then(r => r.data),
}
