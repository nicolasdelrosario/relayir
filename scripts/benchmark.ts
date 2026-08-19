import { rm } from 'node:fs/promises';
import { loadConfigFile } from '../src/protocol.ts';
import { invokeOpenCode } from '../src/opencode.ts';
import { loadFixtures, runBenchmark } from '../src/benchmark.ts';
const value = (name: string) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
const split = value('--split');
if (split && !['smoke', 'evaluation', 'holdout'].includes(split)) throw new Error('--split must be smoke, evaluation, or holdout');
const repeats = Number(value('--repeats') ?? 1);
if (!Number.isInteger(repeats) || repeats < 1) throw new Error('--repeats must be a positive integer');
const model = process.env.RELAYIR_MODEL;
if (!model) { console.error('RELAYIR_MODEL is required, e.g. RELAYIR_MODEL=provider/model'); process.exit(1); }
const config = await loadConfigFile(), fixtures = await loadFixtures(split as 'smoke' | 'evaluation' | 'holdout' | undefined), output = value('--output') ?? `results/${split ?? 'run'}.jsonl`;
await rm(output, { force: true });
const records = await runBenchmark(fixtures, (prompt) => invokeOpenCode({ prompt, model, timeoutMs: config.timeoutMs }), output, config, model, 'contracts', repeats);
console.log(`benchmark complete: ${records.length} runs; inspect ${output}`);
if (records.some((record) => (record as { outcome: string }).outcome === 'failed')) process.exitCode = 1;
