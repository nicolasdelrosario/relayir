import { writeFile } from 'node:fs/promises';
import { readRecords, renderReport } from '../src/report.ts';
const args = process.argv.slice(2), index = args.indexOf('--output'), output = index < 0 ? undefined : args[index + 1], files = index < 0 ? args : args.filter((x, i) => x !== '--output' && i !== index + 1);
if (!files.length) throw new Error('usage: npm run benchmark:report -- results/*.jsonl [--output report.md]');
const markdown = renderReport(await readRecords(files));
if (output) await writeFile(output, markdown); else process.stdout.write(markdown);
