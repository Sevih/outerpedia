/**
 * Les modes de jeu du picker de Monstres : l'ordre, les familles, la fusion et
 * les exclusions du damage calc du site, sur des donjons FACTICES — puis, sur
 * `encounters.json` committé, ce que la liste doit tenir quel que soit le patch.
 */
import { describe, expect, it } from 'vitest';
import type { DungeonRef } from '@contracts';
import { getEncounters, storyFamilyOf } from '@/lib/data/encounters';
import { gameModeGroups, modeKeysOf } from './game-modes';

/** Un donjon peuplé. */
const dungeon = (mode: string, over: Partial<DungeonRef> = {}) =>
  ({ mode, monsters: [{ id: 'm' }], ...over }) as DungeonRef;

/** Des titres factices : le test ne dépend pas de ceux du jeu. */
const GLOSS = {
  modeFamilies: {
    story: { en: 'Story', fr: 'Histoire' },
    origin: { en: 'Origin Story' },
    special_request: { en: 'Special Request' },
  },
  modes: {
    normal: { en: 'Story Normal' },
    tower: { en: 'Skyward Tower', fr: 'Tour céleste' },
    tower_hard: { en: 'Skyward Tower', fr: 'Tour céleste' },
    raid_1: { en: 'Special Request: Ecology Study' },
    event_boss: { en: 'Joint Challenge' },
    monad_battle_1: { en: 'Monad Gate' },
  },
} as unknown as Parameters<typeof gameModeGroups>[2];

const groups = (encounters: Record<string, DungeonRef>, lang: 'en' | 'fr' = 'en') =>
  gameModeGroups(encounters, lang, GLOSS);

describe('gameModeGroups — les modes de jeu, comme le damage calc les liste', () => {
  it('l’ordre : Story puis Origin Story en tête, ensuite la première apparition au fil des donjons', () => {
    expect(
      groups({
        a: dungeon('event_boss'),
        b: dungeon('origin'),
        c: dungeon('tower'),
        d: dungeon('normal'),
        e: dungeon('event_boss'),
      }).map((g) => g.key),
    ).toEqual(['story', 'origin', 'joint-challenge', 'skyward-tower']);
    // Une famille absente ne laisse pas de trou ; l'autre reste en tête.
    expect(groups({ a: dungeon('tower'), b: dungeon('origin_hard') }).map((g) => g.key)).toEqual([
      'origin',
      'skyward-tower',
    ]);
  });

  it('les familles : les quatre modes story en deux groupes, les deux Special Request en un, sous le titre de la famille', () => {
    expect(
      groups({
        a: dungeon('origin_hard'),
        b: dungeon('normal_hard'),
        c: dungeon('raid_2'),
        d: dungeon('origin'),
        e: dungeon('raid_1'),
        f: dungeon('normal'),
      }),
    ).toEqual([
      { key: 'story', label: 'Story', slugs: ['normal_hard', 'normal'] },
      { key: 'origin', label: 'Origin Story', slugs: ['origin_hard', 'origin'] },
      { key: 'special-request', label: 'Special Request', slugs: ['raid_2', 'raid_1'] },
    ]);
  });

  it('la fusion : les slugs qui portent le même titre font un groupe ; sans titre, le slug', () => {
    expect(
      groups({ a: dungeon('tower'), b: dungeon('mode_neuf'), c: dungeon('tower_hard') }),
    ).toEqual([
      { key: 'skyward-tower', label: 'Skyward Tower', slugs: ['tower', 'tower_hard'] },
      { key: 'mode-neuf', label: 'mode_neuf', slugs: ['mode_neuf'] },
    ]);
  });

  it('les exclusions : un donjon vide, un donjon retiré, les skirmish du Monad Gate', () => {
    expect(
      groups({
        a: dungeon('tower', { monsters: [] }),
        b: dungeon('event_boss', { retired: true }),
        c: dungeon('monad_battle_1'),
        d: { mode: 'origin' } as DungeonRef,
      }),
    ).toEqual([]);
    // Un mode vit dès qu'UN de ses donjons compte.
    expect(
      groups({ a: dungeon('event_boss', { retired: true }), b: dungeon('event_boss') }),
    ).toEqual([{ key: 'joint-challenge', label: 'Joint Challenge', slugs: ['event_boss'] }]);
  });

  it('la langue : le titre suit, la clé reste celle de l’anglais — un titre manquant replie sur l’anglais', () => {
    expect(
      groups({ a: dungeon('normal'), b: dungeon('tower'), c: dungeon('event_boss') }, 'fr'),
    ).toEqual([
      { key: 'story', label: 'Histoire', slugs: ['normal'] },
      { key: 'skyward-tower', label: 'Tour céleste', slugs: ['tower'] },
      { key: 'joint-challenge', label: 'Joint Challenge', slugs: ['event_boss'] },
    ]);
  });

  it('sans glossaire de familles : le titre d’un mode membre, puis le nom de la famille', () => {
    const bare = {
      modes: { raid_1: { en: 'Special Request: Ecology Study' } },
    } as unknown as Parameters<typeof gameModeGroups>[2];
    expect(gameModeGroups({ a: dungeon('raid_1'), b: dungeon('normal') }, 'en', bare)).toEqual([
      { key: 'story', label: 'story', slugs: ['normal'] },
      {
        key: 'special-request-ecology-study',
        label: 'Special Request: Ecology Study',
        slugs: ['raid_1'],
      },
    ]);
  });

  it('`modeKeysOf` : les groupes où tombent des slugs, dans l’ordre des groupes — un slug écarté n’en a pas', () => {
    const list = groups({
      a: dungeon('tower'),
      b: dungeon('normal_hard'),
      c: dungeon('event_boss'),
    });
    expect(modeKeysOf(list, ['event_boss', 'monad_battle_1', 'normal_hard'])).toEqual([
      'story',
      'joint-challenge',
    ]);
    expect(modeKeysOf(list, [])).toEqual([]);
    expect(modeKeysOf(list, ['mode_inconnu'])).toEqual([]);
  });

  it('sur le committé : des clés uniques et lisibles, aucun slug dans deux groupes, les familles story en tête', () => {
    const list = gameModeGroups(getEncounters(), 'en');
    const keys = list.map((g) => g.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const g of list) {
      expect(g.key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(g.label).not.toBe('');
    }
    const slugs = list.flatMap((g) => g.slugs);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).not.toContain('monad_battle_1');
    expect(keys.slice(0, 2)).toEqual(['story', 'origin']);
    // Le damage calc ne liste un mode que s'il y trouve une cible : hors
    // histoire, un boss. Tant que chaque mode d'ici en a une, les deux listes
    // sont les mêmes — un écart se verrait ici.
    const withBoss = new Set(
      Object.values(getEncounters())
        .filter((d) => !d.retired && d.monsters?.some((m) => m.role === 'boss'))
        .map((d) => d.mode),
    );
    expect(slugs.filter((s) => !storyFamilyOf(s) && !withBoss.has(s))).toEqual([]);
  });
});
