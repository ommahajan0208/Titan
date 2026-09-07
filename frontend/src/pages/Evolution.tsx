import React from 'react'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { LoopHelix3D } from '../three/LoopHelix3D'
import { MOCK_GENERATIONS } from '../services/mockData'
import { useAppStore } from '../stores/appStore'

const ROUNDS = [
  { version: 'v1.0', evasions: 12, f1: 0.948, recall: 0.82, fpr: 0.028, notes: 'Baseline - 36 vectors tested' },
  { version: 'v2.0', evasions: 6,  f1: 0.968, recall: 0.91, fpr: 0.015, notes: 'Counter-examples: mule_network focus' },
  { version: 'v3.0', evasions: 2,  f1: 0.991, recall: 0.928, fpr: 0.010, notes: 'Adversarial hardening complete' },
]

export default function Evolution() {
  const mode = useAppStore(s => s.mode)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  color: r.evasions === 0 ? 'var(--ink)' : r.evasions < 5 ? 'var(--ink-muted)' : 'var(--ink-faint)',
                  fontSize: '1.25rem'
                }}>{r.evasions}</div>
              </div>
              <div>
                <div className="text-annotation" style={{ color: 'var(--ink-faint)' }}>F1</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontSize: '1.25rem' }}>{r.f1.toFixed(3)}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>{r.notes}</p>
          </Card>
        ))}
      </div>

      {/* Co-evolution helix */}
      <Card className="mb-6" noHover>
        <div className="flex items-center justify-between mb-2">
          <div className="chart-title" style={{ margin: 0 }}>Co-Evolution Feedback Helix</div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div style={{ width: 24, height: 2, background: 'var(--ink-muted)' }} />
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Fixed set detection</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 24, height: 2, background: 'var(--spot)' }} />
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>New vector detection</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-faint)', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>
          Each turn = one generation. Contracting radius = more detections. Gap between lines = generalization lag.
        </p>
        <LoopHelix3D
          generations={MOCK_GENERATIONS}
          attacker={mode === 'attacker'}
          reduced={reduced}
          height={380}
        />
      </Card>

      {/* Zero-shot holdout */}
      <Card>
        <div className="chart-title mb-4">Zero-Shot Holdout - ADV-01 Family (Never seen in training)</div>
        <div className="grid grid-3 gap-4">
          <StatCard label="Baseline (v1.0)"      value="0.0%"  sub="No detection"       tone="bad"  />
          <StatCard label="Defense v3.0"          value="60.0%" sub="After hardening"     tone="good" />
          <StatCard label="Generalization Delta"  value="+60%"  sub="Zero-shot improvement" tone="spot" />
        </div>
        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
          Note: ADV-01 shares the same feature schema as training data. Results are illustrative. Label as demo data in production.
        </p>
      </Card>
    </div>
  )
}
