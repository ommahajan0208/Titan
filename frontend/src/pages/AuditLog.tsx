import React from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const AUDIT_EVENTS = [
  { id: 'a1', ts: '2026-08-20 09:14:32', event: 'MODEL_PROMOTED',  actor: 'system',   model: 'v3.0', result: 'SUCCESS' },
  { id: 'a2', ts: '2026-08-20 09:14:28', event: 'GATE_EVALUATED',  actor: 'system',   model: 'v3.0', result: 'ALL_PASS' },
  { id: 'a3', ts: '2026-08-10 14:07:11', event: 'MODEL_PROMOTED',  actor: 'system',   model: 'v2.0', result: 'SUCCESS' },
  { id: 'a4', ts: '2026-08-10 14:07:08', event: 'RETRAIN_STARTED', actor: 'api',      model: 'v2.0', result: 'TRIGGERED' },
  { id: 'a5', ts: '2026-08-01 10:02:45', event: 'MODEL_PROMOTED',  actor: 'system',   model: 'v1.0', result: 'SUCCESS' },
  { id: 'a6', ts: '2026-08-01 10:02:40', event: 'POLICY_CHANGED',  actor: 'admin',    model: 'v1.0', result: 'APPLIED' },
]

const EVENT_COLORS: Record<string, string> = {
  MODEL_PROMOTED:  'allow',
  GATE_EVALUATED:  'defense',
  RETRAIN_STARTED: 'review',
  POLICY_CHANGED:  'neutral',
  MODEL_ROLLBACK:  'block',
}

export default function AuditLog() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Immutable governance event trail</p>
      </div>

      <div className="flex gap-3 mb-6">
        <select id="audit-filter" className="select" style={{ maxWidth: 200 }}>
          <option>All Events</option>
          <option>MODEL_PROMOTED</option>
          <option>POLICY_CHANGED</option>
          <option>MODEL_ROLLBACK</option>
        </select>
        <Button variant="ghost" style={{ marginLeft: 'auto' }}>Export CSV</Button>
      </div>

      <Card noPad>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr><th>Timestamp</th><th>Event</th><th>Actor</th><th>Model</th><th>Result</th></tr>
            </thead>
            <tbody>
              {AUDIT_EVENTS.map(e => (
                <tr key={e.id}>
                  <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-faint)' }}>{e.ts}</code></td>
                  <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--spot)' }}>{e.event}</code></td>
                  <td><span style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>{e.actor}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--defense)' }}>Defense {e.model}</span></td>
                  <td><Badge variant={(EVENT_COLORS[e.event] ?? 'neutral') as any}>{e.result}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
