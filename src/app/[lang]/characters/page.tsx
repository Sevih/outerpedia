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
import { buildEffectGroups, canonicalizeKeys } from '@/lib/data/effect-filters';
import { img } from '@/lib/images';
import { STAT_ICON } from '@/lib/stats';
import glossariesData from '@data/generated/glossaries.json';

export const revalidate = 86400;

/** chainType (donnée) → clé de libellé i18n. */
const CHAIN_LABEL: Record<string, string> = {
  start: 'starter',
  join: 'companion',
  finish: 'finisher',
};

/** Sources de skill filtrables (ordre d'affichage) → clé i18n. */
const SKILL_SOURCES: { value: string; labelKey: TranslationKey }[] = [
  { value: 's1', labelKey: 'page.character.skill.type.s1' },
  { value: 's2', labelKey: 'page.character.skill.type.s2' },
  { value: 'ultimate', labelKey: 'characters.filters.sources.skill3' },
  { value: 'chainPassive', labelKey: 'characters.filters.sources.chainPassive' },
  { value: 'fusionPassive', labelKey: 'characters.filters.sources.fusionPassive' },
  { value: 'dualAttack', labelKey: 'characters.filters.sources.dualAttack' },
  { value: 'exclusiveEquip', labelKey: 'equip.tab.ee' },
];

/** Ordre canonique des stats de bonus d'équipe (parité V2). */
const TEAM_BONUS_ORDER = [
  'SPD',
  'ATK',
  'HP',
  'DEF',
  'CHD',
  'CHC',
  'DMG UP%',
  'DMG RED%',
  'PEN%',
  'EFF',
  'RES',
  'LS',
];

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
      // Effets repliés sur leurs clés CANONIQUES ici (serveur) — le client ne
      // fait plus que de l'appartenance d'ensemble (glossaires hors bundle).
      buff: canonicalizeKeys('buff', c.buff),
      debuff: canonicalizeKeys('debuff', c.debuff),
      effectsBySource: c.effectsBySource
        ? Object.fromEntries(
            Object.entries(c.effectsBySource).map(([src, v]) => [
              src,
              {
                buff: canonicalizeKeys('buff', v.buff),
                debuff: canonicalizeKeys('debuff', v.debuff),
              },
            ]),
          )
        : undefined,
      teamBonuses: c.teamBonuses,
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

  // ── Filtres d'effets / bonus (options dérivées des agrégats canoniques) ──
  const buffGroups = buildEffectGroups(
    'buff',
    new Set(rows.flatMap((r) => r.buff ?? [])),
    lang,
    (cat) => t(`characters.effectsGroups.buff.${cat}` as TranslationKey),
  );
  const debuffGroups = buildEffectGroups(
    'debuff',
    new Set(rows.flatMap((r) => r.debuff ?? [])),
    lang,
    (cat) => t(`characters.effectsGroups.debuff.${cat}` as TranslationKey),
  );
  // Sources réellement présentes (pas de pill morte), dans l'ordre canonique.
  const presentSources = new Set(rows.flatMap((r) => Object.keys(r.effectsBySource ?? {})));
  const sources = SKILL_SOURCES.filter((s) => presentSources.has(s.value)).map((s) => ({
    value: s.value,
    label: t(s.labelKey),
  }));
  // Bonus d'équipe présents, triés canoniquement, avec icône de stat.
  const presentBonuses = new Set(rows.flatMap((r) => r.teamBonuses ?? []));
  const teamBonus = TEAM_BONUS_ORDER.filter((v) => presentBonuses.has(v)).map((v) => ({
    value: v,
    label: v,
    icon: STAT_ICON[v] ? img.statIcon(STAT_ICON[v]) : undefined,
  }));

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
      buffs: t('characters.filters.buffs'),
      debuffs: t('characters.filters.debuffs'),
      filterBySource: t('characters.filters.sources.filterBySource'),
      unique: t('characters.filters.unique'),
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
    effects: { buff: buffGroups, debuff: debuffGroups, sources, teamBonus },
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
    // Gabarit V2 : pleine largeur (pas de max-w), en-tête centré, doubles paddings
    // (outer px-4/md:px-6 + inner px-2/md:px-4 côté browser) — parité exacte.
    <div className="px-4 py-6 md:px-6">
      <JsonLd data={itemList} />
      <h1 className="text-content-strong mx-auto text-center text-3xl font-bold">
        {t('page.characters.title')}
      </h1>
      <p className="text-content-muted mt-2 mb-4 text-center text-sm">
        {t('page.characters.description')}
      </p>
      <CharactersBrowser rows={rows} labels={buildLabels(rows, lang, t)} />
    </div>
  );
}
