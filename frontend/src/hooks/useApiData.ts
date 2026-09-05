// hooks/useApiData.ts - Generic async data fetching hook
// Spec: frontend_spec.md Section 4.3
// Derived from sudoWin/frontend/src/hooks/useApi.ts

import { useState, useEffect } from 'react'

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Generic hook for async data fetching.
 * - Automatically fetches on mount and when deps change
 * - Cleans up in-flight requests on unmount (cancel flag)
 * - Returns { data, loading, error }
 *
 * Usage:
 *   const { data, loading, error } = useApiData(() => api.getTaxonomy(), [])
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  options: {
    /** Fallback data to use when the fetch fails (e.g. mock data in demo mode) */
    fallback?: T
    /** Don't fetch at all - useful when `isDemoMode` is true */
    skip?: boolean
  } = {}
): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({
    data: options.fallback ?? null,
    loading: !options.skip,
    error: null,
  })
  const [rev, setRev] = useState(0)

  useEffect(() => {
    if (options.skip) {
      setState({ data: options.fallback ?? null, loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    fetcher()
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState({
            data: options.fallback ?? null,
            loading: false,
            error: err.message,
          })
        }
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, rev, options.skip])

  const refetch = () => setRev(r => r + 1)

  return { ...state, refetch }
}
