import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2), index = args.indexOf('--output'), output = index < 0 ? undefined : args[index + 1], files = index < 0 ? [] : args.filter((x, i) => x !== '--output' && i !== index + 1);
if (!output || !files.length) throw new Error('usage: node scripts/compact-results.ts results/*.jsonl --output evidence.jsonl');
const fields = ['fixture', 'fixtureVersion', 'contract', 'contractVersion', 'model', 'trial', 'split', 'language', 'outcome', 'status', 'fallbackCount', 'noncompliant', 'facts', 'constraints', 'evidence', 'next', 'fidelity', 'success', 'usage', 'outputTokens', 'totalTokens', 'scorePerToken', 'tokenMetricUnavailable', 'latencyMs'];
const rows = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).flatMap((text) => text.trim().split('\n').filter(Boolean).map(JSON.parse));
rows.sort((a, b) => [a.model, a.split, a.fixture, a.trial, a.contract].join('\0').localeCompare([b.model, b.split, b.fixture, b.trial, b.contract].join('\0')));
await writeFile(output, rows.map((row) => JSON.stringify(Object.fromEntries(fields.map((field) => [field, row[field]])))).join('\n') + '\n');
