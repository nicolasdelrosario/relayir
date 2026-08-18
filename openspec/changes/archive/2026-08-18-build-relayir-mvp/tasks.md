# Tasks: RelayIR MVP

## 1. Project foundation

- [x] 1.1 Add a minimal TypeScript package using Node.js built-ins and runnable scripts.
- [x] 1.2 Add the H1 protocol specification and examples for all valid roles.
- [x] 1.3 Add `relayir.config.json` parsing, documented defaults, and config validation.

## 2. Protocol core

- [x] 2.1 Implement H1 parsing while preserving redacted raw text.
- [x] 2.2 Validate header, roles, required and duplicate fields, byte limits, evidence
  count, `- path:line | claim` syntax, and configured secret patterns.
- [x] 2.3 Implement one-retry fallback prompt generation and separate plain-text
  validation requiring non-empty `Result:` and `Next:` lines with degraded status.
- [x] 2.4 Add tests for valid roles, missing and duplicate fields, malformed evidence,
  oversized output, secret redaction, and fallback exhaustion.

## 3. OpenCode invocation

- [x] 3.1 Add a project-local primary `relayir-benchmark` agent that denies all
  tool permissions.
- [x] 3.2 Implement the `opencode run --pure --format json` process adapter with an
  explicit model, fixed benchmark agent, fresh sessions, timeout, and captured errors.
- [x] 3.3 Parse root-session `text` and `step_finish` events using the documented
  message selection and token aggregation rules.
- [x] 3.4 Add event fixtures for successful, multi-step, missing-usage, malformed,
  multiple-session, agent-fallback, and failed runs.
- [x] 3.5 Add tests proving no continuation or automatic-permission flags are passed.

## 4. Benchmark

- [x] 4.1 Version and load the exact free-prose, Cavecrew, and H1 prompt contracts.
- [x] 4.2 Add smoke and evaluation fixtures with explicit expected facts,
  constraints, evidence references, next action, and success conditions.
- [x] 4.3 Implement deterministic normalized-inclusion scoring by category.
- [x] 4.4 Write JSONL results with provenance, timing, outcome, fallback, fidelity,
  success, usage, and unavailable-token markers.
- [x] 4.5 Sum usage and latency across primary and fallback invocations, and exclude
  the whole task from per-token comparisons if either invocation lacks usage.

## 5. Verification and documentation

- [x] 5.1 Run unit tests and a local fake-process benchmark smoke test.
- [x] 5.2 Run one real smoke fixture for each contract with the same OpenCode model.
- [x] 5.3 Document installation, CLI usage, configuration, costs, security boundaries,
  and deferred roadmap.
- [x] 5.4 Verify every proposal success criterion before archive.
