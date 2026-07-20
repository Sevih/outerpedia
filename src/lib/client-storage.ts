/**
 * localStorage TYPÉ et VERSIONNÉ — socle des futurs outils à état client
 * (progress tracker, tier-list maker). Posé AVANT les outils : ces conventions
 * sont pénibles à rattraper une fois des données utilisateur dans la nature.
 *
 * Conventions (leçons de la V2) :
 *   - une clé par usage, préfixe `outerpedia:` ;
 *   - version de schéma DANS la valeur (`{v, data}`), JAMAIS dans le nom de la
 *     clé — les bumps de clé V2 (`damage-lab-form-v9`…) perdaient les données
 *     utilisateur à chaque évolution ;
 *   - clés HÉRITÉES V2 absorbées à la première lecture : la V3 remplacera la
 *     V2 sur le MÊME origin (outerpedia.com), le localStorage des visiteurs
 *     existants sera donc là. À reprendre (décision Sevih 20/07) :
 *     `outerplane:progress`, `outerplane:settings` (progress tracker) et
 *     `tlm-settings` (tier-list maker) — redeem et damage-calc/lab, non. La
 *     clé V2 est laissée en place après migration (filet de retour arrière) ;
 *   - la lecture se fait APRÈS montage côté client (cf. `useStoredState` à
 *     créer avec le premier outil consommateur) : le SSR rend le `fallback`,
 *     zéro mismatch d'hydratation.
 *
 * NB : le localStorage est PAR ORIGIN — les sous-domaines de langue (jp.…)
 * ont chacun le leur, un réglage ne suit pas un changement de langue (déjà le
 * cas en V2, assumé).
 */

/** Contrat d'un usage du storage (une clé = un spec, déclaré par l'outil). */
export interface StoreSpec<T> {
  /** Clé V3 — convention `outerpedia:<outil>[:<quoi>]`. */
  key: string;
  /** Version COURANTE du schéma de `data`. */
  version: number;
  /** Valeur rendue au SSR, en l'absence de donnée, ou sur donnée illisible. */
  fallback: T;
  /**
   * Migre une valeur d'une version ANTÉRIEURE du schéma. `undefined` =
   * inmigrable → `fallback`. Absent : toute version ≠ courante → `fallback`.
   */
  migrate?: (data: unknown, fromVersion: number) => T | undefined;
  /** Clés V2 à absorber si la clé V3 est absente (premier passage). */
  legacyKeys?: string[];
  /** Interprète le JSON d'une clé V2 → schéma courant (`undefined` = ignore). */
  fromLegacy?: (data: unknown, key: string) => T | undefined;
}

/** Enveloppe stockée : la version voyage avec la donnée. */
interface Envelope {
  v: number;
  data: unknown;
}

/** JSON.parse tolérant (donnée corrompue → undefined, jamais de throw). */
function parse(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

/** Le storage, ou null hors navigateur (SSR) / accès refusé (privacy mode). */
function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Lit la valeur d'un spec. Ordre : clé V3 (migrée si version antérieure, et
 * ré-écrite au passage) → clés V2 (absorbées : écrites sous la clé V3, la clé
 * V2 reste en place) → `fallback`. Ne jette jamais.
 */
export function readStored<T>(spec: StoreSpec<T>): T {
  const ls = storage();
  if (!ls) return spec.fallback;

  const env = parse(ls.getItem(spec.key));
  if (env && typeof env === 'object' && 'v' in env && 'data' in env) {
    const { v, data } = env as Envelope;
    if (v === spec.version) return data as T;
    const migrated = spec.migrate?.(data, v);
    if (migrated !== undefined) {
      writeStored(spec, migrated);
      return migrated;
    }
    return spec.fallback;
  }

  for (const key of spec.legacyKeys ?? []) {
    const legacy = parse(ls.getItem(key));
    if (legacy === undefined) continue;
    const converted = spec.fromLegacy?.(legacy, key);
    if (converted !== undefined) {
      writeStored(spec, converted);
      return converted;
    }
  }
  return spec.fallback;
}

/** Écrit sous enveloppe versionnée. Quota plein / privacy mode : silencieux. */
export function writeStored<T>(spec: StoreSpec<T>, value: T): void {
  const ls = storage();
  if (!ls) return;
  try {
    ls.setItem(spec.key, JSON.stringify({ v: spec.version, data: value } satisfies Envelope));
  } catch {
    /* quota/refus : la valeur vit en mémoire pour la session, c'est tout */
  }
}

/** Efface la clé V3 (les clés V2 héritées ne sont jamais touchées). */
export function clearStored(spec: StoreSpec<unknown>): void {
  storage()?.removeItem(spec.key);
}
