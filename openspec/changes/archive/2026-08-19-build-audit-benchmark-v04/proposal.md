# Build audit benchmark v0.4

## Why

The v0.3.1 gate froze H1/H2 development but exposed a broader question: whether
real parent/child handoffs hide evidence or constraint defects even when the
parent reaches the correct outcome.

## What Changes

Pre-register a no-provider-call, auditable parent/child benchmark for RelayIR
v0.4. The locked matrix has eight tasks, four child contracts (`none`,
`checklist`, `json`, `h1`), two parents (Luna and Terra), and three repeats: 192
planned attempts. Existing v0.3 evidence remains historical and unchanged;
package version remains 0.3.2 until benchmark results exist.
