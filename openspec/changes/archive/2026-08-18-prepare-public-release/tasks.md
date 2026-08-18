# Tasks: Prepare public release

## 1. Identity and documentation

- [x] 1.1 Add a minimal signal-relay SVG identity and benchmark visual.
- [x] 1.2 Rewrite README in English with tagline, honest metric, before/after,
  quickstart, protocol, benchmark, safety, roadmap, FAQ, and license.
- [x] 1.3 Remove public-facing MVP language and replace the orphan PROJECT.md with
  concise linked documentation or existing canonical specs.

## 2. Legal and repository metadata

- [x] 2.1 Add the MIT license.
- [x] 2.2 Add package description, author, repository, bugs, keywords, and license
  while keeping npm publishing disabled.
- [x] 2.3 Add a minimal GitHub Actions workflow for tests and fake benchmark.

## 3. Evidence and cleanup

- [x] 3.1 Commit a redacted smoke JSONL and report supporting the public `n=1` claim.
- [x] 3.2 Remove generic generated OpenSpec commands/skills from `.opencode/` while
  preserving the benchmark agent.
- [x] 3.3 Simplify OpenSpec config and confirm ignored local/runtime files stay out of Git.

## 4. Release verification

- [x] 4.1 Add only targeted release-boundary tests if the audit exposes real gaps.
- [x] 4.2 Run unit tests, fake benchmark, OpenSpec validation, and whitespace checks.
- [x] 4.3 Inspect staged files and scan for secrets, emails, and machine-specific paths.
- [x] 4.4 Archive this OpenSpec change after all tasks pass.
- [x] 4.5 Create the reviewed initial local commit without adding a remote or GitHub release.
