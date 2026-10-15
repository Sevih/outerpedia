import { describe, expect, it } from 'vitest';
import { makeT, type Messages, type TranslationKey } from '@/i18n';
import { LANGS, type Lang } from '@/lib/i18n/config';
import { getQuirks } from '@/lib/data/quirks';
import { quirkTreeSubLabel } from './localize';

const messagesOf = async (lang: Lang): Promise<Messages> =>
  (await import(`../../i18n/locales/${lang}.ts`)).default;

/** Les arbres élément / classe de `quirks.json`, avec la clé de locale de leur nom. */
const trees = getQuirks().categories.flatMap((c) =>
  c.key === 'elemental' || c.key === 'class'
    ? c.trees.map((tr) => ({
        cat: c.key,
        key: tr.key,
        i18n: `sys.${c.key === 'elemental' ? 'element' : 'class'}.${tr.key}` as TranslationKey,
      }))
    : [],
);

describe('quirkTreeSubLabel — le nom du jeu, lu dans les locales', () => {
  it('les dix arbres élément / classe sont couverts', () => {
    expect(trees).toHaveLength(10);
  });

  it.each(LANGS)(
    '%s : chaque sous-libellé égale sa clé `sys.element.*` / `sys.class.*`',
    async (lang) => {
      const messages = await messagesOf(lang);
      const t = makeT(messages);
      for (const tr of trees) {
        expect(messages[tr.i18n], tr.i18n).toBeTruthy();
        expect(quirkTreeSubLabel(tr.cat, tr.key, t)).toBe(messages[tr.i18n]);
      }
    },
  );

  it('EN et FR inchangés par rapport aux anciennes tables à la main', async () => {
    const labels = async (lang: Lang) => {
      const t = makeT(await messagesOf(lang));
      return Object.fromEntries(trees.map((tr) => [tr.key, quirkTreeSubLabel(tr.cat, tr.key, t)]));
    };
    expect(await labels('en')).toEqual({
      earth: 'Earth',
      water: 'Water',
      fire: 'Fire',
      light: 'Light',
      dark: 'Dark',
      defender: 'Defender',
      striker: 'Striker',
      ranger: 'Ranger',
      mage: 'Mage',
      healer: 'Healer',
    });
    expect(await labels('fr')).toEqual({
      earth: 'Terre',
      water: 'Eau',
      fire: 'Feu',
      light: 'Lumière',
      dark: 'Ténèbres',
      defender: 'Defender',
      striker: 'Striker',
      ranger: 'Ranger',
      mage: 'Mage',
      healer: 'Healer',
    });
  });

  it('les autres catégories n’ont pas de sous-libellé', () => {
    expect(quirkTreeSubLabel('pve', 'pve', makeT({} as Messages))).toBeNull();
  });
});
