import psic from './data/psic.json'
import flat from './data/psic-flat.json'
import type {
  PsicClass,
  PsicCodeValidation,
  PsicDataset,
  PsicDivision,
  PsicFlatEntry,
  PsicGroup,
  PsicNode,
  PsicPath,
  PsicSection,
  PsicSubclass,
  SearchOptions,
  SearchResult,
  PsicCodeLevel,
} from './types'

// ─── Security constants ───────────────────────────────────────────────────────

/** Maximum accepted query length for search functions. Queries exceeding this are rejected. */
export const PSIC_MAX_QUERY_LENGTH = 200

/** Maximum number of results that search functions will return. */
export const PSIC_MAX_RESULT_LIMIT = 200

const DEFAULT_RESULT_LIMIT = 20
const MIN_FUZZY_LENGTH = 2

const dataset = psic as PsicDataset
const flatEntries = flat as PsicFlatEntry[]

// ─── Hierarchy maps ───────────────────────────────────────────────────────────

const sectionMap = new Map<string, PsicSection>()
const divisionMap = new Map<string, PsicDivision>()
const groupMap = new Map<string, PsicGroup>()
const classMap = new Map<string, PsicClass>()
const subclassMap = new Map<string, PsicSubclass>()

const divisionToSection = new Map<string, string>()
const groupToDivision = new Map<string, string>()
const classToGroup = new Map<string, string>()
const subclassToClass = new Map<string, string>()

for (const section of dataset.sections) {
  sectionMap.set(section.code, section)

  for (const division of section.divisions) {
    divisionMap.set(division.code, division)
    divisionToSection.set(division.code, section.code)

    for (const group of division.groups) {
      groupMap.set(group.code, group)
      groupToDivision.set(group.code, division.code)

      for (const cls of group.classes) {
        classMap.set(cls.code, cls)
        classToGroup.set(cls.code, group.code)

        for (const subclass of cls.subclasses) {
          subclassMap.set(subclass.code, subclass)
          subclassToClass.set(subclass.code, cls.code)
        }
      }
    }
  }
}

// ─── Flat entry maps (O(1) path lookups) ─────────────────────────────────────

const flatBySection = new Map<string, PsicFlatEntry>()
const flatByDivision = new Map<string, PsicFlatEntry>()
const flatByGroup = new Map<string, PsicFlatEntry>()
const flatByClass = new Map<string, PsicFlatEntry>()
const flatBySubclass = new Map<string, PsicFlatEntry>()

for (const entry of flatEntries) {
  if (!flatBySection.has(entry.section_code)) flatBySection.set(entry.section_code, entry)
  if (!flatByDivision.has(entry.division_code)) flatByDivision.set(entry.division_code, entry)
  if (!flatByGroup.has(entry.group_code)) flatByGroup.set(entry.group_code, entry)
  if (!flatByClass.has(entry.class_code)) flatByClass.set(entry.class_code, entry)
  flatBySubclass.set(entry.subclass_code, entry)
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0
}

function normalize(value: string): string {
  return value.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ')
}

function clampLimit(limit: unknown): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) return DEFAULT_RESULT_LIMIT
  return Math.min(Math.floor(limit), PSIC_MAX_RESULT_LIMIT)
}

function makePathFromFlatEntry(entry: PsicFlatEntry): PsicPath {
  return {
    section: { code: entry.section_code, title: entry.section_name },
    division: { code: entry.division_code, title: entry.division_name },
    group: { code: entry.group_code, title: entry.group_name },
    class: { code: entry.class_code, title: entry.class_name },
    subclass: { code: entry.subclass_code, title: entry.subclass_name },
  }
}

function findFlatByCode(code: string): PsicFlatEntry | undefined {
  if (code.length === 1) return flatBySection.get(code)
  if (code.length === 2) return flatByDivision.get(code)
  if (code.length === 3) return flatByGroup.get(code)
  if (code.length === 4) return flatByClass.get(code)
  if (code.length === 5) return flatBySubclass.get(code)
  return undefined
}

function detectLevel(code: string): PsicCodeLevel | null {
  if (/^[A-U]$/.test(code)) return 'section'
  if (/^\d{2}$/.test(code)) return 'division'
  if (/^\d{3}$/.test(code)) return 'group'
  if (/^\d{4}$/.test(code)) return 'class'
  if (/^\d{5}$/.test(code)) return 'subclass'
  return null
}

function nodeFrom(level: PsicCodeLevel, code: string, title: string, parentCode?: string): PsicNode {
  return { code, title, level, parentCode }
}

// ─── Fuzzy search (Sørensen–Dice bigram coefficient) ─────────────────────────

function bigramScore(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return a.startsWith(b) || b.startsWith(a) ? 0.5 : 0

  const bigrams = new Map<string, number>()
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2)
    bigrams.set(bg, (bigrams.get(bg) ?? 0) + 1)
  }

  let matches = 0
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2)
    const count = bigrams.get(bg) ?? 0
    if (count > 0) {
      matches++
      bigrams.set(bg, count - 1)
    }
  }

  return (2.0 * matches) / (a.length - 1 + b.length - 1)
}

const FUZZY_THRESHOLD = 0.3

// ─── Public dataset accessors ─────────────────────────────────────────────────

export function getDataset() {
  return dataset
}

export function getFlatEntries(): PsicFlatEntry[] {
  return flatEntries
}

export function getCounts() {
  return dataset.counts
}

export function getSource() {
  return dataset.source
}

// ─── Hierarchy getters ────────────────────────────────────────────────────────

export function getSections(): PsicSection[] {
  return dataset.sections
}

export function getSection(code: string): PsicSection | undefined {
  return sectionMap.get(code)
}

export function getDivisions(sectionCode?: string): PsicDivision[] {
  if (!sectionCode) return Array.from(divisionMap.values())
  return sectionMap.get(sectionCode)?.divisions ?? []
}

export function getDivision(code: string): PsicDivision | undefined {
  return divisionMap.get(code)
}

export function getGroups(divisionCode?: string): PsicGroup[] {
  if (!divisionCode) return Array.from(groupMap.values())
  return divisionMap.get(divisionCode)?.groups ?? []
}

export function getGroup(code: string): PsicGroup | undefined {
  return groupMap.get(code)
}

export function getClasses(groupCode?: string): PsicClass[] {
  if (!groupCode) return Array.from(classMap.values())
  return groupMap.get(groupCode)?.classes ?? []
}

export function getClass(code: string): PsicClass | undefined {
  return classMap.get(code)
}

export function getSubclasses(classCode?: string): PsicSubclass[] {
  if (!classCode) return Array.from(subclassMap.values())
  return classMap.get(classCode)?.subclasses ?? []
}

export function getSubclass(code: string): PsicSubclass | undefined {
  return subclassMap.get(code)
}

export function getChildren(code: string): Array<PsicSection | PsicDivision | PsicGroup | PsicClass | PsicSubclass> {
  const level = detectLevel(code)
  if (level === 'section') return getDivisions(code)
  if (level === 'division') return getGroups(code)
  if (level === 'group') return getClasses(code)
  if (level === 'class') return getSubclasses(code)
  return []
}

// ─── Path resolution ──────────────────────────────────────────────────────────

export function getPath(code: string): PsicPath | null {
  const entry = findFlatByCode(code)
  if (!entry) return null

  const basePath = makePathFromFlatEntry(entry)
  const level = detectLevel(code)
  if (level === 'section') return { section: basePath.section }
  if (level === 'division') return { section: basePath.section, division: basePath.division }
  if (level === 'group') return { section: basePath.section, division: basePath.division, group: basePath.group }
  if (level === 'class') return { section: basePath.section, division: basePath.division, group: basePath.group, class: basePath.class }
  if (level === 'subclass') return basePath
  return null
}

// ─── Node lookup ──────────────────────────────────────────────────────────────

export function getNode(code: string): PsicNode | null {
  const level = detectLevel(code)
  if (!level) return null

  if (level === 'section') {
    const item = getSection(code)
    return item ? nodeFrom(level, item.code, item.title) : null
  }
  if (level === 'division') {
    const item = getDivision(code)
    return item ? nodeFrom(level, item.code, item.title, divisionToSection.get(code)) : null
  }
  if (level === 'group') {
    const item = getGroup(code)
    return item ? nodeFrom(level, item.code, item.title, groupToDivision.get(code)) : null
  }
  if (level === 'class') {
    const item = getClass(code)
    return item ? nodeFrom(level, item.code, item.title, classToGroup.get(code)) : null
  }
  const item = getSubclass(code)
  return item ? nodeFrom(level, item.code, item.title, subclassToClass.get(code)) : null
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function search(query: string, options: SearchOptions = {}): SearchResult[] {
  if (typeof query !== 'string') return []
  if (query.length > PSIC_MAX_QUERY_LENGTH) return []

  const normalized = normalize(query)
  if (!normalized) return []

  const levels = new Set(options.levels ?? ['section', 'division', 'group', 'class', 'subclass'])
  const exact = options.exact ?? false
  const startsWith = options.startsWith ?? false
  const fuzzy = options.fuzzy ?? false
  const limit = clampLimit(options.limit)

  const results: SearchResult[] = []

  const attachPath = (node: PsicNode): SearchResult => ({
    ...node,
    ...(options.includePath ? { path: getPath(node.code) ?? undefined } : {}),
  })

  if (fuzzy) {
    if (normalized.length < MIN_FUZZY_LENGTH) return []

    const score = (title: string, code: string): number => {
      const normTitle = normalize(title)
      const wordMax = Math.max(...normTitle.split(/\s+/).map(w => bigramScore(normalized, w)))
      const scoreTitle = Math.max(bigramScore(normalized, normTitle), wordMax)
      const scoreCode = bigramScore(normalized, normalize(code))
      return Math.max(scoreTitle, scoreCode)
    }

    for (const section of dataset.sections) {
      if (levels.has('section')) {
        const s = score(section.title, section.code)
        if (s >= FUZZY_THRESHOLD) results.push({ ...attachPath(nodeFrom('section', section.code, section.title)), score: s })
      }
      for (const division of section.divisions) {
        if (levels.has('division')) {
          const s = score(division.title, division.code)
          if (s >= FUZZY_THRESHOLD) results.push({ ...attachPath(nodeFrom('division', division.code, division.title, section.code)), score: s })
        }
        for (const group of division.groups) {
          if (levels.has('group')) {
            const s = score(group.title, group.code)
            if (s >= FUZZY_THRESHOLD) results.push({ ...attachPath(nodeFrom('group', group.code, group.title, division.code)), score: s })
          }
          for (const cls of group.classes) {
            if (levels.has('class')) {
              const s = score(cls.title, cls.code)
              if (s >= FUZZY_THRESHOLD) results.push({ ...attachPath(nodeFrom('class', cls.code, cls.title, group.code)), score: s })
            }
            for (const subclass of cls.subclasses) {
              if (levels.has('subclass')) {
                const s = score(subclass.title, subclass.code)
                if (s >= FUZZY_THRESHOLD) results.push({ ...attachPath(nodeFrom('subclass', subclass.code, subclass.title, cls.code)), score: s })
              }
            }
          }
        }
      }
    }

    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    return results.slice(0, limit)
  }

  const matches = (title: string, code: string): boolean => {
    const hayTitle = normalize(title)
    const hayCode = normalize(code)
    if (exact) return hayTitle === normalized || hayCode === normalized
    if (startsWith) return hayTitle.startsWith(normalized) || hayCode.startsWith(normalized)
    return hayTitle.includes(normalized) || hayCode.includes(normalized)
  }

  for (const section of dataset.sections) {
    if (levels.has('section') && matches(section.title, section.code)) {
      results.push(attachPath(nodeFrom('section', section.code, section.title)))
      if (results.length >= limit) return results
    }
    for (const division of section.divisions) {
      if (levels.has('division') && matches(division.title, division.code)) {
        results.push(attachPath(nodeFrom('division', division.code, division.title, section.code)))
        if (results.length >= limit) return results
      }
      for (const group of division.groups) {
        if (levels.has('group') && matches(group.title, group.code)) {
          results.push(attachPath(nodeFrom('group', group.code, group.title, division.code)))
          if (results.length >= limit) return results
        }
        for (const cls of group.classes) {
          if (levels.has('class') && matches(cls.title, cls.code)) {
            results.push(attachPath(nodeFrom('class', cls.code, cls.title, group.code)))
            if (results.length >= limit) return results
          }
          for (const subclass of cls.subclasses) {
            if (levels.has('subclass') && matches(subclass.title, subclass.code)) {
              results.push(attachPath(nodeFrom('subclass', subclass.code, subclass.title, cls.code)))
              if (results.length >= limit) return results
            }
          }
        }
      }
    }
  }

  return results
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidCode(code: unknown): boolean {
  if (!isNonEmptyString(code)) return false
  if (code.length > 5) return false
  return getNode(code) !== null
}

export function validatePsicCode(code: unknown): PsicCodeValidation {
  if (!isNonEmptyString(code)) return { valid: false, level: null, message: 'Code must be a non-empty string' }
  if (code.length > 5) return { valid: false, level: null, message: 'PSIC codes are at most 5 characters' }
  const level = detectLevel(code)
  if (!level) return { valid: false, level: null, message: 'Invalid PSIC code format' }
  const node = getNode(code)
  if (!node) return { valid: false, level, message: 'Code not found in dataset' }
  return { valid: true, level }
}

/**
 * Hardened search wrapper that accepts unknown input and enforces all safety limits.
 * Prefer this over `search()` when the query originates from untrusted or untyped sources.
 */
export function safeSearch(query: unknown, options: SearchOptions = {}): SearchResult[] {
  if (!isNonEmptyString(query)) return []
  if (query.length > PSIC_MAX_QUERY_LENGTH) return []
  return search(query, options)
}
