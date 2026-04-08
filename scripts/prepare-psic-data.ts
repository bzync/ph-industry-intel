// NOTE: xlsx is not listed as a devDependency due to known CVEs (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9).
// To run this script, install it temporarily: npm install xlsx && npx tsx scripts/prepare-psic-data.ts
import fs from 'node:fs/promises'
import path from 'node:path'
// @ts-ignore — xlsx is intentionally not in devDependencies; install ad-hoc when needed
import * as XLSX from 'xlsx'

// ─── Types ────────────────────────────────────────────────────────────────────

type PsicLevel = 'section' | 'division' | 'group' | 'class' | 'subclass'

interface RawRow {
  code: string
  title: string
}

interface SubclassNode {
  code: string
  title: string
}

interface ClassNode {
  code: string
  title: string
  subclasses: SubclassNode[]
}

interface GroupNode {
  code: string
  title: string
  classes: ClassNode[]
}

interface DivisionNode {
  code: string
  title: string
  groups: GroupNode[]
}

interface SectionNode {
  code: string
  title: string
  divisions: DivisionNode[]
}

interface FlatEntry {
  section_code: string
  section_name: string
  division_code: string
  division_name: string
  group_code: string
  group_name: string
  class_code: string
  class_name: string
  subclass_code: string
  subclass_name: string
}

interface PsicDataset {
  source: {
    name: string
    publisher: string
    mirror?: string
    published?: string
    edition?: string
    description?: string
  }
  counts: {
    sections: number
    divisions: number
    groups: number
    classes: number
    subclasses: number
  }
  sections: SectionNode[]
}

type XlsxRow = Record<string, unknown>

// ─── Config ───────────────────────────────────────────────────────────────────

const LOCAL_XLSX_FILE = path.resolve(
  process.cwd(),
  'src/data/2019_Updates_to_the_2009_PSIC_08112021.xlsx',
)

const OUTPUT_HIERARCHICAL = path.resolve(process.cwd(), 'src/data/psic.json')
const OUTPUT_FLAT = path.resolve(process.cwd(), 'src/data/psic-flat.json')

const SOURCE_METADATA = {
  name: '2019 Updates to the 2009 Philippine Standard Industrial Classification',
  publisher: 'Philippine Statistics Authority',
  mirror: 'Bureau of Internal Revenue CDN mirror of PSA publication',
  published: '2021-08',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clean(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectLevel(code: string): PsicLevel | null {
  if (/^[A-U]$/.test(code)) return 'section'
  if (/^\d{2}$/.test(code)) return 'division'
  if (/^\d{3}$/.test(code)) return 'group'
  if (/^\d{4}$/.test(code)) return 'class'
  if (/^\d{5}$/.test(code)) return 'subclass'
  return null
}

function pick(row: XlsxRow, candidates: string[]): unknown {
  const keys = Object.keys(row)

  for (const candidate of candidates) {
    const found = keys.find(
      (key) => key.toLowerCase().trim() === candidate.toLowerCase().trim(),
    )
    if (found !== undefined) return row[found]
  }

  for (const candidate of candidates) {
    const found = keys.find((key) =>
      key.toLowerCase().includes(candidate.toLowerCase()),
    )
    if (found !== undefined) return row[found]
  }

  return undefined
}

function parseSheetWithBestHeader(sheet: XLSX.WorkSheet): XlsxRow[] {
  for (let headerRow = 0; headerRow <= 15; headerRow++) {
    const rows = XLSX.utils.sheet_to_json<XlsxRow>(sheet, {
      defval: '',
      raw: false,
      range: headerRow,
    })

    if (rows.length === 0) continue

    const firstRow = rows[0]
    if (firstRow === undefined) continue

    const keys = Object.keys(firstRow).map((k) => k.toLowerCase())

    const looksLikePsicHeader =
      keys.some((k) => k.includes('code') || k.includes('industry')) &&
      keys.some((k) => k.includes('title') || k.includes('description') || k.includes('name'))

    if (looksLikePsicHeader) {
      console.log(`Detected PSIC header row at sheet row index: ${headerRow}`)
      console.log('Detected columns:', Object.keys(firstRow))
      return rows
    }
  }

  return []
}

// Each row in the PSIC sheet has codes spread across separate columns (GROUP, CLASS, SUB-CLASS).
// Only one of those columns is populated per row; we check each independently.
function extractRows(xlsxRows: XlsxRow[]): RawRow[] {
  const results: RawRow[] = []

  for (const row of xlsxRows) {
    const rawTitle = clean(
      pick(row, [
        'industry description',
        'title',
        'description',
        'industry title',
        'name',
        'industry name',
      ]),
    )
    if (!rawTitle) continue

    // Check each code column independently so that a non-empty GROUP value is
    // not shadowed by an empty CLASS value (the old single-pick approach always
    // resolved to CLASS first and returned '' for group/division rows).
    const subclassVal = clean(pick(row, ['sub-class', 'subclass']))
    const classVal = clean(pick(row, ['class']))
    const groupVal = clean(pick(row, ['group', 'grp', 'div', 'division']))

    // When multiple code columns are filled on one row (e.g. group + class + subclass
    // all in the same cell row), emit an entry for every populated level so that the
    // hierarchy can be built without skipping intermediate nodes.
    const levelCodes: Array<{ code: string; title: string }> = []
    for (const val of [groupVal, classVal, subclassVal]) {
      if (val !== '' && detectLevel(val) !== null) {
        levelCodes.push({ code: val, title: rawTitle })
      }
    }

    if (levelCodes.length > 0) {
      results.push(...levelCodes)
      continue
    }

    // Division codes have no dedicated column — they appear in the description as
    // "DIVISION 01. CROP AND ANIMAL PRODUCTION, HUNTING AND RELATED SERVICE ACTIVITIES"
    const divMatch = rawTitle.match(/^DIVISION\s+(\d{2})\b[.:–-]?\s*(.*)/i)
    if (divMatch) {
      const divCode = divMatch[1]!
      const divTitle = divMatch[2]?.trim() || rawTitle
      results.push({ code: divCode, title: divTitle })
    }
  }

  return results
}

// Extract section code from sheet name (e.g. "Section-A", "Section-C ") → "A"
// and attempt to read the section title from the first row of the sheet.
function extractSectionMeta(
  sheet: XLSX.WorkSheet,
  sheetName: string,
): { code: string; title: string } | null {
  const codeMatch = sheetName.trim().match(/([A-U])\s*$/i)
  if (!codeMatch) return null
  const code = codeMatch[1]!.toUpperCase()

  // The first row (before the column-header row) usually contains the section title.
  const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    defval: '',
    raw: false,
    header: 1,
  }) as unknown[][]

  for (const row of allRows.slice(0, 3)) {
    if (!Array.isArray(row)) continue
    for (const cell of row) {
      const text = clean(String(cell ?? ''))
      // "SECTION A. AGRICULTURE, FORESTRY AND FISHING" → extract the part after "SECTION X."
      const sectionTitleMatch = text.match(/^SECTION\s+[A-U][.:\s–-]+\s*(.*\S)/i)
      if (sectionTitleMatch?.[1]) {
        return { code, title: sectionTitleMatch[1].trim() }
      }
      // Accept other cells that look like a real title (not a short code or column header)
      if (
        text.length > 8 &&
        /[A-Za-z]/.test(text) &&
        !/^(GROUP|CLASS|SUB-?CLASS|DIVISION|INDUSTRY|PSIC|ISIC|ACIC)/i.test(text)
      ) {
        return { code, title: text }
      }
    }
  }

  return { code, title: `Section ${code}` }
}

// ─── Build hierarchical structure ─────────────────────────────────────────────

function buildHierarchy(rows: RawRow[]): SectionNode[] {
  const sections: SectionNode[] = []

  let currentSection: SectionNode | null = null
  let currentDivision: DivisionNode | null = null
  let currentGroup: GroupNode | null = null
  let currentClass: ClassNode | null = null

  for (const { code, title } of rows) {
    const level = detectLevel(code)
    if (level === null) continue

    if (level === 'section') {
      currentSection = { code, title, divisions: [] }
      currentDivision = null
      currentGroup = null
      currentClass = null
      sections.push(currentSection)
      continue
    }

    if (currentSection === null) {
      console.warn(`Skipping ${level} "${code}" — no parent section found`)
      continue
    }

    if (level === 'division') {
      currentDivision = { code, title, groups: [] }
      currentGroup = null
      currentClass = null
      currentSection.divisions.push(currentDivision)
      continue
    }

    if (currentDivision === null) {
      console.warn(`Skipping ${level} "${code}" — no parent division found`)
      continue
    }

    if (level === 'group') {
      currentGroup = { code, title, classes: [] }
      currentClass = null
      currentDivision.groups.push(currentGroup)
      continue
    }

    if (currentGroup === null) {
      console.warn(`Skipping ${level} "${code}" — no parent group found`)
      continue
    }

    if (level === 'class') {
      currentClass = { code, title, subclasses: [] }
      currentGroup.classes.push(currentClass)
      continue
    }

    if (currentClass === null) {
      console.warn(`Skipping ${level} "${code}" — no parent class found`)
      continue
    }

    // subclass
    currentClass.subclasses.push({ code, title })
  }

  return sections
}

// ─── Build flat entries ───────────────────────────────────────────────────────

function buildFlatEntries(sections: SectionNode[]): FlatEntry[] {
  const entries: FlatEntry[] = []

  for (const section of sections) {
    for (const division of section.divisions) {
      for (const group of division.groups) {
        for (const cls of group.classes) {
          for (const subclass of cls.subclasses) {
            entries.push({
              section_code: section.code,
              section_name: section.title,
              division_code: division.code,
              division_name: division.title,
              group_code: group.code,
              group_name: group.title,
              class_code: cls.code,
              class_name: cls.title,
              subclass_code: subclass.code,
              subclass_name: subclass.title,
            })
          }
        }
      }
    }
  }

  return entries
}

// ─── Count nodes ─────────────────────────────────────────────────────────────

function countNodes(sections: SectionNode[]): PsicDataset['counts'] {
  let divisions = 0
  let groups = 0
  let classes = 0
  let subclasses = 0

  for (const section of sections) {
    divisions += section.divisions.length
    for (const division of section.divisions) {
      groups += division.groups.length
      for (const group of division.groups) {
        classes += group.classes.length
        for (const cls of group.classes) {
          subclasses += cls.subclasses.length
        }
      }
    }
  }

  return { sections: sections.length, divisions, groups, classes, subclasses }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`Reading PSIC workbook from ${LOCAL_XLSX_FILE}`)

  const fileBuffer = await fs.readFile(LOCAL_XLSX_FILE)
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' }) as XLSX.WorkBook

  console.log('Sheet names:', workbook.SheetNames)

  if (workbook.SheetNames.length === 0) {
    throw new Error('Workbook has no sheets')
  }

  // Process every sheet named "Section-A" through "Section-U"
  const sectionSheetNames = workbook.SheetNames.filter((n: string) =>
    /section[-_\s]*[A-U]\s*$/i.test(n.trim()),
  )

  if (sectionSheetNames.length === 0) {
    throw new Error('Could not find any Section-* worksheets in the workbook.')
  }

  console.log(`Processing ${sectionSheetNames.length} section sheets…`)

  const allRawRows: RawRow[] = []

  for (const sheetName of sectionSheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (sheet === undefined) continue

    const sectionMeta = extractSectionMeta(sheet, sheetName)
    if (!sectionMeta) {
      console.warn(`Skipping sheet "${sheetName}" — could not determine section code`)
      continue
    }

    const xlsxRows = parseSheetWithBestHeader(sheet)
    if (xlsxRows.length === 0) {
      console.warn(`Skipping sheet "${sheetName}" — no PSIC header row detected`)
      continue
    }

    const sheetRows = extractRows(xlsxRows)
    console.log(`  [${sheetName}] section=${sectionMeta.code}  rows=${sheetRows.length}`)

    // Inject a synthetic section row so buildHierarchy can anchor the subtree.
    allRawRows.push({ code: sectionMeta.code, title: sectionMeta.title })
    allRawRows.push(...sheetRows)
  }

  console.log(`\nTotal rows across all sheets: ${allRawRows.length}`)

  if (allRawRows.length === 0) {
    throw new Error('No valid PSIC rows found. Check column names in the Excel file.')
  }

  const sections = buildHierarchy(allRawRows)
  const flatEntries = buildFlatEntries(sections)
  const counts = countNodes(sections)

  const dataset: PsicDataset = {
    source: SOURCE_METADATA,
    counts,
    sections,
  }

  await fs.mkdir(path.dirname(OUTPUT_HIERARCHICAL), { recursive: true })
  await fs.writeFile(OUTPUT_HIERARCHICAL, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')
  await fs.writeFile(OUTPUT_FLAT, `${JSON.stringify(flatEntries, null, 2)}\n`, 'utf8')

  console.log(`\nWrote ${OUTPUT_HIERARCHICAL}`)
  console.log(`Wrote ${OUTPUT_FLAT}`)
  console.log(`\nCounts:`)
  console.log(`  Sections:  ${counts.sections}`)
  console.log(`  Divisions: ${counts.divisions}`)
  console.log(`  Groups:    ${counts.groups}`)
  console.log(`  Classes:   ${counts.classes}`)
  console.log(`  Subclasses: ${counts.subclasses}`)
  console.log(`  Flat entries: ${flatEntries.length}`)
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
