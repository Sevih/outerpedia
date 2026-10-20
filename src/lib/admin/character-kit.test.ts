import { describe, expect, it } from 'vitest';
import type { Skill } from '@contracts';
import { getCharacter } from '@/lib/data/characters';
import { getSheetTranscendTiers } from '@/lib/data/char-progression';
import type { MergedEffect } from '@/lib/data/effects';
import { getSkills } from '@/lib/data/skills';
import { DUAL_CARD_SUFFIX } from '@/lib/skill-view';
import {
  characterKitCards,
  characterKitExtras,
  kitEffectCatalog,
  pickKitCards,
} from './character-kit';

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

/**
 * Un kit burstable SYNTHÉTIQUE, bâti du S1 de Tamamo-no-Mae (2000086, `burstAP`)
 * et de deux bursts seulement : son burst 1 tel quel (Cursed, celui du S1, et
 * « WG Reduction +1 » dans son texte), et son burst 3 rangé en burst 2 (Cursed,
 * Extra Turn, Cooldown Reduction) — plus son passif unique, pour les paliers.
 */
const TAMAMO = getCharacter('2000086')!;
const UNIQUE = TAMAMO.skills.find((id) => SKILLS[id]?.type === 'unique_passive')!;
const burstBundle = {
  char: { ...TAMAMO, skills: ['8601', '8619', '8620', UNIQUE] },
  skills: {
    '8601': SKILLS['8601'],
    '8619': SKILLS['8619'],
    '8620': { ...SKILLS['8621'], id: '8620', type: 'burst_2' },
    [UNIQUE]: SKILLS[UNIQUE],
  },
};

/** Un perso SANS burst (aucun n'en manque dans le jeu) : le kit d'Aer, sans `burstAP` ni `burst_*`. */
const noBurst = {
  char: AER,
  skills: Object.fromEntries(
    Object.entries(bundle.skills as Record<string, Skill>)
      .filter(([, s]) => !s.type.startsWith('burst_'))
      .map(([id, s]) => [id, { ...s, burstAP: undefined }]),
  ),
};

describe('le kit burstable — chips héritées `via`, bursts et transcendance en lecture', () => {
  const s1 = characterKitCards(burstBundle, (icon) => icon).find((c) => c.id === '8601')!;
  const via = (ref: string) => s1.chips.find((c) => c.ref === ref)?.via;

  it('la carte du skill burstable est marquée ; ses chips héritées disent de quel burst', () => {
    expect(s1.burst).toBe(true);
    // Cursed : le S1 le porte lui-même — pas de `via`, même si les bursts le portent aussi.
    expect(s1.chips.find((c) => c.ref === '1002')).toBeDefined();
    expect(via('1002')).toBeUndefined();
    // Extra Turn et Cooldown Reduction : le burst 2 seul.
    expect(via('SYS_BUFF_ADDITIVE_TURN')).toEqual([2]);
    expect(via('SYS_BUFF_COOLTIME_REDUCE')).toEqual([2]);
    // Le bonus WG synthétique (texte du burst 1) : rattaché à aucun burst en propre.
    expect(via('WEAKNESS_GAUGE_DAMAGE')).toEqual([1, 2, 3]);
  });

  it('seule la carte burstable a `burst` et des `via` ; sans burst, aucune', () => {
    const cards = characterKitCards(burstBundle, (icon) => icon);
    expect(cards.filter((c) => c.burst).map((c) => c.id)).toEqual(['8601']);
    expect(cards.filter((c) => c.chips.some((x) => x.via)).map((c) => c.id)).toEqual(['8601']);
    const plain = characterKitCards(noBurst, (icon) => icon);
    expect(plain.some((c) => c.burst)).toBe(false);
    expect(plain.flatMap((c) => c.chips).some((c) => c.via)).toBe(false);
  });

  it('`characterKitExtras` : les bursts (niveau, coût AP, texte résolu, chips propres), les paliers du perso', () => {
    const { bursts, transcend } = characterKitExtras(burstBundle);
    expect(bursts.map((b) => [b.level, b.id, b.cost])).toEqual([
      [1, '8619', SKILLS['8601'].burstAP![0]],
      [2, '8620', SKILLS['8601'].burstAP![1]],
    ]);
    expect(bursts.map((b) => b.chips.map((c) => c.ref))).toEqual([
      ['1002'],
      ['1002', 'SYS_BUFF_ADDITIVE_TURN', 'SYS_BUFF_COOLTIME_REDUCE'],
    ]);
    for (const b of bursts) expect(b.desc ?? '').not.toMatch(/\[Buff_[CVT]_/);
    // Les paliers de la fiche du site, passif unique compris.
    expect(transcend).toEqual(
      getSheetTranscendTiers(TAMAMO, 'en').map(({ label, atkPct, defPct, hpPct, passives }) => ({
        label,
        atkPct,
        defPct,
        hpPct,
        passives,
      })),
    );
    expect(transcend.length).toBeGreaterThan(0);
    expect(transcend.some((t) => t.passives.length)).toBe(true);
  });

  it('un perso sans burst : aucun burst', () => {
    expect(characterKitExtras(noBurst).bursts).toEqual([]);
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
