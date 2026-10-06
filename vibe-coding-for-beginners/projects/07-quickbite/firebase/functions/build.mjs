// Bundles the functions with the shared workspace packages (@quickbite/core,
// @quickbite/server) into lib/index.js. firebase-admin and firebase-functions
// stay external: Cloud Functions installs them from package.json.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  external: ['firebase-admin', 'firebase-functions'],
  logLevel: 'info',
});
