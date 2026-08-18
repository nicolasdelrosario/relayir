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
