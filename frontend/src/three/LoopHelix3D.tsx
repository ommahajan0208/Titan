// three/LoopHelix3D.tsx
// Co-evolution helix - each generation = one helix turn
// Spec: design.md Section 6.2, frontend_spec.md Section 7.2
// Adapted from ai-defense-lab/web/src/three/LoopHelix3D.tsx

import React, { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GenerationRecord } from '../types'

// Build helix geometry from generation records
function buildHelixGeometry(generations: GenerationRecord[], key: 'detection_rate_fixed_set' | 'detection_rate_new_vectors') {
  const pts: THREE.Vector3[] = []
  const n = generations.length
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1)
    const angle = t * Math.PI * 2 * 3  // 3 full turns
    const rate = generations[i][key] ?? 0
    const radius = 1.2 - rate * 0.8  // contracting as detection improves
    pts.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      t * 6 - 3,
      Math.sin(angle) * radius
    ))
  }
  return pts
}

function HelixScene({
  generations, selected, attacker, progress,
}: {
  generations: GenerationRecord[]
  selected: number
  attacker: boolean
  progress: () => number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const fixedLineRef = useRef<THREE.Line>(null)
  const novelLineRef = useRef<THREE.Line>(null)

  const spotColor = attacker ? 0x2D6FD4 : 0x1E90FF
  const baseColor = 0x8b949e

  const fixedPts = useMemo(() => buildHelixGeometry(generations, 'detection_rate_fixed_set'), [generations])
  const novelPts = useMemo(() => buildHelixGeometry(generations, 'detection_rate_new_vectors'), [generations])

  const fixedGeo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(fixedPts)
    return g
  }, [fixedPts])

  const novelGeo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(novelPts)
    return g
  }, [novelPts])

  const fixedLineObj = useMemo(() =>
    new THREE.Line(fixedGeo, new THREE.LineBasicMaterial({ color: baseColor })),
  [fixedGeo, baseColor])

  const novelLineObj = useMemo(() =>
    new THREE.Line(novelGeo, new THREE.LineBasicMaterial({ color: spotColor })),
  [novelGeo, spotColor])

  useEffect(() => {
    // Draw-on from nothing to full: setDrawRange
    if (fixedLineRef.current) {
      fixedLineRef.current.geometry.setDrawRange(0, fixedPts.length)
    }
    if (novelLineRef.current) {
      novelLineRef.current.geometry.setDrawRange(0, novelPts.length)
    }
  }, [fixedPts, novelPts])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const p = progress()
      // Camera descends along helix axis as scroll progresses
      groupRef.current.position.y = p * -3
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.03
    }
  })

  // Evaded fragments (small boxes orbiting outside helix)
  const evadedInstances = useMemo(() => {
    return generations.flatMap((g, i) => {
      const misses = Math.floor((1 - (g.detection_rate_new_vectors ?? 0)) * 3)
      return Array.from({ length: misses }, (_, j) => ({
        gen: i, miss: j,
        angle: (i / generations.length) * Math.PI * 6 + j * 0.8,
        y: (i / Math.max(generations.length - 1, 1)) * 6 - 3,
      }))
    })
  }, [generations])

  return (
    <group ref={groupRef}>
      {/* Fixed set line - solid, grey */}
      <primitive
        object={fixedLineObj}
        ref={fixedLineRef}
      />
      {/* New vectors line - colored, spot */}
      <primitive
        object={novelLineObj}
        ref={novelLineRef}
      />
      {/* Evaded miss fragments orbiting outside */}
      {evadedInstances.map(({ gen, miss, angle, y }) => (
        <mesh
          key={`${gen}-${miss}`}
          position={[
            Math.cos(angle) * 1.8,
            y,
            Math.sin(angle) * 1.8,
          ]}
        >
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color={spotColor} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

interface LoopHelix3DProps {
  generations: GenerationRecord[]
  selected?: number
  attacker?: boolean
  reduced?: boolean
  progress?: () => number
  height?: number
}

// 2D fallback: line chart data table
function Helix2DFallback({ generations }: { generations: GenerationRecord[] }) {
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ink-faint)', marginBottom: 8 }}>
        DETECTION RATE HISTORY (2D MODE)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {generations.map(g => (
          <div key={g.generation} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ink-faint)', width: 40 }}>
              G{g.generation}
            </span>
            <div style={{
              flex: 1, height: 4, background: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden'
            }}>
              <div style={{
                width: `${(g.detection_rate_fixed_set ?? 0) * 100}%`,
                height: '100%',
                background: 'var(--ink-muted)',
              }} />
            </div>
            <div style={{
              flex: 1, height: 4, background: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden'
            }}>
              <div style={{
                width: `${(g.detection_rate_new_vectors ?? 0) * 100}%`,
                height: '100%',
                background: 'var(--spot)',
              }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ink-faint)' }}>
          Fixed set
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--spot)' }}>
          New vectors
        </span>
      </div>
    </div>
  )
}

export function LoopHelix3D({
  generations, selected = 0, attacker = false, reduced = false, progress = () => 0, height = 380,
}: LoopHelix3DProps) {
  const canWebGL = useMemo(() => {
    try { return !!document.createElement('canvas').getContext('webgl2') }
    catch { return false }
  }, [])

  if (generations.length < 2) {
    return (
      <div style={{ padding: 'var(--space-6)', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
        Awaiting generation data...
      </div>
    )
  }

  if (reduced || !canWebGL) {
    return <Helix2DFallback generations={generations} />
  }

  return (
    <div style={{ width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [4, 0, 6], fov: 45 }}
        frameloop={reduced ? 'demand' : 'always'}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <HelixScene
          generations={generations}
          selected={selected}
          attacker={attacker}
          progress={progress}
        />
      </Canvas>
    </div>
  )
}
