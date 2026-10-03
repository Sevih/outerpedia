/**
 * État PERSISTÉ du suivi de compte (localStorage) : la spec du store — clé,
 * version, migration v1 → v2, complétion des réglages ajoutés depuis. Extrait
 * de `HeroTrackerBrowser.tsx` le 03/10/2026 (découpage mécanique, contenu
 * inchangé).
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

export const SPEC: StoreSpec<TrackerState> = {
  key: 'outerpedia:hero-tracker',
  version: 2,
  fallback: {
    heroes: {},
    fused: {},
    alwaysMax: false,
    hideMaxed: false,
    hideDone: false,
    ignore1Star: false,
    ignore2Star: false,
    hide1Star: false,
    hide2Star: false,
  },
  // v1 ignorait la chain passive, les Core Fusion et le second EE. Une saisie
  // déjà faite vaut mieux qu'un écran remis à zéro : on la relève.
  migrate: (data, from) => {
    if (from !== 1 || typeof data !== 'object' || data === null) return undefined;
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
    return {
      heroes,
      fused: {},
      alwaysMax: false,
      hideMaxed: false,
      hideDone: false,
      ignore1Star: false,
      ignore2Star: false,
      hide1Star: false,
      hide2Star: false,
    };
  },
  // Un état écrit AVANT l'ajout d'un réglage n'a pas son champ : il rendrait sa
  // case NON CONTRÔLÉE (React proteste, la case cesse de répondre). On complète
  // à la lecture, le stockage se répare au premier changement — bumper la
  // version pour une case à cocher se paierait en saisie perdue.
  normalize: (data) => ({
    ...SPEC.fallback,
    ...(data && typeof data === 'object' ? (data as Partial<TrackerState>) : {}),
  }),
};
