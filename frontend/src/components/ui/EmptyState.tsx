// components/ui/EmptyState.tsx
interface EmptyStateProps {
  message?: string
  sub?: string
}

export function EmptyState({ message = 'No data available', sub }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      gap: '8px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--ink-faint)',
      }}>
        {message}
      </div>
      {sub && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--ink-faint)',
          opacity: 0.6,
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}
