# RelayIR plugin delta

## ADDED Requirements

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
