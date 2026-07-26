/**
 * Tests des prédicats purs de la spec monstre (audit X1).
 *
 *   - `monsterType` : la catégorie de contenu depuis l'enum `CT_*` — le front
 *     filtre dessus (monster/boss/area_boss/named/season_boss) ;
 *   - `boolCol` : booléen TRI-ÉTAT (colonne absente ≠ faux) — la spec émet
 *     `pushBack`/`pushUp` UNIQUEMENT si la colonne existe.
 */
import { describe, expect, it } from 'vitest';
import { boolCol, monsterType } from './monster';

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
