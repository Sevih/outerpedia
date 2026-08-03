import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
import { createRateLimiter, clientIp } from '@/lib/rate-limit';
import { ensureTable, isInternalPath, pathId, MAX_PATH } from '@/lib/short-links';

export const dynamic = 'force-dynamic';

/**
 * POST { path } → stocke le chemin INTERNE, répond { id } (à mettre dans
 * `/s/[id]`). Sans BDD configurée (dev) : 503, le client garde son lien long
 * `?z=` autoporté — même dégradation que le partage tier-list.
 */

const rateLimited = createRateLimiter();

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let path: unknown;
  try {
    path = ((await request.json()) as { path?: unknown })?.path;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  if (typeof path !== 'string' || path.length > MAX_PATH || !isInternalPath(path)) {
    return NextResponse.json({ error: 'bad_path' }, { status: 400 });
  }

  const conn = await getDbConnection();
  if (!conn) return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  try {
    await ensureTable(conn);
    const id = pathId(path);
    // Même chemin ⇒ même id ; l'upsert rend l'appel idempotent.
    await conn.execute(
      'INSERT INTO short_links (id, path) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id',
      [id, path],
    );
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: 'storage_error' }, { status: 500 });
  } finally {
    await conn.end().catch(() => {});
  }
}
