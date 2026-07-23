/**
 * Tests du générateur ether-rankings (guide « Ether Income ») :
 *   1. CŒUR PUR : `byRank` (ordre des paliers — rank avant rate, tri interne).
 *   2. INVARIANTS sur `data/generated/ether-rankings.json` committé : 4 échelles
 *      peuplées, chaque palier a un Ether > 0 et un kind valide, ligues triées.
 *
 * Tourne SANS `.gamedata` (rien n'appelle buildEtherRankings).
 */
import { describe, expect, it } from 'vitest';
import etherData from '../../data/generated/ether-rankings.json';
import { byRank, type EtherRankTier, type EtherRankingsData } from './ether-rankings';

const tier = (o: Partial<EtherRankTier>): EtherRankTier =>
  ({ kind: 'rank', min: 0, max: 0, ether: 1, ...o }) as EtherRankTier;

describe('byRank — ordre des paliers', () => {
  it('rank avant rate', () => {
    expect(byRank(tier({ kind: 'rank' }), tier({ kind: 'rate' }))).toBe(-1);
    expect(byRank(tier({ kind: 'rate' }), tier({ kind: 'rank' }))).toBe(1);
  });

  it('entre rangs : Min croissant ; entre taux : Max croissant', () => {
    expect(byRank(tier({ kind: 'rank', min: 1 }), tier({ kind: 'rank', min: 5 }))).toBeLessThan(0);
    expect(byRank(tier({ kind: 'rate', max: 1 }), tier({ kind: 'rate', max: 9 }))).toBeLessThan(0);
  });

  it('tri complet : les rangs d’abord (par min), puis les taux (par max)', () => {
    const arr = [
      tier({ kind: 'rate', max: 10 }),
      tier({ kind: 'rank', min: 5 }),
      tier({ kind: 'rate', max: 3 }),
      tier({ kind: 'rank', min: 1 }),
    ];
    const sorted = [...arr]
      .sort(byRank)
      .map((t) => `${t.kind}${t.kind === 'rank' ? t.min : t.max}`);
    expect(sorted).toEqual(['rank1', 'rank5', 'rate3', 'rate10']);
  });
});

const er = etherData as unknown as EtherRankingsData;

describe('ether-rankings.json — invariants', () => {
  it('les 4 échelles sont peuplées', () => {
    expect(er.arena.length).toBeGreaterThan(0);
    expect(er.guildRaid.tiers.length).toBeGreaterThan(0);
    expect(er.worldBoss.leagues.length).toBeGreaterThan(0);
    expect(er.singularity.length).toBeGreaterThan(0);
  });

  it('chaque palier : kind ∈ {rank,rate}, ether > 0', () => {
    const all = [
      ...er.arena,
      ...er.guildRaid.tiers,
      ...er.singularity,
      ...er.worldBoss.leagues.flatMap((l) => l.tiers),
    ];
    const bad = all.filter((t) => (t.kind !== 'rank' && t.kind !== 'rate') || !(t.ether > 0));
    expect(bad).toEqual([]);
  });

  it('ligues world boss triées par niveau croissant', () => {
    const lvls = er.worldBoss.leagues.map((l) => l.level);
    expect([...lvls].sort((a, b) => a - b)).toEqual(lvls);
  });
});
