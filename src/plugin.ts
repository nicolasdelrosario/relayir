import { readFile } from 'node:fs/promises';

type Input = Record<string, unknown>;
type Output = { system: string[] };
type Hooks = {
  event: (input: { event: any }) => Promise<void>;
  'experimental.chat.system.transform': (input: { sessionID?: string }, output: Output) => Promise<void>;
};
const contractURL = new URL('../contracts/opencode-h1-v1.md', import.meta.url);

export const server = async (_input: Input): Promise<Hooks> => {
  let contract: string | undefined;
  try { contract = await readFile(contractURL, 'utf8'); } catch { contract = undefined; }
  const children = new Set<string>();
  return {
    event: async ({ event }: { event: any }) => {
      try {
        const info = event?.properties?.info;
        if ((event?.type === 'session.created' || event?.type === 'session.updated') && info?.parentID && info?.id) children.add(info.id);
        if (event?.type === 'session.deleted' && info?.id) children.delete(info.id);
      } catch { /* fail open */ }
    },
    'experimental.chat.system.transform': async (input: { sessionID?: string }, output: Output) => {
      try {
        if (!input.sessionID || !children.has(input.sessionID) || !contract) return;
        if (output.system.length) output.system[output.system.length - 1] += `\n\n${contract}`;
        else output.system.push(contract);
      } catch { /* fail open */ }
    },
  };
};

export default { id: 'relayir', server };
