// pages/Dashboard.tsx
// PRIMARY OPERATIONAL SURFACE - rebuilt around the Live Payment Stream.
//
// Layout (top to bottom per implementation_plan_phasebyphase):
//   ARGUMENT BAR (IDENTIFY | GENERATE | DEFEND | LOOP - clickable, linked)
//   ┌─────────────────────────────────────┬─────────────────┐
//   │  LIVE PAYMENT STREAM                │  COUNTER RAIL   │
//   │  [StreamControls: Pause|Rate|Reset] │  TRANSACTIONS   │
//   │  [STREAM::DEMO FRAUD OVERSAMPLED]   │  DECISIONS      │
//   │  TIME PAYER AMOUNT RAIL SCORE       │  VALUE STOPPED  │
//   │  DECISION OUTCOME                   │  FRAUD STOPPED  │
//   │  ...rows scroll in...               │  REALISED FPR   │
//   └─────────────────────────────────────┴─────────────────┘
//   PERFORMANCE PROBE  [ + ]  (collapsed accordion)
//   QUICK ACTIONS
//
// Design law: no h1 page title, no red/amber/green, stream is the page.

import { useState, useCallback } from 'react'
import { ArgumentBar } from '../components/ui/ArgumentBar'
import { PaymentStreamTable } from '../components/ui/PaymentStreamTable'
import { StreamCounterRail } from '../components/ui/StreamCounterRail'
import { StreamControls } from '../components/ui/StreamControls'
import { PerformanceProbe } from '../components/ui/PerformanceProbe'
import { Button } from '../components/ui/Button'
import { StreamRowInspector } from '../modals/StreamRowInspector'
import { usePaymentStream } from '../hooks/usePaymentStream'
import { useAppStore } from '../stores/appStore'
import { MOCK_STREAM_PAYMENTS, MOCK_DASHBOARD } from '../services/mockData'
import type { ScoredPayment } from '../types'
import { Play, RefreshCw, Swords } from 'lucide-react'

export default function Dashboard() {
  const setTab      = useAppStore(s => s.setActiveTab)
  const setJudge    = useAppStore(s => s.setJudgeDemoOpen)
  const isDemoMode  = useAppStore(s => s.isDemoMode)

  // Selected row for the StreamRowInspector drawer
  const [inspectedRow, setInspectedRow] = useState<ScoredPayment | null>(null)

  // The live stream hook - auto-starts on Dashboard mount
  const {
    rows,
    counters,
    running,
    rate,
    setRate,
    toggle,
    reset,
  } = usePaymentStream(MOCK_STREAM_PAYMENTS, true /* autoStart */)

  const handleRowClick = useCallback((row: ScoredPayment) => {
    setInspectedRow(row)
  }, [])

  const kpi = MOCK_DASHBOARD.kpis

  return (
    <div className="page" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ARGUMENT BAR - thesis strip linking to the 4 capability pages */}
      <div style={{ padding: 'var(--space-4) var(--space-6) 0' }}>
        <ArgumentBar
          onNavigate={setTab}
          recall={kpi.recall}
          vectors={36}
        />
      </div>

      {/* STREAM SECTION - main content area */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        margin: 'var(--space-4) var(--space-6) 0',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--bg-void)',
      }}>

        {/* Left: stream table + controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Stream controls bar */}
          <StreamControls
            running={running}
            rate={rate}
            onToggle={toggle}
            onRateChange={setRate}
            onReset={reset}
            streamMode={isDemoMode ? 'DEMO' : 'LIVE'}
          />

          {/* Payment stream table - fills remaining space */}
          <PaymentStreamTable
            rows={rows}
            selectedTxnId={inspectedRow?.txn_id ?? null}
            onRowClick={handleRowClick}
            streamMode={isDemoMode ? 'DEMO' : 'LIVE'}
          />
        </div>

        {/* Right: counter rail */}
        <StreamCounterRail counters={counters} />
      </div>

      {/* PERFORMANCE PROBE - collapsed accordion */}
      <div style={{ padding: '0 var(--space-6) var(--space-4)', marginTop: 'var(--space-4)' }}>
        <PerformanceProbe isDemoMode={isDemoMode} />
      </div>

      {/* QUICK ACTIONS */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
        background: 'var(--bg-void)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
          Quick Actions
        </span>
        <Button
          id="dash-run-campaign"
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={12} />}
          onClick={() => setTab('red-team')}
        >
          Run Campaign
        </Button>
        <Button
          id="dash-judge-demo"
          variant="primary"
          size="sm"
          icon={<Play size={12} />}
          onClick={() => setJudge(true)}
        >
          Launch Judge Demo
        </Button>
        <Button
          id="dash-war-room"
          variant="ghost"
          size="sm"
          icon={<Swords size={12} />}
          onClick={() => setTab('war-room')}
        >
          Open War Room
        </Button>
      </div>

      {/* STREAM ROW INSPECTOR - slide-over drawer */}
      {inspectedRow && (
        <StreamRowInspector
          row={inspectedRow}
          onClose={() => setInspectedRow(null)}
        />
      )}
    </div>
  )
}
