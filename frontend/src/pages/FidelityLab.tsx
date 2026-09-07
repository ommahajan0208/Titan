import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { MOCK_FIDELITY } from '../services/mockData'
import { api } from '../services/api'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import type { FidelityMetrics } from '../types'

export default function FidelityLab() {
  const [f, setF] = useState<FidelityMetrics>(MOCK_FIDELITY)
  const [loading, setLoading] = useState(false)

  const fetchFidelity = useCallback(() => {
    setLoading(true)
    api.getFidelityMetrics()
      .then(data => { if (data) setF(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchFidelity() }, [fetchFidelity])

  const score = f.fidelity_score


  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Fidelity Lab</h1>
        <p className="page-subtitle">Synthetic data realism metrics - how real does our simulator look?</p>
        <Button
          id="fidelity-refresh"
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />}
          onClick={fetchFidelity}
          disabled={loading}
          style={{ marginTop: 'var(--space-2)' }}
        >
          {loading ? 'Running tests...' : 'Re-run tests'}
        </Button>
      </div>

      <div className="grid grid-3 mb-6">
        <Card style={{ textAlign: 'center' }}>
          <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>Fidelity Score</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 400, color: score >= 80 ? 'var(--good)' : 'var(--warn)' }}>
            {score.toFixed(1)}
          </div>
          <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginTop: 4 }}>80.0 required to pass</div>
          <ProgressBar value={score / 100} variant={score >= 80 ? 'defense' : 'attack'} thick style={{ marginTop: 12 }} />
        </Card>
        <StatCard label="Wasserstein Distance" value={f.wasserstein_distance.toFixed(3)} sub="Multivariate" tone={f.wasserstein_distance < 0.1 ? 'good' : 'warn'} />
        <StatCard label="Provenance AUC" value={f.provenance_auc.toFixed(3)} sub="Target: 0.5 (chance)" tone={Math.abs(f.provenance_auc - 0.5) < 0.02 ? 'good' : 'bad'} />
      </div>

      <Card noPad className="mb-6">
        <div style={{ padding: 'var(--space-5) var(--space-6) var(--space-4)' }}>
          <div className="chart-title" style={{ margin: 0 }}>KS Statistic per Feature</div>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead><tr><th>Feature</th><th>KS Statistic</th><th>p-value</th><th>Status</th></tr></thead>
            <tbody>
              {Object.entries(f.ks_stats).map(([feat, stat]) => (
                <tr key={feat}>
                  <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{feat}</code></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)' }}>{stat.ks.toFixed(3)}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>{stat.p_value.toFixed(2)}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      {stat.pass ? <CheckCircle size={14} style={{ color: 'var(--good)' }} /> : <XCircle size={14} style={{ color: 'var(--attack)' }} />}
                      <Badge variant={stat.pass ? 'allow' : 'block'}>{stat.pass ? 'PASS' : 'FAIL'}</Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="chart-title mb-3">Dataset Calibration Note</div>
        <div className="flex gap-6">
          <div>
            <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>simulator_calibrated_phi</span>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--good)', fontSize: '1.25rem', marginTop: 4 }}>{f.simulator_calibrated_phi.toFixed(3)}</div>
          </div>
          <div>
            <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>dataset_calibrated_phi</span>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)', fontSize: '1.25rem', marginTop: 4 }}>NOT COMPUTED</div>
            <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginTop: 2 }}>No external dataset provided</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
