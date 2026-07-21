/**
 * Événements communautaires — les règles qui n'ont AUCUN symptôme visible quand
 * elles dérivent : le statut se déduit des dates (aucun champ à basculer), les
 * brouillons ne doivent jamais sortir du serveur, et l'ordre d'affichage porte
 * une intention éditoriale (l'urgent d'abord).
 */
import { describe, expect, it } from 'vitest';
import { currentPhase, eventStatus, summarize, type EventEntry } from './events';

const T = (iso: string) => Date.parse(iso);

const make = (over: Partial<EventEntry> & { slug: string }): EventEntry => ({
  type: 'community',
  title: { en: over.slug },
  start: '2026-01-01T00:00:00Z',
  end: '2026-12-31T00:00:00Z',
  blocks: [],
  ...over,
});

describe('eventStatus — dérivé des dates', () => {
  const e = { start: '2026-03-01T00:00:00Z', end: '2026-04-01T00:00:00Z' };

  it('avant le début → à venir ; pendant → en cours ; après → terminé', () => {
    expect(eventStatus(e, T('2026-02-28T23:59:59Z'))).toBe('upcoming');
    expect(eventStatus(e, T('2026-03-15T00:00:00Z'))).toBe('ongoing');
    expect(eventStatus(e, T('2026-04-01T00:00:01Z'))).toBe('ended');
  });

  it('bornes INCLUSES des deux côtés (l’instant pile est encore « en cours »)', () => {
    expect(eventStatus(e, T('2026-03-01T00:00:00Z'))).toBe('ongoing');
    expect(eventStatus(e, T('2026-04-01T00:00:00Z'))).toBe('ongoing');
  });

  it('date illisible → terminé, jamais une page qui casse', () => {
    expect(eventStatus({ start: 'n’importe quoi', end: '' }, T('2026-03-01T00:00:00Z'))).toBe(
      'ended',
    );
  });
});

describe('currentPhase — prochain jalon', () => {
  const e = make({
    slug: 'x',
    phases: [
      { until: '2026-03-10T00:00:00Z', label: { en: 'ouverture' } },
      { until: '2026-04-10T00:00:00Z', label: { en: 'clôture' } },
    ],
  });

  it('rend le PREMIER jalon pas encore atteint', () => {
    expect(currentPhase(e, T('2026-03-20T00:00:00Z'))?.label.en).toBe('clôture');
  });

  it('aucun jalon restant → aucun (fin de parcours)', () => {
    expect(currentPhase(e, T('2026-05-01T00:00:00Z'))).toBeUndefined();
  });
});

describe('summarize — ce que le client reçoit', () => {
  const now = T('2026-03-15T00:00:00Z');
  const all: EventEntry[] = [
    make({ slug: 'fini-vieux', start: '2025-01-01T00:00:00Z', end: '2025-02-01T00:00:00Z' }),
    make({ slug: 'a-venir-loin', start: '2026-09-01T00:00:00Z', end: '2026-10-01T00:00:00Z' }),
    make({ slug: 'en-cours-tard', start: '2026-03-01T00:00:00Z', end: '2026-08-01T00:00:00Z' }),
    make({ slug: 'a-venir-proche', start: '2026-04-01T00:00:00Z', end: '2026-05-01T00:00:00Z' }),
    make({ slug: 'en-cours-tot', start: '2026-03-01T00:00:00Z', end: '2026-03-20T00:00:00Z' }),
    make({ slug: 'fini-recent', start: '2026-01-01T00:00:00Z', end: '2026-02-01T00:00:00Z' }),
    make({ slug: 'brouillon', draft: true, start: '2026-03-01T00:00:00Z' }),
  ];

  it('un BROUILLON est écarté côté serveur (il ne part pas dans le HTML)', () => {
    expect(summarize(all, 'en', { now }).map((e) => e.slug)).not.toContain('brouillon');
    expect(summarize(all, 'en', { now, includeDrafts: true }).map((e) => e.slug)).toContain(
      'brouillon',
    );
  });

  it('ordre : en cours (fin la plus proche), à venir (début le plus proche), terminés (récents)', () => {
    expect(summarize(all, 'en', { now }).map((e) => e.slug)).toEqual([
      'en-cours-tot',
      'en-cours-tard',
      'a-venir-proche',
      'a-venir-loin',
      'fini-recent',
      'fini-vieux',
    ]);
  });

  it('TEASER : un événement pas encore démarré ne livre ni titre, ni résumé, ni bannière', () => {
    // La surprise fait partie de l'annonce : le client reçoit qu'un concours
    // arrive et quand — le reste ne quitte pas le serveur (la V2 l'envoyait
    // puis le masquait en CSS).
    const teaser = make({
      slug: 'secret',
      type: 'contest',
      title: { en: 'Le grand concours secret' },
      summary: { en: 'Des lots énormes' },
      cover: '/images/events/secret.webp',
      organizer: 'Outerpedia',
      start: '2026-09-01T00:00:00Z',
      end: '2026-10-01T00:00:00Z',
    });
    const [vm] = summarize([teaser], 'en', { now });
    expect(vm.teased).toBe(true);
    expect(vm.title).toBe('');
    expect(vm.summary).toBe('');
    expect(vm.cover).toBeUndefined();
    expect(vm.organizer).toBeUndefined();
    // Ce qui RESTE annoncé : la famille et les dates.
    expect(vm.type).toBe('contest');
    expect(vm.start).toBe('2026-09-01T00:00:00Z');
  });

  it('`revealEarly` publie le contenu avant le début (règlement annoncé d’avance)', () => {
    const early = make({
      slug: 'ouvert',
      title: { en: 'Règlement connu' },
      revealEarly: true,
      start: '2026-09-01T00:00:00Z',
      end: '2026-10-01T00:00:00Z',
    });
    const [vm] = summarize([early], 'en', { now });
    expect(vm.status).toBe('upcoming');
    expect(vm.teased).toBeUndefined();
    expect(vm.title).toBe('Règlement connu');
  });

  it('un événement DÉMARRÉ n’est jamais un teaser, même sans revealEarly', () => {
    const [vm] = summarize(
      [make({ slug: 'live', title: { en: 'Visible' }, start: '2026-03-01T00:00:00Z' })],
      'en',
      { now },
    );
    expect(vm.teased).toBeUndefined();
    expect(vm.title).toBe('Visible');
  });

  it('résout la langue avec repli EN et n’expose que le jalon en cours', () => {
    const events = [
      make({
        slug: 'localise',
        title: { en: 'Hello', fr: 'Bonjour' },
        summary: { en: 'Only EN' },
        start: '2026-03-01T00:00:00Z',
        end: '2026-04-01T00:00:00Z',
        phases: [{ until: '2026-03-20T00:00:00Z', label: { en: 'vote', fr: 'vote FR' } }],
      }),
      // Terminé : son jalon ne doit pas être remonté (plus rien à attendre).
      make({
        slug: 'termine',
        start: '2025-01-01T00:00:00Z',
        end: '2025-02-01T00:00:00Z',
        phases: [{ until: '2030-01-01T00:00:00Z', label: { en: 'jamais' } }],
      }),
    ];
    const [live, done] = summarize(events, 'fr', { now });
    expect(live.title).toBe('Bonjour');
    expect(live.summary).toBe('Only EN');
    expect(live.phase).toBe('vote FR');
    expect(done.phase).toBeUndefined();
  });
});
