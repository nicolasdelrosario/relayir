import { readFile } from 'node:fs/promises';
const contractURL = new URL('../contracts/opencode-h1-v1.md', import.meta.url);
export const server = async (_input)=>{
    let contract;
    try {
        contract = await readFile(contractURL, 'utf8');
    } catch  {
        contract = undefined;
    }
    const children = new Set();
    return {
        event: async ({ event })=>{
            try {
                const info = event?.properties?.info;
                if ((event?.type === 'session.created' || event?.type === 'session.updated') && info?.parentID && info?.id) children.add(info.id);
                if (event?.type === 'session.deleted' && info?.id) children.delete(info.id);
            } catch  {}
        },
        'experimental.chat.system.transform': async (input, output)=>{
            try {
                if (!input.sessionID || !children.has(input.sessionID) || !contract) return;
                if (output.system.length) output.system[output.system.length - 1] += `\n\n${contract}`;
                else output.system.push(contract);
            } catch  {}
        }
    };
};
export default {
    id: 'relayir',
    server
};
