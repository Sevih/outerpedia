import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getDbConnection } from '@/lib/db';
import { ensureTable, ID_RE } from '@/lib/short-links';

export const dynamic = 'force-dynamic';

/**
 * GET /s/[id] → 302 vers le chemin interne enregistré (POST /api/shortlink).
 *
 * La redirection est RELATIVE À L'HÔTE APPELÉ : le chemin stocké est sans
 * langue, c'est le sous-domaine du lien partagé qui la porte —
 * jp.outerpedia.com/s/xyz redirige vers jp.outerpedia.com/…. Le proxy i18n
 * (src/proxy.ts) exclut `/s/` de la réécriture pour que cette route racine
 * soit atteinte telle quelle.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_RE.test(id)) return new NextResponse(null, { status: 404 });

  const conn = await getDbConnection();
  if (!conn) return new NextResponse(null, { status: 503 });
  try {
    await ensureTable(conn);
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT path FROM short_links WHERE id = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    if (!row) return new NextResponse(null, { status: 404 });
    // L'id étant un hash du chemin, l'association ne change jamais : la
    // redirection peut se mettre en cache (Cloudflare est devant).
    return NextResponse.redirect(new URL(row.path as string, request.url), {
      status: 302,
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  } finally {
    await conn.end().catch(() => {});
  }
}
