/**
 * La forme des priorités de shop — l'overlay tiré des lignes dérivées, ce que
 * l'éditeur React reconstruisait au montage et que quick envoie au store.
 */
import { describe, expect, it } from 'vitest';
import {
  DERIVED_LABEL,
  DERIVED_ORDER,
  PERIODS,
  PRIORITIES,
  TEXT_SHOP_LABEL,
  overlayOf,
} from './shop-priorities-shape';

describe('overlayOf — slug → priorité et notes, une ligne vide n’y est pas', () => {
  it('ne garde que les lignes qui portent une priorité ou une note non vide', () => {
    const out = overlayOf([
      {
        rows: [
          { key: 'guild/gold-10000/daily', priority: 'A' },
          { key: 'guild/item-20001/daily', notes: { en: 'Buy it' } },
          { key: 'guild/item-20002/daily', priority: 'S', notes: { en: 'Both' } },
          { key: 'guild/item-20003/daily' },
          { key: 'guild/item-20004/daily', notes: { en: '  ', fr: '' } },
        ],
      },
      { rows: [{ key: 'arena/gold-10000/daily', priority: 'B' }] },
    ]);
    expect(out).toEqual({
      'guild/gold-10000/daily': { priority: 'A' },
      'guild/item-20001/daily': { notes: { en: 'Buy it' } },
      'guild/item-20002/daily': { priority: 'S', notes: { en: 'Both' } },
      'arena/gold-10000/daily': { priority: 'B' },
    });
  });

  it('une priorité hors S/A/B/C est ignorée (la ligne ne reste que par sa note)', () => {
    expect(
      overlayOf([{ rows: [{ key: 'k', priority: 'Z' as never, notes: { en: 'n' } }] }]),
    ).toEqual({ k: { notes: { en: 'n' } } });
    expect(overlayOf([{ rows: [{ key: 'k', priority: 'Z' as never }] }])).toEqual({});
  });
});

describe('les constantes partagées avec l’admin', () => {
  it('les sept shops dérivés dans l’ordre du guide, chacun libellé ; quatre priorités, quatre périodes, deux shops texte', () => {
    expect(DERIVED_ORDER).toEqual([
      'guild',
      'joint',
      'friend',
      'arena',
      'stars',
      'worldboss',
      'survey',
    ]);
    for (const key of DERIVED_ORDER) expect(DERIVED_LABEL[key]).toBeTruthy();
    expect(PRIORITIES).toEqual(['S', 'A', 'B', 'C']);
    expect(PERIODS).toEqual(['daily', 'weekly', 'monthly', 'one-time']);
    expect(Object.keys(TEXT_SHOP_LABEL)).toEqual(['supply', 'rico']);
  });
});
