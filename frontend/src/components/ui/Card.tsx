import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'flat' | 'raised'
  noPad?: boolean
  noHover?: boolean
}

export function Card({
  variant = 'glass',
  noPad = false,
  noHover = false,
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  const baseClass = {
    glass: 'card',
    flat:  'card-flat',
    raised: 'card-raised',
  }[variant]

  return (
    <div
      className={`${baseClass} ${className}`.trim()}
      style={{
        ...(noPad ? { padding: 0 } : {}),
        ...(noHover ? { transition: 'none' } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
