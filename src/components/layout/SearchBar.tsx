import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import { searchTitles } from '@/api/wikipedia'
import { titleToSlug } from '@/utils/titleToSlug'

export function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    searchTitles(q, 8)
      .then((titles) => {
        setResults(titles)
        setOpen(true)
        setActiveIdx(-1)
      })
      .catch(() => {/* silently ignore search errors */})
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function selectTitle(title: string) {
    setQuery('')
    setOpen(false)
    navigate(`/wiki/${titleToSlug(title)}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0) selectTitle(results[activeIdx])
      else if (query.trim()) selectTitle(query.trim())
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 20,
        padding: '6px 14px',
      }}>
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => query && results.length > 0 && setOpen(true)}
          placeholder="Search Wikipedia…"
          aria-label="Search Wikipedia"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: '0.9rem',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }} aria-label="Clear search">
            <FontAwesomeIcon icon={faXmark} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul role="listbox" style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          listStyle: 'none',
          zIndex: 100,
          maxHeight: 360,
          overflowY: 'auto',
        }}>
          {results.map((title, i) => (
            <li
              key={title}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => selectTitle(title)}
              style={{
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                background: i === activeIdx ? 'var(--color-surface)' : 'transparent',
                borderBottom: i < results.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
