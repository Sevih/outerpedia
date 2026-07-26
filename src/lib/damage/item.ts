/**
 * Options d'équipement — miroir de CItem.GetEnchantFactor (0x23104A4),
 * GetBreakLimitFactor (0x23105D8) et CItemMainOption.get_OptionValue (0x230DB18),
 * libil2cpp 1.4.9. Réf : docs/specs/damage-formula.md § 17.5.
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
