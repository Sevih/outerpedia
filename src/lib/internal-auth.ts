/**
 * Garde des routes INTERNES (réseau Docker seulement, fermées à Internet par
 * Caddy) : jeton `Authorization: Bearer <secret>`, comparé à temps constant.
 * Le jeton est la dernière ligne de défense, pas la seule.
 */
import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

/** Comparaison à temps constant (un `===` fuit la longueur du préfixe commun). */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * `undefined` si la requête porte le bon jeton, sinon la réponse à renvoyer.
 * Variable absente = route FERMÉE (503) : on ne dégrade jamais en route ouverte.
 */
export function refuseUnlessBearer(request: Request, envName: string): NextResponse | undefined {
  const secret = process.env[envName];
  if (!secret) return NextResponse.json({ error: `${envName} absent` }, { status: 503 });

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !secretMatches(token, secret)) {
    return NextResponse.json({ error: 'non autorisé' }, { status: 401 });
  }
  return undefined;
}
