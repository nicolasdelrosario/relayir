# Proposal: Prepare RelayIR public release

## Why

RelayIR is implemented and verified, but its repository still reads like an
internal MVP. A public release needs a clear identity, honest evidence, legal
permission to reuse the work, automated verification, and a short path from clone
to first result.

## What Changes

- Present RelayIR as an experimental protocol and benchmark, not an unfinished MVP.
- Add a minimal visual identity and an English README inspired by strong open-source
  project storytelling.
- Add MIT licensing, repository metadata, and GitHub Actions CI.
- Version the redacted smoke evidence behind the public metric.
- Remove generated OpenSpec integration files that are unrelated to RelayIR runtime.
- Keep npm publishing and automatic OpenCode integration out of this release.

## Success Criteria

- A new reader can understand RelayIR, inspect H1, and run tests or a benchmark from
  the README without prior project context.
- Every public performance claim links to reproducible evidence and states `n=1`.
- The staged tree contains no secrets, local state, dependencies, or machine paths.
- Tests, fake benchmark, and OpenSpec validation pass in CI-compatible commands.
- The local repository has one reviewed initial commit and no remote.
