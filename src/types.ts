export type PsicCodeLevel = 'section' | 'division' | 'group' | 'class' | 'subclass'

export interface PsicSubclass {
  code: string
  title: string
}

export interface PsicClass {
  code: string
  title: string
  subclasses: PsicSubclass[]
}

export interface PsicGroup {
  code: string
  title: string
  classes: PsicClass[]
}

export interface PsicDivision {
  code: string
  title: string
  groups: PsicGroup[]
}

export interface PsicSection {
  code: string
  title: string
  divisions: PsicDivision[]
}

export interface PsicCounts {
  sections: number
  divisions: number
  groups: number
  classes: number
  subclasses: number
}

export interface PsicSource {
  name: string
  publisher: string
  mirror?: string
  published?: string
  edition?: string
  description?: string
}

export interface PsicDataset {
  source: PsicSource
  counts: PsicCounts
  sections: PsicSection[]
}

export interface PsicFlatEntry {
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

export interface PsicPath {
  section: { code: string; title: string }
  division?: { code: string; title: string }
  group?: { code: string; title: string }
  class?: { code: string; title: string }
  subclass?: { code: string; title: string }
}

export interface PsicNode {
  code: string
  title: string
  level: PsicCodeLevel
  parentCode?: string
}

export interface SearchOptions {
  levels?: PsicCodeLevel[]
  limit?: number
  exact?: boolean
  startsWith?: boolean
  fuzzy?: boolean
  includePath?: boolean
}

export interface SearchResult extends PsicNode {
  score?: number
  path?: PsicPath
}
