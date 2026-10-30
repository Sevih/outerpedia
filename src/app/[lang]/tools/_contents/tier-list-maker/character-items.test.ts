/**
 * Pool personnages du Tier List Maker, sur la vraie donnée : les six formes
 * Core Fusion y entrent, chacune juste après son origine (et ses costumes),
 * avec le titre « Core Fusion » en préfixe — des héros, pas des costumes.
 */
import { describe, expect, it } from 'vitest';
import { characterNamePrefix, getCharacter } from '@/lib/data/characters';
import { buildCharacterItems } from './character-items';

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
