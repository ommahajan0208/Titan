import { useState } from 'react'
import { ArrowUpRight, Crosshair, Shield, GitFork, ScanLine } from 'lucide-react'
import type { NavId } from '../../types'
const stages = [
  { name: 'Identify', icon: ScanLine, title: 'Understand the threat.', copy: 'Explore attack families and the patterns your defenses need to recognise.', page: 'threat-catalog' },
  { name: 'Generate', icon: Crosshair, title: 'Challenge the boundaries.', copy: 'Create synthetic attacks and test how your model responds to evolving fraud.', page: 'red-team' },
  { name: 'Defend', icon: Shield, title: 'Make every decision count.', copy: 'Inspect defense policies, detection performance and the cost of false positives.', page: 'blue-team' },
  { name: 'Evolve', icon: GitFork, title: 'Learn. Adapt. Repeat.', copy: 'Follow the co-evolution of attacker and defender across generations.', page: 'evolution' },
] as const
export function DefenseCycle({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const [active, setActive] = useState(0)
  const stage = stages[active]
  return <section className="defense-cycle" aria-label="Explore the defense cycle">
    <div className="cycle-tabs" role="tablist" aria-label="Defense stages">{stages.map((item, index) => <button key={item.name} id={`cycle-tab-${index}`} role="tab" aria-selected={index === active} aria-controls="cycle-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
      let next = index
      if (event.key === 'ArrowRight') next = (index + 1) % stages.length
      else if (event.key === 'ArrowLeft') next = (index + stages.length - 1) % stages.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = stages.length - 1
      else return
      event.preventDefault(); setActive(next); document.getElementById(`cycle-tab-${next}`)?.focus()
    }}><item.icon size={18} /><span>{item.name}</span><small>0{index + 1}</small></button>)}</div>
    <div id="cycle-panel" role="tabpanel" aria-labelledby={`cycle-tab-${active}`} className="cycle-panel"><div key={active} className="cycle-copy"><h2>{stage.title}</h2><p>{stage.copy}</p></div><button className="cycle-link" onClick={() => onNavigate(stage.page)}>Explore {stage.name.toLowerCase()}<ArrowUpRight size={17} /></button></div>
  </section>
}
