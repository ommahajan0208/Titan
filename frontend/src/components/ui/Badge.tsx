<<<<<<< HEAD
=======
import React from 'react'

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
type BadgeVariant =
  | 'block' | 'allow' | 'review'
  | 'critical' | 'high' | 'medium' | 'low'
  | 'defense' | 'neutral' | 'live'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
<<<<<<< HEAD
}

import React from 'react'

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
=======
  style?: React.CSSProperties
}

export function Badge({ variant = 'neutral', children, className = '', style }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} style={style}>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
      {variant === 'live' && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
<<<<<<< HEAD
            background: 'var(--good)',
=======
            background: 'var(--spot)',
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
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
