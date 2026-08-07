import { createHashStore } from '@/lib/hash-store';

/**
 * Aides communes aux routes de partage tier-list (portage V2 à l'identique :
 * MÊME table, MÊMES ids — les liens `?s=` V2 restent valides une fois la
 * table migrée sur le MySQL du VPS).
 *
 * La mécanique table + id-hash vient de `hash-store.ts` (socle partagé avec le
 * raccourcisseur). Seul `ID_RE` s'en écarte, à dessein : cf. ci-dessous.
 */

export const MAX_PAYLOAD = 1024;

/**
 * Plus PERMISSIF que les ids produits (12 caractères) : la V2 a émis des ids
 * d'autres longueurs et ses liens `?s=` doivent rester lisibles. À ne pas
 * resserrer sur `ID_LENGTH` — ce serait casser des liens déjà partagés.
 */
export const ID_RE = /^[A-Za-z0-9_-]{1,16}$/;

const store = createHashStore({
  table: 'tier_lists',
  column: 'payload',
  maxLength: MAX_PAYLOAD,
  idPattern: ID_RE,
});

/** Crée la table `tier_lists` une fois par process (idempotent, mémoïsé). */
export const ensureTable = store.ensureTable;

/** Id court DÉTERMINISTE dérivé du payload — même liste ⇒ même id. */
export const payloadId = store.id;
