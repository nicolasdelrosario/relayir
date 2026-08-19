import { writeFile } from 'node:fs/promises';
import { parseAgenticReportArgs, readAgenticRecords, renderAgenticReport } from '../src/agentic-report.ts';
const { inputs, output } = parseAgenticReportArgs(process.argv.slice(2)); await writeFile(output, renderAgenticReport(await readAgenticRecords(inputs))); console.log(`agentic report written to ${output}`);
