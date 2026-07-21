import { createHash } from 'crypto';
import type { Connection } from 'mysql2/promise';

/**
 * Aides communes aux routes de partage tier-list (portage V2 à l'identique :
 * MÊME table, MÊMES ids — les liens `?s=` V2 restent valides une fois la
 * table migrée sur le MySQL du VPS).
 */

export const MAX_PAYLOAD = 1024;
export const ID_RE = /^[A-Za-z0-9_-]{1,16}$/;

let tableReady: Promise<void> | null = null;

/** Crée la table `tier_lists` une fois par process (idempotent, mémoïsé). */
export function ensureTable(conn: Connection): Promise<void> {
  if (!tableReady) {
    tableReady = conn
      .query(
        `CREATE TABLE IF NOT EXISTS tier_lists (
           id VARCHAR(16) NOT NULL PRIMARY KEY,
           payload VARCHAR(${MAX_PAYLOAD}) NOT NULL,
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

/** Id court DÉTERMINISTE dérivé du payload — même liste ⇒ même id. */
export function payloadId(z: string): string {
  return createHash('sha256').update(z).digest('base64url').slice(0, 12);
}
