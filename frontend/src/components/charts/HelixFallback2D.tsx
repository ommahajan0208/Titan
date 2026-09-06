// components/charts/HelixFallback2D.tsx
// 2D fallback for LoopHelix3D when WebGL is unavailable or on mobile.
// Renders a simplified 2D representation of the evolution helix
// using SVG animated paths.

interface HelixFallback2DProps {
  generations: number
  height?: number
}

export function HelixFallback2D({ generations, height = 200 }: HelixFallback2DProps) {
  const W = 600
  const H = height
  const centerY = H / 2
  const amplitude = H * 0.36
  const points = Array.from({ length: generations * 8 }, (_, i) => {
    const t = i / (generations * 8 - 1)
    const x = t * W
    const y = centerY + Math.sin(t * Math.PI * 2 * generations) * amplitude * (1 - t * 0.3)
    return `${x},${y}`
  }).join(' ')

  const pointsOffset = Array.from({ length: generations * 8 }, (_, i) => {
    const t = i / (generations * 8 - 1)
    const x = t * W
    const y = centerY - Math.sin(t * Math.PI * 2 * generations) * amplitude * (1 - t * 0.3)
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ width: '100%', height, overflow: 'hidden', borderRadius: 'var(--radius)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
        {/* Background */}
        <rect width={W} height={H} fill="var(--bg-surface)" />

        {/* Connector lines */}
        {Array.from({ length: generations }, (_, g) => {
          const t = (g + 0.5) / generations
          const x = t * W
          const y1 = centerY + Math.sin(t * Math.PI * 2 * generations) * amplitude * (1 - t * 0.3)
          const y2 = centerY - Math.sin(t * Math.PI * 2 * generations) * amplitude * (1 - t * 0.3)
          return <line key={g} x1={x} y1={y1} x2={x} y2={y2} stroke="var(--border)" strokeWidth={1} />
        })}

        {/* Helix strands */}
        <polyline
          points={points}
          fill="none"
          stroke="var(--spot)"
          strokeWidth={1.5}
          opacity={0.8}
        />
        <polyline
          points={pointsOffset}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth={1.5}
          opacity={0.5}
        />

        {/* Generation labels */}
        {Array.from({ length: Math.min(generations, 6) }, (_, g) => {
          const t = (g + 0.5) / generations
          const x = t * W
          return (
            <text
              key={g}
              x={x}
              y={H - 8}
              textAnchor="middle"
              fill="var(--ink-faint)"
              fontFamily="var(--font-mono)"
              fontSize={9}
            >
              G{g + 1}
            </text>
          )
        })}

        {/* Center axis */}
        <line x1={0} y1={centerY} x2={W} y2={centerY} stroke="var(--rule)" strokeWidth={1} strokeDasharray="4 4" />
      </svg>
    </div>
  )
}
