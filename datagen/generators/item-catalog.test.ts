/**
 * Tests du générateur item-catalog (catalogue d'items unifié `items.json`) —
 * les DEUX registres :
 *
 *   1. CŒURS PURS en synthétique : `catalogCompare` (ordre canonique — ids
 *      numériques d'abord, puis texte ; c'est ce qui garantit un diff git stable
 *      au rebake ciblé de l'admin) et `applyCurated` (override curé nom/desc/
 *      icône/masquage). Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/items.json` committé : le
 *      fichier est TRIÉ par `catalogCompare`, chaque entrée a un `kind` connu et
 *      un nom (ou est masquée), les costumes portent le préfixe COSTUME_. Une
 *      dérive d'ordre = diff git parasite ; un kind faux casse le rendu.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI).
 */
import { describe, expect, it } from 'vitest';
import itemsData from '../../data/generated/items.json';
import { applyCurated, catalogCompare, COSTUME_PREFIX, type CatalogEntry } from './item-catalog';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('catalogCompare — ordre canonique du catalogue', () => {
  it('numérique par valeur (pas lexicographique), les nombres avant le texte', () => {
    expect(catalogCompare('2', '10')).toBeLessThan(0); // 2 < 10, pas "10" < "2"
    expect(catalogCompare('5', 'SYS_ASSET_GOLD')).toBeLessThan(0); // nombre avant texte
    expect(catalogCompare('SYS_ASSET_GOLD', '5')).toBeGreaterThan(0);
    expect(catalogCompare('COSTUME_1', 'SYS_ASSET_GOLD')).toBe(
      'COSTUME_1'.localeCompare('SYS_ASSET_GOLD'),
    );
  });

  it('tri complet d’un échantillon mixte', () => {
    const ids = ['SYS_ASSET_GOLD', '10', 'COSTUME_2', '2', 'ABC'];
    expect([...ids].sort(catalogCompare)).toEqual([
      '2',
      '10',
      'ABC',
      'COSTUME_2',
      'SYS_ASSET_GOLD',
    ]);
  });
});

describe('applyCurated — override curé sur une entrée', () => {
  const base: CatalogEntry = {
    kind: 'item',
    name: { en: 'Base', jp: '', kr: '', zh: '' },
    icon: 'ic_base',
    grade: 'normal',
    type: 'material',
    star: 1,
  };

  it('sans curation → entrée inchangée', () => {
    expect(applyCurated(base, undefined)).toEqual(base);
  });

  it('remplace nom/desc/icône, garde le reste', () => {
    const out = applyCurated(base, {
      name: { en: 'Cured', jp: '', kr: '', zh: '' },
      icon: 'ic_cured',
    });
    expect(out.name.en).toBe('Cured');
    expect(out.icon).toBe('ic_cured');
    expect(out.grade).toBe('normal'); // non touché
    expect(out.type).toBe('material');
  });

  it('hidden : true le pose, false l’efface (jamais `false` sérialisé)', () => {
    expect(applyCurated(base, { hidden: true }).hidden).toBe(true);
    expect(applyCurated(base, { hidden: false }).hidden).toBeUndefined();
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const items = itemsData as unknown as Record<string, CatalogEntry>;
const ids = Object.keys(items);
const KINDS = new Set(['item', 'goods', 'costume', 'custom']);

describe('items.json — invariants', () => {
  it('fichier TRIÉ par catalogCompare (diff git stable)', () => {
    expect(ids.length).toBeGreaterThan(0);
    expect([...ids].sort(catalogCompare)).toEqual(ids);
  });

  it('chaque entrée : kind connu, nom (ou masquée), grade/type/star bien typés', () => {
    const bad: string[] = [];
    for (const [id, e] of Object.entries(items)) {
      if (!KINDS.has(e.kind)) bad.push(`${id} : kind « ${e.kind} »`);
      if (!e.name?.en && !e.hidden) bad.push(`${id} : sans nom et non masqué`);
      if (typeof e.grade !== 'string' || typeof e.type !== 'string' || typeof e.star !== 'number')
        bad.push(`${id} : champs mal typés`);
    }
    expect(bad).toEqual([]);
  });

  it('cohérence kind↔id : costume = préfixe COSTUME_, goods = kind goods', () => {
    const bad: string[] = [];
    for (const [id, e] of Object.entries(items)) {
      if (e.kind === 'costume' && !id.startsWith(COSTUME_PREFIX))
        bad.push(`${id} : costume sans préfixe`);
      if (id.startsWith(COSTUME_PREFIX) && e.kind !== 'costume')
        bad.push(`${id} : préfixe COSTUME_ mais kind ${e.kind}`);
    }
    expect(bad).toEqual([]);
  });
});
