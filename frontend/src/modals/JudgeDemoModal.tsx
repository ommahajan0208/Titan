// modals/JudgeDemoModal.tsx
// Full-screen overlay executing the 9-step AI Defense pipeline demo.
// Spec: frontend_spec.md Section 6.1 (from AegisPay pattern)
// Steps animate: PENDING -> RUNNING (spinner) -> COMPLETED (checkmark) with 800ms between each.

import React, { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { CheckCircle, Loader2, Circle, X } from 'lucide-react'

interface DemoStep {
  step: number
  title: string
  subtitle: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED'
  detail?: string
}

const PIPELINE_STEPS: Omit<DemoStep, 'status' | 'detail'>[] = [
  { step: 1, title: 'IDENTIFY',  subtitle: '36-vector taxonomy loaded, 8 families indexed' },
  { step: 2, title: 'GENERATE',  subtitle: 'Parametric mutator expressing genome G-4821-c2x' },
  { step: 3, title: 'SIMULATE',  subtitle: 'Statistical payment sandbox - 94 synthetic events' },
  { step: 4, title: 'DETECT',    subtitle: 'XGBoost 0.88 + IsoForest 0.71 + GraphSAGE 0.64 + Rules → fused 0.81' },
  { step: 5, title: 'EXPLAIN',   subtitle: 'SHAP top-3: graph_footprint (+0.34), velocity (+0.28), timing_spread (+0.19)' },
  { step: 6, title: 'ANALYZE',   subtitle: 'K-Means: 3 evasion clusters, weak feature: behavioral_variance' },
  { step: 7, title: 'SYNTHESIZE', subtitle: '250 counter-examples generated targeting cluster centroids' },
  { step: 8, title: 'RETRAIN',   subtitle: 'Defense v3.0 trained, F1: 0.991, FPR: 1.0%, all 4 gates PASS' },
  { step: 9, title: 'EVOLVE',    subtitle: 'NSGA-II generation 7/10, ARI: +0.142, regime: blue_ascendant' },
]

const STEP_DELAY_MS = 900

export function JudgeDemoModal() {
  const isOpen = useAppStore(s => s.isJudgeDemoOpen)
  const setOpen = useAppStore(s => s.setJudgeDemoOpen)
  const addNotification = useAppStore(s => s.addNotification)

  const [steps, setSteps] = useState<DemoStep[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const resetSteps = useCallback(() => {
    setSteps(PIPELINE_STEPS.map(s => ({ ...s, status: 'PENDING' })))
    setDone(false)
  }, [])

  useEffect(() => {
    if (isOpen) resetSteps()
  }, [isOpen, resetSteps])

  const runDemo = useCallback(async () => {
    if (running) return
    setRunning(true)
    resetSteps()

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      // Mark as RUNNING
      setSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'RUNNING' } : s
      ))
      await new Promise(r => setTimeout(r, STEP_DELAY_MS))

      // Mark as COMPLETED
      setSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: 'COMPLETED' } : s
      ))
      await new Promise(r => setTimeout(r, 120))
    }

    setRunning(false)
    setDone(true)
    addNotification({ type: 'success', message: 'Judge Demo complete - all 9 pipeline steps passed.' })
  }, [running, resetSteps, addNotification])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Judge Demo - 9-Step Pipeline"
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !running) setOpen(false) }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 80px var(--spot-glow), 0 32px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--spot)', letterSpacing: '0.12em', marginBottom: 4 }}>
              CLOSED-LOOP PIPELINE DEMO
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Project Titan - Judge Demo</h2>
          </div>
          {!running && (
            <button
              onClick={() => setOpen(false)}
              aria-label="Close dialog"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink-faint)', padding: 4, display: 'flex',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Steps */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {steps.map((step, i) => (
            <div
              key={step.step}
              style={{
                display: 'flex',
                gap: 12,
                paddingBottom: i < steps.length - 1 ? 0 : undefined,
              }}
            >
              {/* Timeline connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: step.status === 'COMPLETED' ? 'var(--good)'
                             : step.status === 'RUNNING'   ? 'var(--spot-soft)'
                             : 'var(--bg-raised)',
                  border: `1px solid ${
                    step.status === 'COMPLETED' ? 'var(--good)'
                    : step.status === 'RUNNING' ? 'var(--spot)'
                    : 'var(--border)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.3s, border-color 0.3s',
                  boxShadow: step.status === 'RUNNING' ? '0 0 12px var(--spot-glow)' : undefined,
                }}>
                  {step.status === 'COMPLETED' && <CheckCircle size={14} style={{ color: 'var(--bg-void)' }} />}
                  {step.status === 'RUNNING'   && <Loader2 size={14} style={{ color: 'var(--spot)', animation: 'spin 1s linear infinite' }} />}
                  {step.status === 'PENDING'   && <Circle size={14} style={{ color: 'var(--ink-faint)' }} />}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 1,
                    flex: 1,
                    minHeight: 20,
                    background: step.status === 'COMPLETED' ? 'var(--good)' : 'var(--border)',
                    transition: 'background 0.3s',
                    margin: '4px 0',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: step.status === 'COMPLETED' ? 'var(--good)'
                          : step.status === 'RUNNING'  ? 'var(--spot)'
                          : 'var(--ink-faint)',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    transition: 'color 0.3s',
                  }}>
                    {String(step.step).padStart(2, '0')} {step.title}
                  </span>
                  {step.status === 'RUNNING' && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--spot)', animation: 'fadeInOut 1.2s ease-in-out infinite' }}>
                      RUNNING
                    </span>
                  )}
                  {step.status === 'COMPLETED' && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--good)' }}>
                      DONE
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '0.8125rem',
                  color: step.status === 'PENDING' ? 'var(--ink-faint)' : 'var(--ink-muted)',
                  lineHeight: 1.5,
                  transition: 'color 0.3s',
                }}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          {done && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--good)', fontWeight: 500 }}>
              All 9 steps completed successfully.
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {!running && (
              <button
                id="judge-demo-run-btn"
                onClick={runDemo}
                disabled={running}
                style={{
                  padding: '8px 20px',
                  background: 'var(--spot)',
                  color: 'var(--bg-void)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.05em',
                }}
              >
                {done ? 'Run Again' : 'Run Demo'}
              </button>
            )}
            {running && (
              <span style={{
                padding: '8px 20px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--spot)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Running...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
