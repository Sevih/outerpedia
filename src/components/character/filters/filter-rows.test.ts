/**
 * Prédicat de la grille de `/characters` (A86 : sous-classe). OU entre les
 * sous-classes cochées, ET avec la classe et les autres facettes.
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
};

const row = (
  id: string,
  klass: string,
  subClass: string | null,
  element = 'fire',
): CharacterRow => ({
  id,
  slug: id,
  name: id,
  searchNames: [id],
  element,
  class: klass,
  subClass,
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
