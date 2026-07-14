/**
 * Lecture des EFFETS : glossaire extrait (`data/generated`) + overrides curés
 * (`data/curated/effects.json`) fusionnés, + référence V2 (oracle legacy) pour
 * comparaison dans l'admin.
 *
 * Le curé est lu au système de fichiers (pas un import figé) pour que l'admin
 * voie ses écritures immédiatement (en dev, Next invalide le module à la
 * recompilation — le cache module ci-dessous ne survit pas à une écriture).
 */
import { readFileSync } from 'node:fs';
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

// Cache module (même pattern que v2Entries plus bas) : le fichier curé ne
// change pas pendant un rendu, et chaque page parse-text déclenchait sinon des
// dizaines de relectures/parses du même JSON. En dev, l'admin voit ses
// écritures via l'invalidation de module de Next (recompilation à la requête).
let curatedCache: Record<string, EffectCurated> | null = null;

/** Charge tous les overrides curés (clé = id d'effet) — mémoïsé au module. */
export function loadCuratedEffects(): Record<string, EffectCurated> {
  if (!curatedCache) {
    try {
      curatedCache = JSON.parse(readFileSync(CURATED_PATH, 'utf8')) as Record<
        string,
        EffectCurated
      >;
    } catch {
      curatedCache = {};
    }
  }
  return curatedCache;
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

// --- Référence V2 (oracle legacy), pour l'admin uniquement -------------------

interface V2Ref {
  name?: string;
  label?: string;
  category?: string;
  description?: string;
  icon?: string;
}

let v2Entries: V2Ref[] | null = null;

function loadV2(): V2Ref[] {
  if (!v2Entries) {
    v2Entries = [];
    for (const file of ['buffs.json', 'debuffs.json']) {
      try {
        const arr = JSON.parse(
          readFileSync(resolve(process.cwd(), 'data/legacy/effects', file), 'utf8'),
        ) as V2Ref[];
        v2Entries.push(...arr);
      } catch {
        /* legacy absent — pas de référence */
      }
    }
  }
  return v2Entries;
}

/** Glossaire V2 écrit à la main, indexé par icône (référence, pas oracle). */
export function v2Reference(icon: string): V2Ref | undefined {
  return loadV2().find((e) => e.icon === icon);
}

/**
 * ANTI-RÉGRESSION : les libellés V2 sans équivalent V3 (comparés aux noms
 * FUSIONNÉS, donc un renommage curé peut combler un trou). Objectif : liste vide
 * — chaque entrée restante = concept V2 à retrouver (extraction ou curation).
 */
export function v2MissingInV3(): V2Ref[] {
  const known = new Set<string>();
  for (const e of getMergedEffects()) {
    for (const n of Object.values(e.name)) if (n) known.add(n.trim().toLowerCase());
  }
  const missing: V2Ref[] = [];
  const seen = new Set<string>();
  for (const v2 of loadV2()) {
    const label = (v2.label ?? '').trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key) || known.has(key)) continue;
    seen.add(key);
    missing.push(v2);
  }
  return missing;
}
