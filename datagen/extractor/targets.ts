/**
 * Registre des CIBLES générées — le pont entre un fichier `data/generated/*` et
 * la façon de le RECONSTRUIRE à neuf (pour la revue de maintenance « le jeu a
 * bougé, qu'est-ce qui change ? »).
 *
 * L'orchestrateur (`build.ts`) écrit ces fichiers ; la revue, elle, a besoin de
 * reproduire le même contenu EN MÉMOIRE pour le confronter au committé. Une cible
 * = un fichier + un `build()` pur (+ un `select` optionnel quand l'entité vit
 * sous une clé d'un fichier partagé, ex. les effets dans `glossaries.json`).
 * Ajouter une entité = ajouter une ligne ici.
 */
import { buildCharacters } from './specs/character';
import { buildMonsters } from './specs/monster';
import { buildEquipment, type EquipmentData } from '../generators/equipment';
import { buildItemCatalog } from '../generators/item-catalog';
import { buildEffectGlossary } from '../lib/effects';
import { fileStamp, tablesStamp } from '../lib/tables';

export interface GeneratedTarget {
  /** Identifiant CLI/route : `character`, `weapon`… */
  id: string;
  /** Libellé humain pour l'UI. */
  label: string;
  /** Chemin RELATIF dans `data/generated/`. */
  file: string;
  /** Reconstruit la donnée fraîche (clé d'entité → objet), comme `build.ts`. */
  build(): Record<string, unknown>;
  /**
   * Clé du sous-objet dans un fichier PARTAGÉ (défaut : le fichier entier est la
   * cible). Sert à la fois à la LECTURE (comparer ce sous-objet) et à l'ÉCRITURE
   * (n'écraser QUE ce sous-objet, pas le reste du fichier) — les effets vivent
   * sous `glossaries.json`.effects, les autres clés du glossaire (classes,
   * éléments…) ne doivent pas être touchées par un accept.
   */
  subKey?: string;
}

/**
 * `buildEquipment` reconstruit TOUS les slots d'un coup (lourd, lit le FS) et
 * six cibles s'en servent : mémoïsé sur les tables (un refresh les réécrit
 * toutes → sentinelle TextSystem) pour ne le payer qu'une fois par chargement.
 */
let equipCache: { stamp: string; data: EquipmentData } | undefined;
function equipment(): EquipmentData {
  const stamp = tablesStamp(['TextSystem']);
  if (!equipCache || equipCache.stamp !== stamp) equipCache = { stamp, data: buildEquipment() };
  return equipCache.data;
}

const equipTarget = (id: string, label: string, key: keyof EquipmentData): GeneratedTarget => ({
  id,
  label,
  file: `equipment/${String(key)}.json`,
  build: () => equipment()[key] as Record<string, unknown>,
});

/**
 * Catalogue d'items UNIFIÉ (items + goods + costumes + overlay curé baké) — la
 * forme exacte de `items.json` (cf. build.ts). Lourd (trois générateurs + le
 * curé) → mémoïsé sur les tables d'items ET le curé éditable (l'éditeur d'items
 * réécrit `data/curated/items.json`, la revue doit le refléter).
 */
let itemCache: { stamp: string; data: Record<string, unknown> } | undefined;
function itemCatalog(): Record<string, unknown> {
  const stamp = `${tablesStamp(['TextItem'])}|${fileStamp('data/curated/items.json')}`;
  if (!itemCache || itemCache.stamp !== stamp) itemCache = { stamp, data: buildItemCatalog() };
  return itemCache.data;
}

export const TARGETS: GeneratedTarget[] = [
  {
    id: 'character',
    label: 'Personnages',
    file: 'characters.json',
    build: () => buildCharacters().characters as unknown as Record<string, unknown>,
  },
  {
    id: 'monster',
    label: 'Monstres',
    file: 'monsters.json',
    build: () => buildMonsters().monsters as unknown as Record<string, unknown>,
  },
  {
    id: 'effect',
    label: 'Effets',
    // Les effets ne sont pas un fichier dédié : ils vivent sous `.effects` du
    // glossaire partagé (cf. build.ts) → on cible ce sous-objet (lecture ET
    // écriture ne touchent que `.effects`).
    file: 'glossaries.json',
    subKey: 'effects',
    build: () => Object.fromEntries(buildEffectGlossary().effects),
  },
  equipTarget('ee', 'EE', 'ee'),
  equipTarget('weapon', 'Armes', 'weapon'),
  equipTarget('amulet', 'Amulettes', 'accessory'),
  equipTarget('armor', 'Armures', 'armor'),
  equipTarget('talisman', 'Talismans', 'talisman'),
  equipTarget('set', 'Sets', 'sets'),
  {
    id: 'item',
    label: 'Items',
    file: 'items.json',
    build: () => itemCatalog(),
  },
];

export function getTarget(id: string): GeneratedTarget | undefined {
  return TARGETS.find((t) => t.id === id);
}
