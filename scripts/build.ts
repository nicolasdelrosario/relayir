import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

await mkdir('dist', { recursive: true });
for (const name of ['protocol', 'plugin']) {
  const source = await readFile(`src/${name}.ts`, 'utf8');
  await writeFile(`dist/${name}.js`, stripTypeScriptTypes(source, { mode: 'transform' }));
}
