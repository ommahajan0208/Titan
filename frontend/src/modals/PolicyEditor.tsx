// modals/PolicyEditor.tsx
// Modal for adjusting Blue Team detection policy thresholds.
// Spec: frontend_spec.md (Phase 6 - PolicyEditor)
// Shows sliders for ML threshold, FPR budget, graph weight, trust region, adaptation rate.

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import type { DefensePolicy } from '../types'

interface PolicyEditorProps {
  policy: DefensePolicy
  onClose: () => void
  onSave: (updated: DefensePolicy) => void
}

interface SliderFieldProps {
  id: string
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}

function SliderField({ id, label, description, value, min, max, step, format, onChange }: SliderFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label
          htmlFor={id}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-muted)',
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            color: 'var(--spot)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {format(value)}
        </span>
      </div>

      <ProgressBar value={(value - min) / (max - min)} variant="defense" />

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          appearance: 'none',
          WebkitAppearance: 'none',
          height: 2,
          background: 'transparent',
          cursor: 'pointer',
          outline: 'none',
          marginTop: -20,
          opacity: 0,
          position: 'relative',
          zIndex: 1,
        }}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
      />

      <p
        style={{
          fontSize: '0.6875rem',
          color: 'var(--ink-faint)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {description}
      </p>
    </div>
  )
}

export function PolicyEditor({ policy, onClose, onSave }: PolicyEditorProps) {
  const [draft, setDraft] = useState<DefensePolicy>({ ...policy })
  const [saving, setSaving] = useState(false)

  const update = (key: keyof DefensePolicy) => (val: number) =>
    setDraft(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onSave(draft)
    setSaving(false)
    onClose()
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(policy)

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Policy Editor"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100dvh - 40px)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginBottom: 4,
              }}
            >
              Blue Team Policy Editor
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Detection Thresholds
            </h2>
          </div>
          <button
            id="policy-editor-close"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Close policy editor"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SliderField
            id="policy-ml-threshold"
            label="ML Threshold"
            description="Fused score cutoff for BLOCK vs REVIEW. Lower increases recall but also FPR."
            value={draft.ml_threshold}
            min={0.3}
            max={0.95}
            step={0.01}
            format={v => v.toFixed(2)}
            onChange={update('ml_threshold')}
          />

          <SliderField
            id="policy-fpr-target"
            label="FPR Budget"
            description="Maximum allowable false positive rate. Must pass Gate 2 to promote a model."
            value={draft.fpr_target}
            min={0.005}
            max={0.05}
            step={0.001}
            format={v => `${(v * 100).toFixed(1)}%`}
            onChange={update('fpr_target')}
          />

          <SliderField
            id="policy-graph-weight"
            label="Graph Weight"
            description="Weight of the GraphSAGE score in the fused ensemble. Rule weight is 1 minus (ML + graph)."
            value={draft.graph_weight}
            min={0.05}
            max={0.6}
            step={0.01}
            format={v => v.toFixed(2)}
            onChange={update('graph_weight')}
          />

          <SliderField
            id="policy-trust-region"
            label="Trust Region"
            description="Maximum fractional change allowed in a single policy update. Prevents instability."
            value={draft.trust_region}
            min={0.01}
            max={0.2}
            step={0.005}
            format={v => v.toFixed(3)}
            onChange={update('trust_region')}
          />

          <SliderField
            id="policy-adaptation-rate"
            label="Adaptation Rate"
            description="Rate at which the Blue AI agent adjusts thresholds in adaptive mode."
            value={draft.adaptation_rate}
            min={0.0005}
            max={0.01}
            step={0.0001}
            format={v => v.toFixed(4)}
            onChange={update('adaptation_rate')}
          />

          {/* Change summary */}
          {hasChanges && (
            <div
              style={{
                background: 'var(--defense-soft)',
                border: '1px solid var(--defense-glow)',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--spot)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Pending Changes
              </div>
              {(Object.keys(draft) as (keyof DefensePolicy)[])
                .filter(k => draft[k] !== policy[k])
                .map(k => (
                  <div
                    key={k}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--ink-muted)',
                      marginTop: 3,
                    }}
                  >
                    <span style={{ color: 'var(--ink-faint)' }}>{k}</span>
                    {' '}{policy[k].toFixed(4)} → <span style={{ color: 'var(--spot)' }}>{draft[k].toFixed(4)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button id="policy-editor-cancel" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            id="policy-editor-save"
            variant="primary"
            size="sm"
            icon={<Save size={12} />}
            disabled={!hasChanges}
            loading={saving}
            onClick={handleSave}
          >
            Apply Policy
          </Button>
        </div>
      </div>
    </>
  )
}
