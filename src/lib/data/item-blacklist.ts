/**
 * Icônes (sprites) déclarées par la donnée mais ABSENTES du jeu : les items qui
 * les portent sont des placeholders (non sortis). Source unique, partagée par
 * le manifest d'assets (ne pas demander au collecteur) ET le catalogue admin
 * (ne pas lister ces items).
 */
export const MISSING_ITEM_ICONS = new Set([
  'TI_Item_Growth_Earth_05',
  'TI_Item_Growth_Fire_05',
  'TI_Item_Growth_Water_05',
  'TI_Item_Growth_Light_05',
  'TI_Item_Growth_Dark_05',
]);
