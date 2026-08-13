import { describe, expect, it } from 'vitest';
import { importRoster, type ImportHero } from './roster-import';
import type { HeroProgress } from './engine';

/**
 * L'import est la FRONTIÈRE de l'outil : il reçoit un fichier écrit par un autre
 * programme. Ce qu'on vérifie ici, c'est qu'un fichier faux n'entre pas, et
 * qu'un fichier approximatif entre BORNÉ plutôt que de casser l'écran.
 */

const max = (over: Partial<HeroProgress> = {}): HeroProgress => ({
  level: 120,
  skills: [5, 5, 5, 5],
  fusion: 0,
  affinity: 100,
  transcend: 6,
  ee: [10],
  ...over,
});

/** Un 3★ ordinaire : échelle 3→9, un seul équipement exclusif. */
const solo: ImportHero = { id: '2000001', stars: [3, 4, 5, 6, 7, 8, 9], max: max() };
/** Un couple base ⇄ Core Fusion : deux EE, cinq paliers de fusion. */
const base: ImportHero = { ...solo, id: '2000043', fusionId: '2700043' };
const fused: ImportHero = {
  id: '2700043',
  fusionSteps: 5,
  stars: [3, 4, 5, 6, 7, 8, 9],
  max: max({ fusion: 5, ee: [10, 10] }),
};
const byId = new Map<string, ImportHero>([
  [solo.id, solo],
  [base.id, base],
  [fused.id, fused],
]);

const file = (heroes: Record<string, unknown>) => ({
  format: 'outerpedia:hero-tracker',
  version: 1,
  heroes,
});

describe('importRoster', () => {
  it('refuse un fichier qui n’est pas un roster', () => {
    expect(() => importRoster({ hello: 'world' }, byId)).toThrow(/format/);
    expect(() => importRoster(null, byId)).toThrow(/format/);
    // Une version future doit échouer PLUTÔT que d'écraser un roster avec une
    // lecture approximative.
    expect(() => importRoster({ format: 'outerpedia:hero-tracker', version: 2 }, byId)).toThrow(
      /version/,
    );
  });

  it('transpose un héros ordinaire, cible au plafond', () => {
    const r = importRoster(
      file({
        '2000001': {
          level: 100,
          skills: { s1: 5, s2: 4, s3: 3, chain_passive: 2 },
          affinity: 20,
          transcend_star: 6,
          ee: 5,
        },
      }),
      byId,
    );
    expect(r.imported).toBe(1);
    expect(r.heroes['2000001'].state).toEqual({
      level: 100,
      skills: [5, 4, 3, 2],
      fusion: 0,
      affinity: 20,
      transcend: 3, // étoile interne 6 = 5★ = quatrième palier d'une échelle qui part à 3
      ee: [5],
    });
    expect(r.heroes['2000001'].target).toEqual(max());
  });

  it('place une Core Fusion sous l’id du fusionné et écarte sa base', () => {
    const r = importRoster(
      file({
        '2000043': {
          level: 120,
          affinity: 100,
          transcend_star: 9,
          ee: 10,
          core_fusion: { level: 3, ee: 5 },
        },
      }),
      byId,
    );
    expect(Object.keys(r.heroes)).toEqual(['2700043']);
    expect(r.fused).toEqual({ '2000043': true });
    // L'EE hérité d'abord, celui du fusionné ensuite — l'ordre des barres.
    expect(r.heroes['2700043'].state.ee).toEqual([10, 5]);
    expect(r.heroes['2700043'].state.fusion).toBe(3);
    expect(r.heroes['2700043'].state.transcend).toBe(6);
  });

  it('un fusionné possédé a franchi le palier 1, même si le fichier dit 0', () => {
    const r = importRoster(file({ '2000043': { core_fusion: { level: 0 } } }), byId);
    expect(r.heroes['2700043'].state.fusion).toBe(1);
  });

  it('signale une Core Fusion que le jeu ne connaît pas, et garde la base', () => {
    const r = importRoster(file({ '2000001': { core_fusion: { level: 5 } } }), byId);
    expect(r.unknown).toEqual(['2000001.core_fusion']);
    expect(Object.keys(r.heroes)).toEqual(['2000001']);
    expect(r.fused).toEqual({});
  });

  it('laisse de côté ce qui n’est pas possédé, et compte les inconnus', () => {
    const r = importRoster(file({ '2000001': { owned: false }, '9999999': { level: 120 } }), byId);
    expect(r.imported).toBe(0);
    expect(r.ignored).toBe(1);
    expect(r.unknown).toEqual(['9999999']);
  });

  it('borne au lieu de rejeter : un fichier approximatif entre quand même', () => {
    const r = importRoster(
      file({
        '2000001': {
          level: 999,
          skills: { s1: 0, s2: 42, s3: 'trois', chain_passive: null },
          affinity: -5,
          ee: 99,
          transcend_star: 'six',
        },
      }),
      byId,
    );
    expect(r.heroes['2000001'].state).toEqual({
      level: 120,
      skills: [1, 5, 1, 1],
      fusion: 0,
      affinity: 1,
      transcend: 0,
      ee: [10],
    });
  });

  it('un champ absent vaut son plancher', () => {
    const r = importRoster(file({ '2000001': {} }), byId);
    expect(r.heroes['2000001'].state).toEqual({
      level: 5,
      skills: [1, 1, 1, 1],
      fusion: 0,
      affinity: 1,
      transcend: 0,
      ee: [0],
    });
  });

  it('une étoile en deçà de la rareté de base ne descend pas sous le premier palier', () => {
    const r = importRoster(file({ '2000001': { transcend_star: 1 } }), byId);
    expect(r.heroes['2000001'].state.transcend).toBe(0);
  });

  it('une étoile au-delà du dernier palier s’arrête au dernier', () => {
    const r = importRoster(file({ '2000001': { transcend_star: 99 } }), byId);
    expect(r.heroes['2000001'].state.transcend).toBe(6);
  });
});
