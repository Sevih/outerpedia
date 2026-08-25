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
import { describe, expect, it } from 'vitest';
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

const rate = (titleKey: string, percent: number, confirmPercent = percent) => ({
  titleKey,
  // `LangDict` veut les cinq langues : le libellé ne sert à rien ici, seul le
  // titleKey compte pour la dérivation.
  title: { en: titleKey, jp: titleKey, kr: titleKey, zh: titleKey },
  percent,
  confirmPercent,
});

describe('bannerConfigOf — la config se dérive de la fiche générée', () => {
  const base: RecruitKindInfo = {
    kind: 'pickup',
    groupId: 'g',
    rates: [
      rate('SYS_RECRUIT_RATEINFO_TITLE_05', 1.25),
      rate('SYS_RECRUIT_RATEINFO_TITLE_03', 1.25),
      rate('SYS_RECRUIT_RATEINFO_TITLE_02', 19, 97.5),
      rate('SYS_RECRUIT_RATEINFO_TITLE_01', 78.5, 0),
    ],
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

  it('sans palier pickup (le Custom), le taux vedette est 0', () => {
    const custom: RecruitKindInfo = {
      ...base,
      rates: base.rates.filter((r) => !r.titleKey.endsWith('_TITLE_05')),
      freeCount: 1,
    };
    const config = bannerConfigOf('custom', custom);
    expect(config.focus3Rate).toBe(0);
    expect(config.freePull).toBe(true);
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

  it('les vraies bannières ont la règle des notes de patch', () => {
    const rule = (type: (typeof BANNER_TYPES)[number]) =>
      bannerConfigOf(type, recruitOf(type)).guarantee;
    expect(rule('rateup')).toEqual({ at: 100, max: 2 });
    expect(rule('limited')).toEqual({ at: 100, max: 2 });
    expect(rule('premium')).toEqual({ at: 100, max: 1 });
    // « All Heroes » n'existe pas dans le jeu : rien à y garantir.
    expect(rule('custom')).toBeNull();
  });
});
