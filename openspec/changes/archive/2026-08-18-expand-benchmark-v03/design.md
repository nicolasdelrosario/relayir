# Design: Expand benchmark v0.3

Fixtures are loaded from versioned object-or-array JSON files. A trial rotates the contract list by
its trial number, while records retain the actual contract and trial. JSON validation is local and
strict; malformed H1 and JSON receive at most one plain fallback. Reports use sorted groups and
linear-interpolated quartiles from JSONL records. Calibration retains H1 v1 because a stricter v2
prompt increased empty and degraded responses.
