/**
 * Couche CURÉE — TAXONOMIE DE FILTRE des effets (`data/curated/effect-filters.json`).
 *
 * La page liste `/characters` regroupe les cases à cocher buffs/debuffs par
 * FAMILLE UI (statBoosts, cc, dot…) et déduplique les variantes d'un même effet.
 * Ni la famille UI ni le regroupement ne vivent dans les tables du jeu : c'est
 * une classification 100 % ÉDITORIALE, portée de la V2 (data/effects/buffs.json
 * + debuffs.json) comme oracle.
 *
 * Clé = clé `effectByKey` (le MÊME espace que `glossaries.effectByKey` :
 * `BT_STAT|ST_ATK`, `BT_IMMUNE`, un nom de statut nommé…), séparée par CÔTÉ car
 * une même clé change de famille selon le côté (`BT_STAT|ST_ATK` = statBoosts en
 * buff, statReduction en debuff).
 *   - `category` : famille UI. Buff = statBoosts|supporting|utility|unique ;
 *     debuff = statReduction|cc|dot|utility|unique ; `hidden` = exclu des filtres.
 *   - `group`    : clé CANONIQUE qui absorbe les variantes (surtout le jumeau
 *     `_IR` irremovable → sa base ; quelques alias fonctionnels). Absente = la
 *     clé est sa propre canonique.
 *
 * Survit aux régénérations ; lu au build (exposé dans `glossaries.effectFilters`)
 * et par le générateur `characters-list` (canonicalisation des agrégats).
 */
import { readCuratedJson } from '../lib/json';
import { fileStamp } from '../lib/tables';
import { validate, type Schema } from '../extractor/core/validate';

/** Famille UI d'un effet (buff ou debuff confondus — le côté vient de la clé racine). */
export type EffectFilterCategory =
  'statBoosts' | 'supporting' | 'utility' | 'unique' | 'statReduction' | 'cc' | 'dot' | 'hidden';

/** Métadonnée de filtre d'une clé d'effet. */
export interface EffectFilterMeta {
  category: EffectFilterCategory;
  /** Clé canonique absorbant cette variante (ex. `_IR` → base). */
  group?: string;
}

/** Table complète, séparée par côté (même partition que `effectByKey`). */
export interface EffectFiltersData {
  buff: Record<string, EffectFilterMeta>;
  debuff: Record<string, EffectFilterMeta>;
}

const metaSchema: Schema = {
  kind: 'object',
  fields: {
    category: {
      kind: 'string',
      enum: [
        'statBoosts',
        'supporting',
        'utility',
        'unique',
        'statReduction',
        'cc',
        'dot',
        'hidden',
      ],
    },
    group: { kind: 'string', optional: true },
  },
};

const sideSchema: Schema = { kind: 'record', of: metaSchema };
export const effectFiltersSchema: Schema = {
  kind: 'object',
  fields: { buff: sideSchema, debuff: sideSchema },
};

/** Valide la table curée ; renvoie les écarts de schéma (vide = OK). */
export function validateEffectFilters(data: unknown): string[] {
  return validate(data, effectFiltersSchema, 'effectFilters').map(
    (i) => `${i.path} — ${i.message}`,
  );
}

/**
 * Lecteur partagé (build + générateur characters-list). Cache sur le mtime du
 * fichier (`fileStamp`, TTL 2 s) — édition admin visible sans redémarrage.
 * Fichier absent → tables vides (le curé est optionnel).
 */
let loaded: { data: EffectFiltersData; stamp: string } | undefined;
export function loadEffectFilters(): EffectFiltersData {
  const stamp = fileStamp('data/curated/effect-filters.json');
  if (loaded && loaded.stamp === stamp) return loaded.data;
  const raw = readCuratedJson<Partial<EffectFiltersData>>('data/curated/effect-filters.json');
  const data: EffectFiltersData = { buff: raw?.buff ?? {}, debuff: raw?.debuff ?? {} };
  loaded = { data, stamp };
  return data;
}
