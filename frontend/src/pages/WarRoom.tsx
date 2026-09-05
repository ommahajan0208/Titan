<<<<<<< HEAD
import React, { useState } from 'react'
=======
import React, { useState, useCallback } from 'react'
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MOCK_WAR_ROOM_STATE, MOCK_GENERATIONS } from '../services/mockData'
<<<<<<< HEAD
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
=======
import { useWarRoom } from '../hooks/useWarRoom'
import { useAppStore } from '../stores/appStore'
import { adaptiveApi } from '../services/adaptiveApi'
import { Play, Square, Loader2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts'

type RunStatus = 'idle' | 'starting' | 'running' | 'completed'

export default function WarRoom() {
  const [status, setStatus] = useState<RunStatus>('completed')
  const [mode, setMode] = useState<'fast' | 'thorough' | 'stealth'>('fast')
  const [seed] = useState(42)
  const [startError, setStartError] = useState<string | null>(null)

  const isDemoMode  = useAppStore(s => s.isDemoMode)
  const activeRunId = useAppStore(s => s.activeRunId)
  const setRunId    = useAppStore(s => s.setActiveRunId)
  const addNotification = useAppStore(s => s.addNotification)

  // Live polling when a run is active and NOT in demo mode
  const { state: liveState, generations: liveGenerations, oracle, polling, error: pollError } =
    useWarRoom(isDemoMode ? null : activeRunId)

  // Use live data when available, else mock
  const state = (liveState ?? MOCK_WAR_ROOM_STATE)
  const generations = (liveGenerations.length > 0 ? liveGenerations : MOCK_GENERATIONS)
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e

  const ari = state.arms_race.value
  const ariPct = ((ari + 1) / 2) * 100  // map [-1,1] to [0,100]%

<<<<<<< HEAD
  const regimeColor =
    state.arms_race.regime === 'blue_ascendant' ? 'var(--good)' :
    state.arms_race.regime === 'red_ascendant'  ? 'var(--attack)' : 'var(--warn)'
=======
  // Per design spec: ARI = large white number, regime in --ink-faint grey
  // regimeColor used only for regime text label
  const regimeLabel = state.arms_race.regime.replace(/_/g, ' ').toUpperCase()
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e

  const lineData = generations.map(g => ({
    gen: g.generation,
    fixed: +(g.detection_rate_fixed_set * 100).toFixed(1),
    novel: +(g.detection_rate_new_vectors * 100).toFixed(1),
  }))

<<<<<<< HEAD
=======
  const handleStart = useCallback(async () => {
    if (isDemoMode) {
      setStatus('running')
      addNotification({ type: 'info', message: 'Demo mode: showing mock War Room data.' })
      return
    }
    setStatus('starting')
    setStartError(null)
    try {
      const { run_id } = await adaptiveApi.startRun({ seed, generations: 10, mode })
      setRunId(run_id)
      setStatus('running')
      addNotification({ type: 'success', message: `War Room run started (ID: ${run_id.slice(0, 8)})` })
    } catch (err) {
      setStartError((err as Error).message)
      setStatus('idle')
      addNotification({ type: 'error', message: `Failed to start run: ${(err as Error).message}` })
    }
  }, [isDemoMode, seed, mode, setRunId, addNotification])

  const handleStop = useCallback(async () => {
    if (activeRunId && !isDemoMode) {
      try {
        await adaptiveApi.stopRun(activeRunId)
        addNotification({ type: 'info', message: 'War Room run stopped.' })
      } catch { /* ignore stop errors */ }
    }
    setRunId(null)
    setStatus('idle')
  }, [activeRunId, isDemoMode, setRunId, addNotification])

  // Update status to reflect live poll state
  React.useEffect(() => {
    if (polling && status !== 'running') setStatus('running')
  }, [polling, status])

  // Detect completion
  React.useEffect(() => {
    if (liveState && liveGenerations.length > 0 && liveGenerations.length >= liveState.n_generations) {
      setStatus('completed')
      setRunId(null)
    }
  }, [liveState, liveGenerations, setRunId])

  const displayStatus: RunStatus = polling ? 'running'
    : status === 'starting' ? 'starting'
    : status

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
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
<<<<<<< HEAD
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
=======
            {displayStatus === 'running' || displayStatus === 'starting' ? (
              <Button variant="danger" icon={<Square size={14} />} onClick={handleStop}
                loading={displayStatus === 'starting'}>
                Stop Run
              </Button>
            ) : (
              <Button variant="primary" icon={<Play size={14} />} onClick={handleStart}>
                Start Run
              </Button>
            )}
            <select
              id="war-mode"
              className="select"
              value={mode}
              onChange={e => setMode(e.target.value as typeof mode)}
              disabled={displayStatus === 'running'}
            >
              <option value="fast">Mode: fast</option>
              <option value="thorough">Mode: thorough</option>
              <option value="stealth">Mode: stealth</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
              Seed: <code style={{ color: 'var(--spot)' }}>{seed}</code>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {polling && (
              <Loader2 size={13} style={{ color: 'var(--spot)', animation: 'spin 1s linear infinite' }} />
            )}
            <Badge variant={
              displayStatus === 'running' || displayStatus === 'starting' ? 'live'
              : displayStatus === 'completed' ? 'allow' : 'neutral'
            }>
              {displayStatus.toUpperCase()}
            </Badge>
          </div>
        </div>
        {(startError || pollError) && (
          <div style={{ marginTop: 10, fontSize: '0.8125rem', color: 'var(--attack)', fontFamily: 'var(--font-mono)' }}>
            {startError ?? pollError}
          </div>
        )}
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
      </Card>

      {/* Arms Race Index */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 4 }}>Arms Race Index</div>
<<<<<<< HEAD
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 400, color: regimeColor, lineHeight: 1 }}>
              {ari > 0 ? '+' : ''}{ari.toFixed(3)}
            </div>
=======
            {/* ARI number: always white per design spec */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1 }}>
              {ari > 0 ? '+' : ''}{ari.toFixed(3)}
            </div>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginTop: 4 }}>{regimeLabel}</div>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
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
<<<<<<< HEAD
        <div className="flex justify-between mt-2">
          <span className="text-annotation" style={{ color: 'var(--attack)' }}>RED WINNING</span>
          <span className="text-annotation" style={{ color: 'var(--good)' }}>BLUE WINNING</span>
        </div>
=======
          {/* Labels: grey only, no color coding */}
          <div className="ari-labels">
            <span>RED WINNING</span>
            <span>BLUE WINNING</span>
          </div>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
      </Card>

      {/* 3-column generation view */}
      <div className="grid grid-3 mb-6">
        <Card>
<<<<<<< HEAD
          <div className="chart-title mb-4" style={{ color: 'var(--attack)' }}>Red Team</div>
=======
          <div className="chart-title mb-4">Red Team</div>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
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
<<<<<<< HEAD
      <Card>
=======
      <Card className="mb-6">
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
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
<<<<<<< HEAD
=======

      {/* Oracle findings (shown after run complete) */}
      {oracle && (
        <Card style={{ borderColor: 'var(--good)' }}>
          <div className="chart-title mb-3" style={{ color: 'var(--good)' }}>Oracle Findings</div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Regime</span>
            <Badge variant="allow">{oracle.regime.replace(/_/g, ' ').toUpperCase()}</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--space-4)' }}>
            {oracle.findings.map(f => (
              <div key={f.key} style={{ padding: 'var(--space-3)', background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--spot)', marginBottom: 4 }}>{f.key}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>{f.detail}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{oracle.summary}</p>
        </Card>
      )}
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
    </div>
  )
}
