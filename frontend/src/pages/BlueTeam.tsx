import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MOCK_MODELS } from '../services/mockData'
import { api } from '../services/api'
import { CheckCircle, XCircle, TrendingUp, Settings } from 'lucide-react'
import { PolicyEditor } from '../modals/PolicyEditor'
import type { DefensePolicy, ModelRecord } from '../types'

const GATES = [
  { id: 'g1', label: 'Recall delta > 0.005', pass: true },
  { id: 'g2', label: 'FPR regression < 0.002', pass: true },
  { id: 'g3', label: 'Provenance guard (AUC approx 0.5)', pass: true },
  { id: 'g4', label: 'Fidelity score >= 80.0', pass: true },
]

const INITIAL_POLICY: DefensePolicy = {
  ml_threshold: 0.62,
  graph_weight: 0.25,
  fpr_target: 0.01,
  trust_region: 0.05,
  adaptation_rate: 0.0023,
}

export default function BlueTeam() {
  const [models, setModels] = useState<ModelRecord[]>(MOCK_MODELS)
  const [policy, setPolicy] = useState<DefensePolicy>(INITIAL_POLICY)
  const [policyEditorOpen, setPolicyEditorOpen] = useState(false)
  const [retraining, setRetraining] = useState(false)
  const [retrainLog, setRetrainLog] = useState<string[]>([])

  useEffect(() => {
    api.getModelBenchmarks()
      .then(data => { if (data && data.length) setModels(data) })
      .catch(() => {})
  }, [])

  const active = models.find(m => m.is_active) ?? models[0]

  const handleRetrain = useCallback(async () => {
    setRetraining(true)
    setRetrainLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Retraining triggered...`])
    try {
      const result = await api.executeRetraining({ target_version: 'auto' })
      setRetrainLog(prev => [...prev,
        `[${new Date().toLocaleTimeString()}] Status: ${(result as any).status ?? 'pending'}`,
      ])
      // Refresh models after retraining
      setTimeout(() => {
        api.getModelBenchmarks()
          .then(data => { if (data && data.length) setModels(data) })
          .catch(() => {})
      }, 1200)
    } catch {
      setRetrainLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Retraining failed - backend may be unavailable`])
    } finally {
      setRetraining(false)
    }
  }, [])

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
            <Button
              id="blue-team-promote"
              variant="primary"
              icon={<TrendingUp size={14} />}
              onClick={handleRetrain}
              disabled={retraining}
            >
              {retraining ? 'Retraining...' : `Promote ${active?.version ?? 'v3.0'}`}
            </Button>
            <Button
              id="blue-team-rollback"
              variant="ghost"
              onClick={() => api.rollbackModel('').catch(() => {})}
            >
              Rollback
            </Button>
          </div>
          {retrainLog.length > 0 && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--bg-void)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--ink-muted)',
              lineHeight: 1.6,
              maxHeight: 120,
              overflowY: 'auto',
            }}>
              {retrainLog.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </Card>

        {/* Policy panel */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="chart-title" style={{ margin: 0 }}>Defense Policy</div>
            <Button
              id="blue-team-edit-policy"
              variant="ghost"
              size="sm"
              icon={<Settings size={12} />}
              onClick={() => setPolicyEditorOpen(true)}
            >
              Edit Policy
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {([
              { label: 'ML Threshold',    value: policy.ml_threshold,    format: (v: number) => v.toFixed(2) },
              { label: 'FPR Budget',      value: policy.fpr_target,       format: (v: number) => `${(v * 100).toFixed(1)}%` },
              { label: 'Graph Weight',    value: policy.graph_weight,     format: (v: number) => v.toFixed(2) },
              { label: 'Trust Region',    value: policy.trust_region,     format: (v: number) => v.toFixed(3) },
              { label: 'Adaptation Rate', value: policy.adaptation_rate,  format: (v: number) => v.toFixed(4) },
            ] as const).map(field => (
              <div key={field.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>{field.label}</span>
                  <span className="text-mono text-small" style={{ color: 'var(--spot)' }}>{field.format(field.value)}</span>
                </div>
                <ProgressBar value={field.value} variant="defense" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* PolicyEditor modal */}
      {policyEditorOpen && (
        <PolicyEditor
          policy={policy}
          onClose={() => setPolicyEditorOpen(false)}
          onSave={(updated) => {
            setPolicy(updated)
            setPolicyEditorOpen(false)
          }}
        />
      )}
    </div>
  )
}
