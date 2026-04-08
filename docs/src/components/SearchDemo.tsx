import { useState, useMemo, useRef, useEffect } from 'react'
import { Chip } from '@heroui/react'
import { search } from '@bzync/ph-industry-intel'
import type { SearchResult, PsicCodeLevel } from '@bzync/ph-industry-intel'

type LevelColor = 'default' | 'accent' | 'success' | 'warning' | 'danger'

const LEVEL_COLORS: Record<PsicCodeLevel, LevelColor> = {
  section: 'success',
  division: 'accent',
  group: 'default',
  class: 'warning',
  subclass: 'danger',
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function IndustryIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

export default function SearchDemo() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [selected, setSelected] = useState<SearchResult | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim()
    if (q.length < 2) return []
    return search(q, { limit: 10, includePath: true })
  }, [query])

  useEffect(() => {
    setOpen(results.length > 0)
    setActiveIdx(-1)
  }, [results])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return
    const item = listRef.current.children[activeIdx] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelected(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      pickResult(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  function pickResult(r: SearchResult) {
    setQuery(r.title)
    setSelected(r)
    setOpen(false)
    setActiveIdx(-1)
    inputRef.current?.blur()
  }

  function clearInput() {
    setQuery('')
    setSelected(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-4 min-h-80">
      {/* Search input */}
      <div ref={containerRef} className="relative">
        <div
          className={[
            'flex items-center gap-3 border bg-surface-secondary rounded-xl px-4 py-3 transition',
            open
              ? 'border-primary/50 ring-1 ring-primary/20 rounded-b-none'
              : 'border-separator focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20',
          ].join(' ')}
        >
          <span className="text-foreground/40 shrink-0">
            <SearchIcon />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => { if (results.length > 0) setOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder="Search section, division, group, class, or subclass…"
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/40"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {query && (
            <button
              type="button"
              onClick={clearInput}
              className="text-foreground/40 hover:text-foreground transition shrink-0"
              aria-label="Clear"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div
            ref={listRef}
            role="listbox"
            className="absolute z-50 left-0 right-0 bg-overlay border border-t-0 border-primary/50 rounded-b-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
          >
            {results.map((r, i) => (
              <button
                key={r.code}
                role="option"
                aria-selected={i === activeIdx}
                type="button"
                className={[
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                  i === activeIdx ? 'bg-surface-secondary' : 'bg-overlay hover:bg-surface-secondary',
                  i !== 0 ? 'border-t border-separator' : '',
                ].join(' ')}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseDown={(e) => { e.preventDefault(); pickResult(r) }}
              >
                <span className="text-foreground/30 mt-0.5 shrink-0">
                  <IndustryIcon />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  {r.path && (
                    <p className="text-xs text-foreground/40 truncate mt-0.5">
                      {[r.path.section?.title, r.path.division?.title, r.path.group?.title]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(' › ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <code className="text-xs font-mono text-foreground/40">{r.code}</code>
                  <span className="text-xs text-foreground/40 capitalize">{r.level}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      {!query && (
        <p className="text-xs text-foreground/40 text-center py-2">
          Type at least 2 characters — e.g.{' '}
          <span className="font-medium text-foreground/50">software</span>,{' '}
          <span className="font-medium text-foreground/50">agriculture</span>,{' '}
          <span className="font-medium text-foreground/50">manufacturing</span>
        </p>
      )}

      {/* No results */}
      {query.trim().length >= 2 && results.length === 0 && !selected && (
        <p className="text-sm text-foreground/40 text-center py-4">
          No results for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {/* Selected item detail */}
      {selected && (
        <div className="rounded-xl border border-separator bg-surface p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip size="sm" color={LEVEL_COLORS[selected.level]} variant="soft" className="capitalize shrink-0">
              {selected.level}
            </Chip>
            <span className="text-sm font-semibold text-foreground">{selected.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/40">PSIC code</span>
            <code className="text-xs font-mono bg-surface-tertiary text-foreground/60 px-2 py-0.5 rounded">
              {selected.code}
            </code>
          </div>

          {selected.path && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground/50">
              <IndustryIcon className="w-3 h-3 text-foreground/40 shrink-0" />
              {[
                selected.path.section?.title,
                selected.path.division?.title,
                selected.path.group?.title,
                selected.path.class?.title,
              ]
                .filter(Boolean)
                .map((crumb, i, arr) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span>{crumb}</span>
                    {i < arr.length - 1 && <span className="text-foreground/30">›</span>}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
