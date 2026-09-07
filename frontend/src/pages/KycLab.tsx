import React from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { AccountNebula3D } from '../three/AccountNebula3D'
import { MOCK_MULE_NODES, MOCK_MULE_EDGES } from '../services/mockData'
import { useAppStore } from '../stores/appStore'

export default function KycLab() {
  const mode = useAppStore(s => s.mode)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">KYC Lab</h1>
        <p className="page-subtitle">Liveness, face-match, and mule network graph analysis</p>
      </div>

      <div style={{
        background: 'var(--attack-soft)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-faint)', marginBottom: 4 }}>
          RESEARCH DEMONSTRATION
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
          This is a research demonstration. The ArcFace biometric pipeline is not compliant with GDPR/BIPA
          for production deployment without demographic testing and ISO 30107-3 certified liveness.
        </p>
      </div>

      {/* Mule Network Graph */}
      <Card className="mb-6" noHover>
        <div className="flex items-center justify-between mb-4">
          <div className="chart-title" style={{ margin: 0 }}>Mule Account Network (GraphSAGE)</div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, background: mode === 'attacker' ? '#2D6FD4' : '#1E90FF', borderRadius: 1 }} />
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>
                {mode === 'attacker' ? 'Route Nodes (Pass-through)' : 'Mule Accounts (Pass-through > 85%)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, background: '#374151', borderRadius: 1 }} />
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Legitimate Accounts</span>
            </div>
          </div>
        </div>
        <AccountNebula3D
          nodes={MOCK_MULE_NODES}
          edges={MOCK_MULE_EDGES}
          attacker={mode === 'attacker'}
          reduced={reduced}
          height={380}
        />
        <div style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ink-faint)' }}>
          {MOCK_MULE_NODES.length} accounts, {MOCK_MULE_EDGES.length} transfers, {MOCK_MULE_NODES.filter(n => n.passthrough > 0.85).length} pass-through flagged
        </div>
      </Card>

      <div className="grid grid-2 gap-6">
        <Card>
          <div className="chart-title mb-4">Flash-PAD Liveness Demo</div>
          <div style={{
            aspectRatio: '4/3', background: 'var(--bg-void)', borderRadius: 'var(--radius)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', marginBottom: 'var(--space-4)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-raised)',
                border: '1px solid var(--border-strong)', margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'live-pulse 1.5s ease-in-out infinite',
              }}>
                <span style={{ fontSize: '1.5rem' }}>&#128065;</span>
              </div>
              <p className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Webcam / Video Upload</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary">Start Liveness Check</Button>
            <Button variant="ghost">Upload Video</Button>
          </div>
        </Card>

        <Card>
          <div className="chart-title mb-4">Face Match - ArcFace w600k_r50</div>
          <div className="flex gap-4 mb-4">
            {['ID Document', 'Webcam Capture'].map(label => (
              <div key={label} style={{
                flex: 1, aspectRatio: '1', background: 'var(--bg-void)',
                border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>&#128247;</div>
                  <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            padding: 'var(--space-4)', background: 'var(--bg-raised)',
            borderRadius: 'var(--radius)', marginBottom: 'var(--space-4)',
          }}>
            <div className="flex justify-between">
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Cosine Similarity</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>0.94</span>
            </div>
            <div className="flex justify-between" style={{ marginTop: 8 }}>
              <span className="text-annotation" style={{ color: 'var(--ink-faint)' }}>Threshold</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>0.82</span>
            </div>
          </div>
          <Badge variant="allow" style={{ fontSize: '0.875rem', padding: '6px 16px' }}>MATCH</Badge>
        </Card>
      </div>
    </div>
  )
}
