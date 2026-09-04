import { Card } from '../components/ui/Card'
import { Badge, SeverityBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/LoadingState'
import { MOCK_TAXONOMY } from '../services/mockData'
import { useState } from 'react'
import React from 'react'

export default function ThreatCatalog() {
  const [selected, setSelected] = useState(MOCK_TAXONOMY[0])
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState('ALL')

  const families = ['ALL', ...Array.from(new Set(MOCK_TAXONOMY.map(v => v.family)))]
  const filtered = MOCK_TAXONOMY.filter(v =>
    (family === 'ALL' || v.family === family) &&
    (query === '' || v.name.toLowerCase().includes(query.toLowerCase()) || v.id.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Threat Catalog</h1>
        <p className="page-subtitle">36-vector attack taxonomy across 8 families</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <input id="threat-search" className="input" style={{ maxWidth: 280 }} placeholder="Search vectors..." value={query} onChange={e => setQuery(e.target.value)} />
        <select id="threat-family-filter" className="select" value={family} onChange={e => setFamily(e.target.value)}>
          {families.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-faint)', display: 'flex', alignItems: 'center' }}>
          {filtered.length} vectors
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1.4fr', gap: 'var(--space-4)', alignItems: 'start' }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.length === 0 ? <EmptyState message="No vectors match your filters." /> : filtered.map(v => (
            <div
              key={v.id}
              onClick={() => setSelected(v)}
              style={{
                padding: 'var(--space-4)',
                background: selected?.id === v.id ? 'var(--bg-raised)' : 'var(--bg-surface)',
                border: `1px solid ${selected?.id === v.id ? 'var(--spot-glow)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--spot)' }}>{v.id}</code>
                <SeverityBadge severity={v.severity} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{v.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{v.family}</div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <Card style={{ position: 'sticky', top: 80 }}>
            <div className="flex items-center gap-3 mb-4">
              <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--spot)' }}>{selected.id}</code>
              <SeverityBadge severity={selected.severity} />
              {selected.gen_ai && <Badge variant="defense">GenAI</Badge>}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{selected.name}</h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>{selected.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 6 }}>Evasion Strategy</div>
                <div style={{ fontSize: '0.875rem' }}>{selected.evasion_strategy}</div>
              </div>
              <div>
                <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 6 }}>Detection Signals</div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {selected.signals.map(s => <Badge key={s} variant="neutral">{s.replace(/_/g, ' ')}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 6 }}>Mitigation Policy</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>{selected.mitigation_policy}</div>
              </div>
              <div className="flex gap-6">
                <div>
                  <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 4 }}>Sophistication</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--warn)', fontSize: '1.25rem' }}>{selected.sophistication.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginBottom: 4 }}>Detectability</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{selected.detectability}</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
