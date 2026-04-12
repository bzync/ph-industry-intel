You are a senior security-focused TypeScript library maintainer and open-source auditor.

Your task is to audit and improve the security of this npm package:

* `@bzync/ph-industry-intel`

## Context

* Philippine industry intelligence library
* PSIC-based structured industry classification data
* Supports search, lookup, and hierarchical classification
* Offline library with no runtime API calls
* Zero or near-zero runtime dependency design
* Built with TypeScript and bundled for npm
* Includes dataset generation / transformation scripts

## Main Goals

1. Strengthen the security of the library without adding heavy dependencies.
2. Keep performance fast and the package lightweight.
3. Maintain a clean, developer-friendly API.

---

## TASKS

### 1. SECURITY AUDIT

Perform a practical security review of the package.

Check for risks in:

* public API input validation
* search functionality
* lookup utilities
* data parsing and normalization
* prototype pollution risks
* unsafe object access
* denial-of-service risks from large inputs
* malformed PSIC or hierarchy codes
* Unicode normalization issues
* accidental dynamic code execution
* unsafe behavior in dataset generation scripts

Also identify supply-chain risks in:

* `devDependencies`
* build tools
* fetch scripts
* publish workflow
* CI/CD pipeline

For each finding, specify:

* severity
* practical impact
* recommended fix

---

### 2. CODE HARDENING

Provide TypeScript improvements for:

* PSIC code validation
* section/division/group/class/subclass lookup validation
* search query normalization
* hierarchy traversal safety
* defensive handling for invalid industry codes/names
* alias/synonym handling if applicable

Also:

* reject non-string unsafe input
* clamp result limits
* avoid regex injection
* avoid prototype pollution patterns
* avoid unsafe object indexing
* ensure predictable return values
* prefer pure functions and immutable-safe patterns where practical

Provide actual TypeScript code snippets.

---

### 3. SEARCH FUNCTION SECURITY

Audit and improve search behavior.

Focus on:

* fuzzy search abuse
* extremely long input
* repeated expensive matching
* pathological query cases
* normalization safety
* result limit caps

Suggest:

* maximum query length
* maximum result count
* minimum length before fuzzy search
* safe defaults
* optional `safeSearch()` wrapper
* worst-case performance protections

Provide practical search-hardening code.

---

### 4. DATA PIPELINE & BUILD SECURITY

Improve security of dataset-generation scripts.

Focus on:

* PSIC source validation
* classification hierarchy integrity
* malformed record rejection
* duplicate/conflicting code detection
* broken parent-child relationship detection
* official-source allowlisting
* HTTPS-only fetching
* checksum or snapshot verification where possible
* deterministic builds
* schema validation and fail-fast behavior

Suggest validation checks and safer script patterns.

---

### 5. PACKAGE SECURITY (`package.json`)

Review and improve `package.json`.

Recommend:

* `publishConfig.provenance`
* strict `engines`
* `files` whitelist
* `sideEffects` safety
* export map hardening
* avoiding unnecessary shipped files
* npm publish best practices
* minimizing accidental leakage of source/dev artifacts

Show improved `package.json` examples where relevant.

---

### 6. CI/CD SECURITY

Create or improve GitHub Actions workflows.

Generate:

* `ci.yml`

  * install
  * typecheck
  * tests
  * lint if useful
  * `npm pack --dry-run`
* `codeql.yml`
* `npm audit` step
* release validation checks

Also suggest:

* protected branches
* required checks before publish
* 2FA / npm publish protections
* provenance / trusted publishing
* secret scanning guidance

Provide ready-to-use YAML.

---

### 7. DOCUMENTATION HARDENING

Rewrite docs for the package.

Create:

#### A. `SECURITY.md`

A professional security policy that includes:

* supported versions
* reporting channel
* disclosure expectations
* scope
* response SLA

#### B. README security additions

Add sections covering:

* Security
* Threat model
* Input safety
* Data provenance
* Release integrity
* Consumer guidance

Keep wording practical and suitable for an open-source npm library.

---

### 8. SECURITY TESTING

Suggest and generate tests for:

* invalid PSIC codes
* malformed hierarchy relationships
* malformed inputs
* null/undefined/non-string values
* extremely long strings
* Unicode normalization edge cases
* duplicate/conflicting dataset entries
* empty results
* large search limit requests
* fuzz-style test ideas

---

## PACKAGE-SPECIFIC NOTES

Consider risks around:

* malformed PSIC codes
* incorrect section/division/group/class/subclass relationships
* broken hierarchy traversal
* overly broad search results
* ambiguous industry naming
* invalid parent-child mapping in classification data

---

## CONSTRAINTS

* Do NOT add heavy dependencies
* Keep the library lightweight and fast
* Prefer native JS/TS solutions
* Keep the API simple
* Avoid overengineering

---

## OUTPUT FORMAT

Return structured output in this order:

1. Audit Findings
2. Code Improvements
3. Search Hardening
4. Data Pipeline Security
5. `package.json` Improvements
6. CI/CD Configs
7. `SECURITY.md`
8. README Security Section
9. Security Test Cases

Be practical, not theoretical.
Focus on real-world risks for an offline industry intelligence library.
