import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../lib/weather'
import { flag } from '../lib/format'

/** City search with debounced autocomplete and full keyboard support. */
export default function SearchBar({ onSelect, onLocate, locating }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const found = await searchPlaces(q, ctrl.signal)
        setResults(found)
        setActive(0)
        setOpen(true)
      } catch (err) {
        if (err.name !== 'AbortError') setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [query])

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const choose = (place) => {
    onSelect(place)
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (e) => {
    if (!open || !results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="glass flex h-12 items-center gap-2 rounded-2xl pl-4 pr-1.5 transition focus-within:ring-2 focus-within:ring-white/40">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search any city…"
          aria-label="Search city"
          role="combobox"
          aria-expanded={open}
          aria-controls="city-results"
          autoComplete="off"
          spellCheck="false"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/55 focus:outline-none"
        />
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <kbd className="mr-1 hidden rounded-md border border-white/20 px-1.5 py-0.5 text-[11px] text-white/60 sm:block">/</kbd>
        )}
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          title="Use my location"
          aria-label="Use my location"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 active:scale-95 disabled:opacity-60"
        >
          {locating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      {open && query.trim().length >= 2 && (
        <ul
          id="city-results"
          role="listbox"
          className="glass-strong absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl p-1.5 animate-pop"
        >
          {results.length === 0 && !loading && (
            <li className="px-3 py-3 text-sm text-white/70">No places match “{query.trim()}”.</li>
          )}
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); choose(r) }}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${i === active ? 'bg-white/20' : ''}`}
            >
              <span className="text-xl leading-none">{flag(r.countryCode)}</span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-white">{r.name}</span>
                <span className="block truncate text-xs text-white/60">{[r.region, r.country].filter(Boolean).join(', ')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
