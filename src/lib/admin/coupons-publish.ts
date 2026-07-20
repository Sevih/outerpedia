/**
 * PUBLICATION RUNTIME des coupons : pousse `data/curated/coupons.json` sur R2
 * (`data/coupons.json`) et purge l'edge — appelée par la sauvegarde admin (et le
 * regen V2). C'est ce qui permet à `loadCoupons` (lib/home) de servir un code
 * SANS redéploiement du site.
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

const SRC = resolve(process.cwd(), 'data/curated/coupons.json');
/** Clé bucket (namespace `data/` : les JSON runtime, distincts des images). */
const KEY = 'data/coupons.json';
const CACHE_CONTROL = 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600';

export interface CouponsPublishResult {
  ok: boolean;
  /** Purge edge effectuée (sans elle, l'edge se rafraîchit seul en ≤ 10 min). */
  purged: boolean;
  error?: string;
}

export async function publishCoupons(): Promise<CouponsPublishResult> {
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
      SRC,
      `:s3:${R2_BUCKET}/${KEY}`,
      '--header-upload',
      `Cache-Control: ${CACHE_CONTROL}`,
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
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, NEXT_PUBLIC_IMG_BASE } = process.env;
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID || !NEXT_PUBLIC_IMG_BASE) {
    return {
      ok: true,
      purged: false,
      error: 'purge edge sautée (CLOUDFLARE_* absents) — visible en ≤ 20 min.',
    };
  }
  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: [`${NEXT_PUBLIC_IMG_BASE}/${KEY}`] }),
      },
    );
    if (!r.ok) return { ok: true, purged: false, error: `purge edge en échec (HTTP ${r.status}).` };
  } catch (e) {
    return { ok: true, purged: false, error: `purge edge en échec : ${(e as Error).message}` };
  }
  return { ok: true, purged: true };
}
