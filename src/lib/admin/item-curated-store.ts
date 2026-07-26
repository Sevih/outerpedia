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
import type { LangDict } from '@contracts';
import { integrateItemData } from '@datagen/generators/item-catalog';
import { validate, type Schema } from '@datagen/extractor/core/validate';
import { writeJson } from '@datagen/lib/json';

export interface ItemCurated {
  name?: LangDict;
  desc?: LangDict;
  icon?: string;
  hidden?: boolean;
  note?: string;
}

/**
 * Contrat de l'override (audit F10 — ce store écrivait sans AUCUNE garde).
 * Ce qu'un mauvais type coûte ici : `applyCurated` remplace le nom/la desc de
 * l'entrée SERVIE, et `bakeItemCatalogEntry` rebake dans la foulée — une valeur
 * mal typée part donc directement dans le catalogue public.
 *
 * ⚠ `datagen/generators/item-catalog.ts` porte une copie de ce type (« forme
 * miroir ») ; les deux sont identiques au 26/07 mais rien ne les tient ensemble.
 */
const itemCuratedSchema: Schema = {
  kind: 'object',
  fields: {
    name: { kind: 'record', of: { kind: 'string' }, optional: true },
    desc: { kind: 'record', of: { kind: 'string' }, optional: true },
    icon: { kind: 'string', optional: true },
    hidden: { kind: 'boolean', optional: true },
    note: { kind: 'string', optional: true },
  },
};

/** Valide un override d'item ; renvoie les écarts de schéma (vide = OK). */
export function validateItemCurated(id: string, c: ItemCurated): string[] {
  return validate(c, itemCuratedSchema, `itemCurated[${id}]`).map(
    (i) => `${i.path} — ${i.message}`,
  );
}

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
