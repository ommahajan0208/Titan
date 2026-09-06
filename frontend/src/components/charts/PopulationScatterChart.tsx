// components/charts/PopulationScatterChart.tsx
// Scatter chart for NSGA-II population: evasion_rate vs novelty_score,
// colored by pareto_rank. Used in WarRoom and Evolution pages.

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'

interface PopulationPoint {
  evasion_rate: number
  novelty_score: number
  pareto_rank: number
  genome_id?: string
}

interface PopulationScatterChartProps {
  data: PopulationPoint[]
  height?: number
}

function rankToColor(rank: number): string {
  if (rank <= 1) return 'var(--spot)'
  if (rank <= 3) return 'var(--ink-muted)'
  return 'var(--ink-faint)'
}

export function PopulationScatterChart({ data, height = 260 }: PopulationScatterChartProps) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <XAxis
            dataKey="evasion_rate"
            type="number"
            domain={[0, 1]}
            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }}
            label={{ value: 'Evasion Rate', position: 'insideBottom', offset: -4, style: { fill: 'var(--ink-faint)', fontSize: 10 } }}
          />
          <YAxis
            dataKey="novelty_score"
            type="number"
            domain={[0, 1]}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }}
            label={{ value: 'Novelty', angle: -90, position: 'insideLeft', style: { fill: 'var(--ink-faint)', fontSize: 10 } }}
          />
          <ZAxis range={[30, 80]} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
            cursor={{ stroke: 'var(--border-strong)' }}
          />
          {/* Group by pareto rank for color */}
          {[1, 2, 3, 4].map(rank => (
            <Scatter
              key={rank}
              name={`Rank ${rank}`}
              data={data.filter(d => d.pareto_rank === rank)}
              fill={rankToColor(rank)}
              opacity={0.85}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
