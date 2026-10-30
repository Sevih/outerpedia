/**
 * Filtre du pool du Tier List Maker, sur des items fabriqués : la recherche
 * passe par le texte cherchable (titre, nom court, base d'un costume), accents
 * et casse repliés ; les autres filtres ne bougent pas.
 */
import { describe, expect, it } from 'vitest';
import { normalizeSearchText } from '@/lib/search-text';
import type { TierItem } from './contracts';
import { buildSearchText, poolFilter, type PoolFilterOptions } from './pool-filter';

const ITEMS: TierItem[] = [
  {
    key: 'c1',
    label: 'Luna',
    img: '',
    search: buildSearchText('Luna', undefined, 'Luna'),
  },
  {
    key: 'c2',
    label: 'Luna',
    short: 'D.Luna',
    prefix: 'Demiurge',
    img: '',
    search: buildSearchText('Demiurge Luna', 'D.Luna', 'Luna'),
  },
  {
    key: 'c3',
    label: 'Round-the-Clock Tourist Luna',
    img: '',
    isSkin: true,
    baseLabel: 'Luna',
    baseShort: 'D.Luna',
    search: buildSearchText('Round-the-Clock Tourist Luna', undefined, 'Demiurge Luna', 'D.Luna'),
  },
  {
    key: 'c4',
    label: 'Stella',
    short: 'D.Stella',
    prefix: 'Demiurge',
    img: '',
    search: buildSearchText('Demiurge Stella', 'D.Stella', 'Stella'),
  },
  {
    key: 'c5',
    label: 'Epsilon',
    short: 'CF Epsilon',
    prefix: 'Core Fusion',
    img: '',
    isFusion: true,
    search: buildSearchText('Core Fusion Epsilon', 'CF Epsilon', 'Epsilon'),
  },
  {
    key: 'c6',
    label: 'Iota',
    short: 'M.Iota',
    prefix: 'Monad',
    img: '',
    search: buildSearchText('Monad Iota', 'M.Iota', 'Iota'),
  },
];

const NONE: PoolFilterOptions = {
  q: '',
  placed: new Set(),
  skinsOnly: false,
  showSkins: true,
  elementFilter: [],
  classFilter: [],
  rarityFilter: [],
  tagFilter: [],
};

/** Clés trouvées pour une SAISIE brute, normalisée comme `use-pool.ts`. */
function find(query: string, opts: Partial<PoolFilterOptions> = {}): string[] {
  const q = normalizeSearchText(query.trim());
  return poolFilter(ITEMS, { ...NONE, ...opts, q }).map((it) => it.key);
}

describe('buildSearchText', () => {
  it('normalise, réduit les espaces et saute un nom déjà contenu', () => {
    expect(buildSearchText('Demiurge  Luna', 'D.Luna', 'Luna', undefined)).toBe(
      'demiurge luna d.luna',
    );
    expect(buildSearchText('Démiurge', 'DÉMIURGE')).toBe('demiurge');
  });

  it("garde le nom complet de la base d'un costume d'un seul tenant", () => {
    const s = buildSearchText('Round-the-Clock Tourist Luna', 'Demiurge Luna', 'D.Luna');
    expect(s).toContain('demiurge luna');
  });
});

describe('poolFilter — recherche', () => {
  it('« demi » rend les Demiurge et leurs costumes, rien d’autre', () => {
    expect(find('demi')).toEqual(['c2', 'c3', 'c4']);
    expect(find('demi', { showSkins: false })).toEqual(['c2', 'c4']);
  });

  it('accents et casse repliés', () => {
    expect(find('Démiurge')).toEqual(find('demi'));
    expect(find('DEMI')).toEqual(find('demi'));
  });

  it('titres : Monad, Core Fusion', () => {
    expect(find('monad')).toEqual(['c6']);
    expect(find('core fusion')).toEqual(['c5']);
  });

  it('nom court et nom nu', () => {
    expect(find('d.luna')).toEqual(['c2', 'c3']);
    expect(find('luna')).toEqual(['c1', 'c2', 'c3']);
  });

  it('un costume se trouve par le nom complet de sa base', () => {
    expect(find('demiurge luna')).toEqual(['c2', 'c3']);
  });

  it('une saisie vide ne filtre rien', () => {
    expect(find('')).toEqual(ITEMS.map((it) => it.key));
    expect(find('   ')).toEqual(ITEMS.map((it) => it.key));
  });
});

describe('poolFilter — autres filtres inchangés', () => {
  it('un item rangé sort du pool', () => {
    expect(find('luna', { placed: new Set(['c2']) })).toEqual(['c1', 'c3']);
  });

  it('« skins seulement » ne garde que les costumes, même skins masqués', () => {
    expect(find('', { skinsOnly: true, showSkins: false })).toEqual(['c3']);
    expect(find('', { showSkins: false })).not.toContain('c3');
  });
});
