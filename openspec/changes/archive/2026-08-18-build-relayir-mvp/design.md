# Design: RelayIR MVP

## Approach

Build a small TypeScript package using the Node.js standard library and the
OpenCode CLI already installed on the system. Do not add an OpenCode plugin in this
change. Keep protocol, scoring, and process invocation independent modules.

```text
src/protocol   -> H1 parser, validation, fallback safety
src/benchmark  -> fixtures, prompt contracts, scoring, JSONL reports
src/opencode   -> non-interactive CLI invoker and event parser
```

## H1 Envelope

```text
Envelope { version, role, goal, constraints, knowledge, question,
           evidence[], result, next, raw }
```

The wire format is only for subagent responses; orchestrator delegation prompts
remain normal text in the MVP. Valid roles are `EXP`, `REV`, `IMP`, and `ARC`.
Fields `G`, `C`, `E`, `R`, and `N` are required exactly once; `K` and `Q` may be
absent or empty. Unknown or duplicate fields are validation errors in H1. No
semantic contradiction inference is attempted inside free-text values.

`E:` contains one or more lines with this ASCII grammar:

```text
- <path>:<positive-line> | <claim>
```

`path` cannot contain whitespace, `|`, or a newline. Tool output and evidence
without a source location are deferred.

## Configuration

Load `relayir.config.json` when present and merge it over these defaults:

```json
{
  "maxBytes": 12000,
  "maxEvidenceItems": 12,
  "maxFallbackRetries": 1,
  "timeoutMs": 120000,
  "secretPatterns": []
}
```

Configuration parsing rejects unknown keys and invalid limits. Secret patterns are
operator-provided JavaScript regular-expression source strings without delimiters or
flags; the operator is trusted to provide them. Redaction occurs before diagnostics
or JSONL output; the unredacted source is never persisted by RelayIR.

## Validation and Fallback

`validateH1()` checks header, role, unique fields, required fields, byte and evidence
limits, `path:line` evidence syntax, and configured secret patterns.

If H1 is invalid, the runner may make one second model invocation with a concise
plain-language fallback prompt. `validatePlainFallback()` requires exactly one
non-empty `Result:` line and one non-empty `Next:` line, then checks size and secret
patterns. Accepted fallback output is returned with `status: "degraded"` and cannot
become a valid H1 envelope.

## OpenCode Invoker

Define one concrete interface:

```text
invoke({ prompt, model, agent?, timeoutMs }) -> {
  text, usage?, startedAt, endedAt, exitCode, error?
}
```

The implementation spawns:

```text
opencode run --pure --format json --model <provider/model> \
  --agent relayir-benchmark <prompt>
```

The repository provides `.opencode/agents/relayir-benchmark.md` as a primary agent
with all tools denied. Fixtures are self-contained and the model can use only their
prompt. The invoker treats OpenCode's "falling back to default agent" warning as a
failed run.

It never passes `--continue`, `--session`, or `--auto`, so every call gets a fresh
session. It parses newline-delimited JSON events for the root `sessionID`. Final
assistant text is the concatenation, in arrival order, of `part.text` from `text`
events whose `part.messageID` equals the final `step_finish.part.messageID`. Usage is the
sum of `step_finish.part.tokens.input`, `output`, and `reasoning` for the root
session; cache fields are recorded separately and never added twice. Missing
structural fields on relevant `text` and `step_finish` events, an empty final
assistant message, non-zero exits, timeouts, malformed events, or multiple root session
IDs fail the run. Missing token usage is accepted
only as `tokenMetricUnavailable`. Provider retries are not added by RelayIR.

## Benchmark

Fixtures contain a self-contained prompt, split (`smoke` or `evaluation`), expected facts,
constraints, evidence references, next action, and task success conditions. The
three prompt contracts are stored verbatim and versioned in the repository:

1. Free prose.
2. Cavecrew's published terse investigator/reviewer contracts.
3. RelayIR H1.

Scoring lowercases text, normalizes whitespace, and checks fixture expectations by
exact inclusion. It reports facts, constraints, evidence, and next-action recall
separately; fidelity is their arithmetic mean. Task success remains a separate
boolean and no LLM is used as judge.

Results are appended as JSONL. Each record includes fixture and contract versions,
model, agent, timestamps, latency, process outcome, fallback count, category scores,
task success, usage, and `tokenMetricUnavailable`. If provider usage is absent,
per-token score is `null` and the run is excluded from token comparisons.

When fallback occurs, the task result retains both invocation records and computes
total latency and each token category as their sums. If either invocation lacks
usage, the entire task is `tokenMetricUnavailable`; RelayIR never scores only the
cheaper or successful half of a fallback task.

## Deferred Work

- Black-box search and holdout winner selection.
- Classical Chinese and other compressed-language controls.
- Repository-aware evidence verification.
- OpenCode plugin hooks, automatic Task interception, and prompt injection.
