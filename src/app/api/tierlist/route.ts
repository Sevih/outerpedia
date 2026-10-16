import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { createRateLimiter, createWriteQuota, clientIp } from '@/lib/rate-limit';
import { ensureTable, payloadId, purgeIfDue, MAX_PAYLOAD } from './_store';

export const dynamic = 'force-dynamic';

/**
 * POST { z } → stocke la tier-list encodée, répond { id } (id court à mettre
 * dans `?s=`). Portage à l'identique. Sans BDD configurée (dev) : 503, le client garde
 * son lien long `?z=` autoporté.
 */

const rateLimited = createRateLimiter();
// 60 lignes nouvelles par minute au plus, toutes IP confondues : un partage
// est un geste ponctuel (l'ancien site n'avait gardé que quelques dizaines de
// liens en tout), le plafond ne se voit qu'en cas de flot. Refusé, le client
// garde son lien long `?z=`.
const writeQuotaExceeded = createWriteQuota({ max: 60 });

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let z: unknown;
  try {
    z = ((await request.json()) as { z?: unknown })?.z;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  // `z[0] === '1'` : préfixe de version du format d'encodage (cf. share-codec).
  // ASCII imprimable seulement : la colonne est `CHARSET=ascii` (hash-store) —
  // hors ASCII, MySQL strict répond 500, MySQL laxiste substitue `?` et l'id
  // (hash du `z` ORIGINAL) servirait un payload altéré. Le codec n'émet que
  // base64url, la garde ne refuse donc rien de légitime.
  if (
    typeof z !== 'string' ||
    z.length < 2 ||
    z.length > MAX_PAYLOAD ||
    z[0] !== '1' ||
    !/^[!-~]+$/.test(z)
  ) {
    return NextResponse.json({ error: 'bad_payload' }, { status: 400 });
  }

  if (writeQuotaExceeded()) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const conn = await getDbConnection();
  if (!conn) return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  try {
    await ensureTable(conn);
    const id = payloadId(z);
    // Même payload ⇒ même id ; l'upsert rend l'appel idempotent. Re-partager
    // une liste existante, c'est qu'elle circule encore : elle repart pour 12 mois.
    await conn.execute(
      'INSERT INTO tier_lists (id, payload) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_access = CURRENT_TIMESTAMP',
      [id, z],
    );
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: 'storage_error' }, { status: 500 });
  } finally {
    // La réponse est calculée : la purge du jour passe sur cette connexion
    // avant de la rendre (sans effet si la table n'est pas prête).
    await purgeIfDue(conn);
    await conn.end().catch(() => {});
  }
}
