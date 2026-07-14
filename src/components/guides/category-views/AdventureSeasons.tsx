import { getT, type TFunction } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import type { Guide } from '@/lib/data/guides';
import { encountersOfIds } from '@/lib/data/encounters';
import { getMonster, monsterIconSrc } from '@/lib/data/monsters';
import { EmptyCategory } from './EmptyCategory';
import { AdventureGrid, type SeasonSection, type StageCard } from './AdventureGrid';
import type { CategoryViewProps } from './types';

/**
 * Vue ADVENTURE (visuel V2) : une section par SAISON, une carte par stage guidé
 * — l'art de la zone en fond, le boss révélé à la demande (cf. `AdventureGrid`).
 *
 * Tout se lit dans le meta et la donnée du jeu. La saison et l'épisode viennent
 * d'`order` (exigé par la catégorie) — surtout PAS d'`encounters.season`, qui
 * numérote des blocs d'histoire et non les saisons du jeu (la S2 y vaut 2 pour
 * les épisodes 1-5 et 3 pour les 6-10). La ZONE vient du donjon le plus DUR de
 * `meta.dungeons` — celui pour lequel le guide est écrit. La V2 tenait la même
 * page avec un `area_name.json` curé à la main et une carte boss générée dans un
 * `guide-boss-map.json` : deux fichiers qui doublonnaient une donnée que le jeu
 * nous donne déjà.
 */
export default async function AdventureSeasons({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;

  // `listGuidesByCategory` a déjà trié sur `order` (croissant) et `Map.groupBy`
  // préserve l'ordre d'insertion : saisons et cartes sont donc déjà en place.
  const bySeason = Map.groupBy(guides, (g) => seasonOf(g));

  const sections: SeasonSection[] = [...bySeason].map(([season, stages]) => ({
    season,
    label: t('guides.adventure.season', { n: season }),
    stages: stages.map((g) => stageCard(g, lang, t)),
  }));

  return (
    <AdventureGrid
      sections={sections}
      labels={{
        reveal: t('guides.adventure.spoiler'),
        hide: t('guides.adventure.spoiler_free'),
      }}
    />
  );
}

/** `order` = saison × 100 + épisode (cf. `GuideMeta.order`). */
function seasonOf(guide: Guide): number {
  return Math.floor(requireOrder(guide) / 100);
}

function requireOrder(guide: Guide): number {
  // `requires: ['order']` au scan — le garde reste pour un appel hors catégorie.
  if (guide.order === undefined) {
    throw new Error(
      `AdventureSeasons : « ${guide.category}/${guide.slug} » sans order dans son meta ` +
        `(saison × 100 + épisode — c'est lui qui range la carte dans sa saison).`,
    );
  }
  return guide.order;
}

/** Une carte de stage : le meta pour l'art et le boss, le donjon pour le reste. */
function stageCard(guide: Guide, lang: Lang, t: TFunction): StageCard {
  const at = `${guide.category}/${guide.slug}`;
  if (!guide.dungeons?.length || !guide.bossId) {
    throw new Error(`AdventureSeasons : « ${at} » sans dungeons/bossId dans son meta.`);
  }
  // Le dernier donjon déclaré est le plus DUR : c'est celui que le guide traite,
  // donc celui qui nomme la carte (`encountersOfIds` jette sur un id inconnu).
  const ladder = encountersOfIds(guide.dungeons);
  const dungeon = ladder[ladder.length - 1].ref;
  const monster = getMonster(guide.bossId);
  if (!monster) {
    throw new Error(
      `AdventureSeasons : monstre « ${guide.bossId} » (${at}) absent de ` +
        `data/generated/monsters.json — à extraire/valider via l'admin (Extractor › Monsters).`,
    );
  }

  return {
    slug: guide.slug,
    href: localePath(lang, `/guides/${guide.category}/${guide.slug}`),
    episode: t('guides.adventure.episode', { n: requireOrder(guide) % 100 }),
    // La zone porte le nom que le joueur lit sur sa carte du monde ; le titre du
    // guide (« S3 Hard : Fatal ») le nommerait par son boss — c'est le spoiler
    // qu'on vient justement de mettre derrière un bouton.
    area: (dungeon.area ? lRec(dungeon.area, lang) : '') || lRec(guide.title, lang),
    src: img.guideIcon(guide.icon),
    boss: { name: lRec(monster.name, lang) || monster.name.en, src: monsterIconSrc(monster) },
  };
}
