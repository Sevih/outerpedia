import { describe, expect, it } from 'vitest';
import { getEncounters } from '@/lib/data/encounters';
import {
  expandRankContexts,
  monsterQuirkMods,
  statAt,
  type SpawnContext,
} from '@/lib/monster-stats';
import type { DungeonRank } from '@contracts';

/**
 * LE PIÈGE : `DungeonRank.hp` a deux sens selon le mode.
 *
 * Dans un mode à SCORE (le palier porte une tranche de dégâts), `hp` est la
 * LARGEUR de la tranche — la barre à vider pour franchir le rang — et PAS les
 * PV du boss. Sans tranche (adventure), ce sont de vrais PV.
 *
 * Confondre les deux ne casse RIEN : ça affiche juste un nombre plausible et
 * faux. C'est arrivé — le panneau de la Singularity annonçait 750 000 PV au
 * rang SSS++, soit 7,5× les PV réels du boss, parce que 750 000 est la largeur
 * de sa tranche (5 000 000 − 4 250 001 + 1). Aucun test ne pouvait le voir :
 * la valeur venait bien de la donnée, elle répondait juste à une autre question.
 */

const RANGE = { min: 1000, max: 100_000 };

describe('expandRankContexts — barre de palier vs PV de boss', () => {
  it("un palier à SCORE n'écrase pas les PV : sa barre part dans `bar`", () => {
    const scored: DungeonRank = {
      name: 'SSS++',
      level: 200,
      hp: 750_000,
      damage: { min: 4_250_001, max: 5_000_000 },
    };
    const [ctx] = expandRankContexts({ level: 100 }, [scored]);

    expect(ctx.bar).toBe(750_000);
    expect(ctx.bossHp).toBeUndefined();
    // Les PV restent ceux du templet, extrapolés au Lv200 — pas la barre.
    expect(statAt('hp', RANGE, ctx)).not.toBe(750_000);
  });

  it('un palier SANS tranche (adventure) porte de VRAIS PV', () => {
    const plain: DungeonRank = { level: 100, hp: 560_480 };
    const [ctx] = expandRankContexts({ level: 100 }, [plain]);

    expect(ctx.bossHp).toBe(560_480);
    expect(ctx.bar).toBeUndefined();
    expect(statAt('hp', RANGE, ctx)).toBe(560_480);
  });

  it("les PV du donjon (joint challenge, guild raid) survivent à l'expansion", () => {
    const base: SpawnContext = { level: 120, bossHp: 2_000_000 };
    const [ctx] = expandRankContexts(base, [
      { name: 'A', level: 120, hp: 50_000, damage: { min: 1, max: 50_000 } },
    ]);

    expect(ctx.bossHp).toBe(2_000_000);
    expect(statAt('hp', RANGE, ctx)).toBe(2_000_000);
  });
});

describe('expandRankContexts — les PV de boss ne vont qu’au boss', () => {
  const plain: DungeonRank = { level: 100, hp: 560_480 };

  it('palier NON scoré : le boss prend `r.hp`, le renfort garde ses PV interpolés', () => {
    const [boss] = expandRankContexts({ level: 100 }, [plain], 'boss');
    const [add] = expandRankContexts({ level: 100 }, [plain], 'add');

    expect(statAt('hp', RANGE, boss)).toBe(plain.hp);
    expect(add.bossHp).toBeUndefined();
    expect(statAt('hp', RANGE, add)).toBe(statAt('hp', RANGE, { level: plain.level! }));
  });

  it('les PV du donjon (`bossHp`) ne collent pas au renfort, avec ou sans palier', () => {
    const base: SpawnContext = { level: 120, bossHp: 2_000_000 };
    expect(expandRankContexts(base, undefined, 'add')[0].bossHp).toBeUndefined();
    expect(expandRankContexts(base, [plain], 'add')[0].bossHp).toBeUndefined();
    expect(expandRankContexts(base, undefined, 'boss')[0].bossHp).toBe(base.bossHp);
  });

  it('rôle inconnu : la règle d’avant (le palier pose ses PV)', () => {
    expect(expandRankContexts({ level: 100 }, [plain])[0].bossHp).toBe(plain.hp);
  });

  it('palier SCORÉ : sa barre, quel que soit le rôle', () => {
    const scored: DungeonRank = { level: 100, hp: 1000, damage: { min: 1, max: 1000 } };
    for (const role of ['boss', 'add'] as const) {
      const [ctx] = expandRankContexts({ level: 100 }, [scored], role);
      expect(ctx.bar, role).toBe(scored.hp);
      expect(ctx.bossHp, role).toBeUndefined();
    }
  });
});

describe('monsterQuirkMods — quirks de compte, boss seulement (`CheckNodeApply`)', () => {
  const mods = { buff_chance: -200, buff_resist: -200 };
  const EFF = { min: 100, max: 300 };

  it('appliqués à `boss`, `area_boss`, `season_boss`', () => {
    for (const type of ['boss', 'area_boss', 'season_boss']) {
      const q = monsterQuirkMods(type, mods);
      expect(q, type).toEqual(mods);
      expect(statAt('buff_chance', EFF, { level: 100 }, q), type).toBeLessThan(EFF.max);
    }
  });

  it('nuls pour `monster` et `named` : la stat reste celle du templet', () => {
    for (const type of ['monster', 'named']) {
      const q = monsterQuirkMods(type, mods);
      expect(q, type).toEqual({});
      expect(statAt('buff_chance', EFF, { level: 100 }, q), type).toBe(EFF.max);
    }
  });
});

describe('statAt — interpolation tronquée vers zéro (`CFormula.CalcStat`)', () => {
  it('plage décroissante : −0,4 sort 0, pas −1', () => {
    // (90 − 100) × (5 − 1) / 99 = −0,40… → tronqué à 0, donc min.
    expect(statAt('speed', { min: 100, max: 90 }, { level: 5 })).toBe(100);
  });

  it('plage croissante : inchangée (tronquer et arrondir bas y coïncident)', () => {
    expect(statAt('atk', { min: 100, max: 1000 }, { level: 50 })).toBe(
      100 + Math.floor((900 * 49) / 99),
    );
  });
});

describe('encounters.json — le contrat de `DungeonRank.hp` tient sur TOUTE la donnée', () => {
  const scored = Object.entries(getEncounters()).flatMap(([id, d]) =>
    (d.ranks ?? []).map((r, i) => ({ id, i, r })),
  );

  it('tout palier à tranche FERMÉE : hp === max − min + 1 (borne basse absente = 0)', () => {
    const closed = scored.filter(({ r }) => r.damage?.max !== undefined);
    expect(closed.length).toBeGreaterThan(50);

    for (const { id, i, r } of closed) {
      const width = r.damage!.max! - (r.damage!.min ?? 0) + 1;
      expect(r.hp, `donjon ${id} palier ${i} (${r.name})`).toBe(width);
    }
  });

  it("aucun palier à score ne remonte ses PV dans le contexte d'affichage", () => {
    for (const { id, r } of scored.filter(({ r }) => r.damage !== undefined)) {
      const [ctx] = expandRankContexts({ level: 100 }, [r]);
      expect(ctx.bossHp, `donjon ${id} palier ${r.name}`).toBeUndefined();
    }
  });
});
