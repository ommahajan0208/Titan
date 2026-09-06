// components/ui/ArgumentBar.tsx
// 4-cell horizontal strip, one cell per pillar: IDENTIFY / GENERATE / DEFEND / LOOP
// Each cell is a click target that navigates to the relevant page.
// Data sourced from MOCK_DASHBOARD.kpis in demo mode.
// Feels like a thesis bar, not a second KPI strip.

import type { NavId } from '../../types'

interface ArgumentCell {
  pillar: string
  number: string
  unit: string
  claim: string
  navId: NavId
}

interface ArgumentBarProps {
  onNavigate: (id: NavId) => void
  recall?: number       // e.g. 92.8
  vectors?: number      // e.g. 36
}

export function ArgumentBar({
  onNavigate,
  recall = 92.8,
  vectors = 36,
}: ArgumentBarProps) {
  const cells: ArgumentCell[] = [
    {
      pillar: 'Identify',
      number: String(vectors),
      unit: 'attack vectors',
      claim: 'modelled across 6 families in the threat taxonomy',
      navId: 'threat-catalog',
    },
    {
      pillar: 'Generate',
      number: '500',
      unit: 'synthetic attacks',
      claim: 'per evolution round via grammar-based parametric mutator',
      navId: 'red-team',
    },
    {
      pillar: 'Defend',
      number: `${recall.toFixed(1)}%`,
      unit: 'of fraud caught',
      claim: 'vs 0% for 10 hand-written rules on the same rows',
      navId: 'blue-team',
    },
    {
      pillar: 'Loop',
      number: 'NSGA-II',
      unit: 'co-evolution',
      claim: 'attacker and defender adapt together each generation',
      navId: 'evolution',
    },
  ]

  return (
    <div className="argument-bar" role="navigation" aria-label="Pillar navigation">
      {cells.map(cell => (
        <button
          key={cell.navId}
          id={`arg-cell-${cell.navId}`}
          className="argument-bar-cell"
          onClick={() => onNavigate(cell.navId)}
          title={`Go to ${cell.pillar} page`}
        >
          <span className="argument-bar-pillar">{cell.pillar}</span>
          <span className="argument-bar-number">{cell.number}</span>
          <span className="argument-bar-unit">{cell.unit}</span>
          <span className="argument-bar-claim">{cell.claim}</span>
        </button>
      ))}
    </div>
  )
}
