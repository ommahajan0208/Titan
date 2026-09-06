// three/AccountNebula3D.tsx
// GraphSAGE transaction graph - mule account network visualization
// Spec: design.md Section 6.1, frontend_spec.md Section 7.1
// Adapted from ai-defense-lab/web/src/three/AccountNebula3D.tsx

import React, { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { NebulaNode, NebulaEdge } from '../types'

// --- Seeded PRNG (Mulberry32) for deterministic layout ---
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

interface Vec2 { x: number; y: number }

function layout(nodes: NebulaNode[], edges: NebulaEdge[], iterations = 220): Vec2[] {
  const rand = mulberry32(0xdeadbeef)
  const positions: Vec2[] = nodes.map((n, i) => {
    const isMule = n.passthrough > 0.85
    // Mule nodes start near center (bias 0.45)
    const r = isMule ? rand() * 0.45 : rand()
    const theta = rand() * Math.PI * 2
    return { x: Math.cos(theta) * r * 5, y: Math.sin(theta) * r * 5 }
  })

  const k = Math.sqrt(25 / Math.max(nodes.length, 1))
  const vx = new Float32Array(nodes.length)
  const vy = new Float32Array(nodes.length)

  for (let iter = 0; iter < iterations; iter++) {
    const t = 1 - iter / iterations
    vx.fill(0); vy.fill(0)
    // O(n^2) repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = positions[i].x - positions[j].x
        const dy = positions[i].y - positions[j].y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
        const f = (k * k) / dist
        vx[i] += (dx / dist) * f; vy[i] += (dy / dist) * f
        vx[j] -= (dx / dist) * f; vy[j] -= (dy / dist) * f
      }
    }
    // Spring attraction along edges
    for (const e of edges) {
      const dx = positions[e.target].x - positions[e.source].x
      const dy = positions[e.target].y - positions[e.source].y
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
      const f = (dist * dist) / k
      vx[e.source] += (dx / dist) * f; vy[e.source] += (dy / dist) * f
      vx[e.target] -= (dx / dist) * f; vy[e.target] -= (dy / dist) * f
    }
    // Center pull + apply
    for (let i = 0; i < nodes.length; i++) {
      vx[i] -= positions[i].x * 0.01
      vy[i] -= positions[i].y * 0.01
      const speed = Math.min(Math.sqrt(vx[i] ** 2 + vy[i] ** 2), 0.5)
      const angle = Math.atan2(vy[i], vx[i])
      positions[i].x += Math.cos(angle) * speed * t
      positions[i].y += Math.sin(angle) * speed * t
    }
  }
  return positions
}

// --- Scene component ---
function NebulaScene({
  nodes, edges, attacker, progress,
}: {
  nodes: NebulaNode[]
  edges: NebulaEdge[]
  attacker: boolean
  progress: () => number
}) {
  const positions = useMemo(() => layout(nodes, edges), [nodes, edges])

  const muleColor  = attacker ? new THREE.Color(0x2D6FD4) : new THREE.Color(0x1E90FF)
  const lineColor  = new THREE.Color(0x8b949e)

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Build instanced mesh for nodes
  useEffect(() => {
    if (!meshRef.current) return
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()
    nodes.forEach((node, i) => {
      matrix.setPosition(positions[i].x, positions[i].y, 0)
      matrix.scale(new THREE.Vector3(0.18, 0.18, 0.18))
      meshRef.current!.setMatrixAt(i, matrix)
      if (node.passthrough > 0.85) {
        color.copy(muleColor)
      } else {
        color.set(0x374151)
      }
      meshRef.current!.setColorAt(i, color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [nodes, positions, muleColor])

  // Build edge geometry
  const edgePositions = useMemo(() => {
    const pts: number[] = []
    for (const e of edges) {
      if (e.source < positions.length && e.target < positions.length) {
        pts.push(positions[e.source].x, positions[e.source].y, 0)
        pts.push(positions[e.target].x, positions[e.target].y, 0)
      }
    }
    return new Float32Array(pts)
  }, [edges, positions])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const p = progress()
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05
      groupRef.current.position.y = 3.4 - p * 2.2
    }
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors />
      </instancedMesh>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={edgePositions.length / 3}
            array={edgePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={lineColor} transparent opacity={0.22} />
      </lineSegments>
    </group>
  )
}

interface AccountNebula3DProps {
  nodes: NebulaNode[]
  edges: NebulaEdge[]
  attacker?: boolean
  reduced?: boolean
  progress?: () => number
  height?: number
}

// --- 2D fallback for mobile / reduced motion ---
function Nebula2DFallback({ nodes, attacker }: { nodes: NebulaNode[]; attacker: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gap: 4,
      padding: 'var(--space-4)',
    }}>
      {nodes.map(n => (
        <div
          key={n.id}
          title={`ID: ${n.id}\nPassthrough: ${(n.passthrough * 100).toFixed(0)}%\nDegree: ${n.degree}`}
          style={{
            aspectRatio: '1',
            borderRadius: 2,
            background: n.passthrough > 0.85
              ? (attacker ? '#2D6FD4' : '#1E90FF')
              : '#374151',
          }}
        />
      ))}
    </div>
  )
}

export function AccountNebula3D({
  nodes, edges, attacker = false, reduced = false, progress = () => 0, height = 380,
}: AccountNebula3DProps) {
  const canWebGL = useMemo(() => {
    try {
      return !!document.createElement('canvas').getContext('webgl2')
    } catch { return false }
  }, [])

  if (reduced || !canWebGL) {
    return <Nebula2DFallback nodes={nodes} attacker={attacker} />
  }

  return (
    <div style={{ width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        frameloop={reduced ? 'demand' : 'always'}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <NebulaScene
          nodes={nodes}
          edges={edges}
          attacker={attacker}
          progress={progress}
        />
      </Canvas>
    </div>
  )
}
