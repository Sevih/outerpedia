import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { GUIDE_CATEGORIES } from '@/lib/data/guide-categories';
import { characterDisplayName, characterSearchNames, slugForId } from '@/lib/data/characters';
import { computeUsage, USAGE_CATEGORIES } from './usage';
import { MostUsedUnitsBrowser, type MostUsedLabels, type UsageRow } from './MostUsedUnitsBrowser';

/**
 * Most Used Units — wrapper SERVEUR : agrège l'usage depuis les fichiers de
 * guides (`usage.ts`), résout noms/titres/libellés dans la langue de la requête
 * (aucun contexte i18n client en V3) et laisse le tri filtré au client. L'ordre
 * inital est le total toutes catégories, décroissant (parité V2).
 */
export default async function MostUsedUnits({ lang }: { lang: Lang }) {
  const t = await getT(lang);

  const rows: UsageRow[] = [...computeUsage()]
    .map(([character, usage]) => {
      const categories = Object.fromEntries(
        USAGE_CATEGORIES.filter((cat) => usage.has(cat)).map((cat) => [
          cat,
          usage.get(cat)!.map((g) => ({ slug: g.slug, title: g.title[lang] ?? g.title.en })),
        ]),
      );
      return {
        id: character.id,
        slug: slugForId(character.id) ?? character.id,
        name: characterDisplayName(character, lang),
        searchNames: characterSearchNames(character),
        element: character.element,
        class: character.class,
        rarity: character.rarity,
        categories,
        total: Object.values(categories).reduce((sum, gs) => sum + gs.length, 0),
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  const optionMap = (values: string[], prefix: string) =>
    Object.fromEntries([...new Set(values)].map((v) => [v, t(`${prefix}.${v}` as TranslationKey)]));

  const labels: MostUsedLabels = {
    bar: {
      searchPlaceholder: t('characters.filters.search_placeholder'),
      elements: t('filters.elements'),
      classes: t('filters.classes'),
      rarity: t('filters.rarity'),
      filtersTitle: t('characters.filters.title'),
      advanced: t('characters.filters.advanced'),
      starAria: t('aria.star_rarity'),
    },
    categoryFilter: t('tools.most-used-units.category_filter'),
    all: t('common.all'),
    // Univers des pills : les catégories réellement présentes, ordre canonique.
    categories: Object.fromEntries(
      USAGE_CATEGORIES.filter((cat) => rows.some((r) => cat in r.categories)).map((cat) => [
        cat,
        GUIDE_CATEGORIES[cat].label[lang] ?? GUIDE_CATEGORIES[cat].label.en,
      ]),
    ),
    elements: optionMap(
      rows.map((r) => r.element),
      'sys.element',
    ),
    classes: optionMap(
      rows.map((r) => r.class),
      'sys.class',
    ),
    guidesUnit: t('nav.guides'),
  };

  return <MostUsedUnitsBrowser rows={rows} labels={labels} />;
}
