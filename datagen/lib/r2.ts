/**
 * r2 — runner rclone minimal pour le bucket R2, PARTAGÉ par les bootstraps
 * (`datagen:tools`, `datagen:dump`) et `assets:pull`.
 *
 * Réutilise EXACTEMENT le schéma de scripts/assets-push.mjs : connexion S3
 * anonyme `:s3:`, identifiants lus dans `.env.local` (parse maison, sans dépendance)
 * et passés à rclone par variables d'environnement. Aucune config rclone requise.
 *
 * Prérequis : rclone (winget install Rclone.Rclone).
 */
import { spawnSync } from 'node:child_process';
import { loadEnvLocal } from './env';

export type R2Env = {
  R2_ENDPOINT: string;
  R2_BUCKET: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
};

/** Identifiants R2 requis, ou lève avec un message explicite. */
export function r2Env(): R2Env {
  const env = loadEnvLocal();
  const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;
  if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      'R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY requis dans .env.local',
    );
  }
  return { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY };
}

function ensureRclone(): void {
  if (spawnSync('rclone', ['version'], { stdio: 'ignore' }).status !== 0) {
    throw new Error('rclone introuvable — installe-le : winget install Rclone.Rclone');
  }
}

/** `rclone <args>` avec les identifiants R2 en env. Lève si le code ≠ 0. */
export function rclone(args: string[], env: R2Env = r2Env()): void {
  ensureRclone();
  const res = spawnSync('rclone', args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      RCLONE_S3_PROVIDER: 'Cloudflare',
      RCLONE_S3_ENDPOINT: env.R2_ENDPOINT,
      RCLONE_S3_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
      RCLONE_S3_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
    },
  });
  if (res.status !== 0) {
    throw new Error(`rclone a échoué (code ${res.status ?? '?'}) : rclone ${args.join(' ')}`);
  }
}

/** Copie `:s3:BUCKET/<srcPrefix>` → `<destDir>` (récupération d'artefacts). */
export function r2Copy(srcPrefix: string, destDir: string, extra: string[] = []): void {
  const env = r2Env();
  rclone(
    [
      'copy',
      `:s3:${env.R2_BUCKET}/${srcPrefix}`,
      destDir,
      '--s3-no-check-bucket',
      '--transfers',
      '16',
      '--progress',
      ...extra,
    ],
    env,
  );
}
