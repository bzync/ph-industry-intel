import { describe, expect, it } from 'vitest'
import {
  getClass,
  getClasses,
  getChildren,
  getCounts,
  getDataset,
  getDivision,
  getDivisions,
  getFlatEntries,
  getGroup,
  getGroups,
  getNode,
  getPath,
  getSection,
  getSections,
  getSource,
  getSubclass,
  getSubclasses,
  isValidCode,
  PSIC_MAX_QUERY_LENGTH,
  PSIC_MAX_RESULT_LIMIT,
  safeSearch,
  search,
  validatePsicCode,
} from '../src/index'

describe('@bzync/ph-industry-intel', () => {
  // ─── Dataset accessors ────────────────────────────────────────────────────

  it('returns known counts', () => {
    expect(getCounts().sections).toBe(21)
    expect(getCounts().divisions).toBe(88)
    expect(getCounts().groups).toBeGreaterThan(0)
    expect(getCounts().classes).toBeGreaterThan(0)
    expect(getCounts().subclasses).toBeGreaterThan(0)
  })

  it('returns flat entries', () => {
    const entries = getFlatEntries()
    expect(entries.length).toBeGreaterThan(0)
    expect(entries[0]).toHaveProperty('section_code')
    expect(entries[0]).toHaveProperty('subclass_code')
  })

  it('returns the full dataset', () => {
    const ds = getDataset()
    expect(ds.sections.length).toBe(21)
    expect(ds.source).toBeDefined()
    expect(ds.counts).toBeDefined()
  })

  it('returns the data source metadata', () => {
    const src = getSource()
    expect(src.name).toBeTruthy()
    expect(src.publisher).toBeTruthy()
  })

  // ─── Section ──────────────────────────────────────────────────────────────

  it('getSections returns all 21 sections', () => {
    expect(getSections().length).toBe(21)
  })

  it('getSection finds by code', () => {
    expect(getSection('J')?.title).toContain('INFORMATION AND COMMUNICATION')
    expect(getSection('A')?.title).toContain('AGRICULTURE')
    expect(getSection('Z')).toBeUndefined()
  })

  // ─── Division ─────────────────────────────────────────────────────────────

  it('getDivisions without arg returns all divisions', () => {
    expect(getDivisions().length).toBe(88)
  })

  it('getDivisions scoped to section', () => {
    const divs = getDivisions('J')
    expect(divs.length).toBeGreaterThan(0)
    divs.forEach((d) => expect(d.code).toMatch(/^\d{2}$/))
  })

  it('getDivision finds by code', () => {
    expect(getDivision('62')?.title).toContain('COMPUTER PROGRAMMING')
    expect(getDivision('00')).toBeUndefined()
  })

  // ─── Group ────────────────────────────────────────────────────────────────

  it('getGroups without arg returns all groups', () => {
    expect(getGroups().length).toBeGreaterThan(0)
  })

  it('getGroups scoped to division', () => {
    const groups = getGroups('62')
    expect(groups.length).toBeGreaterThan(0)
    groups.forEach((g) => expect(g.code).toMatch(/^\d{3}$/))
  })

  it('getGroup finds by code', () => {
    expect(getGroup('620')?.title).toBeTruthy()
    expect(getGroup('999')).toBeUndefined()
  })

  // ─── Class ────────────────────────────────────────────────────────────────

  it('getClasses without arg returns all classes', () => {
    expect(getClasses().length).toBeGreaterThan(0)
  })

  it('getClasses scoped to group', () => {
    const classes = getClasses('620')
    expect(classes.length).toBeGreaterThan(0)
    classes.forEach((c) => expect(c.code).toMatch(/^\d{4}$/))
  })

  it('getClass finds by code', () => {
    expect(getClass('6201')?.title).toContain('Computer programming')
    expect(getClass('9999')).toBeUndefined()
  })

  // ─── Subclass ─────────────────────────────────────────────────────────────

  it('getSubclasses without arg returns all subclasses', () => {
    expect(getSubclasses().length).toBeGreaterThan(0)
  })

  it('getSubclasses scoped to class', () => {
    const subs = getSubclasses('6201')
    expect(subs.length).toBeGreaterThan(0)
    subs.forEach((s) => expect(s.code).toMatch(/^\d{5}$/))
  })

  it('getSubclass finds by code', () => {
    expect(getSubclass('62011')?.title).toBeTruthy()
    expect(getSubclass('99999')).toBeUndefined()
  })

  // ─── Children ─────────────────────────────────────────────────────────────

  it('getChildren returns divisions for a section', () => {
    const children = getChildren('J')
    expect(children.length).toBeGreaterThan(0)
    expect((children[0] as { code: string }).code).toMatch(/^\d{2}$/)
  })

  it('getChildren returns groups for a division', () => {
    const children = getChildren('62')
    expect(children.length).toBeGreaterThan(0)
  })

  it('getChildren returns subclasses for a class', () => {
    const children = getChildren('6201')
    expect(children.length).toBeGreaterThan(0)
  })

  it('getChildren returns empty array for a subclass', () => {
    expect(getChildren('62011')).toEqual([])
  })

  // ─── getNode ──────────────────────────────────────────────────────────────

  it('getNode returns section node', () => {
    const node = getNode('J')
    expect(node?.level).toBe('section')
    expect(node?.parentCode).toBeUndefined()
  })

  it('getNode returns division node with parentCode', () => {
    const node = getNode('62')
    expect(node?.level).toBe('division')
    expect(node?.parentCode).toBe('J')
  })

  it('getNode returns group node with parentCode', () => {
    const node = getNode('620')
    expect(node?.level).toBe('group')
    expect(node?.parentCode).toBe('62')
  })

  it('getNode returns class node with parentCode', () => {
    const node = getNode('6201')
    expect(node?.level).toBe('class')
    expect(node?.parentCode).toBe('620')
  })

  it('getNode returns subclass node with parentCode', () => {
    const node = getNode('62011')
    expect(node?.level).toBe('subclass')
    expect(node?.parentCode).toBe('6201')
  })

  it('getNode returns null for unknown codes', () => {
    expect(getNode('ZZ')).toBeNull()
    expect(getNode('99999')).toBeNull()
    expect(getNode('')).toBeNull()
  })

  // ─── getPath ──────────────────────────────────────────────────────────────

  it('resolves a full path from subclass code', () => {
    const path = getPath('62011')
    expect(path?.section.code).toBe('J')
    expect(path?.division?.code).toBe('62')
    expect(path?.group?.code).toBe('620')
    expect(path?.class?.code).toBe('6201')
    expect(path?.subclass?.code).toBe('62011')
  })

  it('getPath for section only has section', () => {
    const path = getPath('J')
    expect(path?.section.code).toBe('J')
    expect(path?.division).toBeUndefined()
  })

  it('getPath for division has section and division', () => {
    const path = getPath('62')
    expect(path?.section.code).toBe('J')
    expect(path?.division?.code).toBe('62')
    expect(path?.group).toBeUndefined()
  })

  it('getPath returns null for invalid code', () => {
    expect(getPath('99999')).toBeNull()
    expect(getPath('ZZ')).toBeNull()
  })

  // ─── Validation ───────────────────────────────────────────────────────────

  it('isValidCode works for all levels', () => {
    expect(isValidCode('A')).toBe(true)
    expect(isValidCode('01')).toBe(true)
    expect(isValidCode('011')).toBe(true)
    expect(isValidCode('0111')).toBe(true)
    expect(isValidCode('62011')).toBe(true)
  })

  it('isValidCode rejects unknown codes', () => {
    expect(isValidCode('Z')).toBe(false)
    expect(isValidCode('00')).toBe(false)
    expect(isValidCode('00000')).toBe(false)
    expect(isValidCode('')).toBe(false)
  })

  // ─── Search ───────────────────────────────────────────────────────────────

  it('searches by title (substring)', () => {
    const results = search('software', { levels: ['class', 'subclass'], limit: 10 })
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(['class', 'subclass']).toContain(r.level))
  })

  it('search with exact:true matches exact title or code', () => {
    const byCode = search('J', { exact: true })
    expect(byCode.some((r) => r.code === 'J')).toBe(true)
  })

  it('search with startsWith:true matches prefix', () => {
    const results = search('computer', { startsWith: true })
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(r.title.toLowerCase()).toMatch(/^computer/))
  })

  it('search returns paths when includePath is set', () => {
    const results = search('62011', { exact: true, includePath: true })
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]?.path).toBeDefined()
    expect(results[0]?.path?.section.code).toBe('J')
  })

  it('search with empty query returns empty array', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })

  it('search respects limit', () => {
    const results = search('a', { limit: 3 })
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('fuzzy search returns ranked results', () => {
    const results = search('computr', { fuzzy: true, levels: ['division', 'group', 'class'] })
    expect(results.length).toBeGreaterThan(0)
    results.forEach((r) => expect(r.score).toBeGreaterThan(0))
    for (let i = 1; i < results.length; i++) {
      expect((results[i - 1]?.score ?? 0)).toBeGreaterThanOrEqual(results[i]?.score ?? 0)
    }
  })

  it('fuzzy search scores are all above internal threshold', () => {
    const results = search('xyzxyzxyzxyz', { fuzzy: true })
    // any matches that do come back should have a non-trivial score
    results.forEach((r) => expect(r.score).toBeGreaterThan(0))
  })

  // ─── Security: search hardening ───────────────────────────────────────────

  it('search rejects query exceeding MAX_QUERY_LENGTH', () => {
    const long = 'a'.repeat(PSIC_MAX_QUERY_LENGTH + 1)
    expect(search(long)).toEqual([])
  })

  it('search clamps limit to PSIC_MAX_RESULT_LIMIT', () => {
    const results = search('a', { limit: 999999 })
    expect(results.length).toBeLessThanOrEqual(PSIC_MAX_RESULT_LIMIT)
  })

  it('search treats non-finite limit as default', () => {
    const withInfinity = search('a', { limit: Infinity })
    const withNaN = search('a', { limit: NaN })
    expect(withInfinity.length).toBeLessThanOrEqual(PSIC_MAX_RESULT_LIMIT)
    expect(withNaN.length).toBeLessThanOrEqual(PSIC_MAX_RESULT_LIMIT)
  })

  it('search treats negative limit as default', () => {
    const results = search('a', { limit: -1 })
    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(PSIC_MAX_RESULT_LIMIT)
  })

  it('search handles regex special characters safely', () => {
    const specials = ['.*+?^${}()|[]\\', '(unclosed', '[invalid', '^$.*?+']
    for (const q of specials) {
      expect(() => search(q)).not.toThrow()
    }
  })

  it('search handles Unicode combining marks and non-NFC strings', () => {
    // NFC: é (U+00E9) vs NFD: e + combining accent (U+0065 U+0301)
    const nfd = 'e\u0301'
    expect(() => search(nfd)).not.toThrow()
    expect(Array.isArray(search(nfd))).toBe(true)
  })

  it('fuzzy search returns empty for single-char query (below MIN_FUZZY_LENGTH)', () => {
    const results = search('a', { fuzzy: true })
    expect(results).toEqual([])
  })

  it('search returns empty array for non-string input via safeSearch', () => {
    expect(safeSearch(null)).toEqual([])
    expect(safeSearch(undefined)).toEqual([])
    expect(safeSearch(123)).toEqual([])
    expect(safeSearch([])).toEqual([])
    expect(safeSearch({})).toEqual([])
    expect(safeSearch(true)).toEqual([])
  })

  it('safeSearch rejects query exceeding MAX_QUERY_LENGTH', () => {
    const long = 'x'.repeat(PSIC_MAX_QUERY_LENGTH + 1)
    expect(safeSearch(long)).toEqual([])
  })

  it('safeSearch returns results for valid input', () => {
    const results = safeSearch('software', { levels: ['subclass'], limit: 5 })
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  // ─── Security: isValidCode hardening ──────────────────────────────────────

  it('isValidCode rejects non-string inputs', () => {
    expect(isValidCode(null as unknown as string)).toBe(false)
    expect(isValidCode(undefined as unknown as string)).toBe(false)
    expect(isValidCode(62011 as unknown as string)).toBe(false)
    expect(isValidCode({} as unknown as string)).toBe(false)
    expect(isValidCode([] as unknown as string)).toBe(false)
  })

  it('isValidCode rejects strings longer than 5 chars', () => {
    expect(isValidCode('620111')).toBe(false)
    expect(isValidCode('A'.repeat(100))).toBe(false)
  })

  it('isValidCode rejects prototype pollution patterns', () => {
    expect(isValidCode('__proto__')).toBe(false)
    expect(isValidCode('constructor')).toBe(false)
    expect(isValidCode('toString')).toBe(false)
  })

  // ─── Security: validatePsicCode ───────────────────────────────────────────

  it('validatePsicCode returns valid:true for known codes at all levels', () => {
    expect(validatePsicCode('A').valid).toBe(true)
    expect(validatePsicCode('62').valid).toBe(true)
    expect(validatePsicCode('620').valid).toBe(true)
    expect(validatePsicCode('6201').valid).toBe(true)
    expect(validatePsicCode('62011').valid).toBe(true)
  })

  it('validatePsicCode returns correct level', () => {
    expect(validatePsicCode('A').level).toBe('section')
    expect(validatePsicCode('62').level).toBe('division')
    expect(validatePsicCode('620').level).toBe('group')
    expect(validatePsicCode('6201').level).toBe('class')
    expect(validatePsicCode('62011').level).toBe('subclass')
  })

  it('validatePsicCode rejects non-string inputs with message', () => {
    const r = validatePsicCode(null)
    expect(r.valid).toBe(false)
    expect(r.level).toBeNull()
    expect(r.message).toBeTruthy()
  })

  it('validatePsicCode rejects oversized codes', () => {
    const r = validatePsicCode('620111')
    expect(r.valid).toBe(false)
    expect(r.message).toBeTruthy()
  })

  it('validatePsicCode rejects malformed code patterns', () => {
    expect(validatePsicCode('AB').valid).toBe(false)    // two letters
    expect(validatePsicCode('6201A').valid).toBe(false) // alpha in numeric
    expect(validatePsicCode('1').valid).toBe(false)     // single digit (not a section letter)
    expect(validatePsicCode('!@#').valid).toBe(false)   // special chars
  })

  it('validatePsicCode returns level for format-valid but unknown codes', () => {
    const r = validatePsicCode('99999')
    expect(r.valid).toBe(false)
    expect(r.level).toBe('subclass') // format matched, not in dataset
    expect(r.message).toBeTruthy()
  })

  // ─── Security: getNode / getPath hardening ────────────────────────────────

  it('getNode returns null for empty string', () => {
    expect(getNode('')).toBeNull()
  })

  it('getNode returns null for strings longer than 5 chars', () => {
    expect(getNode('ABCDEF')).toBeNull()
    expect(getNode('123456')).toBeNull()
  })

  it('getPath returns null for invalid / empty codes', () => {
    expect(getPath('')).toBeNull()
    expect(getPath('999999')).toBeNull()
    expect(getPath('!!')).toBeNull()
  })

  // ─── Security: dataset integrity ──────────────────────────────────────────

  it('all flat entries have non-empty codes and names', () => {
    const entries = getFlatEntries()
    for (const entry of entries) {
      expect(entry.section_code).toBeTruthy()
      expect(entry.division_code).toBeTruthy()
      expect(entry.group_code).toBeTruthy()
      expect(entry.class_code).toBeTruthy()
      expect(entry.subclass_code).toBeTruthy()
      expect(entry.section_name).toBeTruthy()
      expect(entry.subclass_name).toBeTruthy()
    }
  })

  it('dataset has no duplicate subclass codes', () => {
    const codes = getFlatEntries().map((e) => e.subclass_code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('all hierarchy codes match expected format patterns', () => {
    for (const section of getDataset().sections) {
      expect(section.code).toMatch(/^[A-U]$/)
      for (const division of section.divisions) {
        expect(division.code).toMatch(/^\d{2}$/)
        for (const group of division.groups) {
          expect(group.code).toMatch(/^\d{3}$/)
          for (const cls of group.classes) {
            expect(cls.code).toMatch(/^\d{4}$/)
            for (const sub of cls.subclasses) {
              expect(sub.code).toMatch(/^\d{5}$/)
            }
          }
        }
      }
    }
  })

  it('all subclass parent-child relationships are consistent', () => {
    for (const section of getDataset().sections) {
      for (const division of section.divisions) {
        for (const group of division.groups) {
          for (const cls of group.classes) {
            for (const sub of cls.subclasses) {
              expect(sub.code.startsWith(cls.code)).toBe(true)
            }
            expect(cls.code.startsWith(group.code)).toBe(true)
          }
          expect(group.code.startsWith(division.code)).toBe(true)
        }
      }
    }
  })

  // ─── Security: constants are exported ────────────────────────────────────

  it('PSIC_MAX_QUERY_LENGTH is a positive integer', () => {
    expect(typeof PSIC_MAX_QUERY_LENGTH).toBe('number')
    expect(PSIC_MAX_QUERY_LENGTH).toBeGreaterThan(0)
    expect(Number.isInteger(PSIC_MAX_QUERY_LENGTH)).toBe(true)
  })

  it('PSIC_MAX_RESULT_LIMIT is a positive integer', () => {
    expect(typeof PSIC_MAX_RESULT_LIMIT).toBe('number')
    expect(PSIC_MAX_RESULT_LIMIT).toBeGreaterThan(0)
    expect(Number.isInteger(PSIC_MAX_RESULT_LIMIT)).toBe(true)
  })
})
