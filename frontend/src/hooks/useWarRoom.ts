// hooks/useWarRoom.ts - War Room live state management
// Spec: frontend_spec.md Section 4.4
// Polls /api/adaptive/runs/{runId}/state + /generations every 3 seconds
// while a run is active. Fetches the oracle once after run completes.

import { useState, useEffect, useRef } from 'react'
import { adaptiveApi } from '../services/adaptiveApi'
import type { WarRoomState, GenerationRecord, OracleReport } from '../types'

const POLL_INTERVAL_MS = 3_000

export interface WarRoomHookResult {
  /** Live state from the backend, or null while loading */
  state: WarRoomState | null
  /** Completed generation records, appended each poll tick */
  generations: GenerationRecord[]
  /** Oracle findings, populated when run status = completed */
  oracle: OracleReport | null
  /** True while actively polling */
  polling: boolean
  /** Any error from the last poll attempt */
  error: string | null
}

/**
 * Polls War Room state every 3s while `runId` is non-null.
 * Automatically stops polling when:
 *   - runId becomes null (run stopped or cleared)
 *   - Component unmounts
 *   - All generations are complete (n_generations cap reached)
 *
 * Fetches the oracle report once after the run finishes.
 */
export function useWarRoom(runId: string | null): WarRoomHookResult {
  const [state, setState] = useState<WarRoomState | null>(null)
  const [generations, setGenerations] = useState<GenerationRecord[]>([])
  const [oracle, setOracle] = useState<OracleReport | null>(null)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track whether oracle has been fetched to avoid refetching
  const oracleFetchedRef = useRef(false)

  useEffect(() => {
    if (!runId) {
      // Reset all state when run is cleared
      setState(null)
      setGenerations([])
      setOracle(null)
      setPolling(false)
      setError(null)
      oracleFetchedRef.current = false
      return
    }

    let cancelled = false
    oracleFetchedRef.current = false

    const tick = async () => {
      try {
        const [s, g] = await Promise.all([
          adaptiveApi.getRunState(runId),
          adaptiveApi.getGenerations(runId),
        ])

        if (cancelled) return

        setState(s)
        setGenerations(g)
        setError(null)

        // Fetch oracle once when the run appears complete
        const isComplete = s.n_generations > 0 && g.length >= s.n_generations
        if (isComplete && !oracleFetchedRef.current) {
          oracleFetchedRef.current = true
          adaptiveApi.getOracle(runId)
            .then(o => { if (!cancelled) setOracle(o) })
            .catch(() => { /* oracle is best-effort, don't surface error */ })
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message)
        }
      }
    }

    setPolling(true)
    // Immediate first tick so the UI isn't blank for 3s
    tick()
    const interval = setInterval(tick, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
      setPolling(false)
    }
  }, [runId])

  return { state, generations, oracle, polling, error }
}
