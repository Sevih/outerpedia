/**
 * localStorage TYPÉ et VERSIONNÉ — socle des futurs outils à état client
 * (progress tracker, tier-list maker). Posé AVANT les outils : ces conventions
 * sont pénibles à rattraper une fois des données utilisateur dans la nature.
 *
 * Conventions (leçons du site précédent) :
 *   - une clé par usage, préfixe `outerpedia:` ;
 *   - version de schéma DANS la valeur (`{v, data}`), JAMAIS dans le nom de la
 *     clé — les bumps de clé de l'ancien site (`damage-lab-form-v9`…) perdaient
 *     les données utilisateur à chaque évolution ;
 *   - clés HÉRITÉES absorbées à la première lecture : ce site a remplacé le
 *     précédent sur le MÊME origin (outerpedia.com), le localStorage des
 *     visiteurs existants est donc toujours là. À reprendre (décision Sevih
 *     20/07) : `outerplane:progress`, `outerplane:settings` (progress tracker)
 *     et `tlm-settings` (tier-list maker) — redeem et damage-calc/lab, non.
 *     L'ancienne clé est laissée en place après migration (filet de retour
 *     arrière) ;
 *   - la lecture se fait APRÈS montage côté client (cf. `useStoredState` à
 *     créer avec le premier outil consommateur) : le SSR rend le `fallback`,
 *     zéro mismatch d'hydratation.
 *
 * NB : le localStorage est PAR ORIGIN — les sous-domaines de langue (jp.…)
 * ont chacun le leur, un réglage ne suit pas un changement de langue (déjà le
 * cas sur le site précédent, assumé).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** Contrat d'un usage du storage (une clé = un spec, déclaré par l'outil). */
export interface StoreSpec<T> {
  /** Clé courante — convention `outerpedia:<outil>[:<quoi>]`. */
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
  /** Clés héritées à absorber si la clé courante est absente (1er passage). */
  legacyKeys?: string[];
  /** Interprète le JSON d'une clé héritée → schéma courant (`undefined` = ignore). */
  fromLegacy?: (data: unknown, key: string) => T | undefined;
  /**
   * Complète/assainit TOUTE valeur lue du storage — version courante comprise,
   * puis sortie de `migrate` et de `fromLegacy` (pas le `fallback`). Sans elle,
   * une donnée à la version courante est rendue telle quelle : un champ ajouté
   * au schéma sans bump de version arrive `undefined` (case à cocher qui passe
   * de non contrôlée à contrôlée). Typiquement `{ ...DEFAULTS, ...data }`, en
   * profondeur là où il le faut. Rien n'est ré-écrit à la lecture : le stockage
   * se répare à la prochaine écriture.
   */
  normalize?: (data: unknown) => T;
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
 * Lit la valeur d'un spec. Ordre : clé courante (migrée si version antérieure,
 * et ré-écrite au passage) → clés héritées (absorbées : écrites sous la clé
 * courante, l'ancienne reste en place) → `fallback`. Toute valeur trouvée passe
 * par `normalize` s'il est fourni. Ne jette jamais.
 */
export function readStored<T>(spec: StoreSpec<T>): T {
  const ls = storage();
  if (!ls) return spec.fallback;
  const normalize = (data: unknown): T => (spec.normalize ? spec.normalize(data) : (data as T));

  const env = parse(ls.getItem(spec.key));
  if (env && typeof env === 'object' && 'v' in env && 'data' in env) {
    const { v, data } = env as Envelope;
    if (v === spec.version) return normalize(data);
    const migrated = spec.migrate?.(data, v);
    if (migrated !== undefined) {
      const value = normalize(migrated);
      writeStored(spec, value);
      return value;
    }
    return spec.fallback;
  }

  for (const key of spec.legacyKeys ?? []) {
    const legacy = parse(ls.getItem(key));
    if (legacy === undefined) continue;
    const converted = spec.fromLegacy?.(legacy, key);
    if (converted !== undefined) {
      const value = normalize(converted);
      writeStored(spec, value);
      return value;
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

/** Efface la clé courante (les clés héritées ne sont jamais touchées). */
export function clearStored(spec: StoreSpec<unknown>): void {
  storage()?.removeItem(spec.key);
}

/**
 * État React ADOSSÉ à un spec de storage — le contrat SSR du module en hook :
 *
 *   - SSR et PREMIER rendu client = `fallback` (zéro mismatch d'hydratation) ;
 *   - lecture `readStored` au montage (une fois), signalée par `ready` — un
 *     rendu qui veut attendre la vraie valeur (spinner, skeleton) s'y fie ;
 *   - le setter (valeur ou updater fonctionnel) écrit en write-through via
 *     `writeStored` à chaque changement committé.
 *
 * `spec` doit être une CONSTANTE de module (la clé/version ne changent pas en
 * cours de vie) — seul le spec du premier rendu est lu au montage. Un setter
 * appelé AVANT l'hydratation gagne sur la valeur stockée (l'utilisateur a agi,
 * on n'écrase pas son geste).
 */
export function useStoredState<T>(
  spec: StoreSpec<T>,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(spec.fallback);
  const [ready, setReady] = useState(false);
  // Vrai dès qu'un setter a été appelé : chaque valeur committée est écrite,
  // et l'hydratation n'écrase plus l'état.
  const dirty = useRef(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (!dirty.current) setValue(readStored(spec));
    setReady(true);
  }, [spec]);

  useEffect(() => {
    if (dirty.current) writeStored(spec, value);
  }, [spec, value]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    dirty.current = true;
    setValue((prev) => (typeof next === 'function' ? (next as (prev: T) => T)(prev) : next));
  }, []);

  return [value, set, ready];
}
