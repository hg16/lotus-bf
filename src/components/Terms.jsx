
import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'

export function Terms ({ onPickTerm }) {
  const [terms, setTerms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const s = search.trim()

    // Wait until the user enters a search term.
    if (!s) {
      setTerms([])
      setLoading(false)
      setErr('')
      return
    }

    let alive = true
    const ac = new AbortController()

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setErr('')

      try {
        const url = apiUrl(
          `/terms?q=${encodeURIComponent(s)}&limit=100`
        )

        const res = await fetch(url, {
          signal: ac.signal
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()

        if (!alive) return

        setTerms(
          Array.isArray(data?.terms) ? data.terms : []
        )

      } catch (e) {
        if (!alive || e.name === 'AbortError') return

        setErr(`Failed to fetch terms: ${e?.message || e}`)
        setTerms([])

      } finally {
        if (alive) setLoading(false)
      }
    }, 400)

    return () => {
      alive = false
      window.clearTimeout(timer)
      ac.abort()
    }
  }, [search])

  return (
    <div className='terms'>

      <div className='terms__controls'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search terms"
          placeholder='Search terms…'
          className='input'
        />

        <button
          type='button'
          onClick={() => setSearch('')}
          className='btn btn--primary'
        >
          Clear
        </button>
      </div>

      {!search.trim() && (
        <div className='terms__empty'>
          Enter a word to search all available terms.
        </div>
      )}

      {loading && (
        <div className='terms__skeleton'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='terms__skeleton-row' />
          ))}
        </div>
      )}

      {err && (
        <div className='alert alert--error'>
          {err}
        </div>
      )}

      {!loading && !err && search.trim() && (
        <div className='terms__list'>
          {terms.length === 0 ? (
            <div className='terms__empty'>
              No terms found
            </div>
          ) : (
            <ul className='terms__ul'>
              {terms.map((t, idx) => (
                <li key={`${t}-${idx}`} className='terms__li'>
                  <a
                    href="#"
                    className='terms__name'
                    title={t}
                    aria-label={`Add term ${t}`}
                    onClick={(e) => {
                      e.preventDefault()
                      onPickTerm?.(t)
                    }}
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!loading && !err && search.trim() && (
        <div className='terms__count'>
          {terms.length.toLocaleString()} matching terms
        </div>
      )}

    </div>
  )
}
