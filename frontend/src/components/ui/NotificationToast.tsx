// components/ui/NotificationToast.tsx
// Renders the global notifications from appStore.notifications
// Spec: frontend_spec.md Section 8 (Notifications)
// Position: fixed bottom-right stack, max 5 visible, slide-in animation

import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { Notification } from '../../types'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

const ICONS: Record<Notification['type'], React.ReactNode> = {
  success: <CheckCircle size={15} />,
  info:    <Info size={15} />,
  warn:    <AlertTriangle size={15} />,
  error:   <XCircle size={15} />,
}

const COLORS: Record<Notification['type'], string> = {
  success: 'var(--good)',
  info:    'var(--spot)',
  warn:    'var(--warn)',
  error:   'var(--attack)',
}

interface ToastItemProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function ToastItem({ notification, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false)

  // Slide in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss(notification.id), 250)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        background: 'var(--bg-raised)',
        border: `1px solid ${COLORS[notification.type]}33`,
        borderLeft: `3px solid ${COLORS[notification.type]}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        minWidth: 280,
        maxWidth: 360,
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
        cursor: 'default',
      }}
    >
      {/* Icon */}
      <span style={{ color: COLORS[notification.type], flexShrink: 0, marginTop: 1 }}>
        {ICONS[notification.type]}
      </span>

      {/* Message */}
      <span style={{ flex: 1, fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--ink)' }}>
        {notification.message}
      </span>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ink-faint)',
          padding: 2,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

/**
 * Global toast container. Mount once in App.tsx.
 * Reads from useAppStore().notifications and renders a fixed bottom-right stack.
 */
export function NotificationToast() {
  const notifications = useAppStore(s => s.notifications)
  const dismissNotification = useAppStore(s => s.dismissNotification)

  // Show at most 5 toasts
  const visible = notifications.slice(-5)

  if (visible.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {visible.map(n => (
        <div key={n.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem notification={n} onDismiss={dismissNotification} />
        </div>
      ))}
    </div>
  )
}
