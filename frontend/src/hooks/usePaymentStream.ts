// hooks/usePaymentStream.ts
// Live payment stream hook for the Dashboard.
//
// Architecture:
//   - setTimeout rescheduled per tick (NOT setInterval) to prevent burst
//     catch-up when the tab is backgrounded.
//   - Row cursor walks the source[] array, wrapping around (infinite loop).
//   - New rows accumulate in a useRef buffer, flushed to state on
//     requestAnimationFrame - one state write per paint frame.
//   - Visible rows capped at 60 (DOM budget), history buffer capped at 300.
//   - Counters accumulate in a ref (not state) on every tick, flushed with
//     rows on rAF.
//   - FPR calculation suppressed until legitimateCount >= 200.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScoredPayment, StreamCounters } from '../types'

export type StreamRate = 2 | 4 | 8 | 16

const VISIBLE_CAP = 60
const HISTORY_CAP = 300

const INITIAL_COUNTERS: StreamCounters = {
  scored: 0,
  blocksRaised: 0,
  alertsRaised: 0,
  approvalsIssued: 0,
  valueStopped: 0,
  fraudSeen: 0,
  fraudStopped: 0,
  legitimateCount: 0,
  falsePositives: 0,
  realisedFpr: null,
}

interface StreamState {
  rows: ScoredPayment[]
  counters: StreamCounters
}

interface UsePaymentStreamResult {
  rows: ScoredPayment[]
  counters: StreamCounters
  running: boolean
  rate: StreamRate
  setRate: (r: StreamRate) => void
  toggle: () => void
  reset: () => void
  position: number
  total: number
}

export function usePaymentStream(
  source: ScoredPayment[],
  autoStart = false,
  initialRate: StreamRate = 8
): UsePaymentStreamResult {
  const [state, setState] = useState<StreamState>({ rows: [], counters: INITIAL_COUNTERS })
  const [running, setRunning] = useState(autoStart)
  const [rate, setRate] = useState<StreamRate>(initialRate)

  // Refs: mutable state that does NOT trigger renders
  const cursorRef   = useRef(0)
  const runningRef  = useRef(running)
  const rateRef     = useRef(rate)
  const pendingRef  = useRef<ScoredPayment[]>([])
  const cntRef      = useRef<StreamCounters>({ ...INITIAL_COUNTERS })
  const rafRef      = useRef<number | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep refs in sync
  useEffect(() => { runningRef.current = running }, [running])
  useEffect(() => { rateRef.current = rate }, [rate])

  // rAF flush: drains pendingRef into React state once per paint frame
  const scheduleFlush = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      if (pendingRef.current.length === 0) return

      const newRows = pendingRef.current.splice(0)
      pendingRef.current = []

      setState(prev => {
        const merged = [...newRows, ...prev.rows]
        return {
          rows: merged.slice(0, VISIBLE_CAP),
          counters: { ...cntRef.current },
        }
      })
    })
  }, [])

  // Accumulate one row into the counters ref (no render)
  const accumulateCounters = useCallback((row: ScoredPayment) => {
    const c = cntRef.current
    c.scored++

    if (row.decision === 'BLOCK') c.blocksRaised++
    else if (row.decision === 'ALERT') c.alertsRaised++
    else c.approvalsIssued++

    if (row.is_fraud) {
      c.fraudSeen++
      if (row.decision !== 'APPROVE') {
        c.fraudStopped++
        c.valueStopped += row.amount
      }
    } else {
      c.legitimateCount++
      if (row.decision !== 'APPROVE') {
        c.falsePositives++
      }
    }

    // FPR: suppress until 200+ legitimate rows
    if (c.legitimateCount >= 200) {
      c.realisedFpr = Math.round((c.falsePositives / c.legitimateCount) * 10000) / 100
    } else {
      c.realisedFpr = null
    }
  }, [])

  // Main tick function - reschedules itself via setTimeout
  const tick = useCallback(() => {
    if (!runningRef.current || source.length === 0) return

    const row = source[cursorRef.current % source.length]
    cursorRef.current++

    accumulateCounters(row)
    pendingRef.current.push(row)
    scheduleFlush()

    // Reschedule - interval in ms derived from rows/second rate
    const msPerRow = Math.floor(1000 / rateRef.current)
    timerRef.current = setTimeout(tick, msPerRow)
  }, [source, accumulateCounters, scheduleFlush])

  // Start/stop the stream
  useEffect(() => {
    if (running) {
      timerRef.current = setTimeout(tick, Math.floor(1000 / rate))
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const toggle = useCallback(() => {
    setRunning(r => !r)
  }, [])

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    timerRef.current = null
    rafRef.current = null
    cursorRef.current = 0
    pendingRef.current = []
    cntRef.current = { ...INITIAL_COUNTERS }
    setState({ rows: [], counters: { ...INITIAL_COUNTERS } })
    // Restart after reset if was running
    if (runningRef.current) {
      timerRef.current = setTimeout(tick, Math.floor(1000 / rateRef.current))
    }
  }, [tick])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return {
    rows: state.rows,
    counters: state.counters,
    running,
    rate,
    setRate: (r) => setRate(r),
    toggle,
    reset,
    position: cursorRef.current,
    total: source.length,
  }
}
