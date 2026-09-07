// modals/StreamRowInspector.tsx
// Slide-over drawer for a clicked stream row.
// Shows: txn_id, timestamp, amount, rail, channel, attack_family,
//   attack_vector_id, score bar, decision badge, layer description,
//   outcome (TP/TN/FP/FN) with plain-language explanation.
//
// Special copy for FN: "This payment evaded detection. The adaptive loop
//   is designed to learn from cases like this."
// Special copy for FP: "Legitimate payment incorrectly flagged. FPR budget
//   governs how many of these the system permits."

import { useEffect, useRef } from 'react'
import type { ScoredPayment } from '../types'
import { deriveOutcome } from '../types'

const LAYER_DESCRIPTIONS: Record<string, string> = {
  L0: 'Protocol rules - deterministic checks, fires in <1 ms, no ML required',
  L1: 'Behavioral ML ensemble - XGBoost + IsolationForest + LightGBM fusion',
  L2: 'GraphSAGE - fan-in percentile check on the transaction graph',
  L3: 'SHAP-explained ensemble - secondary scorer with explainability output',
}

function fmtInr(n: number): string {
  return `\u20B9${n.toLocaleString('en-IN')}`
}

interface StreamRowInspectorProps {
  row: ScoredPayment
  onClose: () => void
}

export function StreamRowInspector({ row, onClose }: StreamRowInspectorProps) {
  const outcome = deriveOutcome(row.decision, row.is_fraud)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Trap focus + close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const outcomeExplanation = () => {
    switch (outcome) {
      case 'TP': return 'Fraud correctly identified and blocked. True positive.'
      case 'TN': return 'Legitimate payment correctly approved. True negative.'
      case 'FP': return 'Legitimate payment incorrectly flagged. FPR budget governs how many of these the system permits.'
      case 'FN': return 'This payment evaded detection. The adaptive loop is designed to learn from cases like this.'
    }
  }

  const outcomeColor = () => {
    switch (outcome) {
      case 'TP': return 'var(--spot)'
      case 'TN': return 'var(--ink-muted)'
      case 'FP': return 'var(--attack)'
      case 'FN': return 'var(--attack)'
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stream row inspector"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 6, 7, 0.7)',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        ref={drawerRef}
        style={{
          width: 400,
          height: '100%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-strong)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slide-in-right 200ms var(--ease-out) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
              Row Inspector
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--ink)', marginTop: 2 }}>
              {row.txn_id}
            </div>
          </div>
          <button
            id="inspector-close-btn"
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
            }}
          >
            ESC
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-5)' }}>

          {/* Payment fields */}
          <Section label="Payment Details">
            <Field label="Time" value={row.timestamp} />
            <Field label="Payer ID" value={row.payer_id} mono />
            <Field label="Amount" value={fmtInr(row.amount)} mono />
            <Field label="Rail" value={row.rail} />
            <Field label="Channel" value={row.channel} />
            {row.attack_family && (
              <Field label="Attack Family" value={row.attack_family.replace(/_/g, ' ')} />
            )}
            {row.attack_vector_id && (
              <Field label="Attack Vector" value={row.attack_vector_id} mono />
            )}
          </Section>

          {/* Score bar */}
          <Section label="Risk Score">
            <div style={{ marginBottom: 'var(--space-2)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ink-faint)' }}>
                0.000
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--ink)' }}>
                {row.score.toFixed(3)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ink-faint)' }}>
                1.000
              </span>
            </div>
            <div style={{ background: 'var(--bg-raised)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${row.score * 100}%`,
                background: row.score > 0.75 ? 'var(--defense)' : 'var(--border-strong)',
                borderRadius: 3,
                transition: 'width 0.3s var(--ease-out)',
              }} />
            </div>
          </Section>

          {/* Decision */}
          <Section label="Decision">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className={`badge ${row.decision === 'BLOCK' ? 'badge-block' : row.decision === 'ALERT' ? 'badge-review' : 'badge-allow'}`}>
                {row.decision}
              </span>
              {row.layer_fired ? (
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--spot)', marginBottom: 2 }}>
                    {row.layer_fired}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ink-faint)', lineHeight: 1.5 }}>
                    {LAYER_DESCRIPTIONS[row.layer_fired]}
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '0.6875rem', color: 'var(--ink-faint)' }}>No layer triggered (approved)</span>
              )}
            </div>
          </Section>

          {/* Outcome */}
          <Section label="Outcome">
            <div style={{
              padding: 'var(--space-4)',
              background: 'var(--bg-raised)',
              borderRadius: 'var(--radius)',
              borderLeft: `3px solid ${outcomeColor()}`,
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: outcomeColor(), marginBottom: 'var(--space-2)', fontWeight: 700 }}>
                {outcome}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                {outcomeExplanation()}
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
              <div>
                <div style={{ color: 'var(--ink-faint)', marginBottom: 2 }}>Ground Truth</div>
                <div style={{ color: 'var(--ink)' }}>{row.is_fraud ? 'FRAUD' : 'LEGITIMATE'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ink-faint)', marginBottom: 2 }}>Verdict</div>
                <div style={{ color: 'var(--ink)' }}>{row.decision}</div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5625rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ink-faint)',
        marginBottom: 'var(--space-3)',
        paddingBottom: 'var(--space-1)',
        borderBottom: '1px solid var(--rule)',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {children}
      </div>
    </div>
  )
}

import React from 'react'

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: '0.6875rem', color: 'var(--ink-faint)' }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: '0.75rem', color: 'var(--ink)' }}>
        {value}
      </span>
    </div>
  )
}
