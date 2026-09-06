// components/charts/PrecisionRecallChart.tsx
// Line chart for precision and recall over generations.

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'

interface PRPoint {
  generation: number
  recall: number
  precision: number
}

interface PrecisionRecallChartProps {
  data: PRPoint[]
  height?: number
}

export function PrecisionRecallChart({ data, height = 200 }: PrecisionRecallChartProps) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" />
          <XAxis
            dataKey="generation"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }}
            label={{ value: 'Generation', position: 'insideBottomRight', offset: -4, style: { fill: 'var(--ink-faint)', fontSize: 10 } }}
          />
          <YAxis
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }}
            domain={[0.7, 1]}
            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
            formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>
                {value}
              </span>
            )}
          />
          <Line type="monotone" dataKey="recall"    stroke="var(--spot)"     strokeWidth={2} dot={{ fill: 'var(--spot)',     r: 3 }} />
          <Line type="monotone" dataKey="precision" stroke="var(--ink-muted)" strokeWidth={2} dot={{ fill: 'var(--ink-muted)', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
