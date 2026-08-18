import { rm } from 'node:fs/promises';
import { loadConfigFile } from '../src/protocol.ts';
import { invokeOpenCode } from '../src/opencode.ts';
import { loadFixtures, runBenchmark } from '../src/benchmark.ts';
const split = process.argv.includes('--split') ? process.argv[process.argv.indexOf('--split') + 1] : undefined;
if (split && split !== 'smoke' && split !== 'evaluation') throw new Error('--split must be smoke or evaluation');
const model = process.env.RELAYIR_MODEL;
if (!model) { console.error('RELAYIR_MODEL is required, e.g. RELAYIR_MODEL=provider/model'); process.exit(1); }
const config = await loadConfigFile(), fixtures = await loadFixtures(split as 'smoke' | 'evaluation' | undefined), output = `results/${split ?? 'run'}.jsonl`;
await rm(output, { force: true });
const records = await runBenchmark(fixtures, (prompt) => invokeOpenCode({ prompt, model, timeoutMs: config.timeoutMs }), output, config, model);
console.log(`benchmark complete: ${records.length} runs; inspect ${output}`);
if (records.some((record) => (record as { outcome: string }).outcome === 'failed')) process.exitCode = 1;
