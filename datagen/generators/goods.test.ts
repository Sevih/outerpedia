/**
 * Tests du générateur goods (monnaies) — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒUR PUR en synthétique : `iconNameCandidates` — la génération de noms
 *      d'icône par convention (TitleCase + variantes de zéro-padding du numéro
 *      final), le seul bout de logique de ce générateur qui ne touche ni fs ni
 *      dump, et exactement le genre qui casse en silence (`_1` vs `_01`).
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/` committé : `assetTypes`
 *      (glossaires) mappe des ids numériques vers des clés `SYS_ASSET_*` qui
 *      DOIVENT exister comme entrées `goods` du catalogue (items.json) —
 *      buildAssetTypes ne sort que les clés adossées à un goods, l'invariant
 *      re-vérifie la cohérence sur la donnée servie.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildGoods()`/`buildAssetTypes()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import itemsData from '../../data/generated/items.json';
import glossariesData from '../../data/generated/glossaries.json';
import { iconNameCandidates } from './goods';

// ─── 1. Cœur pur (synthétique) ───────────────────────────────────────────────

describe('iconNameCandidates — convention de nom d’icône', () => {
  it('met le REST en TitleCase (1re lettre haute, reste bas)', () => {
    expect(iconNameCandidates('CRISTAL')[0]).toBe('Cristal');
    expect(iconNameCandidates('ACC_EXP')[0]).toBe('Acc_Exp');
  });

  it('propose le numéro final zéro-padé ET dé-padé (les deux nommages d’asset)', () => {
    const c1 = iconNameCandidates('EVENT_COIN_1');
    expect(c1).toContain('Event_Coin_01'); // padé sur 2
    expect(c1).toContain('Event_Coin_1'); // brut
    const c2 = iconNameCandidates('ALWAYS_EVENT_COIN_02');
    expect(c2).toContain('Always_Event_Coin_2'); // dé-padé
  });

  it('sans numéro final : les 3 candidats coïncident (pas de faux variant)', () => {
    expect(iconNameCandidates('GOLD')).toEqual(['Gold', 'Gold', 'Gold']);
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

interface Goods {
  kind: string;
  name?: { en?: string };
  grade?: string;
}
const items = itemsData as unknown as Record<string, Goods>;
const glossaries = glossariesData as unknown as {
  assetTypes: Record<string, string>;
  grades: Record<string, unknown>;
};
const goodsEntries = Object.entries(items).filter(([, v]) => v.kind === 'goods');
const validGrades = new Set(Object.keys(glossaries.grades));

describe('items.json — entrées goods', () => {
  it('des monnaies existent, chacune nommée et de grade connu', () => {
    expect(goodsEntries.length).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const [id, g] of goodsEntries) {
      if (!g.name?.en) bad.push(`${id} : sans nom EN`);
      if (!g.grade || !validGrades.has(g.grade)) bad.push(`${id} : grade « ${g.grade} »`);
    }
    expect(bad).toEqual([]);
  });
});

describe('glossaries.assetTypes ↔ goods — invariant référentiel', () => {
  it('ids numériques uniques, valeurs `SYS_ASSET_*`', () => {
    const ids = Object.keys(glossaries.assetTypes);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    const badVal = Object.values(glossaries.assetTypes).filter((v) => !v.startsWith('SYS_ASSET_'));
    expect(badVal).toEqual([]);
  });

  it('chaque monnaie d’assetTypes existe comme entrée goods du catalogue', () => {
    const missing: string[] = [];
    for (const [id, key] of Object.entries(glossaries.assetTypes)) {
      if (items[key]?.kind !== 'goods') missing.push(`${id} → ${key}`);
    }
    expect(missing).toEqual([]);
  });
});
