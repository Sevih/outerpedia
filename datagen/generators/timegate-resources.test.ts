/**
 * Invariants du générateur timegate-resources sur
 * `data/generated/timegate-resources.json` committé : le guide « Weekly &
 * Monthly Reference Tables » mêle sources de shop DÉRIVÉES et sources non-shop
 * CURÉES — une dérive rendrait un total faux ou une source orpheline.
 *
 * Les cœurs `computeAsOf`/`isCurrent` sont PARTAGÉS avec shop-priorities et déjà
 * couverts là-bas ; ici, invariants sur la sortie, plus la quantité par achat
 * de `shopSourcesFor` et la dérivation des sources de Singularité
 * (`singularitySources`) sur des lignes synthétiques. Tourne SANS `.gamedata`.
 */
import { describe, expect, it } from 'vitest';
import timegateData from '../../data/generated/timegate-resources.json';
import type { Row } from '../lib/tables';
import {
  shopSourcesFor,
  singularitySources,
  type SingularityTables,
  type TimegateResourcesData,
} from './timegate-resources';

const tg = timegateData as unknown as TimegateResourcesData;
const TYPES = new Set(['mission', 'guild', 'shop', 'craft']);
const ORIGINS = new Set(['shop', 'reward', 'cured']);

describe('timegate-resources.json — invariants', () => {
  it('ancre ISO, onglets peuplés', () => {
    expect(tg.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tg.tabs.length).toBeGreaterThan(0);
    for (const t of tg.tabs) expect(t.items.length, t.key).toBeGreaterThan(0);
  });

  it('chaque item : au moins une source, type/origine valides', () => {
    const bad: string[] = [];
    for (const tab of tg.tabs) {
      for (const it of tab.items) {
        if (!it.sources.length) bad.push(`${tab.key}/${it.id} : 0 source`);
        for (const s of it.sources) {
          if (!TYPES.has(s.type)) bad.push(`${tab.key}/${it.id} : type « ${s.type} »`);
          if (!ORIGINS.has(s.origin)) bad.push(`${tab.key}/${it.id} : origin « ${s.origin} »`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('total mensuel global = mensuel + hebdo × 4 (règle héritée)', () => {
    const bad: string[] = [];
    for (const tab of tg.tabs) {
      for (const it of tab.items) {
        const expected = it.totals.monthly + it.totals.weekly * 4;
        if (it.totals.grandMonthly !== expected)
          bad.push(`${tab.key}/${it.id} : ${it.totals.grandMonthly} ≠ ${expected}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('shopSourcesFor — quantité par achat', () => {
  // Produit hebdo courant (sans dates) du Guild Shop : 3 achats d'un pack de 5.
  const pack = (value: string | undefined): Row => ({
    ID: '1',
    ProductBuyType: 'PBT_GUILD_COIN',
    ProductGoodsType: 'PGT_ITEM',
    ProductGoodsID: 'ITEM_X',
    ProductResetType: 'PRT_WEEKLY',
    MaxBuyCount: '3',
    ...(value === undefined ? {} : { ProductGoodsValue: value }),
  });
  const weeklyOf = (r: Row) =>
    shopSourcesFor('ITEM_X', new Map([['guild', [r]]]), '2026-10-25', 2026)[0]?.weekly;

  it('ProductGoodsValue multiplie MaxBuyCount (pack de 5 → 15/semaine)', () => {
    expect(weeklyOf(pack('5'))).toBe(15);
  });

  it('un par achat → MaxBuyCount inchangé', () => {
    expect(weeklyOf(pack('1'))).toBe(3);
  });

  it('valeur absente ou à 0 → 1 par achat, MaxBuyCount inchangé', () => {
    expect(weeklyOf(pack(undefined))).toBe(3);
    expect(weeklyOf(pack('0'))).toBe(3);
  });
});

describe('singularitySources — dérivation des tables de récompense', () => {
  // Récompenses factices, indexées par ID.
  const REWARDS: Row[] = [
    { ID: 'R_OLD', StaticGroupID: 'G_OLD' },
    { ID: 'R_E', StaticGroupID: 'G_E' },
    { ID: 'R_EX', StaticGroupID: 'G_EX' },
    // EX+++ : de l'or seul, ignoré (le guide ne compte que des items).
    { ID: 'R_GOLD', CreditMin: '2000000', CreditMax: '2000000' },
    { ID: 'R_DAILY', CreditMin: '75000', CreditMax: '75000', StaticGroupID: 'G_DAILY' },
    { ID: 'R_TOP', Crystal: '50', StaticGroupID: 'G_TOP' },
    { ID: 'R_LOW', StaticGroupID: 'G_LOW' },
    { ID: 'R_MISSION', Crystal: '10', StaticGroupID: 'G_MISSION' },
  ];

  // Deux saisons : seule la plus récente (2) compte. Saison de 5 jours.
  const tables = (over: Partial<SingularityTables> = {}): SingularityTables => ({
    seasons: [
      { ID: '1', SingularityPeriodDate: '5', SingularityDailyRewardID: 'R_OLD' },
      { ID: '2', SingularityPeriodDate: '5', SingularityDailyRewardID: 'R_DAILY' },
    ],
    grades: [
      { SingularityID: '1', Rank: '1', RankName: 'E', RewardID: 'R_OLD' },
      { SingularityID: '2', Rank: '1', RankName: 'E', RewardID: 'R_E' },
      { SingularityID: '2', Rank: '31', RankName: 'EX', RewardID: 'R_EX' },
      { SingularityID: '2', Rank: '34', RankName: 'EX+++', RewardID: 'R_GOLD' },
    ],
    rankings: [
      { SingularityID: '2', RankType: 'RANK', Min: '1', Max: '1', RewardID: 'R_TOP' },
      { SingularityID: '2', RankType: 'RANK', Min: '50', Max: '100', RewardID: 'R_LOW' },
    ],
    missionTasks: [
      { ID: 'm1', MissionCategoryType: 'MCT_SINGULARITY_WEEKLY', RewardID: 'R_MISSION' },
      { ID: 'm2', MissionCategoryType: 'MCT_SINGULARITY_WEEKLY', RewardID: 'R_MISSION' },
      { ID: 'm3', MissionCategoryType: 'MCT_DAILY', RewardID: 'R_MISSION' },
    ],
    rewardById: new Map(REWARDS.map((r): [string, Row] => [r.ID, r])),
    rewardGroups: new Map([
      ['G_OLD', [{ Type: 'RIT_ITEM', TypeID: 'A', MinCount: '999', MaxCount: '999' }]],
      ['G_E', [{ Type: 'RIT_ITEM', TypeID: 'A', MinCount: '10', MaxCount: '10' }]],
      [
        'G_EX',
        [
          { Type: 'RIT_ITEM', TypeID: 'A', MinCount: '20', MaxCount: '20' },
          { Type: 'RIT_ITEM', TypeID: 'B', MinCount: '50', MaxCount: '50' },
        ],
      ],
      ['G_DAILY', [{ Type: 'RIT_ITEM', TypeID: 'B', MinCount: '40', MaxCount: '40' }]],
      [
        'G_TOP',
        [
          { Type: 'RIT_ITEM', TypeID: 'A', MinCount: '60', MaxCount: '60' },
          { Type: 'RIT_ITEM', TypeID: 'B', MinCount: '40', MaxCount: '40' },
        ],
      ],
      ['G_LOW', [{ Type: 'RIT_ITEM', TypeID: 'A', MinCount: '5', MaxCount: '5' }]],
      ['G_MISSION', [{ Type: 'RIT_ITEM', TypeID: 'C', MinCount: '20', MaxCount: '20' }]],
    ]),
    ...over,
  });

  it('rang (E + EX, or ignoré), run quotidien × 5, classement min–max × 5, missions', () => {
    const out = singularitySources(tables());
    const pick = (id: string) =>
      (out.get(id) ?? []).map(({ sourceKey, origin, type, weekly, weeklyRange }) => ({
        sourceKey,
        origin,
        type,
        ...(weekly != null ? { weekly } : {}),
        ...(weeklyRange ? { weeklyRange } : {}),
      }));
    expect(pick('A')).toEqual([
      { sourceKey: 'singularity-rank', origin: 'reward', type: 'mission', weekly: 30 },
      {
        sourceKey: 'singularity-daily-ranking',
        origin: 'reward',
        type: 'mission',
        weeklyRange: [25, 300],
      },
    ]);
    // B absent de la tranche basse → min 0.
    expect(pick('B')).toEqual([
      { sourceKey: 'singularity-rank', origin: 'reward', type: 'mission', weekly: 50 },
      { sourceKey: 'singularity-daily-run', origin: 'reward', type: 'mission', weekly: 200 },
      {
        sourceKey: 'singularity-daily-ranking',
        origin: 'reward',
        type: 'mission',
        weeklyRange: [0, 200],
      },
    ]);
    // Deux missions hebdomadaires comptées, la mission quotidienne non.
    expect(pick('C')).toEqual([
      { sourceKey: 'singularity-weekly-mission', origin: 'reward', type: 'mission', weekly: 40 },
    ]);
    expect([...out.keys()].sort()).toEqual(['A', 'B', 'C']);
  });

  it('table vide → jette', () => {
    expect(() => singularitySources(tables({ seasons: [] }))).toThrow(/SingularityTemplet vide/);
    expect(() => singularitySources(tables({ grades: [] }))).toThrow(
      /SingularityGradeTemplet vide/,
    );
    expect(() => singularitySources(tables({ rankings: [] }))).toThrow(
      /SingularityRankingTemplet vide/,
    );
    expect(() => singularitySources(tables({ missionTasks: [] }))).toThrow(
      /MCT_SINGULARITY_WEEKLY/,
    );
  });

  it('RewardID introuvable → jette', () => {
    const t = tables();
    t.rewardById.delete('R_EX');
    expect(() => singularitySources(t)).toThrow(/RewardID R_EX introuvable/);
  });
});
