<<<<<<< HEAD
import React from 'react'

=======
<<<<<<< HEAD
=======
import React from 'react'

>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
interface ProgressBarProps {
  value: number          // 0..1
  variant?: 'attack' | 'defense' | 'spot' | 'shimmer'
  thick?: boolean
  label?: string
  showPercent?: boolean
  className?: string
<<<<<<< HEAD
  style?: React.CSSProperties
=======
<<<<<<< HEAD
=======
  style?: React.CSSProperties
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
}

export function ProgressBar({
  value,
  variant = 'spot',
  thick = false,
  label,
  showPercent = false,
  className = '',
<<<<<<< HEAD
  style,
=======
<<<<<<< HEAD
=======
  style,
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value * 100))

  return (
<<<<<<< HEAD
    <div className={className} style={style}>
=======
<<<<<<< HEAD
    <div className={className}>
=======
    <div className={className} style={style}>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
      {(label || showPercent) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--ink-faint)',
          }}
        >
          {label && <span>{label}</span>}
          {showPercent && <span>{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div className={`progress-track${thick ? ' progress-track-thick' : ''}`}>
        {variant === 'shimmer' ? (
          <div className="progress-fill-shimmer" />
        ) : (
          <div
            className={`progress-fill progress-fill-${variant}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  )
}
