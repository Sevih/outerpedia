/**
 * Couche CURÉE — recommandations d'équipement (gear reco).
 *
 * Format V3, refonte de l'ancien reco V2 (écrit main, référencé par noms EN) :
 *   - les équipements sont référencés par ID V3 (`data/generated/equipment/*`),
 *     plus de correspondance par nom d'affichage fragile ;
 *   - les presets partagés vivent dans `data/curated/gear-presets.json` et se
 *     référencent par `$slug` (talismans, combos de sets, priorités de substats) ;
 *   - les stats s'écrivent en abréviations canoniques (src/lib/stats.ts) ;
 *   - la note est localisée et passe par parse-text.
 * Fichier : `data/curated/gear-reco.json`, clé = id de personnage.
 */
import { validate, type Schema } from '../extractor/core/validate';
import type { LocalizedText } from './character';

/** Un équipement recommandé : id V3 + main stat conseillée (« ATK% », « PEN%/CHD »). */
export interface GearPick {
  id: string;
  mainStat?: string;
}

/** Une pièce d'un combo de sets (id de set V3 + nombre de pièces). */
export interface SetComboPiece {
  set: string;
  count: number;
}

/** Un combo de sets : soit un preset (`$…` sans le `$`), soit des pièces inline. */
export interface SetCombo {
  preset?: string;
  pieces?: SetComboPiece[];
}

/** Un build recommandé pour un personnage. */
export interface GearBuild {
  /** Libellé du build (« Speed », « PvP »…), affiché tel quel. */
  name: string;
  weapons?: GearPick[];
  amulets?: GearPick[];
  /** Ids de talismans, ou référence de preset (`$CPdps`). */
  talismans?: string[];
  sets?: SetCombo[];
  /** Priorité de substats (« ATK>CHC=CHD>SPD ») ou preset (`$dps`). */
  substats?: string;
  note?: LocalizedText;
}

/** Presets partagés entre tous les personnages (référencés par `$slug`). */
export interface GearPresets {
  talismans: Record<string, string[]>;
  sets: Record<string, SetComboPiece[]>;
  substats: Record<string, string>;
}

const gearPickSchema: Schema = {
  kind: 'object',
  fields: {
    id: { kind: 'string' },
    mainStat: { kind: 'string', optional: true },
  },
};

const setComboSchema: Schema = {
  kind: 'object',
  fields: {
    preset: { kind: 'string', optional: true },
    pieces: {
      kind: 'array',
      optional: true,
      of: {
        kind: 'object',
        fields: {
          set: { kind: 'string' },
          count: { kind: 'number', int: true, min: 2 },
        },
      },
    },
  },
};

export const gearBuildSchema: Schema = {
  kind: 'object',
  fields: {
    name: { kind: 'string' },
    weapons: { kind: 'array', of: gearPickSchema, optional: true },
    amulets: { kind: 'array', of: gearPickSchema, optional: true },
    talismans: { kind: 'array', of: { kind: 'string' }, optional: true },
    sets: { kind: 'array', of: setComboSchema, optional: true },
    substats: { kind: 'string', optional: true },
    note: { kind: 'record', of: { kind: 'string' }, optional: true },
  },
};

export const gearPresetsSchema: Schema = {
  kind: 'object',
  fields: {
    talismans: { kind: 'record', of: { kind: 'array', of: { kind: 'string' } } },
    sets: {
      kind: 'record',
      of: {
        kind: 'array',
        of: {
          kind: 'object',
          fields: {
            set: { kind: 'string' },
            count: { kind: 'number', int: true, min: 2 },
          },
        },
      },
    },
    substats: { kind: 'record', of: { kind: 'string' } },
  },
};

/** Valide la liste de builds d'un perso ; renvoie les écarts (vide = OK). */
export function validateGearBuilds(id: string, builds: GearBuild[]): string[] {
  return validate(builds, { kind: 'array', of: gearBuildSchema }, `gearReco[${id}]`).map(
    (i) => `${i.path} — ${i.message}`,
  );
}

/** Valide le fichier de presets ; renvoie les écarts (vide = OK). */
export function validateGearPresets(p: GearPresets): string[] {
  return validate(p, gearPresetsSchema, 'gearPresets').map((i) => `${i.path} — ${i.message}`);
}
