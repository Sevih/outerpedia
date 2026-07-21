/**
 * Validation des événements — ce qui empêche d'enregistrer une donnée qui
 * casserait le rendu ou l'URL. La sauvegarde PUBLIE sur R2 : un événement
 * invalide part en prod, il faut donc l'arrêter à l'écriture, pas au rendu.
 */
import { describe, expect, it } from 'vitest';
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

const errorsOf = (e: Partial<EventEntry>) => validateEvents([ok(e)]);

describe('validateEvents — métadonnées', () => {
  it('accepte un événement complet', () => {
    expect(validateEvents([ok()])).toEqual([]);
  });

  it('refuse un slug vide, majuscule ou espacé (il devient une URL)', () => {
    for (const slug of ['', 'Mon Event', 'mon_event!', 'MonEvent'])
      expect(errorsOf({ slug }).join()).toMatch(/slug invalide/);
    // Le souligné de TÊTE reste permis (le teaser historique `_no-peaking`).
    expect(validateEvents([ok({ slug: '_no-peaking' })])).toEqual([]);
  });

  it('refuse deux fois le même slug (deux pages pour une URL)', () => {
    expect(validateEvents([ok(), ok()]).join()).toMatch(/slug en double/);
  });

  it('exige le titre EN — les autres langues sont un repli', () => {
    expect(errorsOf({ title: { fr: 'Sans anglais' } }).join()).toMatch(/titre EN requis/);
  });

  it('refuse une date illisible et une fin qui précède le début', () => {
    expect(errorsOf({ start: 'demain' }).join()).toMatch(/début invalide/);
    expect(errorsOf({ end: '2026-02-01T00:00:00Z' }).join()).toMatch(/la fin précède le début/);
  });

  it('exige au moins un bloc de contenu', () => {
    expect(errorsOf({ blocks: [] }).join()).toMatch(/au moins un bloc/);
  });

  it('refuse une bannière qui n’est pas un chemin R2', () => {
    expect(errorsOf({ cover: 'events/cover.webp' }).join()).toMatch(/chemin R2/);
  });
});

describe('validateEvents — blocs', () => {
  it('signale la position exacte du bloc fautif', () => {
    const errors = errorsOf({
      blocks: [
        { kind: 'prose', text: { en: 'ok' } },
        { kind: 'list', items: [{ en: 'ok' }, { fr: 'sans anglais' }] },
      ],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/bloc 2 \(list\), puce 2/);
  });

  it('exige une URL http(s) pour un bouton d’action', () => {
    expect(
      errorsOf({ blocks: [{ kind: 'cta', label: { en: 'Go' }, href: '/interne' }] }).join(),
    ).toMatch(/URL http\(s\) requise/);
  });

  it('refuse une vidéo sans identifiant ou de plateforme inconnue', () => {
    const errors = errorsOf({
      blocks: [
        {
          kind: 'videos',
          entries: [
            { platform: 'youtube', id: '', title: 'x' },
            { platform: 'vimeo' as never, id: 'a', title: 'y' },
          ],
        },
      ],
    });
    expect(errors.join()).toMatch(/identifiant requis/);
    expect(errors.join()).toMatch(/plateforme invalide/);
  });

  it('le bloc calendrier n’exige rien (il rend les jalons de l’événement)', () => {
    expect(validateEvents([ok({ blocks: [{ kind: 'timeline' }] })])).toEqual([]);
  });

  it('valide les jalons comme des dates ISO à libellé EN', () => {
    const errors = errorsOf({ phases: [{ until: 'bientôt', label: {} }] });
    expect(errors.join()).toMatch(/jalon 1 : date invalide/);
    expect(errors.join()).toMatch(/jalon 1 : libellé EN requis/);
  });
});
