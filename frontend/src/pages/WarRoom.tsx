import React, { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MOCK_WAR_ROOM_STATE, MOCK_GENERATIONS } from '../services/mockData'
import { Play, Square, RefreshCw } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from 'recharts'

type RunStatus = 'idle' | 'running' | 'completed'

export default function WarRoom() {
  const [status, setStatus] = useState<RunStatus>('completed')
  const state = MOCK_WAR_ROOM_STATE
  const generations = MOCK_GENERATIONS

  const ari = state.arms_race.value
  const ariPct = ((ari + 1) / 2) * 100  // map [-1,1] to [0,100]%

  const regimeColor =
    state.arms_race.regime === 'blue_ascendant' ? 'var(--good)' :
    state.arms_race.regime === 'red_ascendant'  ? 'var(--attack)' : 'var(--warn)'

  const lineData = generations.map(g => ({
    gen: g.generation,
    fixed: +(g.detection_rate_fixed_set * 100).toFixed(1),
    novel: +(g.detection_rate_new_vectors * 100).toFixed(1),
  }))

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">War Room</h1>
        <p className="page-subtitle">Live NSGA-II co-evolution - Red and Blue both adapt simultaneously</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="flex gap-3">
            {status === 'running' ? (
              <Button variant="danger" icon={<Square size={14} />} onClick={() => setStatus('idle')}>
                Stop Run
              </Button>
            ) : (
              <Button variant="primary" icon={<Play size={14} />} onClick={() => setStatus('running')}>
                Start Run
              </Button>
            )}
            <select id="war-mode" className="select">
              <option value="fast">Mode: fast</option>
              <option value="standard">Mode: standard</option>
              <option value="debug">Mode: debug</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
              Seed: <code style={{ color: 'var(--spot)' }}>42</code>
            </div>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <Badge variant={status === 'running' ? 'live' : status === 'completed' ? 'allow' : 'neutral'}>
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Arms Race Index */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 4 }}>Arms Race Index</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 400, color: regimeColor, lineHeight: 1 }}>
              {ari > 0 ? '+' : ''}{ari.toFixed(3)}
            </div>
          </div>
          <Badge variant={
            state.arms_race.regime === 'blue_ascendant' ? 'allow' :
            state.arms_race.regime === 'red_ascendant'  ? 'block' : 'review'
          } style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
            {state.arms_race.regime.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
        <div className="ari-bar">
          <div className="ari-indicator" style={{ left: `${ariPct}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-annotation" style={{ color: 'var(--attack)' }}>RED WINNING</span>
          <span className="text-annotation" style={{ color: 'var(--good)' }}>BLUE WINNING</span>
        </div>
      </Card>

      {/* 3-column generation view */}
      <div className="grid grid-3 mb-6">
        <Card>
          <div className="chart-title mb-4" style={{ color: 'var(--attack)' }}>Red Team</div>
          <StatCard label="Population Size"   value={state.red.population_size}  tone="bad"  />
          <div style={{ marginTop: 'var(--space-3)' }}>
            <StatCard label="Composite Share" value={`${(state.red.composite_share * 100).toFixed(0)}%`} tone="warn" />
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>Family Breakdown</div>
            {Object.entries(state.red.family_distribution).map(([fam, pct]) => (
              <div key={fam} style={{ marginBottom: 6 }}>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: '0.6875rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{fam.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--attack)', fontFamily: 'var(--font-mono)' }}>{(pct * 100).toFixed(0)}%</span>
                </div>
                <ProgressBar value={pct} variant="attack" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="chart-title mb-4">Generation {state.n_generations}/10</div>
          <StatCard label="Recall"    value={`${((state.latest_generation.recall ?? 0) * 100).toFixed(1)}%`} tone="good" />
          <div style={{ marginTop: 'var(--space-3)' }}>
            <StatCard label="FPR" value={`${((state.latest_generation.false_positive_rate ?? 0) * 100).toFixed(2)}%`} tone="warn" />
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>Novelty Archive</div>
            <StatCard label="Archive Size"      value={state.novelty.archive_size}    tone="spot"    />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <StatCard label="Emergent Events" value={state.novelty.n_emergent_events} tone="warn" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="chart-title mb-4" style={{ color: 'var(--defense)' }}>Blue Team</div>
          <StatCard label="Adaptation Rate" value={state.blue.adaptation_rate.toFixed(4)} tone="spot" />
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>Policy</div>
            {Object.entries(state.blue.policy).map(([k, v]) => (
              <div key={k} className="flex justify-between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>{k}</span>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--defense)' }}>{v.toFixed(3)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>Economy</div>
            <div className="flex justify-between">
              <span style={{ fontSize: '0.75rem', color: 'var(--attack)', fontFamily: 'var(--font-mono)' }}>
                Red: ${state.economy.balances['red.treasury'].toFixed(0)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--defense)', fontFamily: 'var(--font-mono)' }}>
                Blue: ${state.economy.balances['blue.treasury'].toFixed(0)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detection rate evolution */}
      <Card>
        <div className="chart-title mb-4">Detection Rate - Fixed Set vs New Vectors</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid stroke="var(--border)" />
            <XAxis dataKey="gen" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }} label={{ value: 'Generation', position: 'insideBottom', offset: -4, fill: 'var(--ink-faint)', fontSize: 11 }} />
            <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }} unit="%" domain={[50, 100]} />
            <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            <ReferenceLine y={90} stroke="var(--good)" strokeDasharray="4 2" label={{ value: 'Target', fill: 'var(--good)', fontSize: 10 }} />
            <Line type="monotone" dataKey="fixed" name="Fixed Set" stroke="var(--ink-muted)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="novel" name="New Vectors" stroke="var(--spot)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
