import React from 'react'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MOCK_ATLAS_CELLS } from '../services/mockData'
import { RefreshCw } from 'lucide-react'

const CLUSTERS = [
  { id: 'c1', size: 4, family: 'mule_network',       weak: 'graph_footprint',     evasion: 0.82 },
  { id: 'c2', size: 3, family: 'synthetic_identity',  weak: 'behavioral_variance', evasion: 0.74 },
  { id: 'c3', size: 2, family: 'card_testing',        weak: 'timing_spread',       evasion: 0.61 },
]

function cellColor(cell: typeof MOCK_ATLAS_CELLS[0]) {
  if (!cell.visited)    return 'var(--bg-surface)'
  if (cell.hardened)    return 'var(--good)'
  if (cell.evasion_rate > 0.7) return 'var(--attack)'
  return 'var(--warn)'
}

export default function GapAnalysis() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Gap Analysis</h1>
        <p className="page-subtitle">Evasion clustering and blind-spot coverage mapping</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <StatCard label="Evaded"  value="9"   sub="of 94 tested" tone="bad"  style={{ minWidth: 120 }} />
        <StatCard label="Rate"    value="9.6%" sub="evasion rate" tone="warn" style={{ minWidth: 120 }} />
        <StatCard label="Clusters" value="3"  sub="K-Means"      tone="spot" style={{ minWidth: 120 }} />
        <Button variant="ghost" icon={<RefreshCw size={14} />} style={{ marginLeft: 'auto' }}>
          Re-Analyze
        </Button>
      </div>

      {/* Cluster cards */}
      <div className="grid grid-3 mb-6">
        {CLUSTERS.map(c => (
          <Card key={c.id}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Cluster {c.id.slice(1)}</div>
              <Badge variant="block">{c.size} evasions</Badge>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{c.family.replace(/_/g, ' ')}</div>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 4 }}>Weak Feature</div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--warn)' }}>{c.weak}</code>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <ProgressBar value={c.evasion} variant="attack" label="Evasion Rate" showPercent />
            </div>
          </Card>
        ))}
      </div>

      {/* Blind Spot Atlas 2D */}
      <Card className="mb-6">
        <div className="chart-title mb-4">Blind-Spot Atlas (MAP-Elites 10x12)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, maxWidth: 600 }}>
          {MOCK_ATLAS_CELLS.map(cell => (
            <div
              key={cell.cell_id}
              title={`V=${cell.x} G=${cell.y}\nEvasion: ${(cell.evasion_rate * 100).toFixed(0)}%${cell.hardened ? ' (hardened)' : ''}`}
              style={{
                aspectRatio: '1', background: cellColor(cell),
                borderRadius: 2, cursor: 'pointer',
                opacity: cell.visited ? 1 : 0.3,
                transition: 'transform 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.15)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ))}
        </div>
        <div className="flex gap-4" style={{ marginTop: 'var(--space-4)' }}>
          {[['var(--bg-surface)', 'Unvisited'], ['var(--warn)', 'Evading'], ['var(--attack)', 'Fully Undetected'], ['var(--good)', 'Hardened']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-2">
              <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }} />
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Retrain pipeline */}
      <Card>
        <div className="chart-title mb-4">Counter-Example Strategy</div>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
          Generate 250 targeted counter-samples focusing on:{' '}
          <code style={{ color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>graph_footprint</code>,{' '}
          <code style={{ color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>behavioral_variance</code>
        </p>
        <div className="flex gap-3">
          <Button variant="primary">Synthesize Counter-Examples</Button>
          <Button variant="ghost">Retrain to v4.0</Button>
        </div>
      </Card>
    </div>
  )
}
