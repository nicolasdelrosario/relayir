# Design: Public release

## Positioning

Use the tagline **Less chatter. More signal.** RelayIR is a compact, auditable
handoff protocol for AI agents plus a reproducible OpenCode benchmark. The public
status is `experimental v0.1`; automatic orchestration integration remains roadmap.

The README may feature `+37% score/token vs Cavecrew` only with an adjacent `n=1`
caveat and a link to raw, redacted results.

## Repository Shape

- `README.md`: primary English landing page.
- `assets/`: lightweight SVG identity and benchmark visual.
- `docs/h1.md`: human protocol reference.
- `benchmarks/results/`: committed report and redacted JSONL evidence.
- `contracts/`, `fixtures/`, `src/`, `test/`: runnable implementation.
- `openspec/`: product specification and archived decisions.
- `.opencode/agents/relayir-benchmark.md`: required benchmark agent.

Generic OpenSpec commands and skills under `.opencode/` are generated development
scaffolding, not RelayIR runtime, and will not ship. Ignored local dependencies and
runtime results remain untracked.

## Distribution

This release is GitHub-first. Keep `private: true` in `package.json` to prevent an
accidental npm publish; add descriptive repository metadata. Users clone the repo,
run `npm test` without installing dependencies, then optionally run a real benchmark
with an authenticated OpenCode model.

## Quality Gate

GitHub Actions runs Node 24 tests and the fake benchmark. Before the initial commit,
run local tests, fake benchmark, OpenSpec validation, whitespace checks, staged-file
inspection, and a secret/path scan. The GitHub repository and release are deferred
until `gh` is authenticated.
