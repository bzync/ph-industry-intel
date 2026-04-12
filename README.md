# PH Industry Intel

> Framework-agnostic TypeScript library for Philippine industry lookup using the official PSIC hierarchy.

`@bzync/ph-industry-intel` helps you work with the Philippine Standard Industrial Classification in apps, forms, CRMs, onboarding flows, and back-office systems.

## Features
- Official PSIC hierarchy bundled locally
- Section → Division → Group → Class → Subclass traversal
- Code lookups for all PSIC levels
- Search by code or title
- Full path resolution from any valid code
- Zero runtime dependencies
- TypeScript-first API
- ESM + CJS support

## Installation

```bash
npm install @bzync/ph-industry-intel
```

```bash
yarn add @bzync/ph-industry-intel
pnpm add @bzync/ph-industry-intel
bun add @bzync/ph-industry-intel
```

## Quick Start

```ts
import {
  getSections,
  getDivisions,
  getGroups,
  getClasses,
  getSubclasses,
  getPath,
  getNode,
  search,
  isValidCode,
} from '@bzync/ph-industry-intel'

const sections = getSections()
const divisions = getDivisions('J')
const groups = getGroups('62')
const classes = getClasses('620')
const subclasses = getSubclasses('6201')

const node = getNode('62011')
const path = getPath('62011')
const hits = search('software', { levels: ['class', 'subclass'], includePath: true })
const valid = isValidCode('62011')
```

## API

### Hierarchy getters

```ts
getSections(): PsicSection[]
getDivisions(sectionCode?: string): PsicDivision[]
getGroups(divisionCode?: string): PsicGroup[]
getClasses(groupCode?: string): PsicClass[]
getSubclasses(classCode?: string): PsicSubclass[]
```

### Single-item lookups

```ts
getSection(code: string): PsicSection | undefined
getDivision(code: string): PsicDivision | undefined
getGroup(code: string): PsicGroup | undefined
getClass(code: string): PsicClass | undefined
getSubclass(code: string): PsicSubclass | undefined
getNode(code: string): PsicNode | null
```

### Path resolution

```ts
getPath(code: string): PsicPath | null
```

### Search

```ts
search(query: string, options?: SearchOptions): SearchResult[]
```

Supported search options:
- `levels`: filter by section, division, group, class, subclass
- `limit`: maximum number of results
- `exact`: exact code/title match
- `startsWith`: prefix matching
- `includePath`: attach the full PSIC path to each result

### Validation

```ts
isValidCode(code: string): boolean
```

### Raw dataset access

```ts
getDataset(): PsicDataset
getFlatEntries(): PsicFlatEntry[]
getCounts(): PsicCounts
getSource(): PsicSource
```

## Example output

```ts
getPath('62011')
```

```json
{
  "section": { "code": "J", "title": "INFORMATION AND COMMUNICATION" },
  "division": { "code": "62", "title": "COMPUTER PROGRAMMING, CONSULTANCY AND RELATED ACTIVITIES" },
  "group": { "code": "620", "title": "Computer programming, consultancy and related activities" },
  "class": { "code": "6201", "title": "Computer programming activities" },
  "subclass": { "code": "62011", "title": "Game design and development" }
}
```

## Intended use cases
- SaaS tenant onboarding
- Employer setup forms
- Business registration support
- Analytics segmentation
- Government-aligned master data
- Searchable industry pickers

## Data source
Bundled from the official PSIC hierarchy prepared from the PSA-issued 2019 updates to the 2009 PSIC.

---

## Security

### Threat model

`@bzync/ph-industry-intel` is a **static, offline library** with zero runtime dependencies and no network access. The attack surface at runtime is limited to:

- Public API input handling
- The integrity of the bundled JSON dataset

The library does **not**:
- Make network requests
- Execute dynamic code
- Access the filesystem at runtime
- Accept executable input

### Input safety

All public search and lookup functions validate inputs and enforce safety limits:

| Constant | Value | Purpose |
|---|---|---|
| `PSIC_MAX_QUERY_LENGTH` | 200 | Queries longer than this are rejected |
| `PSIC_MAX_RESULT_LIMIT` | 200 | Result counts are clamped to this ceiling |

For inputs from untrusted or untyped sources (e.g., user-submitted form data in plain JavaScript), prefer the hardened wrapper:

```ts
import { safeSearch, validatePsicCode } from '@bzync/ph-industry-intel'

// Accepts unknown type — safe to call with unvalidated input
const results = safeSearch(req.query.industry, { limit: 10 })

// Detailed validation with error message
const { valid, level, message } = validatePsicCode(req.body.psicCode)
if (!valid) throw new Error(message)
```

`search()` and `isValidCode()` also guard against non-string inputs, oversized strings, and uncapped limits.

### Data provenance

The bundled PSIC dataset is generated from the official PSA-issued Excel file (2019 updates to the 2009 PSIC). The transformation script (`scripts/prepare-psic-data.ts`) is committed to the repository. Dataset changes between versions are visible via git diff on `src/data/`.

### Release integrity

Published releases include **npm provenance attestations** linking each package version to the exact commit and CI workflow run that produced it. Verify with:

```bash
npm audit signatures
```

### Reporting vulnerabilities

Please report security issues privately. See [SECURITY.md](./SECURITY.md) for the full policy, scope, and response SLA.

---

## License
MIT
