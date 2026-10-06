/**
 * Tests de l'APPLICATION DES RETOUCHES MINEURES (`review.ts`) : l'écriture
 * ciblée dans le committé déclenchée par « Appliquer les retouches mineures ».
 * Destructif par nature (réécrit un fichier validé), d'où les invariants :
 *   - seules les entités typo ou mineures prennent la valeur fraîche ;
 *   - un vrai écart, un nouveau, un disparu sont laissés tels quels ;
 *   - rien n'est écrit quand rien n'est à appliquer.
 *
 * `acceptMinorIn` tourne sur un dossier temporaire avec une cible factice (le
 * `build()` rend la fixture) — jamais sur `data/generated`, jamais sur les
 * tables du jeu.
 *
 * Et du BRANCHEMENT des images par cible (`stageChangedEntities`) : persos,
 * monstres et équipement ont chacun leur staging, les autres cibles aucun —
 * stagers injectés, rien n'est stagé pour de vrai.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeJson } from '../lib/json';
import { acceptMinorIn, mergeMinor, reviewEntities, stageChangedEntities } from './review';
import { diffRecords } from './core/changes';
import { TARGETS, type GeneratedTarget } from './targets';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'review-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const read = (rel: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(dir, rel), 'utf8')) as Record<string, unknown>;

const target = (fresh: Record<string, unknown>): GeneratedTarget => ({
  id: 'character',
  label: 'Personnages',
  file: 'characters.json',
  build: () => fresh,
});

/** Committé factice : une entité par sorte d'écart. */
const committed = {
  same: { id: 'same', name: { en: 'Same' }, stats: { hp: { min: 1, max: 2 } } },
  typo: { id: 'typo', name: { en: 'It’s here…' } },
  reword: { id: 'reword', name: { en: 'Old Title' }, stats: { hp: { min: 1, max: 2 } } },
  costume: { id: 'costume', costumes: [{ id: '1', model: '2010001', name: { en: 'A' }, sort: 1 }] },
  real: { id: 'real', name: { en: 'Real' }, stats: { hp: { min: 1, max: 2 } } },
  gone: { id: 'gone' },
};
const fresh = {
  same: committed.same,
  typo: { id: 'typo', name: { en: "It's here..." } },
  reword: { id: 'reword', name: { en: 'New Title' }, stats: { hp: { min: 1, max: 2 } } },
  costume: {
    id: 'costume',
    appearances: ['2020001'],
    costumes: [
      { id: '1', model: '2010001', name: { en: 'A' }, sort: 2 },
      { id: '2', model: '2020001', name: { en: 'B' }, sort: 1 },
    ],
  },
  real: { id: 'real', name: { en: 'Real' }, stats: { hp: { min: 1, max: 3 } } },
  brandNew: { id: 'brandNew' },
};

describe('reviewEntities — classement', () => {
  it('sépare new / diff / minor / typo / removed', () => {
    const byKey = Object.fromEntries(
      reviewEntities(diffRecords(committed, fresh)).map((e) => [e.key, e.status]),
    );
    expect(byKey).toEqual({
      typo: 'typo',
      reword: 'minor',
      costume: 'minor',
      real: 'diff',
      gone: 'removed',
      brandNew: 'new',
    });
  });
});

describe('mergeMinor — cœur pur', () => {
  it('ne prend que les entités typo et mineures, rend les clés par sorte', () => {
    const { merged, typo, minor } = mergeMinor(committed, fresh);
    expect(typo).toEqual(['typo']);
    expect(minor).toEqual(['costume', 'reword']);
    expect(merged.typo).toEqual(fresh.typo);
    expect(merged.reword).toEqual(fresh.reword);
    expect(merged.costume).toEqual(fresh.costume);
    // Le vrai écart garde sa valeur committée, le disparu reste, le nouveau n'entre pas.
    expect(merged.real).toEqual(committed.real);
    expect(merged.gone).toEqual(committed.gone);
    expect(merged.brandNew).toBeUndefined();
  });
});

describe('acceptMinorIn — écriture ciblée', () => {
  it('n’écrit QUE les entités mineures (et typo), en préservant le reste', async () => {
    await writeJson(join(dir, 'characters.json'), committed);
    const result = await acceptMinorIn(dir, target(fresh));
    expect(result).toEqual({ typo: ['typo'], minor: ['costume', 'reword'] });

    const out = read('characters.json');
    expect(Object.keys(out)).toEqual(Object.keys(committed)); // ni ajout ni retrait
    expect(out.reword).toEqual(fresh.reword);
    expect(out.costume).toEqual(fresh.costume);
    expect(out.typo).toEqual(fresh.typo);
    expect(out.real).toEqual(committed.real);
    expect(out.gone).toEqual(committed.gone);
  });

  it('n’écrit rien quand rien n’est mineur (committé absent compris)', async () => {
    const result = await acceptMinorIn(dir, target({ real: fresh.real }));
    expect(result).toEqual({ typo: [], minor: [] });
    expect(existsSync(join(dir, 'characters.json'))).toBe(false);
  });

  it('cible à `subKey` : ne réécrit que le sous-objet, le reste du fichier intact', async () => {
    await writeJson(join(dir, 'glossaries.json'), {
      classes: { striker: { en: 'Striker' } },
      effects: { e1: { id: 'e1', desc: { en: 'Hits…' } }, e2: { id: 'e2', desc: { en: '50%' } } },
    });
    const t: GeneratedTarget = {
      id: 'effect',
      label: 'Effets',
      file: 'glossaries.json',
      subKey: 'effects',
      build: () => ({
        e1: { id: 'e1', desc: { en: 'Hits...' } }, // typo
        e2: { id: 'e2', desc: { en: '60%' } }, // nombre changé : vrai écart
      }),
    };
    expect(await acceptMinorIn(dir, t)).toEqual({ typo: ['e1'], minor: [] });
    const out = read('glossaries.json') as { classes: unknown; effects: Record<string, unknown> };
    expect(out.classes).toEqual({ striker: { en: 'Striker' } });
    expect(out.effects.e1).toEqual({ id: 'e1', desc: { en: 'Hits...' } });
    expect(out.effects.e2).toEqual({ id: 'e2', desc: { en: '50%' } });
  });
});

describe('stageChangedEntities — branchement des images par cible', () => {
  /** Stagers factices : notent qui est appelé, avec quoi. */
  function spies() {
    const calls: Array<{ via: 'characters' | 'entities'; file?: string; ids: string[] }> = [];
    const result = { staged: 1, restaged: 0, present: 0, missing: [] };
    return {
      calls,
      result,
      deps: {
        characters: async (ids: string[]) => {
          calls.push({ via: 'characters' as const, ids });
          return result;
        },
        entities: async (file: string, ids: string[]) => {
          calls.push({ via: 'entities' as const, file, ids });
          return result;
        },
      },
    };
  }
  /** La cible RÉELLE du registre — jamais construite ici (`build()` non appelé). */
  const real = (id: string): GeneratedTarget => TARGETS.find((t) => t.id === id)!;
  const entities = { a: { id: 'a' } };

  it('persos : le staging des persos, et lui seul', async () => {
    const { calls, deps, result } = spies();
    expect(await stageChangedEntities(real('character'), ['a'], entities, deps)).toBe(result);
    expect(calls).toEqual([{ via: 'characters', ids: ['a'] }]);
  });

  it('monstres et cibles d’équipement : le staging par entité, avec le fichier de la cible', async () => {
    const expected: Array<[id: string, file: string]> = [
      ['monster', 'monsters.json'],
      ['ee', 'equipment/ee.json'],
      ['weapon', 'equipment/weapon.json'],
      ['amulet', 'equipment/accessory.json'],
      ['armor', 'equipment/armor.json'],
      ['talisman', 'equipment/talisman.json'],
      ['set', 'equipment/sets.json'],
    ];
    for (const [id, file] of expected) {
      const { calls, deps, result } = spies();
      expect(await stageChangedEntities(real(id), ['a'], entities, deps), id).toBe(result);
      expect(calls, id).toEqual([{ via: 'entities', file, ids: ['a'] }]);
    }
  });

  it('effets et items : aucune image, aucun stager appelé', async () => {
    for (const id of ['effect', 'item']) {
      const { calls, deps } = spies();
      expect(await stageChangedEntities(real(id), ['a'], entities, deps), id).toBeUndefined();
      expect(calls, id).toEqual([]);
    }
  });

  it('aucune entité modifiée : rien, quelle que soit la cible', async () => {
    for (const id of ['character', 'monster', 'weapon']) {
      const { calls, deps } = spies();
      expect(await stageChangedEntities(real(id), [], entities, deps), id).toBeUndefined();
      expect(calls, id).toEqual([]);
    }
  });
});
