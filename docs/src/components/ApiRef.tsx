import {
  Accordion,
  AccordionItem,
  AccordionHeading,
  AccordionTrigger,
  AccordionPanel,
  AccordionBody,
  AccordionIndicator,
  Chip,
} from '@heroui/react'
import CodeBlock from './CodeBlock'

interface FnDef {
  name: string
  signature: string
  desc: string
  params?: { name: string; type: string; desc: string }[]
  returns: string
  example: string
  note?: string
}

const fns: FnDef[] = [
  {
    name: 'getSections',
    signature: 'getSections(): PsicSection[]',
    desc: 'Return all top-level PSIC sections.',
    returns: 'Array of PsicSection objects (21 sections, A–U).',
    example: `const sections = getSections()
// [
//   { code: 'A', title: 'AGRICULTURE, FORESTRY AND FISHING', divisions: [...] },
//   { code: 'J', title: 'INFORMATION AND COMMUNICATION', divisions: [...] },
//   ...
// ]`,
  },
  {
    name: 'getDivisions',
    signature: 'getDivisions(sectionCode?: string): PsicDivision[]',
    desc: 'Return divisions within a section, or all divisions when no code is provided.',
    params: [{ name: 'sectionCode', type: 'string', desc: 'Single-letter section code, e.g. "J". Optional — omit to get all divisions.' }],
    returns: 'Array of PsicDivision objects. Empty array for an unknown section code.',
    example: `const ictDivisions = getDivisions('J')
// [{ code: '58', title: 'Publishing activities', groups: [...] }, ...]

const allDivisions = getDivisions()
// All 88 divisions across all sections`,
  },
  {
    name: 'getGroups',
    signature: 'getGroups(divisionCode?: string): PsicGroup[]',
    desc: 'Return groups within a division, or all groups when no code is provided.',
    params: [{ name: 'divisionCode', type: 'string', desc: '2-digit division code, e.g. "62". Optional.' }],
    returns: 'Array of PsicGroup objects.',
    example: `const groups = getGroups('62')
// [{ code: '620', title: 'Computer programming, consultancy and related activities', classes: [...] }]`,
  },
  {
    name: 'getClasses',
    signature: 'getClasses(groupCode?: string): PsicClass[]',
    desc: 'Return classes within a group, or all classes when no code is provided.',
    params: [{ name: 'groupCode', type: 'string', desc: '3-digit group code, e.g. "620". Optional.' }],
    returns: 'Array of PsicClass objects.',
    example: `const classes = getClasses('620')
// [
//   { code: '6201', title: 'Computer programming activities', subclasses: [...] },
//   { code: '6202', title: 'Computer consultancy and computer facilities management activities', subclasses: [...] },
// ]`,
  },
  {
    name: 'getSubclasses',
    signature: 'getSubclasses(classCode?: string): PsicSubclass[]',
    desc: 'Return subclasses within a class, or all subclasses when no code is provided.',
    params: [{ name: 'classCode', type: 'string', desc: '4-digit class code, e.g. "6201". Optional.' }],
    returns: 'Array of PsicSubclass objects.',
    example: `const subclasses = getSubclasses('6201')
// [
//   { code: '62011', title: 'Game design and development' },
//   { code: '62012', title: 'Software development (except game design and development)' },
// ]`,
  },
  {
    name: 'getNode',
    signature: 'getNode(code: string): PsicNode | null',
    desc: 'Look up any PSIC code and return a normalized node with its level and parent code.',
    params: [{ name: 'code', type: 'string', desc: 'Any valid PSIC code at any level.' }],
    returns: 'PsicNode with code, title, level, and parentCode. Returns null for unknown codes.',
    example: `getNode('62011')
// { code: '62011', title: 'Game design and development', level: 'subclass', parentCode: '6201' }

getNode('J')
// { code: 'J', title: 'INFORMATION AND COMMUNICATION', level: 'section', parentCode: undefined }

getNode('INVALID') // → null`,
  },
  {
    name: 'getPath',
    signature: 'getPath(code: string): PsicPath | null',
    desc: 'Resolve any valid PSIC code upward through the hierarchy, returning the complete ancestral chain.',
    params: [{ name: 'code', type: 'string', desc: 'Any valid PSIC code — section, division, group, class, or subclass.' }],
    returns: 'PsicPath with only the levels up to and including the given code. Returns null if the code is not found.',
    example: `getPath('62011')
// {
//   section:  { code: 'J',     title: 'INFORMATION AND COMMUNICATION' },
//   division: { code: '62',    title: 'COMPUTER PROGRAMMING, CONSULTANCY AND RELATED ACTIVITIES' },
//   group:    { code: '620',   title: 'Computer programming, consultancy and related activities' },
//   class:    { code: '6201',  title: 'Computer programming activities' },
//   subclass: { code: '62011', title: 'Game design and development' }
// }

// From a division code — group, class, subclass are undefined
getPath('62')
// { section: { code: 'J', ... }, division: { code: '62', ... } }`,
  },
  {
    name: 'search',
    signature: 'search(query: string, options?: SearchOptions): SearchResult[]',
    desc: 'Case-insensitive substring (or fuzzy) search across all PSIC levels.',
    params: [
      { name: 'query', type: 'string', desc: 'Search term. Returns [] for empty string.' },
      { name: 'options.levels', type: "PsicCodeLevel[]", desc: 'Restrict results to specific levels: section, division, group, class, subclass.' },
      { name: 'options.limit', type: 'number', desc: 'Maximum number of results (default: 20).' },
      { name: 'options.exact', type: 'boolean', desc: 'Exact code/title match only.' },
      { name: 'options.startsWith', type: 'boolean', desc: 'Prefix matching on code or title.' },
      { name: 'options.fuzzy', type: 'boolean', desc: 'Enable Sørensen–Dice bigram fuzzy matching. Results include a score field.' },
      { name: 'options.includePath', type: 'boolean', desc: 'Attach the full PSIC path to each result.' },
    ],
    returns: 'Array of SearchResult objects. Sorted by score descending when fuzzy is true.',
    example: `// Substring search across all levels
search('software')

// Restrict to class and subclass
search('software', { levels: ['class', 'subclass'], limit: 5 })

// Fuzzy search
search('agrikultura', { fuzzy: true, limit: 10 })

// Include full path on each result
search('game', { levels: ['subclass'], includePath: true })`,
  },
  {
    name: 'isValidCode',
    signature: 'isValidCode(code: string): boolean',
    desc: 'Check whether a string is a known PSIC code at any level.',
    params: [{ name: 'code', type: 'string', desc: 'The code to validate.' }],
    returns: 'true if the code exists in the bundled PSIC dataset, false otherwise.',
    example: `isValidCode('62011')  // true  — known subclass
isValidCode('6201')   // true  — known class
isValidCode('J')      // true  — known section
isValidCode('Z')      // false — no such section
isValidCode('99999')  // false — unknown subclass`,
  },
  {
    name: 'getChildren',
    signature: 'getChildren(code: string): Array<PsicSection | PsicDivision | PsicGroup | PsicClass | PsicSubclass>',
    desc: 'Return the immediate children of any PSIC node without knowing its level in advance.',
    params: [{ name: 'code', type: 'string', desc: 'A valid PSIC code at section, division, group, or class level.' }],
    returns: 'Array of child nodes. Returns [] for subclass codes (leaf nodes) and unknown codes.',
    example: `getChildren('J')      // → PsicDivision[]  (all divisions under section J)
getChildren('62')     // → PsicGroup[]     (all groups under division 62)
getChildren('620')    // → PsicClass[]     (all classes under group 620)
getChildren('6201')   // → PsicSubclass[]  (all subclasses under class 6201)
getChildren('62011')  // → []              (subclasses are leaf nodes)`,
  },
  {
    name: 'getCounts',
    signature: 'getCounts(): PsicCounts',
    desc: 'Return the total number of nodes at each PSIC level in the bundled dataset.',
    returns: 'PsicCounts with sections, divisions, groups, classes, and subclasses.',
    example: `getCounts()
// { sections: 21, divisions: 88, groups: 238, classes: 520, subclasses: 1145 }`,
  },
]

export default function ApiRef() {
  return (
    <section id="api" className="py-16 sm:py-24 px-4 bg-content1">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">API Reference</h2>
          <p className="mt-3 text-foreground-500 text-lg">
            All functions are synchronous and return typed values — no promises, no network calls.
          </p>
        </div>

        <Accordion variant="surface" allowsMultipleExpanded className="gap-3">
          {fns.map((fn) => (
            <AccordionItem key={fn.name} className="border border-divider rounded-xl overflow-hidden">
              <AccordionHeading>
                <AccordionTrigger className="flex items-center gap-3 w-full px-5 py-4 text-left">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="font-mono text-sm text-foreground flex-1 min-w-0 truncate" title={fn.signature}>{fn.signature}</span>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="px-5 pb-5">
                  <div className="space-y-4">
                    <p className="text-foreground-500 text-sm">{fn.desc}</p>

                    {fn.params && fn.params.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-foreground-400 uppercase tracking-wider mb-2">
                          Parameters
                        </p>
                        <div className="space-y-2">
                          {fn.params.map((p) => (
                            <div key={p.name} className="flex gap-3 text-sm">
                              <code className="font-mono text-primary shrink-0">{p.name}</code>
                              <code className="text-foreground-400 font-mono shrink-0">{p.type}</code>
                              <span className="text-foreground-500">{p.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-foreground-400 uppercase tracking-wider mb-2">
                        Returns
                      </p>
                      <p className="text-sm text-foreground-500">{fn.returns}</p>
                    </div>

                    {fn.note && (
                      <div className="bg-warning/10 border border-warning/20 rounded-lg px-4 py-3 text-sm text-warning flex gap-2 items-start">
                        <Chip size="sm" color="warning" variant="soft">Note</Chip>
                        <span>{fn.note}</span>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-foreground-400 uppercase tracking-wider mb-2">
                        Example
                      </p>
                      <CodeBlock code={fn.example} language="typescript" />
                    </div>
                  </div>
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
