# relayir Specification

## Purpose
Define a compact, evidence-preserving text envelope and a reproducible OpenCode CLI
benchmark for comparing interagent prompt contracts.

## Requirements

### Requirement: H1 envelope
The system SHALL parse subagent response `H1 <ROLE>` envelopes for roles `EXP`, `REV`, `IMP`, and
`ARC`. `G`, `C`, `E`, `R`, and `N` SHALL occur exactly once; `K` and `Q` MAY be
absent or empty.

#### Scenario: Valid explorer response
- **WHEN** an explorer returns a valid `H1 EXP` envelope
- **THEN** parsing exposes the role, fields, evidence items, and redacted raw text

#### Scenario: Duplicate field
- **WHEN** an envelope repeats a field prefix
- **THEN** validation rejects it and identifies the duplicate field

#### Scenario: Unknown role
- **WHEN** the H1 header contains an unsupported role
- **THEN** validation rejects it without inferring a replacement role

### Requirement: Configuration
The system SHALL optionally load `relayir.config.json` over documented defaults for
maximum bytes, maximum evidence items, one fallback retry, process timeout, and
operator-provided secret patterns.

#### Scenario: No configuration file
- **WHEN** no configuration file exists
- **THEN** the documented defaults are used

#### Scenario: Invalid configuration
- **WHEN** configuration contains an unknown key, invalid limit, or invalid pattern
- **THEN** startup fails with a field-specific configuration error

### Requirement: Syntactic evidence preservation
The system SHALL require one or more `E:` entries using
`- <path>:<positive-line> | <claim>`, preserve the source reference exactly, and
validate only its syntax in the portable protocol layer.

#### Scenario: Valid source reference
- **WHEN** evidence contains `src/sync.ts:42`
- **THEN** the reference is preserved unchanged

#### Scenario: Malformed source reference
- **WHEN** evidence lacks a positive line number
- **THEN** validation reports a malformed evidence reference

### Requirement: Safety boundary
The system SHALL treat envelope values as data, SHALL NOT execute inherited content,
and SHALL redact configured secret patterns before diagnostics or persistence.

#### Scenario: Inherited instruction
- **WHEN** `K` contains instructions to change permissions or execute a command
- **THEN** those instructions remain inert text in the parsed value

#### Scenario: Secret match
- **WHEN** input matches an operator-configured secret pattern
- **THEN** persisted raw text and diagnostics contain a redaction marker instead

### Requirement: Degraded fallback
The system SHALL request at most one plain-text fallback after invalid H1 output and
SHALL validate fallback independently from H1 by requiring exactly one non-empty
`Result:` line and one non-empty `Next:` line.

#### Scenario: Safe fallback
- **WHEN** fallback output is non-empty, within the byte limit, and contains no
  unredacted configured secret
- **THEN** it is returned with degraded status and no canonical H1 envelope

#### Scenario: Exhausted fallback
- **WHEN** fallback output also fails plain-text safety validation
- **THEN** the run fails without another model invocation

### Requirement: OpenCode CLI invocation
The system SHALL invoke a selected model through `opencode run --pure --format json`
using a project-local primary `relayir-benchmark` agent that denies all tools, with
an explicit timeout and without continuation or automatic permission flags.

#### Scenario: Fresh invocation
- **WHEN** the benchmark invokes a contract
- **THEN** it supplies the selected model and omits `--continue`, `--session`, and
  `--auto`

#### Scenario: Process failure
- **WHEN** OpenCode times out, exits non-zero, or emits malformed JSON
- **THEN** the run records the failure without a hidden RelayIR retry

#### Scenario: Agent fallback
- **WHEN** OpenCode warns that the requested agent is unavailable or falls back to
  another agent
- **THEN** the run fails before its output is scored

### Requirement: Automatic OpenCode handoff integration
The published package SHALL expose an OpenCode server plugin that injects the generic
OpenCode H1 contract into child sessions only, without changing models, tools, or
permissions. It SHALL fail open, emit no telemetry, and have zero runtime dependencies.

#### Scenario: Child session handoff
- **WHEN** a child session is created with `Session.parentID`
- **THEN** its system prompt receives the H1 contract and root sessions remain unchanged

#### Scenario: Plugin disabled
- **WHEN** `relayir` is removed from the OpenCode plugin list or OpenCode runs with `--pure`
- **THEN** RelayIR does not inject a handoff contract

### Requirement: OpenCode event aggregation
The system SHALL parse root-session JSON events and derive assistant text and usage
with versioned aggregation rules.

#### Scenario: Final assistant text
- **WHEN** the final root `step_finish` identifies a message
- **THEN** assistant text concatenates root `text.part.text` values for that message
  in arrival order

#### Scenario: Token aggregation
- **WHEN** one or more root `step_finish` events contain token usage
- **THEN** input, output, and reasoning tokens are summed by category and cache
  fields are stored separately

### Requirement: Provider usage
The system SHALL obtain token counts only from usage data emitted by OpenCode or the
provider.

#### Scenario: Usage available
- **WHEN** events include input and output token usage
- **THEN** both values and their provenance are stored in the run result

#### Scenario: Usage unavailable
- **WHEN** events do not include token usage
- **THEN** the run is marked `tokenMetricUnavailable` and its per-token score is null

#### Scenario: Fallback usage
- **WHEN** an invalid H1 response causes a plain-text fallback invocation
- **THEN** task latency and token categories sum both invocations, and missing usage
  from either invocation makes the whole task `tokenMetricUnavailable`

### Requirement: Deterministic benchmark
The system SHALL run versioned free-prose, Cavecrew, and H1 contracts against the
same fixtures and score expected facts, constraints, evidence, and next action by
normalized exact inclusion.

#### Scenario: Comparable run
- **WHEN** all three contracts run against one fixture and model
- **THEN** each JSONL result records contract and fixture versions, model, timing,
  process outcome, fallback count, category scores, success, and usage availability

#### Scenario: Fidelity calculation
- **WHEN** category expectations are evaluated
- **THEN** fidelity is the arithmetic mean of category recall and task success is
  recorded separately

### Requirement: v0.3 benchmark matrix
The benchmark SHALL load object-or-array JSON fixtures, retain the smoke fixture as a quick check,
and keep evaluation and holdout splits separate. The official matrix SHALL contain eight evaluation
fixtures and four holdout fixtures, balanced across four roles and languages as documented by each
fixture's versioned metadata.

#### Scenario: Official fixture loading
- **WHEN** evaluation and holdout files are loaded
- **THEN** eight evaluation and four holdout fixtures are returned without mixing splits

### Requirement: Versioned contracts and trials
The benchmark SHALL run free-prose v1, Cavecrew v1, the deployed OpenCode H1 profile v2,
and JSON v1 contracts. It SHALL support positive
repetitions (default one), record a zero-based trial, and rotate contract order deterministically per
trial without changing fixture content.

#### Scenario: Repeated contract run
- **WHEN** a benchmark runs with repeats greater than one
- **THEN** every fixture has one record per contract and trial with deterministic rotation

### Requirement: JSON baseline
The JSON v1 baseline SHALL require exactly one object with keys `goal`, `constraints`, `evidence`,
`result`, and `next`; it SHALL validate non-empty strings, arrays, and evidence references locally
before scoring. Invalid structured output MAY receive the same maximum-one degraded plain fallback
as H1, but holdout content SHALL never be used for calibration or fake outputs.

#### Scenario: Invalid JSON response
- **WHEN** a JSON response has invalid syntax, missing keys, or an extra key
- **THEN** it is rejected locally and receives at most one degraded fallback

### Requirement: Model-separated reporting
Benchmark records SHALL identify model, split, language, contract, fixture, and trial. Reports SHALL
group by model, split, and contract, use deterministic median and IQR summaries, and calculate paired
H1 fidelity deltas only for matching model, split, fixture, and trial. Reports SHALL not claim model
quality, significance, bootstrap confidence, or generalization from these fixtures.

#### Scenario: Separate model groups
- **WHEN** records contain more than one model
- **THEN** no metric combines records across models

### Requirement: Public benchmark caveats
Published benchmark documentation SHALL state that the official v0.3 matrix contains exactly 384
records: DeepSeek and Sol n=3, Luna and Terra exploratory n=1, with eight evaluation and four
holdout fixtures, 6 en/6 es, and three fixtures per role. It SHALL identify the deployed OpenCode
H1 profile, report failures and provider-reported token categories, and make no p-value,
generalization, or superiority claim from these descriptive results.

#### Scenario: Neutral official result
- **WHEN** the official v0.3 matrix is published
- **THEN** public documentation links the report and raw JSONL and keeps the historical n=1 smoke
  result separate from the current evidence

### Requirement: v0.3.1 agentic harness
The benchmark SHALL run a 96-attempt real OpenCode parent-to-child matrix with one task delegation,
child-only contract injection, deterministic per-run nonce verification, root and child exports, and
no retries or judge calls. Persisted records SHALL omit nonces, raw prompts, outputs, absolute paths,
timestamps, and transcripts.

#### Scenario: Frozen gate
- **WHEN** the completed matrix is reported
- **THEN** the deterministic report emits CONTINUE only for the specified win or ceiling/token gate; otherwise it emits FREEZE_AND_PIVOT.

### Requirement: v0.3.1 decision
The completed 96-attempt matrix SHALL be published with its FREEZE_AND_PIVOT decision. H1 and H2
protocol development SHALL remain frozen unless new evidence justifies reopening the decision;
benchmark work MAY continue without assuming a wire format is superior.

#### Scenario: Public status
- **WHEN** users inspect the README or H1 reference
- **THEN** they can distinguish the still-usable experimental plugin from the frozen protocol roadmap

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
The report MUST require at least 95% valid instrumentation and at least 20% hidden handoff defects for each parent before piloting an auditor. `PILOT_CHECKLIST` additionally requires at least 20 percentage points of checklist evidence-plus-constraint transfer gain, no more than 5 percentage points of parent-outcome loss, and no more than 10% known median all-run token overhead for each parent. Passing only the auditor prerequisite MUST yield `AUDIT_ONLY`; failing it MUST yield `MAINTENANCE_ONLY`. JSON and H1 are descriptive controls, and H1 MUST NOT reopen H1/H2.

#### Scenario: gate decision
- **WHEN** the auditor prerequisite fails
- **THEN** the decision is `MAINTENANCE_ONLY`
