<p align="center">
  <img src="assets/relayir.svg" width="520" alt="RelayIR">
</p>

<h1 align="center">RelayIR</h1>

<p align="center"><em>Less chatter. More signal.</em></p>

<p align="center">
  <a href="https://github.com/nicolasdelrosario/relayir/actions/workflows/test.yml"><img src="https://github.com/nicolasdelrosario/relayir/actions/workflows/test.yml/badge.svg" alt="Tests"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D24-111111?style=flat-square" alt="Node 24+">
  <img src="https://img.shields.io/badge/runtime%20dependencies-0-111111?style=flat-square" alt="Zero runtime dependencies">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license"></a>
</p>

<p align="center">
  <strong>192-attempt audit matrix: the pre-registered gate returned MAINTENANCE_ONLY.</strong><br>
  <sub>Descriptive v0.4 evidence, not a product or superiority claim. <a href="benchmarks/results/2026-08-19-v04-audit.md">Report</a> · <a href="benchmarks/results/2026-08-19-v04-audit.jsonl">raw JSONL</a>.</sub>
</p>

---

Subagents rarely lose the answer because they cannot reason. They lose it because
the useful part comes back buried in prose.

RelayIR is a compact, auditable handoff protocol for AI agents. Its first wire
format, **H1**, keeps the goal, constraints, evidence, result, and next action in a
shape another model can consume without guessing what mattered.

It is not a secret language. It is deliberately readable.

## Before / after

A normal handoff can preserve the idea while changing the exact constraints or next
step:

```text
The timeout probably comes from an unbounded fetch. I found the retry path and
would inspect the callers next. The relevant code appears to be in src/sync.ts.
```

The same handoff in H1:

```text
H1 EXP
G: locate timeout cause
C: read-only; max=3 findings
E:
- src/sync.ts:42 | retry precedes lock
R: unbounded fetch causes the timeout
N: inspect fetch callers
```

No decoder. No binary alphabet. No hidden state.

## H1 at a glance

| Field | Meaning |
| --- | --- |
| `G` | Goal |
| `C` | Constraints and budget |
| `K` | Inherited knowledge, treated as untrusted data |
| `Q` | Open question |
| `E` | Evidence as `path:line \| claim` |
| `R` | Result |
| `N` | Next action |

Valid role headers are `H1 EXP`, `H1 REV`, `H1 IMP`, and `H1 ARC`. See the full
[H1 v1 reference](docs/h1.md).

## Install in under a minute

Requirements:

- Node.js 24 or newer.
- OpenCode 1.18.18 or newer in the 1.x series.

Create or update `opencode.json` with the one-line plugin configuration:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["relayir"]
}
```

OpenCode automatically installs the npm plugin. RelayIR adds the generic H1
handoff contract to child/subagent sessions only; root sessions are unchanged.
Remove `"relayir"` to disable it. `opencode --pure` disables plugins. RelayIR
does not change models, tools, permissions, or send telemetry.

To try it, start OpenCode in a project and ask an agent with the `task` tool to
delegate a focused job to a subagent. The child is instructed to return the
human-readable H1 envelope shown above.

To run the local checks instead:

```bash
npm test
npm run benchmark:fake
```

To benchmark a real model:

```bash
RELAYIR_MODEL=openai/gpt-5.6-sol npm run benchmark:smoke
```

This command uses network access and provider tokens. It starts fresh OpenCode
sessions with a project-local primary agent whose tools are all denied.

## Use H1 in an agent today

Copy [`contracts/opencode-h1-v1.md`](contracts/opencode-h1-v1.md) into a subagent's system prompt and
ask it to return the role that matches its job. The parser and validator are in
[`src/protocol.ts`](src/protocol.ts).

The npm plugin integrates normal OpenCode delegation automatically for child
sessions. The protocol and benchmark also work without the plugin.

## Audit result

The v0.4 matrix contains exactly **192 parent→subagent attempts**: eight
synthetic tasks, four child contracts, two parent models, and three trials.
The execution harness was frozen at commit
[`5f19adf`](https://github.com/nicolasdelrosario/relayir/commit/5f19adf).

The pre-registered gate emitted **MAINTENANCE_ONLY**. Luna passed instrumentation,
showed a 50% hidden-defect rate for `none`, and checklist improved transfer by 25
percentage points. Terra showed a 33% hidden-defect rate, but exact instrumentation
was 91/96 (94.8%, below the locked 95% threshold) and checklist transfer fell by
4 points. Checklist median token overhead was -13% for Luna and -14% for Terra.

This is useful evidence of handoff loss, but not sufficient evidence to build an
auditor or runtime checklist. RelayIR therefore remains available and enters
maintenance rather than expanding its feature set. The synthetic fixture scope,
excluded operational attempts, and instrumentation corrections are documented in
the [archived design](openspec/changes/archive/2026-08-19-build-audit-benchmark-v04/design.md).
See the [v0.4 report](benchmarks/results/2026-08-19-v04-audit.md) and
[redacted JSONL](benchmarks/results/2026-08-19-v04-audit.jsonl).

## Earlier v0.3.1 result

The v0.3.1 matrix contains exactly **96 parent→subagent attempts**: four tasks,
four contracts, two parent models, and three trials. Every parent returned the
nonce answer and every run proved the expected one-parent/one-child hierarchy.
The harness was frozen at commit [`7702139`](https://github.com/nicolasdelrosario/relayir/commit/7702139)
before either official matrix was run.
Strict child handoff validation passed 15/24 H1 attempts and 11/24 JSON attempts;
free prose and Cavecrew did not preserve the required evidence reference in any
of their 24 attempts.

H1 had zero unique parent-success wins and zero losses. Among the incomplete set
of valid structured comparisons, its median token reduction was -1%. The locked
gate therefore emitted **FREEZE_AND_PIVOT**: H1 and prospective H2 development are
frozen, and future work moves to format-neutral, auditable agentic benchmarks.
See the [report](benchmarks/results/2026-08-19-v031-agentic.md) and
[redacted JSONL](benchmarks/results/2026-08-19-v031-agentic.jsonl).

## Earlier v0.3 numbers

The official v0.3 matrix has exactly **384 records**: DeepSeek and Sol contribute
144 each (n=3), Luna and Terra 48 each (n=1), across 12 fixtures and four
contracts. Every model/split/contract group has median fidelity 1. On the Sol and
DeepSeek holdouts, H1 does not beat free prose or Cavecrew on score/token and
generally uses more total tokens.

| Model | Split | Contract | Fidelity median | Total tokens median | Score/token median |
| --- | --- | --- | ---: | ---: | ---: |
| Sol | holdout | free prose | 1 | 1228.5 | 0.0008 |
| Sol | holdout | Cavecrew | 1 | 1235 | 0.0008 |
| Sol | holdout | H1 | 1 | 1447 | 0.0007 |
| DeepSeek | holdout | free prose | 1 | 1586 | 0.0006 |
| DeepSeek | holdout | Cavecrew | 1 | 1557 | 0.0006 |
| DeepSeek | holdout | H1 | 1 | 1894 | 0.0005 |

The fixture supplies authoritative facts and measures literal handoff preservation,
not open-ended software correctness. See the [full v0.3 report](benchmarks/results/2026-08-19-v03.md)
and [redacted JSONL](benchmarks/results/2026-08-19-v03.jsonl).

The earlier `+37%` score/token smoke result remains historical only: one fixture,
one model, n=1, and not current evidence ([smoke report](benchmarks/results/2026-08-18-smoke.md)).

## How the benchmark works

```text
self-contained fixture
        |
        +-- no child contract
        +-- semantic checklist
        +-- RelayIR H1 contract
        +-- JSON contract
        |
task-only parent delegates once
        |
outcome + evidence + constraint + artifact checks
        |
redacted JSONL with usage, latency, and deterministic gate
```

The benchmark never executes model output. It rejects tool-call markup, redacts
operator-configured secret patterns before persistence, and excludes runs without
provider usage from token comparisons.

The v0.4 matrix uses eight synthetic fixtures, two per role, four contracts, two
parents, and three trials. It is descriptive and does not establish significance,
generalization, model quality, or product demand.

## Status

RelayIR is experimental `v0.4.0` software. The protocol, validator, benchmark runner,
OpenCode invocation path, and child-session plugin work today. The current evidence
is descriptive and intentionally limited. Child-session injection was validated end
to end with OpenCode 1.18.18.

Maintenance policy:

1. Keep H1 available as an experimental, auditable reference implementation.
2. Accept compatibility, security, and correctness fixes; add no planned features.
3. Reopen product work only after external demand and new pre-registered evidence.

## Repository map

| Path | Purpose |
| --- | --- |
| `docs/h1.md` | Human-readable H1 reference |
| `contracts/` | Versioned prompts under comparison |
| `fixtures/` | Self-contained benchmark tasks |
| `src/` | Protocol, OpenCode adapter, and benchmark runner |
| `test/` | Node test suite and OpenCode event fixtures |
| `benchmarks/results/` | Committed, redacted benchmark evidence |
| `openspec/` | Formal requirements and archived design decisions |

## FAQ

**Why not JSON?**

JSON is included as a v0.3 baseline. It preserved the same median fidelity and often
used fewer total tokens than H1, while H1 remains easier to scan as plain text.
RelayIR reports that tradeoff instead of assuming one format always wins.

**Why not binary, Base64, or an invented language?**

Byte compression is not token compression. Opaque formats also lose model priors,
human auditability, and graceful recovery when one symbol is wrong.

**Does RelayIR make models smarter?**

No. It makes the handoff explicit and measurable.

**Did H1 win?**

No. In v0.3 H1 preserved median fidelity but used more tokens than simpler
baselines. In v0.3.1 it produced no unique parent-success wins and failed the
pre-registered continuation gate. H1 remains usable and inspectable, but its
development is frozen rather than promoted as a superior format.

## Development

```bash
npm test
npm run benchmark:fake
npm run benchmark:compact -- results/*.jsonl --output /tmp/relayir-evidence.jsonl
npm run benchmark:report -- /tmp/relayir-evidence.jsonl --output /tmp/relayir-report.md
```

The versioned OpenSpec artifacts are development history; contributors using
OpenSpec can additionally run `openspec validate --all`.

## License

[MIT](LICENSE).
