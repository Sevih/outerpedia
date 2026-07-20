import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { characterDisplayName, getCharacter, slugForId } from '@/lib/data/characters';
import { computeGearUsage, type GearCategory } from './usage';
import { GearUsageBrowser, type GearUsageLabels, type GearUsageRow } from './GearUsageBrowser';

/**
 * Gear Usage Statistics — wrapper SERVEUR : agrège l'usage depuis la gear-reco
 * curée (`usage.ts`), localise noms d'items et de persos (aucun contexte i18n
 * client en V3) et passe le tout au browser. Persos dans l'ordre d'agrégation
 * (parité V2) ; un perso sans fiche publique est écarté de la liste dépliée.
 */
export default async function GearUsageStatistics({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const usage = computeGearUsage();

  const rows = Object.fromEntries(
    (Object.keys(usage) as GearCategory[]).map((cat) => [
      cat,
      usage[cat].map((e): GearUsageRow => ({
        key: e.key,
        name: lRec(e.name, lang) || e.name.en,
        searchNames: [
          ...new Set(
            Object.values(e.name)
              .map((n) => n.normalize('NFKC').toLowerCase().trim())
              .filter(Boolean),
          ),
        ],
        icon: e.icon,
        grade: e.grade,
        star: e.star,
        overlayIcon: e.overlayIcon,
        classType: e.classType,
        count: e.characters.length,
        characters: e.characters.flatMap((id) => {
          const c = getCharacter(id);
          const slug = slugForId(id);
          return c && slug ? [{ id, slug, name: characterDisplayName(c, lang) }] : [];
        }),
      })),
    ]),
  ) as Record<GearCategory, GearUsageRow[]>;

  const labels: GearUsageLabels = {
    disclaimer: t('tools.gear-usage-statistics.disclaimer1'),
    searchPlaceholder: t('search.placeholder'),
    tabs: {
      weapon: t('tools.gear-usage-statistics.tab.weapons'),
      amulet: t('tools.gear-usage-statistics.tab.amulets'),
      set: t('tools.gear-usage-statistics.tab.sets'),
      talisman: t('tools.gear-usage-statistics.tab.talismans'),
    },
    charsUnit: t('tierlist.characters_count'),
  };

  return <GearUsageBrowser data={rows} labels={labels} />;
}
