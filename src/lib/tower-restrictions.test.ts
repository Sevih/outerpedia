import { describe, expect, it } from 'vitest';
import { restrictionState, type RestrictionRule } from '@/lib/tower-restrictions';

const ban = (type: string, subType: string): RestrictionRule => ({ type, subType, count: -1 });
const quota = (type: string, subType: string): RestrictionRule => ({ type, subType, count: 2 });

describe('restrictionState', () => {
  it('exclut un perso qui tombe sous un BAN (count < 0) de son élément', () => {
    expect(restrictionState({ element: 'fire' }, [ban('element', 'fire')])).toBe('excluded');
  });

  it('met en avant (match) un perso qui remplit un QUOTA (count > 0)', () => {
    expect(restrictionState({ element: 'water' }, [quota('element', 'water')])).toBe('match');
  });

  it('le BAN prime sur le QUOTA quand les deux ciblent le perso', () => {
    const rules = [quota('element', 'fire'), ban('element', 'fire')];
    expect(restrictionState({ element: 'fire' }, rules)).toBe('excluded');
  });

  it('mappe les alias de classe de l’UI du jeu (attacker→striker, priest→healer)', () => {
    expect(restrictionState({ class: 'striker' }, [ban('class', 'attacker')])).toBe('excluded');
    expect(restrictionState({ class: 'healer' }, [quota('class', 'priest')])).toBe('match');
  });

  it('compare la rareté au subType numérique pour les restrictions `star`', () => {
    expect(restrictionState({ rarity: 3 }, [quota('star', '3')])).toBe('match');
    expect(restrictionState({ rarity: 2 }, [quota('star', '3')])).toBe('neutral');
  });

  it('rend `neutral` quand aucune règle ne cible le perso', () => {
    expect(restrictionState({ element: 'earth' }, [ban('element', 'fire')])).toBe('neutral');
  });
});
