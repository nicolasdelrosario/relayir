import test from 'node:test';
import assert from 'node:assert/strict';
import plugin from '../src/plugin.ts';

const init = () => plugin.server({});
const created = (id: string, parentID = 'root') => ({ type: 'session.created', properties: { info: { id, parentID } } });
const deleted = (id: string) => ({ type: 'session.deleted', properties: { info: { id } } });

test('exports the OpenCode server module', () => {
  assert.equal(plugin.id, 'relayir');
  assert.equal(typeof plugin.server, 'function');
});

test('leaves root sessions unchanged and injects children', async () => {
  const hooks = await init(), root = { system: ['base'] }, child = { system: ['base'] };
  await hooks.event?.({ event: created('child') });
  await hooks['experimental.chat.system.transform']?.({ sessionID: 'root' }, root);
  await hooks['experimental.chat.system.transform']?.({ sessionID: 'child' }, child);
  assert.deepEqual(root.system, ['base']);
  assert.match(child.system[0], /RelayIR H1 output requirement/);
});

test('appends to the last system string or pushes when empty', async () => {
  const hooks = await init();
  await hooks.event?.({ event: created('child') });
  const existing = { system: ['one', 'two'] }, empty = { system: [] };
  await hooks['experimental.chat.system.transform']?.({ sessionID: 'child' }, existing);
  await hooks['experimental.chat.system.transform']?.({ sessionID: 'child' }, empty);
  assert.match(existing.system[0], /^one$/);
  assert.match(existing.system[1], /two\n\nRelayIR H1/);
  assert.match(empty.system[0], /^RelayIR H1/);
});

test('no session ID is a no-op and deletion cleans up', async () => {
  const hooks = await init(), output = { system: ['base'] };
  await hooks.event?.({ event: created('child') });
  await hooks['experimental.chat.system.transform']?.({}, output);
  assert.deepEqual(output.system, ['base']);
  await hooks.event?.({ event: deleted('child') });
  await hooks['experimental.chat.system.transform']?.({ sessionID: 'child' }, output);
  assert.deepEqual(output.system, ['base']);
});

test('recognizes an existing child from a session update', async () => {
  const hooks = await init(), output = { system: ['base'] };
  await hooks.event?.({ event: { type: 'session.updated', properties: { info: { id: 'child', parentID: 'root' } } } });
  await hooks['experimental.chat.system.transform']?.({ sessionID: 'child' }, output);
  assert.match(output.system[0], /RelayIR H1 output requirement/);
});
