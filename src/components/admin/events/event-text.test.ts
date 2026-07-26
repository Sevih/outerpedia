/**
 * Contrat de `collectTexts` (audit F9 — cœur devenu testable en sortant du
 * composant).
 *
 * Deux choses valent d'être verrouillées ici :
 *   - la RÉFÉRENCE : les valeurs rendues sont les objets de l'événement, pas des
 *     copies. `applyTranslation` remplit les champs EN PLACE ; rendre des copies
 *     casserait la traduction en silence, elle s'appliquerait à des objets jetés.
 *   - la COUVERTURE : un type de bloc oublié ici n'est jamais traduit, sans que
 *     rien ne le signale — l'événement paraît juste en anglais dans les autres
 *     langues. D'où un cas par forme de bloc.
 */
import { describe, expect, it } from 'vitest';
import type { LocalizedText } from '@contracts';
import { collectTexts } from './event-text';
import type { EventBlock, EventEntry } from '@/lib/data/events';

const event = (blocks: EventBlock[], over: Partial<EventEntry> = {}): EventEntry =>
  ({
    slug: 'e',
    type: 'contest',
    title: { en: 'Titre' },
    start: '2026-01-01T00:00:00Z',
    end: '2026-02-01T00:00:00Z',
    blocks,
    ...over,
  }) as EventEntry;

const ens = (e: EventEntry) => collectTexts(e).map((t) => t.en);

describe('collectTexts — métadonnées', () => {
  it('commence par le titre', () => {
    expect(ens(event([]))).toEqual(['Titre']);
  });

  it('prend le résumé quand il existe, et le saute sinon', () => {
    expect(ens(event([], { summary: { en: 'Résumé' } }))).toEqual(['Titre', 'Résumé']);
    expect(ens(event([]))).toEqual(['Titre']);
  });

  it('prend le libellé de chaque jalon', () => {
    const e = event([], {
      phases: [
        { until: '2026-01-10', label: { en: 'J1' } },
        { until: '2026-01-20', label: { en: 'J2' } },
      ],
    });
    expect(ens(e)).toEqual(['Titre', 'J1', 'J2']);
  });
});

describe('collectTexts — une forme par type de bloc', () => {
  it('prose et callout : le texte', () => {
    expect(ens(event([{ kind: 'prose', text: { en: 'P' } }]))).toContain('P');
    expect(ens(event([{ kind: 'callout', text: { en: 'C' } }]))).toContain('C');
  });

  it('list : chaque puce', () => {
    expect(ens(event([{ kind: 'list', items: [{ en: 'a' }, { en: 'b' }] }]))).toEqual([
      'Titre',
      'a',
      'b',
    ]);
  });

  it('sections : titre ET texte de chaque sous-section', () => {
    const e = event([
      { kind: 'sections', items: [{ title: { en: 'T1' }, text: { en: 'X1' } }] },
    ] as EventBlock[]);
    expect(ens(e)).toEqual(['Titre', 'T1', 'X1']);
  });

  it('cta : le libellé, et la note seulement si présente', () => {
    expect(ens(event([{ kind: 'cta', label: { en: 'Go' }, href: 'https://x' }]))).toEqual([
      'Titre',
      'Go',
    ]);
    expect(
      ens(event([{ kind: 'cta', label: { en: 'Go' }, href: 'https://x', note: { en: 'N' } }])),
    ).toEqual(['Titre', 'Go', 'N']);
  });

  it('videos : seulement le texte « à la une » d’une vidéo qui en a un', () => {
    const e = event([
      {
        kind: 'videos',
        entries: [
          { platform: 'youtube', id: 'a', title: 'A' },
          { platform: 'youtube', id: 'b', title: 'B', featured: { en: 'F' } },
        ],
      },
    ] as EventBlock[]);
    // `title` est un texte NON localisé (nom de la vidéo) : il ne se traduit pas.
    expect(ens(e)).toEqual(['Titre', 'F']);
  });

  it('image : alt et légende, chacun optionnel', () => {
    expect(ens(event([{ kind: 'image', src: '/x.webp' }]))).toEqual(['Titre']);
    expect(
      ens(event([{ kind: 'image', src: '/x.webp', alt: { en: 'A' }, caption: { en: 'L' } }])),
    ).toEqual(['Titre', 'A', 'L']);
  });

  it('timeline : rien à traduire (il rend les jalons, collectés à part)', () => {
    expect(ens(event([{ kind: 'timeline' }]))).toEqual(['Titre']);
  });

  it('prend le titre d’un bloc qui en porte un', () => {
    expect(ens(event([{ kind: 'prose', title: { en: 'TB' }, text: { en: 'P' } }]))).toEqual([
      'Titre',
      'TB',
      'P',
    ]);
  });
});

describe('collectTexts — l’invariant qui compte', () => {
  it('rend les OBJETS eux-mêmes, pas des copies', () => {
    // Si ça devenait des copies, `applyTranslation` écrirait dans le vide et
    // l'événement resterait en anglais sans le moindre message.
    const text: LocalizedText = { en: 'P' };
    const e = event([{ kind: 'prose', text }]);
    const out = collectTexts(e);

    expect(out[1]).toBe(text);
    // Écrire dedans modifie bien l'événement source.
    out[1].fr = 'traduit';
    expect(text.fr).toBe('traduit');
  });

  it('parcourt les blocs dans l’ordre de la page', () => {
    const e = event([
      { kind: 'prose', text: { en: '1' } },
      { kind: 'list', items: [{ en: '2' }] },
      { kind: 'callout', text: { en: '3' } },
    ]);
    expect(ens(e)).toEqual(['Titre', '1', '2', '3']);
  });
});
