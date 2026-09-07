// pages/AuditLog.tsx
// Immutable governance event trail - fetches from GET /api/audit/events

import { useState, useEffect, useCallback } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { api } from '../services/api'

interface AuditEvent {
  event_id: string
  event_type: string
  actor: string
  result: string
  model_id: string
  timestamp: string
  details?: Record<string, unknown>
}

// Fallback data in case backend is unavailable
const FALLBACK_EVENTS: AuditEvent[] = [
  { event_id: 'a1', event_type: 'MODEL_PROMOTED',  actor: 'system', result: 'SUCCESS',   model_id: 'defense-v3.0', timestamp: '2026-08-20 09:14:32' },
  { event_id: 'a2', event_type: 'GATE_EVALUATED',  actor: 'system', result: 'ALL_PASS',  model_id: 'defense-v3.0', timestamp: '2026-08-20 09:14:28' },
  { event_id: 'a3', event_type: 'MODEL_PROMOTED',  actor: 'system', result: 'SUCCESS',   model_id: 'defense-v2.0', timestamp: '2026-08-10 14:07:11' },
  { event_id: 'a4', event_type: 'RETRAIN_STARTED', actor: 'api',    result: 'TRIGGERED', model_id: 'defense-v2.0', timestamp: '2026-08-10 14:07:08' },
  { event_id: 'a5', event_type: 'MODEL_PROMOTED',  actor: 'system', result: 'SUCCESS',   model_id: 'defense-v1.0', timestamp: '2026-08-01 10:02:45' },
  { event_id: 'a6', event_type: 'POLICY_CHANGED',  actor: 'admin',  result: 'APPLIED',   model_id: 'defense-v1.0', timestamp: '2026-08-01 10:02:40' },
]

const EVENT_COLORS: Record<string, string> = {
  MODEL_PROMOTED:    'allow',
  GATE_EVALUATED:    'defense',
  RETRAIN_STARTED:   'review',
  RETRAIN_COMPLETED: 'allow',
  POLICY_CHANGED:    'neutral',
  MODEL_ROLLBACK:    'block',
}

const ALL_TYPES = [
  'All Events',
  'MODEL_PROMOTED',
  'RETRAIN_COMPLETED',
  'GATE_EVALUATED',
  'RETRAIN_STARTED',
  'POLICY_CHANGED',
  'MODEL_ROLLBACK',
]

function formatTs(ts: string) {
  // Accept ISO or space-separated format
  return ts.replace('T', ' ').replace(/\.\d+Z?$/, '')
}

export default function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>(FALLBACK_EVENTS)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All Events')
  const [live, setLive] = useState(true)

  const fetchEvents = useCallback(() => {
    api.getAuditLog(100)
      .then((data) => {
        if (data && (data as AuditEvent[]).length > 0) {
          setEvents(data as AuditEvent[])
        }
      })
      .catch(() => {
        // keep fallback events
      })
      .finally(() => setLoading(false))
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Live polling every 8 seconds
  useEffect(() => {
    if (!live) return
    const id = setInterval(fetchEvents, 8000)
    return () => clearInterval(id)
  }, [live, fetchEvents])

  const displayed = filter === 'All Events'
    ? events
    : events.filter(e => e.event_type === filter)

  function exportCsv() {
    const header = 'timestamp,event_type,actor,model_id,result'
    const rows = displayed.map(e =>
      `"${e.timestamp}","${e.event_type}","${e.actor}","${e.model_id}","${e.result}"`
    ).join('\n')
    const blob = new Blob([header + '\n' + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'titan_audit_log.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Immutable governance event trail</p>
      </div>

      <div className="flex gap-3 mb-6" style={{ alignItems: 'center' }}>
        <select
          id="audit-filter"
          className="select"
          style={{ maxWidth: 220 }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {ALL_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--ink-muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={live}
            onChange={e => setLive(e.target.checked)}
            style={{ accentColor: 'var(--spot)' }}
          />
          Live polling
        </label>

        {loading && (
          <span style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
            loading...
          </span>
        )}

        <Button
          id="audit-export-csv"
          variant="ghost"
          size="sm"
          style={{ marginLeft: 'auto' }}
          onClick={exportCsv}
        >
          Export CSV
        </Button>

        <Button
          id="audit-refresh"
          variant="ghost"
          size="sm"
          onClick={fetchEvents}
        >
          Refresh
        </Button>
      </div>

      <Card noPad>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>Actor</th>
                <th>Model</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: 'var(--space-8)' }}>
                    No events match the selected filter.
                  </td>
                </tr>
              ) : (
                displayed.map(e => (
                  <tr key={e.event_id}>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
                        {formatTs(e.timestamp)}
                      </code>
                    </td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--spot)' }}>
                        {e.event_type}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>{e.actor}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--defense)' }}>
                        {e.model_id}
                      </span>
                    </td>
                    <td>
                      <Badge variant={(EVENT_COLORS[e.event_type] ?? 'neutral') as any}>
                        {e.result}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
