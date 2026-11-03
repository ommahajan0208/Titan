// components/ui/PaymentStreamTable.tsx
// Renders the live payment stream as a table.
//
// Rules (non-negotiable per design spec):
//   - Max 60 visible rows (DOM budget) - rows[] is already capped by the hook
//   - Only rows[0] (the newest row) gets the .stream-row-fresh animation class
//   - BLOCK rows: .stream-row-block (graphite + electric-blue left border)
//   - ALERT rows: .stream-row-alert (mid-dark graphite + grey left border)
//   - APPROVE rows: no class (default transparent row)
//   - Selected row: .stream-row-selected
//   - Outcome (TP/TN/FP/FN) derived at render time from { decision, is_fraud }
//   - Click row opens StreamRowInspector via onRowClick callback

import { memo } from 'react'
import type { ScoredPayment, StreamOutcome } from '../../types'
import { deriveOutcome } from '../../types'

function fmtInr(n: number): string {
  return `\u20B9${n.toLocaleString('en-IN')}`
}

function outcomeClass(outcome: StreamOutcome): string {
  switch (outcome) {
    case 'TP': return 'tone-spot'
    case 'TN': return ''
    case 'FP': return 'tone-bad'
    case 'FN': return 'tone-bad'
    default:   return ''
  }
}

interface RowProps {
  row: ScoredPayment
  fresh: boolean
  selected: boolean
  onSelect: () => void
}

// Memoised row - only re-renders if its own props change
const StreamRow = memo(function StreamRow({ row, fresh, selected, onSelect }: RowProps) {
  const outcome = deriveOutcome(row.decision, row.is_fraud)

  let rowClass = ''
  if (selected)               rowClass = 'stream-row-selected'
  else if (row.decision === 'BLOCK')  rowClass = 'stream-row-block'
  else if (row.decision === 'ALERT')  rowClass = 'stream-row-alert'

  if (fresh) rowClass = `${rowClass} stream-row-fresh`.trim()

  return (
    <tr
      className={rowClass}
      onClick={onSelect}
      tabIndex={0}
      aria-label={`Inspect transaction ${row.txn_id}`}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect() } }}
      title={`Click to inspect ${row.txn_id}`}
    >
      <td>{row.timestamp}</td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>{row.payer_id}</td>
      <td style={{ textAlign: 'right' }}>{fmtInr(row.amount)}</td>
      <td style={{ fontSize: '0.625rem', letterSpacing: '0.04em' }}>{row.rail}</td>
      <td style={{ fontSize: '0.625rem' }}>{row.channel}</td>
      <td style={{ textAlign: 'right' }}>{row.score.toFixed(3)}</td>
      <td>
        <span className={`badge ${row.decision === 'BLOCK' ? 'badge-block' : row.decision === 'ALERT' ? 'badge-review' : 'badge-allow'}`}>
          {row.decision}
        </span>
      </td>
      <td>
        <span className={`text-mono ${outcomeClass(outcome)}`} style={{ fontSize: '0.625rem', fontWeight: 700 }}>
          {outcome}
        </span>
      </td>
    </tr>
  )
})

interface PaymentStreamTableProps {
  rows: ScoredPayment[]
  selectedTxnId: string | null
  onRowClick: (row: ScoredPayment) => void
  streamMode?: 'DEMO' | 'LIVE'
}

export function PaymentStreamTable({
  rows,
  selectedTxnId,
  onRowClick,
  streamMode = 'DEMO',
}: PaymentStreamTableProps) {
  return (
    <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
      <table className="stream-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Payer</th>
            <th style={{ textAlign: 'right' }}>Amount (INR)</th>
            <th>Rail</th>
            <th>Channel</th>
            <th style={{ textAlign: 'right' }}>Score</th>
            <th>Decision</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <StreamRow
              key={row.txn_id}
              row={row}
              fresh={i === 0}
              selected={row.txn_id === selectedTxnId}
              onSelect={() => onRowClick(row)}
            />
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--ink-faint)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {streamMode === 'DEMO' ? 'STREAM::DEMO -- PRESS RESUME TO START' : 'Waiting for live data...'}
        </div>
      )}
    </div>
  )
}
