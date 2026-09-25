/**
 * PUBLICATION RUNTIME des JSON curés : pousse un fichier de `data/curated/` sur
 * R2 (namespace `data/`) et purge l'edge — appelée par la sauvegarde admin (et
 * l'ancien réimport). C'est ce qui permet aux loaders runtime de `lib/home`
 * (bannières, événements) de servir une édition SANS redéploiement du site.
 *
 * PAS les coupons : depuis le 25/09/2026, leur copie R2 est la SOURCE DE VÉRITÉ
 * (le staff en ajoute depuis Discord) et ne s'écrit que conditionnellement, par
 * `lib/data/live-coupons` — pousser le fichier local l'écraserait.
 *
 * Mêmes conventions que `scripts/assets-push.mjs` (rclone spawn direct sans
 * shell, purge Cloudflare par API), avec deux différences assumées :
 *   - identifiants lus dans `process.env` (Next charge `.env.local` en dev —
 *     pas de parse maison) ;
 *   - `s-maxage` COURT (10 min) au lieu d'un an : donnée vive, pas un asset
 *     quasi-immuable — même si la purge échoue, l'edge se rafraîchit seul.
 * Fraîcheur pire cas SANS purge : 10 min d'edge + 10 min de cache fetch Next.
 *
 * Ne jette jamais : la sauvegarde LOCALE a déjà réussi, l'appelant relaie
 * l'éventuel échec de publication (l'admin le lit et republie).
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { purgeEdge, RUNTIME_CACHE_CONTROL } from '@/lib/r2';

/**
 * Fichiers curés publiés en runtime (`data/curated/<name>` → clé `data/<name>`).
 * AUSSI copiés dans le staging par `assets:collect` : le flux `pnpm commit`
 * (→ `pnpm images`) resynchronise R2 même quand une édition a contourné le
 * Save admin.
 */
export const RUNTIME_DATA_FILES = ['banner.json', 'events.json'] as const;

export interface RuntimePublishResult {
  ok: boolean;
  /** Purge edge effectuée (sans elle, l'edge se rafraîchit seul en ≤ 10 min). */
  purged: boolean;
  error?: string;
}

/** Pousse `data/curated/<name>` vers la clé bucket `data/<name>` + purge edge. */
async function publishRuntimeJson(name: string): Promise<RuntimePublishResult> {
  const src = resolve(process.cwd(), 'data/curated', name);
  const key = `data/${name}`;

  const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return {
      ok: false,
      purged: false,
      error: 'R2_* absents de .env.local — publication sautée (fichier local sauvé).',
    };
  }

  // Spawn direct sans shell (cf. assets-push : le shell Windows redécouperait
  // les arguments sur les espaces du chemin et du header).
  const res = spawnSync(
    'rclone',
    [
      'copyto',
      src,
      `:s3:${R2_BUCKET}/${key}`,
      '--header-upload',
      `Cache-Control: ${RUNTIME_CACHE_CONTROL}`,
      '--s3-no-check-bucket',
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        RCLONE_S3_PROVIDER: 'Cloudflare',
        RCLONE_S3_ENDPOINT: R2_ENDPOINT,
        RCLONE_S3_ACCESS_KEY_ID: R2_ACCESS_KEY_ID,
        RCLONE_S3_SECRET_ACCESS_KEY: R2_SECRET_ACCESS_KEY,
      },
    },
  );
  if (res.error) {
    return {
      ok: false,
      purged: false,
      error: `rclone introuvable (winget install Rclone.Rclone) : ${res.error.message}`,
    };
  }
  if (res.status !== 0) {
    return {
      ok: false,
      purged: false,
      error: `rclone a échoué : ${res.stderr?.trim() || res.status}`,
    };
  }

  // Purge edge de la seule URL — sans jeton, le s-maxage court borne le retard.
  const purge = await purgeEdge(key);
  return { ok: true, ...purge };
}

export const publishBanners = (): Promise<RuntimePublishResult> =>
  publishRuntimeJson('banner.json');
export const publishEvents = (): Promise<RuntimePublishResult> => publishRuntimeJson('events.json');
