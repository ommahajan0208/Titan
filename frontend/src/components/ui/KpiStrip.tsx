import React from 'react'

export interface KpiCellData {
  id: string
  label: string
  value: string
  delta?: string
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

interface KpiStripProps {
  cells: KpiCellData[]
}

export function KpiStrip({ cells }: KpiStripProps) {
  return (
    <div className="kpi-strip" role="region" aria-label="Key performance indicators">
      {cells.map(cell => (
        <div key={cell.id} className="kpi-cell">
          <div className="kpi-label">{cell.label}</div>
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
              {cell.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
