// No React import needed - JSX transform handles this automatically

export interface KpiCellData {
  id: string
  label: string
  value: string
  delta?: string
  // tone is kept for future use but KPI values are always white per design spec
  tone?: 'good' | 'warn' | 'attack' | 'defense' | 'spot' | 'default'
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
          {/* KPI values are always white - no per-cell color toning per design spec */}
          <div className="kpi-value">
            {cell.value}
          </div>
          {cell.delta && (
            // Delta is grey only - no color coding per design spec
            <div className="kpi-delta">
              {cell.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
