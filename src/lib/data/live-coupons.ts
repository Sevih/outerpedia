/**
 * LISTE VIVANTE des codes promo — la copie R2 (`data/coupons.json`) est la
 * SOURCE DE VÉRITÉ depuis le 25/09/2026 : deux écrivains la modifient, l'admin
 * local de Sevih et le staff via le bot Discord (`/coupon add|edit|remove`,
 * route `/api/internal/coupons`). `data/curated/coupons.json` n'en est plus
 * qu'un instantané (repli des lecteurs publics, historique git).
 *
 * Toute écriture est CONDITIONNELLE (ETag de la lecture) : un écrivain qui a lu
 * une liste périmée est refusé au lieu d'écraser l'ajout de l'autre.
 *
 * Les lecteurs PUBLICS ne passent pas par ici : ils lisent l'URL du CDN
 * (`lib/data/coupons` → `runtime-json`). Ce module lit l'API S3 directement,
 * sans cache, et exige les identifiants R2.
 */
import {
  applyCouponOp,
  validateCoupons,
  type CouponOp,
  type PromoCode,
} from '@/lib/data/promo-rules';
import { getR2Object, purgeEdge, putR2Object, RUNTIME_CACHE_CONTROL } from '@/lib/r2';

const KEY = 'data/coupons.json';

export interface LiveCoupons {
  list: PromoCode[];
  /** Jeton de version à rendre à l'écriture. */
  etag: string;
}

export async function readLiveCoupons(): Promise<LiveCoupons> {
  const obj = await getR2Object(KEY);
  if (!obj) throw new Error(`${KEY} absent de R2`);
  const list = JSON.parse(obj.body) as unknown;
  if (!Array.isArray(list)) throw new Error(`${KEY} : un tableau était attendu`);
  return { list: list as PromoCode[], etag: obj.etag };
}

export type WriteResult =
  | {
      ok: true;
      etag: string;
      purged: boolean;
      /** Le CDN sert déjà la nouvelle version (purge propagée). */
      edgeFresh: boolean;
      purgeError?: string;
    }
  | { ok: false; conflict: boolean; errors: string[] };

const CONFLICT_MSG =
  'The coupon list changed since it was loaded (someone else saved). Reload and retry.';

/**
 * Valide puis écrit `list` si la copie R2 est toujours celle de `etag`, puis
 * purge l'edge. JSON simplement indenté : l'instantané local, lui, est réécrit
 * au format canonique du repo par l'admin (`saveCoupons` → `writeJson`).
 */
export async function writeLiveCoupons(list: PromoCode[], etag: string): Promise<WriteResult> {
  const errors = validateCoupons(list);
  if (errors.length) return { ok: false, conflict: false, errors };

  const put = await putR2Object(KEY, `${JSON.stringify(list, null, 2)}\n`, {
    ifMatch: etag,
    contentType: 'application/json; charset=utf-8',
    cacheControl: RUNTIME_CACHE_CONTROL,
  });
  if (put === 'conflict') return { ok: false, conflict: true, errors: [CONFLICT_MSG] };

  const purge = await purgeEdge(KEY);
  const edgeFresh = purge.purged && (await waitForEdge(put.etag));
  return {
    ok: true,
    etag: put.etag,
    purged: purge.purged,
    edgeFresh,
    ...(purge.error ? { purgeError: purge.error } : {}),
  };
}

/** Attente maximale de la propagation de la purge Cloudflare. */
const EDGE_WAIT_MS = 10_000;
const EDGE_POLL_MS = 500;

/**
 * Attend que le CDN serve la version qu'on vient d'écrire. La purge Cloudflare
 * met quelques secondes à se propager : une page régénérée juste après relit
 * l'ANCIENNE copie et la remet en cache 10 min de chaque côté (constaté en
 * recette : `/coupon remove` écrit à 07:55:35, le CDN servait la copie de
 * 07:55:14, mise en cache APRÈS la suppression). D'où l'attente, AVANT que
 * l'appelant n'expire les pages.
 *
 * En GET, comme la page : un HEAD passe à travers le cache (`DYNAMIC`) et
 * répondrait « à jour » pendant que le GET sert encore l'ancienne copie.
 */
async function waitForEdge(etag: string): Promise<boolean> {
  const base = process.env.NEXT_PUBLIC_IMG_BASE;
  if (!base) return false;
  const want = etag.replace(/^W\//, '').replace(/"/g, '');
  const deadline = Date.now() + EDGE_WAIT_MS;
  while (Date.now() < deadline) {
    const res = await fetch(`${base}/${KEY}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    }).catch(() => undefined);
    await res?.body?.cancel().catch(() => {});
    const got = res?.headers.get('etag')?.replace(/^W\//, '').replace(/"/g, '');
    if (got === want) return true;
    await new Promise((r) => setTimeout(r, EDGE_POLL_MS));
  }
  return false;
}

/** Tentatives d'une opération du bot quand un autre écrivain passe entre la lecture et l'écriture. */
const OP_ATTEMPTS = 3;

/**
 * Opération unitaire (bot) : relit, applique, écrit. Contrairement à l'éditeur
 * de l'admin, qui renvoie une liste ENTIÈRE et doit donc s'arrêter au conflit,
 * une opération se RÉAPPLIQUE sans risque sur la liste fraîche : on réessaie.
 */
export async function applyLiveCouponOp(op: CouponOp): Promise<WriteResult> {
  for (let attempt = 1; ; attempt++) {
    const { list, etag } = await readLiveCoupons();
    const applied = applyCouponOp(list, op);
    if (!applied.ok) return { ok: false, conflict: false, errors: applied.errors };
    const res = await writeLiveCoupons(applied.list, etag);
    if (res.ok || !res.conflict || attempt >= OP_ATTEMPTS) return res;
  }
}
