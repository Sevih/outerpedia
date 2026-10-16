import { createHash } from 'crypto';
import type { RowDataPacket } from 'mysql2';
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
 *
 * Rétention : une ligne vit tant qu'on la LIT. `last_access` est remis à
 * l'heure par chaque lecture (`touch`) et chaque re-partage (l'upsert des
 * POST) ; `purgeIfDue` efface ce qui n'a pas été relu depuis
 * `RETENTION_MONTHS` mois. C'est l'app qui purge, au fil de ses accès (le
 * compte de la base ne peut pas planifier de tâche) : une table ne grandit
 * que par ses accès, elle se nettoie donc aux mêmes moments.
 */

/** Longueur des ids PRODUITS (le préfixe base64url d'un SHA-256). */
export const ID_LENGTH = 12;

/**
 * Un lien qui n'a pas été relu depuis autant de mois est effacé — décision de
 * Sevih, 15/10/2026. Un lien qu'on lit encore ne meurt pas.
 */
export const RETENTION_MONTHS = 12;

/** Au plus une purge par table et par process sur cette durée. */
export const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Lignes effacées au plus par purge : un retard se rattrape sur plusieurs jours. */
const PURGE_BATCH = 1000;

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
  /**
   * Crée la table — ou lui ajoute `last_access` — une fois par process
   * (idempotent, mémoïsé).
   */
  ensureTable(conn: Connection): Promise<void>;
  /**
   * Marque la ligne lue (au plus une écriture par id et par jour). Un échec
   * est avalé : il ne doit pas changer la réponse de la lecture.
   */
  touch(conn: Connection, id: string): Promise<void>;
  /**
   * Efface ce qui n'a pas été relu depuis `RETENTION_MONTHS` mois, au plus une
   * fois par `PURGE_INTERVAL_MS` dans ce process, et seulement une fois la
   * table prête. Un échec est avalé et se retente à l'intervalle suivant.
   */
  purgeIfDue(conn: Connection): Promise<void>;
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
  // Date de la dernière purge lancée (réussie ou non) dans ce process.
  let lastPurgeAt: number | null = null;

  // `table`/`column` sont des littéraux du code appelant (jamais une entrée
  // requête) — l'interpolation est sûre, et un identifiant SQL ne peut de toute
  // façon pas être passé en paramètre lié.
  async function migrate(conn: Connection): Promise<void> {
    await conn.query(
      `CREATE TABLE IF NOT EXISTS ${table} (
         id VARCHAR(16) NOT NULL PRIMARY KEY,
         ${column} VARCHAR(${maxLength}) NOT NULL,
         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
         last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
         INDEX idx_last_access (last_access)
       ) ENGINE=InnoDB DEFAULT CHARSET=ascii`,
    );
    // Les tables de prod sont nées SANS `last_access` (l'app les a créées au
    // premier accès, avant la rétention) : on lui ajoute la colonne, une fois.
    // MySQL 8.4 n'a pas `ADD COLUMN IF NOT EXISTS`, d'où la lecture du schéma.
    // Les lignes existantes y prennent l'heure de la migration, pas leur
    // `created_at` : on ne sait pas si elles ont été relues, elles ont donc
    // leurs `RETENTION_MONTHS` mois devant elles.
    const [cols] = await conn.query<RowDataPacket[]>(
      `SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'last_access'`,
      [table],
    );
    if (cols.length === 0) {
      await conn.query(
        `ALTER TABLE ${table}
           ADD COLUMN last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
           ADD INDEX idx_last_access (last_access)`,
      );
    }
  }

  return {
    table,
    column,
    maxLength,
    idPattern,

    ensureTable(conn: Connection): Promise<void> {
      if (!tableReady) {
        tableReady = migrate(conn).catch((err) => {
          tableReady = null;
          throw err;
        });
      }
      return tableReady;
    },

    async touch(conn: Connection, id: string): Promise<void> {
      // La borne d'un jour : au plus une écriture par lien et par jour. Ces
      // lectures sont mises en cache devant le site (une heure pour `/s/`,
      // 5 min pour la tier-list) : un lien lu souvent n'arrive ici qu'à chaque
      // expiration — largement assez à `RETENTION_MONTHS` mois près.
      try {
        await conn.execute(
          `UPDATE ${table} SET last_access = CURRENT_TIMESTAMP
            WHERE id = ? AND last_access < CURRENT_TIMESTAMP - INTERVAL 1 DAY`,
          [id],
        );
      } catch {
        // Avalé : la lecture a déjà sa réponse, un lien manqué se marque demain.
      }
    },

    async purgeIfDue(conn: Connection): Promise<void> {
      if (!tableReady) return;
      const now = Date.now();
      if (lastPurgeAt !== null && now - lastPurgeAt < PURGE_INTERVAL_MS) return;
      // Posée AVANT la requête : deux accès simultanés ne purgent pas deux fois,
      // et une purge ratée attend l'intervalle suivant.
      lastPurgeAt = now;
      try {
        await tableReady;
        await conn.execute(
          `DELETE FROM ${table}
            WHERE last_access < CURRENT_TIMESTAMP - INTERVAL ${RETENTION_MONTHS} MONTH
            LIMIT ${PURGE_BATCH}`,
        );
      } catch {
        // Avalé : la réponse est déjà calculée, la purge se retente demain.
      }
    },

    id(value: string): string {
      return createHash('sha256').update(value).digest('base64url').slice(0, ID_LENGTH);
    },
  };
}
