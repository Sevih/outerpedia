/**
 * Statuts de la sidebar MONSTRES (`monsterRowStatuses`) : une retouche mineure
 * ou une typo seule se range sous `minor` (appliquée d'un geste depuis la page
 * index), un vrai écart reste `diff`, un nouveau reste `new` — même rangement
 * que `character-rows.ts`. Cœur pur : un diff de fixtures, ni tables du jeu ni
 * `data/generated`.
 *
 * Et les modes de jeu des lignes (`buildMonsterRows`, sa source injectée) : le
 * `meta` et le select suivent l'ordre et les titres de `gameModeGroups`. Et
 * l'adresse de leurs sprites : la route de quick d'office, celle qu'on passe
 * sinon (l'admin, jusqu'à son retrait).
 */
import { describe, expect, it } from 'vitest';
import { diffRecords } from '@datagen/extractor/core/changes';
import { buildMonsterRows, monsterRowStatuses, type MonsterRowsSource } from './monster-rows';

const monster = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  name: { en: `Monster ${id}` },
  icon: id,
  stats: { hp: { min: 100, max: 100 } },
  ...over,
});

const committed = {
  same: monster('same'),
  reword: monster('reword', { nickname: { en: 'Old Epithet' } }),
  typo: monster('typo', { name: { en: 'It’s here…' } }),
  real: monster('real'),
  mixed: monster('mixed'),
  gone: monster('gone'),
};
const fresh = {
  same: monster('same'),
  reword: monster('reword', { nickname: { en: 'New Epithet' } }),
  typo: monster('typo', { name: { en: "It's here..." } }),
  real: monster('real', { stats: { hp: { min: 100, max: 250 } } }),
  // Un texte reformulé ET une stat changée : un vrai écart, pas une retouche.
  mixed: monster('mixed', { name: { en: 'Renamed' }, stats: { hp: { min: 1, max: 1 } } }),
  brandNew: monster('brandNew'),
};

describe('monsterRowStatuses', () => {
  const statuses = monsterRowStatuses(diffRecords(committed, fresh));

  it('range la retouche mineure ET la typo sous `minor`', () => {
    expect(statuses.get('reword')).toBe('minor');
    expect(statuses.get('typo')).toBe('minor');
  });

  it('rien ne change pour un monstre `diff` ou `new`', () => {
    expect(statuses.get('real')).toBe('diff');
    expect(statuses.get('mixed')).toBe('diff');
    expect(statuses.get('brandNew')).toBe('new');
  });

  it('un monstre à jour n’est pas dans la table (`ok`), un disparu non plus', () => {
    expect(statuses.has('same')).toBe(false);
    expect(statuses.has('gone')).toBe(false);
    expect(statuses.size).toBe(5);
  });
});

describe('buildMonsterRows — les modes de jeu, comme le damage calc les liste', () => {
  type Source = MonsterRowsSource;
  const at = (...ids: string[]) => ids.map((dungeon) => ({ dungeon }));
  const spawned = (id: string, ...dungeons: string[]) =>
    ({ ...monster(id), spawns: at(...dungeons) }) as unknown as Source['monsters'][string];
  const dungeon = (mode: string, en: string) => ({ mode, name: { en }, monsters: [{ id: 'm' }] });
  const source: Source = {
    monsters: {
      jc: spawned('jc', 'd-jc'),
      climber: spawned('climber', 'd-t2', 'd-jc', 'd-t1', 'd-story', 'd-gate'),
      gate: spawned('gate', 'd-gate'),
      // Sans rencontre : pas de ligne.
      idle: spawned('idle'),
    },
    encounters: {
      modes: {
        event_boss: { en: 'Joint Challenge' },
        tower: { en: 'Skyward Tower' },
        tower_hard: { en: 'Skyward Tower' },
        normal_hard: { en: 'Story Hard' },
        monad_battle_1: { en: 'Monad Gate' },
      },
      modeFamilies: { story: { en: 'Story' } },
      dungeons: {
        'd-jc': dungeon('event_boss', 'Defeat'),
        'd-t1': dungeon('tower', '1F'),
        'd-t2': dungeon('tower_hard', '2F'),
        'd-story': dungeon('normal_hard', 'Stage 2'),
        'd-gate': dungeon('monad_battle_1', 'Gate'),
      },
    } as unknown as Source['encounters'],
    site: new Set(['jc']),
    diff: diffRecords({}, {}),
  };
  const { rows, modeOptions } = buildMonsterRows(source);
  const row = (id: string) => rows.find((r) => r.id === id);

  it('le select : une option par slug, Story en tête puis l’ordre des donjons, sous le titre du groupe ; le skirmish écarté sous « Autres »', () => {
    expect(modeOptions).toEqual([
      { value: 'normal_hard', label: 'Story' },
      { value: 'event_boss', label: 'Joint Challenge' },
      { value: 'tower', label: 'Skyward Tower (tower)' },
      { value: 'tower_hard', label: 'Skyward Tower (tower_hard)' },
      { value: 'monad_battle_1', label: 'Autres (monad_battle_1)' },
    ]);
  });

  it('le meta : les deux premiers titres dans l’ordre des groupes, un titre par groupe ; les tags restent les slugs que le select filtre', () => {
    expect(rows.map((r) => r.id)).toEqual(['jc', 'climber', 'gate']);
    expect(row('jc')).toMatchObject({
      meta: 'Joint Challenge',
      tags: ['event_boss'],
      flags: ['site'],
    });
    // Quatre groupes (les deux tours n'en font qu'un) : les deux premiers.
    expect(row('climber')).toMatchObject({
      meta: 'Story, Joint Challenge',
      tags: ['tower_hard', 'event_boss', 'tower', 'normal_hard', 'monad_battle_1'],
      flags: [],
    });
    expect(row('gate')).toMatchObject({ meta: 'Autres', tags: ['monad_battle_1'] });
  });

  it('les sprites : la route de quick d’office, celle qu’on passe sinon', () => {
    // Un monstre sans type : le slot vert des mobs, pas de badge « BOSS ».
    expect(row('jc')).toMatchObject({
      icon: '/api/sprite/MT_jc',
      iconFrame: '/api/sprite/GD_Slot_Bg_01',
    });
    expect(row('jc')?.badgeIcon).toBeUndefined();
    const other = buildMonsterRows(source, '/api/other/sprite').rows.find((r) => r.id === 'jc');
    expect(other).toMatchObject({
      icon: '/api/other/sprite/MT_jc',
      iconFrame: '/api/other/sprite/GD_Slot_Bg_01',
    });
  });
});
