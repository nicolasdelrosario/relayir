import { readFile } from 'node:fs/promises';

export type AgenticRecord = { parentModel: string; contract: string; task: string; trial: number; parentSuccess: boolean; hierarchyValid: boolean; handoffValid: boolean; totalTokens: number|null; latencyMs: number; totalUsage?: unknown };
const median = (xs: number[]) => { if (!xs.length) return null; const a = [...xs].sort((x, y) => x-y), m = (a.length-1)/2; return (a[Math.floor(m)] + a[Math.ceil(m)])/2; };
const fmt = (x: number|null) => x == null ? '—' : Number(x.toFixed(2)).toString();
const cell = (r: AgenticRecord) => `${r.parentModel}\0${r.task}\0${r.trial}`;
const groups = (rows: AgenticRecord[]) => [...new Map(rows.map((r) => [`${r.parentModel}\0${r.contract}`, rows.filter((x) => x.parentModel === r.parentModel && x.contract === r.contract)])).entries()].sort(([a],[b]) => a.localeCompare(b));

export function gateDecision(rows: AgenticRecord[]) {
  const parents = [...new Set(rows.map((r) => r.parentModel))], expectedContracts = [...new Set(rows.filter((r) => r.contract !== 'h1').map((r) => r.contract))], perParent: Record<string, any> = {};
  for (const parent of parents) {
    const h1 = rows.filter((r) => r.parentModel === parent && r.contract === 'h1'), reductions: number[] = [];
    let wins = 0, losses = 0, tokenComplete = true;
    for (const h of h1) {
      const matched = rows.filter((r) => r.parentModel === parent && r.task === h.task && r.trial === h.trial), baseline = matched.filter((r) => r.contract !== 'h1');
      const baselineSuccess = baseline.some((r) => r.parentSuccess);
      if (h.parentSuccess && !baselineSuccess) wins++;
      else if (!h.parentSuccess && baselineSuccess) losses++;
      if (!matched.length || matched.length !== expectedContracts.length + 1 || !expectedContracts.every((contract) => matched.some((r) => r.contract === contract)) || matched.some((r) => !r.parentSuccess || !r.hierarchyValid || !r.handoffValid || r.totalTokens == null)) tokenComplete = false;
      const successfulBaseline = baseline.filter((r) => r.parentSuccess && r.totalTokens != null).map((r) => r.totalTokens!);
      if (h.totalTokens != null && successfulBaseline.length && Math.min(...successfulBaseline) > 0) reductions.push((Math.min(...successfulBaseline) - h.totalTokens) / Math.min(...successfulBaseline));
    }
    perParent[parent] = { wins, losses, netWins: wins-losses, medianTokenReduction: median(reductions), tokenComplete };
  }
  const h1UniqueWins = Object.values(perParent).reduce((n: number, x: any) => n+x.wins, 0), h1Losses = Object.values(perParent).reduce((n: number, x: any) => n+x.losses, 0), netWins = h1UniqueWins-h1Losses;
  const tokenGate = parents.length > 0 && parents.every((p) => perParent[p].tokenComplete && (perParent[p].medianTokenReduction ?? 0) >= .1);
  const cont = (netWins >= 3 && parents.every((p) => perParent[p].netWins >= 0)) || tokenGate;
  return { decision: cont ? 'CONTINUE' : 'FREEZE_AND_PIVOT', h1UniqueWins, h1Losses, netWins, medianTokenReduction: median(Object.values(perParent).flatMap((x: any) => x.medianTokenReduction == null ? [] : [x.medianTokenReduction])), perParent };
}

export async function readAgenticRecords(files: string[]): Promise<AgenticRecord[]> { const rows: AgenticRecord[] = []; for (const file of files) for (const line of (await readFile(file, 'utf8')).split('\n').filter(Boolean)) rows.push(JSON.parse(line)); return rows; }
export function parseAgenticReportArgs(args: string[]) { const oi = args.indexOf('--output'); if (oi < 0 || !args[oi+1] || args[oi+1].startsWith('-')) throw new Error('usage: agentic-report <input.jsonl> [...] --output <output.md>'); const inputs = args.filter((x, i) => i !== oi && i !== oi+1 && !x.startsWith('-')); if (!inputs.length) throw new Error('at least one input JSONL is required'); return { inputs, output: args[oi+1] }; }
export function renderAgenticReport(rows: AgenticRecord[]) { const out = ['# RelayIR v0.3.1 agentic benchmark', '', '| Parent model | Contract | n | Parent success | Hierarchy valid | Handoff valid | Missing usage | Median combined tokens | Median latency ms |', '|---|---|---:|---:|---:|---:|---:|---:|---:']; for (const [key, group] of groups(rows)) { const [parent, contract] = key.split('\0'); out.push(`| ${parent} | ${contract} | ${group.length} | ${fmt(group.filter((r)=>r.parentSuccess).length/group.length)} | ${fmt(group.filter((r)=>r.hierarchyValid).length/group.length)} | ${fmt(group.filter((r)=>r.handoffValid).length/group.length)} | ${group.filter((r)=>r.totalTokens == null).length} | ${fmt(median(group.flatMap((r)=>r.totalTokens == null ? [] : [r.totalTokens])))} | ${fmt(median(group.map((r)=>r.latencyMs)))} |`); } const gate = gateDecision(rows); out.push('', '## Freeze / pivot gate', '', `- Decision: **${gate.decision}**`, `- H1 unique wins: ${gate.h1UniqueWins}`, `- H1 losses: ${gate.h1Losses}`, `- Net wins: ${gate.netWins}`, `- Median token reduction: ${fmt(gate.medianTokenReduction)}`); return out.join('\n') + '\n'; }
