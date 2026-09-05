<<<<<<< HEAD
import React from 'react'
=======
<<<<<<< HEAD
=======
import React from 'react'
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge, DecisionBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAppStore } from '../stores/appStore'
import { MOCK_DASHBOARD } from '../services/mockData'
<<<<<<< HEAD
import { useApiData } from '../hooks/useApiData'
import { api } from '../services/api'
=======
<<<<<<< HEAD
=======
import { useApiData } from '../hooks/useApiData'
import { api } from '../services/api'
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
import { Play, RefreshCw, Swords } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
<<<<<<< HEAD
import type { DashboardData } from '../types'
=======
<<<<<<< HEAD
>>>>>>> origin/main

// Chart color rules from design spec:
// Bar charts: inactive=dark grey, secondary=medium grey, important=--ink-muted, selected=electric blue
// Donut: dominant=electric blue, secondary=medium grey, tertiary=dark grey
const FAMILY_COLORS: Record<string, string> = {
  mule_network:          'var(--spot)',      // selected/dominant: electric blue
  card_testing:          '#4B5563',          // secondary grey
  account_takeover:      '#374151',          // medium grey
  synthetic_identity:    '#1F2937',          // dark grey
  cnp_social_engineering:'#374151',
  refund_abuse:          '#1F2937',
  promo_abuse:           '#1F2937',
}
const PIE_COLORS = ['var(--defense)', '#374151', '#1A1F26']

export default function Dashboard() {
  const setTab   = useAppStore(s => s.setActiveTab)
  const setJudge = useAppStore(s => s.setJudgeDemoOpen)
  const isDemoMode = useAppStore(s => s.isDemoMode)

<<<<<<< HEAD
=======
  const familyData = Object.entries(data.attack_families).map(([name, value]) => ({
=======
import type { DashboardData } from '../types'

// Chart color rules from design spec:
// Bar charts: inactive=dark grey, secondary=medium grey, important=--ink-muted, selected=electric blue
// Donut: dominant=electric blue, secondary=medium grey, tertiary=dark grey
const FAMILY_COLORS: Record<string, string> = {
  mule_network:          'var(--spot)',      // selected/dominant: electric blue
  card_testing:          '#4B5563',          // secondary grey
  account_takeover:      '#374151',          // medium grey
  synthetic_identity:    '#1F2937',          // dark grey
  cnp_social_engineering:'#374151',
  refund_abuse:          '#1F2937',
  promo_abuse:           '#1F2937',
}
const PIE_COLORS = ['var(--defense)', '#374151', '#1A1F26']

export default function Dashboard() {
  const setTab   = useAppStore(s => s.setActiveTab)
  const setJudge = useAppStore(s => s.setJudgeDemoOpen)
  const isDemoMode = useAppStore(s => s.isDemoMode)

>>>>>>> origin/main
  const { data, loading, refetch } = useApiData<DashboardData>(
    () => api.getDashboardData(),
    [],
    { skip: isDemoMode, fallback: MOCK_DASHBOARD }
  )

  const d = data ?? MOCK_DASHBOARD

  const familyData = Object.entries(d.attack_families).map(([name, value]) => ({
<<<<<<< HEAD
=======
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
    name: name.replace(/_/g, ' '), value, fill: FAMILY_COLORS[name] ?? '#8b949e'
  }))

  const pieData = [
<<<<<<< HEAD
    { name: 'BLOCK', value: d.decision_split.block },
    { name: 'REVIEW', value: d.decision_split.review },
    { name: 'ALLOW',  value: d.decision_split.allow },
  ]

  const kpi = d.kpis

=======
<<<<<<< HEAD
    { name: 'BLOCK', value: data.decision_split.block },
    { name: 'REVIEW', value: data.decision_split.review },
    { name: 'ALLOW',  value: data.decision_split.allow },
  ]

=======
    { name: 'BLOCK', value: d.decision_split.block },
    { name: 'REVIEW', value: d.decision_split.review },
    { name: 'ALLOW',  value: d.decision_split.allow },
  ]

  const kpi = d.kpis

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
  return (
    <div className="page">
      <div className="page-header stagger" style={{ '--p': 1 } as React.CSSProperties}>
        <h1 className="page-title" style={{ '--i': 0 } as React.CSSProperties}>
          Overview
        </h1>
        <p className="page-subtitle" style={{ '--i': 1 } as React.CSSProperties}>
          Operational status of the AI Defense Lab
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-4 mb-6 stagger" style={{ '--p': 1 } as React.CSSProperties}>
<<<<<<< HEAD
=======
<<<<<<< HEAD
        <StatCard label="Arms Race Index"    value="0.142"   sub="blue_ascendant"   tone="good"    style={{ '--i': 0 } as React.CSSProperties} />
        <StatCard label="Detection Recall"   value="92.8%"   sub="+1.2% vs v2.0"   tone="good"    style={{ '--i': 1 } as React.CSSProperties} />
        <StatCard label="False Positive Rate" value="1.00%" sub="@ 1% FPR budget"   tone="warn"    style={{ '--i': 2 } as React.CSSProperties} />
        <StatCard label="Active Model"       value="v3.0"    sub="Defense hardened" tone="default" style={{ '--i': 3 } as React.CSSProperties} />
=======
>>>>>>> origin/main
        <StatCard
          label="Arms Race Index"
          value={kpi.arms_race_index.toFixed(3)}
          sub={kpi.arms_race_regime}
          tone={kpi.arms_race_regime === 'blue_ascendant' ? 'good' : kpi.arms_race_regime === 'red_ascendant' ? 'bad' : 'warn'}
          style={{ '--i': 0 } as React.CSSProperties}
        />
        <StatCard
          label="Detection Recall"
          value={`${kpi.recall.toFixed(1)}%`}
          sub="+1.2% vs v2.0"
          tone="good"
          style={{ '--i': 1 } as React.CSSProperties}
        />
        <StatCard
          label="False Positive Rate"
          value={`${kpi.fpr.toFixed(2)}%`}
          sub="@ 1% FPR budget"
          tone="warn"
          style={{ '--i': 2 } as React.CSSProperties}
        />
        <StatCard
          label="Active Model"
          value={kpi.model_version}
          sub="Defense hardened"
          tone="default"
          style={{ '--i': 3 } as React.CSSProperties}
        />
<<<<<<< HEAD
=======
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
      </div>

      {/* Main grid */}
      <div className="grid grid-2 mb-6" style={{ alignItems: 'start' }}>

        {/* Attack families */}
        <Card>
          <div className="chart-title">Red Team Activity - Attack Family Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={familyData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category" dataKey="name" width={150}
                tick={{ fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }}
                cursor={{ fill: 'var(--bg-raised)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {familyData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Decision split */}
        <Card>
          <div className="chart-title">Decision Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                outerRadius={80}
                innerRadius={48}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
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
                contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent scenarios */}
      <Card noPad className="mb-6">
        <div style={{ padding: 'var(--space-5) var(--space-6) var(--space-4)' }}>
          <div className="flex items-center justify-between">
            <div className="chart-title" style={{ margin: 0 }}>Recent Scenarios</div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
            <Button variant="ghost" size="sm" icon={<RefreshCw size={12} />}>
=======
>>>>>>> origin/main
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={12} className={loading ? 'spin' : ''} />}
              onClick={refetch}
              disabled={loading}
            >
<<<<<<< HEAD
=======
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
              Refresh
            </Button>
          </div>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Family</th>
                <th>Vector</th>
                <th>Sophistication</th>
                <th>Fused Score</th>
                <th>Decision</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {d.recent_scenarios.map(s => (
=======
<<<<<<< HEAD
              {data.recent_scenarios.map(s => (
=======
              {d.recent_scenarios.map(s => (
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
                <tr key={s.id} className={s.evaded_detection ? 'row-attack-evaded' : ''}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: FAMILY_COLORS[s.attack_family] ?? 'var(--ink-muted)' }}>
                      {s.attack_family.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                      {s.attack_vector_id}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ProgressBar value={s.sophistication_level / 10} variant="attack" style={{ width: 60 }} />
                      <span className="text-mono text-small">{s.sophistication_level.toFixed(1)}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="text-mono"
                      style={{
                        color: s.fused_score > 0.6 ? 'var(--good)' : s.fused_score > 0.3 ? 'var(--warn)' : 'var(--attack)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {(s.fused_score * 100).toFixed(0)}
                    </span>
                  </td>
                  <td><DecisionBadge decision={s.decision} /></td>
                  <td>
                    {s.evaded_detection
                      ? <Badge variant="block">Evaded</Badge>
                      : <Badge variant="allow">Detected</Badge>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick actions */}
      <Card>
        <div className="chart-title mb-4">Quick Actions</div>
        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
          <Button variant="primary" icon={<RefreshCw size={14} />} onClick={() => setTab('red-team')}>
            Run Campaign
          </Button>
          <Button variant="primary" icon={<Play size={14} />} onClick={() => setJudge(true)}>
            Launch Judge Demo
          </Button>
          <Button variant="ghost" icon={<Swords size={14} />} onClick={() => setTab('war-room')}>
            Open War Room
          </Button>
        </div>
      </Card>
    </div>
  )
}
<<<<<<< HEAD
=======
<<<<<<< HEAD

import React from 'react'
=======
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
