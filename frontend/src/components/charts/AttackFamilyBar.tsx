// components/charts/AttackFamilyBar.tsx
// Horizontal bar chart for attack family distribution.
// Used in RedTeam.tsx (moved from old Dashboard).

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const FAMILY_COLORS: Record<string, string> = {
  mule_network:           'var(--spot)',
  card_testing:           'var(--ink-muted)',
  account_takeover:       'var(--border-strong)',
  synthetic_identity:     '#374151',
  cnp_social_engineering: '#1A1F26',
  behavioral_impersonation:'#1A1F26',
  model_inversion:        '#1A1F26',
  refund_abuse:           '#1A1F26',
  promo_abuse:            '#1A1F26',
}

interface AttackFamilyBarProps {
  data: Record<string, number>
  height?: number
}

export function AttackFamilyBar({ data, height = 220 }: AttackFamilyBarProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    fill: FAMILY_COLORS[name] ?? 'var(--ink-faint)',
  }))

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
            cursor={{ fill: 'var(--bg-raised)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
