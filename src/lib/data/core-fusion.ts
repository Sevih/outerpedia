/**
 * Accès lecture au domaine CORE FUSION — tout dérive des fiches persos
 * (CharacterFusionTemplet/CharacterFusionLevelTemplet extraits par la spec) :
 * paires base ↔ fusion, paliers/coûts, renommages de skills. La V2 tenait tout
 * ça à la main (LEVEL_COSTS en dur, mapping par `replace('2700','2000')`,
 * cf-skill-names.json généré à part) — vérifié : la dérivation reproduit ses
 * 24 renommages à l'identique.
 */
import skillsData from '@data/generated/skills.json';
import type { Character, FusionInfo, LangDict, SkillsFile } from '@contracts';
import { getAllCharacters, getCharacter } from '@/lib/data/characters';

const SKILLS = skillsData as unknown as SkillsFile;

export interface CoreFusionPair {
  base: Character;
  fusion: Character;
  info: FusionInfo;
}

/** Toutes les paires base ↔ core-fusion du jeu (une base absente = bug d'extraction). */
export function getCoreFusionPairs(): CoreFusionPair[] {
  return getAllCharacters()
    .filter((c) => c.fusion && c.originalCharacter)
    .map((fusion) => {
      const base = getCharacter(fusion.originalCharacter as string);
      if (!base) {
        throw new Error(
          `core-fusion : base « ${fusion.originalCharacter} » inconnue (${fusion.id})`,
        );
      }
      return { base, fusion, info: fusion.fusion as FusionInfo };
    });
}

/** Coûts cumulés par palier (Lv1 = déblocage) — dérivés des lignes de la table. */
export function fusionCumulativeCosts(info: FusionInfo): { level: number; total: number }[] {
  let total = 0;
  return [...info.levels]
    .sort((a, b) => a.level - b.level)
    .map((l) => {
      total += l.cost;
      return { level: l.level, total };
    });
}

/** Slots comparés base ↔ fusion. Le chain passive garde son nom générique
 *  (« Chain Passive » des deux côtés) : jamais de renommage en pratique. */
const RENAME_SLOTS = [
  { slot: 'S1', type: 'first' },
  { slot: 'S2', type: 'second' },
  { slot: 'S3', type: 'ultimate' },
  { slot: 'Chain / Dual', type: 'chain_passive' },
] as const;

export interface FusionSkillRename {
  slot: string;
  /** Clé stable pour rattacher l'éditorial (s1/s2/s3/chain). */
  key: 's1' | 's2' | 's3' | 'chain';
  from: LangDict;
  to: LangDict;
}

const KEY_OF_TYPE = {
  first: 's1',
  second: 's2',
  ultimate: 's3',
  chain_passive: 'chain',
} as const;

/** Renommages de skills à la fusion (nom EN différent = renommé). */
export function fusionSkillRenames(pair: CoreFusionPair): FusionSkillRename[] {
  const named = (c: Character, type: string) => {
    const id = c.skills.find((s) => SKILLS[s]?.type === type);
    return id ? SKILLS[id].name : undefined;
  };
  const out: FusionSkillRename[] = [];
  for (const { slot, type } of RENAME_SLOTS) {
    const from = named(pair.base, type);
    const to = named(pair.fusion, type);
    if (from && to && from.en !== to.en) {
      out.push({ slot, key: KEY_OF_TYPE[type], from, to });
    }
  }
  return out;
}
