/**
 * Statuts de la sidebar MONSTRES (`monsterRowStatuses`) : une retouche mineure
 * ou une typo seule se range sous `minor` (appliquée d'un geste depuis la page
 * index), un vrai écart reste `diff`, un nouveau reste `new` — même rangement
 * que `character-rows.ts`. Cœur pur : un diff de fixtures, ni tables du jeu ni
 * `data/generated`.
 */
import { describe, expect, it } from 'vitest';
import { diffRecords } from '@datagen/extractor/core/changes';
import { monsterRowStatuses } from './monster-rows';

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
