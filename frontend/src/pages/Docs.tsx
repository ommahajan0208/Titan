import React from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const ENDPOINTS = [
  { method: 'GET',    path: '/api/health',               desc: 'Service status, version, active model' },
  { method: 'GET',    path: '/api/overview',             desc: 'Current KPIs and decision split' },
  { method: 'GET',    path: '/api/taxonomy',             desc: '36-vector taxonomy with family grouping' },
  { method: 'POST',   path: '/api/attacks/generate',     desc: 'Generate N adversarial scenarios' },
  { method: 'POST',   path: '/api/score',                desc: 'Score a single payment-shaped event' },
  { method: 'POST',   path: '/api/simulate',             desc: 'Run a full adversarial simulation' },
  { method: 'GET',    path: '/api/gap-analysis',         desc: 'Current evasion clustering report' },
  { method: 'POST',   path: '/api/retrain',              desc: 'Train and evaluate a challenger model' },
  { method: 'GET',    path: '/api/graph/mules',          desc: 'Detected mule subgraphs for Account Nebula' },
  { method: 'GET',    path: '/api/atlas',                desc: '120-cell MAP-Elites blind-spot grid' },
  { method: 'POST',   path: '/api/adaptive/runs',        desc: 'Start a new co-evolution run' },
  { method: 'GET',    path: '/api/adaptive/runs/{id}/state', desc: 'Full live War Room state' },
  { method: 'GET',    path: '/api/audit',                desc: 'Governance event audit log' },
  { method: 'POST',   path: '/api/judge-demo/run',       desc: '9-step closed-loop pipeline demo' },
]

const METHOD_VARIANT: Record<string, string> = { GET: 'allow', POST: 'review', DELETE: 'block' }

export default function Docs() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documentation</h1>
        <p className="page-subtitle">Architecture reference and API documentation</p>
      </div>

      <div className="grid grid-2 gap-6 mb-6">
        <Card>
          <div className="chart-title mb-4">Architecture</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {['IDENTIFY (36 Vectors / 8 Families)', 'GENERATE (Parametric Mutator / Genome Expression)', 'SIMULATE (Statistical Payment Sandbox)', 'DETECT (XGBoost + IsoForest + GraphSAGE + Rules)', 'EXPLAIN (SHAP + LLM Triage)', 'ANALYZE (K-Means + MAP-Elites Atlas)', 'SYNTHESIZE (Counter-Example Generation)', 'RETRAIN (Adversarial Hardening + Gates)', 'EVOLVE (NSGA-II Co-Evolution)', 'LOOP'].map((step, i) => (
              <div key={step} className="flex items-center gap-3" style={{ padding: 'var(--space-2) var(--space-3)', background: i % 2 === 0 ? 'var(--bg-raised)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--spot)', minWidth: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>{step}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="chart-title mb-4">Tech Stack</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[['Frontend', 'React 18 + TypeScript + Vite'], ['3D', 'React Three Fiber + Three.js'], ['Charts', 'Recharts'], ['State', 'Zustand'], ['Backend', 'FastAPI + Python 3.12'], ['ML', 'XGBoost + LightGBM + Isolation Forest'], ['Graph', 'NetworkX + GraphSAGE'], ['Evolution', 'NSGA-II + MAP-Elites'], ['Biometrics', 'ArcFace ONNX + MediaPipe'], ['Storage', 'SQLite (demo) / PostgreSQL (prod)']].map(([layer, tech]) => (
              <div key={layer} className="flex justify-between" style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--rule)' }}>
                <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>{layer}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink)' }}>{tech}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card noPad>
        <div style={{ padding: 'var(--space-5) var(--space-6) var(--space-4)' }}>
          <div className="chart-title" style={{ margin: 0 }}>REST API Reference ({ENDPOINTS.length} endpoints)</div>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
            <tbody>
              {ENDPOINTS.map(ep => (
                <tr key={ep.path}>
                  <td><Badge variant={(METHOD_VARIANT[ep.method] ?? 'neutral') as any}>{ep.method}</Badge></td>
                  <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--spot)' }}>{ep.path}</code></td>
                  <td style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
