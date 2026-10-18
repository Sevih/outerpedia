/**
 * Tests des prédicats purs de la spec monstre (audit X1).
 *
 *   - `monsterType` : la catégorie de contenu depuis l'enum `CT_*` — le front
 *     filtre dessus (monster/boss/area_boss/named/season_boss) ;
 *   - `boolCol` : booléen TRI-ÉTAT (colonne absente ≠ faux) — la spec émet
 *     `pushBack`/`pushUp` UNIQUEMENT si la colonne existe ;
 *   - `statPremiumOf` : les passifs de fiche, règle de
 *     `CSkillManager.GetStatPremiumBuffList` sur des lignes synthétiques.
 */
import { describe, expect, it } from 'vitest';
import type { Row } from '../../lib/tables';
import { boolCol, monsterType, statPremiumOf } from './monster';

describe('monsterType', () => {
  it('mob de base : CT_MONSTER → monster', () => {
    expect(monsterType('CT_MONSTER')).toBe('monster');
  });

  it('retire le suffixe _monster des catégories', () => {
    expect(monsterType('CT_BOSS_MONSTER')).toBe('boss');
    expect(monsterType('CT_AREA_BOSS_MONSTER')).toBe('area_boss');
    expect(monsterType('CT_NAMED_MONSTER')).toBe('named');
    expect(monsterType('CT_SEASON_BOSS_MONSTER')).toBe('season_boss');
  });

  it('valeur absente → chaîne vide (pas de crash)', () => {
    expect(monsterType(undefined)).toBe('');
  });
});

describe('boolCol — tri-état', () => {
  it('colonne ABSENTE → undefined (≠ faux)', () => {
    expect(boolCol(undefined)).toBeUndefined();
  });

  it('présente : parsing insensible à la casse via bool()', () => {
    expect(boolCol('True')).toBe(true);
    expect(boolCol('TRUE')).toBe(true);
    expect(boolCol('False')).toBe(false);
    expect(boolCol('')).toBe(false); // colonne présente mais vide = faux, PAS undefined
  });
});

describe('statPremiumOf — passifs de fiche (`GetStatPremiumBuffList`)', () => {
  const line = (o: Partial<Row>): Row => ({
    Level: '1',
    Type: 'BT_STAT_PREMIUM',
    BuffCreateType: 'PASSIVE',
    TargetType: 'ME',
    StatType: 'ST_DEF',
    ApplyingType: 'OAT_RATE',
    Value: '100',
    ...o,
  });
  const BUFFS: Record<string, Row[]> = {
    def: [line({ Value: '10000' })],
    res: [line({ StatType: 'ST_BUFF_RESIST', Value: '-900' })],
    def2: [line({ Value: '300' })],
    crit: [
      line({ StatType: 'ST_CRITICAL_RATE', ApplyingType: 'OAT_ADD', Value: '150' }),
      line({ Level: '3', StatType: 'ST_CRITICAL_RATE', ApplyingType: 'OAT_ADD', Value: '200' }),
    ],
    passive2: [line({ BuffCreateType: 'PASSIVE2' })],
    enemy: [line({ TargetType: 'ENEMY_TEAM' })],
    stat: [line({ Type: 'BT_STAT' })],
    teamCond: [line({ TargetType: 'MY_TEAM', BuffConditionType: 'OWNER_RAGE' })],
    team: [line({ TargetType: 'MY_TEAM', StatType: 'ST_HP', Value: '1000' })],
    meCond: [line({ StatType: 'ST_ATK', BuffConditionType: 'OWNER_RAGE' })],
    unknown: [line({ StatType: 'ST_HIT_AP' })],
  };
  const SKILLS: Record<string, string[]> = {
    a: ['def', 'res', 'passive2', 'enemy', 'stat'],
    b: ['def2', 'crit', 'teamCond', 'team', 'meCond'],
    bad: ['unknown'],
  };
  const of = (skills: string[]) =>
    statPremiumOf(
      skills,
      (id) => SKILLS[id],
      (id) => BUFFS[id],
    );

  it('somme par stat les taux et les plats des lignes PASSIVE sur ME / MY_TEAM, au niveau 1', () => {
    expect(of(['a', 'b'])).toEqual({
      def: { rate: 10300 },
      buff_resist: { rate: -900 },
      critical_rate: { flat: 150 },
      hp: { rate: 1000 },
      // Une ligne `ME` conditionnelle : `SetBuffPremiumValue` ne lit pas la condition.
      atk: { rate: 100 },
    });
  });

  it('PASSIVE2, ENEMY*, BT_STAT et MY_TEAM conditionnelle : hors du champ', () => {
    expect(of(['a'])).toEqual({ def: { rate: 10000 }, buff_resist: { rate: -900 } });
  });

  it('aucun passif → undefined ; une stat sans colonne jette', () => {
    expect(of([])).toBeUndefined();
    expect(() => of(['bad'])).toThrow(/ST_HIT_AP/);
  });
});
