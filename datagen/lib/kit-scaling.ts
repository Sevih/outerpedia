/**
 * Primitive #kit-scaling — QUELLES STATS PILOTENT LES DÉGÂTS du kit d'un perso.
 *
 * UNE règle, deux consommateurs : `generators/damage-scaling.ts` (les champs de
 * saisie du damage calculator) et `generators/solver.ts` (`dmgStat`/`dmgSec` de
 * gear-solver). Ils portaient chacun la leur et divergeaient sur quatre persos
 * (audit G11) ; la règle ci-dessous est celle que les tables confirment, perso
 * par perso (docs/DONE.md, 2026-10-03).
 *
 * Deux faits du binaire (docs/specs/damage-formula.md) :
 *   - `BT_SWAP_STAT_ATTACK` (§ 10.1) : une autre stat remplace l'ATK ;
 *   - `BT_DMG_OWNER_STAT` (§ 9.1) : bonus de dégâts = stat de l'attaquant ×
 *     Value ‰ (cap 100 %).
 *
 * Ce qui compte :
 *   - les colonnes du kit PRINCIPAL — S1/S2/S3, Skill_8 (transcendance : le
 *     eff-scaling de Nella vit dans les buffs partagés `trancendent_8_owner_*`),
 *     Skill_22 (passif de classe : les swaps de Domine/Skadi/Anarky) et
 *     Skill_23 (core : Epsilon). PAS les skills de SOUTIEN (Skill_9/10) : leurs
 *     buffs propres portent `CallerSkillType = SKT_BACKUP_*`, ils ne pèsent que
 *     sur l'attaque de soutien, qu'aucun des deux consommateurs ne calcule
 *     (Leo `_backup_1_1` DEF, Sterope HP, Tamara SPD). Les bursts
 *     (Skill_19..21) ne portent que des buffs déjà vus en S1/S2/S3 ;
 *   - les buffs que le perso se pose à LUI-MÊME (`TargetType = ME`). Le seul
 *     autre cas du roster est un compteur, pas une stat : Kuro `2000079_2_8`
 *     (MY_TEAM) lit `ST_GET_GOLD_RATE`, que `2000079_2_9` incrémente par stack
 *     — le « +10 % de dégâts, 3 stacks max » de sa description ;
 *   - les groupes `BT_GROUP` sont expansés : leurs enfants sont les buffs
 *     réellement posés (aucun cas sur le roster à ce jour).
 *
 * Sortie en enums moteur BRUTS (`ST_*`) : chaque consommateur projette dans
 * son vocabulaire (slugs du wiki, clés de gear-solver).
 */
import { expandBuffIds, loadBuffGroups, loadBuffIndex, type BuffGroup } from './buff';
import { groupBy, loadTable, splitCsv, type Row } from './tables';

/** Colonnes `CharacterTemplet` du kit principal (cf. en-tête). */
export const KIT_SCALING_SKILL_COLS = [
  'Skill_1',
  'Skill_2',
  'Skill_3',
  'Skill_8',
  'Skill_22',
  'Skill_23',
];

/** Index des tables que la règle lit — chargés une fois par générateur. */
export interface KitScalingTables {
  /** `CharacterSkillLevelTemplet` par `SkillID`. */
  levelsBySkill: Map<string, Row[]>;
  /** `BuffTemplet` par `BuffID` (une ligne par niveau). */
  buffs: Map<string, Row[]>;
  groups: Map<string, BuffGroup>;
}

export function loadKitScalingTables(): KitScalingTables {
  return {
    levelsBySkill: groupBy(loadTable('CharacterSkillLevelTemplet'), 'SkillID'),
    buffs: loadBuffIndex(),
    groups: loadBuffGroups(),
  };
}

export interface KitScaling {
  /** `ST_*` qui remplace l'ATK dans CalcDamage (absent = ATK). */
  attackStat?: string;
  /** Stats converties en bonus de dégâts : `ratio` = Value/1000, max par stat. */
  bonus: { stat: string; ratio: number }[];
}

/** Faits de scaling du kit principal d'UNE ligne `CharacterTemplet`. */
export function kitScaling(c: Row, tables: KitScalingTables): KitScaling {
  const { levelsBySkill, buffs, groups } = tables;
  let attackStat: string | undefined;
  const ratios = new Map<string, number>();

  for (const col of KIT_SCALING_SKILL_COLS) {
    const sid = c[col];
    if (!sid) continue;
    const seen = new Set<string>();
    for (const lvl of levelsBySkill.get(sid) ?? []) {
      for (const { id } of expandBuffIds(splitCsv(lvl.BuffID), buffs, groups, 1)) {
        if (seen.has(id)) continue;
        seen.add(id);
        // Tous les niveaux du buff : le type et la stat n'en dépendent pas,
        // la magnitude si (on garde la plus haute).
        for (const b of buffs.get(id) ?? []) {
          if (b.TargetType !== 'ME' || !b.StatType || b.StatType === 'ST_NONE') continue;
          if (b.Type === 'BT_SWAP_STAT_ATTACK') attackStat = b.StatType;
          else if (b.Type === 'BT_DMG_OWNER_STAT') {
            const ratio = Number(b.Value) / 1000;
            if (ratio > 0) ratios.set(b.StatType, Math.max(ratios.get(b.StatType) ?? 0, ratio));
          }
        }
      }
    }
  }

  return {
    ...(attackStat ? { attackStat } : {}),
    bonus: [...ratios].map(([stat, ratio]) => ({ stat, ratio })),
  };
}
