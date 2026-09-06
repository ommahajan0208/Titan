import React, { useState } from 'react'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MOCK_ATLAS_CELLS } from '../services/mockData'
import { BlindSpotAtlas3D } from '../three/BlindSpotAtlas3D'
import { RefreshCw } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import type { AtlasCell } from '../types'

const CLUSTERS = [
  { id: 'c1', size: 4, family: 'mule_network',       weak: 'graph_footprint',     evasion: 0.82 },
  { id: 'c2', size: 3, family: 'synthetic_identity',  weak: 'behavioral_variance', evasion: 0.74 },
  { id: 'c3', size: 2, family: 'card_testing',        weak: 'timing_spread',       evasion: 0.61 },
]

export default function GapAnalysis() {
  const mode = useAppStore(s => s.mode)
  const [selectedCell, setSelectedCell] = useState<AtlasCell | null>(null)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Gap Analysis</h1>
        <p className="page-subtitle">Evasion clustering and blind-spot coverage mapping</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <StatCard label="Evaded"   value="9"    sub="of 94 tested" tone="bad"  style={{ minWidth: 120 }} />
        <StatCard label="Rate"     value="9.6%" sub="evasion rate" tone="warn" style={{ minWidth: 120 }} />
        <StatCard label="Clusters" value="3"    sub="K-Means"      tone="spot" style={{ minWidth: 120 }} />
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
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>{c.weak}</code>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <ProgressBar value={c.evasion} variant="attack" label="Evasion Rate" showPercent />
            </div>
          </Card>
        ))}
      </div>

      {/* Blind Spot Atlas - 3D WebGL */}
      <Card className="mb-6" noHover>
        <div className="flex items-center justify-between mb-4">
          <div className="chart-title" style={{ margin: 0 }}>Blind-Spot Atlas (MAP-Elites 10x12)</div>
          {selectedCell && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ink-muted)' }}>
              V={selectedCell.x} G={selectedCell.y} - Evasion: {(selectedCell.evasion_rate * 100).toFixed(0)}%
              {selectedCell.hardened && ' - Hardened'}
            </div>
          )}
        </div>
        <BlindSpotAtlas3D
          cells={MOCK_ATLAS_CELLS}
          onCellClick={setSelectedCell}
          reduced={reduced}
          height={340}
        />
        <div className="flex gap-4" style={{ marginTop: 'var(--space-4)' }}>
          {([
            ['#1a2236', 'Unvisited'],
            ['#6B7280', 'Evading'],
            ['#4B5563', 'Evasion Rate > 70%'],
            ['#374151', 'Hardened'],
          ] as [string, string][]).map(([color, label]) => (
            <div key={label} className="flex items-center gap-2">
              <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Counter-example retrain */}
      <Card>
        <div className="chart-title mb-4">Counter-Example Strategy</div>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
          Generate 250 targeted counter-samples focusing on:{' '}
          <code style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>graph_footprint</code>,{' '}
          <code style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>behavioral_variance</code>
        </p>
        <div className="flex gap-3">
          <Button variant="primary">Synthesize Counter-Examples</Button>
          <Button variant="ghost">Retrain to v4.0</Button>
        </div>
      </Card>
    </div>
  )
}
