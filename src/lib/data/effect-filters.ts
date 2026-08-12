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
import {
  getMergedEffects,
  loadCuratedEffects,
  resolveEffectKey,
  type MergedEffect,
} from '@/lib/data/effects';
import { EFFECT_FAMILIES, type EffectSide } from '@/lib/data/effect-families';
import type { Lang } from '@/lib/i18n/config';

export type { EffectSide };

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

/** Ordre d'affichage des familles, par côté — source unique. */
const CATEGORY_ORDER = EFFECT_FAMILIES;

/** Familles valides par côté — pour valider un `tag` curé comme catégorie. */
const VALID_CATEGORY: Record<EffectSide, Set<string>> = {
  buff: new Set([...CATEGORY_ORDER.buff, 'hidden']),
  debuff: new Set([...CATEGORY_ORDER.debuff, 'hidden']),
};

/**
 * Index (par côté) nom AFFICHÉ → clé REPRÉSENTANTE. Construit depuis les clés de
 * taxonomie de BASE (`effectFilters`, hors variantes `group`/`_IR`), résolues par
 * la voie FUSIONNÉE (`resolveEffectKey` — le nom affiché de `BT_AP_CHARGE` debuff
 * est « Discharge AP » via override curé, pas son nom brut). La représentante est
 * une clé de taxonomie : stable pour le codec `?z=` et porteuse d'une famille.
 * Mémoïsé (construit une fois par côté).
 */
const REPR: Partial<Record<EffectSide, Map<string, string>>> = {};
function representativeByName(side: EffectSide): Map<string, string> {
  const cached = REPR[side];
  if (cached) return cached;
  const table = G.effectFilters?.[side] ?? {};
  const m = new Map<string, string>();
  for (const key of Object.keys(table)) {
    // Variantes (groupée, ou `_IR` dont la base existe) → jamais représentantes :
    // elles se replient déjà sur leur base, qui porte le même nom.
    if (table[key].group) continue;
    if (key.endsWith('_IR') && table[key.slice(0, -3)]) continue;
    const name = resolveEffectKey(side, key)?.name.en;
    if (name && !m.has(name)) m.set(name, key);
  }
  REPR[side] = m;
  return m;
}

/**
 * Clé CANONIQUE d'une clé d'effet. UNIFICATION PAR NOM AFFICHÉ : deux clés au même
 * nom — une clé de taxonomie et une clé-nom (« Increased Resilience », « Discharge
 * AP »), ou une base et sa variante irremovable (« Barrier ») — sont UN seul statut
 * côté joueur → une seule case. On rabat sur la clé représentante de ce nom (cf.
 * `representativeByName`). Généralise le repli `group`/`_IR` d'avant, conservé en
 * FALLBACK pour les clés non résolubles (hors glossaire). Appelée sur les clés des
 * agrégats ET sur celles des options — même identité des deux côtés.
 */
export function canonicalEffectKey(side: EffectSide, key: string): string {
  const table = G.effectFilters?.[side];
  if (!table) return key;
  const name = resolveEffectKey(side, key)?.name.en;
  const repr = name ? representativeByName(side).get(name) : undefined;
  if (repr) return repr;
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
 * Index `côté|nom EN` → effet IRREMOVABLE de ce nom. Le jeu encode la version
 * irremovable d'un statut comme un effet DISTINCT (icône à cadre `_Interruption`)
 * — c'est ce jumeau qu'on retrouve ici depuis l'effet de base.
 *
 * Mémoïsé sur l'IDENTITÉ du curé (comme les index de `effects.ts`) : une icône
 * curée depuis l'admin se voit sans redémarrage.
 */
let twinCache: { ref: Record<string, unknown>; index: Map<string, MergedEffect> } | null = null;
function irremovableTwins(): Map<string, MergedEffect> {
  const ref = loadCuratedEffects();
  if (twinCache?.ref === ref) return twinCache.index;
  const index = new Map<string, MergedEffect>();
  for (const eff of getMergedEffects()) {
    if (!eff.irremovable || !eff.name.en) continue;
    const k = `${eff.isDebuff ? 'debuff' : 'buff'}|${eff.name.en}`;
    if (!index.has(k)) index.set(k, eff);
  }
  twinCache = { ref, index };
  return index;
}

/**
 * Icône de la case. Les deux versions d'un statut (normale et irremovable) se
 * replient sur UNE case ; par défaut elle prend l'icône de la version normale.
 *
 * Exception, famille `unique` : ces statuts sont la signature d'un perso et le
 * jeu les applique en version IRREMOVABLE — on préfère donc le cadre
 * `_Interruption`, celui que le joueur voit en combat (ex. « Punishment », dont
 * la base 106 et le jumeau 1106 partagent la case). Ailleurs (Barrier, Bleeding,
 * buffs de stat…), la même case sert des dizaines de persos dont la plupart
 * posent la version normale : le cadre neutre reste le bon défaut.
 */
function optionIcon(side: EffectSide, eff: MergedEffect, category: string): string {
  if (category !== 'unique' || eff.irremovable) return eff.icon;
  return irremovableTwins().get(`${side}|${eff.name.en}`)?.icon ?? eff.icon;
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
    // Résolution FUSIONNÉE (curé > extrait) — nom, icône, `tag` ET `hidden` curés.
    const eff = resolveEffectKey(side, key);
    if (!eff) continue;
    // `hidden` curé de l'effet (`SYS_BUFF_DMG`…) = statut masqué du jeu : jamais
    // une case de filtre, comme EffectChips le masque déjà de la fiche.
    if (eff.hidden) continue;
    // Le `tag` curé de l'effet (éditable par l'admin, « pour regrouper/filtrer »)
    // prime sur la catégorie de la taxonomie quand c'est une famille valide —
    // override par-effet immédiat (lecture disque), sans rebuild du glossaire.
    const tagCat = eff.tag && VALID_CATEGORY[side].has(eff.tag) ? eff.tag : undefined;
    // `other` = fourre-tout des statuts NOMMÉS sans famille de taxonomie : tout
    // effet affiché en chip est filtrable (parité EffectChips), rangé ici par
    // défaut (trié en dernier par `rank`) tant qu'un `tag` curé ne le déplace pas.
    const category = tagCat ?? table[key]?.category ?? 'other';
    if (category === 'hidden') continue;
    seen.add(key);

    const bucket = byCategory.get(category) ?? [];
    bucket.push({
      key,
      label: eff.name[lang] ?? eff.name.en ?? key,
      icon: optionIcon(side, eff, category),
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
