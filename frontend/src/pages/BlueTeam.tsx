import React from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MOCK_MODELS } from '../services/mockData'
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const GATES = [
  { id: 'g1', label: 'Recall delta > 0.005', pass: true },
  { id: 'g2', label: 'FPR regression < 0.002', pass: true },
  { id: 'g3', label: 'Provenance guard (AUC ≈ 0.5)', pass: true },
  { id: 'g4', label: 'Fidelity score ≥ 80.0', pass: true },
]

export default function BlueTeam() {
  const models = MOCK_MODELS
  const active = models.find(m => m.is_active)!

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Blue Team</h1>
        <p className="page-subtitle">Defense model benchmarks, promotion gates, and policy management</p>
      </div>

      {/* Model timeline */}
      <Card className="mb-6" noPad>
        <div style={{ padding: 'var(--space-5) var(--space-6) var(--space-4)' }}>
          <div className="chart-title" style={{ margin: 0 }}>Model Timeline</div>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Version</th><th>Recall</th><th>Precision</th><th>F1</th><th>FPR</th><th>AUC</th><th>Fidelity</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {models.map(m => (
                <tr key={m.model_id} style={{ background: m.is_active ? 'var(--bg-raised)' : undefined }}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', color: m.is_active ? 'var(--spot)' : 'var(--ink)', fontWeight: m.is_active ? 600 : 400 }}>
                      Defense {m.version}
                    </span>
                  </td>
                  <td><span className="text-mono tone-good">{(m.recall * 100).toFixed(1)}%</span></td>
                  <td><span className="text-mono">{(m.precision * 100).toFixed(1)}%</span></td>
                  <td><span className="text-mono">{m.f1.toFixed(3)}</span></td>
                  <td><span className="text-mono tone-warn">{(m.fpr * 100).toFixed(2)}%</span></td>
                  <td><span className="text-mono">{m.roc_auc.toFixed(3)}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ProgressBar value={m.fidelity_score / 100} variant="defense" style={{ width: 50 }} />
                      <span className="text-mono text-small">{m.fidelity_score.toFixed(0)}</span>
                    </div>
                  </td>
                  <td>
                    {m.is_active
                      ? <Badge variant="allow">Active</Badge>
                      : <Badge variant="neutral">Retired</Badge>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-2 mb-6" style={{ alignItems: 'start' }}>
        {/* Promotion gates */}
        <Card>
          <div className="chart-title mb-4">Promotion Gate Status - Defense v3.0</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {GATES.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)' }}>
                {g.pass
                  ? <CheckCircle size={18} style={{ color: 'var(--good)', flexShrink: 0 }} />
                  : <XCircle size={18} style={{ color: 'var(--attack)', flexShrink: 0 }} />
                }
                <span style={{ fontSize: '0.875rem', flex: 1 }}>{g.label}</span>
                <Badge variant={g.pass ? 'allow' : 'block'}>{g.pass ? 'PASS' : 'FAIL'}</Badge>
              </div>
            ))}
          </div>
          <div className="flex gap-3" style={{ marginTop: 'var(--space-5)' }}>
            <Button variant="primary" icon={<TrendingUp size={14} />}>Promote v3.0</Button>
            <Button variant="ghost">Rollback</Button>
          </div>
        </Card>

        {/* Policy panel */}
        <Card>
          <div className="chart-title mb-4">Defense Policy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {[
              { id: 'ml-threshold', label: 'ML Threshold', value: 0.62, min: 0, max: 1, step: 0.01, format: (v: number) => v.toFixed(2) },
              { id: 'fpr-budget', label: 'FPR Budget', value: 0.01, min: 0.001, max: 0.05, step: 0.001, format: (v: number) => `${(v * 100).toFixed(1)}%` },
              { id: 'graph-weight', label: 'Graph Weight', value: 0.25, min: 0, max: 1, step: 0.01, format: (v: number) => v.toFixed(2) },
            ].map(field => (
              <div key={field.id}>
                <div className="flex justify-between mb-2">
                  <label className="text-annotation" style={{ color: 'var(--ink-faint)' }}>{field.label}</label>
                  <span className="text-mono text-small" style={{ color: 'var(--spot)' }}>{field.format(field.value)}</span>
                </div>
                <input id={field.id} type="range" className="slider" min={field.min} max={field.max} step={field.step} defaultValue={field.value} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--space-5)' }}>
            <Button variant="ghost">Edit Policy</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
