// End-to-end check of the order workflow against a real SQLite database.
// Runs the app's own repositories in Node (Node 22+) with small stand-ins for
// the Expo native modules. Usage: npm run test:flow
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outfile = path.join(here, '.flow.cjs');

await build({
  entryPoints: [path.join(here, 'flow.test.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
  tsconfig: path.join(root, 'tsconfig.json'),
  nodePaths: [path.join(root, 'node_modules')],
  alias: {
    'expo-sqlite': path.join(here, 'shims/expo-sqlite.ts'),
    'expo-crypto': path.join(here, 'shims/expo-crypto.ts'),
    'expo-secure-store': path.join(here, 'shims/expo-secure-store.ts'),
    'react-native': path.join(here, 'shims/react-native.ts'),
  },
  logLevel: 'warning',
});

const result = spawnSync(process.execPath, ['--no-warnings', outfile], { stdio: 'inherit' });
process.exit(result.status ?? 1);
