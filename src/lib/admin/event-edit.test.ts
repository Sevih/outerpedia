/**
 * Contrat de `event-edit` : les squelettes que les éditeurs posent, et la
 * localisation d'un refus de `validateEvents` — c'est elle qui permet à quick
 * de poser le message SOUS le champ fautif. Les messages sont ceux du store,
 * produits ici par la vraie validation : un libellé qui change dans
 * `events-store.ts` sans la regex casse ces tests, pas la page en silence.
 */
import { describe, expect, it } from 'vitest';
import { EVENT_BLOCK_KINDS, locateEventError, newEvent, newEventBlock } from './event-edit';
import { validateEvents } from './events-store';
import type { EventEntry } from '@/lib/data/events';

const ok = (over: Partial<EventEntry> = {}): EventEntry => ({
  slug: 'mon-event',
  type: 'contest',
  title: { en: 'Mon événement' },
  start: '2026-03-01T00:00:00Z',
  end: '2026-04-01T00:00:00Z',
  blocks: [{ kind: 'prose', text: { en: 'Bonjour' } }],
  ...over,
});

describe('newEventBlock — un bloc neuf porte son titre', () => {
  it('chaque genre qui a un titre dans le modèle le porte, vide ; cta et image non', () => {
    for (const kind of EVENT_BLOCK_KINDS) {
      const block = newEventBlock(kind);
      expect(block.kind).toBe(kind);
      expect('title' in block).toBe(kind !== 'cta' && kind !== 'image');
    }
    expect(newEventBlock('list')).toEqual({ kind: 'list', title: {}, items: [{}] });
    expect(newEventBlock('videos')).toEqual({
      kind: 'videos',
      title: {},
      entries: [{ platform: 'youtube', id: '', title: '' }],
    });
  });
});

describe('newEvent — le squelette de l’admin', () => {
  it('communautaire, brouillon, un paragraphe vide, du jour au soir même en UTC', () => {
    expect(newEvent('2026-10-12')).toEqual({
      slug: '',
      type: 'community',
      title: {},
      start: '2026-10-12T00:00:00Z',
      end: '2026-10-12T23:59:00Z',
      blocks: [{ kind: 'prose', title: {}, text: {} }],
      draft: true,
    });
  });

  it('un événement neuf est refusé tel quel : son slug et son titre manquent — rien d’autre', () => {
    expect(validateEvents([newEvent('2026-10-12')])).toEqual([
      'Événement 1 (?) : slug invalide (a-z, 0-9, tirets).',
      'Événement 1 (?) : titre EN requis.',
      'Événement 1 (?), bloc 1 (prose) : texte EN requis.',
    ]);
  });
});

describe('locateEventError — un refus du store, situé', () => {
  const located = (list: EventEntry[]) => validateEvents(list).map(locateEventError);

  it('les refus de Méta : le rang de l’événement, l’onglet, pas de bloc', () => {
    expect(located([ok(), ok({ title: { fr: 'x' } })])).toEqual([
      { index: 1, tab: 'meta', message: 'Événement 2 (mon-event) : slug en double.' },
      { index: 1, tab: 'meta', message: 'Événement 2 (mon-event) : titre EN requis.' },
    ]);
  });

  it('un jalon : l’onglet Jalons et son rang', () => {
    expect(located([ok({ phases: [{ until: 'x', label: { en: 'ok' } }] })])).toEqual([
      {
        index: 0,
        tab: 'phases',
        entry: 0,
        message: 'Événement 1 (mon-event), jalon 1 : date invalide (ISO attendue).',
      },
    ]);
  });

  it('un bloc, puis une puce, une sous-section ou une vidéo du bloc', () => {
    expect(
      located([
        ok({
          blocks: [
            { kind: 'prose', text: { en: 'ok' } },
            { kind: 'cta', label: { en: 'Go' }, href: 'nope' },
            { kind: 'list', items: [{ en: 'ok' }, {}] },
            { kind: 'videos', entries: [{ platform: 'youtube', id: '', title: 'x' }] },
          ],
        }),
      ]),
    ).toEqual([
      {
        index: 0,
        tab: 'blocks',
        block: 1,
        message: 'Événement 1 (mon-event), bloc 2 (cta) : URL http(s) requise.',
      },
      {
        index: 0,
        tab: 'blocks',
        block: 2,
        entry: 1,
        message: 'Événement 1 (mon-event), bloc 3 (list), puce 2 : texte EN requis.',
      },
      {
        index: 0,
        tab: 'blocks',
        block: 3,
        entry: 0,
        message: 'Événement 1 (mon-event), bloc 4 (videos), vidéo 1 : identifiant requis.',
      },
    ]);
  });

  it('un message étranger : Méta, sans rang, le message intact', () => {
    expect(locateEventError('Liste attendue.')).toEqual({
      index: null,
      tab: 'meta',
      message: 'Liste attendue.',
    });
  });
});
