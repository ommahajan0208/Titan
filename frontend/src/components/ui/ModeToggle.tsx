import { useRef, useLayoutEffect } from 'react'

type AppMode = 'defender' | 'attacker'

interface ModeToggleProps {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const defenderRef = useRef<HTMLButtonElement>(null)
  const attackerRef = useRef<HTMLButtonElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const active = mode === 'defender' ? defenderRef.current : attackerRef.current
    const indicator = indicatorRef.current
    if (!active || !indicator) return

    const rect = active.getBoundingClientRect()
    const parentRect = active.parentElement!.getBoundingClientRect()
    indicator.style.width = `${rect.width}px`
    indicator.style.transform = `translateX(${rect.left - parentRect.left - 3}px)`
  }, [mode])

  return (
    <div className="mode-toggle" role="group" aria-label="Switch between Defender and Attacker mode">
      <div ref={indicatorRef} className="mode-toggle-indicator" />
      <button
        ref={defenderRef}
        id="mode-toggle-defender"
        className={`mode-toggle-option${mode === 'defender' ? ' active' : ''}`}
        onClick={() => onChange('defender')}
        aria-pressed={mode === 'defender'}
      >
        Defender
      </button>
      <button
        ref={attackerRef}
        id="mode-toggle-attacker"
        className={`mode-toggle-option${mode === 'attacker' ? ' active' : ''}`}
        onClick={() => onChange('attacker')}
        aria-pressed={mode === 'attacker'}
      >
        Attacker
      </button>
    </div>
  )
}
