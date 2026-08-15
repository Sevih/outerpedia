/**
 * Lecture des EFFETS : glossaire extrait (`data/generated`) + overrides curés
 * (`data/curated/effects.json`) fusionnés.
 *
 * Le curé est lu au système de fichiers (pas un import figé) pour que l'admin
 * voie ses écritures immédiatement (en dev, Next invalide le module à la
 * recompilation — le cache module ci-dessous ne survit pas à une écriture).
 */
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import glossariesData from '@data/generated/glossaries.json';
import type { Effect, EffectCurated, Glossaries, LangDict } from '@contracts';
import type { ClientEffect, StatusMap } from '@/components/character/EffectChips';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';

const G = glossariesData as unknown as Glossaries;
const EFFECTS = G.effects as Record<string, Effect>;
const BY_TOOLTIP = G.effectByTooltip as Record<string, string>;
const BY_LABEL = G.effectByLabel as Record<string, string>;
const BY_KEY = G.effectByKey as Record<'buff' | 'debuff', Record<string, string>>;

const CURATED_PATH = resolve(process.cwd(), 'data/curated/effects.json');

/**
 * SOURCES de résolution d'un effet : le glossaire extrait + la curation. Toutes
 * les fonctions de ce module les prennent en paramètre OPTIONNEL, défaut = le
 * live — les appelants ordinaires ne les voient donc jamais.
 *
 * Pourquoi ce paramètre existe : un boss ÉPINGLÉ (`<id>@<n>`) doit s'afficher
 * tel qu'il était, or un skill ne stocke que des RÉFÉRENCES d'effets (`tooltip`,
 * `label`, `type`) — le nom, l'icône et la description sont rejoués à
 * l'affichage. Résolus contre le glossaire courant, un guide figé montrerait les
 * libellés d'aujourd'hui, et une réf supprimée depuis disparaîtrait de l'écran.
 * L'archive fige donc ses propres sources, et le rendu les passe ici.
 */
export interface EffectSources {
  effects: Record<string, Effect>;
  byTooltip: Record<string, string>;
  byLabel: Record<string, string>;
  byKey: Record<'buff' | 'debuff', Record<string, string>>;
  curated: Record<string, EffectCurated>;
}

// Mémoïsé sur l'IDENTITÉ du curé (qui change avec son mtime) : `liveSources` est
// appelé par défaut à CHAQUE résolution — en allouer un objet à chaque fois
// mettrait une pression inutile sur des milliers d'appels par page.
let liveCache: { curated: Record<string, EffectCurated>; src: EffectSources } | null = null;

/** Sources du LIVE : glossaire du build + curation fraîche du disque. */
export function liveEffectSources(): EffectSources {
  const curated = loadCuratedEffects();
  if (liveCache?.curated === curated) return liveCache.src;
  const src: EffectSources = {
    effects: EFFECTS,
    byTooltip: BY_TOOLTIP,
    byLabel: BY_LABEL,
    byKey: BY_KEY,
    curated,
  };
  liveCache = { curated, src };
  return src;
}

/** Effet extrait + overrides curés appliqués (ou création 100 % curée). */
export interface MergedEffect {
  id: string;
  name: Record<string, string>;
  desc: LangDict;
  icon: string;
  isDebuff: boolean;
  /** `curated` = création humaine (mécanique sans texte dans les tables). */
  origin: 'tooltip' | 'type' | 'curated';
  tooltips: string[];
  /** Icône communautaire (pool wiki) — absente des sprites du jeu. */
  iconEditorial: boolean;
  /** Statut irremovable (effet distinct de sa version normale). */
  irremovable: boolean;
  tag?: string;
  hidden: boolean;
  note?: string;
  /** Vrai si un override curé existe. */
  overridden: boolean;
}

// Cache module CLÉ SUR LE MTIME : le contrat de ce fichier est que l'admin
// voie ses écritures immédiatement (l'éditeur d'effets écrit ce JSON au
// runtime — un memo pur survivrait à l'écriture jusqu'au redémarrage, le
// fichier est lu par fs, pas importé, donc Next ne recompile rien). Le
// statSync par appel remplace la relecture/parse complète qu'on faisait avant
// — c'est lui qui rend le cache correct, pas seulement rapide.
let curatedCache: { data: Record<string, EffectCurated>; mtimeMs: number } | null = null;

/** Charge tous les overrides curés (clé = id d'effet) — mémoïsé sur le mtime. */
export function loadCuratedEffects(): Record<string, EffectCurated> {
  let mtimeMs = -1;
  try {
    mtimeMs = statSync(CURATED_PATH).mtimeMs;
  } catch {
    /* fichier absent → catalogue vide (mtime sentinelle -1) */
  }
  if (curatedCache && curatedCache.mtimeMs === mtimeMs) return curatedCache.data;
  let data: Record<string, EffectCurated> = {};
  if (mtimeMs !== -1) {
    try {
      data = JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as Record<string, EffectCurated>;
    } catch {
      data = {};
    }
  }
  curatedCache = { data, mtimeMs };
  return data;
}

/**
 * INDEX des clés éditoriales curées (`keys` de data/curated/effects.json) vers
 * l'id de création. Deux vues : `byKey` (clé seule — ce dont `resolveEffectKey`
 * a besoin) et `bySideKey` (`${nature}|${clé}` — résolution orientée côté de
 * skill-view). Premier gagnant dans l'ordre du fichier, à IDENTITÉ de vue égale.
 *
 * Mémoïsé sur l'IDENTITÉ de l'objet curé renvoyé par `loadCuratedEffects` (qui
 * change quand le mtime change) : l'index suit donc la fraîcheur du fichier —
 * pas un cache permanent à part qui se périmerait dans le process admin.
 */
interface CuratedKeyIndex {
  byKey: Map<string, string>;
  bySideKey: Map<string, string>;
}
let curatedKeyIndexCache: { ref: Record<string, EffectCurated>; index: CuratedKeyIndex } | null =
  null;

export function curatedKeyIndex(src: EffectSources = liveEffectSources()): CuratedKeyIndex {
  const data = src.curated;
  if (curatedKeyIndexCache && curatedKeyIndexCache.ref === data) return curatedKeyIndexCache.index;
  const byKey = new Map<string, string>();
  const bySideKey = new Map<string, string>();
  for (const [id, c] of Object.entries(data)) {
    const side = (c.isDebuff ?? getMergedEffect(id, src)?.isDebuff) ? 'debuff' : 'buff';
    for (const k of c.keys ?? []) {
      if (!byKey.has(k)) byKey.set(k, id);
      const sk = `${side}|${k}`;
      if (!bySideKey.has(sk)) bySideKey.set(sk, id);
    }
  }
  const index = { byKey, bySideKey };
  curatedKeyIndexCache = { ref: data, index };
  return index;
}

function merge(effect: Effect, c?: EffectCurated): MergedEffect {
  return {
    id: effect.id,
    name: c?.name ? { ...effect.name, ...c.name } : effect.name,
    desc: c?.desc ? { ...effect.desc, ...c.desc } : effect.desc,
    icon: c?.icon ?? effect.icon,
    isDebuff: c?.isDebuff ?? effect.isDebuff,
    origin: effect.origin,
    tooltips: effect.tooltips,
    // Icône remplacée par la curation → communautaire par définition.
    iconEditorial: c?.icon ? true : Boolean(effect.iconEditorial),
    irremovable: Boolean(effect.irremovable),
    tag: c?.tag,
    hidden: Boolean(c?.hidden),
    note: c?.note,
    overridden: Boolean(c && Object.keys(c).length),
  };
}

const EMPTY_DICT: LangDict = { en: '', jp: '', kr: '', zh: '' };

/** Entrée curée AUTONOME (création : mécanique sans texte en jeu) → effet. */
function fromCreation(id: string, c: EffectCurated): MergedEffect {
  return {
    id,
    name: c.name ?? {},
    desc: { ...EMPTY_DICT, ...c.desc },
    icon: c.icon ?? '',
    isDebuff: Boolean(c.isDebuff),
    origin: 'curated',
    tooltips: [],
    iconEditorial: Boolean(c.icon),
    irremovable: false,
    tag: c.tag,
    hidden: Boolean(c.hidden),
    note: c.note,
    overridden: true,
  };
}

/** Tous les effets fusionnés : extraits + créations curées (triés par id). */
export function getMergedEffects(src: EffectSources = liveEffectSources()): MergedEffect[] {
  const merged = Object.values(src.effects).map((e) => merge(e, src.curated[e.id]));
  for (const [id, c] of Object.entries(src.curated)) {
    if (!src.effects[id]) merged.push(fromCreation(id, c));
  }
  return merged.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/** Un effet fusionné par id (extrait ou création curée). */
export function getMergedEffect(
  id: string,
  src: EffectSources = liveEffectSources(),
): MergedEffect | undefined {
  const e = src.effects[id];
  if (e) return merge(e, src.curated[id]);
  return src.curated[id] ? fromCreation(id, src.curated[id]) : undefined;
}

/** Ajoute au StatusMap les statuts référencés par des effets (chips de skills,
 * passifs d'EE/talisman…) — résolution FUSIONNÉE, comme tout l'affichage.
 * (Historiquement dans skill-view ; vit ici pour rester importable du graphe
 * client sans entraîner skill-view, devenu serveur — lectures disque.) */
export function mergeStatusEffects(
  statuses: StatusMap,
  effects: ClientEffect[],
  lang: Lang,
  src: EffectSources = liveEffectSources(),
): StatusMap {
  for (const e of effects) {
    const key = e.tooltip ?? e.label;
    if (!key || statuses[key]) continue;
    const eff = statusEffectFor(e, src);
    if (eff) statuses[key] = localizeStatus(eff, lang);
  }
  return statuses;
}

/**
 * Effet canonique derrière une chip : tooltip du jeu → effet canonique ; sinon
 * le tooltip EST un id d'effet (créations curées des effets synthétiques).
 */
function statusEffectFor(e: ClientEffect, src: EffectSources): MergedEffect | undefined {
  const effId = e.tooltip ? (src.byTooltip[e.tooltip] ?? e.tooltip) : src.byLabel[e.label!];
  return effId ? getMergedEffect(effId, src) : undefined;
}

/** Un statut résolu mais PAS ENCORE localisé — la forme que l'archive fige. */
export interface StatusI18n {
  name: Record<string, string>;
  isDebuff: boolean;
  icon?: string;
  desc?: LangDict;
  hidden?: boolean;
}
export type StatusMapI18n = Record<string, StatusI18n>;

/**
 * Même résolution que `mergeStatusEffects`, mais SANS choisir de langue : les
 * dictionnaires restent entiers. C'est ce qu'on fige pour un boss épinglé — un
 * guide versionné se lit dans les cinq langues, pas seulement en anglais.
 */
export function mergeStatusEffectsI18n(
  statuses: StatusMapI18n,
  effects: ClientEffect[],
  src: EffectSources = liveEffectSources(),
): StatusMapI18n {
  for (const e of effects) {
    const key = e.tooltip ?? e.label;
    if (!key || statuses[key]) continue;
    const eff = statusEffectFor(e, src);
    // Les variantes irremovable sont des EFFETS distincts (icône à cadre
    // spécial portée par l'effet lui-même — jamais recolorée à l'affichage).
    if (eff) {
      statuses[key] = {
        name: eff.name,
        isDebuff: eff.isDebuff,
        ...(eff.icon ? { icon: eff.icon } : {}),
        ...(eff.desc ? { desc: eff.desc } : {}),
        ...(eff.hidden ? { hidden: true } : {}),
      };
    }
  }
  return statuses;
}

/** Un statut i18n → la forme localisée attendue par les chips. */
function localizeStatus(eff: StatusI18n | MergedEffect, lang: Lang): StatusMap[string] {
  return {
    name: lRec(eff.name, lang),
    isDebuff: eff.isDebuff,
    icon: eff.icon || undefined,
    desc: (eff.desc && (lRec(eff.desc, lang) || eff.desc.en)) || undefined,
    hidden: eff.hidden || undefined,
  };
}

/** Fige-t-on ou pas, l'écran veut une langue : `StatusMapI18n` → `StatusMap`. */
export function localizeStatuses(statuses: StatusMapI18n, lang: Lang): StatusMap {
  const out: StatusMap = {};
  for (const [key, eff] of Object.entries(statuses)) out[key] = localizeStatus(eff, lang);
  return out;
}

// --- Résolution par CLÉ éditoriale ({B/…}/{D/…}) ------------------------------

/**
 * Résout une clé éditoriale (`BT_STAT|ST_ATK`, `POLAR_NIGHT`, alias hérité…) vers
 * son effet fusionné. Ordre : index généré (côté demandé puis opposé — le
 * contenu porte le côté via {B}/{D}) puis créations curées (`keys`).
 */
export function resolveEffectKey(
  side: 'buff' | 'debuff',
  key: string,
  src: EffectSources = liveEffectSources(),
): MergedEffect | undefined {
  // Une seule résolution : on détermine l'id (index généré, puis créations
  // curées) et on ne fusionne qu'une fois en sortie.
  const id =
    src.byKey[side]?.[key] ??
    src.byKey[side === 'buff' ? 'debuff' : 'buff']?.[key] ??
    curatedKeyIndex(src).byKey.get(key);
  return id ? getMergedEffect(id, src) : undefined;
}

/** Effet EXTRAIT brut par id (sans override), pour l'admin. */
export function getExtractedEffect(id: string): Effect | undefined {
  return EFFECTS[id];
}

/**
 * Effet canonique pour un id de tooltip (résout une variante) — FUSIONNÉ.
 *
 * Fusionné, pas extrait brut : ces résolveurs servent l'AFFICHAGE (immunités
 * des cartes de boss, chips d'équipement), et l'affichage doit voir la
 * curation. Le bug qu'on a payé : l'effet 61 « Priority Increase » a un
 * override d'icône curé (`IG_Buff_Action_Gauge_Up`, l'icône de combat) — la
 * variante brute (`SC_Buff_Effect_Increase_Priority`, l'icône d'encyclopédie
 * du jeu) repartait à l'écran parce que la résolution par tooltip
 * court-circuitait la fusion. Le brut reste accessible via
 * `getExtractedEffect` (admin).
 */
export function effectForTooltip(
  tooltipId: string,
  src: EffectSources = liveEffectSources(),
): MergedEffect | undefined {
  const id = src.byTooltip[tooltipId];
  return id ? getMergedEffect(id, src) : undefined;
}

/** Effet canonique pour un label (symbole CreateText) — FUSIONNÉ, même règle. */
export function effectForLabel(
  label: string,
  src: EffectSources = liveEffectSources(),
): MergedEffect | undefined {
  const id = src.byLabel[label];
  return id ? getMergedEffect(id, src) : undefined;
}
