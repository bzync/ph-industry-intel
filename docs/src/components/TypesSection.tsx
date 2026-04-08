import { Card, CardHeader, CardContent, Chip } from '@heroui/react'
import CodeBlock from './CodeBlock'

const typeDefs = `type PsicCodeLevel = 'section' | 'division' | 'group' | 'class' | 'subclass'

interface PsicSubclass {
  code: string    // 5-digit code, e.g. "62011"
  title: string   // e.g. "Game design and development"
}

interface PsicClass {
  code: string        // 4-digit code, e.g. "6201"
  title: string       // e.g. "Computer programming activities"
  subclasses: PsicSubclass[]
}

interface PsicGroup {
  code: string       // 3-digit code, e.g. "620"
  title: string
  classes: PsicClass[]
}

interface PsicDivision {
  code: string       // 2-digit code, e.g. "62"
  title: string
  groups: PsicGroup[]
}

interface PsicSection {
  code: string       // single letter, e.g. "J"
  title: string      // e.g. "INFORMATION AND COMMUNICATION"
  divisions: PsicDivision[]
}

interface PsicNode {
  code: string
  title: string
  level: PsicCodeLevel
  parentCode?: string   // undefined for sections (top-level)
}

interface PsicPath {
  section:   { code: string; title: string }
  division?: { code: string; title: string }  // present at division level and below
  group?:    { code: string; title: string }  // present at group level and below
  class?:    { code: string; title: string }  // present at class level and below
  subclass?: { code: string; title: string }  // present only at subclass level
}

interface SearchOptions {
  levels?:      PsicCodeLevel[]  // filter by level(s)
  limit?:       number           // max results (default: 20)
  exact?:       boolean          // exact code/title match
  startsWith?:  boolean          // prefix match
  fuzzy?:       boolean          // Sørensen–Dice bigram matching
  includePath?: boolean          // attach PsicPath to each result
}

interface SearchResult extends PsicNode {
  score?: number   // present when fuzzy: true
  path?:  PsicPath // present when includePath: true
}

interface PsicCounts {
  sections:   number
  divisions:  number
  groups:     number
  classes:    number
  subclasses: number
}`

const codeStructure = `// PSIC Code Structure
//
// Section  — single uppercase letter (A–U)
// Division — 2 digits
// Group    — 3 digits
// Class    — 4 digits
// Subclass — 5 digits

'J'      // Section — Information and Communication
'62'     // Division — Computer Programming, Consultancy and Related Activities
'620'    // Group
'6201'   // Class — Computer programming activities
'62011'  // Subclass — Game design and development`

export default function TypesSection() {
  return (
    <section id="types" className="py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">TypeScript Types</h2>
          <p className="mt-3 text-foreground-500 text-lg">
            All types are exported and can be used directly in your application.
          </p>
        </div>

        <CodeBlock
          code={typeDefs}
          language="typescript"
          filename="@bzync/ph-industry-intel/types.ts"
        />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">PSIC Code Structure</h3>
          <p className="text-sm text-foreground-500 mb-4 leading-relaxed">
            PSIC codes are hierarchical strings. The level is determined by length and format:
            sections use a single letter, while divisions through subclasses use 2–5 digit numeric strings.
          </p>
          <CodeBlock code={codeStructure} language="typescript" />
        </div>

        <Card className="border border-warning/30 bg-warning/5">
          <CardHeader className="px-6 pt-5 pb-0 gap-2 flex items-center">
            <Chip size="sm" color="warning" variant="soft">Note</Chip>
            <h3 className="font-semibold text-warning text-sm">Data Coverage</h3>
          </CardHeader>
          <CardContent className="px-6 pb-5 pt-3">
            <ul className="text-foreground-500 text-sm space-y-2 list-disc list-inside">
              <li>
                <strong className="text-foreground">Edition</strong> — Sourced from the PSA 2009 PSIC
                with 2019 updates. Covers all 21 sections and 88 divisions.
              </li>
              <li>
                <strong className="text-foreground">Subclass coverage</strong> — Not all classes have
                subclasses in the official publication. Where subclasses are absent, use the class code directly.
              </li>
              <li>
                <strong className="text-foreground">Leading zeros</strong> — Division, group, class, and
                subclass codes are numeric strings with leading zeros preserved (e.g.{' '}
                <code className="font-mono text-xs bg-content2 px-1 rounded">"01"</code> not{' '}
                <code className="font-mono text-xs bg-content2 px-1 rounded">1</code>).
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
