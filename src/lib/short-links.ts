import { createHash } from 'crypto';
import type { Connection } from 'mysql2/promise';

/**
 * Aides communes au raccourcisseur interne (`POST /api/shortlink` + `GET
 * /s/[id]`, deux arbres de routes distincts — d'où `src/lib/` et pas un
 * `_store.ts` local comme pour la tier-list).
 *
 * L'id est un HASH du chemin (même chemin ⇒ même id, upsert idempotent) : pas
 * de compteur à réserver, pas de doublon possible, et un lien re-partagé ne
 * crée jamais de nouvelle ligne.
 */

export const MAX_PATH = 2048;
export const ID_RE = /^[A-Za-z0-9_-]{12}$/;

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

/** Id court DÉTERMINISTE dérivé du chemin — même chemin ⇒ même id. */
export function pathId(path: string): string {
  return createHash('sha256').update(path).digest('base64url').slice(0, 12);
}

let tableReady: Promise<void> | null = null;

/** Crée la table `short_links` une fois par process (idempotent, mémoïsé). */
export function ensureTable(conn: Connection): Promise<void> {
  if (!tableReady) {
    tableReady = conn
      .query(
        `CREATE TABLE IF NOT EXISTS short_links (
           id VARCHAR(16) NOT NULL PRIMARY KEY,
           path VARCHAR(${MAX_PATH}) NOT NULL,
           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
         ) ENGINE=InnoDB DEFAULT CHARSET=ascii`,
      )
      .then(() => undefined)
      .catch((err) => {
        tableReady = null;
        throw err;
      });
  }
  return tableReady;
}
