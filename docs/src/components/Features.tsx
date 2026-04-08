import { Card, CardContent } from '@heroui/react'

const features = [
  {
    icon: '🗂️',
    title: 'Full PSIC Hierarchy',
    desc: 'Traverse the complete 5-level PSIC tree: Section → Division → Group → Class → Subclass. Filter each level by its parent with a single function call.',
  },
  {
    icon: '🔗',
    title: 'Path Resolution',
    desc: 'Pass any valid PSIC code to getPath() and get the full ancestral chain — from subclass up to section — in one synchronous call.',
  },
  {
    icon: '🔍',
    title: 'Full-text Search',
    desc: 'Substring and fuzzy search across all PSIC levels. Filter by level, set result limits, or enable includePath to attach the full hierarchy to each result.',
  },
  {
    icon: '✅',
    title: 'Code Validation',
    desc: 'isValidCode() checks any code against the bundled PSIC dataset. Supports all five levels — section letters (A–U), 2-digit divisions, and up to 5-digit subclasses.',
  },
  {
    icon: '📦',
    title: 'Zero Runtime Deps',
    desc: 'All PSIC data is bundled at build time. No network calls, no external services — works offline, at the edge, and in any JavaScript environment.',
  },
  {
    icon: '🏷️',
    title: 'TypeScript First',
    desc: 'Every function and data type is fully typed. Ships with .d.ts declarations and supports both CJS and ESM module formats.',
  },
  {
    icon: '📊',
    title: 'Official PSA Data',
    desc: 'Sourced from the Philippine Statistics Authority 2009 PSIC with 2019 updates. Covers all 21 sections, 88 divisions, and hundreds of subclasses.',
  },
]

export default function Features() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Everything you need</h2>
          <p className="mt-3 text-foreground-500 text-lg max-w-xl mx-auto">
            A complete industry classification solution for any Philippine web or mobile application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border border-divider hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6 gap-3 flex flex-col">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-semibold text-foreground text-base">{f.title}</h3>
                <p className="text-foreground-500 text-sm leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
