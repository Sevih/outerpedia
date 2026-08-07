import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/cn';
import { img, RECRUIT_TAG_SPRITE } from '@/lib/images';

/**
 * Le nom TIENT-IL sur deux lignes dans `maxWidth` (px) ? Estimation
 * typographique, pas une mesure : le portrait est rendu côté serveur, il n'y a
 * pas de DOM à interroger. Largeur moyenne d'un caractère en `text-xs`
 * semibold, pleine chasse pour les scripts CJK, retour à la ligne glouton par
 * mots (un mot trop large est coupé par `wrap-break-word`, donc il consomme
 * plusieurs lignes). Volontairement grossier : se tromper d'un caractère fait
 * afficher « D.Stella » au lieu de « Demiurge Stella », ça ne casse rien.
 */
const NARROW_PX = 6.6;
const WIDE_PX = 12;
const SPACE_PX = 3.3;
/** Scripts à pleine chasse (kana, hangul, idéogrammes, ponctuation large). */
const WIDE_CHAR = /[ᄀ-ᇿ⺀-꓏가-퟿豈-﫿︰-﹏＀-｠]/;

function fitsOnTwoLines(text: string, maxWidth: number): boolean {
  const widthOf = (s: string): number =>
    [...s].reduce((w, ch) => w + (WIDE_CHAR.test(ch) ? WIDE_PX : NARROW_PX), 0);
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const w = widthOf(word);
    if (used > 0 && used + SPACE_PX + w > maxWidth) {
      lines += 1;
      used = 0;
    }
    if (w > maxWidth) {
      // Mot plus large que la colonne : coupé, il occupe plusieurs lignes.
      const total = used + w;
      lines += Math.ceil(total / maxWidth) - 1;
      used = total % maxWidth;
    } else {
      used += (used ? SPACE_PX : 0) + w;
    }
    if (lines > 2) return false;
  }
  return true;
}

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
  dimmed = false,
  shortName,
  badgeTag,
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
  /**
   * Portrait translucide : le perso est montré pour situer sa place, mais il
   * n'est pas un choix réel (héros de collab dans les guides de pull).
   */
  dimmed?: boolean;
  /**
   * Nom COURT curé (`short-names.json`, déjà résolu dans la langue par
   * l'appelant : ce module lit le fs, le portrait tourne aussi côté client).
   * Employé UNIQUEMENT en dernier recours, quand le nom complet ne tient pas
   * sur les deux lignes disponibles — sinon on affiche toujours le vrai nom.
   */
  shortName?: string;
  /**
   * Badge de recrutement en haut à gauche (`collab`, `seasonal`, `premium`…),
   * même sprite et même coin que sur `CharacterCard`. Ignoré si le tag n'a pas
   * de sprite : la carte fait déjà ce filtre, on ne construit pas d'URL morte.
   */
  badgeTag?: string;
}) {
  const starSize = Math.round(size * 0.17);
  const badge = badgeTag && badgeTag in RECRUIT_TAG_SPRITE ? badgeTag : undefined;
  const label = shortName && !fitsOnTwoLines(name, size + 24) ? shortName : name;
  const content = (
    <span className={cn('flex w-full flex-col items-center gap-1', dimmed && 'opacity-70')}>
      <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <img
          src={img.face(id)}
          alt={name}
          loading="lazy"
          width={size}
          height={size}
          className="border-line-subtle h-full w-full rounded-lg border object-cover"
        />
        {badge && (
          <img
            src={img.recruitTag(badge)}
            alt={badge}
            className="absolute top-0 left-0 z-10 w-[55%] drop-shadow-md"
          />
        )}
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
        // Nom sur DEUX lignes au lieu d'une ligne tronquée : « Heatwave Cop
        // Delta » ou « Holy Night's Blessing Dianne » ne tiennent pas en
        // `size + 24`. La largeur reste celle du portrait (rangées alignées) et
        // la hauteur est réservée à 2 lignes (`2.5em` = 2 × `leading-tight`),
        // sinon un voisin à une seule ligne décentre les portraits entre eux.
        // `title` porte TOUJOURS le nom complet, y compris quand on se rabat
        // sur le nom court.
        <span
          title={name}
          className="text-content-strong line-clamp-2 min-h-[2.5em] w-full text-center text-xs leading-tight font-semibold wrap-break-word"
          style={{ maxWidth: size + 24 }}
        >
          {label}
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
