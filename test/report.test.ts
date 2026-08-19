import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { renderReport, type BenchmarkRecord } from '../src/report.ts';
const row = (contract: string, fixture: string, fidelity: number, trial = 0): BenchmarkRecord => ({ model: 'm', split: 'evaluation', contract, fixture, trial, fidelity, totalTokens: 10, outputTokens: 4, scorePerToken: fidelity / 10, latencyMs: 20, success: true, fallbackCount: 0, tokenMetricUnavailable: false });
test('renders deterministic medians, IQR, and paired fidelity/score deltas', () => { const rows = [row('h1', 'a', .2), row('h1', 'b', .8), row('free-prose', 'a', .1), row('free-prose', 'b', .4)]; const report = renderReport(rows); assert.match(report, /Fidelity median \| Fidelity IQR/); assert.match(report, /0\.5 \| 0\.3/); assert.match(report, /free-prose \| 2 \| 0\.25 \| 2 \| 0\.025/); assert.equal(report, renderReport([...rows].reverse())); });
test('report CLI accepts one input without --output', () => { const result = spawnSync(process.execPath, ['scripts/report.ts', 'benchmarks/results/2026-08-18-smoke.jsonl'], { encoding: 'utf8' }); assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /RelayIR benchmark report/); });
