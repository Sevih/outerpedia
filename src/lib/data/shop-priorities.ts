/** Accès aux PRIORITÉS D'ACHAT en boutique (`data/generated/shop-priorities.json`, guide dédié). */
import type { ShopPrioritiesData } from '@contracts';
import shopData from '@data/generated/shop-priorities.json';

const SHOP = shopData as unknown as ShopPrioritiesData;

export function getShopPriorities(): ShopPrioritiesData {
  return SHOP;
}
