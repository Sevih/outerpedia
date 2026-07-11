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
import BannerGrid from './BannerGrid';
import TieredList from './TieredList';
import type { CategoryViewProps } from './types';

export default function CategoryView(props: CategoryViewProps) {
  switch (props.category) {
    case 'general-guides':
      return <TieredList {...props} />;

    // Modes à bannière : une seule vue, trois catégories. La V2 avait TROIS
    // fichiers strictement identiques (GuildRaidList / WorldBossList /
    // JointChallengeList).
    case 'guild-raid':
    case 'world-boss':
    case 'joint-challenge':
      return <BannerGrid {...props} />;

    default:
      return <DefaultGrid {...props} />;
  }
}

export type { CategoryView, CategoryViewProps } from './types';
