import { useEffect, lazy, Suspense } from 'react'
<<<<<<< HEAD
import React from 'react'
=======
<<<<<<< HEAD
>>>>>>> origin/main
import { Topbar } from './components/ui/Topbar'
import { Sidebar } from './components/ui/Sidebar'
import { LoadingState } from './components/ui/LoadingState'
import { NotificationToast } from './components/ui/NotificationToast'
import { JudgeDemoModal } from './modals/JudgeDemoModal'
import { useAppStore } from './stores/appStore'
import type { NavId } from './types'
import { useMouseReticle } from './hooks/useMouseReticle'
import { useApiData } from './hooks/useApiData'
import { api } from './services/api'
import { MOCK_DASHBOARD } from './services/mockData'
import type { KpiCellData } from './components/ui/KpiStrip'
<<<<<<< HEAD
import type { DashboardData } from './types'
=======
=======
import React from 'react'
import { Topbar } from './components/ui/Topbar'
import { Sidebar } from './components/ui/Sidebar'
import { LoadingState } from './components/ui/LoadingState'
import { NotificationToast } from './components/ui/NotificationToast'
import { JudgeDemoModal } from './modals/JudgeDemoModal'
import { useAppStore } from './stores/appStore'
import type { NavId } from './types'
import { useMouseReticle } from './hooks/useMouseReticle'
import { useApiData } from './hooks/useApiData'
import { api } from './services/api'
import { MOCK_DASHBOARD } from './services/mockData'
import type { KpiCellData } from './components/ui/KpiStrip'
import type { DashboardData } from './types'
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main

// Lazy-loaded pages
const Dashboard    = lazy(() => import('./pages/Dashboard'))
const ThreatCatalog = lazy(() => import('./pages/ThreatCatalog'))
const RedTeam      = lazy(() => import('./pages/RedTeam'))
const BlueTeam     = lazy(() => import('./pages/BlueTeam'))
const GapAnalysis  = lazy(() => import('./pages/GapAnalysis'))
const Evolution    = lazy(() => import('./pages/Evolution'))
const WarRoom      = lazy(() => import('./pages/WarRoom'))
const FidelityLab  = lazy(() => import('./pages/FidelityLab'))
const KycLab       = lazy(() => import('./pages/KycLab'))
const AuditLog     = lazy(() => import('./pages/AuditLog'))
const Docs         = lazy(() => import('./pages/Docs'))

const PAGE_MAP: Record<NavId, React.LazyExoticComponent<() => JSX.Element>> = {
  'dashboard':      Dashboard,
  'threat-catalog': ThreatCatalog,
  'red-team':       RedTeam,
  'blue-team':      BlueTeam,
  'gap-analysis':   GapAnalysis,
  'evolution':      Evolution,
  'war-room':       WarRoom,
  'fidelity':       FidelityLab,
  'kyc-lab':        KycLab,
  'audit':          AuditLog,
  'docs':           Docs,
}

<<<<<<< HEAD
function buildKpiCells(kpi: DashboardData['kpis'], delta?: { ari: string; recall: string; fpr: string }): KpiCellData[] {
  return [
    {
      id: 'ari',
      label: 'Arms Race Index',
      value: kpi.arms_race_index.toFixed(3),
      // Regime as grey annotation - no per-cell color toning per design spec
      delta: kpi.arms_race_regime?.replace('_', ' ').toUpperCase() ?? (delta?.ari ?? 'CONTESTED'),
      tone: 'default',
    },
    {
      id: 'recall',
      label: 'Detection Recall',
      value: `${kpi.recall.toFixed(1)}%`,
      delta: delta?.recall ?? '+1.2%',
      tone: 'default',
    },
    {
      id: 'fpr',
      label: 'False Positive Rate',
      value: `${kpi.fpr.toFixed(2)}%`,
      delta: delta?.fpr ?? '-0.02%',
      tone: 'default',
    },
    {
      id: 'model',
      label: 'Active Model',
      value: `Defense ${kpi.model_version}`,
      tone: 'default',
    },
  ]
}
=======
<<<<<<< HEAD
import React from 'react'
>>>>>>> origin/main

export default function App() {
  const mode         = useAppStore(s => s.mode)
  const setMode      = useAppStore(s => s.setMode)
  const activeTab    = useAppStore(s => s.activeTab)
  const setTab       = useAppStore(s => s.setActiveTab)
  const setJudgeOpen = useAppStore(s => s.setJudgeDemoOpen)
  const isDemoMode   = useAppStore(s => s.isDemoMode)

  // Hook: mouse reticle (--mouse-x/y CSS vars)
  useMouseReticle()

  // Global scroll CSS variable writer
  useEffect(() => {
    const onScroll = () =>
      document.documentElement.style.setProperty('--scroll-y', String(window.scrollY))
    window.addEventListener('scroll', onScroll, { passive: true })
<<<<<<< HEAD
    return () => window.removeEventListener('scroll', onScroll)
=======
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
    }
=======
function buildKpiCells(kpi: DashboardData['kpis'], delta?: { ari: string; recall: string; fpr: string }): KpiCellData[] {
  return [
    {
      id: 'ari',
      label: 'Arms Race Index',
      value: kpi.arms_race_index.toFixed(3),
      // Regime as grey annotation - no per-cell color toning per design spec
      delta: kpi.arms_race_regime?.replace('_', ' ').toUpperCase() ?? (delta?.ari ?? 'CONTESTED'),
      tone: 'default',
    },
    {
      id: 'recall',
      label: 'Detection Recall',
      value: `${kpi.recall.toFixed(1)}%`,
      delta: delta?.recall ?? '+1.2%',
      tone: 'default',
    },
    {
      id: 'fpr',
      label: 'False Positive Rate',
      value: `${kpi.fpr.toFixed(2)}%`,
      delta: delta?.fpr ?? '-0.02%',
      tone: 'default',
    },
    {
      id: 'model',
      label: 'Active Model',
      value: `Defense ${kpi.model_version}`,
      tone: 'default',
    },
  ]
}

export default function App() {
  const mode         = useAppStore(s => s.mode)
  const setMode      = useAppStore(s => s.setMode)
  const activeTab    = useAppStore(s => s.activeTab)
  const setTab       = useAppStore(s => s.setActiveTab)
  const setJudgeOpen = useAppStore(s => s.setJudgeDemoOpen)
  const isDemoMode   = useAppStore(s => s.isDemoMode)

  // Hook: mouse reticle (--mouse-x/y CSS vars)
  useMouseReticle()

  // Global scroll CSS variable writer
  useEffect(() => {
    const onScroll = () =>
      document.documentElement.style.setProperty('--scroll-y', String(window.scrollY))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
  }, [])

  // Apply mode class to <body> so --spot inverts everywhere
  useEffect(() => {
    if (mode === 'attacker') {
      document.body.classList.add('mode-attacker')
    } else {
      document.body.classList.remove('mode-attacker')
    }
  }, [mode])

<<<<<<< HEAD
  // Live KPI data - falls back to mock data in demo mode or on API error
  const { data: dashData } = useApiData<DashboardData>(
    () => api.getDashboardData(),
    [],
    {
=======
<<<<<<< HEAD
  // KPI cells from mock data (Phase 7 will swap with live API)
  const kpi = MOCK_DASHBOARD.kpis
  const kpiCells: KpiCellData[] = [
    {
      id: 'ari',
      label: 'Arms Race Index',
      value: kpi.arms_race_index.toFixed(3),
      delta: '+0.030',
      tone: kpi.arms_race_regime === 'blue_ascendant' ? 'good'
          : kpi.arms_race_regime === 'red_ascendant'  ? 'attack'
          : 'warn',
    },
    {
      id: 'recall',
      label: 'Detection Recall',
      value: `${kpi.recall.toFixed(1)}%`,
      delta: '+1.2%',
      tone: 'good',
    },
    {
      id: 'fpr',
      label: 'False Positive Rate',
      value: `${kpi.fpr.toFixed(2)}%`,
      delta: '-0.02%',
      tone: 'warn',
    },
    {
      id: 'model',
      label: 'Active Model',
      value: `Defense ${kpi.model_version}`,
      tone: 'defense',
    },
  ]
=======
  // Live KPI data - falls back to mock data in demo mode or on API error
  const { data: dashData } = useApiData<DashboardData>(
    () => api.getDashboardData(),
    [],
    {
>>>>>>> origin/main
      skip: isDemoMode,
      fallback: MOCK_DASHBOARD,
    }
  )

  const kpi = dashData?.kpis ?? MOCK_DASHBOARD.kpis
  const kpiCells = buildKpiCells(kpi)

  // Sidebar metrics
  const recall = kpi.recall ?? 92.8
  const fpr = kpi.fpr ?? 1.0
  const modelVersion = kpi.model_version ?? 'v3.0'
<<<<<<< HEAD
  // Show as LIVE even in demo mode - demo is a simulated live view
  const isLive = true
=======
  const isLive = !isDemoMode
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main

  const PageComponent = PAGE_MAP[activeTab]

  return (
    <div className={`app-shell${mode === 'attacker' ? ' mode-attacker' : ''}`}>
      {/* Parallax depth layer */}
      <div className="depth-fore" aria-hidden="true" />

      {/* Cursor reticle */}
      <div className="reticle" aria-hidden="true" />

      {/* Topbar */}
      <Topbar
        mode={mode}
        onModeChange={setMode}
        onJudgeDemo={() => setJudgeOpen(true)}
        kpiCells={kpiCells}
<<<<<<< HEAD
        isLive={isLive}
=======
<<<<<<< HEAD
        isLive={false}
=======
        isLive={isLive}
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
      />

      {/* Body: sidebar + main content */}
      <div className="app-body">
        <aside className="app-sidebar">
          <Sidebar
            active={activeTab}
            onNavigate={(id) => setTab(id)}
<<<<<<< HEAD
=======
<<<<<<< HEAD
            modelVersion="v3.0"
            recall={92.8}
            fpr={1.0}
            isLive={false}
=======
>>>>>>> origin/main
            modelVersion={modelVersion}
            recall={recall}
            fpr={fpr}
            isLive={isLive}
<<<<<<< HEAD
=======
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
          />
        </aside>

        <main className="app-main" id="main-content">
          <Suspense fallback={<LoadingState message="Loading page..." />}>
            <PageComponent />
          </Suspense>
        </main>
      </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> origin/main

      {/* Global overlays */}
      <JudgeDemoModal />
      <NotificationToast />
<<<<<<< HEAD
=======
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
    </div>
  )
}
