/**
 * Vocabulaire des tiers S→E (porté de `_shared/tierlist.ts`) : ordre canonique,
 * accents visuels des rangées et comparateur de tri par rang. Partagé entre les
 * outils tier list (PvE/PvP) et leur JSON-LD ItemList.
 *
 * C'est aussi la source des listes que la CURATION propose — rangs, rôles et
 * paliers : les deux éditeurs de l'admin et l'onglet « Rangs » de `pnpm quick`
 * les lisent ici. Chacun en tenait sa copie, et une copie de plus côté quick
 * aurait fini par offrir un rang que la tier list ne sait pas ranger.
 */
import type { CuratedRole } from '@contracts';
import { transcendenceFullSteps } from '@/lib/transcendence';

export const TIERS = ['S', 'A', 'B', 'C', 'D', 'E'] as const;
export type Tier = (typeof TIERS)[number];

/** Rangs d'un EE (déblocage et +10) : S→D, l'échelle des EE n'a pas de E. */
export const EE_TIERS = ['S', 'A', 'B', 'C', 'D'] as const satisfies readonly Tier[];

/** Rôles curés, dans l'ordre des colonnes de la tier list. */
export const CURATED_ROLES = [
  'dps',
  'support',
  'sustain',
] as const satisfies readonly CuratedRole[];

/**
 * Les paliers (`TransStar`) où `rankByTranscend` / `roleByTranscend` se curent :
 * les PLEINS de l'échelle 3★ (3, 4, 6 et 9 → 3★, 4★, 5★, 6★), lus dans la table
 * du jeu. Le pourquoi est au commentaire de `STARS` (`CharacterCuratedEditor`).
 */
export const CURATED_STEP_RARITY = 3;
export const CURATED_STEPS = transcendenceFullSteps(CURATED_STEP_RARITY);

/**
 * Dégradé + bordure d'une rangée de tier (classes littérales Tailwind — couleurs
 * vives autorisées hors `guides/**`, inchangé).
 */
export const TIER_COLORS: Record<Tier, string> = {
  S: 'from-amber-500/30 to-amber-900/10 border-amber-500/50',
  A: 'from-orange-600/30 to-orange-900/10 border-orange-500/50',
  B: 'from-blue-500/30 to-blue-900/10 border-blue-500/50',
  C: 'from-green-500/30 to-green-900/10 border-green-500/50',
  // D : neutre → tokens (les gris bruts sont interdits, cf. eslint RAW_COLOR).
  D: 'from-content-subtle/30 to-surface-sunken/10 border-line-strong',
  E: 'from-amber-900/30 to-amber-950/10 border-amber-800/50',
};

const RANK_WEIGHT: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5 };

/**
 * Comparateur `sort()` ordonnant par rang S→E ; rang absent ou inconnu → en
 * queue.
 */
export function tierListRankOrder<T>(getRank: (entry: T) => string | undefined) {
  return (a: T, b: T) => {
    const wa = RANK_WEIGHT[getRank(a) ?? ''] ?? 99;
    const wb = RANK_WEIGHT[getRank(b) ?? ''] ?? 99;
    return wa - wb;
  };
}
