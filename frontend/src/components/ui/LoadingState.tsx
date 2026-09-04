import { Button } from './Button'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <div className={`spinner${size === 'lg' ? ' spinner-lg' : ''}`} />
      <span className="text-small" style={{ color: 'var(--ink-muted)' }}>{message}</span>
    </div>
  )
}

interface EmptyStateProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

import React from 'react'

export function EmptyState({ message, action, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? (
        <div className="empty-state-icon">{icon}</div>
      ) : (
        <svg
          className="empty-state-icon"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="24" r="20" strokeDasharray="4 3" />
          <line x1="24" y1="16" x2="24" y2="26" />
          <circle cx="24" cy="31" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )}
      <p className="empty-state-message">{message}</p>
      {action && (
        <Button variant="ghost" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="card"
      style={{ borderColor: 'var(--attack-glow)', background: 'var(--attack-soft)', textAlign: 'center' }}
    >
      <p style={{ color: 'var(--attack)', marginBottom: onRetry ? 'var(--space-4)' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
