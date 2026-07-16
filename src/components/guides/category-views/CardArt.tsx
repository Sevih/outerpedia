import { cn } from '@/lib/cn';
import { img } from '@/lib/images';

/**
 * CARTE-ART de landing — les couches partagées par les vues de catégorie
 * (tours élémentaires de SkywardTowerView, tuiles de MonadGateGallery) :
 * l'art en cover + voile(s) de lisibilité. Sans hook ni état : importable
 * des deux côtés (Server Components et vues client).
 */

/** Gabarit de la carte HAUTE : 3 par ligne en mobile, colonne étroite en desktop. */
export const ART_TILE =
  'relative h-40 w-[calc((100%-1.5rem)/3)] overflow-hidden rounded-lg sm:h-72 sm:w-36';

/**
 * Les couches de fond : l'art (sprite `guideIcon`) + voile bas (toujours —
 * lisibilité du pied) + voile haut optionnel (lisibilité du header des cartes
 * hautes). `hoverScale` pose le zoom sur L'IMAGE (parent `group` requis) ;
 * les cartes qui zooment leurs voiles avec l'art le font sur leur wrapper.
 */
export function GuideCardArt({
  icon,
  alt,
  topVeil = false,
  hoverScale = false,
}: {
  /** Nom de sprite (namespace guides) — résolu par `img.guideIcon`. */
  icon: string;
  alt: string;
  topVeil?: boolean;
  hoverScale?: boolean;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={img.guideIcon(icon)}
        alt={alt}
        loading="lazy"
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          hoverScale && 'transition-transform duration-300 group-hover:scale-105',
        )}
      />
      {topVeil && (
        <div className="from-surface-sunken/60 absolute inset-0 bg-linear-to-b to-transparent" />
      )}
      <div className="from-surface-sunken/80 via-surface-sunken/20 absolute inset-0 bg-linear-to-t to-transparent" />
    </>
  );
}
