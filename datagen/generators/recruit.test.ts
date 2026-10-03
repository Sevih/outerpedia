/**
 * Tests du générateur recruit — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒURS PURS en synthétique : `ratesOf` (la vraie logique — des POIDS
 *      bruts normalisés en %, filtrés par groupe et par type de recette),
 *      `poolOf` (le pool hors focus d'un groupe : vedette exclue, un palier
 *      par rareté, poids émis seulement s'ils départagent) et `isoDate`
 *      (troncature de la date du jeu). Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/recruit.json` committé
 *      (modèle encounters.test.ts) : les 5 types documentés, des taux qui
 *      somment à 100 %, et chaque perso (pool custom, pool hors focus, pickup
 *      bannière) doit exister dans characters.json. Une dérive rendrait un
 *      guide de bannière ou le pull simulator faux sans aucun symptôme.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildRecruit()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import recruitData from '../../data/generated/recruit.json';
import charactersData from '../../data/generated/characters.json';
import itemsData from '../../data/generated/items.json';
import type { LangDict } from '../lib/lang';
import type { Row } from '../lib/tables';
import { isoDate, poolOf, ratesOf, type RecruitData, type RecruitKind } from './recruit';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('isoDate — date du jeu tronquée', () => {
  it('garde les 10 premiers caractères (jour), coupe l’heure', () => {
    expect(isoDate('2026-07-14  00:00:00')).toBe('2026-07-14');
    expect(isoDate('2026-07-14')).toBe('2026-07-14');
  });

  it('vide / absent → chaîne vide (pas de crash)', () => {
    expect(isoDate('')).toBe('');
    expect(isoDate(undefined as unknown as string)).toBe('');
  });
});

describe('ratesOf — poids normalisés en %', () => {
  const tsys = new Map<string, LangDict>();

  it('normalise les poids en % (somme 100) et préserve titleKey', () => {
    const rows: Row[] = [
      { GroupID: 'g', RecipeType: 'CHARACTER', Title: 'T3', NormalRate: '25', ConfirmRate: '25' },
      { GroupID: 'g', RecipeType: 'CHARACTER', Title: 'T2', NormalRate: '975', ConfirmRate: '975' },
    ];
    const out = ratesOf(rows, 'g', tsys);
    expect(out.map((r) => r.titleKey)).toEqual(['T3', 'T2']);
    expect(out.map((r) => r.percent)).toEqual([2.5, 97.5]); // 25/1000, 975/1000
    expect(out.reduce((s, r) => s + r.percent, 0)).toBe(100);
  });

  it('ne compte QUE le groupe demandé et les recettes CHARACTER', () => {
    const rows: Row[] = [
      { GroupID: 'g', RecipeType: 'CHARACTER', Title: 'A', NormalRate: '50', ConfirmRate: '0' },
      { GroupID: 'g', RecipeType: 'CHARACTER', Title: 'B', NormalRate: '50', ConfirmRate: '100' },
      { GroupID: 'other', RecipeType: 'CHARACTER', Title: 'X', NormalRate: '99', ConfirmRate: '0' },
      { GroupID: 'g', RecipeType: 'ASSET', Title: 'Y', NormalRate: '99', ConfirmRate: '0' },
    ];
    const out = ratesOf(rows, 'g', tsys);
    expect(out.map((r) => r.titleKey)).toEqual(['A', 'B']); // autre groupe + ASSET écartés
    expect(out.map((r) => r.percent)).toEqual([50, 50]);
    expect(out.map((r) => r.confirmPercent)).toEqual([0, 100]);
  });

  it("recipeType ITEM : les paliers d'équipement (Dimensional Supply)", () => {
    const rows: Row[] = [
      { GroupID: 'g', RecipeType: 'ITEM', Title: 'GEAR', NormalRate: '20', ConfirmRate: '20' },
      { GroupID: 'g', RecipeType: 'ITEM', Title: 'JUNK', NormalRate: '980', ConfirmRate: '980' },
      { GroupID: 'g', RecipeType: 'CHARACTER', Title: 'X', NormalRate: '99', ConfirmRate: '0' },
    ];
    const out = ratesOf(rows, 'g', tsys, { recipeType: 'ITEM' });
    expect(out.map((r) => r.titleKey)).toEqual(['GEAR', 'JUNK']); // CHARACTER écarté
    expect(out.map((r) => r.percent)).toEqual([2, 98]);
  });

  it('drops : part du palier, et rien du tout si le palier rend de l’equipement', () => {
    const rows: Row[] = [
      {
        GroupID: 'g',
        ID: 'sac',
        RecipeType: 'ITEM',
        Title: 'SAC',
        NormalRate: '80',
        ConfirmRate: '0',
      },
      {
        GroupID: 'g',
        ID: 'gear',
        RecipeType: 'ITEM',
        Title: 'GEAR',
        NormalRate: '20',
        ConfirmRate: '0',
      },
    ];
    const itemRecipes: Row[] = [
      { GradeGroupID: 'sac', ItemID: 'i1', Count: '10', Rate: '3' },
      { GradeGroupID: 'sac', ItemID: 'i2', Count: '1', Rate: '1' },
      { GradeGroupID: 'gear', ItemID: 'eq1', Count: '1', Rate: '1' },
    ];
    const out = ratesOf(rows, 'g', tsys, {
      recipeType: 'ITEM',
      itemRecipes,
      isEquip: (id) => id === 'eq1',
    });
    // Le sac vaut 80 % : ses lots s'y partagent 3/4 et 1/4.
    expect(out[0].drops).toEqual([
      { itemId: 'i1', count: 10, percent: 60 },
      { itemId: 'i2', count: 1, percent: 20 },
    ]);
    // Le palier d'equipement rend « une piece », pas un lot nomme.
    expect(out[1].drops).toBeUndefined();
  });

  it('drops : absents quand la table des lots n’est pas fournie', () => {
    const rows: Row[] = [
      {
        GroupID: 'g',
        ID: 'x',
        RecipeType: 'CHARACTER',
        Title: 'T',
        NormalRate: '100',
        ConfirmRate: '100',
      },
    ];
    expect(ratesOf(rows, 'g', tsys)[0].drops).toBeUndefined();
  });

  it('groupe sans recette du type demandé → jette (pas de division par 0)', () => {
    expect(() => ratesOf([], 'g', tsys)).toThrow();
    expect(() =>
      ratesOf([{ GroupID: 'g', RecipeType: 'CHARACTER', Title: 'Z', NormalRate: '0' }], 'g', tsys),
    ).toThrow();
  });
});

describe('poolOf — pool hors focus d’un groupe', () => {
  const tier = (ID: string, Title: string, RecipeType = 'CHARACTER', GroupID = 'g'): Row => ({
    ID,
    GroupID,
    RecipeType,
    Title,
  });
  const grades: Row[] = [
    tier('focus', 'SYS_RECRUIT_RATEINFO_TITLE_05'),
    tier('one', 'SYS_RECRUIT_RATEINFO_TITLE_01'),
    tier('three', 'SYS_RECRUIT_RATEINFO_TITLE_03'),
    tier('asset', 'SYS_RECRUIT_RATEINFO_TITLE_03', 'ASSET'),
    tier('elsewhere', 'SYS_RECRUIT_RATEINFO_TITLE_03', 'CHARACTER', 'other'),
  ];
  const row = (GradeGroupID: string, CharacterID: string, BasicStar: string, Rate = '1'): Row => ({
    GradeGroupID,
    CharacterID,
    BasicStar,
    Rate,
  });

  it('vedette, autre groupe et recettes non-CHARACTER écartés ; 3★ d’abord, ids triés', () => {
    const recipes: Row[] = [
      row('focus', 'c9', '3'),
      row('three', 'c2', '3'),
      row('three', 'c1', '3'),
      row('one', 'c5', '1'),
      row('asset', 'c7', '3'),
      row('elsewhere', 'c8', '3'),
    ];
    expect(poolOf(grades, recipes, 'g')).toEqual([
      { rarity: 3, characterIds: ['c1', 'c2'] },
      { rarity: 1, characterIds: ['c5'] },
    ]);
  });

  it('poids : émis par perso quand ils départagent, absents quand ils sont égaux', () => {
    const recipes: Row[] = [
      row('three', 'c2', '3', '2'),
      row('three', 'c1', '3', '1'),
      row('one', 'c5', '1', '4'),
      row('one', 'c6', '1', '4'),
    ];
    const [three, one] = poolOf(grades, recipes, 'g');
    expect(three.weights).toEqual({ c1: 1, c2: 2 });
    expect(one.weights).toBeUndefined();
  });

  it('palier illisible → jette (vide, raretés mêlées, doublon, deux paliers de même rareté)', () => {
    expect(() => poolOf(grades, [row('three', 'c1', '3')], 'g')).toThrow(/rareté illisible/); // « one » est vide
    const base = [row('one', 'c5', '1')];
    expect(() =>
      poolOf(grades, [...base, row('three', 'c1', '3'), row('three', 'c2', '2')], 'g'),
    ).toThrow(/rareté illisible/);
    expect(() =>
      poolOf(grades, [...base, row('three', 'c1', '3'), row('three', 'c1', '3')], 'g'),
    ).toThrow(/en double/);
    expect(() => poolOf(grades, [...base, row('three', 'c1', '1')], 'g')).toThrow(/deux paliers/);
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const recruit = recruitData as unknown as RecruitData;
const characterIds = new Set(Object.keys(charactersData as Record<string, unknown>));
const KINDS: RecruitKind[] = ['custom', 'pickup', 'premium', 'limited', 'equipment'];
const BANNER_KINDS = new Set(['seasonal', 'fes', 'seasonal-selection', 'fes-selection']);

describe('recruit.json — pool custom', () => {
  it('non vide, trié, chaque perso existe dans characters.json', () => {
    expect(recruit.customPool.length).toBeGreaterThan(0);
    expect([...recruit.customPool].sort((a, b) => a.localeCompare(b))).toEqual(recruit.customPool);
    const orphans = recruit.customPool.filter((id) => !characterIds.has(id));
    expect(orphans).toEqual([]);
  });
});

describe('recruit.json — pool hors focus par type', () => {
  const characters = charactersData as unknown as Record<string, { rarity: number }>;
  const poolOfKind = (kind: RecruitKind) => recruit.kinds.find((k) => k.kind === kind)?.pool;

  it('un palier 3★/2★/1★ par bannière de persos, aucun pour equipment', () => {
    for (const kind of ['custom', 'pickup', 'premium', 'limited'] as const) {
      expect(poolOfKind(kind)?.map((t) => t.rarity)).toEqual([3, 2, 1]);
    }
    expect(poolOfKind('equipment')).toBeUndefined();
  });

  it('ids triés, sans doublon, connus de characters.json et de la rareté du palier', () => {
    const bad: string[] = [];
    for (const k of recruit.kinds) {
      for (const t of k.pool ?? []) {
        const ids = t.characterIds;
        if (!ids.length) bad.push(`${k.kind}/${t.rarity}★ : palier vide`);
        if ([...ids].sort((a, b) => a.localeCompare(b)).join() !== ids.join())
          bad.push(`${k.kind}/${t.rarity}★ : non trié`);
        if (new Set(ids).size !== ids.length) bad.push(`${k.kind}/${t.rarity}★ : doublon`);
        for (const id of ids) {
          if (!characters[id]) bad.push(`${k.kind}/${t.rarity}★ : perso inconnu ${id}`);
          else if (characters[id].rarity !== t.rarity)
            bad.push(`${k.kind}/${t.rarity}★ : ${id} est un ${characters[id].rarity}★`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('poids : couvrent exactement leur palier, positifs, et départagent vraiment', () => {
    const bad: string[] = [];
    for (const k of recruit.kinds) {
      for (const t of k.pool ?? []) {
        if (!t.weights) continue;
        const values = Object.values(t.weights);
        if (Object.keys(t.weights).sort().join() !== [...t.characterIds].sort().join())
          bad.push(`${k.kind}/${t.rarity}★ : poids ≠ ids du palier`);
        if (values.some((v) => !(v > 0))) bad.push(`${k.kind}/${t.rarity}★ : poids ≤ 0`);
        if (new Set(values).size < 2) bad.push(`${k.kind}/${t.rarity}★ : poids tous égaux`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('le pool du Custom Recruit est `customPool`, palier par palier', () => {
    const ids = (poolOfKind('custom') ?? []).flatMap((t) => t.characterIds);
    expect([...ids].sort((a, b) => a.localeCompare(b))).toEqual(recruit.customPool);
  });
});

describe('recruit.json — contenu des paliers (lots)', () => {
  const itemIds = new Set(Object.keys(itemsData as Record<string, unknown>));

  it('chaque lot existe au catalogue et somme au taux de son palier', () => {
    const bad: string[] = [];
    let seen = 0;
    for (const k of recruit.kinds) {
      for (const r of k.rates) {
        if (!r.drops) continue;
        seen += 1;
        for (const d of r.drops) {
          if (!itemIds.has(d.itemId))
            bad.push(`${k.kind}/${r.titleKey} : item ${d.itemId} inconnu`);
          if (d.count < 1) bad.push(`${k.kind}/${r.titleKey} : count ${d.count}`);
        }
        const sum = r.drops.reduce((s, d) => s + d.percent, 0);
        if (Math.abs(sum - r.percent) > 0.01) {
          bad.push(`${k.kind}/${r.titleKey} : lots ${sum} vs palier ${r.percent}`);
        }
      }
    }
    expect(bad).toEqual([]);
    // Garde anti-régression silencieuse : la Dimensional Supply en a trois.
    expect(seen).toBeGreaterThan(0);
  });
});

describe('recruit.json — fiches par type', () => {
  it('exactement les 5 types documentés (dont equipment = Dimensional Supply)', () => {
    expect(recruit.kinds.map((k) => k.kind)).toEqual(KINDS);
  });

  it('taux : non vides, chacun dans [0,100], somme ≈ 100 %', () => {
    const bad: string[] = [];
    for (const k of recruit.kinds) {
      if (!k.rates.length) bad.push(`${k.kind} : 0 taux`);
      for (const r of k.rates) {
        if (r.percent < 0 || r.percent > 100) bad.push(`${k.kind} : percent ${r.percent}`);
        if (r.confirmPercent < 0 || r.confirmPercent > 100)
          bad.push(`${k.kind} : confirm ${r.confirmPercent}`);
      }
      const sum = k.rates.reduce((s, r) => s + r.percent, 0);
      if (Math.abs(sum - 100) > 1) bad.push(`${k.kind} : somme ${sum}`);
    }
    expect(bad).toEqual([]);
  });

  it('prix/tickets/free cohérents (≥ 0, ticketCost ≥ 1)', () => {
    const bad: string[] = [];
    for (const k of recruit.kinds) {
      if (k.price1 < 0 || k.price10 < 0) bad.push(`${k.kind} : prix négatif`);
      if (k.ticketCost < 1) bad.push(`${k.kind} : ticketCost ${k.ticketCost}`);
      if (k.freeCount < 0) bad.push(`${k.kind} : freeCount ${k.freeCount}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('recruit.json — apparitions bannière', () => {
  const ISO = /^\d{4}-\d{2}-\d{2}$/;

  it('perso connu, kind valide, dates ISO (end ouvert = « 0 »), start ≤ end, trié', () => {
    // `end` peut valoir « 0 » : bannière SÉLECTION sans fin fixée en table
    // (rerun ouvert) — le générateur passe EndDate tel quel. `start` est
    // toujours une vraie date.
    const bad: string[] = [];
    let prevStart = '';
    for (const b of recruit.banners) {
      if (!characterIds.has(b.characterId)) bad.push(`perso inconnu ${b.characterId}`);
      if (!BANNER_KINDS.has(b.kind)) bad.push(`kind « ${b.kind} » (${b.characterId})`);
      if (!ISO.test(b.start)) bad.push(`start non ISO ${b.characterId} : ${b.start}`);
      if (b.end !== '0' && !ISO.test(b.end))
        bad.push(`end non ISO/ouvert ${b.characterId} : ${b.end}`);
      if (b.end !== '0' && ISO.test(b.start) && b.start > b.end)
        bad.push(`start > end ${b.characterId} : ${b.start}..${b.end}`);
      if (b.start < prevStart) bad.push(`non trié : ${b.start} après ${prevStart}`);
      prevStart = b.start;
    }
    expect(bad).toEqual([]);
  });
});
