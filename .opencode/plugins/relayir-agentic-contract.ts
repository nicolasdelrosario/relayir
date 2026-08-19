import { readFile } from 'node:fs/promises';

const files: Record<string, string> = {
  'free-prose': 'contracts/free-prose-v1.md',
  cavecrew: 'contracts/cavecrew-v1.md',
  json: 'contracts/json-v1.md',
  h1: 'contracts/opencode-h1-v1.md',
};

export const server = async () => {
  const selected = process.env.RELAYIR_AGENTIC_CONTRACT;
  if (!selected || !files[selected]) return { event: async () => {}, 'experimental.chat.system.transform': async () => {} };
  let contract: string;
  try { contract = await readFile(new URL(`../../${files[selected]}`, import.meta.url), 'utf8'); } catch { return { event: async () => {}, 'experimental.chat.system.transform': async () => {} }; }
  const children = new Set<string>();
  return {
    event: async ({ event }: { event: any }) => {
      try { const info = event?.properties?.info; if ((event?.type === 'session.created' || event?.type === 'session.updated') && info?.id && info?.parentID) children.add(info.id); if (event?.type === 'session.deleted' && info?.id) children.delete(info.id); } catch { /* fail open */ }
    },
    'experimental.chat.system.transform': async (input: { sessionID?: string }, output: { system: string[] }) => {
      try { if (!input.sessionID || !children.has(input.sessionID)) return; if (output.system.length) output.system[output.system.length - 1] += `\n\n${contract}`; else output.system.push(contract); } catch { /* fail open */ }
    },
  };
};

export default { id: 'relayir-agentic-contract', server };
