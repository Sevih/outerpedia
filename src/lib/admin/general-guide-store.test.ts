/**
 * Contrat des fragments de GUIDES GÉNÉRAUX (audit F8) — `saveFreeHeroes` et
 * `savePremiumLimited`, qui écrivent des JSON importés STATIQUEMENT par le rendu.
 *
 * D'où l'enjeu propre à ces deux-là : un nom de héros qui ne résout pas casse le
 * BUILD, pas seulement une page. La validation est donc la même garde que celle
 * du build, jouée en amont pour la remonter à l'éditeur — avec UNE exception
 * délibérée, `unreleased`, sans laquelle la contribution anticipée (Shiraen
 * rédige avant la sortie du perso) serait impossible à enregistrer.
 *
 * La data persos est mockée : c'est un roster de test, pas la donnée du jeu.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sandbox } from './store-fixture';
import type { FreeHeroesData, PremiumLimitedData, ReviewEntryData } from './general-guide-store';

const ROSTER = ['Stella', 'Tamamo', 'Vlada'];

vi.mock('@/lib/data/characters', () => ({
  // Rend un PERSO, pas un booléen déguisé : la validation des priorités lit sa
  // rareté pour connaître l'échelle de paliers qui s'applique.
  findCharacterByName: (n: string) =>
    ROSTER.includes(n) ? { id: n, name: { en: n }, rarity: 3, tags: ['premium'] } : undefined,
  getAllCharacters: () => ROSTER.map((name) => ({ name, tags: ['premium'] })),
  characterDisplayName: (c: { name: string }) => c.name,
}));

const box = sandbox('general-guides-');
// ⚠ APRÈS `sandbox()` : le store fige ses chemins au chargement.
const { saveFreeHeroes, savePremiumLimited, normalizeReview, isEditableGeneralGuide } =
  await import('./general-guide-store');

const GUIDES = 'src/app/[lang]/guides/_contents/general-guides';
const FREE = `${GUIDES}/free-heroes-start-banner/free-heroes-sources.json`;
const REVIEWS = `${GUIDES}/premium-limited/premium-reviews.json`;
const PRIORITIES = `${GUIDES}/premium-limited/premium-priorities.json`;

const source = (over: Partial<FreeHeroesData['sources'][number]> = {}) => ({
  source: { en: 'Starter banner' },
  entries: [{ names: ['Stella'], pickType: 'one' as const, reason: { en: 'Solide' } }],
  ...over,
});

const review = (over: Partial<ReviewEntryData> = {}): ReviewEntryData =>
  normalizeReview({ name: 'Stella', review: { en: 'Très bonne' }, ...over });

const emptyOrder = () => ({ first: [], second: [], third: [], transcend: [] });
const plData = (over: Partial<PremiumLimitedData> = {}): PremiumLimitedData => ({
  reviews: { premium: [], limited: [] },
  priorities: { premium: emptyOrder(), limited: emptyOrder() },
  ...over,
});

beforeEach(async () => {
  box.reset();
  // Les dossiers du guide doivent exister : le store écrit dedans sans les créer.
  await box.put(FREE, { sources: [] });
  await box.put(REVIEWS, { premium: [], limited: [] });
  await box.put(PRIORITIES, { premium: emptyOrder(), limited: emptyOrder() });
});
afterAll(() => box.dispose());

describe('saveFreeHeroes', () => {
  it('écrit des sources valides', async () => {
    expect(await saveFreeHeroes({ sources: [source()] })).toEqual([]);
    expect(box.read<FreeHeroesData>(FREE).sources).toHaveLength(1);
  });

  it('exige un libellé EN de source', async () => {
    const errors = await saveFreeHeroes({ sources: [source({ source: { fr: 'Sans anglais' } })] });
    expect(errors.join()).toMatch(/Source 1: EN label is required/);
  });

  it('exige au moins une entrée par source', async () => {
    expect((await saveFreeHeroes({ sources: [source({ entries: [] })] })).join()).toMatch(
      /Source 1: at least one entry is required/,
    );
  });

  it('exige au moins un héros par entrée', async () => {
    const errors = await saveFreeHeroes({
      sources: [source({ entries: [{ names: [], pickType: 'one', reason: {} }] })],
    });
    expect(errors.join()).toMatch(/Source 1, entry 1: at least one hero is required/);
  });

  it('refuse un héros qui ne RÉSOUT pas (la garde du build, jouée avant)', async () => {
    const errors = await saveFreeHeroes({
      sources: [source({ entries: [{ names: ['Inconnu'], pickType: 'one', reason: {} }] })],
    });
    expect(errors.join()).toMatch(/Source 1, entry 1: unknown hero “Inconnu”/);
  });

  it('refuse un type de tirage hors « one »/« all »', async () => {
    const errors = await saveFreeHeroes({
      sources: [
        source({ entries: [{ names: ['Stella'], pickType: 'deux' as never, reason: {} }] }),
      ],
    });
    expect(errors.join()).toMatch(/invalid pick type/);
  });

  it('n’écrit RIEN quand une SEULE source est fautive', async () => {
    await box.put(FREE, { sources: [source({ source: { en: 'À garder' } })] });
    const before = box.raw(FREE);

    const errors = await saveFreeHeroes({
      sources: [source(), source({ source: { fr: 'Sans anglais' } })],
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(box.raw(FREE)).toBe(before);
  });

  it('REMPLACE la liste entière (ce n’est pas un merge)', async () => {
    await box.put(FREE, { sources: [source(), source(), source()] });
    await saveFreeHeroes({ sources: [source()] });
    expect(box.read<FreeHeroesData>(FREE).sources).toHaveLength(1);
  });
});

describe('savePremiumLimited — reviews', () => {
  it('écrit reviews et priorités dans LEURS fichiers respectifs', async () => {
    const data = plData({
      reviews: { premium: [review()], limited: [] },
      priorities: {
        premium: { ...emptyOrder(), first: [{ name: 'Tamamo', stars: 6 }] },
        limited: emptyOrder(),
      },
    });
    expect(await savePremiumLimited(data)).toEqual([]);

    expect(box.read<{ premium: unknown[] }>(REVIEWS).premium).toHaveLength(1);
    expect(box.read<{ premium: { first: unknown[] } }>(PRIORITIES).premium.first).toHaveLength(1);
  });

  it('exige un héros et une review EN', async () => {
    const errors = await savePremiumLimited(
      plData({ reviews: { premium: [review({ name: '' })], limited: [] } }),
    );
    expect(errors.join()).toMatch(/Premium #1: hero is required/);

    const errors2 = await savePremiumLimited(
      plData({ reviews: { premium: [review({ review: { fr: 'Sans anglais' } })], limited: [] } }),
    );
    expect(errors2.join()).toMatch(/Premium #1 \(Stella\): EN review is required/);
  });

  it('refuse un héros inconnu et NOMME le bucket', async () => {
    const errors = await savePremiumLimited(
      plData({ reviews: { premium: [], limited: [review({ name: 'Inconnu' })] } }),
    );
    expect(errors.join()).toMatch(/Limited #1: unknown hero “Inconnu”/);
  });

  it('ACCEPTE un héros non sorti marqué `unreleased` (contribution anticipée)', async () => {
    // L'exception qui rend la rédaction d'avance possible — sans elle, la review
    // d'un perso annoncé serait impossible à enregistrer.
    const r = review({ name: 'PasEncoreSorti', unreleased: true });
    expect(await savePremiumLimited(plData({ reviews: { premium: [r], limited: [] } }))).toEqual(
      [],
    );
    expect(box.read<{ premium: ReviewEntryData[] }>(REVIEWS).premium[0].unreleased).toBe(true);
  });

  it('exige quand même la review EN d’un `unreleased`', async () => {
    const r = review({ name: 'PasEncoreSorti', unreleased: true, review: { en: '' } });
    expect(
      (await savePremiumLimited(plData({ reviews: { premium: [r], limited: [] } }))).join(),
    ).toMatch(/EN review is required/);
  });
});

describe('savePremiumLimited — priorités', () => {
  it('refuse un héros inconnu dans un palier, en le SITUANT', async () => {
    const errors = await savePremiumLimited(
      plData({
        priorities: {
          premium: { ...emptyOrder(), second: [{ name: 'Inconnu', stars: 5 }] },
          limited: emptyOrder(),
        },
      }),
    );
    expect(errors.join()).toMatch(/Premium\/second #1: unknown hero “Inconnu”/);
  });

  it('refuse une valeur qui n’est pas un palier PLEIN', async () => {
    // Dont `5` et `8`, qui SONT des paliers valides (4★+ et 5★++) mais pas des
    // crans pleins : un éditorial ne recommande pas de s'arrêter à un « + ».
    for (const stars of [0, 7, -1, Number.NaN, 5, 8]) {
      const errors = await savePremiumLimited(
        plData({
          priorities: {
            premium: { ...emptyOrder(), first: [{ name: 'Stella', stars }] },
            limited: emptyOrder(),
          },
        }),
      );
      expect(errors.join(), `stars=${stars}`).toMatch(/not a full transcendence step/);
    }
  });

  it('accepte les quatre crans pleins — 3★, 4★, 5★, 6★', async () => {
    // CONTRE-ÉPREUVE : une règle qui refuserait tout passerait le test ci-dessus.
    // Le `9` est le cas qui compte — l'ancienne règle « 1 à 6 » l'interdisait,
    // c'est-à-dire qu'elle rendait la cible 6★ IMPOSSIBLE à enregistrer.
    for (const stars of [3, 4, 6, 9]) {
      const errors = await savePremiumLimited(
        plData({
          priorities: {
            premium: { ...emptyOrder(), first: [{ name: 'Stella', stars }] },
            limited: emptyOrder(),
          },
        }),
      );
      expect(errors, `stars=${stars}`).toEqual([]);
    }
  });

  it('CE QU’ELLE NE PEUT PAS ATTRAPER — un « 6 » reste ambigu', async () => {
    // 6 est le palier 5★ ET le nombre qu'on écrit pour dire « 6 étoiles ». Aucune
    // validation ne les distingue : c'est pourquoi le correctif tient d'abord au
    // SÉLECTEUR, qui affiche « 5★ » en face de la valeur 6 (cf. PickRow).
    // Le noter ici évite de croire cette garde plus forte qu'elle n'est.
    const errors = await savePremiumLimited(
      plData({
        priorities: {
          premium: { ...emptyOrder(), first: [{ name: 'Stella', stars: 6 }] },
          limited: emptyOrder(),
        },
      }),
    );
    expect(errors).toEqual([]);
  });

  it('valide les QUATRE paliers', async () => {
    const errors = await savePremiumLimited(
      plData({
        priorities: {
          premium: {
            first: [{ name: 'X', stars: 5 }],
            second: [{ name: 'X', stars: 5 }],
            third: [{ name: 'X', stars: 5 }],
            transcend: [{ name: 'X', stars: 5 }],
          },
          limited: emptyOrder(),
        },
      }),
    );
    expect(errors).toHaveLength(4);
  });

  it('n’écrit AUCUN des deux fichiers quand la validation échoue', async () => {
    await box.put(REVIEWS, { premium: [review({ review: { en: 'À garder' } })], limited: [] });
    const beforeReviews = box.raw(REVIEWS);
    const beforePriorities = box.raw(PRIORITIES);

    const errors = await savePremiumLimited(
      plData({
        reviews: { premium: [review()], limited: [] },
        priorities: {
          premium: { ...emptyOrder(), first: [{ name: 'Inconnu', stars: 5 }] },
          limited: emptyOrder(),
        },
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    // Les deux écritures sont solidaires : pas de fichier à moitié à jour.
    expect(box.raw(REVIEWS)).toBe(beforeReviews);
    expect(box.raw(PRIORITIES)).toBe(beforePriorities);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await savePremiumLimited(plData());
    expect(box.leftovers()).toEqual([]);
  });
});

describe('normalizeReview — forme stable des reviews', () => {
  it('complète les quatre étoiles d’impact, même sur une review vide', () => {
    expect(Object.keys(normalizeReview({}).impact)).toEqual(['3', '4', '5', '6']);
    expect(normalizeReview({}).impact['5']).toEqual({ pve: '', pvp: '' });
  });

  it('préserve les cellules fournies et comble les manquantes', () => {
    const r = normalizeReview({ impact: { '5': { pve: '4', pvp: '3' } } as never });
    expect(r.impact['5']).toEqual({ pve: '4', pvp: '3' });
    expect(r.impact['3']).toEqual({ pve: '', pvp: '' });
  });

  it('n’ajoute `unreleased` que s’il est vrai (JSON mince)', () => {
    expect('unreleased' in normalizeReview({})).toBe(false);
    expect(normalizeReview({ unreleased: true }).unreleased).toBe(true);
  });
});

describe('isEditableGeneralGuide — registre des fragments', () => {
  it('reconnaît les trois guides branchés et rien d’autre', () => {
    for (const slug of ['free-heroes-start-banner', 'premium-limited', 'shop-purchase-priorities'])
      expect(isEditableGeneralGuide(slug)).toBe(true);
    expect(isEditableGeneralGuide('un-guide-au-hasard')).toBe(false);
  });
});
