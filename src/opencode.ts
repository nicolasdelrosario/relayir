import { spawn } from 'node:child_process';

export type Usage = { input: number; output: number; reasoning: number; cacheRead: number; cacheWrite: number };
export type Invocation = { text: string; usage?: Usage; startedAt: string; endedAt: string; exitCode: number | null; error?: string };
const n = (v: unknown) => typeof v === 'number' && Number.isFinite(v) ? v : 0;
export function buildOpenCodeArgs(prompt: string, model: string): string[] { return ['run', '--pure', '--format', 'json', '--model', model, '--agent', 'relayir-benchmark', prompt]; }
export function isAgentFallbackStderr(stderr: string): boolean { return /falling back to default agent|agent unavailable/i.test(stderr); }

export function parseEvents(output: string): Invocation {
  const startedAt = new Date().toISOString(), events: any[] = [];
  for (const line of output.split('\n').filter(Boolean)) { try { events.push(JSON.parse(line)); } catch { throw new Error('malformed OpenCode JSON event'); } }
  const roots = new Set(events.map((e) => e.sessionID).filter(Boolean)); if (roots.size !== 1) throw new Error('expected exactly one root session ID');
  if (events.some((e) => typeof e.type !== 'string' || typeof e.sessionID !== 'string' || (e.type === 'text' && (typeof e.part?.messageID !== 'string' || typeof e.part?.text !== 'string')) || (e.type === 'step_finish' && typeof e.part?.messageID !== 'string'))) throw new Error('malformed OpenCode event');
  const finishes = events.filter((e) => e.type === 'step_finish' && e.sessionID === [...roots][0]);
  const finalMessage = finishes.at(-1)?.part?.messageID; if (!finalMessage) throw new Error('missing final step_finish messageID');
  const text = events.filter((e) => e.type === 'text' && e.sessionID === [...roots][0] && e.part.messageID === finalMessage).map((e) => e.part.text).join('');
  if (!text) throw new Error('final assistant message has no text');
  const parts = finishes.map((e) => e.part?.tokens).filter(Boolean); let usage: Usage | undefined;
  if (parts.length) usage = parts.reduce((a, t) => ({ input: a.input + n(t.input), output: a.output + n(t.output), reasoning: a.reasoning + n(t.reasoning), cacheRead: a.cacheRead + n(t.cache?.read), cacheWrite: a.cacheWrite + n(t.cache?.write) }), { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 });
  return { text, usage, startedAt, endedAt: new Date().toISOString(), exitCode: 0 };
}

export function invokeOpenCode({ prompt, model, timeoutMs, command = 'opencode' }: { prompt: string; model: string; timeoutMs: number; command?: string }): Promise<Invocation> {
  const startedAt = new Date().toISOString(), args = buildOpenCodeArgs(prompt, model);
  return new Promise((resolve) => { const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] }); let out = '', err = '', timedOut = false, settled = false, killTimer: ReturnType<typeof setTimeout> | undefined; const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); killTimer = setTimeout(() => { if (!settled) child.kill('SIGKILL'); }, 100); }, timeoutMs); const finish = (result: Invocation) => { if (settled) return; settled = true; clearTimeout(timer); if (killTimer) clearTimeout(killTimer); resolve(result); }; child.stdout.on('data', (d) => { out += d; }); child.stderr.on('data', (d) => { err += d; }); child.once('error', (error) => finish({ text: '', startedAt, endedAt: new Date().toISOString(), exitCode: null, error: error.message })); child.once('close', (exitCode) => { const endedAt = new Date().toISOString(); if (timedOut) return finish({ text: '', startedAt, endedAt, exitCode, error: 'timeout' }); if (isAgentFallbackStderr(err)) return finish({ text: '', startedAt, endedAt, exitCode, error: 'requested agent unavailable or fallback' }); if (exitCode !== 0) return finish({ text: '', startedAt, endedAt, exitCode, error: err.trim() || 'OpenCode failed' }); try { finish({ ...parseEvents(out), startedAt, endedAt }); } catch (e) { finish({ text: '', startedAt, endedAt, exitCode, error: (e as Error).message }); } }); });
}
