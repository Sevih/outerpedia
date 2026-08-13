/**
 * Le geste « monter / descendre » d'une liste éditable.
 *
 * Ce qui casse dans une copie maison, ce n'est jamais l'échange du milieu :
 * c'est la PREMIÈRE ligne qu'on monte et la DERNIÈRE qu'on descend. Sans garde,
 * l'échange avec un indice hors bornes fabrique un `undefined` dans la liste —
 * et l'éditeur l'enregistre.
 */
import { describe, expect, it } from 'vitest';
import { moveItem } from './reorder';

const L = ['a', 'b', 'c'];

describe('moveItem', () => {
  it('échange avec le voisin du dessus', () => {
    expect(moveItem(L, 1, -1)).toEqual(['b', 'a', 'c']);
  });

  it('échange avec le voisin du dessous', () => {
    expect(moveItem(L, 1, 1)).toEqual(['a', 'c', 'b']);
  });

  it('la PREMIÈRE ligne ne peut pas monter', () => {
    expect(moveItem(L, 0, -1)).toEqual(L);
  });

  it('la DERNIÈRE ligne ne peut pas descendre', () => {
    expect(moveItem(L, 2, 1)).toEqual(L);
  });

  it('un mouvement bloqué rend la liste D’ORIGINE, à l’identité près', () => {
    // Ce n'est pas un détail de style : c'est ce qui permet à l'appelant de faire
    // `setState(moveItem(...))` sans condition, sans provoquer de re-rendu.
    expect(moveItem(L, 0, -1)).toBe(L);
  });

  it('ne perd ni ne duplique rien — le cas que la garde protège', () => {
    // La panne d'une copie sans garde : `[next[0], next[-1]] = [next[-1], next[0]]`
    // laisse un `undefined` en tête et ajoute une clé `-1`.
    for (const [from, dir] of [
      [0, -1],
      [2, 1],
      [1, -1],
      [1, 1],
    ] as const) {
      const out = moveItem(L, from, dir);
      expect([...out].sort()).toEqual(['a', 'b', 'c']);
    }
  });

  it('une liste vide ou un index hors liste ne lèvent pas', () => {
    expect(moveItem([], 0, 1)).toEqual([]);
    expect(moveItem(L, 9, -1)).toEqual(L);
  });
});
