// components/ui/StreamControls.tsx
// Three controls: PAUSE/RESUME, rate selector, RESET.
// Always shows the DEMO OVERSAMPLING label - never hidden.

import type { StreamRate } from '../../hooks/usePaymentStream'

interface StreamControlsProps {
  running: boolean
  rate: StreamRate
  onToggle: () => void
  onRateChange: (r: StreamRate) => void
  onReset: () => void
  streamMode?: 'DEMO' | 'LIVE'
}

const RATES: StreamRate[] = [2, 4, 8, 16]

export function StreamControls({
  running,
  rate,
  onToggle,
  onRateChange,
  onReset,
  streamMode = 'DEMO',
}: StreamControlsProps) {
  return (
    <div className="stream-controls">
      {/* Stream mode label */}
      <span style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em' }}>
        STREAM::{streamMode}
      </span>

      {/* Pause / Resume */}
      <button
        id="stream-toggle-btn"
        className="btn btn-ghost btn-sm"
        onClick={onToggle}
      >
        {running ? 'PAUSE' : 'RESUME'}
      </button>

      {/* Rate selector */}
      <select
        id="stream-rate-select"
        value={rate}
        onChange={e => onRateChange(Number(e.target.value) as StreamRate)}
        aria-label="Stream rate rows per second"
      >
        {RATES.map(r => (
          <option key={r} value={r}>{r} rows/s</option>
        ))}
      </select>

      {/* Reset */}
      <button
        id="stream-reset-btn"
        className="btn btn-ghost btn-sm"
        onClick={onReset}
      >
        RESET
      </button>

      {/* Fraud oversampling disclosure - always visible, non-negotiable */}
      <span className="stream-controls-label">
        DEMO OVERSAMPLING: FRAUD 25x vs ~1% PRODUCTION
      </span>
    </div>
  )
}
