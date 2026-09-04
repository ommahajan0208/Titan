import { useRef, useEffect, useCallback } from 'react'

export interface TerminalLine {
  id: string
  text: string
  type?: 'info' | 'success' | 'warn' | 'error' | 'accent' | 'dim'
}

interface TerminalProps {
  lines: TerminalLine[]
  height?: number | string
  autoScroll?: boolean
  className?: string
}

const TYPE_CLASS: Record<string, string> = {
  info:    'terminal-line-info',
  success: 'terminal-line-success',
  warn:    'terminal-line-warn',
  error:   'terminal-line-error',
  accent:  'terminal-line-accent',
  dim:     'terminal-line-dim',
}

export function Terminal({ lines, height = 280, autoScroll = true, className = '' }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const userScrolledUp = useRef(false)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    userScrolledUp.current = scrollHeight - scrollTop - clientHeight > 40
  }, [])

  useEffect(() => {
    if (autoScroll && !userScrolledUp.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, autoScroll])

  return (
    <div
      ref={scrollRef}
      className={`terminal ${className}`.trim()}
      style={{ height }}
      onScroll={handleScroll}
    >
      {lines.length === 0 ? (
        <div className="terminal-line terminal-line-dim">-- waiting for output --</div>
      ) : (
        lines.map(line => (
          <div
            key={line.id}
            className={`terminal-line ${TYPE_CLASS[line.type ?? 'info'] ?? 'terminal-line-info'}`}
          >
            {line.text}
          </div>
        ))
      )}
    </div>
  )
}
