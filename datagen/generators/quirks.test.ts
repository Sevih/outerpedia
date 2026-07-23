/**
 * Invariants du générateur quirks sur `data/generated/quirks.json` committé
 * (modèle progression/singularity) : les 5 arbres d'Awakening sont un graphe
 * dérivé silencieusement des tables (groupes → nœuds → niveaux) — une dérive
 * rendrait un arbre cassé (main manquant, niveaux désordonnés) sans symptôme.
 *
 * Pas de cœur pur module-level (tout en closures sur les tables) → invariants
 * seuls. Tourne SANS `.gamedata` (rien n'appelle buildQuirks).
 */
import { describe, expect, it } from 'vitest';
import quirksData from '../../data/generated/quirks.json';
import type { QuirksData } from './quirks';

const q = quirksData as unknown as QuirksData;
const CATEGORY_KEYS = ['pve', 'class', 'elemental', 'utility', 'adventure'];
const ELEMENTS = new Set(['earth', 'water', 'fire', 'light', 'dark']);
const CLASSES = new Set(['defender', 'striker', 'ranger', 'mage', 'healer']);

describe('quirks.json — catégories', () => {
  it('clés connues, triées par ordre canonique', () => {
    const keys = q.categories.map((c) => c.key);
    expect(keys.every((k) => CATEGORY_KEYS.includes(k))).toBe(true);
    const orders = keys.map((k) => CATEGORY_KEYS.indexOf(k));
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });
});

describe('quirks.json — arbres & nœuds', () => {
  it('chaque arbre : UN main = mainId ∈ nœuds ; clé element/class valide', () => {
    const bad: string[] = [];
    for (const c of q.categories) {
      for (const t of c.trees) {
        const ids = new Set(t.nodes.map((n) => n.id));
        if (!ids.has(t.mainId)) bad.push(`${c.key}/${t.mainId} : mainId hors nœuds`);
        const mains = t.nodes.filter((n) => n.type === 'main');
        if (mains.length !== 1) bad.push(`${c.key}/${t.mainId} : ${mains.length} main(s)`);
        else if (mains[0].id !== t.mainId) bad.push(`${c.key}/${t.mainId} : main.id ≠ mainId`);
        if (c.key === 'elemental' && !ELEMENTS.has(t.key)) bad.push(`${c.key} : clé « ${t.key} »`);
        if (c.key === 'class' && !CLASSES.has(t.key)) bad.push(`${c.key} : clé « ${t.key} »`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('chaque nœud : type valide, maxLevel = |levels|, niveaux croissants', () => {
    const bad: string[] = [];
    for (const c of q.categories) {
      for (const t of c.trees) {
        for (const n of t.nodes) {
          if (n.type !== 'main' && n.type !== 'normal')
            bad.push(`${c.key}/${n.id} : type « ${n.type} »`);
          if (n.maxLevel !== n.levels.length)
            bad.push(`${c.key}/${n.id} : maxLevel ${n.maxLevel} ≠ ${n.levels.length}`);
          let prev = -1;
          for (const l of n.levels) {
            if (l.level <= prev) bad.push(`${c.key}/${n.id} : niveau ${l.level} après ${prev}`);
            prev = l.level;
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('coûts d’item : id et count > 0 (jamais de ligne vide)', () => {
    const bad: string[] = [];
    for (const c of q.categories) {
      for (const t of c.trees) {
        for (const n of t.nodes) {
          for (const l of n.levels) {
            for (const it of l.items) {
              if (!it.id || it.id === '0' || it.count <= 0)
                bad.push(`${c.key}/${n.id}/L${l.level}`);
            }
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
