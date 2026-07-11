/**
 * REVALIDATION CALENDAIRE — purge les pages dont le rendu dépend de l'INSTANT.
 *
 * Pourquoi : `export const revalidate = 86400` compte depuis la GÉNÉRATION de
 * la page, pas depuis minuit. Une page produite à 14 h reste figée jusqu'au
 * lendemain 14 h — alors que le jeu bascule ses saisons et sa rotation
 * quotidienne à 00:00 UTC. Sans purge alignée, une page peut affirmer « en
 * cours » des heures après la fin réelle. On purge donc au moment de la
 * bascule (cron 00:05 UTC, cf. sevih-tool), au lieu d'attendre un minuteur
 * aveugle. L'ISR reste en filet de sécurité.
 *
 * Appelée par le cron DEPUIS LE RÉSEAU DOCKER INTERNE
 * (`http://outerpedia:3000/api/revalidate`) : l'app ne publie aucun port. Caddy
 * bloque en plus ce chemin côté Internet — le jeton est la troisième couche,
 * pas la seule.
 */
import { timingSafeEqual } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Routes dont le RENDU dépend de la date du jour. Y ajouter toute page qui
 * affiche « en cours / aujourd'hui » — sinon elle mentira en silence.
 */
const TIME_SENSITIVE_ROUTES = [
  // Cartes de saison (JC / WB / GR) : « en cours jusqu'au… ».
  '/[lang]/guides/[category]',
  '/[lang]/guides/[category]/[slug]',
] as const;

/** Comparaison à temps constant (un `===` fuit la longueur du préfixe commun). */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  // Pas de secret = pas de revalidation. On ne dégrade PAS en route ouverte.
  if (!secret) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET absent' }, { status: 503 });
  }

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !secretMatches(token, secret)) {
    return NextResponse.json({ error: 'non autorisé' }, { status: 401 });
  }

  for (const route of TIME_SENSITIVE_ROUTES) revalidatePath(route, 'page');

  return NextResponse.json({
    revalidated: TIME_SENSITIVE_ROUTES,
    at: new Date().toISOString(),
  });
}
