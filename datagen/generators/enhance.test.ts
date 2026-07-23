/**
 * Invariants du générateur enhance sur `data/generated/equipment/enhance.json`
 * committé : les règles d'amélioration (facteurs, ascension Singularity, bonus
 * +15 parsés dans les descriptions du jeu) — une dérive rendrait la page détail
 * d'équipement fausse sans symptôme.
 *
 * Le générateur est tout en closures sur les tables (parsing de descriptions,
 * agrégation élémentaire) → invariants seuls, comme progression/quirks. Tourne
 * SANS `.gamedata`.
 */
import { describe, expect, it } from 'vitest';
import enhanceData from '../../data/generated/equipment/enhance.json';
import type { EnhanceRules } from './enhance';

const e = enhanceData as unknown as EnhanceRules;

describe('enhance.json — facteurs & exemples', () => {
  it('facteurs de croissance positifs', () => {
    expect(e.enhanceFactor).toBeGreaterThan(0);
    expect(e.maxEnhance).toBeGreaterThan(0);
    expect(e.tierFactor).toBeGreaterThan(0);
  });

  it('exemples d’enhancement : grade/star/base bien formés', () => {
    expect(e.examples.length).toBeGreaterThan(0);
    const bad = e.examples.filter((x) => !x.grade || !(x.star > 0) || !x.statKey || !(x.base > 0));
    expect(bad).toEqual([]);
  });
});

describe('enhance.json — ascension Singularity', () => {
  it('éligibilité + activation cohérentes', () => {
    expect(e.singularity.minGrade).toBeTruthy();
    expect(e.singularity.minStar).toBeGreaterThan(0);
    expect(e.singularity.activation.factor).toBeGreaterThan(0);
  });

  it('paliers +11..+15 : `to` croissant, taux dans [0,100], facteur > 0', () => {
    const bad: string[] = [];
    let prev = -1;
    for (const s of e.singularity.steps) {
      if (s.to <= prev) bad.push(`to ${s.to} après ${prev}`);
      prev = s.to;
      if (s.rate < 0 || s.rate > 100) bad.push(`to ${s.to} : rate ${s.rate}`);
      if (!(s.factor > 0)) bad.push(`to ${s.to} : factor ${s.factor}`);
    }
    expect(bad).toEqual([]);
  });

  it('bonus +15 (armes/armure) : chaque grade a grade/color/range et un taux 0..100', () => {
    const bad: string[] = [];
    const groups = [
      ['weapon', e.singularity.bonuses.weapon],
      ['armor', e.singularity.bonuses.armor],
    ] as const;
    for (const [label, bonuses] of groups) {
      expect(bonuses.length, label).toBeGreaterThan(0);
      for (const b of bonuses) {
        if (!b.name?.en) bad.push(`${label} : bonus sans nom`);
        if (!b.grades.length) bad.push(`${label}/${b.name?.en} : 0 grade`);
        for (const g of b.grades) {
          if (!g.grade || !g.color)
            bad.push(`${label}/${b.name?.en} : grade « ${g.grade} » incomplet`);
          if (g.rate < 0 || g.rate > 100)
            bad.push(`${label}/${b.name?.en}/${g.grade} : rate ${g.rate}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
