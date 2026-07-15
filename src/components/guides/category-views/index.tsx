/**
 * REGISTRE des vues de catégorie de guides — point de dispatch UNIQUE.
 *
 * Une catégorie sans vue dédiée retombe sur `DefaultGrid` : ajouter une
 * catégorie donne toujours une page correcte, jamais une page nue (en V2, une
 * vue non enregistrée dans le registre = liste vide, sans erreur).
 *
 * Une vue ne connaît QUE `{ lang, category, guides }`. Si elle a besoin d'autre
 * chose (palier, boss…), ça passe par un champ de `meta.json` validé au scan —
 * jamais par une table slug→valeur écrite en dur dans le composant, qui était
 * le vice de forme de toutes les vues V2.
 *
 * Dispatch en `switch` (et non en table) pour que les composants restent
 * STATIQUES : React interdit de fabriquer un composant pendant le rendu.
 */
import DefaultGrid from './DefaultGrid';
import AdventureSeasons from './AdventureSeasons';
import AdventureLicense from './AdventureLicense';
import BannerGrid from './BannerGrid';
import IrregularChaseMap from './IrregularChaseMap';
import TieredList from './TieredList';
import SingularityRotation from './SingularityRotation';
import SpecialRequestSplit from './SpecialRequestSplit';
import SkywardTowerView from './SkywardTowerView';
import MonadGateView from './MonadGateView';
import type { CategoryViewProps } from './types';

export default function CategoryView(props: CategoryViewProps) {
  switch (props.category) {
    case 'general-guides':
      return <TieredList {...props} />;

    // Rotation quotidienne : la vue affiche le boss du jour, donc la page PÉRIME
    // chaque nuit — sa route est purgée par `/api/revalidate`.
    case 'dimensional-singularity':
      return <SingularityRotation {...props} />;

    // Modes à bannière : une seule vue, trois catégories. La V2 avait TROIS
    // fichiers strictement identiques (GuildRaidList / WorldBossList /
    // JointChallengeList).
    case 'guild-raid':
    case 'world-boss':
    case 'joint-challenge':
      return <BannerGrid {...props} />;

    // L'histoire : une section par saison (meta.order = saison × 100 + épisode),
    // une carte par stage guidé — les boss restent derrière un toggle spoiler.
    case 'adventure':
      return <AdventureSeasons {...props} />;

    // Galerie de cartes de licence en deux onglets (Weekly / Promotion) —
    // les promotions sont des cartes-spoiler à retourner (icônes *_Lock/_Open).
    case 'adventure-license':
      return <AdventureLicense {...props} />;

    // Deux modes permanents sous une même catégorie : sections par mode, ordre
    // du jeu lu sur les combats désignés (meta.group — requis au scan).
    case 'special-request':
      return <SpecialRequestSplit {...props} />;

    // Quatre poursuites permanentes : la CARTE du mode (art de la catégorie),
    // un pin par poursuite placé par meta.mapPos — requis au scan, comme
    // bossId (nom + portrait du pin) et group (butin dérivé du donjon).
    case 'irregular-extermination':
      return <IrregularChaseMap {...props} />;

    // Deux familles de tours : difficulté (bannières) et élémentaire (cartes
    // hautes) — section, élément et ordre lus sur meta.tower (clé towers.json).
    case 'skyward-tower':
      return <SkywardTowerView {...props} />;

    // Deux sections : profondeurs Story (1-5, cartes fixes) et Endless (6-10,
    // sélecteur) — depth/route lus sur le meta, variantes de map via meta.variants.
    case 'monad-gate':
      return <MonadGateView {...props} />;

    default:
      return <DefaultGrid {...props} />;
  }
}

export type { CategoryView, CategoryViewProps } from './types';
