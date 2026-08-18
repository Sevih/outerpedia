import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { getDbConnection } from '@/lib/db';
import { ensureTable, isInternalPath, ID_RE } from '@/lib/short-links';

export const dynamic = 'force-dynamic';

/**
 * GET /s/[id] → 302 vers le chemin interne enregistré (POST /api/shortlink).
 *
 * Le `Location` émis est RELATIF (un chemin nu, autorisé par la RFC 7231) :
 * c'est le navigateur qui le résout sur l'hôte appelé, donc
 * jp.outerpedia.com/s/xyz atterrit sur jp.outerpedia.com/… — le chemin stocké
 * est sans langue, c'est le sous-domaine qui la porte.
 *
 * ⚠️ NE PAS reconstruire une URL absolue via `new URL(path, request.url)` :
 * dans l'image standalone, `request.url` porte l'adresse d'ÉCOUTE du serveur
 * (`HOSTNAME=0.0.0.0`, `PORT=3000` — cf. Dockerfile), pas l'hôte public. Tous
 * les liens partagés renvoyaient vers `https://0.0.0.0:3000/…`, injoignable
 * (constaté le 18/08/2026). Un en-tête `Host` reconstruit à la main ne vaut
 * pas mieux : il est fourni par le client, le chemin relatif ne l'est pas.
 *
 * Le proxy i18n (src/proxy.ts) exclut `/s/` de la réécriture pour que cette
 * route racine soit atteinte telle quelle.
 */
function seeOther(path: string, cacheable = false) {
  return new NextResponse(null, {
    status: 302,
    headers: cacheable
      ? { Location: path, 'Cache-Control': 'public, max-age=3600' }
      : { Location: path },
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Lien mort ou stockage indisponible : redirection vers l'accueil de l'hôte
  // appelé plutôt qu'une réponse vide — celui qui clique un vieux lien partagé
  // doit atterrir quelque part, pas sur une page blanche. Pas de Cache-Control
  // ici : un id peut être créé après coup, l'indisponibilité est temporaire.
  const home = () => seeOther('/');
  if (!ID_RE.test(id)) return home();

  const conn = await getDbConnection();
  if (!conn) return home();
  try {
    await ensureTable(conn);
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT path FROM short_links WHERE id = ? LIMIT 1',
      [id],
    );
    const path = rows[0]?.path;
    if (typeof path !== 'string') return home();
    // Revalidé À LA LECTURE : `new URL()` ne recadre plus rien, un `//evil.com`
    // entré en base (ancienne ligne, écriture directe) partirait tel quel dans
    // `Location` et le navigateur le lirait comme un autre hôte.
    if (!isInternalPath(path)) return home();
    // L'id étant un hash du chemin, l'association ne change jamais : la
    // redirection peut se mettre en cache (Cloudflare est devant).
    return seeOther(path, true);
  } catch {
    return new NextResponse(null, { status: 500 });
  } finally {
    await conn.end().catch(() => {});
  }
}
