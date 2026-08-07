import { createHashStore } from '@/lib/hash-store';

/**
 * Raccourcisseur interne (`POST /api/shortlink` + `GET /s/[id]`, deux arbres de
 * routes distincts — d'où `src/lib/` et pas un `_store.ts` local comme pour la
 * tier-list).
 *
 * La mécanique table + id-hash vient de `hash-store.ts` (socle partagé avec la
 * tier-list). Ce qui est PROPRE au raccourcisseur, et vit donc ici : la
 * validation de chemin ci-dessous — c'est elle qui tient l'absence d'open
 * redirect, pas le stockage.
 */

export const MAX_PATH = 2048;

const store = createHashStore({ table: 'short_links', column: 'path', maxLength: MAX_PATH });

export const ID_RE = store.idPattern;

/** Crée la table `short_links` une fois par process (idempotent, mémoïsé). */
export const ensureTable = store.ensureTable;

/** Id court DÉTERMINISTE dérivé du chemin — même chemin ⇒ même id. */
export const pathId = store.id;

/**
 * N'accepte QUE des chemins INTERNES — jamais d'URL absolue, zéro open
 * redirect. Les refus non évidents :
 * - `//…` : URL protocol-relative, le navigateur la lit comme un autre hôte ;
 * - `\` : les navigateurs le normalisent en `/`, `/\evil.com` ≡ `//evil.com` ;
 * - hors ASCII imprimable : espaces/contrôles cassent l'en-tête Location, et
 *   les chemins réels du site (slugs + `?z=` base64url) sont déjà ASCII.
 */
export function isInternalPath(path: string): boolean {
  if (path.length === 0 || path.length > MAX_PATH) return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (path.includes('\\')) return false;
  return /^[\x21-\x7e]+$/.test(path);
}
