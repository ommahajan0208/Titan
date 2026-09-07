// components/three/SceneWrapper.tsx
// Shared Canvas + lighting wrapper for all WebGL scenes.
// Spec: Phase 5 - WebGL Visualization Modules

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

interface SceneWrapperProps {
  children: React.ReactNode
  height?: number
  camera?: Record<string, unknown>
  orthographic?: boolean
  style?: React.CSSProperties
  frameloop?: 'always' | 'demand' | 'never'
}

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#374151" />
    </mesh>
  )
}

export function SceneWrapper({
  children,
  height = 380,
  camera,
  orthographic = false,
  style,
  frameloop = 'always',
}: SceneWrapperProps) {
  const defaultCamera = orthographic
    ? { position: [0, 0, 20] as [number, number, number], zoom: 28, near: 0.1, far: 100 }
    : { position: [0, 0, 12] as [number, number, number], fov: 50 }

  const resolvedCamera = camera ?? defaultCamera

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        orthographic={orthographic}
        camera={resolvedCamera as any}
        frameloop={frameloop}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ambient fill */}
        <ambientLight intensity={0.6} />
        {/* Key light */}
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        {/* Rim light */}
        <pointLight position={[-10, -10, -10]} intensity={0.2} />

        <Suspense fallback={<SceneFallback />}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}
