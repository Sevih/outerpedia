/**
 * Couche CURÉE — éditorial ÉQUIPEMENT (`data/curated/equipment.json`).
 *
 * Ce que le jeu ne dit pas et que le wiki sait :
 *   - la SOURCE d'obtention d'un item (boss qui le drop, boutique d'événement…)
 *     — les loot tables ne sont PAS dans les données client, vérifié ;
 *   - les NOTES éditoriales des EE (rang au déblocage / au +10) — jugement humain.
 * (Le type AP/CP des talismans est EXTRAIT — buff BT_AP/CP_CHARGE du passif.)
 *
 * Clés par section :
 *   - weapons / amulets / talismans : id CANONIQUE de la famille d'items
 *     (plus petit id numérique du groupe de même nom — stable à l'ajout de
 *     variantes de drop) ;
 *   - sets : id de groupe de set (`data/generated/equipment/sets.json`) ;
 *   - ee : id de PERSONNAGE (l'EE est 1:1 avec son porteur).
 *
 * Les boss sont référencés par id `MonsterTemplet` : le build les résout en
 * `equipment/bosses.json` (nom localisé + icône ATB) — zéro texte écrit main.
 */
import { readCuratedJson } from '../lib/json';
import { validate, type Schema } from '../extractor/core/validate';

/** Source d'obtention d'un item (boss droppant et/ou libellé hors combat). */
export interface EquipmentSource {
  /** Ids de boss (`MonsterTemplet`) droppant l'item. */
  bosses?: string[];
  /** Libellé hors boss (« Event Shop », « Adventure License »…). */
  label?: string;
}

/** Éditorial d'une famille d'items (tous champs optionnels). */
export interface EquipmentCuratedEntry {
  source?: EquipmentSource;
  /** EE : rang éditorial au déblocage (S+, S, A, B, C…). */
  rank?: string;
  /** EE : rang éditorial au +10. */
  rank10?: string;
}

/** Fichier complet, sectionné par table (pas de collision d'ids possible). */
export interface EquipmentCurated {
  weapons: Record<string, EquipmentCuratedEntry>;
  amulets: Record<string, EquipmentCuratedEntry>;
  talismans: Record<string, EquipmentCuratedEntry>;
  sets: Record<string, EquipmentCuratedEntry>;
  ee: Record<string, EquipmentCuratedEntry>;
}

export const EMPTY_EQUIPMENT_CURATED: EquipmentCurated = {
  weapons: {},
  amulets: {},
  talismans: {},
  sets: {},
  ee: {},
};

const entrySchema: Schema = {
  kind: 'object',
  fields: {
    source: {
      kind: 'object',
      optional: true,
      fields: {
        bosses: { kind: 'array', of: { kind: 'string' }, optional: true },
        label: { kind: 'string', optional: true },
      },
    },
    rank: { kind: 'string', optional: true },
    rank10: { kind: 'string', optional: true },
  },
};

const fileSchema: Schema = {
  kind: 'object',
  fields: {
    weapons: { kind: 'record', of: entrySchema },
    amulets: { kind: 'record', of: entrySchema },
    talismans: { kind: 'record', of: entrySchema },
    sets: { kind: 'record', of: entrySchema },
    ee: { kind: 'record', of: entrySchema },
  },
};

/** Valide le fichier curé ; renvoie les écarts (vide = OK). */
export function validateEquipmentCurated(c: EquipmentCurated): string[] {
  return validate(c, fileSchema, 'equipmentCurated').map((i) => `${i.path} — ${i.message}`);
}

/** Charge le fichier curé (absent = tout vide ; JSON cassé = throw nommé). */
export function loadEquipmentCurated(): EquipmentCurated {
  return {
    ...EMPTY_EQUIPMENT_CURATED,
    ...(readCuratedJson<EquipmentCurated>('data/curated/equipment.json') ?? {}),
  };
}

/** Tous les ids de boss référencés par les sources curées. */
export function curatedBossIds(c: EquipmentCurated): string[] {
  const ids = new Set<string>();
  for (const section of Object.values(c)) {
    for (const entry of Object.values(section) as EquipmentCuratedEntry[]) {
      for (const b of entry.source?.bosses ?? []) ids.add(b);
    }
  }
  return [...ids].sort();
}
