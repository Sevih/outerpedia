/**
 * LE PORTRAIT DU JEU, à l'identique — le grand format vertical.
 *
 * UN SEUL COMPOSANT, DEUX HABILLAGES, parce que le jeu fait exactement ça : les
 * deux nœuds transcrits ici portent le MÊME MonoBehaviour, `CUICharacterThumbnail`
 * — celui-là même que les deux vignettes carrées de `ui/Thumbnail` — et il expose
 * un `SetLongData` en propre pour le format long. Lus aux bundles avec UnityPy,
 * comme `datagen/assets/extract-face-layout.py` le fait pour les face icons :
 *
 *   `long`     `CUICharacterLongThumbnail`, déplié dans `cuipvploading` (×4),
 *              `cuicharactersynchro` (×5), `cuiinfiltratemain`, `cuirecruit`.
 *              Onze copies, même structure de 51 nœuds, mêmes valeurs.
 *   `mainPage` `CharacterThumbnailList`, dans `CUICharacterMainPageScrollCell` —
 *              la carte de la page « personnages », de l'archive et de l'écran de
 *              transcendance. C'est CELUI-LÀ que le site imite avec ses grilles.
 *
 * Aucun des deux n'a de bundle à lui : chaque écran en déplie une copie.
 *
 * CE QUE LES DEUX PARTAGENT, et c'est l'essentiel : le rail d'étoiles au pixel
 * près (23×136 à 151,15 ; six creux de 15 et six étoiles de 19 aux mêmes hauteurs),
 * l'élément (46×46 à 124,6 ; 270), la classe (37×37 à 128 ; 232), le voile de
 * `SetDim` et l'ancrage du niveau. Tout ce qui n'est pas dans `SKIN` est commun.
 *
 * CE QUE LE PORTRAIT N'EST PAS. Il ne se compose pas : `img.portrait(id)` EST déjà
 * l'image finale. Le fond dégradé, le damier, la bordure biseautée ET le filigrane
 * de race sont cuits dans le PNG — vérifié en comparant les sprites `CT_Symbol_*`
 * (Human, Elf, Demon, Alien) au fond des `CT_<id>` : le motif y est déjà. C'est
 * pourquoi les nœuds `Symbol` et `Slot_Normal` de `mainPage` sont inactifs (un
 * `Demon` traîne allumé, résidu d'éditeur). Ce fichier ne pose QUE la chrome.
 *
 * Six choses que la donnée tranche, et qu'on ne devinerait pas :
 *
 *   1. LE MASQUE NE MASQUE RIEN. `Mask` pose `CT_Mask_Thumbnail` en 9-slice
 *      (border 28 de tous côtés) avec `showMaskGraphic = 0` : de quoi croire à des
 *      coins arrondis. Son alpha est à 255 SUR TOUTE LA SURFACE, coins compris —
 *      vérifié pixel par pixel. Pas de `border-radius` ici : ce serait une invention.
 *
 *   2. L'ART EST PLEIN CADRE DANS LES DEUX CAS, malgré les apparences. Le
 *      `m_FaceIconRect` de `mainPage` ne fait que 140×330 (contre 180×344 pour
 *      `long`) — mais ce rect ne contraint RIEN : le prefab `FI_` qu'on y instancie
 *      porte sa propre taille (`MainThumbnail`, 180×344, ancré au centre), donc il
 *      débORDE ce parent et c'est le `Mask` de 180×344 au-dessus qui le cadre.
 *      Réduire l'art à 140×330 serait l'erreur que ce rect invite à faire.
 *
 *   3. LE VOILE N'EST PAS UN DÉCOR. `Dim` est `m_DimImage`, allumé par
 *      `SetDim(bool)` — et c'est un APLAT NOIR opaque, pas un vignetage. Les deux
 *      prefabs le laissent `active`, mais c'est l'état d'éditeur : le rendre par
 *      défaut noircirait tout le portrait à 70 %. D'où la prop `dim`, éteinte par
 *      défaut. (La vignette carrée a l'écueil inverse : son `Dim` de racine, lui,
 *      est bien un décor fixe.)
 *
 *   4. LES ÉTOILES SE REMPLISSENT PAR LE HAUT. Ce point ne se lit dans aucun
 *      prefab, seulement dans le code : `CUtilUI.SetStarImage` éteint d'abord tout
 *      le tableau (`Foreach(img => SetActive(false))`), puis allume
 *      `m_StarImage[0 .. ShowUIStar-1]` par indexation DIRECTE, et colore
 *      `m_StarImage[ShowUIStar-1]`. Or l'index 0 est l'emplacement du HAUT dans les
 *      deux habillages — que le prefab numérote `Star5`→`Star0` (long) ou
 *      `Star1`→`Star6` (mainPage), les positions sont les MÊMES et l'ordre du
 *      tableau part du haut. Les étoiles gagnées occupent donc le haut du rail, et
 *      celle qui porte la teinte du « + » est la plus BASSE des allumées.
 *
 *   5. LE NIVEAU EST DEUX TEXTES, PAS UN, et sa boîte n'est pas contrainte.
 *      `Level` est un `HorizontalLayoutGroup` doublé d'un `ContentSizeFitter` en
 *      `m_HorizontalFit = 2` (PreferredSize) : « Lv. » et le nombre y sont posés
 *      côte à côte à deux corps différents (15 et 25), et la boîte s'ajuste au
 *      contenu au lieu de le rogner. Seuls son `left` et son `top` s'appliquent.
 *      Les deux textes sont ITALIQUES (`m_FontStyle = 2` — dans Unity 1 = gras),
 *      les seuls du portrait à ne pas être droits.
 *
 *   6. LE TITRE N'A PAS LA MÊME POLICE QUE LE NOM. `Text_Demi` pointe un `m_Font`
 *      différent de `Text_Name` dans les deux habillages, et les deux sont
 *      résolus : **NotoSans_Regular** pour le titre, **NotoSans_Bold** pour le nom
 *      et pour le niveau. Même famille, deux graisses — voir le bloc `m_BestFit`,
 *      qui porte leurs chasses.
 *
 * Composant SERVEUR (aucun état, aucun hook) : utilisable depuis les guides comme
 * depuis un composant client.
 */
import { img } from '@/lib/images';
import { transcendenceRow, type StarTone } from '@/components/ui/Thumbnail';

/** Le cadre — `m_SizeDelta` de la racine des deux nœuds. */
const FRAME_W = 180;
const FRAME_H = 344;

/**
 * Un rect RÉSOLU, en unités du cadre et depuis son coin HAUT-gauche (comme le CSS).
 *
 * Les deux prefabs n'écrivent PAS la géométrie de la même façon — `long` en ancres
 * normalisées avec un `m_SizeDelta` nul, `mainPage` en `m_SizeDelta` +
 * `m_AnchoredPosition` sur des ancres dégénérées. Impossible de les mettre côte à
 * côte sous cette forme : la table porte donc le rect résolu, obtenu par
 *
 *     taille = (anchorMax − anchorMin) × parent + sizeDelta
 *     xMin   = anchorMin.x × parentW + anchoredPosition.x − pivot.x × sizeDelta.x
 *     top    = parentH − yMin − hauteur          (Unity monte, CSS descend)
 *
 * Le terme `− pivot × sizeDelta` compte : le raccourci `− pivot × taille`, juste
 * pour des ancres dégénérées, décale de la taille entière tous les nœuds étirés.
 */
interface Rect {
  left: number;
  top: number;
  w: number;
  h: number;
}

function box(r: Rect): React.CSSProperties {
  return {
    left: `${(r.left / FRAME_W) * 100}%`,
    top: `${(r.top / FRAME_H) * 100}%`,
    width: `${(r.w / FRAME_W) * 100}%`,
    height: `${(r.h / FRAME_H) * 100}%`,
  };
}

/**
 * Une mesure du prefab (corps de texte, distance d'un effet) en % de la LARGEUR du
 * cadre, via `@container` : la typographie suit la taille du portrait au lieu de
 * rester sur le flux de la page.
 */
const cqw = (n: number) => `${(n / FRAME_W) * 100}cqw`;

/**
 * Un effet de texte Unity rendu en `text-shadow`. `Outline` et `Shadow` ont le MÊME
 * typetree (Outline hérite de Shadow) — seul `m_ClassName` les distingue, et c'est
 * décisif : Outline dessine QUATRE copies aux (±x, ±y), Shadow une seule. Le +Y de
 * Unity monte, celui de CSS descend : le Y change de signe.
 */
interface TextEffect {
  kind: 'outline' | 'shadow';
  x: number;
  y: number;
  a: number;
}

function textShadow(layers: readonly TextEffect[]): string {
  return layers
    .flatMap(({ kind, x, y, a }) =>
      (kind === 'outline'
        ? ([
            [x, y],
            [x, -y],
            [-x, y],
            [-x, -y],
          ] as const)
        : ([[x, y]] as const)
      ).map(([dx, dy]) => `${cqw(dx)} ${cqw(-dy)} 0 rgba(0,0,0,${a})`),
    )
    .join(', ');
}

/** Le niveau : `Shadow(1,−1)` à 60 % + `Outline(1,−1)` à 50,2 %. */
const LEVEL_FX: readonly TextEffect[] = [
  { kind: 'shadow', x: 1, y: -1, a: 0.6 },
  { kind: 'outline', x: 1, y: -1, a: 0.502 },
];
/** Le nom et son titre : les deux mêmes effets, tous deux à 50 %. */
const NAME_FX: readonly TextEffect[] = [
  { kind: 'outline', x: 1, y: -1, a: 0.5 },
  { kind: 'shadow', x: 1, y: -1, a: 0.5 },
];

/**
 * `m_Color` des textes : 0,9451 sur les trois canaux. Posée sur un sprite, donc
 * invariante au thème — relevée telle quelle et NON tokenisée (un token
 * s'inverserait en thème clair, alors que l'art ne change pas).
 */
const TEXT_COLOR = '#f1f1f1';

// --- ce qui est COMMUN aux deux habillages -----------------------------------

/**
 * Le rail d'étoiles — `Star`, ancré en haut à droite. Le sprite
 * `CM_Character_Thumbnail_Star_Slot` fait 23×136 : EXACTEMENT ce rect, ce qui
 * confirme la lecture. Rigoureusement identique dans les deux habillages.
 */
const STAR_SLOT: Rect = { left: 151.15, top: 10.21, w: 23, h: 136 };
const STAR_SLOT_ALPHA = 0.9803921580314636;

/**
 * Les six emplacements EN CREUX (`Star_Off_*`), toujours visibles : 15×15 au pas
 * de 15. Sprite `CM_icon_star_B`, teinté 0,8585 de gris à `m_Color.a = 0,749`,
 * plus un `Shadow(2, −2)` noir à 90,2 %.
 */
const STAR_OFF: readonly Rect[] = [
  { left: 155.15, top: 33.21, w: 15, h: 15 },
  { left: 155.15, top: 48.2, w: 15, h: 15 },
  { left: 155.15, top: 63.18, w: 15, h: 15 },
  { left: 155.15, top: 78.21, w: 15, h: 15 },
  { left: 155.15, top: 93.11, w: 15, h: 15 },
  { left: 155.15, top: 108.11, w: 15, h: 15 },
];
const STAR_OFF_ALPHA = 0.7490196228027344;
/** Le `Shadow(2, −2)` du creux : sur une IMAGE il se rend en `drop-shadow`. */
const STAR_OFF_SHADOW = { x: 2, y: 2, a: 0.902 };

/**
 * Les six étoiles ALLUMÉES, **dans l'ordre du tableau `m_StarImage`** : du HAUT
 * vers le bas (cf. piège 4). Elles font 19×19 quand les creux font 15×15, et
 * partagent leurs centres au pas de 15 : les pleines DÉBORDENT leurs creux, et
 * c'est voulu.
 */
const STAR_ON: readonly Rect[] = [
  { left: 153.15, top: 31.21, w: 19, h: 19 },
  { left: 153.15, top: 46.21, w: 19, h: 19 },
  { left: 153.15, top: 61.21, w: 19, h: 19 },
  { left: 153.15, top: 76.21, w: 19, h: 19 },
  { left: 153.15, top: 91.21, w: 19, h: 19 },
  { left: 153.15, top: 106.21, w: 19, h: 19 },
];

/**
 * Classe puis élément, au coin bas-droit. Ils ne sont PAS alignés : la classe
 * s'arrête à 15 unités du bord, l'élément à 9,4. C'est dans la donnée, dans les
 * DEUX habillages — ne pas « corriger ». Les sprites (`CT_Element_*`,
 * `CT_Class_*`) font 46×46 et sont déjà ceux de la vignette carrée : la classe est
 * donc réduite de 46 à 37.
 */
const CLASS_BOX: Rect = { left: 128, top: 232, w: 37, h: 37 };
const ELEMENT_BOX: Rect = { left: 124.6, top: 270, w: 46, h: 46 };

/** `Level` — coin haut-gauche. La LARGEUR est libre (cf. piège 5). */
const LEVEL_BOX = { left: 14, top: 6, h: 40 };
const LEVEL_LABEL_SIZE = 15;
const LEVEL_VALUE_SIZE = 25;

/** `m_Color.a` du voile de `SetDim`. */
const DIM_ALPHA = 0.698;

/** Corps maximum du nom et du titre — communs aux deux habillages. */
const NAME_SIZE = 22;
const DEMI_SIZE = 14;
/** `m_MinSize` des deux : le jeu peut réduire jusqu'à 1. */
const TEXT_MIN_SIZE = 1;

// --- `m_BestFit` -------------------------------------------------------------

/**
 * LES DEUX POLICES DU JEU, et le seul calcul de ce fichier.
 *
 * Le portrait n'écrit pas un seul style de texte : son `m_Font` désigne DEUX
 * polices, que Sevih avait repérées à l'œil avant qu'on sache les nommer (« en jeu
 * titre et nom n'ont pas l'air d'être régis par les mêmes règles »). Résolues en
 * suivant le `m_PathID` jusqu'au bundle `font2` :
 *
 *   `Text_Name`   6309705752030709729 → **NotoSans_Bold**
 *   `Text_Demi`   7850062853754426686 → **NotoSans_Regular**
 *   `Level`       les deux textes du niveau sont en NotoSans_Bold, italiques
 *
 * Même famille, deux graisses — d'où l'écart de style. Les deux fichiers sont ceux
 * du jeu, convertis en woff2 dans `src/fonts/` et déclarés par `root-document`.
 * Ils ne couvrent que le latin et le hangûl (11 435 glyphes, ni kana ni
 * idéogrammes) : sur `jp` et `zh` le jeu retombe lui aussi sur autre chose.
 *
 * `m_BestFit = 1` sur les quatre textes : le jeu RÉDUIT le corps jusqu'à
 * `m_MinSize` pour que le texte tienne, au lieu de le laisser déborder. SUR UNE
 * SEULE LIGNE — leur `m_HorizontalOverflow` vaut pourtant Wrap, ce qui autoriserait
 * deux lignes plus grandes, mais Sevih a vérifié en jeu que ni le nom ni le titre
 * ne passent à la ligne. `whiteSpace: nowrap` le garantit ici.
 *
 * Reproduire ce comportement demande la largeur du texte, qu'on ne peut pas mesurer
 * côté serveur. Un premier jet l'ESTIMAIT par classe de caractère : il sous-évaluait
 * « Ais Wallenstein » de 10,6 %, soit 16 unités sur 150 — le « n » final passait
 * hors cadre. Une estimation ne peut pas tenir, parce que la contrainte n'est pas
 * « à peu près » : c'est déborder ou non. Les tables ci-dessous portent donc les
 * chasses lues au `hmtx` de chaque police (`unitsPerEm` = 1000), groupées par valeur
 * pour se relire d'un coup d'œil contre le fichier.
 *
 * Et la somme est EXACTE, à une condition qu'on pose plus bas : les deux polices ont
 * un `GPOS` avec du crénage, que le navigateur applique par défaut mais que le jeu
 * n'applique PAS — le `Text` historique d'Unity empile les chasses sans passer par
 * un moteur de composition (c'est TextMeshPro qui a introduit le crénage). Les deux
 * textes portent donc `fontKerning: 'none'` : c'est à la fois plus fidèle au jeu et
 * ce qui rend cette somme juste.
 */
interface GameFont {
  /** La variable CSS posée par `root-document`. */
  css: string;
  /** Le `font-weight` sous lequel cette graisse est déclarée. */
  weight: number;
  /** Les chasses ASCII, plus les rares non-latins des noms du jeu. */
  advance: ReadonlyMap<string, number>;
  /**
   * Ce que vaut une lettre latine absente de la table. Ces Noto ne portent que
   * 14 des 96 caractères de Latin-1 (« é » n'en est pas) : au-delà de l'ASCII le
   * navigateur retombe sur une autre police, et on approxime par la chasse moyenne
   * des 52 lettres. Aucun nom du jeu n'est dans ce cas.
   */
  latin: number;
}

function advances(groups: readonly (readonly [number, string])[]): ReadonlyMap<string, number> {
  return new Map(groups.flatMap(([w, cs]) => [...cs].map((c) => [c, w] as [string, number])));
}

/**
 * Le hangûl, que les deux polices couvrent en ENTIER (11 172 syllabes) et à une
 * chasse unique — la même dans les deux graisses.
 */
const HANGUL_ADVANCE = 0.874;
/**
 * Le repli au-dessus de 0x2E80 : kana et idéogrammes, qu'AUCUNE des deux polices
 * ne porte. C'est une police système qui les peint, et elles sont pleine chasse.
 */
const WIDE_FALLBACK = 1;

/** `Text_Name` — NotoSans_Bold. */
const NAME_FONT: GameFont = {
  css: 'var(--font-portrait-name)',
  weight: 700,
  latin: 0.638,
  advance: advances([
    [1.129, 'W'],
    [1.07, '@'],
    [1.069, '%'],
    [0.938, 'M'],
    [0.892, 'Q'],
    [0.888, 'O'],
    [0.885, 'm'],
    [0.87, 'G'],
    [0.824, 'A'],
    [0.82, '#'],
    [0.814, '&'],
    [0.796, 'V'],
    [0.79, 'X'],
    [0.787, 'w'],
    [0.771, 'Y'],
    [0.763, '~'],
    [0.761, 'N'],
    [0.743, 'D'],
    [0.74, 'K'],
    [0.736, 'H'],
    [0.734, 'U'],
    [0.732, 'C'],
    [0.725, '+'],
    [0.709, 'R'],
    [0.682, '='],
    [0.667, 'P'],
    [0.66, '<>'],
    [0.658, '0S'],
    [0.647, 'T'],
    [0.645, 'B'],
    [0.639, '$'],
    [0.621, '4'],
    [0.619, 'p'],
    [0.615, 'E'],
    [0.614, 'bd'],
    [0.613, '69'],
    [0.612, '5Zag'],
    [0.611, 'qy'],
    [0.606, 'v'],
    [0.603, '8x'],
    [0.601, '3'],
    [0.599, 'J'],
    [0.596, 'h'],
    [0.595, 'F'],
    [0.592, 'u'],
    [0.591, 'n'],
    [0.587, '2'],
    [0.585, 'L'],
    [0.577, 'o'],
    [0.574, '?'],
    [0.573, '7e'],
    [0.572, '_'],
    [0.571, 'k'],
    [0.569, '-'],
    [0.559, '*'],
    [0.546, '^'],
    [0.5, 's'],
    [0.492, 'z'],
    [0.473, 'c'],
    [0.469, '"'],
    [0.458, '/\\'],
    [0.447, '1f'],
    [0.44, 't'],
    [0.426, '()'],
    [0.389, '[]'],
    [0.381, '{}'],
    [0.369, 'r'],
    [0.363, '!'],
    [0.345, '|'],
    [0.319, ';'],
    [0.318, '`'],
    [0.309, ','],
    [0.307, ':'],
    [0.287, '.'],
    [0.285, 'i'],
    [0.28, 'I'],
    [0.273, "'"],
    [0.268, 'j'],
    [0.253, 'l'],
    [0.23, ' '],
    // Les seuls non-latins des noms et titres du jeu que les règles ci-dessus
    // classeraient mal : sous 0x2E80 sans être étroits (★ ☆ ♪), ou au-dessus
    // sans être pleine chasse (【 】).
    [1, '★☆'],
    [0.723, '♪'],
    [0.507, '·'],
    [0.361, '【】'],
  ]),
};

/** `Text_Demi` — NotoSans_Regular. Mêmes caractères, chasses plus étroites. */
const DEMI_FONT: GameFont = {
  css: 'var(--font-portrait-demi)',
  weight: 400,
  latin: 0.622,
  advance: advances([
    [1.105, 'W'],
    [1.061, '%'],
    [1.055, '@'],
    [0.906, 'M'],
    [0.888, 'Q'],
    [0.883, 'O'],
    [0.871, 'G'],
    [0.858, 'm'],
    [0.806, 'A'],
    [0.797, '#'],
    [0.779, 'V'],
    [0.767, '&'],
    [0.762, 'X'],
    [0.758, 'w'],
    [0.746, 'Y'],
    [0.744, '~'],
    [0.742, 'N'],
    [0.734, 'C'],
    [0.733, 'D'],
    [0.725, '+'],
    [0.724, 'U'],
    [0.723, 'H'],
    [0.709, 'K'],
    [0.697, 'R'],
    [0.682, '='],
    [0.654, 'P'],
    [0.65, 'S'],
    [0.644, '0T'],
    [0.636, 'B'],
    [0.635, '<>'],
    [0.628, '$'],
    [0.619, '4'],
    [0.606, 'E'],
    [0.604, 'p'],
    [0.602, '569'],
    [0.601, 'bd'],
    [0.599, 'Z'],
    [0.597, 'ag'],
    [0.594, '8q'],
    [0.591, '3'],
    [0.586, 'F'],
    [0.584, 'y'],
    [0.582, 'v'],
    [0.581, 'J'],
    [0.579, 'L'],
    [0.578, 'h'],
    [0.576, '2'],
    [0.572, '_'],
    [0.57, 'x'],
    [0.568, 'ou'],
    [0.567, 'n'],
    [0.566, '-'],
    [0.565, '7'],
    [0.562, 'e'],
    [0.561, '?'],
    [0.55, '*'],
    [0.544, 'k'],
    [0.543, '^'],
    [0.489, 's'],
    [0.476, 'z'],
    [0.47, 'c'],
    [0.432, '/\\'],
    [0.429, 'f'],
    [0.424, '"'],
    [0.418, '1'],
    [0.41, 't'],
    [0.404, '()'],
    [0.382, '{}'],
    [0.374, '[]'],
    [0.36, 'r'],
    [0.344, '!'],
    [0.326, '|'],
    [0.305, ';'],
    [0.298, ':'],
    [0.295, ','],
    [0.293, '`'],
    [0.278, '.'],
    [0.268, 'I'],
    [0.262, 'i'],
    [0.252, 'j'],
    [0.25, "'"],
    [0.236, 'l'],
    [0.23, ' '],
    [1, '★☆'],
    [0.723, '♪'],
    [0.498, '·'],
    [0.34, '【】'],
  ]),
};

function emWidth(text: string, font: GameFont): number {
  let em = 0;
  for (const ch of text) {
    const measured = font.advance.get(ch);
    if (measured !== undefined) {
      em += measured;
      continue;
    }
    const cp = ch.codePointAt(0) ?? 0;
    // Syllabes hangûl, puis jamo isolés — les deux blocs que le coréen utilise.
    if ((cp >= 0xac00 && cp <= 0xd7af) || (cp >= 0x1100 && cp <= 0x11ff)) em += HANGUL_ADVANCE;
    else if (cp >= 0x2e80) em += WIDE_FALLBACK;
    else em += font.latin;
  }
  return em;
}

/** Le corps que `m_BestFit` retiendrait, en unités du cadre. */
function bestFit(text: string, boxW: number, max: number, font: GameFont): number {
  const em = emWidth(text, font);
  if (em <= 0) return max;
  return Math.max(TEXT_MIN_SIZE, Math.min(max, boxW / em));
}

/** Ce qu'un texte du portrait pose comme style de police. */
function fontOf(font: GameFont): React.CSSProperties {
  return {
    fontFamily: font.css,
    fontWeight: font.weight,
    // Le `Text` d'Unity n'applique pas le `GPOS` de la police (cf. l'en-tête).
    fontKerning: 'none',
  };
}

// --- ce qui DIFFÈRE entre les deux habillages --------------------------------

interface Skin {
  /**
   * Le nom (`Text_Name`) et son titre (`Text_Demi`).
   *
   * Les deux habillages les posent différemment, et ça se voit : `long` donne au
   * nom 100 de large, `mainPage` 150. Comme `m_BestFit` réduit le corps jusqu'à ce
   * que le texte tienne, cette largeur décide de la TAILLE rendue. Sur « Tamamo-no-
   * Mae » et son titre « Kitsune of Eternity » : à 150, le nom descend à 16,9 quand
   * le titre reste plafonné à son maximum de 14 — l'écart se lit ; à 100, ils
   * tombent à 11,3 et 10,6, c'est-à-dire au même corps. C'est ce qui a fait préférer
   * `mainPage` par défaut (constat Sevih sur le jeu).
   *
   * Dans `long` le titre est ancré DANS la boîte du nom ; dans `mainPage` c'est un
   * frère, posé 22 unités plus haut. Les deux finissent à la même largeur.
   */
  name: Rect;
  demi: Rect;
  /**
   * L'alignement VERTICAL du titre dans sa boîte — `m_Alignment` de son `Text`, et
   * la seule valeur de typographie que les deux habillages n'écrivent pas pareil :
   * `MiddleLeft` (3) en `mainPage`, `LowerLeft` (6) en `long`. Le nom, lui, est
   * `MiddleLeft` dans les deux.
   *
   * Ce n'est pas un détail : sur une boîte de 30 pour un corps de 14, passer de
   * l'un à l'autre déplace le titre de 8 unités. Le poser en bas dans les DEUX cas
   * — ce que ce fichier faisait — le collait au nom en `mainPage` (constat Sevih
   * sur le jeu : « le titre a l'air d'être un peu plus haut en vrai »).
   */
  demiAlign: 'center' | 'end';
  /**
   * `m_Color` des étoiles allumées, RELEVÉE MAIS PAS APPLIQUÉE. `long` les teinte
   * (#FCDB42, soit 0,9882/0,8588/0,2588) ; `mainPage` les laisse blanches — et
   * c'est `mainPage` qui est le défaut, donc le cas courant est exact.
   *
   * Pourquoi pas appliquée : `m_Color` MULTIPLIE le sprite, ce qui n'a pas
   * d'équivalent CSS simple sur une image non monochrome (il faudrait un calque en
   * `mix-blend-mode: multiply` masqué par le sprite lui-même). L'écart est faible —
   * le sprite est déjà doré (233,184,61) et la teinte le fonce vers l'orangé — mais
   * il est réel, et il est listé dans les incertitudes de la page /dev plutôt que
   * maquillé. La valeur reste ici pour qu'on puisse la brancher d'un seul endroit.
   */
  starTint: string | null;
  /**
   * L'EMPLACEMENT — au singulier — des deux badges d'état de `mainPage`,
   * `m_FusionIconObj` (`Core`) et `m_SynchroObj` (`Sync`). Tous deux NULL dans
   * `long`, donc absents de cet habillage.
   *
   * Le prefab les pose à deux hauteurs différentes, et c'est un LEURRE : leur
   * parent `Sync_Core` (34×74) porte un `VerticalLayoutGroup`, qui replace ses
   * enfants ACTIFS au runtime — les `m_AnchoredPosition` écrits sont de l'état
   * d'éditeur, celle de `Core` tombant même hors du conteneur. Le groupe est en
   * `m_ChildAlignment = 7` (LowerCenter) : l'enfant actif est calé en BAS des 74,
   * donc à `top` 191. Et comme un core-fusion ne peut pas être synchronisé, il n'y
   * en a jamais qu'un — les deux badges occupent le MÊME emplacement (constat
   * Sevih ; le layout group dit pourquoi).
   */
  badge: Rect | null;
}

const SKIN: Record<'mainPage' | 'long', Skin> = {
  mainPage: {
    // Frères sous `CUICharacterMainPageScrollCell`, pas sous le thumbnail.
    name: { left: 18, top: 282, w: 150, h: 30 },
    demi: { left: 18, top: 260, w: 150, h: 30 },
    demiAlign: 'center',
    starTint: null,
    // Le bas du conteneur `Sync_Core` (34×74 à 129,5 ; 151) — cf. `Skin.badge`.
    badge: { left: 129.5, top: 191, w: 34, h: 34 },
  },
  long: {
    name: { left: 20, top: 284, w: 100, h: 30 },
    demi: { left: 20, top: 254, w: 100, h: 30 },
    demiAlign: 'end',
    starTint: '#fcdb42',
    badge: null,
  },
};

/**
 * Les classes que le portrait sait poser. Le prefab câble son `m_ClassObjs` dans
 * l'ordre de `CHARACTER_CLASS_TYPE` — Defender, Attacker, Ranger, Mage, Priest —
 * mais le sprite se demande au SLUG DU SITE, pas à l'énum du jeu : le datagen
 * publie `CT_Class_Attacker` sous la clé `CT_Class_Striker` et `CT_Class_Priest`
 * sous `CT_Class_Healer` (cf. la table de `datagen/assets/manifest`). Passer par
 * l'énum donnait deux 404 — c'est `img.boss(\`CT_Class_${cap(slug)}\`)` qu'il faut,
 * exactement comme la vignette carrée.
 */
const CLASS_SLUGS = new Set(['defender', 'striker', 'ranger', 'mage', 'healer']);

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export interface PortraitProps {
  /** Id de perso (`characters.json`) — sert `CT_<id>`, l'art entier. */
  id: string;
  /** Nom affiché, et alternative textuelle de l'art. */
  name: string;
  /** BasicStar 1..3. Décide, avec le palier, du nombre d'étoiles. */
  rarity: number;
  /**
   * Palier de transcendance (`TransStar`), de la rareté jusqu'à 9. C'est LUI qui
   * décide combien d'étoiles s'allument et de quelle teinte — pas un compteur.
   * Omis = perso non transcendé. Le site ne stocke pas cet état joueur : la prop
   * n'existe que pour les rendus qui le connaissent.
   */
  transcendence?: number;
  /** Slug d'élément (fire/water/earth/light/dark). Omis = pas d'icône. */
  element?: string;
  /** Slug de classe du site (striker/defender/ranger/mage/healer). */
  cls?: string;
  /** Niveau. Omis = pas de cartouche « Lv. ». */
  level?: number;
  /**
   * Titre posé au-dessus du nom (`Text_Demi`, soit `m_AdditionalNameText`).
   *
   * TOUS LES PERSOS N'EN ONT PAS, et ça ne se déduit pas du `nickname` — les 124 du
   * site en ont un en base. L'indication est `showNickName`, que le datagen tire du
   * jeu : 21 persos sur 124. La règle vit dans `characterNamePrefix`
   * (`lib/data/characters`), qui couvre aussi le « Core Fusion » des entités
   * fusionnées — c'est elle que l'appelant doit passer ici, et non le nickname brut.
   */
  prefix?: string;
  /** Cache le nom — certains écrans ne le montrent pas. */
  hideName?: boolean;
  /** `SetDim(true)` : le voile noir de l'état grisé (cf. piège 3). */
  dim?: boolean;
  /**
   * `m_FusionIconObj` — entité core-fusion. Habillage `mainPage` seulement, et
   * EXCLUSIF de `synchro` : les deux badges partagent un emplacement, un core ne
   * pouvant pas être synchronisé. Celui-ci l'emporte si les deux sont passées.
   */
  coreFusion?: boolean;
  /** `m_SynchroObj` — perso synchronisé. Mêmes règles que `coreFusion`. */
  synchro?: boolean;
  /**
   * Lequel des deux nœuds du jeu on rend. `mainPage` par défaut : c'est la carte de
   * la page « personnages », donc ce que les grilles du site imitent.
   */
  variant?: 'mainPage' | 'long';
  /**
   * Taille du cadre. Une seule dimension suffit (`w-40`) : la proportion est tenue
   * par `aspect-180/344` — toute la géométrie s'exprime en % du cadre, et les %
   * horizontaux se résolvent sur la largeur quand les verticaux se résolvent sur la
   * hauteur. Un rectangle d'un autre ratio décalerait tout.
   */
  className?: string;
}

export function Portrait({
  id,
  name,
  rarity,
  transcendence,
  element,
  cls,
  level,
  prefix,
  hideName = false,
  dim = false,
  coreFusion = false,
  synchro = false,
  variant = 'mainPage',
  className = 'w-40',
}: PortraitProps) {
  const skin = SKIN[variant];
  const [show, tone, plus] = transcendenceRow(rarity, transcendence);
  // `m_StarImage[ShowUIStar-1]` reçoit la teinte — soit, dans l'ordre du tableau
  // (haut → bas), la DERNIÈRE allumée, donc la plus basse. Elle ne se distingue que
  // si le palier porte un « + » ; sinon la table donne déjà 'y'.
  const litTone = (i: number): StarTone => (plus > 0 && i === show - 1 ? tone : 'y');

  return (
    // `@container` : le niveau et le nom sont du TEXTE, il leur faut une taille liée
    // au cadre et non au flux typographique de la page (cf. `cqw`).
    // `aspect-180/344` : la proportion EXACTE de l'art (1,911:1), pas 1:2 — un 1:2
    // étirerait de 4,6 %.
    <span className={`@container relative block aspect-180/344 shrink-0 ${className}`}>
      {/* L'ART — plein cadre dans les DEUX habillages (cf. piège 2). */}
      <img src={img.portrait(id)} alt={name} className="absolute inset-0 h-full w-full" />

      {/* LE RAIL D'ÉTOILES — le slot sombre, six creux, puis les allumées. */}
      <img
        src={img.starSlot()}
        alt=""
        aria-hidden
        className="absolute"
        style={{ ...box(STAR_SLOT), opacity: STAR_SLOT_ALPHA }}
      />
      {STAR_OFF.map((r, i) => (
        <img
          key={`off-${i}`}
          src={img.starEmpty()}
          alt=""
          aria-hidden
          className="absolute"
          style={{
            ...box(r),
            opacity: STAR_OFF_ALPHA,
            filter: `drop-shadow(${cqw(STAR_OFF_SHADOW.x)} ${cqw(STAR_OFF_SHADOW.y)} 0 rgba(0,0,0,${STAR_OFF_SHADOW.a}))`,
          }}
        />
      ))}
      {STAR_ON.slice(0, show).map((r, i) => (
        <img
          key={`on-${i}`}
          src={img.star(litTone(i))}
          alt=""
          aria-hidden
          className="absolute"
          style={box(r)}
        />
      ))}

      {/* CLASSE puis ÉLÉMENT — décoratifs pour un lecteur d'écran : leur `alt` ne
          pourrait être que le slug anglais brut (« dark », « mage ») dans les cinq
          langues, et le composant ne traduit rien. L'info reste portée par le nom
          à côté, lui localisé. */}
      {cls && CLASS_SLUGS.has(cls) && (
        <img
          src={img.boss(`CT_Class_${cap(cls)}`)}
          alt=""
          aria-hidden
          className="absolute"
          style={box(CLASS_BOX)}
        />
      )}
      {element && (
        <img
          src={img.boss(`CT_Element_${cap(element)}`)}
          alt=""
          aria-hidden
          className="absolute"
          style={box(ELEMENT_BOX)}
        />
      )}

      {/* LE BADGE d'état de `mainPage` — un seul emplacement pour les deux, et un
          seul badge à la fois (cf. `Skin.badge`). Le core-fusion l'emporte si les
          deux props sont passées : l'état ne peut pas exister en jeu, autant le
          rendre visible plutôt que d'empiler deux sprites. */}
      {(coreFusion || synchro) && skin.badge && (
        <img
          src={coreFusion ? img.coreFusionTag() : img.syncIcon()}
          alt=""
          aria-hidden
          className="absolute"
          style={box(skin.badge)}
        />
      )}

      {/* LE NIVEAU — deux textes côte à côte, largeur LIBRE (cf. piège 5), pas de
          plaque derrière : ce qui les détache de l'art, ce sont leurs effets. */}
      {level != null && (
        <span
          className="absolute flex items-center leading-none italic"
          style={{
            left: `${(LEVEL_BOX.left / FRAME_W) * 100}%`,
            top: `${(LEVEL_BOX.top / FRAME_H) * 100}%`,
            height: `${(LEVEL_BOX.h / FRAME_H) * 100}%`,
            color: TEXT_COLOR,
            textShadow: textShadow(LEVEL_FX),
            // `LvText` et son nombre sont en NotoSans_Bold comme le nom.
            ...fontOf(NAME_FONT),
          }}
        >
          {/* `LvText` n'écrit pas son libellé : il porte `m_MessageKey = SYS_LV`.
              Vérifié dans `TextSystem` — la clé vaut « Lv. » dans les CINQ langues,
              coréen compris. La coder en dur est donc exact. */}
          <span style={{ fontSize: cqw(LEVEL_LABEL_SIZE) }}>Lv.</span>
          <span className="tabular-nums" style={{ fontSize: cqw(LEVEL_VALUE_SIZE) }}>
            {level}
          </span>
        </span>
      )}

      {/* LE TITRE puis LE NOM. Aucun dégradé sous eux : `LowBg` est inactif dans les
          deux habillages — ils ne tiennent que par leurs effets. */}
      {!hideName && (
        <>
          {prefix && (
            // L'alignement vertical vient de l'habillage (cf. `Skin.demiAlign`) :
            // MiddleLeft en `mainPage`, LowerLeft en `long`.
            <span
              className={`absolute flex overflow-hidden leading-none whitespace-nowrap ${
                skin.demiAlign === 'center' ? 'items-center' : 'items-end'
              }`}
              style={{
                ...box(skin.demi),
                fontSize: cqw(bestFit(prefix, skin.demi.w, DEMI_SIZE, DEMI_FONT)),
                color: TEXT_COLOR,
                textShadow: textShadow(NAME_FX),
                ...fontOf(DEMI_FONT),
              }}
            >
              {prefix}
            </span>
          )}
          {/* `m_Alignment = 3` = MiddleLeft. */}
          <span
            className="absolute flex items-center overflow-hidden leading-none whitespace-nowrap"
            style={{
              ...box(skin.name),
              fontSize: cqw(bestFit(name, skin.name.w, NAME_SIZE, NAME_FONT)),
              color: TEXT_COLOR,
              textShadow: textShadow(NAME_FX),
              ...fontOf(NAME_FONT),
            }}
          >
            {name}
          </span>
        </>
      )}

      {/* `SetDim(true)` — le voile de l'état grisé, à son `m_Color.a` exact. */}
      {dim && (
        <img
          src={img.portraitDim()}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={{ opacity: DIM_ALPHA }}
        />
      )}
    </span>
  );
}
