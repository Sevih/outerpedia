/**
 * Tests du générateur recruit — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒURS PURS en synthétique : `ratesOf` (la vraie logique — des POIDS
 *      bruts normalisés en %, filtrés par groupe et par recette CHARACTER) et
 *      `isoDate` (troncature de la date du jeu). Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/recruit.json` committé
 *      (modèle encounters.test.ts) : les 4 types documentés, des taux qui
 *      somment à 100 %, et chaque perso (pool custom, pickup bannière) doit
 *      exister dans characters.json. Une dérive rendrait un guide de bannière
 *      faux sans aucun symptôme.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildRecruit()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import recruitData from '../../data/generated/recruit.json';
import charactersData from '../../data/generated/characters.json';
import type { LangDict } from '../lib/lang';
import type { Row } from '../lib/tables';
import { isoDate, ratesOf, type RecruitData, type RecruitKind } from './recruit';

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

describe('ratesOf — poids CHARACTER normalisés en %', () => {
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

  it('groupe sans recette CHARACTER exploitable → jette (pas de division par 0)', () => {
    expect(() => ratesOf([], 'g', tsys)).toThrow();
    expect(() =>
      ratesOf([{ GroupID: 'g', RecipeType: 'CHARACTER', Title: 'Z', NormalRate: '0' }], 'g', tsys),
    ).toThrow();
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const recruit = recruitData as unknown as RecruitData;
const characterIds = new Set(Object.keys(charactersData as Record<string, unknown>));
const KINDS: RecruitKind[] = ['custom', 'pickup', 'premium', 'limited'];
const BANNER_KINDS = new Set(['seasonal', 'fes', 'seasonal-selection', 'fes-selection']);

describe('recruit.json — pool custom', () => {
  it('non vide, trié, chaque perso existe dans characters.json', () => {
    expect(recruit.customPool.length).toBeGreaterThan(0);
    expect([...recruit.customPool].sort((a, b) => a.localeCompare(b))).toEqual(recruit.customPool);
    const orphans = recruit.customPool.filter((id) => !characterIds.has(id));
    expect(orphans).toEqual([]);
  });
});

describe('recruit.json — fiches par type', () => {
  it('exactement les 4 types documentés (custom/pickup/premium/limited)', () => {
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
