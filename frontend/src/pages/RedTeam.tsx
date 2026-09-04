import React, { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { Badge, DecisionBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Terminal } from '../components/ui/Terminal'
import { MOCK_DASHBOARD } from '../services/mockData'
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
  ]
}

export default function RedTeam() {
  const [count, setCount] = useState(25)
  const [strength, setStrength] = useState(0.6)
  const [sophistication, setSophistication] = useState(7.5)
  const [hasRun, setHasRun] = useState(true)

  const scenarios = MOCK_DASHBOARD.recent_scenarios
  const logs = genLog(scenarios)

  const evolutionData = [1, 2, 3].map(round => ({
    round: `v${round}.0`,
    evasion: round === 1 ? 12.8 : round === 2 ? 6.4 : 2.1,
  }))

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Red Team</h1>
        <p className="page-subtitle">Generate synthetic adversarial scenarios and inspect results</p>
      </div>

      {/* Config panel */}
      <Card className="mb-6">
        <div className="chart-title mb-4">Campaign Configuration</div>
        <div className="grid grid-3 gap-6 mb-6">
          <div>
            <label className="text-annotation" style={{ color: 'var(--ink-faint)', display: 'block', marginBottom: 8 }}>
              Scenario Count: {count}
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
        </div>
        <Button variant="primary" icon={<Zap size={14} />} onClick={() => setHasRun(true)}>
          Generate Attacks
        </Button>
      </Card>

      {hasRun && (
        <>
          <div className="grid grid-2 mb-6" style={{ alignItems: 'start' }}>
            {/* Results table */}
            <Card noPad>
              <div style={{ padding: 'var(--space-5) var(--space-6) var(--space-3)' }}>
                <div className="chart-title" style={{ margin: 0 }}>Scenarios ({scenarios.length})</div>
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
                          <span style={{ fontFamily: 'var(--font-mono)', color: s.fused_score > 0.6 ? 'var(--good)' : s.fused_score > 0.3 ? 'var(--warn)' : 'var(--attack)' }}>
                            {(s.fused_score * 100).toFixed(0)}
                          </span>
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
              <Terminal lines={logs} height={280} />
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
