import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { characterNamePrefix, characterSearchNames, getAllCharacters } from '@/lib/data/characters';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import {
  PullSimulatorBrowser,
  type GachaChar,
  type GachaMinor,
  type PullSimLabels,
} from './PullSimulatorBrowser';

const LIMITED_TAGS = new Set(['limited', 'seasonal', 'collab']);

/**
 * Pull Simulator — wrapper SERVEUR : construit les pools de gacha depuis le
 * catalogue de persos (noms/préfixes localisés, recherche multilingue). Les
 * entités core-fusion sont EXCLUES : elles ne se tirent pas, elles se
 * fusionnent. Rareté 1/2 = pools mineurs (remplissage des résultats), rareté 3
 * = pool principal, catégorisé par tags (premium / limited-seasonal-collab /
 * le reste). Les tirages eux-mêmes vivent dans `@/lib/gacha` (client).
 */
export default async function PullSimulator({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const aliases = loadSearchAliases();

  const characters: GachaChar[] = [];
  const pool1: GachaMinor[] = [];
  const pool2: GachaMinor[] = [];

  for (const c of getAllCharacters()) {
    if (c.originalCharacter) continue;
    const minor: GachaMinor = {
      id: c.id,
      name: (c.name as Record<string, string>)[lang] ?? c.name.en,
      prefix: characterNamePrefix(c, lang) ?? undefined,
    };
    if (c.rarity === 1) {
      pool1.push(minor);
      continue;
    }
    if (c.rarity === 2) {
      pool2.push(minor);
      continue;
    }
    const category = c.tags?.includes('premium')
      ? 'premium'
      : c.tags?.some((tag) => LIMITED_TAGS.has(tag))
        ? 'limited'
        : 'normal';
    characters.push({ ...minor, category, searchNames: characterSearchNames(c, aliases[c.id]) });
  }

  const byName = (a: GachaMinor, b: GachaMinor) => a.name.localeCompare(b.name);
  characters.sort(byName);
  pool1.sort(byName);
  pool2.sort(byName);

  const labels: PullSimLabels = {
    banners: {
      custom: t('tools.pull-simulator.banner.custom'),
      rateup: t('tools.pull-simulator.banner.rateup'),
      premium: t('tools.pull-simulator.banner.premium'),
      limited: t('tools.pull-simulator.banner.limited'),
    },
    etherCost: t('tools.pull-simulator.ether_cost'),
    guarantee: t('tools.pull-simulator.guarantee'),
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

  return (
    <PullSimulatorBrowser characters={characters} pool1={pool1} pool2={pool2} labels={labels} />
  );
}
