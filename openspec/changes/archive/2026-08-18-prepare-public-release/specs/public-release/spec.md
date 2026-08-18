# Public Release Requirements

## ADDED Requirements

### Requirement: Clear public identity
The repository SHALL present RelayIR in English as an experimental compact handoff
protocol and reproducible benchmark with the tagline `Less chatter. More signal.`

#### Scenario: First-time visitor
- **WHEN** a visitor opens the repository
- **THEN** the README explains the problem, shows H1, provides a quickstart, and
  distinguishes current functionality from roadmap work

### Requirement: Honest benchmark evidence
Every performance claim SHALL identify the sample size, model, metric, limitation,
and a committed redacted result that can be inspected without running a model.

#### Scenario: Headline metric
- **WHEN** the README shows the score-per-token improvement over Cavecrew
- **THEN** `n=1` and the reproducibility link appear next to the claim

### Requirement: Reusable open-source repository
The repository SHALL include an MIT license, descriptive package metadata, and CI
that runs without paid services or runtime dependencies.

#### Scenario: Fresh clone verification
- **WHEN** a contributor clones the repository with Node 24
- **THEN** `npm test` and `npm run benchmark:fake` run without dependency installation

### Requirement: Clean published tree
The committed tree SHALL exclude runtime results, temporary files, node_modules,
credentials, machine-specific paths, and generated OpenSpec host scaffolding that is
not required by RelayIR.

#### Scenario: Initial commit review
- **WHEN** the release tree is staged
- **THEN** only source, tests, protocol docs, benchmark evidence, OpenSpec artifacts,
  CI, metadata, and the RelayIR benchmark agent are included
