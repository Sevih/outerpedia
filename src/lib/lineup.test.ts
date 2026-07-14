import { describe, expect, it } from 'vitest';
import encountersData from '@data/generated/encounters.json';
import { lineupRows, rowMode, type LineupEntry } from '@/lib/lineup';

/**
 * La règle de rangement d'un combat. Elle se teste ICI, sans DOM : le rendu
 * (`MonsterLineup`) n'est qu'une traduction de ce qu'elle décide, et c'est la
 * DÉCISION qui peut pourrir en silence quand un mode arrive avec une composition
 * qu'on n'avait pas vue venir.
 */
const boss = (indexes?: number[]): LineupEntry => ({
  role: 'boss',
  ...(indexes ? { indexes } : {}),
});
const add = (indexes?: number[]): LineupEntry => ({ role: 'add', ...(indexes ? { indexes } : {}) });

describe('rowMode — une rangée, trois façons de la poser', () => {
  it('1 → pleine largeur, 2 → côte à côte, 3 et plus → compact', () => {
    expect(rowMode(1)).toBe('solo');
    expect(rowMode(2)).toBe('pair');
    expect(rowMode(3)).toBe('compact');
    // Skyward Tower Very Hard aligne jusqu'à 23 renforts : le compact est la
    // seule sortie, et il n'y a pas de seuil au-delà duquel la règle change.
    expect(rowMode(23)).toBe('compact');
  });
});

describe('lineupRows — le boss d’abord, ses renforts ensuite', () => {
  it('les deux phases d’un world boss se posent CÔTE À CÔTE', () => {
    const rows = lineupRows([boss(), boss()]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ role: 'boss', mode: 'pair' });
  });

  it('un boss et ses renforts : deux rangées, le boss en tête', () => {
    const rows = lineupRows([add(), boss(), add()]);
    expect(rows.map((r) => r.role)).toEqual(['boss', 'add']);
    // Le jeu liste ses monstres par POSITION sur le terrain : l'escorte peut
    // précéder le boss dans la donnée. Elle ne le précède jamais à l'écran.
    expect(rows[0]).toMatchObject({ mode: 'solo' });
    expect(rows[1]).toMatchObject({ mode: 'pair' });
  });

  it('trois renforts passent en vignettes, le boss reste déplié', () => {
    const rows = lineupRows([boss(), add(), add(), add()]);
    expect(rows[0]).toMatchObject({ role: 'boss', mode: 'solo' });
    expect(rows[1]).toMatchObject({ role: 'add', mode: 'compact' });
  });

  it('une rangée VIDE ne se rend pas (un combat sans renfort n’annonce rien)', () => {
    expect(lineupRows([boss()]).map((r) => r.role)).toEqual(['boss']);
  });
});

describe('lineupRows — les modes à stages font entrer et sortir les monstres', () => {
  const items = [boss([0, 1, 2]), add([2]), add([2])];

  it('au stage où ils sont absents, les renforts ne comptent pas', () => {
    const rows = lineupRows(items, 0);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ role: 'boss', mode: 'solo' });
  });

  it('au stage où ils arrivent, la rangée se reforme', () => {
    const rows = lineupRows(items, 2);
    expect(rows.map((r) => r.mode)).toEqual(['solo', 'pair']);
  });

  it('sans sélection (mode sans stages), tout le monde est là', () => {
    // Une carte qui porte des `indexes` posée hors d'un mode à stages ne doit
    // pas disparaître : la présence est une info du mode, pas une condition.
    expect(lineupRows(items, undefined).map((r) => r.items.length)).toEqual([1, 2]);
  });
});

describe('la règle couvre les compositions RÉELLES de la donnée', () => {
  it('toute rencontre du jeu se range sans cas particulier', () => {
    const dungeons = Object.values(
      encountersData as Record<string, { monsters?: { role: 'boss' | 'add' }[] }>,
    );
    const modes = new Set<string>();
    for (const d of dungeons) {
      if (!d.monsters?.length) continue;
      const rows = lineupRows(d.monsters.map((m) => ({ role: m.role })));
      // Toujours au moins une rangée, jamais une rangée vide, et le boss devant.
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r.items.length).toBeGreaterThan(0);
      if (rows.length === 2) expect(rows.map((r) => r.role)).toEqual(['boss', 'add']);
      for (const r of rows) modes.add(r.mode);
    }
    // Les trois façons de poser une rangée servent TOUTES dans la donnée réelle :
    // si l'une disparaissait, c'est que la règle ne décrit plus le jeu.
    expect([...modes].sort()).toEqual(['compact', 'pair', 'solo']);
  });
});
