import { getT, type TFunction, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { buildItemListJsonLd, buildUrl, getMonthYear } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import {
  characterDisplayName,
  characterNamePrefix,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { getEEViews } from '@/lib/data/equipment';
import {
  TierListBrowser,
  type TierListBrowserLabels,
  type TierListRow,
} from '@/components/tierlist/TierListBrowser';
import { TIERS, tierListRankOrder } from '@/components/tierlist/tiers';

/** Ordre canonique des rôles (pills de la barre). */
const ROLE_ORDER = ['dps', 'support', 'sustain'];

export type TierListMode = 'pve' | 'pvp' | 'ee-base' | 'ee-plus10';

const SLUG: Record<TierListMode, string> = {
  pve: 'tierlistpve',
  pvp: 'tierlistpvp',
  'ee-base': 'ee-priority-base',
  'ee-plus10': 'ee-priority-plus10',
};

const DISCLAIMER: Record<TierListMode, TranslationKey> = {
  pve: 'tierlist.disclaimer_pve',
  pvp: 'tierlist.disclaimer_pvp',
  'ee-base': 'tierlist.disclaimer_ee_base',
  'ee-plus10': 'tierlist.disclaimer_ee_plus10',
};

const norm = (s: string) => s.normalize('NFKC').toLowerCase().trim();

/**
 * Rang par perso selon le mode : PvE/PvP lisent le curé personnage
 * (`rank`/`rankPvp`), les modes EE la jointure équipement exclusif → porteur
 * (`getEEViews`, rangs `rank`/`rank10` du curé équipement).
 */
function rankByCharacter(mode: TierListMode): Map<string, string> {
  const out = new Map<string, string>();
  if (mode === 'pve' || mode === 'pvp') {
    for (const [id, cu] of Object.entries(loadCuratedCharacters())) {
      const rank = mode === 'pve' ? cu.rank : cu.rankPvp;
      if (rank) out.set(id, rank);
    }
  } else {
    for (const ee of getEEViews()) {
      const rank = mode === 'ee-base' ? ee.rank : ee.rank10;
      if (rank) out.set(ee.characterId, rank);
    }
  }
  return out;
}

/**
 * Socle SERVEUR commun aux 4 tier lists par perso (PvE, PvP, EE base, EE +10) :
 * lignes construites depuis la liste extraite + le rang du mode, libellés
 * pré-traduits (aucun contexte i18n client en V3), JSON-LD ItemList trié S→E
 * (parité V2 — étendu aux EE, la V2 ne l'avait que sur PvE/PvP). Spécificités de
 * mode : sélecteur de transcendance + surcharges `rankByTranscend` en PvE seul,
 * groupe Rôles sur PvE/PvP seuls, légende des tiers sur les EE seuls (parité V2).
 */
export async function TierListTool({ lang, mode }: { lang: Lang; mode: TierListMode }) {
  const t = await getT(lang);
  const slug = SLUG[mode];
  const curated = loadCuratedCharacters();
  const ranks = rankByCharacter(mode);

  const rows: TierListRow[] = getCharacterListItems()
    .map((c) => {
      const cu = curated[c.id] ?? {};
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
        role: cu.role,
        tags: characterTags(c, curated),
        rank: ranks.get(c.id),
        ...(mode === 'pve'
          ? { rankByTranscend: cu.rankByTranscend, roleByTranscend: cu.roleByTranscend }
          : {}),
      };
    })
    // PvE : un perso rangé seulement par palier de transcendance reste listé.
    .filter((r) => r.rank || r.rankByTranscend);

  const itemList = buildItemListJsonLd({
    name: `${t(`tools.${slug}` as TranslationKey)} — ${getMonthYear(lang)}`,
    description: t(`tools.${slug}.desc` as TranslationKey),
    url: buildUrl(lang, `/${slug}`),
    itemListOrder: 'Descending',
    items: [...rows]
      .filter((r) => r.rank)
      .sort(tierListRankOrder((r) => r.rank))
      .map((r) => ({ name: r.name, url: buildUrl(lang, `/characters/${r.slug}`) })),
  });

  const labels = buildLabels(t, mode, rows);

  return (
    <>
      <JsonLd data={itemList} id="ld-tierlist" />
      <TierListBrowser rows={rows} labels={labels} withTranscend={mode === 'pve'} />
    </>
  );
}

function buildLabels(t: TFunction, mode: TierListMode, rows: TierListRow[]): TierListBrowserLabels {
  const isEe = mode === 'ee-base' || mode === 'ee-plus10';
  const presentRoles = new Set(rows.map((r) => r.role).filter(Boolean));
  return {
    disclaimer: t(DISCLAIMER[mode]),
    ...(mode === 'pve' ? { transcendLevel: t('tierlist.transcend_level') } : {}),
    charactersCount: t('tierlist.characters_count'),
    bar: {
      searchPlaceholder: t('characters.filters.search_placeholder'),
      elements: t('filters.elements'),
      classes: t('filters.classes'),
      rarity: t('filters.rarity'),
      roles: t('characters.filters.roles'),
      filtersTitle: t('characters.filters.title'),
      advanced: t('characters.filters.advanced'),
      starAria: t('aria.star_rarity'),
    },
    // Rôles sur PvE/PvP seuls ; légende du sens des tiers sur les EE seuls
    // (parité V2).
    ...(isEe
      ? {
          legend: TIERS.map((tier) => ({
            tier,
            label: t(`tierlist.legend.${tier}` as TranslationKey),
          })),
        }
      : {
          roles: ROLE_ORDER.filter((v) => presentRoles.has(v)).map((v) => ({
            value: v,
            label: t(`filters.roles.${v}` as TranslationKey),
          })),
        }),
  };
}
