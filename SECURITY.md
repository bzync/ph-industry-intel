# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

Only the latest patch release of the current minor version receives security fixes.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report security issues privately by emailing:

**rayanvegareynaldo@gmail.com**

Include in your report:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a minimal proof-of-concept
- Affected versions (if known)
- Any suggested mitigations

You will receive an acknowledgement within **72 hours**. A fix or resolution plan will be communicated within **14 days** of confirmation. We will coordinate disclosure timing with you before any public announcement.

## Scope

This library is an **offline, zero-runtime-dependency** TypeScript package. It performs no network requests at runtime. The attack surface is limited to:

- Input handling in public API functions (`search`, `safeSearch`, `isValidCode`, `validatePsicCode`, `getNode`, `getPath`, hierarchy getters)
- Bundled static JSON data integrity
- Build-time dataset generation scripts (`scripts/prepare-psic-data.ts`)
- npm publish pipeline and supply-chain integrity

**Out of scope:**
- Network-level attacks (the library makes no network requests at runtime)
- DoS attacks against the end application's infrastructure
- Vulnerabilities in applications that consume this library (those should be reported to the application maintainer)
- Issues in devDependencies that have no runtime impact and no exploit path through this library's build output

## Threat Model

`@bzync/ph-industry-intel` is a static data library. The primary security concerns are:

1. **Input-based DoS** — Malformed or excessively long queries passed to search functions could cause excessive CPU usage. The library enforces `PSIC_MAX_QUERY_LENGTH` and `PSIC_MAX_RESULT_LIMIT` to mitigate this.
2. **Data integrity** — The bundled PSIC dataset is generated from the official PSA source file at build time and committed to the repository. Dataset mutations between versions are visible via git diff.
3. **Supply-chain** — Dependencies are minimal (devDependencies only). npm provenance is enabled on published releases, allowing consumers to verify that a given package version was built by this repository's CI pipeline.
4. **Prototype pollution** — Public API functions use `Map` for lookups (not plain object indexing) and validate all inputs before use.

## Release Integrity

Published releases include npm provenance attestations. You can verify a release's build origin with:

```bash
npm audit signatures
```

## Disclosure Policy

We follow a **coordinated disclosure** model. We ask that you:

1. Report the issue privately as described above.
2. Allow up to 14 days for a fix to be prepared and released.
3. Coordinate the public disclosure date with us.

We will credit reporters in the changelog unless they prefer to remain anonymous.
