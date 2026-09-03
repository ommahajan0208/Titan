import React, { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  placement?: 'top' | 'bottom'
}

export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={triggerRef}
      className="tooltip-trigger"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="tooltip-content"
          style={placement === 'bottom' ? {
            top: 'calc(100% + 8px)',
            bottom: 'auto',
          } : {}}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}
