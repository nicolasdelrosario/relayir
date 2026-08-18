import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

test('public package metadata is complete', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(pkg.version, '0.2.0');
  assert.equal(pkg.private, undefined);
  assert.deepEqual(pkg.exports, { '.': './src/protocol.ts', './server': './src/plugin.ts' });
  assert.deepEqual(pkg.publishConfig, { access: 'public' });
  assert.equal(pkg.engines.opencode, '>=1.18.18 <2');
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.repository.url, 'git+https://github.com/nicolasdelrosario/relayir.git');
  assert.match(pkg.description, /handoff protocol/i);
});

test('npm tarball contains the plugin entrypoint and contract', () => {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const files = JSON.parse(result.stdout)[0].files.map((file: { path: string }) => file.path);
  assert.ok(files.includes('src/plugin.ts'));
  assert.ok(files.includes('contracts/opencode-h1-v1.md'));
  assert.ok(files.includes('assets/relayir.svg'));
  assert.ok(files.includes('contracts/h1-v1.md'));
  assert.ok(files.includes('benchmarks/results/2026-08-18-smoke.md'));
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
