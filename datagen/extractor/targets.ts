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
import { buildEffectGlossary } from '../lib/effects';
import { tablesStamp } from '../lib/tables';

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
   * Sous-ensemble du fichier committé à comparer (défaut : le fichier entier).
   * Sert quand plusieurs entités partagent un fichier — les effets vivent sous
   * `glossaries.json`.effects.
   */
  select?(raw: Record<string, unknown>): Record<string, unknown>;
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
    // glossaire partagé (cf. build.ts) → on cible ce sous-objet.
    file: 'glossaries.json',
    build: () => Object.fromEntries(buildEffectGlossary().effects),
    select: (raw) => (raw.effects as Record<string, unknown>) ?? {},
  },
  equipTarget('ee', 'EE', 'ee'),
  equipTarget('weapon', 'Armes', 'weapon'),
  equipTarget('amulet', 'Amulettes', 'accessory'),
  equipTarget('armor', 'Armures', 'armor'),
  equipTarget('talisman', 'Talismans', 'talisman'),
  equipTarget('set', 'Sets', 'sets'),
];

export function getTarget(id: string): GeneratedTarget | undefined {
  return TARGETS.find((t) => t.id === id);
}
