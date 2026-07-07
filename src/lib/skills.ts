import type { SkillBuffVars } from '@contracts';

/**
 * Raccourci de skill ÉDITORIAL → type de skill V3 (clé `Skill.type`).
 * Table unique du domaine : parse-text (`{SK/perso|S2}`) et tout futur
 * consommateur de raccourcis S1/S2/S3 importent d'ici.
 */
export const SKILL_SHORTHAND: Record<string, string> = {
  S1: 'first',
  S2: 'second',
  S3: 'ultimate',
  Passive: 'unique_passive',
  Chain: 'chain_passive',
};

/** Ordre d'affichage des skills principaux (grille de cartes). */
export const MAIN_SKILL_TYPES = ['first', 'second', 'ultimate'] as const;

/** Portée du jeu (`RangeType` slugifié) → clé de cible éditoriale V2 (mono/multi/duo). */
export const RANGE_TO_TARGET: Record<string, string> = {
  single: 'mono',
  all: 'multi',
  double: 'duo',
  double_speed: 'duo',
};

/** Entrée de niveau ≤ demandé la plus proche (tables de niveaux parfois creuses). */
export function levelAt<T extends { level: number }>(levels: T[], lvl: number): T | undefined {
  let best: T | undefined;
  for (const l of levels) if (l.level <= lvl && l.level >= (best?.level ?? 0)) best = l;
  return best;
}

/**
 * Coupe la description d'un chain passive en ses deux moitiés (effet de
 * chaîne / effet d'attaque duo), délimitées par les titres colorés du jeu
 * (`<color=#ffd732>…</color>:`). Une seule section → tout est « chain ».
 */
export function splitChainDual(desc: string): { chain: string; dual: string } {
  const marker = /<color=#ffd732>[^<]+<\/color>\s*:\s*/gi;
  const matches = [...desc.matchAll(marker)];
  if (matches.length < 2) return { chain: desc.trim(), dual: '' };
  const splitIndex = matches[1].index ?? 0;
  return { chain: desc.slice(0, splitIndex).trim(), dual: desc.slice(splitIndex).trim() };
}

/**
 * Résout les placeholders `[Buff_C/V/T_<id>]` d'une description de compétence
 * avec les valeurs déjà extraites du niveau (`levels[i].vars`).
 *
 * Même logique que la primitive datagen `resolveSkillPlaceholders`, mais côté
 * APP : les valeurs viennent de la donnée committée, pas des tables de jeu.
 *   C = chance · V = valeur · T = tours. Valeur absente → « ? ».
 * Les balises `<color=…>` du template sont conservées (le rendu les stylise).
 */
export function resolveSkillText(
  template: string,
  vars: Record<string, SkillBuffVars> = {},
): string {
  return template.replace(/\[Buff_([CVT])_(.+?)\]/g, (_m, kind: string, buffId: string) => {
    const v = vars[buffId];
    const val = kind === 'C' ? v?.c : kind === 'T' ? v?.t : v?.v;
    return val ?? '?';
  });
}
