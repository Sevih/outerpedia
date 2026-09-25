import { describe, expect, it } from 'vitest';
import { CLASS_ORDER, ELEMENT_ORDER, inOrder } from '@/lib/images';

describe('inOrder — univers des pastilles de filtre', () => {
  it('range les classes dans l’ordre du jeu, pas l’alphabet', () => {
    expect(inOrder(['healer', 'mage', 'striker', 'defender', 'ranger'], CLASS_ORDER)).toEqual([
      ...CLASS_ORDER,
    ]);
  });

  it('dédoublonne et ne garde que les valeurs présentes', () => {
    expect(inOrder(['dark', 'fire', 'dark', 'water'], ELEMENT_ORDER)).toEqual([
      'fire',
      'water',
      'dark',
    ]);
  });

  it('rejette l’inconnu en fin, alphabétique', () => {
    expect(inOrder(['zeta', 'mage', 'alpha', 'defender'], CLASS_ORDER)).toEqual([
      'defender',
      'mage',
      'alpha',
      'zeta',
    ]);
  });
});
