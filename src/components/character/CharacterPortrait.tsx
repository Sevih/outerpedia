import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';

/**
 * Portrait compact d'un personnage (face icon FI_*) + overlays — géométrie du
 * thumbnail du jeu, comme en V2 : élément en haut à droite, classe à droite au
 * milieu, étoiles de rareté centrées en bas et légèrement chevauchées. Nom en
 * dessous. Le format « référence de perso » des pages équipement. Composant pur.
 */
export function CharacterPortrait({
  id,
  name,
  element,
  classType,
  rarity,
  size = 64,
  href,
  showName = true,
}: {
  id: string;
  name: string;
  element?: string;
  classType?: string;
  /** Nombre d'étoiles de rareté (masquées si absent). */
  rarity?: number;
  size?: number;
  href?: string;
  /**
   * Nom sous le portrait. À couper quand l'appelant écrit déjà les noms à côté
   * (persos recommandés d'un guide) : sinon chaque nom apparaît deux fois.
   * L'`alt` de l'image le porte de toute façon.
   */
  showName?: boolean;
}) {
  const starSize = Math.round(size * 0.17);
  const content = (
    <span className="flex w-full flex-col items-center gap-1">
      <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <img
          src={img.face(id)}
          alt={name}
          loading="lazy"
          width={size}
          height={size}
          className="border-line-subtle h-full w-full rounded-lg border object-cover"
        />
        {element && (
          <img
            src={img.element(element)}
            alt={element}
            className="absolute -top-1 -right-1 h-[39%] w-[39%] drop-shadow-md"
          />
        )}
        {classType && (
          <img
            src={img.klass(classType)}
            alt={classType}
            className="absolute top-[40%] right-0 h-[27%] w-[27%] drop-shadow-md"
          />
        )}
        {rarity ? (
          <span
            className="absolute inset-x-0 bottom-[3%] flex items-center justify-center"
            role="img"
            aria-label={`${rarity} stars`}
          >
            {Array.from({ length: rarity }, (_, i) => (
              <img
                key={i}
                src={img.star()}
                alt=""
                aria-hidden
                width={starSize}
                height={starSize}
                className="drop-shadow-md"
                style={{ marginLeft: i ? -starSize * 0.25 : 0 }}
              />
            ))}
          </span>
        ) : null}
      </span>
      {showName && (
        <span
          className="text-content-strong w-full truncate text-center text-xs font-semibold"
          style={{ maxWidth: size + 24 }}
        >
          {name}
        </span>
      )}
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href as Route} className="transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
