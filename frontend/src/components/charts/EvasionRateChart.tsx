// components/charts/EvasionRateChart.tsx
// Line chart showing evasion rate across model versions / generations.

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts'

interface EvasionPoint {
  label: string
  evasion: number
}

interface EvasionRateChartProps {
  data: EvasionPoint[]
  height?: number
}

export function EvasionRateChart({ data, height = 180 }: EvasionRateChartProps) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }}
          />
          <YAxis
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
          />
          <ReferenceLine y={0} stroke="var(--good)" strokeDasharray="4 2" />
          <Line
            type="monotone"
            dataKey="evasion"
            stroke="var(--attack)"
            strokeWidth={2}
            dot={{ fill: 'var(--attack)', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
