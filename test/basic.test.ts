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
  search,
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
})
