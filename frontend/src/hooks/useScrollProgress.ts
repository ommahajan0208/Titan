// hooks/useScrollProgress.ts - Per-element scroll visibility progress [0..1]
// Spec: frontend_spec.md Section 9.1
// Derived from ai-defense-lab/web/src/lib/scroll.ts

import { useRef, useEffect } from 'react'

/**
 * Tracks the intersection ratio of an element as a stable getter function.
 * Returns () => number instead of a reactive value to avoid re-renders on every
 * scroll tick. The 3D components call this getter in their animation loop.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null)
 *   const getProgress = useScrollProgress(ref)
 *   // In R3F frame: const p = getProgress()  // 0..1
 */
export function useScrollProgress(ref: React.RefObject<Element>): () => number {
  const progressRef = useRef(0)

  useEffect(() => {
    if (!ref.current) return

    // 101 thresholds gives ~1% granularity without re-render cost
    const thresholds = Array.from({ length: 101 }, (_, i) => i / 100)

    const observer = new IntersectionObserver(
      ([entry]) => {
        progressRef.current = entry.intersectionRatio
      },
      { threshold: thresholds }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  // Stable getter - never changes identity, causes zero re-renders
  return () => progressRef.current
}
