/**
 * Sprites d'items (`TI_*`) EXTRAITS mais non encore rattachés à un item/monnaie
 * — candidats « à rentrer » depuis Editor › Item (dev only). L'id d'une création
 * issue d'un sprite = le nom du sprite (l'icône se pré-remplit toute seule).
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { getItems } from '@/lib/data/items';
import { getGoods } from '@/lib/data/goods';
import { loadItemCurated } from './item-curated-store';

const SPRITE_DIR = resolve(
  process.cwd(),
  '.gamedata/extracted/images/assets/editor/resources/sprite/at_thumbnailitemruntime',
);

function sprites(): string[] {
  try {
    return readdirSync(SPRITE_DIR)
      .filter((f) => /^TI_.*\.png$/i.test(f))
      .map((f) => f.replace(/\.png$/i, ''));
  } catch {
    return [];
  }
}

/** Noms de sprites `TI_*` non référencés (ni comme icône, ni comme id créé). */
export function unusedItemIcons(): string[] {
  const cur = loadItemCurated();
  const used = new Set<string>();
  for (const it of Object.values(getItems())) if (it.icon) used.add(it.icon.toLowerCase());
  for (const g of Object.values(getGoods())) if (g.icon) used.add(g.icon.toLowerCase());
  for (const c of Object.values(cur)) if (c.icon) used.add(c.icon.toLowerCase());
  // Un sprite dont le nom est déjà un id créé n'est plus « à rentrer ».
  const createdIds = new Set(Object.keys(cur).map((k) => k.toLowerCase()));
  return sprites()
    .filter((s) => !used.has(s.toLowerCase()) && !createdIds.has(s.toLowerCase()))
    .sort();
}
