import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import type { Character } from '@contracts';
import {
  characterNamePrefix,
  characterSearchNames,
  getAllCharacters,
  getCharacter,
} from '@/lib/data/characters';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { hasTagInGroup } from '@/lib/data/tags';
import { getRecruitKind, getRecruitPool } from '@/lib/data/recruit';
import { BANNER_TYPES, RECRUIT_KIND_OF, bannerConfigOf, type BannerConfig } from '@/lib/gacha';
import {
  PullSimulatorBrowser,
  type GachaChar,
  type GachaMinor,
  type GachaPool,
  type PullSimLabels,
} from './PullSimulatorBrowser';

/**
 * Pull Simulator — wrapper SERVEUR. Deux listes, deux sources :
 *
 *   - les VEDETTES sélectionnables viennent du catalogue (noms/préfixes
 *     localisés, recherche multilingue) : les 3★ hors core-fusion — elles ne se
 *     tirent pas, elles se fusionnent —, catégorisés par tags : `premium`, la
 *     FAMILLE `limited` du glossaire (festival/seasonal/collab — la bannière
 *     limitée les tire tous les trois), puis le reste ;
 *   - le pool HORS FOCUS de chaque bannière (3★, 2★, 1★) vient des tables du
 *     jeu (`recruit.json`, `getRecruitPool`), avec le poids de chaque perso
 *     dans son palier — 1 pour tous quand le jeu n'en publie pas.
 *
 * Les tirages eux-mêmes vivent dans `@/lib/gacha`. Les configs de bannière
 * (taux, coûts, mileage, garantie du x10) se DÉRIVENT ici de `recruit.json` et
 * descendent en props, comme les pools : le moteur reste pur, et le bundle
 * client n'embarque pas la donnée générée.
 */
export default async function PullSimulator({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const aliases = loadSearchAliases();

  const minorOf = (c: Character): GachaMinor => ({
    id: c.id,
    name: (c.name as Record<string, string>)[lang] ?? c.name.en,
    prefix: characterNamePrefix(c, lang) ?? undefined,
    element: c.element,
    cls: c.class,
    rarity: c.rarity,
  });

  const characters: GachaChar[] = [];
  for (const c of getAllCharacters()) {
    if (c.originalCharacter || c.rarity !== 3) continue;
    const category = c.tags?.includes('premium')
      ? 'premium'
      : hasTagInGroup(c.tags ?? [], 'limited')
        ? 'limited'
        : 'normal';
    characters.push({
      ...minorOf(c),
      category,
      searchNames: characterSearchNames(c, aliases[c.id]),
    });
  }
  characters.sort((a, b) => a.name.localeCompare(b.name));

  const pools = Object.fromEntries(
    BANNER_TYPES.map((type) => {
      const pool: GachaPool = { 1: [], 2: [], 3: [] };
      for (const tier of getRecruitPool(RECRUIT_KIND_OF[type])) {
        pool[tier.rarity] = tier.characterIds.map((id) => ({
          id,
          weight: tier.weights?.[id] ?? 1,
        }));
      }
      return [type, pool];
    }),
  ) as Record<(typeof BANNER_TYPES)[number], GachaPool>;

  // De quoi AFFICHER ce qui sort des pools sans être une vedette possible : les
  // 1★ et 2★, et tout 3★ que le catalogue des vedettes ne porte pas.
  const displayable = new Set(characters.map((c) => c.id));
  const others: GachaMinor[] = [];
  for (const pool of Object.values(pools)) {
    for (const { id } of [...pool[1], ...pool[2], ...pool[3]]) {
      if (displayable.has(id)) continue;
      displayable.add(id);
      const c = getCharacter(id);
      if (c) others.push(minorOf(c));
    }
  }

  const labels: PullSimLabels = {
    banners: {
      custom: t('tools.pull-simulator.banner.custom'),
      rateup: t('tools.pull-simulator.banner.rateup'),
      premium: t('tools.pull-simulator.banner.premium'),
      limited: t('tools.pull-simulator.banner.limited'),
    },
    etherCost: t('tools.pull-simulator.ether_cost'),
    guarantee: t('tools.pull-simulator.guarantee'),
    focusGuarantee: t('tools.pull-simulator.focus_guarantee'),
    yes: t('tools.pull-simulator.yes'),
    no: t('tools.pull-simulator.no'),
    selectFocus: t('tools.pull-simulator.select_focus'),
    searchPlaceholder: t('tools.pull-simulator.search_placeholder'),
    pull1: t('tools.pull-simulator.pull1'),
    pull10: t('tools.pull-simulator.pull10'),
    reset: t('tools.pull-simulator.reset'),
    mileage: t('tools.pull-simulator.mileage'),
    useMileage: t('tools.pull-simulator.use_mileage'),
    results: t('tools.pull-simulator.results'),
    focus: t('tools.pull-simulator.focus'),
    noPulls: t('tools.pull-simulator.no_pulls'),
    stats: t('tools.pull-simulator.stats'),
    totalPulls: t('tools.pull-simulator.total_pulls'),
    totalEther: t('tools.pull-simulator.total_ether'),
    first3Star: t('tools.pull-simulator.first_3star'),
    firstFocus: t('tools.pull-simulator.first_focus'),
    never: t('tools.pull-simulator.never'),
    history: t('tools.pull-simulator.history'),
    batch: t('tools.pull-simulator.batch'),
  };

  const configs = Object.fromEntries(
    BANNER_TYPES.map((type) => [type, bannerConfigOf(type, getRecruitKind(RECRUIT_KIND_OF[type]))]),
  ) as Record<(typeof BANNER_TYPES)[number], BannerConfig>;

  return (
    <PullSimulatorBrowser
      characters={characters}
      others={others}
      pools={pools}
      labels={labels}
      configs={configs}
    />
  );
}
