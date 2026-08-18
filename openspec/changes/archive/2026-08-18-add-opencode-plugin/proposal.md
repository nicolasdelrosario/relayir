# Proposal: automatic OpenCode plugin integration

## Why

Manual prompt copying prevents the handoff contract from applying consistently
to OpenCode child sessions.

## What Changes

Publish RelayIR v0.2.0 as an OpenCode plugin that automatically gives child
sessions a generic H1 handoff contract. The one-line npm plugin configuration
should require no manual prompt copying while leaving root sessions and normal
OpenCode behavior unchanged.

The plugin is intentionally event-only, fail-open, telemetry-free, and has no
runtime dependencies. The benchmark contract remains unchanged for historical
reproducibility.
