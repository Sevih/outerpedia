import { describe, expect, it } from 'vitest';
import { getEncounters } from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import monstersData from '../../data/generated/monsters.json';
import {
  combatStat,
  combatStatAt,
  expandRankContexts,
  formatMonsterStat,
  GUILD_RAID_OVERGRADE_RATES,
  monsterQuirkMods,
  statAt,
  type SpawnContext,
} from '@/lib/monster-stats';
import type { DungeonRank, MonstersFile } from '@contracts';

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
      expect(
        combatStatAt('buff_chance', EFF, { level: 100 }, undefined, q).combat,
        type,
      ).toBeLessThan(EFF.max);
    }
  });

  it('nuls pour `monster` et `named` : la stat reste celle du templet', () => {
    for (const type of ['monster', 'named']) {
      const q = monsterQuirkMods(type, mods);
      expect(q, type).toEqual({});
      expect(combatStatAt('buff_chance', EFF, { level: 100 }, undefined, q).combat, type).toBe(
        EFF.max,
      );
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

describe('combatStatAt — passif de fiche et quirks au taux de buff (`CalcFinalStat`)', () => {
  const DEF = { min: 50, max: 430 };
  const RES = { min: 100, max: 300 };

  it('DEF +1000 % et un quirk sur la même stat : UN taux sommé, une troncature', () => {
    const { sheet, combat } = combatStatAt(
      'def',
      DEF,
      { level: 30 },
      { def: { rate: 10000 } },
      { def: -100 },
    );
    expect(combat).toBe(Math.trunc((sheet * (1000 + 10000 - 100)) / 1000));
    // Deux passes (l'ancienne application à part des quirks) donneraient autre chose.
    expect(combat).not.toBe(Math.trunc((Math.trunc((sheet * 11000) / 1000) * 900) / 1000));
  });

  it('RES −90 % et la réduction des quirks : un seul taux, plancher 0', () => {
    const { sheet, combat } = combatStatAt(
      'buff_resist',
      RES,
      { level: 100 },
      { buff_resist: { rate: -900 } },
      { buff_resist: -200 },
    );
    expect(sheet).toBeGreaterThan(0);
    expect(combat).toBe(Math.max(0, Math.trunc((sheet * (1000 - 900 - 200)) / 1000)));
    expect(combat).toBe(0);
  });

  it('plats et taux : `div1000((fiche + plats) × (1000 + taux))`', () => {
    expect(combatStat(1000, { flat: 50, rate: 300 })).toBe(Math.trunc((1050 * 1300) / 1000));
    expect(combatStat(1000, { flat: 0, rate: 0 })).toBe(1000);
  });

  it('porteur de 165301 (Vladi Max) : DEF de combat = 11 × fiche, la fiche en infobulle', () => {
    const m = getMonster('4244004')!;
    expect(m.statPremium?.def?.rate).toBe(10000);
    const ctx = { level: m.spawns![0].level };
    const { sheet, combat } = combatStatAt('def', m.stats.def, ctx, m.statPremium);
    expect(combat).toBe(Math.trunc(sheet * 11));
    expect(sheet).not.toBe(combat);
  });

  it('monstre sans passif ni quirk : combat = fiche (pas d’infobulle)', () => {
    const monsters = monstersData as unknown as MonstersFile;
    const plain = Object.values(monsters).find((m) => !m.statPremium && m.type === 'monster')!;
    for (const [slug, r] of Object.entries(plain.stats)) {
      const v = combatStatAt(slug, r, { level: 80 }, plain.statPremium, {});
      expect(v.combat, slug).toBe(v.sheet);
    }
  });

  it('PV REMPLACÉS (bossHp, overgrade) : le taux de buff ne s’y applique pas (`SetTempMaxValue`)', () => {
    const HP = { min: 1000, max: 100_000 };
    const premium = { hp: { rate: 1000 } };
    const own = combatStatAt('hp', HP, { level: 50 }, premium);
    expect(own.combat).toBe(own.sheet * 2);
    const boss = combatStatAt('hp', HP, { level: 50, bossHp: 2_000_000 }, premium);
    expect(boss).toEqual({ sheet: 2_000_000, combat: 2_000_000 });
    const og = combatStatAt('hp', HP, { level: 50, bossHp: 55_000, overGrade: 1 }, premium);
    expect(og.combat).toBe(og.sheet);
  });

  it('CRIT d’un monstre borné à 1000 (`SetFinalValue`)', () => {
    const v = combatStatAt(
      'critical_rate',
      { min: 900, max: 900 },
      { level: 1 },
      {
        critical_rate: { flat: 300 },
      },
    );
    expect(v.combat).toBe(1000);
  });
});

describe('statAt — PV d’overgrade en float32 (`CGuildRaidSpawnData.GetCharacterData`)', () => {
  // Réimplémentation À PART de l'expression du client :
  // FloorToInt((float)PV × (1f + (float)(300 × og) × 0.001f)).
  const f = Math.fround;
  const client = (hp: number, og: number): number =>
    Math.floor(f(f(hp) * f(1 + f(f(GUILD_RAID_OVERGRADE_RATES.hp * og) * f(0.001)))));

  it('égale au client sur toute une plage de PV × overgrade', () => {
    for (const hp of [55_000, 71_500, 123_457, 999_999, 4_500_000])
      for (let og = 1; og <= 90; og++)
        expect(
          statAt('hp', { min: 0, max: 0 }, { level: 1, bossHp: hp, overGrade: og }),
          `${hp}/${og}`,
        ).toBe(client(hp, og));
  });

  it('55 000 × 1,3 : le produit non arrondi de l’ancienne expression sortait 1 de moins', () => {
    expect(statAt('hp', { min: 0, max: 0 }, { level: 1, bossHp: 55_000, overGrade: 1 })).toBe(
      client(55_000, 1),
    );
    const before = Math.floor(f(1 + (1 * GUILD_RAID_OVERGRADE_RATES.hp) / 1000) * f(55_000));
    expect(client(55_000, 1) - before).toBe(1);
  });
});

describe('formatMonsterStat — EFF/RES bruts, le reste selon l’échelle', () => {
  it('EFF/RES (et leurs alias de l’extracteur) en valeur brute, jamais en %', () => {
    expect(formatMonsterStat('buff_chance', 210, { buff_chance: 'percent' })).toBe('210');
    expect(formatMonsterStat('effectiveness', 210, { effectiveness: 'percent' })).toBe('210');
  });

  it('un taux du contrat reste en %', () => {
    expect(formatMonsterStat('critical_rate', 350, { critical_rate: 'percent' })).toBe('35%');
  });
});
