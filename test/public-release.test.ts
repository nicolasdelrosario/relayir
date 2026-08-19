import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

test('public package metadata is complete', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(pkg.version, '0.4.0');
  assert.equal(pkg.private, undefined);
  assert.deepEqual(pkg.exports, { '.': './dist/protocol.js', './server': './dist/plugin.js' });
  assert.deepEqual(pkg.publishConfig, { access: 'public' });
  assert.equal(pkg.engines.opencode, '>=1.18.18 <2');
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.repository.url, 'git+https://github.com/nicolasdelrosario/relayir.git');
  assert.match(pkg.description, /handoff protocol/i);
});

test('published JavaScript exports load in Node', async () => {
  const protocol = await import('../dist/protocol.js');
  const plugin = await import('../dist/plugin.js');
  assert.equal(protocol.validateH1('H1 EXP\nG: g\nC: c\nE:\n- a.ts:1 | e\nR: r\nN: n').ok, true);
  assert.equal(plugin.default.id, 'relayir');
});

test('npm tarball contains the plugin entrypoint and contract', () => {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const files = JSON.parse(result.stdout)[0].files.map((file: { path: string }) => file.path);
  assert.ok(files.includes('dist/plugin.js'));
  assert.ok(files.includes('dist/protocol.js'));
  assert.ok(files.includes('contracts/opencode-h1-v1.md'));
  assert.ok(files.includes('assets/relayir.svg'));
  assert.ok(files.includes('contracts/h1-v1.md'));
  assert.ok(files.includes('benchmarks/results/2026-08-18-smoke.md'));
  assert.ok(files.includes('benchmarks/results/2026-08-19-v03.md'));
  assert.ok(files.includes('benchmarks/results/2026-08-19-v03.jsonl'));
  assert.ok(files.includes('benchmarks/results/2026-08-19-v031-agentic.md'));
  assert.ok(files.includes('benchmarks/results/2026-08-19-v031-agentic.jsonl'));
  assert.ok(files.includes('benchmarks/results/2026-08-19-v04-audit.md'));
  assert.ok(files.includes('benchmarks/results/2026-08-19-v04-audit.jsonl'));
  assert.ok(files.includes('scripts/compact-results.ts'));
});

test('committed v0.4 evidence contains the complete maintenance decision', async () => {
  const rows = (await readFile('benchmarks/results/2026-08-19-v04-audit.jsonl', 'utf8'))
    .trim().split('\n').map(JSON.parse);
  const report = await readFile('benchmarks/results/2026-08-19-v04-audit.md', 'utf8');
  assert.equal(rows.length, 192);
  assert.equal(new Set(rows.map((row) => `${row.parentModel}/${row.task}/${row.trial}/${row.contract}`)).size, 192);
  assert.deepEqual(Object.fromEntries(['openai/gpt-5.6-luna', 'openai/gpt-5.6-terra']
    .map((parent) => [parent, rows.filter((row) => row.parentModel === parent).length])), {
    'openai/gpt-5.6-luna': 96,
    'openai/gpt-5.6-terra': 96,
  });
  for (const row of rows) for (const field of ['prompt', 'text', 'transcript', 'nonce', 'startedAt', 'endedAt']) assert.equal(field in row, false);
  assert.match(report, /Decision: \*\*MAINTENANCE_ONLY\*\*/);
  assert.match(report, /Matrix complete: \*\*true\*\*/);
});

test('committed v0.3.1 evidence contains the frozen 96-attempt decision', async () => {
  const rows = (await readFile('benchmarks/results/2026-08-19-v031-agentic.jsonl', 'utf8'))
    .trim().split('\n').map(JSON.parse);
  const report = await readFile('benchmarks/results/2026-08-19-v031-agentic.md', 'utf8');
  assert.equal(rows.length, 96);
  assert.equal(rows.filter((row) => row.contract === 'h1' && row.handoffValid).length, 15);
  assert.equal(rows.filter((row) => row.contract === 'json' && row.handoffValid).length, 11);
  assert.ok(rows.every((row) => row.parentSuccess && row.hierarchyValid));
  for (const row of rows) for (const field of ['nonce', 'prompt', 'text', 'transcript', 'startedAt', 'endedAt']) assert.equal(field in row, false);
  assert.match(report, /Decision: \*\*FREEZE_AND_PIVOT\*\*/);
  assert.match(report, /Net wins: 0/);
});

test('committed v0.3 evidence is complete and compact', async () => {
  const rows = (await readFile('benchmarks/results/2026-08-19-v03.jsonl', 'utf8'))
    .trim().split('\n').map(JSON.parse);
  assert.equal(rows.length, 384);
  assert.deepEqual(Object.fromEntries(['openai/gpt-5.6-luna', 'openai/gpt-5.6-sol', 'openai/gpt-5.6-terra', 'opencode/deepseek-v4-flash-free']
    .map((model) => [model, rows.filter((row) => row.model === model).length])), {
    'openai/gpt-5.6-luna': 48,
    'openai/gpt-5.6-sol': 144,
    'openai/gpt-5.6-terra': 48,
    'opencode/deepseek-v4-flash-free': 144,
  });
  for (const row of rows) {
    assert.equal('text' in row, false);
    assert.equal('invocations' in row, false);
    assert.equal('startedAt' in row, false);
    assert.equal('endedAt' in row, false);
    for (const category of ['facts', 'constraints', 'evidence', 'next']) assert.equal(typeof row[category], 'number');
    if (row.usage) assert.equal(row.totalTokens, Object.values(row.usage).reduce((sum, value) => sum + value, 0));
  }
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
  assert.match(readme, /384 records/);
  assert.match(readme, /96 parent→subagent attempts/i);
  assert.match(readme, /FREEZE_AND_PIVOT/);
  assert.match(readme, /192-attempt audit matrix/i);
  assert.match(readme, /MAINTENANCE_ONLY/);
  assert.match(readme, /used more tokens than simpler\s+baselines/i);
  assert.doesNotMatch(readme, /\+37% score per token over Cavecrew in the first smoke test/);
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
