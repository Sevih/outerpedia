/**
 * Icônes (sprites) déclarées par la donnée mais ABSENTES du jeu : les items qui
 * les portent sont des placeholders (non sortis). Source unique de trois gestes
 * du pipeline : le manifest d'assets (ne pas les demander au collecteur),
 * l'intégration d'item et le catalogue unifié (ne pas les lister).
 *
 * Vit dans `datagen/` (déplacé de `src/lib/data/` le 2026-07-21) : ses trois
 * consommateurs sont des générateurs, AUCUN code `src` ne le lit — l'ancien
 * emplacement forçait un import datagen → src à rebours de la doctrine des
 * contrats (le pipeline produit la donnée, il ne dépend pas du site).
 */
export const MISSING_ITEM_ICONS = new Set([
  'TI_Item_Growth_Earth_05',
  'TI_Item_Growth_Fire_05',
  'TI_Item_Growth_Water_05',
  'TI_Item_Growth_Light_05',
  'TI_Item_Growth_Dark_05',
]);
