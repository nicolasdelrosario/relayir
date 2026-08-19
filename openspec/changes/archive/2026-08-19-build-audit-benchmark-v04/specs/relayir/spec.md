## ADDED Requirements

### Requirement: Locked no-provider benchmark
The benchmark MUST plan exactly 192 attempts: eight fixtures, four contracts, two parents, and three repeats. It MUST make no provider calls in its fake checks and MUST retain package version 0.3.2 until results exist.

#### Scenario: official plan
- **WHEN** the official v0.4 plan is generated
- **THEN** it contains 192 attempts and 96 attempts for each parent

### Requirement: Child-only contracts
The runner MUST inject contracts only into child sessions. Fixture task prompts MUST state only the substantive job and MUST NOT request evidence, constraints, next actions, or handoff syntax. `none` MUST inject nothing; only checklist, JSON, or H1 injection may request those handoff contents. The v0.4 contract set MUST be `none`, `checklist`, `json`, and `h1`; Cavecrew is historical only.

#### Scenario: no-op contract
- **WHEN** a child uses the `none` contract
- **THEN** the plugin does not modify the child system prompt

#### Scenario: baseline task prompt
- **WHEN** the `none` arm delegates a fixture task
- **THEN** the task contains no handoff-field request and differs from structured arms only by child contract injection

### Requirement: Calibrated semantic handoff scoring
Child semantic validity MUST require the expected outcome, valid fixture-relative source evidence, inherited constraint, and absence of a competing allowed outcome. Merely mentioning a fixture decoy or additional real call-path reference MUST NOT fail semantic validity; every emitted source-like reference MUST still resolve to an in-range fixture file line.

#### Scenario: ruled-out decoy
- **WHEN** a child states the expected outcome and explicitly rules out a fixture decoy
- **THEN** the child remains semantically valid if its references resolve

#### Scenario: competing outcome
- **WHEN** a child includes a competing allowed outcome
- **THEN** the child is semantically invalid

### Requirement: Auditable redacted rows
The runner MUST persist exactly one compact row per planned attempt, retain exported usage independently of semantic validity, record elapsed latency and named diagnostics, and omit raw text, prompts, transcripts, nonces, sensitive values, absolute paths, and timestamps. JSON v2 MUST validate exact keys and non-empty value shapes.

#### Scenario: failed handoff
- **WHEN** semantic or format validation fails after exports provide usage
- **THEN** the row retains root and child usage and stores only named diagnostics

### Requirement: Complete deterministic matrix
The report MUST reject any matrix other than exactly 192 rows with two expected parents, 96 rows per parent, 24 rows per contract per parent, eight tasks, and three trials. Unknown or null checklist token overhead MUST fail the checklist gate.

#### Scenario: incomplete matrix
- **WHEN** any planned cell is missing
- **THEN** `matrixComplete` is false and the decision is `MAINTENANCE_ONLY`

### Requirement: Deterministic gate
The report MUST implement the pre-registered instrumentation, auditor prerequisite, checklist transfer, outcome, token-overhead, and final decision thresholds. H1 MUST NOT reopen H1/H2.

#### Scenario: gate decision
- **WHEN** the auditor prerequisite fails
- **THEN** the decision is `MAINTENANCE_ONLY`
