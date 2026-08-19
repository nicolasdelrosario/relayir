# public-release Specification

## Purpose
Define the public package, documentation, evidence, and release boundary for RelayIR.

## Requirements

### Requirement: Clear public identity
The repository SHALL present RelayIR in English as an experimental compact handoff
protocol and reproducible benchmark with the tagline `Less chatter. More signal.`

#### Scenario: First-time visitor
- **WHEN** a visitor opens the repository
- **THEN** the README explains the problem, shows H1, provides a quickstart, and
  distinguishes current functionality from roadmap work

### Requirement: Honest benchmark evidence
Every performance claim SHALL identify the sample size, model, metric, limitation,
and a committed redacted result that can be inspected without running a model. The
v0.3 evidence SHALL describe its 384 records, fixture/split/language/role balance,
contract/profile versions, provider-reported token categories, and descriptive scope.

#### Scenario: Headline metric
- **WHEN** historical smoke evidence is shown
- **THEN** its `n=1` caveat and reproducibility link appear next to it, separate from
  the current v0.3 evidence

#### Scenario: Neutral v0.3 headline
- **WHEN** the README summarizes the official benchmark
- **THEN** it identifies the 384-run matrix, links the report and raw JSONL, and
  does not present the historical n=1 smoke result as current evidence

### Requirement: Reusable open-source repository
The repository SHALL include an MIT license, descriptive package metadata, and CI
that runs without paid services or runtime dependencies.

#### Scenario: Fresh clone verification
- **WHEN** a contributor clones the repository with Node 24
- **THEN** `npm test` and `npm run benchmark:fake` run without dependency installation

#### Scenario: Installed package exports
- **WHEN** a Node 24 user installs the published package
- **THEN** `relayir` and `relayir/server` resolve to executable JavaScript without a TypeScript loader

### Requirement: Clean published tree
The committed tree SHALL exclude runtime results, temporary files, node_modules,
credentials, machine-specific paths, and generated OpenSpec host scaffolding that is
not required by RelayIR.

#### Scenario: Initial commit review
- **WHEN** the release tree is staged
- **THEN** only source, tests, protocol docs, benchmark evidence, OpenSpec artifacts,
  CI, metadata, and the RelayIR benchmark agent are included

### Requirement: v0.3 evidence package
The published package SHALL include the v0.3 Markdown report, redacted JSONL evidence,
and compact-results script while preserving zero runtime dependencies and package
exports.

#### Scenario: Inspectable evidence
- **WHEN** a user runs `npm pack --dry-run`
- **THEN** the v0.3 report, JSONL, and `scripts/compact-results.ts` are listed

### Requirement: v0.3.1 harness boundary
The repository SHALL include the agentic benchmark harness, four versioned task fixtures, deterministic
report/gate code, and OpenSpec evidence for v0.3.1. The published package SHALL include all 96
redacted attempts and the deterministic FREEZE_AND_PIVOT report.

#### Scenario: Pre-run verification
- **WHEN** a contributor performs the official verification
- **THEN** fake tests and parsers pass without provider calls and the package remains zero runtime dependencies

#### Scenario: Published agentic evidence
- **WHEN** a user inspects the v0.3.1 package
- **THEN** the 96-row JSONL, report, frozen H1 status, and format-neutral benchmark pivot are explicit
