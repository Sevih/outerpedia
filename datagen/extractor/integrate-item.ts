/**
 * INTÉGRATION PAR ENTITÉ — ITEM (le geste de validation humain, côté catalogue).
 *
 * Pendant de `integrate.ts` (perso) / `integrate-equipment.ts` (gear) pour le
 * catalogue d'items. Intégrer un item =
 *   1. reporter SON entrée fraîche dans `items.json` (cœur partagé
 *      `integrateItemData` — le même que le rebake de l'éditeur d'items) ;
 *   2. stager SON icône (`images/items/…`) depuis les assets du jeu.
 *
 * Le catalogue est UNIFIÉ (items + goods + costumes + curé baké) : « intégrer »
 * un id, c'est écrire l'entrée telle que l'extraction fraîche la voit — création,
 * mise à jour, ou suppression (id disparu du frais).
 */
import { resolve } from 'node:path';
import { buildImageIndex } from '../assets/source';
import { stageAssets } from '../assets/stage';
import type { AssetRequest } from '../assets/manifest';
import { integrateItemData } from '../generators/item-catalog';
import { MISSING_ITEM_ICONS } from '../lib/item-blacklist';
import type { IntegrateReport } from './integrate';

const GEN = resolve('data/generated');

/**
 * Intègre UN item (bouton « Intégrer » d'une ligne de l'extracteur d'items) :
 * son entrée dans `items.json` + son icône. Committe via git, puis
 * `pnpm assets:push` pour le R2.
 */
export async function integrateItem(id: string): Promise<IntegrateReport> {
  const { files, entry } = await integrateItemData(GEN, id);

  // Icône : une seule requête, sautée si l'entrée a disparu ou porte un
  // placeholder blacklisté (sprite absent du jeu).
  const requests: AssetRequest[] = [];
  if (entry?.icon && !MISSING_ITEM_ICONS.has(entry.icon)) {
    requests.push({
      kind: 'image',
      key: `images/items/${entry.icon}.webp`,
      candidates: [entry.icon],
      domain: 'items',
    });
  }
  const assets = await stageAssets(requests, buildImageIndex());
  return { id, files, assets };
}
