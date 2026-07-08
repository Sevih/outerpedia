/**
 * Couche curée des items + monnaies (ADMIN local). Override partiel par id :
 * nom, description, icône, masquage. Clés triées pour des diffs git stables ;
 * une entrée vide supprime la clé.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LangDict } from '@contracts';

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

export function upsertItemCurated(id: string, curated: ItemCurated): void {
  const all = loadItemCurated();
  if (!curated || Object.keys(curated).length === 0) delete all[id];
  else all[id] = curated;
  const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(PATH, JSON.stringify(sorted, null, 2) + '\n');
}
