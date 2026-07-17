/**
 * Couche CURÉE — effets.
 *
 * Deux usages, même fichier (`data/curated/effects.json`, clé = id d'effet) :
 *   1. OVERRIDES humains sur le glossaire extrait (renommer, corriger la
 *      nature, masquer le bruit) — on ne réécrit PAS les effets extraits ;
 *   2. CRÉATIONS : mécaniques réelles du jeu SANS texte dans les tables
 *      (Uncounterable, Elemental Advantage, Fixed Damage…). Une création
 *      porte `name` (obligatoire de fait), `desc`, `icon` et ses `keys`
 *      éditoriales (`{B/…}`/`{D/…}`) ; id conseillé = la clé principale.
 * Survit aux régénérations ; fusionné à la lecture.
 */
import { readCuratedJson } from '../lib/json';
import { fileStamp } from '../lib/tables';
import { validate, type Schema } from '../extractor/core/validate';
import type { LocalizedText } from './character';

/** Contenu curé d'un effet (tout optionnel : on ne stocke que le connu). */
export interface EffectCurated {
  /** Renommage localisé (corrige/complète le nom extrait). */
  name?: LocalizedText;
  /** Description localisée (créations ; override rare). */
  desc?: LocalizedText;
  /** Icône (nom de sprite, créations uniquement). */
  icon?: string;
  /** Corrige la nature (buff/debuff) si l'extraction se trompe. */
  isDebuff?: boolean;
  /** Clés éditoriales résolues vers cet effet (`BT_SEAL_COUNTER`…). */
  keys?: string[];
  /** Étiquette éditoriale libre (dot, stat, cc…) pour regrouper/filtrer. */
  tag?: string;
  /** Masqué de l'affichage public (bruit / interne non pertinent). */
  hidden?: boolean;
  /** Note interne (raison de l'override / source de la création). */
  note?: string;
}

export const effectCuratedSchema: Schema = {
  kind: 'object',
  fields: {
    name: { kind: 'record', of: { kind: 'string' }, optional: true },
    desc: { kind: 'record', of: { kind: 'string' }, optional: true },
    icon: { kind: 'string', optional: true },
    isDebuff: { kind: 'boolean', optional: true },
    keys: { kind: 'array', of: { kind: 'string' }, optional: true },
    tag: { kind: 'string', optional: true },
    hidden: { kind: 'boolean', optional: true },
    note: { kind: 'string', optional: true },
  },
};

/** Retire les clés vides → entrées curées minces (diffs propres). */
export function compactEffect(c: EffectCurated): EffectCurated {
  const out: EffectCurated = {};
  if (c.name && Object.keys(c.name).length) out.name = c.name;
  if (c.desc && Object.keys(c.desc).length) out.desc = c.desc;
  if (c.icon) out.icon = c.icon;
  if (c.isDebuff !== undefined) out.isDebuff = c.isDebuff;
  if (c.keys?.length) out.keys = c.keys;
  if (c.tag) out.tag = c.tag;
  if (c.hidden) out.hidden = c.hidden;
  if (c.note) out.note = c.note;
  return out;
}

/** Valide un override d'effet ; renvoie les écarts de schéma (vide = OK). */
export function validateEffectCurated(id: string, c: EffectCurated): string[] {
  return validate(c, effectCuratedSchema, `effectCurated[${id}]`).map(
    (i) => `${i.path} — ${i.message}`,
  );
}

/**
 * LE lecteur partagé du curé — remplace les parses ad-hoc (lib/effects,
 * equipment, manifest, v2-control). Cache clé sur le mtime du fichier
 * (`fileStamp`, TTL 2 s) : une édition admin se voit sans redémarrage, même
 * contrat que les caches dérivés de lib/effects. Fichier absent → `{}`
 * (le curé est optionnel) ; JSON cassé → throw nommé (readCuratedJson).
 */
let loaded: { data: Record<string, EffectCurated>; stamp: string } | undefined;
export function loadCuratedEffects(): Record<string, EffectCurated> {
  const stamp = fileStamp('data/curated/effects.json');
  if (loaded && loaded.stamp === stamp) return loaded.data;
  const data = readCuratedJson<Record<string, EffectCurated>>('data/curated/effects.json') ?? {};
  loaded = { data, stamp };
  return data;
}
