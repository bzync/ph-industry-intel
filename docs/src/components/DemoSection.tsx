import { useState } from 'react'
import CascadeDemo from './CascadeDemo'
import SearchDemo from './SearchDemo'
import PathDemo from './PathDemo'
import ValidateDemo from './ValidateDemo'

type TabId = 'cascade' | 'search' | 'path' | 'validate'

const TABS: { id: TabId; label: string; desc: string }[] = [
  {
    id: 'cascade',
    label: 'Cascading Selection',
    desc: 'Hierarchical dropdowns driven by the PSIC hierarchy — Section → Division → Group → Class → Subclass',
  },
  {
    id: 'search',
    label: 'Search',
    desc: 'Full-text search across all PSIC levels — exact or fuzzy',
  },
  {
    id: 'path',
    label: 'Path Resolution',
    desc: 'Enter any PSIC code to resolve its full ancestral path',
  },
  {
    id: 'validate',
    label: 'Validate',
    desc: 'Check whether a code is a valid PSIC code and inspect its node',
  },
]

const PANELS: Record<TabId, React.ReactNode> = {
  cascade: <CascadeDemo />,
  search: <SearchDemo />,
  path: <PathDemo />,
  validate: <ValidateDemo />,
}

export default function DemoSection() {
  const [active, setActive] = useState<TabId>('cascade')
  const tab = TABS.find((t) => t.id === active)!

  return (
    <section id="demo" className="py-16 sm:py-24 px-4 bg-content1">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl font-bold text-foreground">Live Demo</h2>
          <p className="mt-3 text-foreground-500 text-lg">
            Fully interactive — calls the library directly in your browser.
          </p>
        </div>

        {/* Tab bar */}
        <div className="relative border-b border-divider">
          <div className="overflow-x-auto scrollbar-hide">
            <div role="tablist" className="flex min-w-max">
              {TABS.map((t) => {
                const isActive = active === t.id
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setActive(t.id)}
                    className={[
                      'relative px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                      'after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-colors',
                      isActive
                        ? 'text-foreground after:bg-primary'
                        : 'text-foreground-400 hover:text-foreground-600 after:bg-transparent',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Right fade: hints at horizontal scroll on mobile */}
          <div className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-content1 to-transparent" />
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          className="relative z-10 mt-6 rounded-xl border border-divider bg-content2 p-4 sm:p-6 overflow-visible"
        >
          <p className="text-sm text-foreground-500 mb-6">{tab.desc}</p>
          {PANELS[active]}
        </div>
      </div>
    </section>
  )
}
