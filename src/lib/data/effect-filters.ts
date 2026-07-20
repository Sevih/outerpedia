/**
 * Arbre d'options des filtres d'EFFETS de `/characters` (onglet « Effects »).
 *
 * La taxonomie (famille UI + regroupement des variantes) vit dans
 * `glossaries.effectFilters` (curée, portée de la V2) ; les libellés/icônes
 * passent par la résolution FUSIONNÉE (`resolveEffectKey`) — MÊME source que les
 * chips d'effet des skills, donc les overrides curés (nom, icône) sont pris
 * (ex. « Priority Increase » a une icône curée `IG_Buff_Action_Gauge_Up` ; lire
 * le glossaire brut ressortait l'icône d'encyclopédie `SC_Buff_Effect_…`).
 *
 * Tout est résolu CÔTÉ SERVEUR (aucun contexte i18n en V3, `glossaries.json` et
 * les lectures disque du curé hors bundle client). L'univers des options est
 * DÉRIVÉ DES AGRÉGATS réels des persos (`characters-list.json`) : chaque case
 * matche ≥1 perso, et chaque clé de perso a sa case — pas de filtre mort.
 */
import glossariesData from '@data/generated/glossaries.json';
import { resolveEffectKey } from '@/lib/data/effects';
import type { Lang } from '@/lib/i18n/config';

export type EffectSide = 'buff' | 'debuff';

/** Une case d'effet : clé canonique + libellé localisé + icône (nom BRUT). */
export interface EffectOption {
  key: string;
  label: string;
  /** Nom de sprite VERBATIM (pas l'URL) — passé à `EffectIconTile` qui recolore. */
  icon: string;
}

/** Un groupe d'effets d'une famille UI (statBoosts, cc…). */
export interface EffectGroup {
  category: string;
  /** Titre localisé (résolu côté serveur). */
  title: string;
  effects: EffectOption[];
}

const G = glossariesData as unknown as {
  effectFilters?: Record<EffectSide, Record<string, { category: string; group?: string }>>;
};

/** Ordre d'affichage des familles, par côté (parité V2). */
const CATEGORY_ORDER: Record<EffectSide, string[]> = {
  buff: ['statBoosts', 'supporting', 'utility', 'unique'],
  debuff: ['statReduction', 'cc', 'dot', 'utility', 'unique'],
};

/** Familles valides par côté — pour valider un `tag` curé comme catégorie. */
const VALID_CATEGORY: Record<EffectSide, Set<string>> = {
  buff: new Set([...CATEGORY_ORDER.buff, 'hidden']),
  debuff: new Set([...CATEGORY_ORDER.debuff, 'hidden']),
};

/**
 * Clé CANONIQUE d'une clé d'effet : `group` de la taxonomie si présent, sinon la
 * convention documentée `_IR` (jumeau irremovable) → base si la base existe.
 * Referme les rares trous de la taxonomie curée (`BT_BARRIER_IR`,
 * `BT_STAT_BUFF_ENHANCE_IR`…) sans toucher à la donnée. Appelée sur les clés des
 * agrégats ET sur celles des options — même identité des deux côtés.
 */
export function canonicalEffectKey(side: EffectSide, key: string): string {
  const table = G.effectFilters?.[side];
  if (!table) return key;
  const group = table[key]?.group;
  if (group) return group;
  if (key.endsWith('_IR')) {
    const base = key.slice(0, -3);
    if (table[base]) return base;
  }
  return key;
}

/** Replie tout un agrégat de clés sur ses canoniques (dédupliqué). */
export function canonicalizeKeys(side: EffectSide, keys: string[] | undefined): string[] {
  if (!keys?.length) return [];
  return [...new Set(keys.map((k) => canonicalEffectKey(side, k)))];
}

/**
 * Construit les groupes d'effets d'un côté à partir des clés RÉELLEMENT présentes
 * chez les persos (union des agrégats). `titleFor(category)` résout le titre
 * localisé (`characters.effectsGroups.<side>.<category>`). Vide si la taxonomie
 * n'est pas encore sur la surface runtime.
 */
export function buildEffectGroups(
  side: EffectSide,
  presentKeys: Iterable<string>,
  lang: Lang,
  titleFor: (category: string) => string,
): EffectGroup[] {
  const table = G.effectFilters?.[side];
  if (!table) return [];
  const order = CATEGORY_ORDER[side];
  const rank = (c: string) => {
    const i = order.indexOf(c);
    return i === -1 ? order.length : i;
  };

  const seen = new Set<string>();
  const byCategory = new Map<string, EffectOption[]>();

  for (const raw of presentKeys) {
    const key = canonicalEffectKey(side, raw);
    if (seen.has(key)) continue;
    // Résolution FUSIONNÉE (curé > extrait) — nom, icône ET `tag` curés.
    const eff = resolveEffectKey(side, key);
    if (!eff) continue;
    // Le `tag` curé de l'effet (éditable par l'admin, « pour regrouper/filtrer »)
    // prime sur la catégorie de la taxonomie quand c'est une famille valide —
    // override par-effet immédiat (lecture disque), sans rebuild du glossaire.
    const tagCat = eff.tag && VALID_CATEGORY[side].has(eff.tag) ? eff.tag : undefined;
    const category = tagCat ?? table[key]?.category;
    if (!category || category === 'hidden') continue;
    seen.add(key);

    const bucket = byCategory.get(category) ?? [];
    bucket.push({
      key,
      label: eff.name[lang] ?? eff.name.en ?? key,
      icon: eff.icon,
    });
    byCategory.set(category, bucket);
  }

  return [...byCategory.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]))
    .map(([category, effects]) => ({
      category,
      title: titleFor(category),
      effects: effects.sort((a, b) => a.label.localeCompare(b.label)),
    }));
}
