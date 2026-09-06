// three/BlindSpotAtlas3D.tsx
// MAP-Elites coverage grid visualization (10x12 = 120 cells)
// Spec: design.md Section 6.3, frontend_spec.md Section 7.3
// Derived from Hydra's MAP-Elites archive

import React, { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { AtlasCell } from '../types'

function cellColor(cell: AtlasCell): string {
  if (!cell.visited) return '#1a2236'
  if (cell.hardened) return '#374151'
  if (cell.evasion_rate > 0.7) return '#4B5563'
  return '#6B7280'
}

function cellColorHex(cell: AtlasCell): number {
  if (!cell.visited) return 0x1a2236
  if (cell.hardened) return 0x374151
  if (cell.evasion_rate > 0.7) return 0x4B5563
  return 0x6B7280
}

function AtlasScene({
  cells, onCellClick,
}: {
  cells: AtlasCell[]
  onCellClick: (cell: AtlasCell) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const scalesRef = useRef<Float32Array>(new Float32Array(120).fill(1))
  const targetScalesRef = useRef<Float32Array>(new Float32Array(120).fill(1))

  useEffect(() => {
    if (!meshRef.current) return
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()

    cells.forEach((cell, i) => {
      const x = (cell.x - 4.5) * 1.2
      const y = (cell.y - 5.5) * 1.2
      matrix.makeScale(1, 1, 0.15)
      matrix.setPosition(x, y, 0)
      meshRef.current!.setMatrixAt(i, matrix)
      color.setHex(cellColorHex(cell))
      meshRef.current!.setColorAt(i, color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true

    // Pulse active cells
    cells.forEach((cell, i) => {
      targetScalesRef.current[i] = cell.visited && !cell.hardened ? 1.05 : 1.0
    })
  }, [cells])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const matrix = new THREE.Matrix4()

    cells.forEach((cell, i) => {
      const x = (cell.x - 4.5) * 1.2
      const y = (cell.y - 5.5) * 1.2
      const pulse = cell.visited && !cell.hardened ? 1 + Math.sin(t * 1.4 + i * 0.3) * 0.04 : 1
      scalesRef.current[i] += (targetScalesRef.current[i] - scalesRef.current[i]) * 0.08
      const s = scalesRef.current[i] * pulse
      matrix.makeScale(s, s, 0.15)
      matrix.setPosition(x, y, 0)
      meshRef.current!.setMatrixAt(i, matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, 120]}
      onClick={(e) => {
        e.stopPropagation()
        const idx = e.instanceId
        if (idx !== undefined && idx < cells.length) onCellClick(cells[idx])
      }}
    >
      <boxGeometry args={[1.0, 1.0, 1]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  )
}

interface BlindSpotAtlas3DProps {
  cells: AtlasCell[]
  onCellClick?: (cell: AtlasCell) => void
  reduced?: boolean
  height?: number
}

function Atlas2DFallback({
  cells, onCellClick,
}: {
  cells: AtlasCell[]
  onCellClick: (cell: AtlasCell) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
      {cells.map(cell => (
        <div
          key={cell.cell_id}
          style={{
            aspectRatio: '1',
            background: cellColor(cell),
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          title={`V=${cell.x} G=${cell.y}\nEvasion: ${(cell.evasion_rate * 100).toFixed(0)}%${cell.hardened ? '\nHardened' : ''}`}
          onClick={() => onCellClick(cell)}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
      ))}
    </div>
  )
}

export function BlindSpotAtlas3D({
  cells, onCellClick = () => {}, reduced = false, height = 340,
}: BlindSpotAtlas3DProps) {
  const canWebGL = useMemo(() => {
    try { return !!document.createElement('canvas').getContext('webgl2') }
    catch { return false }
  }, [])

  if (reduced || !canWebGL) {
    return <Atlas2DFallback cells={cells} onCellClick={onCellClick} />
  }

  return (
    <div style={{ width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 20], zoom: 28, near: 0.1, far: 100 }}
        frameloop={reduced ? 'demand' : 'always'}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 10]} intensity={0.6} />
        <AtlasScene cells={cells} onCellClick={onCellClick} />
      </Canvas>
    </div>
  )
}
