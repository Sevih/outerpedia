import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { characterDisplayName, getCharacter, slugForId } from '@/lib/data/characters';
import { computeFinderData, type RawFinderGear } from './finder';
import {
  GearUsageFinderBrowser,
  type FinderCharacter,
  type FinderGearItem,
  type FinderLabels,
} from './GearUsageFinderBrowser';

/**
 * Gear Usage Finder — wrapper SERVEUR : assemble les données depuis la
 * gear-reco curée (`finder.ts`), localise noms d'items et de persos (aucun
 * contexte i18n client en V3) et passe le tout au browser. Seuls les persos
 * apparaissant dans un build sont embarqués ; un perso sans fiche publique est
 * écarté (ses builds ne matcheront pas).
 */
export default async function GearUsageFinder({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const data = computeFinderData();

  const localize = (items: RawFinderGear[]): FinderGearItem[] =>
    items.map((g) => ({ ...g, name: lRec(g.name, lang) || g.name.en }));

  const characters = [...new Set(data.builds.map((b) => b.charId))].flatMap(
    (id): FinderCharacter[] => {
      const c = getCharacter(id);
      const slug = slugForId(id);
      return c && slug ? [{ id, slug, name: characterDisplayName(c, lang), class: c.class }] : [];
    },
  );

  const labels: FinderLabels = {
    modes: {
      reco: {
        label: t('tools.gear-usage-finder.mode_reco'),
        desc: t('tools.gear-usage-finder.mode_reco.desc'),
      },
      free: {
        label: t('tools.gear-usage-finder.mode_free'),
        desc: t('tools.gear-usage-finder.mode_free.desc'),
      },
    },
    stepType: t('tools.gear-usage-finder.step_type'),
    stepClass: t('tools.gear-usage-finder.step_class'),
    stepMain: t('tools.gear-usage-finder.step_mainstat'),
    stepSubs: t('tools.gear-usage-finder.step_substats'),
    stepSet: t('tools.gear-usage-finder.step_set'),
    types: {
      weapon: t('page.character.gear.weapon'),
      amulet: t('page.character.gear.amulet'),
      set: t('page.character.gear.set'),
    },
    matches: t('tools.gear-usage-finder.matches'),
    noUsers: t('tools.gear-usage-finder.no_users'),
  };

  return (
    <GearUsageFinderBrowser
      weapons={localize(data.weapons)}
      amulets={localize(data.amulets)}
      sets={localize(data.sets)}
      builds={data.builds}
      characters={characters}
      labels={labels}
    />
  );
}
