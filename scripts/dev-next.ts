/**
 * dev-next — lance `next dev` en filtrant son journal de requêtes.
 *
 * Next ne sait ignorer des requêtes que par motif d'URL
 * (`logging.incomingRequests.ignore`), jamais par statut. Or en dev `/images/*`
 * est servi par la route locale (src/app/images/[...path]/route.dev.ts) et
 * chaque page en tire des dizaines : le terminal se noyait dans des `200`.
 * On ne veut les voir QUE quand ça se passe mal (404 = asset pas collecté,
 * 400 = traversal refusé…). D'où ce filtre sur la sortie de Next : toute ligne
 * de requête `/images/...` servie en 200 est tue, tout le reste passe intact.
 *
 * Invoqué par `pnpm dev` (concurrently) à la place de `next dev` ; les
 * arguments sont transmis tels quels (`--webpack`…). Avant ce wrapper, Next
 * était déjà piped par concurrently : rien ne change pour lui (TTY, couleurs).
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const nextBin = resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

// Ligne de journal d'une image servie sans incident — le seul bruit qu'on tait.
// Format Next : ` GET /images/equipment/x.webp 200 in 58ms (next.js: …)`.
const QUIET = /^\s*(GET|HEAD) \/images\/\S+ 200 in /;

// Les couleurs éventuelles (picocolors) ne doivent pas faire rater le motif.
const ANSI = /\x1b\[[0-9;]*m/g;
const isQuiet = (line: string) => QUIET.test(line.replace(ANSI, ''));

const child = spawn(process.execPath, [nextBin, 'dev', ...process.argv.slice(2)], {
  stdio: ['inherit', 'pipe', 'inherit'],
});

// Les chunks ne tombent pas sur des fins de ligne : on garde le reliquat.
let carry = '';
child.stdout.on('data', (chunk: Buffer) => {
  const lines = (carry + chunk.toString()).split('\n');
  carry = lines.pop() ?? '';
  const kept = lines.filter((line) => !isQuiet(line));
  if (kept.length) process.stdout.write(kept.join('\n') + '\n');
});
child.stdout.on('end', () => {
  if (carry && !isQuiet(carry)) process.stdout.write(carry);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
