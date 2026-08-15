import { createHash } from 'crypto';
import type { Connection } from 'mysql2/promise';

/**
 * Socle des tables de PARTAGE à id dérivé du contenu (tier-list `?s=`,
 * raccourcisseur `/s/[id]`, et le partage d'équipes à venir — cf. `db.ts`).
 *
 * Toutes suivent la même mécanique : une table à deux colonnes (`id`, valeur),
 * un id qui est un HASH de la valeur — donc même contenu ⇒ même id, l'INSERT
 * est idempotent, aucun compteur à réserver et un lien re-partagé ne crée
 * jamais de ligne. Les deux implémentations existantes en étaient des copies
 * caractère pour caractère (`ensureTable` mémoïsé, `pathId`/`payloadId`) : elles
 * dérivent d'ici depuis l'audit du 07/08.
 *
 * Ce qui reste PROPRE à chaque store (donc paramétré, pas figé) : le nom de
 * table/colonne, la longueur max de la valeur, et le motif d'id accepté à la
 * LECTURE — la tier-list hérite d'anciens ids et doit rester plus permissive que ce
 * qu'elle produit aujourd'hui.
 */

/** Longueur des ids PRODUITS (le préfixe base64url d'un SHA-256). */
export const ID_LENGTH = 12;

export interface HashStoreSpec {
  /** Nom de la table SQL. Littéral du code — jamais une entrée utilisateur. */
  table: string;
  /** Colonne portant la valeur partagée. Littéral du code, idem. */
  column: string;
  /** Taille max de la valeur, en octets — borne la colonne ET la validation. */
  maxLength: number;
  /**
   * Motif d'id accepté à la LECTURE. Par défaut exactement `ID_LENGTH`
   * caractères ; un store qui hérite d'ids plus anciens l'élargit.
   */
  idPattern?: RegExp;
}

export interface HashStore {
  readonly table: string;
  readonly column: string;
  readonly maxLength: number;
  /** Motif d'id à valider AVANT toute requête. */
  readonly idPattern: RegExp;
  /** Crée la table une fois par process (idempotent, mémoïsé). */
  ensureTable(conn: Connection): Promise<void>;
  /** Id court DÉTERMINISTE dérivé de la valeur — même valeur ⇒ même id. */
  id(value: string): string;
}

export function createHashStore({
  table,
  column,
  maxLength,
  idPattern = new RegExp(`^[A-Za-z0-9_-]{${ID_LENGTH}}$`),
}: HashStoreSpec): HashStore {
  // Mémoïsation PAR STORE : deux tables distinctes ne doivent pas partager un
  // drapeau « déjà créée ». En cas d'échec on remet à zéro, sinon une panne
  // transitoire de la BDD condamnerait la table pour la vie du process.
  let tableReady: Promise<void> | null = null;

  return {
    table,
    column,
    maxLength,
    idPattern,

    ensureTable(conn: Connection): Promise<void> {
      if (!tableReady) {
        tableReady = conn
          // `table`/`column` sont des littéraux du code appelant (jamais une
          // entrée requête) — l'interpolation est sûre, et un identifiant SQL
          // ne peut de toute façon pas être passé en paramètre lié.
          .query(
            `CREATE TABLE IF NOT EXISTS ${table} (
               id VARCHAR(16) NOT NULL PRIMARY KEY,
               ${column} VARCHAR(${maxLength}) NOT NULL,
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
    },

    id(value: string): string {
      return createHash('sha256').update(value).digest('base64url').slice(0, ID_LENGTH);
    },
  };
}
