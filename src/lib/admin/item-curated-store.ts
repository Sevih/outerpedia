/**
 * Couche curée des items + monnaies (ADMIN local). Override partiel par id :
 * nom, description, icône, masquage. Clés triées pour des diffs git stables ;
 * une entrée vide supprime la clé.
 *
 * L'édition est aussi REBAKÉE à chaud dans le catalogue servi
 * (`bakeItemCatalogEntry`) : pas de `datagen:regen` à rejouer pour la voir
 * sur le site — même esprit que l'intégration ciblée d'un perso.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateItemCurated, type ItemCurated } from '@datagen/curated/items';
import { integrateItemData } from '@datagen/generators/item-catalog';
import { writeJson } from '@datagen/lib/json';

// Contrat + validation : source UNIQUE dans `datagen/curated/items.ts` (audit
// F11 — fini la « forme miroir » avec le générateur). Ré-exportés parce que les
// consommateurs du store (route admin, overlay live, bake) les tiraient d'ici.
export { validateItemCurated };
export type { ItemCurated };

const PATH = resolve(process.cwd(), 'data/curated/items.json');

export function loadItemCurated(): Record<string, ItemCurated> {
  try {
    return JSON.parse(readFileSync(PATH, 'utf8')) as Record<string, ItemCurated>;
  } catch {
    return {};
  }
}

/** Valide puis enregistre l'override d'un item. Entrée vide → supprime la clé. */
export async function upsertItemCurated(id: string, curated: ItemCurated): Promise<string[]> {
  const errors = curated ? validateItemCurated(id, curated) : [];
  if (errors.length) return errors;

  const all = loadItemCurated();
  if (!curated || Object.keys(curated).length === 0) delete all[id];
  else all[id] = curated;
  // Tri numérique comme les autres stores (F10) : les ids d'items sont textuels
  // aujourd'hui, mais `21201` (cf. les récompenses de coupons) en est un aussi.
  const sorted = Object.fromEntries(
    Object.entries(all).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  // Format CANONIQUE (`writeJson`) — cohérent avec `bakeItemCatalogEntry` ci-dessous.
  await writeJson(PATH, sorted);
  return [];
}

const GEN = resolve(process.cwd(), 'data/generated');

/**
 * Rebake UNE entrée du catalogue SERVI (`data/generated/items.json`) après une
 * édition curée : l'édition vaut validation (la donnée jeu sous-jacente n'a pas
 * bougé), rien à promouvoir pour la voir. Simple façade sur `integrateItemData`
 * — le même geste que la revue d'extraction (`integrateItem`), sans images.
 */
export async function bakeItemCatalogEntry(id: string): Promise<void> {
  await integrateItemData(GEN, id);
}
