import {
  LayoutDashboard,
  ShieldAlert,
  FlaskConical,
  Crosshair,
  Shield,
  GitFork,
  Swords,
  Gauge,
  ScanFace,
  FileText,
  ClipboardList,
} from 'lucide-react'

export type NavId =
  | 'dashboard'
  | 'threat-catalog'
  | 'red-team'
  | 'blue-team'
  | 'gap-analysis'
  | 'evolution'
  | 'war-room'
  | 'fidelity'
  | 'kyc-lab'
  | 'audit'
  | 'docs'

export interface NavItem {
  id: NavId
  label: string
  icon: React.ReactNode
  badge?: string | number
}

interface SidebarProps {
  active: NavId
  onNavigate: (id: NavId) => void
  modelVersion?: string
  recall?: number
  fpr?: number
  isLive?: boolean
}

import React from 'react'

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',      label: 'Overview',       icon: <LayoutDashboard size={18} /> },
  { id: 'threat-catalog', label: 'Threat Catalog',  icon: <ShieldAlert size={18} />,    badge: 36 },
  { id: 'red-team',       label: 'Red Team',        icon: <Crosshair size={18} /> },
  { id: 'blue-team',      label: 'Blue Team',       icon: <Shield size={18} /> },
  { id: 'gap-analysis',   label: 'Gap Analysis',    icon: <GitFork size={18} /> },
  { id: 'evolution',      label: 'Evolution',       icon: <FlaskConical size={18} /> },
  { id: 'war-room',       label: 'War Room',        icon: <Swords size={18} /> },
  { id: 'fidelity',       label: 'Fidelity Lab',    icon: <Gauge size={18} /> },
  { id: 'kyc-lab',        label: 'KYC Lab',         icon: <ScanFace size={18} /> },
  { id: 'audit',          label: 'Audit Log',       icon: <ClipboardList size={18} /> },
  { id: 'docs',           label: 'Docs',            icon: <FileText size={18} /> },
]

export function Sidebar({
  active,
  onNavigate,
  modelVersion = 'v3.0',
  recall = 92.8,
  fpr = 1.0,
  isLive = true,
}: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Primary navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <DualOrbMini />
        <div className="sidebar-brand-text">
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.2 }}>
            Project Titan
          </div>
          <div className="text-annotation" style={{ color: 'var(--ink-faint)', marginTop: 2 }}>
            Defense Lab
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-label">{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Footer status: blue pulse dot, double-colon engineering notation */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          {isLive && <span className="live-dot" />}
          <span
            className="text-annotation"
            style={{ color: isLive ? 'var(--spot)' : 'var(--ink-faint)' }}
          >
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
          <span className="text-annotation" style={{ color: 'var(--ink-faint)', marginLeft: 4 }}>
            MODEL::{modelVersion.toUpperCase()}
          </span>
        </div>
        <div className="sidebar-metrics">
          FPR::{fpr.toFixed(2)}&nbsp;&nbsp;RECALL::{recall.toFixed(1)}
        </div>
      </div>
    </nav>
  )
}

function DualOrbMini() {
  return (
    <div style={{ width: 32, height: 32, flexShrink: 0, position: 'relative' }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="11" cy="16" r="9" fill="var(--defense)" style={{ mixBlendMode: 'screen' }}>
          <animateTransform attributeName="transform" type="rotate"
            from="0 16 16" to="360 16 16" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="21" cy="16" r="9" fill="var(--attack)" style={{ mixBlendMode: 'screen' }}>
          <animateTransform attributeName="transform" type="rotate"
            from="360 16 16" to="0 16 16" dur="8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
