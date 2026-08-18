import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

test('public package metadata is complete and npm publishing stays disabled', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(pkg.private, true);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.repository.url, 'git+https://github.com/nicolasdelrosario/relayir.git');
  assert.match(pkg.description, /handoff protocol/i);
});

test('committed smoke evidence supports the public metric', async () => {
  const rows = (await readFile('benchmarks/results/2026-08-18-smoke.jsonl', 'utf8'))
    .trim().split('\n').map(JSON.parse);
  assert.deepEqual(rows.map((row) => row.contract), ['free-prose', 'cavecrew', 'h1']);
  for (const row of rows) {
    const total = Object.values(row.usage as Record<string, number>).reduce((sum, value) => sum + value, 0);
    assert.equal(row.totalTokens, total);
    assert.ok(Math.abs(row.scorePerToken - row.fidelity / total) < 1e-9);
  }
  const cavecrew = rows[1].scorePerToken;
  const h1 = rows[2].scorePerToken;
  assert.ok(h1 / cavecrew > 1.36 && h1 / cavecrew < 1.38);
});

test('README presents RelayIR without MVP branding', async () => {
  const readme = await readFile('README.md', 'utf8');
  assert.doesNotMatch(readme, /RelayIR MVP/);
  assert.match(readme, /Less chatter\. More signal\./);
  assert.match(readme, /n=1/);
  assert.match(readme, /LICENSE/);
});

test('the publishable tree excludes local state and obvious secrets', async () => {
  const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' });
  assert.equal(listed.status, 0, listed.stderr);
  const files = listed.stdout.split('\0').filter(Boolean);
  assert.ok(files.includes('benchmarks/results/2026-08-18-smoke.jsonl'));
  assert.ok(files.includes('.opencode/agents/relayir-benchmark.md'));
  assert.ok(files.includes('.opencode/.gitignore'));
  assert.equal(files.some((file) => file.startsWith('results/') || file.startsWith('.tmp/') || file.includes('node_modules/')), false);
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    assert.doesNotMatch(text, /\/Users\/|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|\bghp_[A-Za-z0-9]+\b|\bsk-[A-Za-z0-9]{16,}\b/, file);
  }
});
