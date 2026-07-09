/**
 * PUSH des assets : `pnpm assets:push`.
 *
 * Pousse le staging local (`.assets-staging/`, produit par `assets:collect`)
 * vers le bucket R2 via rclone (S3), avec cache immutable (les noms de jeu sont
 * stables ; un patch AJOUTE des fichiers). Identifiants lus dans `.env.local`.
 *
 * Prérequis : rclone (winget install Rclone.Rclone).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const STAGING = resolve('.assets-staging');

// .env.local : parse minimal KEY=VALUE (pas de dépendance).
const env = {};
try {
  for (const line of readFileSync(resolve('.env.local'), 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) env[m[1]] = m[2];
  }
} catch {
  /* pas de .env.local */
}

const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;
if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error(
    'R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY requis dans .env.local',
  );
  process.exit(1);
}
if (!existsSync(STAGING)) {
  console.error(`Staging introuvable (${STAGING}) — lance d'abord : pnpm assets:collect`);
  process.exit(1);
}
// PAS de `shell: true` : le shell Windows re-découperait les arguments sur les
// espaces (chemin « Projet perso », header Cache-Control) — rclone est un vrai
// .exe, spawn direct avec arguments verbatim.
if (spawnSync('rclone', ['version'], { stdio: 'ignore' }).status !== 0) {
  console.error('rclone introuvable — installe-le : winget install Rclone.Rclone');
  process.exit(1);
}

// `copy` (jamais de suppression distante) + skip des fichiers identiques.
// Les assets sont IMMUABLES et ADDITIFS (noms = contenu du jeu, un patch ajoute
// des fichiers, n'en modifie jamais) → `--ignore-existing` : un nom déjà présent
// est sauté SANS aucune comparaison checksum/date. `--fast-list` liste R2 en
// requêtes groupées (moins d'appels API, plus rapide quand le bucket grossit).
const args = [
  'copy',
  STAGING,
  `:s3:${R2_BUCKET}`,
  '--exclude',
  'manifest-report.json',
  '--header-upload',
  'Cache-Control: public, max-age=31536000, immutable',
  '--s3-no-check-bucket',
  '--ignore-existing',
  '--fast-list',
  '--checkers',
  '32',
  '--transfers',
  '16',
  '--progress',
];
const res = spawnSync('rclone', args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    RCLONE_S3_PROVIDER: 'Cloudflare',
    RCLONE_S3_ENDPOINT: R2_ENDPOINT,
    RCLONE_S3_ACCESS_KEY_ID: R2_ACCESS_KEY_ID,
    RCLONE_S3_SECRET_ACCESS_KEY: R2_SECRET_ACCESS_KEY,
  },
});
process.exit(res.status ?? 1);
