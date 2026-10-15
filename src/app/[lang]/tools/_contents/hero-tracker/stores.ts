/**
 * État PERSISTÉ du suivi de compte (localStorage) : la spec du store — clé,
 * version, migrations v1 → v2 → v3, complétion des réglages ajoutés depuis.
 * Extrait de `HeroTrackerBrowser.tsx` le 03/10/2026 (découpage mécanique,
 * contenu inchangé).
 */
import type { StoreSpec } from '@/lib/client-storage';
import { SKILL_SLOTS, type TrackerState } from './contracts';
import type { HeroProgress } from './engine';
import type { HeroEntry } from './roster-import';

/** Schéma v1 : les entrées à plat, un seul EE, trois slots de skill. */
interface LegacyEntry {
  state: Omit<HeroProgress, 'ee' | 'fusion'> & { ee: number };
  target: Omit<HeroProgress, 'ee' | 'fusion'> & { ee: number };
}

/**
 * Ce que la migration v2 → v3 doit savoir d'un héros : sa rareté AFFICHÉE et les
 * étoiles (`TransStar`) de son échelle actuelle. `undefined` = héros inconnu du
 * roster (sorti des données) : sa saisie passe telle quelle.
 */
export type LadderOf = (heroId: string) => { rarity: number; stars: number[] } | undefined;

const FALLBACK: TrackerState = {
  heroes: {},
  fused: {},
  alwaysMax: false,
  hideMaxed: false,
  hideDone: false,
  ignore1Star: false,
  ignore2Star: false,
  hide1Star: false,
  hide2Star: false,
};

/** v1 ignorait la chain passive, les Core Fusion et le second EE. */
function fromV1(data: object): TrackerState {
  const lift = (p: LegacyEntry['state']): HeroProgress => ({
    level: p.level,
    skills: Array.from({ length: SKILL_SLOTS }, (_, i) => p.skills?.[i] ?? 1),
    fusion: 0,
    affinity: p.affinity,
    transcend: p.transcend,
    ee: [p.ee ?? 0],
  });
  const heroes: Record<string, HeroEntry> = {};
  for (const [id, e] of Object.entries(data as Record<string, LegacyEntry>)) {
    if (!e?.state || !e?.target) continue;
    heroes[id] = { state: lift(e.state), target: lift(e.target) };
  }
  return { ...FALLBACK, heroes };
}

/**
 * v2 → v3 : l'INDEX de transcendance change de sens. Jusqu'en v2, l'échelle
 * gardait les paliers que le jeu ne parcourt pas (5, 7, 8 des 1★/2★) et un
 * fusionné suivait le barème 3★ : elle était contiguë depuis la rareté affichée,
 * donc étoile = rareté + index. Le nouvel index est celui du plus haut palier
 * réel ≤ cette étoile — un cran fantôme retombe sur le palier d'en dessous, un
 * 3★ ne bouge pas.
 */
function toV3(data: TrackerState, ladderOf: LadderOf): TrackerState {
  const heroes: Record<string, HeroEntry> = {};
  for (const [id, entry] of Object.entries(data.heroes ?? {})) {
    const hero = ladderOf(id);
    if (!hero || !entry?.state || !entry?.target) {
      heroes[id] = entry;
      continue;
    }
    const reindex = (p: HeroProgress): HeroProgress => {
      const star = hero.rarity + (p.transcend ?? 0);
      const at = hero.stars.findLastIndex((s) => s <= star);
      return { ...p, transcend: Math.max(at, 0) };
    };
    heroes[id] = { ...entry, state: reindex(entry.state), target: reindex(entry.target) };
  }
  return { ...data, heroes };
}

/**
 * La spec du store. Une FABRIQUE et non une constante : la migration v2 → v3 a
 * besoin de l'échelle de chaque héros, que seules les données du roster portent.
 * `useTrackerState` la construit une fois, au premier rendu — clé et version
 * restent fixes pour toute la vie de l'écran, ce que `useStoredState` exige.
 */
export function trackerSpec(ladderOf: LadderOf): StoreSpec<TrackerState> {
  return {
    key: 'outerpedia:hero-tracker',
    version: 3,
    fallback: FALLBACK,
    // Une saisie déjà faite vaut mieux qu'un écran remis à zéro : on la relève.
    // `undefined` ferait retomber sur le `fallback`, donc PERDRE la saisie.
    migrate: (data, from) => {
      if (typeof data !== 'object' || data === null) return undefined;
      if (from === 1) return toV3(fromV1(data), ladderOf);
      if (from === 2) return toV3(data as TrackerState, ladderOf);
      return undefined;
    },
    // Un état écrit AVANT l'ajout d'un réglage n'a pas son champ : il rendrait sa
    // case NON CONTRÔLÉE (React proteste, la case cesse de répondre). On complète
    // à la lecture, le stockage se répare au premier changement — bumper la
    // version pour une case à cocher se paierait en saisie perdue.
    normalize: (data) => ({
      ...FALLBACK,
      ...(data && typeof data === 'object' ? (data as Partial<TrackerState>) : {}),
    }),
  };
}
