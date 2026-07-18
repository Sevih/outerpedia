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
import type { CatalogEntry, LangDict } from '@contracts';
import { buildItemCatalog, catalogCompare } from '@datagen/generators/item-catalog';
import { writeJson } from '@datagen/lib/json';

export interface ItemCurated {
  name?: LangDict;
  desc?: LangDict;
  icon?: string;
  hidden?: boolean;
  note?: string;
}

const PATH = resolve(process.cwd(), 'data/curated/items.json');

export function loadItemCurated(): Record<string, ItemCurated> {
  try {
    return JSON.parse(readFileSync(PATH, 'utf8')) as Record<string, ItemCurated>;
  } catch {
    return {};
  }
}

export async function upsertItemCurated(id: string, curated: ItemCurated): Promise<void> {
  const all = loadItemCurated();
  if (!curated || Object.keys(curated).length === 0) delete all[id];
  else all[id] = curated;
  const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)));
  // Format CANONIQUE (`writeJson`) — cohérent avec `bakeItemCatalogEntry` ci-dessous.
  await writeJson(PATH, sorted);
}

const SERVED = resolve(process.cwd(), 'data/generated/items.json');

/**
 * Rebake UNE entrée du catalogue SERVI (`data/generated/items.json`) après une
 * édition curée. Le générateur est rejoué (base jeu + curé frais) mais SEULE
 * l'entrée éditée est reportée dans le fichier committé : un `.gamedata` plus
 * récent que la dernière promotion ne fuite pas sur le reste du catalogue —
 * la revue de `datagen:promote` garde son sens. Entrée absente du frais
 * (création retirée, item sans nom, icône placeholder) = suppression. Tri via
 * `catalogCompare` pour retomber octet à octet sur le prochain regen.
 */
export async function bakeItemCatalogEntry(id: string): Promise<void> {
  const fresh = buildItemCatalog();
  const served = JSON.parse(readFileSync(SERVED, 'utf8')) as Record<string, CatalogEntry>;
  if (fresh[id]) served[id] = fresh[id];
  else delete served[id];
  const sorted = Object.fromEntries(
    Object.entries(served).sort(([a], [b]) => catalogCompare(a, b)),
  );
  await writeJson(SERVED, sorted);
}
