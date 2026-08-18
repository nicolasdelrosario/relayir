import { readFile, rm } from 'node:fs/promises';
import { runBenchmark, type Fixture } from '../src/benchmark.ts';
import { loadConfig } from '../src/protocol.ts';
import type { Invocation } from '../src/opencode.ts';
const fixture = JSON.parse(await readFile('fixtures/smoke.json', 'utf8')) as Fixture;
const invoke = async (prompt: string, contract: { id: string }): Promise<Invocation> => { const now = new Date().toISOString(); const text = contract.id === 'h1' ? 'H1 EXP\nG: localizar causa timeout sync\nC: read-only; max=3 hallazgos\nE:\n- src/sync.ts:42 | retry ocurre antes del bloqueo\nR: fetch sin límite causa bloqueo\nN: revisar callers fetchBatch' : 'La causa es fetch sin límite causa bloqueo. Restricción: read-only; max=3 hallazgos. Evidencia src/sync.ts:42. Siguiente acción: revisar callers fetchBatch.'; return { text, startedAt: now, endedAt: now, exitCode: 0, usage: { input: 10, output: 20, reasoning: 0, cacheRead: 0, cacheWrite: 0 } }; };
await rm('.tmp/fake-results.jsonl', { force: true });
await runBenchmark([fixture], invoke, '.tmp/fake-results.jsonl', loadConfig());
console.log('fake benchmark: 3 contracts written to .tmp/fake-results.jsonl');
