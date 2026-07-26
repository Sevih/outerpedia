/**
 * Couche CURÉE — overrides du catalogue d'items (`data/curated/items.json`).
 *
 * Override PARTIEL par id (nom, description, icône, masquage) + note d'admin.
 * Une entrée vide supprime la clé côté store.
 *
 * CONTRAT UNIQUE (audit F11) : ce type était DUPLIQUÉ en « forme miroir » entre
 * le store admin (`src/lib/admin/item-curated-store.ts`, qui ÉCRIT le curé) et le
 * générateur (`datagen/generators/item-catalog.ts`, qui le LIT et le bake dans
 * `items.json`). Rien ne tenait les deux ensemble. Il vit désormais ici, comme
 * les autres contrats curés (character/effects/equipment/gear-reco) : écrit et lu
 * contre la MÊME forme. Ce qu'un mauvais type coûte : `applyCurated` remplace le
 * nom/la desc de l'entrée SERVIE et le rebake part dans le catalogue public —
 * d'où la validation ci-dessous, jouée à l'écriture.
 */
import { validate, type Schema } from '../extractor/core/validate';
import type { LangDict } from '../lib/lang';

export interface ItemCurated {
  name?: LangDict;
  desc?: LangDict;
  icon?: string;
  hidden?: boolean;
  note?: string;
}

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
