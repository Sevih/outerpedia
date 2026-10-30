/**
 * Pool personnages du Tier List Maker, sur la vraie donnée : les six formes
 * Core Fusion y entrent, chacune juste après son origine (et ses costumes),
 * avec le titre « Core Fusion » en préfixe — des héros, pas des costumes.
 */
import { describe, expect, it } from 'vitest';
import { characterNamePrefix, getCharacter } from '@/lib/data/characters';
import { normalizeSearchText } from '@/lib/search-text';
import { buildCharacterItems } from './character-items';
import { poolFilter } from './pool-filter';

const FUSIONS = ['2700003', '2700005', '2700037', '2700043', '2700056', '2700070'];

describe('buildCharacterItems', () => {
  const items = buildCharacterItems('en');
  const keys = items.map((it) => it.key);

  it.each(FUSIONS)('la forme fusion %s suit son origine, marquée isFusion', (id) => {
    const fusion = getCharacter(id)!;
    const origin = fusion.originalCharacter!;
    const at = keys.indexOf(`c${id}`);
    expect(at).toBeGreaterThan(keys.indexOf(`c${origin}`));
    // Rien entre l'origine et la fusion, sinon ses propres costumes.
    for (const it of items.slice(keys.indexOf(`c${origin}`) + 1, at)) expect(it.isSkin).toBe(true);

    const it = items[at];
    expect(it.isFusion).toBe(true);
    expect(it.isSkin).toBeFalsy();
    expect(it.prefix).toBe(characterNamePrefix(fusion, 'en'));
    expect(it.prefix).toBeTruthy();
    expect(it.label).toBe(fusion.name.en);
    expect(it.element).toBe(fusion.element);
    expect(it.cls).toBe(fusion.class);
    expect(it.rarity).toBe(fusion.rarity);
  });

  it('les fusions comptent parmi les personnages de base, pas parmi les skins', () => {
    const fusionKeys = items.filter((it) => it.isFusion).map((it) => it.key);
    expect(fusionKeys.sort()).toEqual(FUSIONS.map((id) => `c${id}`).sort());
    expect(items.filter((it) => it.isSkin && it.isFusion)).toEqual([]);
  });
});

describe('buildCharacterItems — recherche du pool (A85)', () => {
  const items = buildCharacterItems('en');
  const find = (query: string, showSkins = false) =>
    poolFilter(items, {
      q: normalizeSearchText(query.trim()),
      placed: new Set(),
      skinsOnly: false,
      showSkins,
      elementFilter: [],
      classFilter: [],
      rarityFilter: [],
      tagFilter: [],
    }).map((it) => it.key);
  const withPrefix = (prefix: string) =>
    items.filter((it) => it.prefix === prefix).map((it) => it.key);

  it('« demi » rend tous les Demiurge et aucun autre perso', () => {
    const demiurge = withPrefix('Demiurge');
    expect(demiurge.length).toBeGreaterThanOrEqual(4);
    expect(find('demi')).toEqual(demiurge);
    expect(find('Démiurge')).toEqual(demiurge);
    expect(find('DEMI')).toEqual(demiurge);
  });

  it.each(['Monad', 'Resonance', 'Core Fusion', 'Gnosis', 'Omega'])(
    '« %s » rend les siens',
    (prefix) => {
      const own = withPrefix(prefix);
      expect(own.length).toBeGreaterThan(0);
      expect(find(prefix.toLowerCase())).toEqual(expect.arrayContaining(own));
    },
  );

  it('« luna » rend Luna et Demiurge Luna, « d.luna » Demiurge Luna, costumes si affichés', () => {
    const luna = items.find((it) => it.label === 'Luna' && !it.prefix)!;
    const dLuna = items.find((it) => it.label === 'Luna' && it.prefix === 'Demiurge')!;
    expect(find('luna')).toEqual(expect.arrayContaining([luna.key, dLuna.key]));
    expect(find('d.luna')).toEqual([dLuna.key]);
    const skins = items.filter((it) => it.isSkin && it.baseShort === 'D.Luna').map((it) => it.key);
    expect(skins.length).toBeGreaterThan(0);
    expect(find('d.luna', true)).toEqual([dLuna.key, ...skins]);
  });

  it('un costume se trouve par le nom complet de sa base', () => {
    const skin = items.find((it) => it.isSkin && it.baseShort === 'D.Luna')!;
    expect(find('demiurge luna', true)).toContain(skin.key);
  });
});
