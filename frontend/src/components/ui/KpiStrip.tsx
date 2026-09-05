<<<<<<< HEAD
import React from 'react'
=======
// No React import needed - JSX transform handles this automatically
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e

export interface KpiCellData {
  id: string
  label: string
  value: string
  delta?: string
<<<<<<< HEAD
  tone?: 'good' | 'warn' | 'attack' | 'defense' | 'spot' | 'default'
}

const TONE_COLOR: Record<string, string> = {
  good:    'var(--good)',
  warn:    'var(--warn)',
  attack:  'var(--attack)',
  defense: 'var(--defense)',
  spot:    'var(--spot)',
  default: 'var(--ink)',
}

=======
  // tone is kept for future use but KPI values are always white per design spec
  tone?: 'good' | 'warn' | 'attack' | 'defense' | 'spot' | 'default'
}

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
interface KpiStripProps {
  cells: KpiCellData[]
}

export function KpiStrip({ cells }: KpiStripProps) {
  return (
    <div className="kpi-strip" role="region" aria-label="Key performance indicators">
      {cells.map(cell => (
        <div key={cell.id} className="kpi-cell">
          <div className="kpi-label">{cell.label}</div>
<<<<<<< HEAD
          <div
            className="kpi-value"
            style={{ color: TONE_COLOR[cell.tone ?? 'default'] }}
          >
            {cell.value}
          </div>
          {cell.delta && (
            <div
              className="kpi-delta"
              style={{
                color: cell.delta.startsWith('-') ? 'var(--attack)' : 'var(--good)',
              }}
            >
=======
          {/* KPI values are always white - no per-cell color toning per design spec */}
          <div className="kpi-value">
            {cell.value}
          </div>
          {cell.delta && (
            // Delta is grey only - no color coding per design spec
            <div className="kpi-delta">
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
              {cell.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
