import Link from 'next/link';
import type { Route } from 'next';
import { img, RECRUIT_TAG_SPRITE } from '@/lib/images';
import { CardThumbnail } from '@/components/character/SettingsPortrait';

/**
 * Le nom TIENT-IL sur deux lignes dans `maxWidth` (px) ? Estimation
 * typographique, pas une mesure : le portrait est rendu côté serveur, il n'y a
 * pas de DOM à interroger. Largeur moyenne d'un caractère en `text-xs`
 * semibold, pleine chasse pour les scripts CJK, retour à la ligne glouton par
 * mots (un mot trop large est coupé par `wrap-break-word`, donc il consomme
 * plusieurs lignes). Volontairement grossier : se tromper d'un caractère fait
 * afficher « D.Stella » au lieu de « Demiurge Stella », ça ne casse rien.
 *
 * EXPORTÉE pour `/dev/portrait`, qui montre à quel moment le grand portrait doit
 * sortir son nom du cadre : cette page-là rejouerait la règle de travers si elle
 * la recopiait, et c'est la MÊME qui servira quand les appelants passeront au
 * portrait. Ici, à l'inverse du grand format, l'estimation peut rester grossière
 * — elle choisit entre deux libellés, elle ne décide pas d'un débordement.
 */
const NARROW_PX = 6.6;
const WIDE_PX = 12;
const SPACE_PX = 3.3;
/** Scripts à pleine chasse (kana, hangul, idéogrammes, ponctuation large). */
const WIDE_CHAR = /[ᄀ-ᇿ⺀-꓏가-퟿豈-﫿︰-﹏＀-｠]/;

export function fitsOnTwoLines(text: string, maxWidth: number): boolean {
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
 * LA VIGNETTE DE PERSO DU JEU, plus le chrome du SITE : nom en dessous, lien,
 * badge de recrutement. C'est le format « référence de perso » des guides et des
 * pages équipement.
 *
 * Le rendu de la vignette elle-même n'est PAS ici : il vit dans `Thumbnail`,
 * transcrit du prefab `uicharacterthumbnail`. Ce module ne pose plus une seule
 * mesure de portrait — avant, il en portait quatre à l'œil (élément à −1/−1 en
 * 39 %, classe à 40 % là où le prefab dit 30 %, étoiles jaunes chevauchées d'un
 * quart, aucun fond de rareté), et le damage calculator comme le tier-list-maker
 * en avaient recopié des variantes divergentes.
 *
 * Ce qui reste ici est exactement ce que le jeu N'A PAS :
 *
 *   - le NOM sous la vignette (le jeu l'écrit ailleurs dans son écran) ;
 *   - le LIEN vers la fiche ;
 *   - le BADGE de recrutement (`collab`, `premium`…), convention éditoriale du
 *     site. Il se pose PAR-DESSUS la vignette plutôt que dedans : `Thumbnail`
 *     est une transcription du prefab, et le prefab n'a pas ce calque. Il occupe
 *     le coin haut-gauche, celui de la bannière BOSS — sans conflit, un perso
 *     n'en porte jamais.
 *
 * Composant PUR (aucun état, aucune lecture disque) : serveur comme client. Sa
 * vignette est déléguée à une feuille cliente (`CardThumbnail`) qui applique le
 * skin choisi dans les réglages du site.
 */
export function CharacterPortrait({
  id,
  name,
  element,
  classType,
  rarity,
  transcendence,
  level,
  size = 64,
  href,
  showName = true,
  shortName,
  badgeTag,
}: {
  id: string;
  name: string;
  element?: string;
  classType?: string;
  /**
   * BasicStar 1..3. REQUISE : c'est elle qui choisit le fond de la vignette
   * (Magic / Rare / Unique), et le jeu n'a pas de vignette sans fond. Un
   * appelant qui ne l'avait pas la tient désormais de sa propre donnée — c'est
   * le seul endroit où la corriger.
   */
  rarity: number;
  /**
   * Palier de transcendance (4..9). Décide COMBIEN d'étoiles s'affichent et de
   * quelle teinte — ce n'est pas un compteur (cf. `Thumbnail`). Omis = perso non
   * transcendé. À passer quand le contexte parle d'une CIBLE éditoriale plutôt
   * que d'un état d'inventaire.
   */
  transcendence?: number;
  /** Niveau affiché dans la vignette. Omis = pas de chiffre. */
  level?: number;
  size?: number;
  href?: string;
  /**
   * Nom sous le portrait. À couper quand l'appelant écrit déjà les noms à côté
   * (persos recommandés d'un guide) : sinon chaque nom apparaît deux fois.
   * L'`alt` de l'image le porte de toute façon.
   */
  showName?: boolean;
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
  const badge = badgeTag && badgeTag in RECRUIT_TAG_SPRITE ? badgeTag : undefined;
  const label = shortName && !fitsOnTwoLines(name, size + 24) ? shortName : name;
  const content = (
    <span className="flex w-full flex-col items-center gap-1">
      {/* Boîte à la taille DEMANDÉE, la vignette la remplit. L'icône d'élément
          déborde volontairement de cette boîte (le prefab l'ancre en dehors) :
          rien ne doit rogner ici, et l'appelant qui serre ses portraits verra
          ce léger chevauchement — c'est celui du jeu. */}
      <span className="relative block shrink-0" style={{ width: size, height: size }}>
        {/* Feuille CLIENTE : la vignette suit le skin choisi dans les réglages
            du site — le reste du composant reste pur. */}
        <CardThumbnail
          id={id}
          name={name}
          rarity={rarity}
          transcendence={transcendence}
          element={element}
          cls={classType}
          level={level}
          className="h-full w-full"
        />
        {badge && (
          <img
            src={img.recruitTag(badge)}
            alt={badge}
            className="absolute top-0 left-0 z-10 w-[68%] drop-shadow-md"
          />
        )}
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
