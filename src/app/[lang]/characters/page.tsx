import type { Metadata } from 'next';
import { normalizeLang, type Lang } from '@/lib/i18n/config';
import { getT, type TFunction, type TranslationKey } from '@/i18n';
import { createPageMetadata, buildItemListJsonLd, buildUrl } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import {
  CharactersBrowser,
  type CharacterRow,
  type CharactersBrowserLabels,
} from '@/components/character/CharactersBrowser';
import {
  characterDisplayName,
  characterNamePrefix,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { img } from '@/lib/images';
import glossariesData from '@data/generated/glossaries.json';

export const revalidate = 86400;

/** chainType (donnée) → clé de libellé i18n. */
const CHAIN_LABEL: Record<string, string> = {
  start: 'starter',
  join: 'companion',
  finish: 'finisher',
};

/** Libellés localisés des gifts (present_0X → nom), depuis le glossaire. */
const GIFT_NAMES =
  (glossariesData as { gifts?: Record<string, Record<string, string>> }).gifts ?? {};

const norm = (s: string) => s.normalize('NFKC').toLowerCase().trim();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/characters',
    title: t('page.characters.title'),
    description: t('page.characters.description'),
  });
}

function buildRows(lang: Lang): CharacterRow[] {
  const curated = loadCuratedCharacters();
  return getCharacterListItems().map((c) => {
    const names = [
      ...Object.values(c.name as Record<string, string>),
      ...(c.nickname ? Object.values(c.nickname as Record<string, string>) : []),
      c.id,
      slugForId(c.id) ?? c.id,
    ];
    return {
      id: c.id,
      slug: slugForId(c.id) ?? c.id,
      name: characterDisplayName(c, lang),
      prefix: characterNamePrefix(c, lang),
      searchNames: [...new Set(names.map(norm).filter(Boolean))],
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      chainType: c.chainType,
      gift: c.gift,
      role: curated[c.id]?.role,
      isFusion: c.isFusion,
      // Tags DÉRIVÉS DU JEU + le seul tag humain (`free`, curé).
      tags: characterTags(c, curated),
    };
  });
}

/**
 * Libellés du browser (client) pré-traduits côté serveur — même pattern que la
 * page équipement (aucun contexte i18n en V3, tout passe par props). Les maps
 * d'options sont dérivées des valeurs réellement présentes.
 */
function buildLabels(rows: CharacterRow[], lang: Lang, t: TFunction): CharactersBrowserLabels {
  const optionMap = (values: Array<string | undefined>, prefix: string) =>
    Object.fromEntries(
      [...new Set(values.filter((v): v is string => Boolean(v)))].map((v) => [
        v,
        t(`${prefix}.${v}` as TranslationKey),
      ]),
    );

  const chainMap = Object.fromEntries(
    [...new Set(rows.map((r) => r.chainType).filter((v): v is string => Boolean(v)))].map((v) => [
      v,
      t(`characters.chains.${CHAIN_LABEL[v] ?? v}` as TranslationKey),
    ]),
  );
  const giftMap = Object.fromEntries(
    [...new Set(rows.map((r) => r.gift).filter((v): v is string => Boolean(v)))].map((v) => [
      v,
      GIFT_NAMES[v]?.[lang] ?? GIFT_NAMES[v]?.en ?? v,
    ]),
  );
  const allTags = [...new Set(rows.flatMap((r) => r.tags))];
  const tagMap = Object.fromEntries(
    allTags.map((tg) => [tg, tg.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())]),
  );
  const tagIcons = Object.fromEntries(allTags.map((tg) => [tg, img.tag(tg)]));

  return {
    bar: {
      searchPlaceholder: t('characters.filters.search_placeholder'),
      elements: t('filters.elements'),
      classes: t('filters.classes'),
      rarity: t('filters.rarity'),
      filtersTitle: t('characters.filters.title'),
      advanced: t('characters.filters.advanced'),
      starAria: t('aria.star_rarity'),
    },
    panel: {
      tabCombat: t('characters.filters.tab.combat'),
      tabEffects: t('characters.filters.tab.effects'),
      tabBonus: t('characters.filters.tab.bonus'),
      tabTags: t('characters.filters.tab.tags'),
      chains: t('characters.filters.chains'),
      roles: t('characters.filters.roles'),
      gifts: t('characters.filters.gifts'),
      teamBonus: t('characters.filters.teamBonus'),
      tags: t('characters.filters.tab.tags'),
      matchLogic: t('characters.filters.match_logic'),
    },
    strip: {
      count: t('characters.filters.count'),
      emptyHint: t('characters.filters.empty_hint'),
      reset: t('characters.filters.reset'),
      copy: t('characters.filters.copy'),
      copied: t('common.copied'),
    },
    drawer: {
      advanced: t('characters.filters.advanced'),
      reset: t('characters.filters.reset'),
      close: t('characters.filters.close'),
      matches: t('characters.filters.count'),
    },
    sidebar: { advanced: t('characters.filters.advanced'), reset: t('characters.filters.reset') },
    noMatch: t('characters.filters.no_match'),
    reset: t('characters.filters.reset'),
    options: {
      element: optionMap(
        rows.map((r) => r.element),
        'sys.element',
      ),
      class: optionMap(
        rows.map((r) => r.class),
        'sys.class',
      ),
      role: optionMap(
        rows.map((r) => r.role),
        'filters.roles',
      ),
      chain: chainMap,
      gift: giftMap,
      tag: tagMap,
    },
    tagIcons,
  };
}

export default async function CharactersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  const rows = buildRows(lang);

  const itemList = buildItemListJsonLd({
    name: t('page.characters.title'),
    url: buildUrl(lang, '/characters'),
    itemListOrder: 'Unordered',
    items: [...rows]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({ name: r.name, url: buildUrl(lang, `/characters/${r.slug}`) })),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <JsonLd data={itemList} />
      <div>
        <h1 className="text-content-strong text-2xl font-bold">{t('page.characters.title')}</h1>
        <p className="text-content-muted text-sm">{t('page.characters.description')}</p>
      </div>
      <CharactersBrowser rows={rows} labels={buildLabels(rows, lang, t)} />
    </div>
  );
}
