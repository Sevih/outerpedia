import { describe, expect, it } from 'vitest';
import type { Skill } from '@contracts';
import { getCharacter } from '@/lib/data/characters';
import type { MergedEffect } from '@/lib/data/effects';
import { getSkills } from '@/lib/data/skills';
import { DUAL_CARD_SUFFIX } from '@/lib/skill-view';
import { characterKitCards, kitEffectCatalog, pickKitCards } from './character-kit';

/**
 * Le kit d'un perso tel que son éditeur de câblage le montre. Ancré sur les
 * données COMMITTÉES (un perso et ses skills de `data/generated/`) : la suite
 * tourne sans les tables du jeu, que l'admin et quick lisent, eux, par
 * l'extraction.
 */
const SKILLS = getSkills() as unknown as Record<string, Skill>;
const AER = getCharacter('2000055')!;
// Le bundle de l'extraction, rebâti du committé : le perso, et SES skills.
const bundle = {
  char: AER,
  skills: Object.fromEntries(AER.skills.map((id) => [id, SKILLS[id]]).filter(([, s]) => s)),
};

describe('characterKitCards — les cartes éditables d’un kit', () => {
  const cards = characterKitCards(bundle, (icon) => `/sprite/${icon}`);

  it('mains, puis la chaîne et le duo — le duo sous l’id du chain_passive suffixé', () => {
    expect(cards.map((c) => c.type)).toEqual([
      'first',
      'second',
      'ultimate',
      'chain_passive',
      'dual',
    ]);
    const chain = cards.find((c) => c.type === 'chain_passive')!;
    expect(cards.find((c) => c.type === 'dual')!.id).toBe(chain.id + DUAL_CARD_SUFFIX);
  });

  it('l’icône d’un skill vient de l’appelant, celle de la chaîne de l’élément du perso', () => {
    const first = cards[0];
    expect(first.iconSrc).toMatch(/^\/sprite\/.+/);
    expect(cards.find((c) => c.type === 'chain_passive')!.iconSrc).toContain(
      `Skill_ChainPassive_${AER.element[0].toUpperCase()}${AER.element.slice(1)}_`,
    );
    expect(cards.find((c) => c.type === 'dual')!.iconSrc).toBeUndefined();
  });

  it('une description a ses placeholders résolus, et chaque chip sa ref, son nom, sa nature', () => {
    for (const card of cards) expect(card.desc ?? '').not.toMatch(/\[Buff_[CVT]_/);
    const chips = cards.flatMap((c) => c.chips);
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.ref).toBeTruthy();
      expect(chip.name).toBeTruthy();
      expect(typeof chip.isDebuff).toBe('boolean');
    }
    // Une ref = une chip masquable : pas de doublon sur une carte.
    for (const card of cards)
      expect(new Set(card.chips.map((c) => c.ref)).size).toBe(card.chips.length);
  });
});

describe('pickKitCards, kitEffectCatalog', () => {
  it('une section du curé, restreinte aux cartes d’un perso', () => {
    expect(
      pickKitCards({ a: ['1'], 'a::dual': ['2'], z: ['3'] }, [{ id: 'a' }, { id: 'a::dual' }]),
    ).toEqual({ a: ['1'], 'a::dual': ['2'] });
  });

  it('le catalogue : les effets nommés, non masqués — id, nom anglais, icône, nature, irremovable', () => {
    const effect = (over: Partial<MergedEffect>): MergedEffect =>
      ({
        id: 'x',
        name: { en: 'X' },
        icon: '',
        isDebuff: false,
        irremovable: false,
        hidden: false,
        ...over,
      }) as MergedEffect;
    expect(
      kitEffectCatalog([
        effect({ id: '1', name: { en: 'Burned' }, icon: 'IG_Burn', isDebuff: true }),
        effect({ id: '2', name: { en: 'Immunity' }, irremovable: true }),
        effect({ id: '3', hidden: true }),
        effect({ id: '4', name: { en: '' } }),
      ]),
    ).toEqual({
      '1': { id: '1', name: 'Burned', icon: 'IG_Burn', isDebuff: true },
      '2': { id: '2', name: 'Immunity', isDebuff: false, irremovable: true },
    });
  });
});
