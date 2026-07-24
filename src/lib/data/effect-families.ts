/**
 * Taxonomie des FAMILLES UI d'effets — SOURCE UNIQUE, sans dépendance runtime
 * (aucun import de glossaire/disque), donc importable côté client (l'éditeur
 * admin) comme côté serveur (`effect-filters.ts`).
 *
 * Une famille est le regroupement d'affichage d'un effet dans l'onglet
 * « Effects » de `/characters` (Stat Boosts, CC, DoT…). Le `tag` curé d'un effet,
 * quand il vaut une de ces familles, OVERRIDE la catégorie de la taxonomie — d'où
 * l'intérêt d'un select fermé plutôt qu'un champ libre.
 */
export type EffectSide = 'buff' | 'debuff';

/** Familles valides par côté, DANS l'ordre d'affichage (parité V2). */
export const EFFECT_FAMILIES: Record<EffectSide, readonly string[]> = {
  buff: ['statBoosts', 'supporting', 'utility', 'unique'],
  debuff: ['statReduction', 'cc', 'dot', 'utility', 'unique'],
};

/**
 * Libellé EN d'une famille pour un côté donné — parité stricte avec les clés
 * publiques `characters.effectsGroups.<side>.<family>` (utility/unique diffèrent
 * selon le côté). Sert au libellé du select admin.
 */
export function effectFamilyLabel(side: EffectSide, family: string): string {
  const shared: Record<string, string> = {
    statBoosts: 'Stat Boosts',
    supporting: 'Supporting',
    statReduction: 'Stat Reduction',
    cc: 'Control Effects (CC)',
    dot: 'Damage Over Time (DoT)',
  };
  if (family === 'utility') return side === 'debuff' ? 'Utility Debuffs' : 'Utility';
  if (family === 'unique') return side === 'debuff' ? 'Unique Debuffs' : 'Unique Buffs';
  return shared[family] ?? family;
}
