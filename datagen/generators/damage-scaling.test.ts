/**
 * Invariants du générateur damage-scaling sur `data/generated/damage-scaling.json`
 * committé (modèle quirks/progression) : le fichier dérive silencieusement des
 * kits (skill → buff → classification) — une jointure cassée produirait un
 * fichier vide ou des slugs invalides sans autre symptôme, et le damage
 * calculator masquerait des champs de saisie NÉCESSAIRES.
 *
 * Plus la règle elle-même (`damageScalingOf`) sur des tables synthétiques.
 *
 * Tourne SANS `.gamedata` (rien n'appelle buildDamageScaling).
 */
import { describe, expect, it } from 'vitest';
import scalingData from '../../data/generated/damage-scaling.json';
import type { KitScalingTables } from '../lib/kit-scaling';
import type { Row } from '../lib/tables';
import { damageScalingOf, type DamageScalingFile } from './damage-scaling';

const scaling = scalingData as unknown as DamageScalingFile;
const entries = Object.entries(scaling);

describe('damage-scaling.json — forme', () => {
  it('chaque entrée porte au moins un fait, aucun champ vide', () => {
    const bad: string[] = [];
    for (const [id, s] of entries) {
      if (!s.attackStat && !s.bonusStats && !s.lostHpDmg && !s.dot) bad.push(`${id} : vide`);
      if (s.bonusStats && s.bonusStats.length === 0) bad.push(`${id} : bonusStats []`);
    }
    expect(bad).toEqual([]);
  });

  it('slugs valides : attackStat ∈ {hp, def}, bonusStats triés/uniques/minuscule', () => {
    const bad: string[] = [];
    for (const [id, s] of entries) {
      // Le jeu ne swap que vers HP/DEF aujourd'hui — une autre stat doit être
      // REVUE (nouveau champ de saisie côté outil), pas absorbée en silence.
      if (s.attackStat && !['hp', 'def'].includes(s.attackStat))
        bad.push(`${id} : attackStat « ${s.attackStat} »`);
      for (const st of s.bonusStats ?? []) {
        if (!/^[a-z][a-z_]*$/.test(st) || st === 'none') bad.push(`${id} : bonusStat « ${st} »`);
      }
      const sorted = [...(s.bonusStats ?? [])].sort();
      if (JSON.stringify(sorted) !== JSON.stringify(s.bonusStats ?? []))
        bad.push(`${id} : bonusStats non triés`);
      if (new Set(s.bonusStats ?? []).size !== (s.bonusStats ?? []).length)
        bad.push(`${id} : bonusStats en double`);
    }
    expect(bad).toEqual([]);
  });
});

describe('damage-scaling.json — représentativité', () => {
  it('chaque mécanique est représentée (jointure kit → buff vivante)', () => {
    const vals = entries.map(([, s]) => s);
    expect(vals.some((s) => s.attackStat === 'hp')).toBe(true);
    expect(vals.some((s) => s.attackStat === 'def')).toBe(true);
    expect(vals.some((s) => (s.bonusStats ?? []).length > 0)).toBe(true);
    expect(vals.some((s) => s.lostHpDmg)).toBe(true);
    expect(vals.some((s) => s.dot)).toBe(true);
    // Ordre de grandeur : ~la moitié du roster porte un fait (67 au 26/07/2026).
    // Un effondrement (< 30) signale une jointure cassée, pas un patch.
    expect(entries.length).toBeGreaterThanOrEqual(30);
  });
});

describe('damageScalingOf — formes de combat', () => {
  // Demiurge Saeran 2000129 → 2000130 : la VIT et le DoT ne sont posés que par
  // le kit de la forme.
  const buffRows: Row[] = [
    {
      BuffID: 'f_spd',
      Level: '1',
      Type: 'BT_DMG_OWNER_STAT',
      TargetType: 'ME',
      StatType: 'ST_SPEED',
      Value: '2500',
    },
    { BuffID: 'f_dot', Level: '1', Type: 'BT_DOT_BURN', TargetType: 'ENEMY' },
  ];
  const kit: KitScalingTables = {
    levelsBySkill: new Map([
      ['13002', [{ SkillID: '13002', SkillLevel: '1', BuffID: 'f_spd' }]],
      ['13004', [{ SkillID: '13004', SkillLevel: '1', BuffID: 'f_dot' }]],
    ]),
    buffs: new Map(buffRows.map((b) => [b.BuffID, [b]])),
    groups: new Map(),
    formsByBase: new Map([['2000129', [{ ID: '2000130', Skill_2: '13002', Skill_4: '13004' }]]]),
  };

  it('une forme qui porte BT_DMG_OWNER_STAT (et un DoT) compte pour sa base', () => {
    expect(damageScalingOf({ ID: '2000129', Skill_1: '12901' }, kit)).toEqual({
      bonusStats: ['speed'],
      dot: true,
    });
  });

  it('sans forme déclarée, la ligne seule', () => {
    expect(damageScalingOf({ ID: '2000001', Skill_1: '12901' }, kit)).toEqual({});
  });

  it('donnée réelle : Demiurge Saeran (2000129) scale sur la VIT de sa forme', () => {
    expect(scaling['2000129']?.bonusStats).toContain('speed');
  });
});
