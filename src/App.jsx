
import { useCallback, useRef, useState } from 'react'
import { Terms } from './components/Terms'
import { QueryBuilder } from './components/QueryBuilder'
import { Studies } from './components/Studies'
import { NiiViewer } from './components/NiiViewer'
import { useUrlQueryState } from './hooks/useUrlQueryState'
import './App.css'
import './theme.css'

export default function App () {
  const [query, setQuery] = useUrlQueryState('q')

  const handlePickTerm = useCallback((t) => {
    setQuery((q) => (q ? `${q} ${t}` : t))
  }, [setQuery])

  // --- resizable panes state ---
  const gridRef = useRef(null)
  const [sizes, setSizes] = useState([27, 43, 30]) // [terms, studies, map]
  const MIN_PX = 240

  const startDrag = (which, e) => {
    e.preventDefault()
    const startX = e.clientX
    const rect = gridRef.current.getBoundingClientRect()
    const total = rect.width - 58 // two separators and four grid gaps
    const curPx = sizes.map(p => (p / 100) * total)

    const onMouseMove = (ev) => {
      const dx = ev.clientX - startX
      if (which === 0) {
        let newLeft = curPx[0] + dx
        let newMid = curPx[1] - dx
        if (newLeft < MIN_PX) { newMid -= (MIN_PX - newLeft); newLeft = MIN_PX }
        if (newMid < MIN_PX) { newLeft -= (MIN_PX - newMid); newMid = MIN_PX }
        const s0 = (newLeft / total) * 100
        const s1 = (newMid / total) * 100
        const s2 = 100 - s0 - s1
        setSizes([s0, s1, Math.max(s2, 0)])
      } else {
        let newMid = curPx[1] + dx
        let newRight = curPx[2] - dx
        if (newMid < MIN_PX) { newRight -= (MIN_PX - newMid); newMid = MIN_PX }
        if (newRight < MIN_PX) { newMid -= (MIN_PX - newRight); newRight = MIN_PX }
        const s1 = (newMid / total) * 100
        const s2 = (newRight / total) * 100
        const s0 = (curPx[0] / total) * 100
        setSizes([s0, s1, Math.max(s2, 0)])
      }
    }
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <div className="app__mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" role="presentation">
              <path d="M13 14.5 24 8l11 6.5v13L24 34l-11-6.5v-13Z" />
              <path d="m13 14.5 11 6.6 11-6.6M24 21v13M13 27.5l11-6.4 11 6.4" />
              <circle cx="13" cy="14.5" r="2.5" /><circle cx="24" cy="8" r="2.5" />
              <circle cx="35" cy="14.5" r="2.5" /><circle cx="13" cy="27.5" r="2.5" />
              <circle cx="24" cy="34" r="2.5" /><circle cx="35" cy="27.5" r="2.5" />
              <circle cx="24" cy="21" r="2.5" />
            </svg>
          </div>
          <div>
            <p className="app__eyebrow">LOCATION OR TERM · BRAIN FUNCTION</p>
            <h1 className="app__title">LoTUS<span>—BF</span></h1>
            <p className="app__subtitle">Explore how concepts and brain locations connect across published research.</p>
          </div>
        </div>
        <div className="app__header-tools">
          <div className="app__header-note">
            <span className="app__status-dot" />
            <span><strong>RESEARCH WORKSPACE</strong><small>Terms · studies · brain maps</small></span>
          </div>
          <div className="app__version"><span className="app__version-mark">BF</span><span>NEUROSCIENCE<br />EXPLORER</span></div>
        </div>
      </header>

      <div className="app__workflow" aria-label="Explore in three steps">
        <div className="app__workflow-step"><span>01</span><b>Build a query</b></div>
        <i aria-hidden="true" />
        <div className="app__workflow-step"><span>02</span><b>Review studies</b></div>
        <i aria-hidden="true" />
        <div className="app__workflow-step"><span>03</span><b>Explore the map</b></div>
        <div className="app__workflow-hint">Click a term or try a starter query</div>
      </div>

      <main className="app__grid" ref={gridRef} style={{ '--pane-terms': `${sizes[0]}fr`, '--pane-studies': `${sizes[1]}fr`, '--pane-map': `${sizes[2]}fr` }}>
        <section className="card card--terms" aria-label="Search terms">
          <div className="section-heading">
            <span className="section-heading__number">01</span>
            <div><h2 className="card__title">Terms</h2><p className="card__description">Search and add a concept</p></div>
          </div>
          <Terms onPickTerm={handlePickTerm} />
        </section>

        <div className="resizer" role="separator" aria-orientation="vertical" aria-label="Resize terms and studies panels" onMouseDown={(e) => startDrag(0, e)} />

        <section className="card card--stack" aria-label="Query and study results">
          <QueryBuilder query={query} setQuery={setQuery} />
          <div className="divider" />
          <Studies query={query} />
        </section>

        <div className="resizer" role="separator" aria-orientation="vertical" aria-label="Resize studies and brain map panels" onMouseDown={(e) => startDrag(1, e)} />

        <section className="card card--viewer" aria-label="Brain map viewer">
          <NiiViewer query={query} />
        </section>
      </main>

      <footer className="app__footer">
        <span><b>LoTUS-BF</b> · Location or Term Unified Search for Brain Functions</span>
        <span>Query concepts, inspect evidence, and explore activation maps.</span>
      </footer>
    </div>
  )
}
