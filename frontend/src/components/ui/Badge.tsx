import React from 'react'

type BadgeVariant =
  | 'block' | 'allow' | 'review'
  | 'critical' | 'high' | 'medium' | 'low'
  | 'defense' | 'neutral' | 'live'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Badge({ variant = 'neutral', children, className = '', style }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} style={style}>
      {variant === 'live' && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--good)',
            animation: 'live-pulse 2s ease-in-out infinite',
          }}
        />
      )}
      {children}
    </span>
  )
}

export function DecisionBadge({ decision }: { decision: 'BLOCK' | 'REVIEW' | 'ALLOW' }) {
  const map = { BLOCK: 'block', REVIEW: 'review', ALLOW: 'allow' } as const
  return <Badge variant={map[decision]}>{decision}</Badge>
}

export function SeverityBadge({ severity }: { severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) {
  const map = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  } as const
  return <Badge variant={map[severity]}>{severity}</Badge>
}
