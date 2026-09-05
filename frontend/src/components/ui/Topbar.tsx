import { Play } from 'lucide-react'
import { ModeToggle } from './ModeToggle'
<<<<<<< HEAD
import { KpiStrip } from './KpiStrip'
import type { KpiCellData } from './KpiStrip'
=======
<<<<<<< HEAD
import { KpiStrip, KpiCellData } from './KpiStrip'
=======
import { KpiStrip } from './KpiStrip'
import type { KpiCellData } from './KpiStrip'
>>>>>>> 8329ade9e9dad12182be696d7591cfd08816bc0e
>>>>>>> origin/main
import { Button } from './Button'
import { Badge } from './Badge'

type AppMode = 'defender' | 'attacker'

interface TopbarProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
  onJudgeDemo: () => void
  kpiCells: KpiCellData[]
  isLive?: boolean
}

export function Topbar({ mode, onModeChange, onJudgeDemo, kpiCells, isLive = false }: TopbarProps) {
  return (
    <header className="app-topbar">
      <div className="topbar">
        {/* Brand slot - aligned with sidebar icon rail */}
        <div className="topbar-brand" aria-hidden="true">
          {/* Sidebar handles the brand mark; topbar just holds the space */}
        </div>

        {/* KPI strip inline in topbar */}
        <div className="topbar-kpi" style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          <KpiStrip cells={kpiCells} />
        </div>

        {/* Actions */}
        <div className="topbar-actions">
          {isLive && (
            <Badge variant="live">Live</Badge>
          )}

          <ModeToggle mode={mode} onChange={onModeChange} />

          <Button
            id="btn-judge-demo"
            variant="primary"
            size="sm"
            icon={<Play size={12} />}
            onClick={onJudgeDemo}
          >
            Judge Demo
          </Button>
        </div>
      </div>
    </header>
  )
}
