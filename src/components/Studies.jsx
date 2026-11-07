import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../lib/api'

function classNames (...xs) { return xs.filter(Boolean).join(' ') }

export function Studies ({ query }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [sortKey, setSortKey] = useState('year')
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    if (!query) return
    let alive = true
    const ac = new AbortController()
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const url = apiUrl(`/query/${encodeURIComponent(query)}/studies`)
        const res = await fetch(url, { signal: ac.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
        if (!alive) return
        const list = Array.isArray(data?.results) ? data.results : []
        setRows(list)
      } catch (e) {
        if (!alive) return
        setErr(`Unable to fetch studies: ${e?.message || e}`)
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false; ac.abort() }
  }, [query])

  const changeSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    const arr = [...rows]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const A = a?.[sortKey]
      const B = b?.[sortKey]
      // Numeric comparison for year; string comparison for other fields
      if (sortKey === 'year') return (Number(A || 0) - Number(B || 0)) * dir
      return String(A || '').localeCompare(String(B || ''), 'en') * dir
    })
    return arr
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)
  const firstVisible = sorted.length ? ((page - 1) * pageSize) + 1 : 0

  const downloadCsv = () => {
    const columns = [
      ['study_id', 'Study ID'],
      ['contrast_id', 'Contrast ID'],
      ['year', 'Year'],
      ['journal', 'Journal'],
      ['title', 'Title'],
      ['authors', 'Authors'],
    ]
    const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csv = [columns.map(([, label]) => cell(label)), ...sorted.map((row) => columns.map(([key]) => cell(row[key]))) ]
      .map((row) => row.join(',')).join('\r\n')
    const blobUrl = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) || 'results'
    anchor.href = blobUrl
    anchor.download = `lotus-bf-${slug}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  }

  return (
    <div className='studies'>
      <div className='studies__header'>
        <div className='studies__heading'>
          <span className='studies__heading-icon' aria-hidden='true'>↗</span>
          <div>
          <h2 className='card__title'>Studies</h2>
          <p className='card__description'>{query ? 'Research papers matching your query' : 'Evidence linked to your search will appear here.'}</p>
          </div>
        </div>
        {query && !loading && !err && (
          <div className='studies__header-actions'>
            <span className='result-count' aria-live='polite'><b>{sorted.length.toLocaleString()}</b> <span>STUDIES</span></span>
            {sorted.length > 0 && <button type='button' className='studies__export' onClick={downloadCsv} title='Download all matching studies as CSV'>Export CSV <span aria-hidden='true'>↓</span></button>}
          </div>
        )}
      </div>

      {!query && (
        <div className='studies__empty'>
          <span className='studies__empty-mark' aria-hidden='true'>01</span>
          <div><b>Your evidence panel</b><p>Choose a concept, enter an MNI coordinate, or start with one of the example searches.</p></div>
        </div>
      )}
      {query && loading && (
        <div className='studies__loading'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='studies__skeleton-row' />
          ))}
        </div>
      )}

      {query && err && (
        <div className='studies__error' role='alert'>
          {err}
        </div>
      )}

      {query && !loading && !err && (
        <div className='overflow-auto'>
          <table className='studies__table'>
            <thead className='sticky top-0 bg-gray-50 text-left'>
              <tr>
                {[
                  { key: 'year', label: 'Year' },
                  { key: 'journal', label: 'Journal' },
                  { key: 'title', label: 'Title' },
                  { key: 'authors', label: 'Authors' }
                ].map(({ key, label }) => (
                  <th key={key} aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button type='button' className='studies__sort' onClick={() => changeSort(key)}>
                      {label}<span aria-hidden='true'>{sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={4} className='studies__no-data'>No studies match this query. Try a broader term or a different Boolean operator.</td></tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr key={r.id || `${r.study_id}-${i}`} className={classNames(i % 2 ? 'studies__row studies__row--alt' : 'studies__row')}>
                    <td className='studies__year'>{r.year ?? '—'}</td>
                    <td className='studies__journal'>{r.journal || '—'}</td>
                    <td className='studies__title-cell'>
                      <div className='studies__title' title={r.title}>{r.title || 'Untitled study'}</div>
                      {/^\d+$/.test(String(r.study_id || '')) && (
                        <a className='studies__record' href={`https://pubmed.ncbi.nlm.nih.gov/${r.study_id}/`} target='_blank' rel='noreferrer'>
                          PMID {r.study_id}<span aria-hidden='true'>↗</span>
                        </a>
                      )}
                    </td>
                    <td className='studies__authors'>{r.authors || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {query && !loading && !err && (
        <div className='studies__pagination'>
          <div><b>{firstVisible}–{Math.min(page * pageSize, sorted.length)}</b> of {sorted.length.toLocaleString()} records <span>·</span> Page {page} of {totalPages}</div>
          <div className='studies__pagination-actions'>
            <button aria-label='First page' disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
            <button aria-label='Last page' disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      )}
    </div>
  )
}

