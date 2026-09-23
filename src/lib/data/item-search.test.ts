import { describe, expect, it } from 'vitest';
import { catalogOptions } from '@/lib/data/item-catalog';
import { rankItemMatches } from '@/lib/data/item-search';

/**
 * Le défaut que ces tests ferment n'a AUCUN symptôme visible : la liste se
 * remplit, elle est simplement amputée de la seule entrée cherchée. Sur la
 * donnée committée, 21 entrées contiennent « gold » et la monnaie `Gold` est la
 * DERNIÈRE dans l'ordre du catalogue — hors du plafond de 20. Le picker de
 * l'admin l'avait corrigé pour lui seul ; l'outil `quick`, qui refiltrait de son
 * côté, a reproduit le même trou sur le même item.
 */
describe('rankItemMatches', () => {
  const options = catalogOptions();

  it('sert la correspondance EXACTE en tête, sous le plafond', () => {
    // Sans classement, `Gold` est 21ᵉ des 21 entrées contenant « gold ».
    expect(rankItemMatches(options, 'gold')[0]?.name).toBe('Gold');
    expect(rankItemMatches(options, 'Gold')[0]?.name).toBe('Gold');
    expect(rankItemMatches(options, 'stamina')[0]?.name).toBe('Stamina');
  });

  it('classe exact > commence par > contient, puis le nom le plus court', () => {
    const opts = [
      { name: 'Gold & Stamina Chest' },
      { name: 'Event Gold Chest' },
      { name: 'Gold Bar' },
      { name: 'Gold' },
    ];
    expect(rankItemMatches(opts, 'gold').map((o) => o.name)).toEqual([
      'Gold',
      'Gold Bar',
      'Gold & Stamina Chest',
      'Event Gold Chest',
    ]);
  });

  it('plafonne le nombre de résultats et rend vide sur une requête vide', () => {
    expect(rankItemMatches(options, 'chest', 5)).toHaveLength(5);
    expect(rankItemMatches(options, '   ')).toEqual([]);
  });
});
