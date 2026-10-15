/**
 * GARDE-FOUS de l'éditorial du guide heroes-growth : trois tables y sont recopiées
 * à la main alors que la donnée générée les porte (`transcend.json`,
 * `hero-growth.json`). Justes au 15/10/2026 ; un rouge après un patch = le jeu a
 * bougé, on corrige la COPIE (`editorial.ts`), jamais ce test.
 *
 * Tourne SANS `.gamedata` : ne lit que `data/generated/` et le code.
 */
import { describe, expect, it } from 'vitest';
import type { TranscendStep as GameStep } from '@contracts';
import { getHeroGrowth } from '@/lib/data/hero-growth';
import { getTranscend } from '@/lib/data/transcend';
import { stepLabel } from '@/lib/transcendence';
import { PREFERRED_GIFT_BONUS } from '@/app/[lang]/tools/_contents/hero-tracker/contracts';
import { AFFINITY_GIFTS, AFFINITY_REWARDS, TRANSCENDENCE_STEPS } from './editorial';

const growth = getHeroGrowth();
const { byStar } = getTranscend();

/**
 * Le cran i (0 à 8) du guide est le `TransStar` i+1 de `CharacterTranscendentTemplet`.
 * Crans 1 et 2 au barème 1★ (le 3★ commence à 3) ; crans 3 à 9 au barème 3★, le seul
 * dont les crans « + » sont colorés.
 */
const gameLadder: GameStep[] = TRANSCENDENCE_STEPS.map((_, i) => {
  const step = (i < 2 ? byStar['1'] : byStar['3'])?.find((s) => s.star === i + 1);
  if (!step) throw new Error(`transcend.json : pas de TransStar ${i + 1}`);
  return step;
});

describe('TRANSCENDENCE_STEPS — copie de CharacterTranscendentTemplet (transcend.json)', () => {
  it('neuf crans : étoiles (ShowUIStar), couleur (StarColor) et libellé (StarPlus)', () => {
    TRANSCENDENCE_STEPS.forEach(({ step, stars, color }, i) => {
      const game = gameLadder[i];
      expect({ step, stars, color }, `cran ${i + 1} (TransStar ${game.star})`).toEqual({
        step: stepLabel(game),
        stars: game.showStar,
        color: game.starColor,
      });
    });
  });

  // Chaque effet se place au PREMIER TransStar où le drapeau du jeu s'allume. Le
  // « +25 Action Points » du 6★ n'a pas de colonne dans la table : non gardé.
  it.each([
    { text: 'Burst 2', flag: 'burst2' },
    { text: '+1 Chain Passive Weakness Gauge Damage', flag: 'wgDmg' },
    { text: 'Burst 3', flag: 'burst3' },
  ] as const)('$text : au premier cran où $flag s’allume', ({ text, flag }) => {
    const placed = TRANSCENDENCE_STEPS.flatMap((s, i) =>
      s.effect?.en?.includes(text) ? [i + 1] : [],
    );
    expect(placed, `crans qui portent l'effet`).toEqual([gameLadder.findIndex((s) => s[flag]) + 1]);
  });
});

describe('AFFINITY_GIFTS — copie des cadeaux de hero-growth.json', () => {
  it('mêmes paliers de points, et par palier les mêmes noms anglais', () => {
    const gamePoints = [...new Set(growth.gifts.map((g) => g.points))].sort((a, b) => a - b);
    expect(AFFINITY_GIFTS.map((t) => t.points)).toEqual(gamePoints);
    for (const tier of AFFINITY_GIFTS) {
      const names = growth.gifts.filter((g) => g.points === tier.points).map((g) => g.name.en);
      expect([...tier.items].sort(), `palier ${tier.points}`).toEqual(names.sort());
    }
  });

  // Les deux copies du bonus du cadeau préféré (le `bonus` du guide et
  // `PREFERRED_GIFT_BONUS` du hero tracker) se tiennent entre elles ; la valeur du
  // jeu (`GameConfigTemplet.TRUST_ENCHANT_INCREASE_VALUE`) n'est pas émise.
  it('bonus = points × PREFERRED_GIFT_BONUS', () => {
    for (const tier of AFFINITY_GIFTS)
      expect(tier.bonus, `palier ${tier.points}`).toBe(tier.points * PREFERRED_GIFT_BONUS);
  });
});

describe('AFFINITY_REWARDS — copie de TrustRewardTemplet (hero-growth.json)', () => {
  it('niveaux à stats = niveaux à RewardBuffID (affinityStatLevels)', () => {
    const stats = AFFINITY_REWARDS.filter((r) => r.reward === 'stats').map((r) => r.level);
    expect(stats).toEqual(growth.affinityStatLevels);
  });
});
