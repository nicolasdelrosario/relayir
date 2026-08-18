# Proposal: Build RelayIR MVP

## Why

Subagent output is injected into the orchestrator context verbatim. Long prose
consumes the context window, while aggressive compression can lose evidence,
constraints, uncertainty, or the next action. Cavecrew proves that terse output
helps, but its fixed contracts do not measure semantic fidelity.

RelayIR needs a small executable core before attempting protocol optimization or
deep OpenCode integration.

## What Changes

- Define the versioned `H1` text envelope and role examples.
- Implement a portable parser and validator with explicit defaults.
- Implement a separate, degraded plain-text fallback path.
- Add deterministic fixtures and fidelity scoring.
- Add an OpenCode CLI invoker using fresh `opencode run --format json` sessions.
- Add a local primary benchmark agent with all tools denied.
- Compare versioned free-prose, Cavecrew, and H1 prompt contracts.
- Store reproducible run results as JSON Lines.

## Out of Scope

- Training or fine-tuning models.
- Semantic contradiction detection in free text.
- Black-box protocol search, winner selection, or competitive holdout claims.
- Classical Chinese or other compressed-language controls.
- An OpenCode plugin or changes to agent permissions.
- Binary, Base64, or opaque semantic codebooks.

## Success Criteria

- The H1 validator catches missing or duplicate fields, size violations, malformed
  evidence references, and configured secret patterns.
- Invalid H1 output receives at most one plain-text fallback request; fallback output
  is safety-checked, marked degraded, and never accepted as canonical H1.
- The runner invokes OpenCode in a fresh session with explicit model and timeout.
- The runner uses the local read-only benchmark agent and rejects agent fallback.
- Every completed run records protocol, model, timing, outcome, fidelity categories,
  and provider usage when available.
- Fallback tasks include the usage and latency of both model invocations.
- Runs without provider usage are excluded from per-token comparisons.
- A smoke fixture completes for free prose, Cavecrew, and H1 without hidden retries.
