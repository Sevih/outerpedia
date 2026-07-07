import { img } from '@/lib/images';

/**
 * Tuile d'item : cadre de rareté du jeu (TI_Slot_*) + icône + étoiles en bas
 * + éventuelle icône d'effet (passif) en haut à droite. Composant pur.
 *
 * État « live » optionnel (page détail) : badge +N (enhancement) en bas à
 * droite, badge T<n> (breakthrough) en bas à gauche, étoiles/cadre Singularity
 * quand l'item est ascendé — apparence du jeu, comme en V2.
 */
export function EquipmentIcon({
  icon,
  grade,
  alt = '',
  size = 70,
  stars,
  overlayIcon,
  classType,
  src,
  ascended = false,
  enhanceLevel,
  tier,
}: {
  /** Nom de sprite d'item (namespace images/equipment). Ignoré si `src`. */
  icon?: string;
  grade: string;
  alt?: string;
  size?: number;
  /** Nombre d'étoiles à afficher en bas de tuile. */
  stars?: number;
  /** Icône d'effet (passif) posée en haut à droite (namespace images/equipment). */
  overlayIcon?: string;
  /** Slug de classe : icône posée à droite, sous l'icône d'effet (comme en jeu/V2). */
  classType?: string;
  /** URL d'image complète (portraits EE) — remplace `icon`. */
  src?: string;
  /** Item ascendé : étoiles + cadre Singularity, +N en dégradé. */
  ascended?: boolean;
  /** Niveau d'amélioration courant (badge +N, masqué à 0). */
  enhanceLevel?: number;
  /** Palier de breakthrough courant (badge T<n>, masqué à 0). */
  tier?: number;
}) {
  const starSize = Math.max(8, Math.round(size * 0.18));
  const badgeFontSize = Math.max(9, Math.round(size * 0.14));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={img.slotFrame(ascended ? 'singularity' : grade)}
        alt=""
        className="absolute inset-0 h-full w-full"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={src ?? img.equipment(icon ?? '')}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-contain p-[6%]"
      />
      {overlayIcon && (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img
          src={img.equipment(overlayIcon)}
          alt=""
          className="absolute top-[2%] right-[2%] h-[26%] w-[26%]"
        />
      )}
      {classType && (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img
          src={img.klass(classType)}
          alt={classType}
          title={classType}
          className="absolute top-[30%] right-[2%] h-[24%] w-[24%]"
        />
      )}
      {tier ? (
        <span
          className="text-content-strong absolute bottom-[22%] left-[5%] font-mono leading-none font-bold italic"
          style={{ fontSize: badgeFontSize }}
        >
          T{tier}
        </span>
      ) : null}
      {enhanceLevel ? (
        <span
          className="bg-surface-base/85 absolute inline-flex items-center rounded-sm px-1 py-px leading-none font-semibold"
          style={{ bottom: `${22}%`, right: `${4}%`, fontSize: badgeFontSize }}
        >
          <span className={ascended ? 'singularity-text' : 'text-content-strong'}>
            +{enhanceLevel}
          </span>
        </span>
      ) : null}
      {stars ? (
        <div
          className="absolute inset-x-0 bottom-[4%] flex justify-center"
          role="img"
          aria-label={`${stars} stars`}
        >
          {Array.from({ length: stars }, (_, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
            <img
              key={i}
              src={ascended ? img.starSingularity() : img.star()}
              alt=""
              style={{ width: starSize, height: starSize, marginLeft: i ? -starSize * 0.3 : 0 }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
