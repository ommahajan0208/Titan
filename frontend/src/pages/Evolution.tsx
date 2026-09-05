import React from 'react'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
<<<<<<< HEAD
import { MOCK_GENERATIONS } from '../services/mockData'
=======
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const ROUNDS = [
  { version: 'v1.0', evasions: 12, f1: 0.948, recall: 0.82, fpr: 0.028, notes: 'Baseline - 36 vectors tested' },
  { version: 'v2.0', evasions: 6,  f1: 0.968, recall: 0.91, fpr: 0.015, notes: 'Counter-examples: mule_network focus' },
  { version: 'v3.0', evasions: 2,  f1: 0.991, recall: 0.928, fpr: 0.010, notes: 'Adversarial hardening complete' },
]

export default function Evolution() {
  const chartData = ROUNDS.map(r => ({ round: `Defense ${r.version}`, evasion: r.evasions, f1: r.f1 * 100 }))

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Evolution</h1>
        <p className="page-subtitle">Multi-round adversarial training history</p>
      </div>

      {/* Round cards */}
      <div className="flex gap-4 mb-6" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {ROUNDS.map((r, i) => (
          <Card key={r.version} style={{ minWidth: 240, flexShrink: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Round {i + 1}</span>
              {i === ROUNDS.length - 1 && <Badge variant="allow">Active</Badge>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--spot)', marginBottom: 8 }}>
              Defense {r.version}
            </div>
            <div className="flex gap-4" style={{ marginBottom: 12 }}>
              <div>
                <div className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Evasions</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: r.evasions === 0 ? 'var(--good)' : r.evasions < 5 ? 'var(--warn)' : 'var(--attack)', fontSize: '1.25rem' }}>{r.evasions}</div>
              </div>
              <div>
                <div className="text-annotation" style={{ color: 'var(--ink-faint)' }}>F1</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--good)', fontSize: '1.25rem' }}>{r.f1.toFixed(3)}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>{r.notes}</p>
          </Card>
        ))}
      </div>

      {/* Evasion chart */}
      <Card className="mb-6">
        <div className="chart-title mb-4">Evasion Rate Reduction per Round</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="var(--border)" />
            <XAxis dataKey="round" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }} />
            <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            <Line type="monotone" dataKey="evasion" name="Evasions" stroke="var(--attack)" strokeWidth={2} dot={{ fill: 'var(--attack)', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Zero-shot holdout */}
      <Card>
        <div className="chart-title mb-4">Zero-Shot Holdout - ADV-01 Family (Never seen in training)</div>
        <div className="grid grid-3 gap-4">
          <StatCard label="Baseline (v1.0)"   value="0.0%"  sub="No detection" tone="bad"  />
          <StatCard label="Defense v3.0"      value="60.0%" sub="After hardening" tone="good" />
          <StatCard label="Generalization Delta" value="+60%" sub="Zero-shot improvement" tone="good" />
        </div>
        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
          Note: ADV-01 shares the same feature schema as training data. Results are illustrative. Label as demo data in production.
        </p>
      </Card>
    </div>
  )
}
