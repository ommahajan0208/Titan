// components/charts/DecisionPieChart.tsx
// Donut chart showing BLOCK / ALERT / ALLOW decision split.

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const PIE_COLORS = ['var(--spot)', '#374151', '#1A1F26']

interface DecisionPieChartProps {
  block: number
  review: number
  allow: number
  height?: number
}

export function DecisionPieChart({ block, review, allow, height = 220 }: DecisionPieChartProps) {
  const data = [
    { name: 'BLOCK',  value: block  },
    { name: 'ALERT',  value: review },
    { name: 'ALLOW',  value: allow  },
  ]

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={48}
            dataKey="value"
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i]} />
            ))}
          </Pie>
          <Legend
            formatter={(value) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>
                {value}
              </span>
            )}
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
