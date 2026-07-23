/**
 * Tests du générateur hero-growth (guide « Growth Systems ») — les DEUX registres :
 *
 *   1. CŒURS PURS en synthétique : `costsFrom` (paires ItemID_n/ItemCnt_n →
 *      coûts, en écartant id=0 et count=0) et `itemRef` (résolution catalogue,
 *      jette si absent). Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/hero-growth.json` committé :
 *      paliers de limit break ordonnés, améliorations triées par niveau, chaque
 *      item de coût résolu dans le catalogue. Une dérive rendrait un tableau de
 *      coûts faux sans symptôme.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI).
 */
import { describe, expect, it } from 'vitest';
import heroGrowthData from '../../data/generated/hero-growth.json';
import itemsData from '../../data/generated/items.json';
import type { Row } from '../lib/tables';
import type { CatalogEntry } from './item-catalog';
import { costsFrom, itemRef, type HeroGrowthData } from './hero-growth';

const dict = (en: string) => ({ en, jp: '', kr: '', zh: '' });
const catalog = {
  '20201': { name: dict('Basic Skill Manual'), icon: 'ic_manual', grade: 'magic' },
  '20202': { name: dict('Advanced Manual'), icon: 'ic_adv', grade: 'rare' },
} as unknown as Record<string, CatalogEntry>;

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('itemRef — résolution catalogue', () => {
  it('renvoie id/name/icon/grade de l’entrée', () => {
    expect(itemRef('20201', catalog)).toEqual({
      id: '20201',
      name: dict('Basic Skill Manual'),
      icon: 'ic_manual',
      grade: 'magic',
    });
  });

  it('jette si l’item est absent du catalogue (SSG strict)', () => {
    expect(() => itemRef('99999', catalog)).toThrow();
  });
});

describe('costsFrom — paires ItemID_n/ItemCnt_n → coûts', () => {
  const pairs: [string, string][] = [
    ['ItemID_1', 'ItemCnt_1'],
    ['ItemID_2', 'ItemCnt_2'],
  ];

  it('garde les paires (id≠0, count>0), résout l’item', () => {
    const row: Row = { ItemID_1: '20201', ItemCnt_1: '3', ItemID_2: '20202', ItemCnt_2: '1' };
    const out = costsFrom(row, pairs, catalog);
    expect(out.map((c) => [c.item.id, c.count])).toEqual([
      ['20201', 3],
      ['20202', 1],
    ]);
  });

  it('écarte id=0 et count=0', () => {
    const row: Row = { ItemID_1: '0', ItemCnt_1: '5', ItemID_2: '20202', ItemCnt_2: '0' };
    expect(costsFrom(row, pairs, catalog)).toEqual([]);
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const h = heroGrowthData as unknown as HeroGrowthData;
const itemIds = new Set(Object.keys(itemsData as Record<string, unknown>));

describe('hero-growth.json — invariants', () => {
  it('limit break : paliers ordonnés (fromLevel croissant, toLevel > fromLevel)', () => {
    const bad: string[] = [];
    expect(Object.keys(h.limitBreak).length).toBeGreaterThan(0);
    for (const [star, steps] of Object.entries(h.limitBreak)) {
      let prev = -1;
      for (const s of steps) {
        if (s.fromLevel <= prev) bad.push(`${star} : fromLevel ${s.fromLevel} après ${prev}`);
        prev = s.fromLevel;
        if (s.toLevel <= s.fromLevel) bad.push(`${star} : toLevel ${s.toLevel} ≤ ${s.fromLevel}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('skill upgrade & special equip triés par niveau', () => {
    const bad: string[] = [];
    const sorted = (levels: number[], label: string) => {
      if ([...levels].sort((a, b) => a - b).join() !== levels.join()) bad.push(label);
    };
    for (const [star, rows] of Object.entries(h.skillUpgrade))
      sorted(
        rows.map((r) => r.level),
        `skillUpgrade ${star}`,
      );
    sorted(
      h.specialEquip.ee.map((r) => r.level),
      'ee',
    );
    sorted(
      h.specialEquip.talisman.map((r) => r.level),
      'talisman',
    );
    expect(bad).toEqual([]);
  });

  it('xpFood trié par XP croissant, XP > 0', () => {
    const bad: string[] = [];
    let prev = -1;
    for (const f of h.xpFood) {
      if (f.xp <= 0) bad.push(`${f.id} : xp ${f.xp}`);
      if (f.xp < prev) bad.push(`${f.id} : non trié (${f.xp} < ${prev})`);
      prev = f.xp;
    }
    expect(bad).toEqual([]);
  });

  it('chaque item de coût est résolu (id dans items.json, name/icon/grade)', () => {
    const bad: string[] = [];
    const chk = (id: string, name: { en?: string }, where: string) => {
      if (!itemIds.has(id)) bad.push(`${where} : item ${id} absent`);
      if (!name?.en) bad.push(`${where} : item ${id} sans nom`);
    };
    for (const [star, rows] of Object.entries(h.skillUpgrade))
      for (const r of rows) for (const m of r.manuals) chk(m.item.id, m.item.name, `skill ${star}`);
    for (const [k, grp] of Object.entries(h.specialEquip))
      for (const r of grp) for (const m of r.materials) chk(m.item.id, m.item.name, k);
    for (const f of h.xpFood) chk(f.id, f.name, 'xpFood');
    expect(bad).toEqual([]);
  });
});
