<<<<<<< HEAD
import React, { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { Badge, DecisionBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Terminal } from '../components/ui/Terminal'
import { MOCK_DASHBOARD, MOCK_TAXONOMY } from '../services/mockData'
import type { TerminalLine } from '../components/ui/Terminal'
import { Play, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

function genLog(scenarios: typeof MOCK_DASHBOARD.recent_scenarios): TerminalLine[] {
  return [
    { id: 'l0', text: '[2026-09-03 22:00:01] Initializing adversarial campaign...', type: 'info' },
    { id: 'l1', text: '[2026-09-03 22:00:02] Loading taxonomy: 36 vectors / 8 families', type: 'accent' },
    { id: 'l2', text: '[2026-09-03 22:00:03] Applying mutation strength: 60%', type: 'info' },
    { id: 'l3', text: '[2026-09-03 22:00:04] Generating 25 adversarial scenarios...', type: 'info' },
    ...scenarios.map((s, i) => ({
      id: `s${i}`, type: s.evaded_detection ? 'warn' as const : 'success' as const,
      text: `[22:00:${5 + i}] ${s.attack_vector_id} → ${s.decision} (score=${(s.fused_score * 100).toFixed(0)})${s.evaded_detection ? ' [EVADED]' : ''}`,
    })),
    { id: 'end', text: '[2026-09-03 22:00:12] Campaign complete. 1 evaded, 4 detected.', type: 'accent' },
=======
import React, { useState, useCallback } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, DecisionBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Terminal } from '../components/ui/Terminal'
import { MOCK_DASHBOARD } from '../services/mockData'
import { api } from '../services/api'
import { useAppStore } from '../stores/appStore'
import type { TerminalLine } from '../components/ui/Terminal'
import type { ScenarioItem } from '../types'
import { Zap } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts'

const FAMILIES = ['ALL', 'mule_network', 'card_testing', 'account_takeover', 'synthetic_identity', 'cnp_social_engineering']

function buildLog(scenarios: ScenarioItem[], generating: boolean): TerminalLine[] {
  const now = new Date()
  const ts = (i: number) => {
    const d = new Date(now.getTime() + i * 1200)
    return `[${d.toTimeString().slice(0, 8)}]`
  }

  if (generating) {
    return [
      { id: 'init', text: `${ts(0)} Initializing adversarial campaign...`, type: 'info' },
      { id: 'tax',  text: `${ts(1)} Loading taxonomy: 36 vectors / 8 families`, type: 'accent' },
      { id: 'mut',  text: `${ts(2)} Mutator armed - awaiting backend...`, type: 'info' },
    ]
  }

  if (scenarios.length === 0) {
    return [{ id: 'idle', text: 'No campaign run yet. Configure parameters above and click Generate Attacks.', type: 'info' }]
  }

  return [
    { id: 'init',  text: `${ts(0)} Adversarial campaign complete.`, type: 'accent' },
    { id: 'count', text: `${ts(1)} Generated ${scenarios.length} scenarios.`, type: 'info' },
    ...scenarios.map((s, i) => ({
      id: `s${i}`,
      type: s.evaded_detection ? 'warn' as const : 'success' as const,
      text: `${ts(i + 2)} ${s.attack_vector_id} → ${s.decision} score=${(s.fused_score * 100).toFixed(0)}${s.evaded_detection ? ' [EVADED]' : ''}`,
    })),
    {
      id: 'end',
      type: 'accent' as const,
      text: `${ts(scenarios.length + 2)} Done. ${scenarios.filter(s => s.evaded_detection).length} evaded, ${scenarios.filter(s => !s.evaded_detection).length} detected.`,
    },
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
  ]
}

export default function RedTeam() {
<<<<<<< HEAD
  const [count, setCount] = useState(25)
  const [strength, setStrength] = useState(0.6)
  const [sophistication, setSophistication] = useState(7.5)
  const [hasRun, setHasRun] = useState(true)

  const scenarios = MOCK_DASHBOARD.recent_scenarios
  const logs = genLog(scenarios)

=======
  const isDemoMode = useAppStore(s => s.isDemoMode)
  const addNotification = useAppStore(s => s.addNotification)

  const [count, setCount] = useState(25)
  const [strength, setStrength] = useState(0.6)
  const [sophistication, setSophistication] = useState(7.5)
  const [family, setFamily] = useState('ALL')
  const [generating, setGenerating] = useState(false)
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(MOCK_DASHBOARD.recent_scenarios)
  const [hasRun, setHasRun] = useState(true)

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
  const evolutionData = [1, 2, 3].map(round => ({
    round: `v${round}.0`,
    evasion: round === 1 ? 12.8 : round === 2 ? 6.4 : 2.1,
  }))

<<<<<<< HEAD
=======
  const handleGenerate = useCallback(async () => {
    if (generating) return
    setGenerating(true)
    setHasRun(true)

    if (isDemoMode) {
      // Short delay to simulate the feeling of a network request
      await new Promise(r => setTimeout(r, 1200))
      setScenarios(MOCK_DASHBOARD.recent_scenarios)
      setGenerating(false)
      addNotification({ type: 'info', message: `Demo mode: showing ${MOCK_DASHBOARD.recent_scenarios.length} mock scenarios.` })
      return
    }

    try {
      const results = await api.generateAttacks({
        count,
        sophistication,
        mutation_strength: strength,
        family: family === 'ALL' ? undefined : family,
      })
      setScenarios(results)
      const evaded = results.filter(s => s.evaded_detection).length
      addNotification({
        type: evaded > 0 ? 'warn' : 'success',
        message: `Campaign complete: ${results.length} scenarios, ${evaded} evaded detection.`,
      })
    } catch (err) {
      // Fallback to mock on API error
      setScenarios(MOCK_DASHBOARD.recent_scenarios)
      addNotification({ type: 'error', message: `API error: ${(err as Error).message} - showing mock data.` })
    } finally {
      setGenerating(false)
    }
  }, [generating, isDemoMode, count, sophistication, strength, family, addNotification])

  const logs = buildLog(scenarios, generating)

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Red Team</h1>
        <p className="page-subtitle">Generate synthetic adversarial scenarios and inspect results</p>
      </div>

      {/* Config panel */}
      <Card className="mb-6">
        <div className="chart-title mb-4">Campaign Configuration</div>
<<<<<<< HEAD
        <div className="grid grid-3 gap-6 mb-6">
          <div>
            <label className="text-annotation" style={{ color: 'var(--ink-faint)', display: 'block', marginBottom: 8 }}>
              Scenario Count: {count}
=======
        <div className="grid grid-4 gap-6 mb-6">
          <div>
            <label className="text-annotation" style={{ color: 'var(--ink-faint)', display: 'block', marginBottom: 8 }}>
              Count: {count}
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
            </label>
            <input id="red-count" type="range" className="slider" min={5} max={100} step={5} value={count} onChange={e => setCount(+e.target.value)} />
          </div>
          <div>
            <label className="text-annotation" style={{ color: 'var(--ink-faint)', display: 'block', marginBottom: 8 }}>
              Sophistication: {sophistication.toFixed(1)}/10
            </label>
            <input id="red-sophistication" type="range" className="slider" min={1} max={10} step={0.5} value={sophistication} onChange={e => setSophistication(+e.target.value)} />
          </div>
          <div>
            <label className="text-annotation" style={{ color: 'var(--ink-faint)', display: 'block', marginBottom: 8 }}>
              Mutation Strength: {(strength * 100).toFixed(0)}%
            </label>
            <input id="red-mutation" type="range" className="slider" min={0.1} max={1} step={0.05} value={strength} onChange={e => setStrength(+e.target.value)} />
          </div>
<<<<<<< HEAD
        </div>
        <Button variant="primary" icon={<Zap size={14} />} onClick={() => setHasRun(true)}>
          Generate Attacks
=======
          <div>
            <label className="text-annotation" style={{ color: 'var(--ink-faint)', display: 'block', marginBottom: 8 }}>
              Family
            </label>
            <select id="red-family" className="select" value={family} onChange={e => setFamily(e.target.value)}>
              {FAMILIES.map(f => <option key={f} value={f}>{f === 'ALL' ? 'All Families' : f.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
        <Button
          id="red-generate-btn"
          variant="primary"
          icon={<Zap size={14} />}
          onClick={handleGenerate}
          loading={generating}
        >
          {generating ? 'Generating...' : 'Generate Attacks'}
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
        </Button>
      </Card>

      {hasRun && (
        <>
<<<<<<< HEAD
=======
          {/* Stats row */}
          <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: scenarios.length, tone: 'default' as const },
              { label: 'Evaded', value: scenarios.filter(s => s.evaded_detection).length, tone: 'bad' as const },
              { label: 'Detected', value: scenarios.filter(s => !s.evaded_detection).length, tone: 'good' as const },
              { label: 'Evasion Rate', value: `${scenarios.length > 0 ? ((scenarios.filter(s => s.evaded_detection).length / scenarios.length) * 100).toFixed(1) : '0.0'}%`, tone: 'warn' as const },
            ].map(card => (
              <div key={card.label} style={{
                padding: '12px 20px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                minWidth: 120,
              }}>
                <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 4 }}>{card.label}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.5rem',
                  color: card.tone === 'bad' ? 'var(--attack)'
                       : card.tone === 'good' ? 'var(--good)'
                       : card.tone === 'warn' ? 'var(--warn)'
                       : 'var(--ink)',
                }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
          <div className="grid grid-2 mb-6" style={{ alignItems: 'start' }}>
            {/* Results table */}
            <Card noPad>
              <div style={{ padding: 'var(--space-5) var(--space-6) var(--space-3)' }}>
<<<<<<< HEAD
                <div className="chart-title" style={{ margin: 0 }}>Scenarios ({scenarios.length})</div>
=======
                <div className="flex items-center justify-between">
                  <div className="chart-title" style={{ margin: 0 }}>Scenarios ({scenarios.length})</div>
                  {scenarios.some(s => s.evaded_detection) && (
                    <Badge variant="block">{scenarios.filter(s => s.evaded_detection).length} evaded</Badge>
                  )}
                </div>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
              </div>
              <div className="table-wrap" style={{ border: 'none', borderRadius: 0, maxHeight: 320, overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Vector</th>
                      <th>Score</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(s => (
                      <tr key={s.id} className={s.evaded_detection ? 'row-attack-evaded' : ''}>
                        <td>
                          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--spot)' }}>{s.attack_vector_id}</code>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ink-faint)', marginTop: 2 }}>{s.attack_family.replace(/_/g, ' ')}</div>
                        </td>
                        <td>
<<<<<<< HEAD
                          <span style={{ fontFamily: 'var(--font-mono)', color: s.fused_score > 0.6 ? 'var(--good)' : s.fused_score > 0.3 ? 'var(--warn)' : 'var(--attack)' }}>
                            {(s.fused_score * 100).toFixed(0)}
                          </span>
=======
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ProgressBar value={s.fused_score} variant={s.fused_score > 0.6 ? 'defense' : s.fused_score > 0.3 ? 'spot' : 'attack'} style={{ width: 48 }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: s.fused_score > 0.6 ? 'var(--good)' : s.fused_score > 0.3 ? 'var(--warn)' : 'var(--attack)' }}>
                              {(s.fused_score * 100).toFixed(0)}
                            </span>
                          </div>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
                        </td>
                        <td><DecisionBadge decision={s.decision} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Log terminal */}
            <Card>
              <div className="chart-title mb-3">Campaign Log</div>
<<<<<<< HEAD
              <Terminal lines={logs} height={280} />
=======
              <Terminal lines={logs} height={320} />
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
            </Card>
          </div>

          {/* Evasion rate evolution chart */}
          <Card>
            <div className="chart-title mb-4">Evasion Rate - Model Version Comparison</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={evolutionData}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="round" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }} />
                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-muted)' }} unit="%" />
                <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                <ReferenceLine y={0} stroke="var(--good)" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="evasion" stroke="var(--attack)" strokeWidth={2} dot={{ fill: 'var(--attack)', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  )
}
