import { Tabs, TabList, Tab, TabPanel } from '@heroui/react'
import CodeBlock from './CodeBlock'

const managers = [
  { label: 'npm', code: 'npm install @bzync/ph-industry-intel' },
  { label: 'yarn', code: 'yarn add @bzync/ph-industry-intel' },
  { label: 'pnpm', code: 'pnpm add @bzync/ph-industry-intel' },
  { label: 'bun', code: 'bun add @bzync/ph-industry-intel' },
]

const quickStart = `import {
  getSections,
  getDivisions,
  getGroups,
  getClasses,
  getSubclasses,
  getNode,
  getPath,
  search,
  isValidCode,
} from '@bzync/ph-industry-intel'

// --- Hierarchy traversal ---
const sections = getSections()                     // all 21 sections
const divisions = getDivisions('J')               // ICT sector divisions
const groups = getGroups('62')                    // groups in division 62
const classes = getClasses('620')                 // classes in group 620
const subclasses = getSubclasses('6201')          // subclasses of class 6201

// --- Node lookup ---
const node = getNode('62011')
// {
//   code: '62011',
//   title: 'Game design and development',
//   level: 'subclass',
//   parentCode: '6201'
// }

// --- Path resolution ---
const path = getPath('62011')
// {
//   section:  { code: 'J',     title: 'INFORMATION AND COMMUNICATION' },
//   division: { code: '62',    title: 'COMPUTER PROGRAMMING, CONSULTANCY AND RELATED ACTIVITIES' },
//   group:    { code: '620',   title: 'Computer programming, consultancy and related activities' },
//   class:    { code: '6201',  title: 'Computer programming activities' },
//   subclass: { code: '62011', title: 'Game design and development' }
// }

// --- Full-text search ---
const hits = search('software', { levels: ['class', 'subclass'], includePath: true })

// --- Validation ---
const valid = isValidCode('62011')  // true
const invalid = isValidCode('Z')    // false`

export default function Installation() {
  return (
    <section id="install" className="py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-14">
        <div>
          <SectionHeading tag="01" title="Installation" desc="Pick your package manager." />
          <div className="mt-6">
            <Tabs defaultSelectedKey="npm" variant="primary">
              <TabList className="border-b border-divider gap-4">
                {managers.map((m) => (
                  <Tab key={m.label} id={m.label} className="text-sm">{m.label}</Tab>
                ))}
              </TabList>
              {managers.map((m) => (
                <TabPanel key={m.label} id={m.label} className="mt-4">
                  <CodeBlock code={m.code} language="bash" />
                </TabPanel>
              ))}
            </Tabs>
          </div>
        </div>

        <div>
          <SectionHeading
            tag="02"
            title="Quick Start"
            desc="Everything you need in a single import."
          />
          <div className="mt-6">
            <CodeBlock code={quickStart} language="typescript" filename="example.ts" />
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md mt-0.5">
        {tag}
      </span>
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-foreground-500 mt-1">{desc}</p>
      </div>
    </div>
  )
}
