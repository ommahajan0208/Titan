<<<<<<< HEAD
import { useRef, useEffect } from 'react'
=======
import React, { useRef, useEffect } from 'react'
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e

type Tone = 'good' | 'bad' | 'warn' | 'default' | 'spot' | 'muted'

const TONE_CLASS: Record<Tone, string> = {
  good:    'tone-good',
  bad:     'tone-bad',
  warn:    'tone-warn',
  default: 'tone-default',
  spot:    'tone-spot',
  muted:   'tone-muted',
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  tone?: Tone
  className?: string
<<<<<<< HEAD
}

export function StatCard({ label, value, sub, tone = 'default', className = '' }: StatCardProps) {
=======
  style?: React.CSSProperties
}

export function StatCard({ label, value, sub, tone = 'default', className = '', style }: StatCardProps) {
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
  const valueRef = useRef<HTMLDivElement>(null)
  const prevValue = useRef(value)

  // Scale pulse when value changes
  useEffect(() => {
    if (prevValue.current !== value && valueRef.current) {
      valueRef.current.removeAttribute('data-pulse')
      void valueRef.current.offsetWidth // force reflow
      valueRef.current.setAttribute('data-pulse', 'true')
    }
    prevValue.current = value
  }, [value])

  return (
<<<<<<< HEAD
    <div className={`stat-card ${className}`.trim()}>
=======
    <div className={`stat-card ${className}`.trim()} style={style}>
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
      <div className="stat-card-label">{label}</div>
      <div
        ref={valueRef}
        className={`stat-card-value ${TONE_CLASS[tone]}`}
      >
        {value}
      </div>
      {sub && (
        <div className={`stat-card-sub ${TONE_CLASS[tone]}`}>{sub}</div>
      )}
    </div>
  )
}
