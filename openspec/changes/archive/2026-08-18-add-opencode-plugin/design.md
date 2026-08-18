# Design: automatic OpenCode plugin integration

`src/plugin.ts` exports the OpenCode module `{ id: 'relayir', server }`. On server
initialization it reads `contracts/opencode-h1-v1.md` once. It records child IDs
from `session.created` events whose `properties.info.parentID` exists, removes
IDs on `session.deleted`, and handles `experimental.chat.system.transform` only
for recorded child IDs. The contract is appended to the last system string or
pushed if the list is empty.

No session lookup, model/tool/permission mutation, configuration, logging, or
telemetry is added. Initialization, event, and transform failures are caught so
OpenCode remains usable.
