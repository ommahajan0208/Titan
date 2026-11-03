import { useEffect, useRef, useState } from 'react'
import { Search, ArrowUpRight, X } from 'lucide-react'
import { NAV_ITEMS } from './Sidebar'
import type { NavId } from '../../types'

/** Native dialog provides modal focus containment, Escape and focus restoration. */
export function CommandMenu({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const open = () => { setQuery(''); dialog.current?.showModal() }
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (dialog.current?.open) dialog.current.close()
        else open()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])
  const results = NAV_ITEMS.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
  const navigate = (id: NavId) => { dialog.current?.close(); onNavigate(id) }
  return <>
    <button className="command-trigger" onClick={open} aria-label="Search pages (Control or Command K)"><Search size={15} /><span>Jump to…</span><kbd>⌘ / Ctrl K</kbd></button>
    <dialog ref={dialog} className="command-dialog" aria-labelledby="command-title" onClick={event => { if (event.target === dialog.current) dialog.current.close() }}>
      <div className="command-panel">
        <div className="command-heading"><h2 id="command-title">Navigate Titan</h2><button className="icon-button" onClick={() => dialog.current?.close()} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="command-search"><Search size={18} /><input autoFocus aria-label="Search pages" placeholder="Where would you like to go?" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && results[0]) navigate(results[0].id) }} /></div>
        <div className="command-results">{results.map(item => <button key={item.id} onClick={() => navigate(item.id)}>{item.icon}<span>{item.label}</span><ArrowUpRight size={15} /></button>)}{!results.length && <p className="command-empty">No pages found. Try “team” or “lab”.</p>}</div>
        <div className="command-hint">Tab to browse · Enter to open · Esc to close</div>
      </div>
    </dialog>
  </>
}
