// hooks/useMouseReticle.ts - Global cursor tracking for CSS custom properties
// Spec: frontend_spec.md Section 9.2
// Sets --mouse-x and --mouse-y on documentElement for the .reticle element and
// parallax depth layers. Called once in App.tsx.
//
// This hook does NOT set React state - it writes to CSS variables directly so
// there is zero re-render cost on every mouse move.

import { useEffect } from 'react'

/**
 * Attaches a passive mousemove listener that writes --mouse-x and --mouse-y
 * CSS custom properties to :root. The .reticle and .depth-fore layers read
 * these via calc() in index.css to produce the parallax and glow effects.
 *
 * Also exports `canUseWebGL()` utility used by 3D components.
 */
export function useMouseReticle(): void {
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])
}

/**
 * Detects WebGL2 support. Used to decide whether to render 3D components
 * or fall back to 2D CSS equivalents.
 */
export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}
