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

const CURATED_PATH = resolve(process.cwd(), 'data/curated/effects.json');

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
export function getMergedEffects(): MergedEffect[] {
  const curated = loadCuratedEffects();
  const merged = Object.values(EFFECTS).map((e) => merge(e, curated[e.id]));
  for (const [id, c] of Object.entries(curated)) {
    if (!EFFECTS[id]) merged.push(fromCreation(id, c));
  }
  return merged.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/** Un effet fusionné par id (extrait ou création curée). */
export function getMergedEffect(id: string): MergedEffect | undefined {
  const e = EFFECTS[id];
  const curated = loadCuratedEffects();
  if (e) return merge(e, curated[id]);
  return curated[id] ? fromCreation(id, curated[id]) : undefined;
}

/** Ajoute au StatusMap les statuts référencés par des effets (chips de skills,
 * passifs d'EE/talisman…) — résolution FUSIONNÉE, comme tout l'affichage.
 * (Historiquement dans skill-view ; vit ici pour rester importable du graphe
 * client sans entraîner skill-view, devenu serveur — lectures disque.) */
export function mergeStatusEffects(
  statuses: StatusMap,
  effects: ClientEffect[],
  lang: Lang,
): StatusMap {
  for (const e of effects) {
    const key = e.tooltip ?? e.label;
    if (!key || statuses[key]) continue;
    // Tooltip du jeu → effet canonique ; sinon le tooltip EST un id d'effet
    // (créations curées des effets synthétiques).
    const effId = e.tooltip ? (BY_TOOLTIP[e.tooltip] ?? e.tooltip) : BY_LABEL[e.label!];
    const eff = effId ? getMergedEffect(effId) : undefined;
    if (eff) {
      // Les variantes irremovable sont des EFFETS distincts (icône à cadre
      // spécial portée par l'effet lui-même — jamais recolorée à l'affichage).
      statuses[key] = {
        name: lRec(eff.name, lang),
        isDebuff: eff.isDebuff,
        icon: eff.icon || undefined,
        desc: lRec(eff.desc, lang) || eff.desc.en || undefined,
        hidden: eff.hidden || undefined,
      };
    }
  }
  return statuses;
}

// --- Résolution par CLÉ éditoriale ({B/…}/{D/…}) ------------------------------

const BY_KEY = G.effectByKey as Record<'buff' | 'debuff', Record<string, string>>;

/**
 * Résout une clé éditoriale (`BT_STAT|ST_ATK`, `POLAR_NIGHT`, alias V2…) vers
 * son effet fusionné. Ordre : index généré (côté demandé puis opposé — le
 * contenu porte le côté via {B}/{D}) puis créations curées (`keys`).
 */
export function resolveEffectKey(side: 'buff' | 'debuff', key: string): MergedEffect | undefined {
  // Une seule résolution : on détermine l'id (index généré, puis créations
  // curées) et on ne fusionne qu'une fois en sortie.
  const id =
    BY_KEY[side]?.[key] ??
    BY_KEY[side === 'buff' ? 'debuff' : 'buff']?.[key] ??
    Object.entries(loadCuratedEffects()).find(([, c]) => c.keys?.includes(key))?.[0];
  return id ? getMergedEffect(id) : undefined;
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
export function effectForTooltip(tooltipId: string): MergedEffect | undefined {
  const id = BY_TOOLTIP[tooltipId];
  return id ? getMergedEffect(id) : undefined;
}

/** Effet canonique pour un label (symbole CreateText) — FUSIONNÉ, même règle. */
export function effectForLabel(label: string): MergedEffect | undefined {
  const id = BY_LABEL[label];
  return id ? getMergedEffect(id) : undefined;
}
