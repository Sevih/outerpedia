import { describe, expect, it } from 'vitest';
import encounters from '@data/generated/encounters.json';
import { expandRankContexts, statAt, type SpawnContext } from '@/lib/monster-stats';
import type { DungeonRank } from '@contracts';

/**
 * LE PIÈGE : `DungeonRank.hp` a deux sens selon le mode.
 *
 * Dans un mode à SCORE (le palier porte une tranche de dégâts), `hp` est la
 * LARGEUR de la tranche — la barre à vider pour franchir le rang — et PAS les
 * PV du boss. Sans tranche (adventure), ce sont de vrais PV.
 *
 * Confondre les deux ne casse RIEN : ça affiche juste un nombre plausible et
 * faux. La V3 l'a fait — le panneau de la Singularity annonçait 750 000 PV au
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

describe('encounters.json — le contrat de `DungeonRank.hp` tient sur TOUTE la donnée', () => {
  const scored = Object.entries(encounters as Record<string, { ranks?: DungeonRank[] }>).flatMap(
    ([id, d]) => (d.ranks ?? []).map((r, i) => ({ id, i, r })),
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
