
import { useCallback, useRef, useState } from 'react'
import { Terms } from './components/Terms'
import { QueryBuilder } from './components/QueryBuilder'
import { Studies } from './components/Studies'
import { NiiViewer } from './components/NiiViewer'
import { useUrlQueryState } from './hooks/useUrlQueryState'
import './App.css'

export default function App () {
  const [query, setQuery] = useUrlQueryState('q')

  const handlePickTerm = useCallback((t) => {
    setQuery((q) => (q ? `${q} ${t}` : t))
  }, [setQuery])

  // --- resizable panes state ---
  const gridRef = useRef(null)
  const [sizes, setSizes] = useState([28, 44, 28]) // [left, middle, right]
  const MIN_PX = 240

  const startDrag = (which, e) => {
    e.preventDefault()
    const startX = e.clientX
    const rect = gridRef.current.getBoundingClientRect()
    const total = rect.width
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
          <div className="app__mark" aria-hidden="true">L</div>
          <div>
            <p className="app__eyebrow">NEUROSCIENCE STUDY EXPLORER</p>
            <h1 className="app__title">LoTUS-BF</h1>
            <p className="app__subtitle">Search brain research by concept or MNI location.</p>
          </div>
        </div>
        <div className="app__header-note">
          <span className="app__status-dot" />
          <span>Terms <b>·</b> studies <b>·</b> brain maps</span>
        </div>
      </header>

      <main className="app__grid" ref={gridRef}>
        <section className="card card--terms" style={{ flexBasis: `${sizes[0]}%` }} aria-label="Search terms">
          <div className="section-heading">
            <span className="section-heading__number">01</span>
            <div><h2 className="card__title">Terms</h2><p className="card__description">Search and add a concept</p></div>
          </div>
          <Terms onPickTerm={handlePickTerm} />
        </section>

        <div className="resizer" role="separator" aria-orientation="vertical" aria-label="Resize terms and studies panels" onMouseDown={(e) => startDrag(0, e)} />

        <section className="card card--stack" style={{ flexBasis: `${sizes[1]}%` }} aria-label="Query and study results">
          <QueryBuilder query={query} setQuery={setQuery} />
          <div className="divider" />
          <Studies query={query} />
        </section>

        <div className="resizer" role="separator" aria-orientation="vertical" aria-label="Resize studies and brain map panels" onMouseDown={(e) => startDrag(1, e)} />

        <section className="card card--viewer" style={{ flexBasis: `${sizes[2]}%` }} aria-label="Brain map viewer">
          <NiiViewer query={query} />
        </section>
      </main>
    </div>
  )
}
