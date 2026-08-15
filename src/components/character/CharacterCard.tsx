import Link from 'next/link';
import type { Route } from 'next';
import { img, RECRUIT_TAG_SPRITE } from '@/lib/images';
import { joinDisplayName } from '@/lib/data/characters';
import { CardPortrait } from '@/components/character/SettingsPortrait';
import { fitsOnTwoLines } from '@/components/character/CharacterPortrait';

/**
 * LA CARTE DE PERSO — le grand portrait du jeu, plus le chrome du SITE.
 *
 * Le rendu du portrait lui-même n'est PLUS ici : il vit dans `Portrait`, transcrit
 * du prefab `CUICharacterMainPageScrollCell`. Ce module portait avant 250 lignes de
 * mesures relevées à l'œil — trois gabarits fixes, chacun avec ses positions
 * d'étoiles, d'élément, de classe et ses corps de texte — et ces nombres
 * DIVERGEAIENT du jeu : ratio de cadre faux (0,5156 / 0,5208 / 0,5195 au lieu de
 * 0,5233) rattrapé par un `object-cover` qui rognait l'art, dégradé du bas inventé,
 * étoiles comptées sur la rareté au lieu de `ShowUIStar`. Tout ça est parti.
 *
 * Ce qui reste est exactement ce que le prefab N'A PAS :
 *
 *   - le LIEN vers la fiche ;
 *   - le BADGE de recrutement (`collab`, `premium`…), convention éditoriale du
 *     site. Le jeu n'a aucun badge de recrutement sur ce nœud — `m_BossImage`,
 *     `m_NewImage`, `m_RareFrameImage` et `m_RecommandImage` y sont tous NULL — il
 *     se pose donc PAR-DESSUS, au coin haut-gauche ;
 *   - le NOM SOUS LA CARTE aux petites tailles, avec son repli sur le nom court ;
 *   - l'étiquette a11y de la rareté, que le portrait rend en décoratif.
 *
 * Composant SERVEUR (aucun état, aucun hook) : les quatre appelants publics le
 * rendaient jusqu'ici via un `ResponsiveCharacterCard` client qui mesurait le
 * viewport au `useMediaQuery` — supprimé, cf. `SCALE`. Son portrait est délégué
 * à une feuille cliente (`CardPortrait`) qui applique les réglages du site
 * (skin choisi, portrait animé).
 */

/**
 * Les deux barèmes, en classes Tailwind pures. Largeur et placement du nom y sont
 * SOLIDAIRES par construction : c'est tout l'intérêt de la table, un appelant qui
 * les réglerait séparément finirait avec un nom illisible dans le cadre.
 *
 * Le seuil est 128 px — la largeur à laquelle le nom rendu atteint `text-xs`
 * (12 px), le plus petit corps du site. En dessous, `Portrait` masque son nom
 * (`textClassName`) et la carte l'écrit dessous ; au-dessus, l'inverse. C'est LE
 * SEUL nombre de ce fichier qui ne vienne pas du jeu, et il est ici plutôt que dans
 * `Portrait` parce que c'est un choix de lisibilité du site.
 *
 *              mobile    tablette   bureau     large
 *   default    80        104        128        152 px
 *              (44 %)    (58 %)     (71 %)     (84 % de la taille du jeu)
 *   palier     base      ≥ 640      ≥ 1024     ≥ 1440
 *   le nom     dessous   dessous    DEDANS     dedans
 *
 * Les deux paliers hauts sautent `md` et `xl` À DESSEIN. 128 px est la largeur où
 * le nom entre dans le cadre, et une tablette portrait (768) est trop étroite pour
 * qu'on lui prenne cette place. Grandir à `md` n'y gagnait d'ailleurs aucune
 * densité : 640, 768 et 1024 tenaient les mêmes 5 cartes par rangée sur
 * `/characters` — en restant à 104 jusqu'à 1024, on en tient 6 à 768.
 *
 * 1440 n'est PAS un breakpoint Tailwind (les défauts vont 1280 puis 1536) et n'a
 * pas à le devenir pour un seul usage : d'où la variante arbitraire. Les
 * breakpoints nommés du thème restent intacts pour les ~440 autres usages du site.
 *
 *   dense      80 jusqu'à `lg`, puis 104 — nom TOUJOURS dessous, quelle que soit la
 *              largeur : une rangée de tier list en aligne bien plus qu'une grille
 *
 * Les hauteurs suivent `aspect-180/344` : 153, 199, 245, 291.
 */

/**
 * Les largeurs du barème `default`, EXPORTÉES — la scène du carrousel d'équipe doit
 * chausser la carte au pixel près (cf. `TeamSlotCarousel`) et les recopiait ; la
 * copie a survécu à deux refontes de la carte et pointait encore de vieilles cotes.
 */
export const CARD_WIDTH = 'w-20 sm:w-26 lg:w-32 min-[1440px]:w-38';

/**
 * Les MÊMES largeurs, en pixels — l'ordre et les valeurs de `CARD_WIDTH`, à garder
 * côte à côte pour qu'une modification de l'une saute aux yeux sur l'autre (une
 * classe Tailwind ne se calcule pas depuis un nombre : le scanner ne lit que des
 * littéraux, la dérivation est impossible).
 *
 * Le carrousel d'équipe en a besoin AVANT tout rendu client : sa réserve latérale
 * doit être connue du serveur, sinon la rangée se réaligne sous les yeux du lecteur.
 */
export const CARD_PX = [80, 104, 128, 152] as const;

const SCALE = {
  default: {
    width: CARD_WIDTH,
    /** Le nom DANS le cadre, à partir du palier où il dépasse 12 px. */
    inFrame: 'hidden lg:flex',
    /** …et sous la carte en dessous. */
    below: 'lg:hidden',
    /**
     * Largeur de MESURE du libellé du dessous — le PLUS ÉTROIT des paliers où il
     * s'affiche, pas le plus large : ce qui tient en 80 tient a fortiori en 104,
     * l'inverse est faux. Mesurer au plus large (ce que faisait ce champ, à 104
     * px + 24 de marge héritée de `CharacterPortrait`, qui lui laisse son libellé
     * déborder la vignette) revenait à juger sur 128 px un texte rendu sur 80 :
     * le repli sur le nom court ne se déclenchait JAMAIS et les 16 noms trop longs
     * se faisaient tronquer par le `line-clamp-2`.
     */
    labelWidthPx: 80,
  },
  dense: {
    width: 'w-20 lg:w-26',
    inFrame: 'hidden',
    below: '',
    labelWidthPx: 80,
  },
} as const;

export type CharacterCardScale = keyof typeof SCALE;

export interface CharacterCardProps {
  id: string;
  /**
   * Le nom NU — `characterBaseName`, sans son titre. Le portrait écrit les deux
   * dans des champs séparés (`Text_Name` et `Text_Demi`), c'est donc sous cette
   * forme qu'ils doivent arriver : le nom complet se RECOMPOSE ici pour la ligne
   * sous la carte, il ne se décompose nulle part.
   */
  name: string;
  /** Le TITRE (« Core Fusion », le nickname des 21 persos qui l'affichent). */
  prefix?: string | null;
  /** Slugs canoniques (fire/striker…) — `Portrait` capitalise pour ses sprites. */
  element?: string;
  classType?: string;
  /** BasicStar 1..3 : avec `transcendence`, décide du rail d'étoiles. */
  rarity?: number;
  /**
   * Palier de transcendance (rareté..9). C'est LUI qui décide combien d'étoiles
   * s'allument, pas un compteur — jusqu'ici les appelants passaient le palier À LA
   * PLACE de la rareté pour obtenir le bon nombre, ce qui marchait par accident et
   * perdait la teinte du « + ».
   */
  transcendence?: number;
  /** Tags du perso, DÉJÀ TRIÉS par `sortTags` (le 1er badgeable fait le badge). */
  tags?: string[];
  /** Nom court curé, employé sous la carte quand le complet déborde deux lignes. */
  shortName?: string;
  scale?: CharacterCardScale;
  href?: string;
  /** Gabarit a11y localisé de la rareté (`{rarity}`) — défaut EN. */
  starAriaLabel?: string;
  priority?: boolean;
}

export function CharacterCard({
  id,
  name,
  prefix,
  element,
  classType,
  rarity,
  transcendence,
  tags,
  shortName,
  scale = 'default',
  href,
  starAriaLabel = '{rarity} star rarity',
  priority = false,
}: CharacterCardProps) {
  const s = SCALE[scale];
  // Un seul badge : le premier tag QUI EN A UN. Les `tags` arrivent déjà dans
  // l'ordre canonique du vocabulaire (`sortTags`, data/curated/tags.json).
  const badgeTag = tags?.find((tg) => tg in RECRUIT_TAG_SPRITE);
  // Sous la carte, titre et nom ne font qu'un bloc — la forme que mesure
  // `fitsOnTwoLines`, et celle sur laquelle le nom court prend le relais.
  const full = joinDisplayName(prefix, name);
  const below = shortName && !fitsOnTwoLines(full, s.labelWidthPx) ? shortName : full;

  const card = (
    <span className={`relative block ${s.width}`}>
      {/* Feuille CLIENTE : applique les réglages du site (skin choisi, portrait
          animé) — la carte, elle, reste serveur. */}
      <CardPortrait
        id={id}
        name={name}
        rarity={rarity ?? 1}
        transcendence={transcendence}
        element={element}
        cls={classType}
        prefix={prefix ?? undefined}
        coreFusion={tags?.includes('core-fusion')}
        textClassName={s.inFrame}
        priority={priority}
        className="w-full"
      />
      {badgeTag && (
        <img
          src={img.recruitTag(badgeTag)}
          alt={badgeTag}
          className="absolute top-0 left-0 z-10 w-[60%] drop-shadow-md"
        />
      )}
      {/* Le rail d'étoiles est décoratif dans `Portrait` (les sprites n'ont pas de
          texte) : la rareté ne serait donc lisible par personne sans ceci. */}
      {rarity ? (
        <span className="sr-only">{starAriaLabel.replace('{rarity}', String(rarity))}</span>
      ) : null}
    </span>
  );

  return (
    <span className={`flex flex-col items-center gap-1 ${s.width}`}>
      {href ? (
        <Link href={href as Route} className="block transition-opacity hover:opacity-80">
          {card}
        </Link>
      ) : (
        card
      )}
      {/* Le nom SOUS la carte — aux paliers où `Portrait` a masqué le sien. Mêmes
          classes que `CharacterPortrait` : deux lignes réservées, sinon un voisin
          à une seule ligne décentre toute la rangée. `title` porte TOUJOURS le nom
          complet, y compris quand on se rabat sur le nom court. */}
      <span
        title={full}
        className={`text-content-strong line-clamp-2 min-h-[2.5em] w-full text-center text-xs leading-tight font-semibold wrap-break-word ${s.below}`}
      >
        {below}
      </span>
    </span>
  );
}
