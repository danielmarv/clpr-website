// Builds the explainer into the website's public/plumbing/ so Next serves it at /plumbing/.
// Runs Astro's own executable directly (no nested package-manager call), from any working directory.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const astroPackage = require.resolve('astro/package.json');
const astro = join(dirname(astroPackage), require(astroPackage).bin.astro);
const outDir = join(here, '..', 'public', 'plumbing');

const result = spawnSync(process.execPath, [astro, 'build', '--outDir', outDir], {
  cwd: here,
  stdio: 'inherit',
  env: { ...process.env, BASE_PATH: '/plumbing/' },
});
process.exit(result.status ?? 1);
