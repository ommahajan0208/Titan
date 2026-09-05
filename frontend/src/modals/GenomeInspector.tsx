// modals/GenomeInspector.tsx
// Side drawer showing full detail of a selected AttackGenome.
// Spec: frontend_spec.md (Phase 6 - GenomeInspector)
// Opens as a right-side panel overlay, backdrop closes it.

import React from 'react'
import { X } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import type { AttackGenome, GenomeTraits } from '../types'

interface GenomeInspectorProps {
  genome: AttackGenome | null
  onClose: () => void
}

const TRAIT_LABELS: Record<keyof GenomeTraits, string> = {
  velocity:             'Velocity',
  volume:               'Volume',
  timing_spread:        'Timing Spread',
  infra_diversity:      'Infra Diversity',
  graph_footprint:      'Graph Footprint',
  persistence:          'Persistence',
  behavioral_variance:  'Behavioral Variance',
  economic_aggression:  'Economic Aggression',
  economic_efficiency:  'Economic Efficiency',
  stealth:              'Stealth',
}

export function GenomeInspector({ genome, onClose }: GenomeInspectorProps) {
  if (!genome) return null

  const originColor =
    genome.origin === 'mutation'  ? 'var(--ink-muted)'  :
    genome.origin === 'crossover' ? 'var(--spot)'       :
                                    'var(--warn)'

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Genome Inspector"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '95vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-strong)',
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
            gap: 12,
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
              Genome Inspector
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                color: 'var(--spot)',
                letterSpacing: '0.02em',
              }}
            >
              {genome.genome_id}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <Badge variant="neutral">Gen {genome.generation}</Badge>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: originColor,
                  border: `1px solid ${originColor}`,
                  borderRadius: 4,
                  padding: '2px 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {genome.origin}
              </span>
            </div>
          </div>

          <button
            id="genome-inspector-close"
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
              flexShrink: 0,
            }}
            aria-label="Close genome inspector"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Behavioral Traits */}
          <section>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginBottom: 12,
              }}
            >
              Behavioral Traits
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(Object.entries(genome.traits) as [keyof GenomeTraits, number][]).map(([key, val]) => (
                <div key={key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {TRAIT_LABELS[key]}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: val > 0.7 ? 'var(--spot)' : 'var(--ink-faint)',
                      }}
                    >
                      {val.toFixed(2)}
                    </span>
                  </div>
                  <ProgressBar
                    value={val}
                    variant={val > 0.7 ? 'defense' : 'default'}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Attack Family Composition */}
          <section>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginBottom: 12,
              }}
            >
              Attack Composition
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(genome.composition)
                .sort(([, a], [, b]) => b - a)
                .map(([family, weight]) => (
                  <div key={family}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {family.replace(/_/g, ' ')}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: 'var(--ink-faint)',
                        }}
                      >
                        {(weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar value={weight} variant="attack" />
                  </div>
                ))}
            </div>
          </section>

          {/* Parent Lineage */}
          {genome.parent_ids.length > 0 && (
            <section>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  marginBottom: 12,
                }}
              >
                Parent Lineage
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {genome.parent_ids.map((pid, i) => (
                  <div
                    key={pid}
                    style={{
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--ink-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ color: 'var(--ink-faint)' }}>P{i + 1}</span>
                    <span style={{ color: 'var(--spot)' }}>{pid}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Operator Log */}
          {genome.operator_log.length > 0 && (
            <section>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  marginBottom: 12,
                }}
              >
                Operator Log
              </div>
              <div
                style={{
                  background: 'var(--bg-void)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {genome.operator_log.map((op, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: i === genome.operator_log.length - 1
                        ? 'var(--spot)'
                        : 'var(--ink-muted)',
                    }}
                  >
                    {op}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Infra cost */}
          {genome.infra_cost !== undefined && (
            <section>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  marginBottom: 6,
                }}
              >
                Infrastructure Cost
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  color: 'var(--ink)',
                }}
              >
                ${genome.infra_cost.toFixed(2)}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  )
}
