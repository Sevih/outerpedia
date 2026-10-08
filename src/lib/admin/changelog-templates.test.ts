/**
 * Les gabarits du journal du site : chacun se remplit, un perso donne six
 * titres et son slug, et un champ oublié reste VISIBLE — jamais un trou
 * silencieux dans une entrée publiée.
 */
import { describe, expect, it } from 'vitest';
import { LANGS } from '@/lib/i18n/config';
import type { ChangelogEntry } from '@/lib/data/changelog';
import {
  CHANGELOG_LINK_KINDS,
  CHANGELOG_TEMPLATES,
  CHANGELOG_TYPES,
  CHARACTER_SCOPE,
  fillTemplate,
  monthLabel,
  templateDefaults,
  unfilledFields,
  type ChangelogTemplate,
} from './changelog-templates';

const TODAY = '2026-10-08';
const template = (id: string): ChangelogTemplate => {
  const t = CHANGELOG_TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`pas de gabarit « ${id} »`);
  return t;
};
/** Une entrée faite d'un gabarit rempli, pour `unfilledFields`. */
const entryOf = (
  filled: ReturnType<typeof fillTemplate>,
): Pick<ChangelogEntry, 'title' | 'content' | 'link'> => ({
  title: filled.title,
  content: { en: filled.content },
  ...(filled.link.kind === 'character'
    ? { link: { kind: 'character', slug: filled.link.value } }
    : filled.link.kind
      ? { link: { kind: filled.link.kind, href: filled.link.value } }
      : {}),
});

describe('les gabarits — un par type, dans l’ordre des boutons', () => {
  it('Perso, Guide, Mise à jour, Page / outil, News, Correctif, puis Manuel', () => {
    expect(CHANGELOG_TEMPLATES.map((t) => [t.id, t.label, t.type])).toEqual([
      ['character', 'Perso', 'character'],
      ['guide', 'Guide', 'guide'],
      ['update', 'Mise à jour', 'update'],
      ['feature', 'Page / outil', 'feature'],
      ['news', 'News', 'news'],
      ['fix', 'Correctif', 'fix'],
      ['manual', 'Manuel', 'guide'],
    ]);
  });

  it('chaque type du journal a son gabarit et son libellé, chaque sorte de lien le sien', () => {
    const types = CHANGELOG_TYPES.map((t) => t.value);
    expect([...types].sort()).toEqual(['character', 'feature', 'fix', 'guide', 'news', 'update']);
    for (const type of types)
      expect(
        CHANGELOG_TEMPLATES.some((t) => t.type === type && t.id !== 'manual'),
        type,
      ).toBe(true);
    // Le libellé du bouton est celui du type, « Manuel » mis à part.
    for (const t of CHANGELOG_TEMPLATES.filter((x) => x.id !== 'manual'))
      expect(CHANGELOG_TYPES.find((x) => x.value === t.type)?.label).toBe(t.label);
    expect(CHANGELOG_LINK_KINDS.map((k) => k.value)).toEqual([
      '',
      'character',
      'guide',
      'tool',
      'page',
    ]);
    const kinds = new Set(CHANGELOG_LINK_KINDS.map((k) => k.value));
    for (const t of CHANGELOG_TEMPLATES) expect(kinds.has(t.link.kind), t.id).toBe(true);
  });

  it('chaque champ écrit dans un gabarit est demandé, ou déduit d’un choix', () => {
    for (const t of CHANGELOG_TEMPLATES) {
      const asked = new Set(t.fields.map((f) => f.key));
      const deduced = new Set(
        t.fields.flatMap((f) => (f.options ?? []).flatMap((o) => Object.keys(o.set ?? {}))),
      );
      // Le slug d'un perso vient du perso choisi, pas d'une saisie.
      if (t.fields.some((f) => f.kind === 'character')) deduced.add('slug');
      const written = [t.title, ...t.content, t.link.value]
        .flatMap((text) => [...text.matchAll(/\{([a-z]+)\}/g)])
        .map((m) => m[1]);
      for (const key of written)
        expect(asked.has(key) || deduced.has(key), `${t.id}.${key}`).toBe(true);
    }
  });
});

describe('templateDefaults — ce que le formulaire montre prérempli', () => {
  it('le mois courant, à la façon de l’historique', () => {
    expect(monthLabel('2026-10-08')).toBe('October 2026');
    expect(monthLabel('2026-01-01')).toBe('January 2026');
    // Le dernier jour d'un mois reste dans son mois : c'est un jour UTC.
    expect(monthLabel('2026-12-31')).toBe('December 2026');
  });

  it('le premier choix et le mois ; rien pour un champ saisi', () => {
    expect(templateDefaults(template('update'), TODAY)).toEqual({
      mode: 'Joint Challenge',
      month: 'October 2026',
    });
    expect(templateDefaults(template('character'), TODAY)).toEqual({
      scope: CHARACTER_SCOPE.base,
    });
    expect(templateDefaults(template('guide'), TODAY)).toEqual({});
    expect(templateDefaults(template('manual'), TODAY)).toEqual({});
  });
});

describe('fillTemplate — chaque gabarit se remplit', () => {
  const NAMES = {
    en: 'Demiurge Lambda',
    jp: 'デミウルゴス・ラムダ',
    kr: '데미우르고스 람다',
    zh: '造物主 拉姆达',
    fr: 'Lambda Démiurge',
    es: 'Lambda Demiurgo',
  };

  it('Perso : le titre dans les six langues, la puce en anglais, le slug en lien', () => {
    const filled = fillTemplate(template('character'), {
      ...templateDefaults(template('character'), TODAY),
      name: NAMES,
      slug: 'demiurge-lambda',
    });
    expect(filled).toEqual({
      type: 'character',
      title: NAMES,
      content: ['Demiurge Lambda has been added to the database with full skills and stats.'],
      link: { kind: 'character', value: 'demiurge-lambda' },
    });
    expect(Object.keys(filled.title).sort()).toEqual([...LANGS].sort());
    expect(unfilledFields(entryOf(filled))).toEqual([]);
  });

  it('Perso avec équipement exclusif : la variante de l’historique', () => {
    expect(
      fillTemplate(template('character'), { name: NAMES, slug: 'x', scope: CHARACTER_SCOPE.ee })
        .content,
    ).toEqual([
      'Demiurge Lambda has been added to the database with full skills, stats and exclusive equipment.',
    ]);
  });

  it('Perso : une langue sans nom n’a pas de titre — le site se replie sur l’anglais', () => {
    const filled = fillTemplate(template('character'), {
      name: { en: 'Titia', fr: 'Titia', jp: '  ' },
      slug: 'titia',
      scope: CHARACTER_SCOPE.base,
    });
    expect(filled.title).toEqual({ en: 'Titia', fr: 'Titia' });
  });

  it('Mise à jour : le guide, le mode, le mois, et le chemin déduit du mode', () => {
    const t = template('update');
    expect(
      fillTemplate(t, { ...templateDefaults(t, TODAY), guide: 'Annihilator', slug: 'annihilator' }),
    ).toEqual({
      type: 'update',
      // Un texte saisi n'est pas localisé : le titre n'existe qu'en anglais.
      title: { en: 'Annihilator' },
      content: ['Annihilator Joint Challenge Guide updated for October 2026 version.'],
      link: { kind: 'guide', value: '/guides/joint-challenge/annihilator' },
    });
    expect(
      fillTemplate(t, {
        guide: 'The Frost Legion',
        mode: 'Guild Raid',
        month: 'September 2026',
        slug: 'frost-legion',
      }),
    ).toMatchObject({
      content: ['The Frost Legion Guild Raid Guide updated for September 2026 version.'],
      link: { kind: 'guide', value: '/guides/guild-raid/frost-legion' },
    });
    expect(
      fillTemplate(t, {
        guide: 'Drakhan',
        mode: 'World Boss',
        month: 'December 2025',
        slug: 'drakhan',
      }).link.value,
    ).toBe('/guides/world-boss/drakhan');
  });

  it('Guide : le boss en titre, la puce de la Singularité, son chemin', () => {
    expect(fillTemplate(template('guide'), { guide: ' Chimera ', slug: 'chimera' })).toEqual({
      type: 'guide',
      title: { en: 'Chimera' },
      content: ['Dimensional Singularity Strategy Guide vs Chimera.'],
      link: { kind: 'guide', value: '/guides/dimensional-singularity/chimera' },
    });
  });

  it('Page / outil, News, Correctif, Manuel : le type et la sorte de lien, sans texte', () => {
    expect(fillTemplate(template('feature'), {})).toEqual({
      type: 'feature',
      title: {},
      content: [],
      link: { kind: 'page', value: '' },
    });
    for (const [id, type] of [
      ['news', 'news'],
      ['fix', 'fix'],
      ['manual', 'guide'],
    ] as const)
      expect(fillTemplate(template(id), { guide: 'ignoré' })).toEqual({
        type,
        title: {},
        content: [],
        link: { kind: '', value: '' },
      });
  });

  it('remplir deux fois rend deux fois la même chose (aucun état gardé)', () => {
    const t = template('character');
    const values = { name: NAMES, slug: 'demiurge-lambda', scope: CHARACTER_SCOPE.base };
    expect(fillTemplate(t, values)).toEqual(fillTemplate(t, values));
  });
});

describe('un champ manquant reste visible, et se retrouve', () => {
  it('`{guide}` non rempli reste écrit dans le titre et la puce', () => {
    const t = template('update');
    const filled = fillTemplate(t, { ...templateDefaults(t, TODAY), slug: 'annihilator' });
    expect(filled.title).toEqual({ en: '{guide}' });
    expect(filled.content).toEqual([
      '{guide} Joint Challenge Guide updated for October 2026 version.',
    ]);
    expect(unfilledFields(entryOf(filled))).toEqual(['guide']);
  });

  it('une valeur vide ou d’espaces ne remplit rien ; le slug oublié reste dans le lien', () => {
    const t = template('update');
    const filled = fillTemplate(t, {
      guide: '   ',
      mode: 'Guild Raid',
      month: '',
      slug: undefined,
    });
    expect(filled.content).toEqual(['{guide} Guild Raid Guide updated for {month} version.']);
    expect(filled.link.value).toBe('/guides/guild-raid/{slug}');
    expect(unfilledFields(entryOf(filled))).toEqual(['guide', 'month', 'slug']);
  });

  it('un mode hors liste ne déduit aucun dossier : `{category}` reste', () => {
    const filled = fillTemplate(template('update'), {
      guide: 'X',
      mode: 'Arena',
      month: 'May 2026',
      slug: 'x',
    });
    expect(filled.link.value).toBe('/guides/{category}/x');
    expect(unfilledFields(entryOf(filled))).toEqual(['category']);
  });

  it('`unfilledFields` lit toutes les langues, les puces et le lien ; une entrée remplie n’a rien', () => {
    expect(
      unfilledFields({
        title: { en: 'Lambda', fr: '{name}' },
        content: { en: ['ok'], jp: ['ok', '{month} です'] },
        link: { kind: 'character', slug: '{slug}' },
      }),
    ).toEqual(['name', 'month', 'slug']);
    expect(
      unfilledFields({
        title: { en: 'Universal Tower' },
        content: { en: ['Added the **Universal Tower** guide.', 'Floors {1} to 150, {B/x} kept.'] },
        link: { kind: 'guide', href: '/guides/skyward-tower/universal-tower' },
      }),
    ).toEqual([]);
    expect(unfilledFields({ title: { en: 'Sans lien' }, content: {} })).toEqual([]);
  });
});
