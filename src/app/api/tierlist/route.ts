import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { createRateLimiter, clientIp } from '@/lib/rate-limit';
import { ensureTable, payloadId, MAX_PAYLOAD } from './_store';

export const dynamic = 'force-dynamic';

/**
 * POST { z } → stocke la tier-list encodée, répond { id } (id court à mettre
 * dans `?s=`). Portage à l'identique. Sans BDD configurée (dev) : 503, le client garde
 * son lien long `?z=` autoporté.
 */

const rateLimited = createRateLimiter();

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
  if (typeof z !== 'string' || z.length < 2 || z.length > MAX_PAYLOAD || z[0] !== '1') {
    return NextResponse.json({ error: 'bad_payload' }, { status: 400 });
  }

  const conn = await getDbConnection();
  if (!conn) return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  try {
    await ensureTable(conn);
    const id = payloadId(z);
    // Même payload ⇒ même id ; l'upsert rend l'appel idempotent.
    await conn.execute(
      'INSERT INTO tier_lists (id, payload) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id',
      [id, z],
    );
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: 'storage_error' }, { status: 500 });
  } finally {
    await conn.end().catch(() => {});
  }
}
