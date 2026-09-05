import React, { useRef, useEffect } from 'react'

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
  style?: React.CSSProperties
}

export function StatCard({ label, value, sub, tone = 'default', className = '', style }: StatCardProps) {
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
    <div className={`stat-card ${className}`.trim()} style={style}>
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
