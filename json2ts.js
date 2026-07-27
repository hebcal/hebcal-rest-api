import fs from 'node:fs';
import path from 'node:path';

// Emits a TypeScript module for each JSON data file, so `tsc` can compile it
// into dist/esm alongside everything else. `resolveJsonModule` would type the
// import but leave the .json behind, which Node ESM cannot import without an
// import attribute.
for (const arg of process.argv.slice(2)) {
  const outpath = './src/' + path.basename(arg) + '.ts';
  console.log(`${arg} => ${outpath}`);
  const data = JSON.parse(fs.readFileSync(arg, 'utf8'));
  fs.writeFileSync(
    outpath,
    'const data: Record<string, string> = ' +
      JSON.stringify(data, null, 0) +
      ';\nexport default data;\n'
  );
}
