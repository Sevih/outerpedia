/**
 * Prédicat de la grille de `/characters` (A86 : sous-classe ; B70 : stat de
 * base des dégâts). OU entre les valeurs cochées d'une facette, ET avec la
 * classe et les autres facettes.
 */
import { describe, expect, it } from 'vitest';
import type { CharacterRow } from '../CharactersBrowser';
import type { FilterState } from './filter-codec';
import { filterCharacterRows } from './filter-rows';

const EMPTY: FilterState = {
  q: '',
  element: [],
  klass: [],
  subClass: [],
  rarity: [],
  chain: [],
  gift: [],
  role: [],
  tags: [],
  tagLogic: 'OR',
  buffs: [],
  debuffs: [],
  effectLogic: 'OR',
  sources: [],
  showUnique: false,
  teamBonuses: [],
  scaling: [],
};

const row = (
  id: string,
  klass: string,
  subClass: string | null,
  element = 'fire',
  scaling: CharacterRow['scaling'] = 'atk',
): CharacterRow => ({
  id,
  slug: id,
  name: id,
  searchNames: [id],
  element,
  class: klass,
  subClass,
  scaling,
  rarity: 3,
  isFusion: false,
  tags: [],
});

const ROWS = [
  row('a', 'striker', 'bruiser'),
  row('b', 'striker', 'attacker', 'water'),
  row('c', 'defender', 'bruiser', 'water'),
  row('d', 'mage', 'wizard'),
  row('e', 'striker', null),
];
const ids = (s: Partial<FilterState>) =>
  filterCharacterRows(ROWS, { ...EMPTY, ...s }, {}).map((r) => r.id);

describe('filterCharacterRows — sous-classe', () => {
  it('sans filtre : tout passe, persos sans sous-classe compris', () => {
    expect(ids({})).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('OU entre les sous-classes cochées', () => {
    expect(ids({ subClass: ['bruiser'] })).toEqual(['a', 'c']);
    expect(ids({ subClass: ['bruiser', 'wizard'] })).toEqual(['a', 'c', 'd']);
  });

  it('ET avec la classe : Striker + Bruiser', () => {
    expect(ids({ klass: ['striker'], subClass: ['bruiser'] })).toEqual(['a']);
  });

  it('ET avec les autres facettes (élément)', () => {
    expect(ids({ subClass: ['bruiser'], element: ['water'] })).toEqual(['c']);
  });

  it('un perso sans sous-classe n’est jamais retenu quand le filtre est actif', () => {
    expect(ids({ klass: ['striker'], subClass: ['bruiser', 'attacker'] })).toEqual(['a', 'b']);
  });
});

describe('filterCharacterRows — damage scaling (B70)', () => {
  const SC_ROWS = [
    row('atk1', 'striker', null),
    row('hp1', 'defender', null, 'fire', 'hp'),
    row('def1', 'defender', null, 'water', 'def'),
    row('atk2', 'mage', null, 'water'),
  ];
  const scIds = (s: Partial<FilterState>) =>
    filterCharacterRows(SC_ROWS, { ...EMPTY, ...s }, {}).map((r) => r.id);

  it('vide : tout passe', () => {
    expect(scIds({})).toEqual(['atk1', 'hp1', 'def1', 'atk2']);
  });

  it('ATK seul : le cas général', () => {
    expect(scIds({ scaling: ['atk'] })).toEqual(['atk1', 'atk2']);
  });

  it('HP + DEF : OU entre les stats cochées', () => {
    expect(scIds({ scaling: ['hp', 'def'] })).toEqual(['hp1', 'def1']);
  });

  it('ET avec les autres facettes (élément)', () => {
    expect(scIds({ scaling: ['hp', 'def'], element: ['water'] })).toEqual(['def1']);
  });
});
