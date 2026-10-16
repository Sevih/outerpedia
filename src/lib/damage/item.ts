/**
 * Options d'équipement — miroir de CItem.GetEnchantFactor, GetBreakLimitFactor
 * et CItemMainOption.get_OptionValue (listings C#, docs/specs/damage-formula-cs/).
 * Réf : docs/specs/damage-formula.md § 17.5.
 * Tout est float32 (Math.fround), troncature vers zéro à la fin.
 */

const f32 = Math.fround;

/**
 * Somme float32 séquentielle (fadd en chaîne dans le binaire) — l'ordre des
 * termes compte. GetEnchantFactor : UpgradeFactorforOP des lignes
 * ItemEnchantTemplet (ItemSubType de la pièce) de niveau 1..enchantLevel.
 * GetBreakLimitFactor / GetSingularityFactor : même schéma sur leurs templets.
 */
export function sumFactorsF32(factors: readonly number[]): number {
  let sum = 0;
  for (const f of factors) sum = f32(sum + f32(f));
  return sum;
}

/**
 * Valeur finale d'une option PRINCIPALE :
 * trunc_f32(OptionValue × (1 + enchant + singularité) × (1 + breakLimit)),
 * dans l'ordre exact des instructions du binaire. Les sub-options ne passent
 * PAS par cette formule (valeurs stockées telles quelles).
 */
export function itemMainOptionValue(
  optionValue: number,
  enchantFactor: number,
  breakLimitFactor = 0,
  singularityFactor = 0,
): number {
  let t = f32(f32(enchantFactor) + 1);
  t = f32(t + f32(singularityFactor));
  t = f32(t * f32(optionValue));
  t = f32(t * f32(f32(breakLimitFactor) + 1));
  return Math.trunc(t);
}

/** Ce que `mainOptionAt` lit des règles d'amélioration (`equipment/enhance.json`). */
export interface MainOptionRules {
  enhanceFactor: number;
  maxEnhance: number;
  tierFactor: number;
  singularity: { activation: { factor: number }; steps: readonly { to: number; factor: number }[] };
}

/**
 * Valeur d'une option principale à +`enh` / percée `tier` (ascension comprise
 * à partir de +10 quand `ascended`) : facteurs cumulés comme le client —
 * enchant 1..min(enh, max), paliers de percée 1..tier, activation puis pas
 * atteints de la Singularité — puis `itemMainOptionValue`. Valeur BRUTE
 * (per-mille pour les %), à diviser pour l'affichage.
 */
export function mainOptionAt(
  optionValue: number,
  rules: MainOptionRules,
  enh: number,
  tier: number,
  ascended = false,
): number {
  const lv = Math.min(enh, rules.maxEnhance);
  const sing =
    ascended && enh >= rules.maxEnhance
      ? [
          rules.singularity.activation.factor,
          ...rules.singularity.steps.filter((s) => enh >= s.to).map((s) => s.factor),
        ]
      : [];
  return itemMainOptionValue(
    optionValue,
    sumFactorsF32(Array<number>(lv).fill(rules.enhanceFactor)),
    sumFactorsF32(Array<number>(tier).fill(rules.tierFactor)),
    sumFactorsF32(sing),
  );
}
