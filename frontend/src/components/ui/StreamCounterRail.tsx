// components/ui/StreamCounterRail.tsx
// 260px fixed-width right panel showing running totals.
// Counter cells in order: TRANSACTIONS, DECISIONS, VALUE STOPPED,
//   FRAUD STOPPED, REALISED FPR.
// FPR shows '--' until 200+ legitimate rows streamed.

import type { StreamCounters } from '../../types'

interface StreamCounterRailProps {
  counters: StreamCounters
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN')
}

function fmtInr(n: number): string {
  if (n >= 10_00_000) return `\u20B9${(n / 10_00_000).toFixed(2)}L`
  if (n >= 1_000)     return `\u20B9${(n / 1_000).toFixed(1)}K`
  return `\u20B9${n}`
}

export function StreamCounterRail({ counters }: StreamCounterRailProps) {
  const {
    scored,
    blocksRaised,
    alertsRaised,
    approvalsIssued,
    valueStopped,
    fraudSeen,
    fraudStopped,
    realisedFpr,
  } = counters

  return (
    <div className="stream-counter-rail" role="region" aria-label="Stream counters">

      {/* 1. TRANSACTIONS */}
      <div className="stream-counter-cell">
        <span className="stream-counter-label">Transactions</span>
        <span className="stream-counter-value" id="ctr-transactions">{fmt(scored)}</span>
      </div>

      {/* 2. DECISIONS */}
      <div className="stream-counter-cell">
        <span className="stream-counter-label">Decisions</span>
        <span className="stream-counter-sub">
          {blocksRaised} BLOCK<br />
          {alertsRaised} ALERT<br />
          {approvalsIssued} APPROVE
        </span>
      </div>

      {/* 3. VALUE STOPPED */}
      <div className="stream-counter-cell">
        <span className="stream-counter-label">Value Stopped</span>
        <span className="stream-counter-value" id="ctr-value-stopped">{fmtInr(valueStopped)}</span>
      </div>

      {/* 4. FRAUD STOPPED */}
      <div className="stream-counter-cell">
        <span className="stream-counter-label">Fraud Stopped</span>
        <span className="stream-counter-value" id="ctr-fraud-stopped">
          {fraudStopped}
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}> / {fraudSeen}</span>
        </span>
      </div>

      {/* 5. REALISED FPR */}
      <div className="stream-counter-cell">
        <span className="stream-counter-label">Realised FPR</span>
        <span className="stream-counter-value" id="ctr-realised-fpr">
          {realisedFpr === null ? '--' : `${realisedFpr.toFixed(2)}%`}
        </span>
        {realisedFpr !== null && (
          <span className="stream-counter-sub">BUDGET 1.00%</span>
        )}
      </div>

      {/* Footer disclaimer */}
      <p className="stream-counter-disclaimer">
        Running totals of what you&apos;ve watched. Full-window figures live on Blue Team.
      </p>
    </div>
  )
}
