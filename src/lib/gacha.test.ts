/**
 * Tests du moteur de gacha — deux registres, comme recruit.test.ts :
 *
 *   1. CŒUR PUR : `bannerConfigOf` dérive une config de bannière d'une fiche
 *      `recruit.json`. C'est la logique qui a remplacé la table écrite à la
 *      main, laquelle s'était périmée sans bruit (le Demiurge a gagné la
 *      garantie du x10 au patch du 25/08 et `BANNER_CONFIGS` disait encore
 *      `false`).
 *   2. INVARIANT RÉFÉRENTIEL sur la donnée committée : les quatre bannières du
 *      simulateur existent, et leurs taux somment à 100 %.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { uniformDict } from '@datagen/lib/lang';
import type { RecruitKindInfo } from '@contracts';
import recruitData from '../../data/generated/recruit.json';
import type { RecruitData } from '../../datagen/generators/recruit';
import {
  BANNER_TYPES,
  RECRUIT_KIND_OF,
  bannerConfigOf,
  createSession,
  guaranteeLeft,
  performPulls,
  type BannerConfig,
} from './gacha';

const rate = (titleKey: string, percent: number, confirmPercent = percent, featured = false) => ({
  titleKey,
  // `LangDict` veut toutes les langues du jeu : le libellé ne sert à rien ici, seul le
  // titleKey compte pour la dérivation.
  title: uniformDict(titleKey),
  percent,
  confirmPercent,
  ...(featured ? { featured: true as const } : {}),
});

describe('bannerConfigOf — la config se dérive de la fiche générée', () => {
  const base: RecruitKindInfo = {
    kind: 'pickup',
    groupId: 'g',
    rates: [
      rate('SYS_RECRUIT_RATEINFO_TITLE_05', 1.25, 1.25, true),
      rate('SYS_RECRUIT_RATEINFO_TITLE_03', 1.25),
      rate('SYS_RECRUIT_RATEINFO_TITLE_02', 19, 97.5),
      rate('SYS_RECRUIT_RATEINFO_TITLE_01', 78.5, 0),
    ],
    pity: { every: 100, max: 2 },
    price1: 150,
    price10: 1500,
    ticketCost: 1,
    freeCount: 0,
    mileageCost: 200,
  };

  it('mappe chaque palier sur son taux, le prix et le mileage', () => {
    expect(bannerConfigOf('rateup', base)).toEqual({
      type: 'rateup',
      focus3Rate: 1.25,
      offFocus3Rate: 1.25,
      rate2: 19,
      rate1: 78.5,
      mileageCap: 200,
      etherCost: 150,
      tenPullGuarantee: true,
      freePull: false,
      guarantee: { at: 100, max: 2 },
    });
  });

  it('le Custom : son palier 3★ est la vedette, sans 3★ hors focus, garantie sans plafond', () => {
    const custom: RecruitKindInfo = {
      ...base,
      kind: 'custom',
      rates: [
        rate('SYS_RECRUIT_RATEINFO_TITLE_03', 2.5, 2.5, true),
        rate('SYS_RECRUIT_RATEINFO_TITLE_02', 19, 97.5),
        rate('SYS_RECRUIT_RATEINFO_TITLE_01', 78.5, 0),
      ],
      pity: { every: 100, max: null },
      freeCount: 1,
    };
    const config = bannerConfigOf('custom', custom);
    expect(config.focus3Rate).toBe(2.5);
    expect(config.offFocus3Rate).toBe(0);
    expect(config.guarantee).toEqual({ at: 100, max: null });
    expect(config.freePull).toBe(true);
  });

  it('la vedette se lit au drapeau, pas au titre ; sans `pity`, pas de garantie', () => {
    const sansDrapeau: RecruitKindInfo = {
      ...base,
      rates: base.rates.map((r) => ({ ...r, featured: undefined })),
    };
    delete sansDrapeau.pity;
    const config = bannerConfigOf('rateup', sansDrapeau);
    expect(config.focus3Rate).toBe(0);
    expect(config.guarantee).toBeNull();
  });

  it('la garantie du x10 se lit sur le slot garanti, pas sur une table', () => {
    // Aucune ligne à 0 % en confirm : rien n'est remonté, donc pas de garantie.
    const sansGarantie: RecruitKindInfo = {
      ...base,
      rates: base.rates.map((r) => ({ ...r, confirmPercent: r.percent })),
    };
    expect(bannerConfigOf('premium', sansGarantie).tenPullGuarantee).toBe(false);
    expect(bannerConfigOf('premium', base).tenPullGuarantee).toBe(true);
  });

  it('mileage absent de la fiche → défaut historique de 200', () => {
    const sansMileage: RecruitKindInfo = { ...base };
    delete sansMileage.mileageCost;
    expect(bannerConfigOf('rateup', sansMileage).mileageCap).toBe(200);
  });
});

const recruit = recruitData as unknown as RecruitData;
const recruitOf = (type: (typeof BANNER_TYPES)[number]) => {
  const info = recruit.kinds.find((k) => k.kind === RECRUIT_KIND_OF[type]);
  if (!info) throw new Error(`fiche absente pour ${type}`);
  return info;
};

describe('recruit.json — les bannières du simulateur', () => {
  it('les quatre existent et leurs taux somment à 100 %', () => {
    const bad: string[] = [];
    for (const type of BANNER_TYPES) {
      const c = bannerConfigOf(type, recruitOf(type));
      const sum = c.focus3Rate + c.offFocus3Rate + c.rate2 + c.rate1;
      if (Math.abs(sum - 100) > 0.01) bad.push(`${type} : somme ${sum}`);
      if (c.etherCost <= 0) bad.push(`${type} : etherCost ${c.etherCost}`);
      if (c.mileageCap <= 0) bad.push(`${type} : mileageCap ${c.mileageCap}`);
    }
    expect(bad).toEqual([]);
  });

  // GARDE-FOU : `bannerConfigOf` se replie en silence sur 200 quand la fiche n'a pas
  // de `mileageCost` (lu de `RecruitGroupTemplet` par `datagen/generators/recruit.ts`),
  // et le test ci-dessus passe par ce repli : il ne verrait pas le coût disparaître.
  // Un rouge ici = le générateur ne trouve plus le mileage d'une bannière : réparer
  // sa lecture dans recruit.ts, pas ce test (le simulateur afficherait un faux 200).
  it('les quatre portent un mileageCost défini et positif, sans le repli', () => {
    const bad = BANNER_TYPES.filter((type) => !((recruitOf(type).mileageCost ?? 0) > 0)).map(
      (type) => `${type} : mileageCost ${recruitOf(type).mileageCost}`,
    );
    expect(bad).toEqual([]);
  });
});

describe('garantie de recrutement (pity du 25/08)', () => {
  /** Bannière déterministe : le focus ne tombe JAMAIS de lui-même. */
  const jamais = (guarantee: BannerConfig['guarantee']): BannerConfig => ({
    type: 'rateup',
    focus3Rate: 0,
    offFocus3Rate: 0,
    rate2: 0,
    rate1: 100,
    mileageCap: 200,
    etherCost: 150,
    tenPullGuarantee: false,
    freePull: false,
    guarantee,
  });

  /** Enchaîne `n` tirages x10 et rend la session finale. */
  const pull = (config: BannerConfig, n: number) => {
    let session = createSession('rateup');
    for (let i = 0; i < n; i++) session = performPulls(session, 10, config).session;
    return session;
  };

  it('le focus est forcé au 100e tirage, pas avant', () => {
    const config = jamais({ at: 100, max: 2 });
    expect(pull(config, 9).counts.star3Focus).toBe(0); // 90 tirages
    expect(pull(config, 10).counts.star3Focus).toBe(1); // 100 tirages
  });

  it('le plafond de garanties est respecté', () => {
    const config = jamais({ at: 100, max: 2 });
    const session = pull(config, 50); // 500 tirages : 5 garanties si non plafonné
    expect(session.counts.star3Focus).toBe(2);
    expect(session.guaranteesUsed).toBe(2);
    expect(guaranteeLeft(session, config)).toBe(false);
  });

  it('sans plafond (max null), la garantie revient tous les 100', () => {
    const session = pull(jamais({ at: 100, max: null }), 50);
    expect(session.counts.star3Focus).toBe(5);
  });

  it('une bannière sans garantie ne force jamais rien', () => {
    const session = pull(jamais(null), 50);
    expect(session.counts.star3Focus).toBe(0);
    expect(session.guaranteesUsed).toBe(0);
  });

  it('un focus obtenu AVANT le 100e consomme quand même la garantie', () => {
    // Focus à 100 % : il tombe au premier tirage de chaque garantie.
    const config: BannerConfig = { ...jamais({ at: 100, max: 2 }), focus3Rate: 100, rate1: 0 };
    let session = createSession('rateup');
    session = performPulls(session, 1, config).session;
    expect(session.guaranteesUsed).toBe(1);
    expect(session.pullsSinceGuarantee).toBe(0); // le compteur repart de zéro
    session = performPulls(session, 1, config).session;
    expect(session.guaranteesUsed).toBe(2);
    // Plafond atteint : les focus suivants ne consomment plus de garantie.
    session = performPulls(session, 1, config).session;
    expect(session.guaranteesUsed).toBe(2);
  });

  it('les vraies bannières ont la règle de leur groupe (celle des notes de patch)', () => {
    const rule = (type: (typeof BANNER_TYPES)[number]) =>
      bannerConfigOf(type, recruitOf(type)).guarantee;
    // La règle EST la fiche : `MaxPityRecruitCount` / `MaxPityCount` du groupe.
    for (const type of BANNER_TYPES) {
      const pity = recruitOf(type).pity;
      expect(pity, type).toBeDefined();
      expect(rule(type), type).toEqual({ at: pity?.every, max: pity?.max });
    }
    // Et la fiche dit ce que disent les notes de patch du 25/08.
    expect(rule('rateup')).toEqual({ at: 100, max: 2 });
    expect(rule('limited')).toEqual({ at: 100, max: 2 });
    expect(rule('premium')).toEqual({ at: 100, max: 1 });
    // Custom Recruit : un des 3 héros choisis en 100 tirages, sans plafond.
    expect(rule('custom')).toEqual({ at: 100, max: null });
  });

  describe('le Custom lu de recruit.json', () => {
    const config = bannerConfigOf('custom', recruitOf('custom'));

    afterEach(() => vi.restoreAllMocks());

    /** `n` tirages x1 ; `random(i)` rend le `Math.random` du i-ème appel (1-indexé). */
    const pullOnes = (n: number, random: (call: number) => number) => {
      let call = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => random(++call));
      let session = createSession('custom');
      const focusAt: number[] = [];
      for (let i = 1; i <= n; i++) {
        const { results, session: next } = performPulls(session, 1, config);
        session = next;
        if (results[0].isFocus) focusAt.push(i);
      }
      return { session, focusAt };
    };

    it('taux vedette 2,5 %, aucun 3★ hors focus', () => {
      expect(config.focus3Rate).toBe(2.5);
      expect(config.offFocus3Rate).toBe(0);
    });

    it('sans 3★ naturel, la vedette est forcée au 100e, au 200e, au 300e (pas de plafond)', () => {
      const { session, focusAt } = pullOnes(300, () => 0.99);
      expect(focusAt).toEqual([100, 200, 300]);
      expect(session.counts.star3).toBe(3);
      expect(guaranteeLeft(session, config)).toBe(true);
    });

    it('un 3★ naturel au 40e remet le compteur à zéro', () => {
      // Un appel de `Math.random` par tirage tant que rien n'est forcé : le 40e
      // tirage est le 40e appel, roulé à 0 (< 2,5 % : 3★ vedette).
      const { focusAt } = pullOnes(140, (call) => (call === 40 ? 0 : 0.99));
      expect(focusAt).toEqual([40, 140]);
    });
  });
});
