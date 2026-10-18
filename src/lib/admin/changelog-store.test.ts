/**
 * Contrat de `saveChangelog` (audit F8) — `data/curated/changelog.json`.
 *
 * Store de LISTE (pas de merge par clé) : la sauvegarde remplace le fichier
 * entier. La seule protection est donc la validation — et elle est TOUT-OU-RIEN :
 * une entrée fautive doit empêcher l'écriture des 134 autres. Ce repo est la seule
 * source de vérité depuis le 22/07 : ce qui est écrasé ici est perdu.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';
import type { ChangelogEntry, UnsavedChangelogEntry } from '@/lib/data/changelog';

const box = sandbox('changelog-');
// ⚠ APRÈS `sandbox()` : le store fige son chemin au chargement.
const { saveChangelog, loadChangelog, CHANGELOG_ID_RE } = await import('./changelog-store');

const FILE = 'data/curated/changelog.json';

/** Une entrée valide SANS id : celle qu'un gabarit pose, l'id vient à l'écriture. */
const ok = (over: Partial<UnsavedChangelogEntry> = {}): UnsavedChangelogEntry =>
  ({
    title: { en: 'Nouveau guide' },
    type: 'guide',
    date: '2026-07-26',
    ...over,
  }) as UnsavedChangelogEntry;

/** `entry` telle que le fichier la porte : un id attribué en tête. */
const withId = (entry: UnsavedChangelogEntry) => ({
  id: expect.stringMatching(CHANGELOG_ID_RE),
  ...entry,
});

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('saveChangelog — validation', () => {
  it('accepte une entrée complète et l’écrit', async () => {
    expect(await saveChangelog([ok()])).toEqual([]);
    expect(box.read<ChangelogEntry[]>(FILE)).toEqual([withId(ok())]);
  });

  it('exige le titre EN (les autres langues sont un repli)', async () => {
    const errors = await saveChangelog([ok({ title: { fr: 'Sans anglais' } })]);
    expect(errors.join()).toMatch(/Entrée 1 : titre EN requis/);
  });

  it('refuse un titre EN qui n’est que des espaces', async () => {
    expect((await saveChangelog([ok({ title: { en: '   ' } })])).join()).toMatch(/titre EN requis/);
  });

  it('refuse un type hors liste', async () => {
    const errors = await saveChangelog([ok({ type: 'annonce' as never })]);
    expect(errors.join()).toMatch(/type invalide \(« annonce »\)/);
  });

  it('accepte les six types du contrat', async () => {
    const types = ['guide', 'update', 'feature', 'character', 'news', 'fix'] as const;
    expect(await saveChangelog(types.map((t) => ok({ type: t })))).toEqual([]);
  });

  it('exige une date YYYY-MM-DD stricte (pas d’ISO complet, pas de mois seul)', async () => {
    for (const date of ['2026-07', '26-07-2026', '2026-07-26T00:00:00Z', 'demain', ''])
      expect((await saveChangelog([ok({ date })])).join()).toMatch(/date invalide/);
  });

  it('NUMÉROTE l’entrée fautive (l’éditeur doit pouvoir la retrouver)', async () => {
    const errors = await saveChangelog([ok(), ok({ type: 'x' as never }), ok()]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^Entrée 2 /);
  });

  it('signale TOUTES les erreurs d’une entrée d’un coup', async () => {
    const errors = await saveChangelog([{ title: {}, type: 'x', date: 'z' } as never]);
    expect(errors).toHaveLength(3);
  });
});

describe('saveChangelog — écriture tout-ou-rien', () => {
  it('n’écrit RIEN quand une SEULE entrée est fautive', async () => {
    await box.put(FILE, [ok({ title: { en: 'Historique à ne pas perdre' } })]);
    const before = box.raw(FILE);

    const errors = await saveChangelog([ok(), ok({ date: 'demain' })]);
    expect(errors.length).toBeGreaterThan(0);
    // Intact OCTET POUR OCTET : la validation protège tout le fichier.
    expect(box.raw(FILE)).toBe(before);
  });

  it('REMPLACE la liste entière (ce n’est pas un merge)', async () => {
    await box.put(FILE, [ok({ title: { en: 'Vieux' } }), ok({ title: { en: 'Encore un' } })]);
    await saveChangelog([ok({ title: { en: 'Seul survivant' } })]);

    const list = box.read<ChangelogEntry[]>(FILE);
    expect(list).toHaveLength(1);
    expect(list[0].title.en).toBe('Seul survivant');
  });

  it('conserve l’ORDRE de la liste (chronologie éditoriale)', async () => {
    await saveChangelog([ok({ date: '2026-01-01' }), ok({ date: '2026-12-31' })]);
    expect(box.read<ChangelogEntry[]>(FILE).map((e) => e.date)).toEqual([
      '2026-01-01',
      '2026-12-31',
    ]);
  });

  it('accepte une liste vide (rien à valider) et vide le fichier', async () => {
    await box.put(FILE, [ok()]);
    expect(await saveChangelog([])).toEqual([]);
    expect(box.read<ChangelogEntry[]>(FILE)).toEqual([]);
  });

  it('`loadChangelog` relit ce qui vient d’être écrit ; [] si absent', async () => {
    expect(loadChangelog()).toEqual([]);
    await saveChangelog([ok()]);
    expect(loadChangelog()).toEqual([withId(ok())]);
  });

  it('ne laisse aucun temporaire derrière lui', async () => {
    await saveChangelog([ok()]);
    expect(box.leftovers()).toEqual([]);
  });
});

describe('saveChangelog — id stable des entrées', () => {
  it('attribue un id (8 hex, en PREMIÈRE clé) à chaque entrée qui n’en a pas, distinct des autres', async () => {
    expect(await saveChangelog([ok(), ok(), ok({ id: 'abcdef01' })])).toEqual([]);
    const list = box.read<ChangelogEntry[]>(FILE);
    for (const e of list.slice(0, 2)) {
      expect(e.id).toMatch(CHANGELOG_ID_RE);
      expect(Object.keys(e)[0]).toBe('id');
    }
    // L'entrée qui en avait un le garde, à sa place.
    expect(list[2]).toEqual(ok({ id: 'abcdef01' }));
    expect(new Set(list.map((e) => e.id)).size).toBe(3);
  });

  it('garde l’id existant, même quand le titre et la date changent', async () => {
    await saveChangelog([ok({ id: '0123abcd' })]);
    await saveChangelog([
      ok({ id: '0123abcd', title: { en: 'Titre corrigé' }, date: '2026-07-27' }),
    ]);
    expect(box.read<ChangelogEntry[]>(FILE)).toEqual([
      { id: '0123abcd', title: { en: 'Titre corrigé' }, type: 'guide', date: '2026-07-27' },
    ]);
  });

  it('refuse un id mal formé ou en double, situé, sans rien écrire', async () => {
    await box.put(FILE, [ok({ id: '0123abcd' })]);
    const before = box.raw(FILE);
    for (const id of ['ABCDEF01', '0123abc', '0123abcde', 'zzzzzzzz', '', 12 as never]) {
      const errors = await saveChangelog([ok(), ok({ id })]);
      expect(errors, String(id)).toEqual([
        `Entrée 2 : id invalide (« ${id} », attendu 8 caractères hexadécimaux).`,
      ]);
    }
    expect(await saveChangelog([ok({ id: '0123abcd' }), ok({ id: '0123abcd' })])).toEqual([
      'Entrée 2 : id en double (« 0123abcd »).',
    ]);
    expect(box.raw(FILE)).toBe(before);
  });

  it('le fichier réel : chaque entrée porte un id bien formé, unique', () => {
    // Le vrai fichier, pas celui du bac à sable.
    const path = resolve(import.meta.dirname, '../../../data/curated/changelog.json');
    const ids = (JSON.parse(readFileSync(path, 'utf8')) as { id?: string }[]).map((e) => e.id);
    expect(ids.length).toBeGreaterThan(100);
    for (const id of ids) expect(id).toMatch(CHANGELOG_ID_RE);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('le fichier réel : aucun lien markdown `[…](…)` dans un titre ni une puce', () => {
    // La carte ne rend que le gras (`bulletSegments`) : un lien s'y affichait
    // brut, crochets et URL compris (A65). Le lien d'une entrée est son `link`.
    const path = resolve(import.meta.dirname, '../../../data/curated/changelog.json');
    const entries = JSON.parse(readFileSync(path, 'utf8')) as ChangelogEntry[];
    const LINK = /\[[^\]]*\]\([^)]*\)/;
    const found: string[] = [];
    for (const e of entries) {
      for (const [lang, title] of Object.entries(e.title))
        if (LINK.test(title ?? '')) found.push(`${e.id} (${lang}, titre)`);
      for (const [lang, lines] of Object.entries(e.content ?? {}))
        if (lines?.some((l) => LINK.test(l))) found.push(`${e.id} (${lang}, puces)`);
    }
    expect(found).toEqual([]);
  });
});
