/**
 * LE PORTRAIT DU JEU, à l'identique — le grand format vertical.
 *
 * LE NŒUD TRANSCRIT est `CharacterThumbnailList`, dans
 * `CUICharacterMainPageScrollCell` : la carte de la page « personnages », de
 * l'archive et de l'écran de transcendance — celle que le site imite avec ses
 * grilles. Il n'a pas de bundle à lui, chaque écran en déplie une copie. Lu aux
 * bundles avec UnityPy, comme `datagen/assets/extract-face-layout.py` le fait pour
 * les face icons.
 *
 * IL EN EXISTE UN SECOND, et l'avoir lu a servi : `CUICharacterLongThumbnail`
 * (pvploading, synchro, infiltrate, recruit — onze copies concordantes) porte le
 * MÊME MonoBehaviour, `CUICharacterThumbnail`, celui-là même que les deux vignettes
 * carrées de `ui/Thumbnail`. Il a d'abord été transcrit seul, ce qui donnait un nom
 * écrasé à la taille du titre : sa boîte de nom fait 100 quand celle-ci en fait 150,
 * et `m_BestFit` en tire deux corps très différents. Les deux se sont ensuite
 * révélés IDENTIQUES partout ailleurs — rail d'étoiles au pixel près, élément,
 * classe, voile, ancrage du niveau — ce qui a confirmé la lecture des deux côtés.
 * Cette page-ci est celle que le site veut ; l'autre n'est plus rendue, mais quatre
 * de ses valeurs sont notées où elles diffèrent, pour qu'on sache que la différence
 * a été vue et écartée, pas manquée.
 *
 * CE QUE LE PORTRAIT N'EST PAS. Il ne se compose pas : `img.portrait(id)` EST déjà
 * l'image finale. Le fond dégradé, le damier, la bordure biseautée ET le filigrane
 * de race sont cuits dans le PNG — vérifié en comparant les sprites `CT_Symbol_*`
 * (Human, Elf, Demon, Alien) au fond des `CT_<id>` : le motif y est déjà. C'est
 * pourquoi les nœuds `Symbol` et `Slot_Normal` du prefab sont inactifs (un `Demon`
 * traîne allumé, résidu d'éditeur). Ce fichier ne pose QUE la chrome.
 *
 * Six choses que la donnée tranche, et qu'on ne devinerait pas :
 *
 *   1. LE MASQUE NE MASQUE RIEN. `Mask` pose `CT_Mask_Thumbnail` en 9-slice
 *      (border 28 de tous côtés) avec `showMaskGraphic = 0` : de quoi croire à des
 *      coins arrondis. Son alpha est à 255 SUR TOUTE LA SURFACE, coins compris —
 *      vérifié pixel par pixel. Pas de `border-radius` ici : ce serait une invention.
 *
 *   2. L'ART EST PLEIN CADRE, malgré les apparences. Le `m_FaceIconRect` ne fait
 *      que 140×330 — mais ce rect ne contraint RIEN : le prefab `FI_` qu'on y
 *      instancie porte sa propre taille (`MainThumbnail`, 180×344, ancré au
 *      centre), donc il déborde ce parent et c'est le `Mask` de 180×344 au-dessus
 *      qui le cadre. Réduire l'art à 140×330 serait l'erreur que ce rect invite à
 *      faire. (Le nœud `long` écrit d'ailleurs 180×344 à cet endroit, ce qui a levé
 *      le doute.)
 *
 *   3. LE VOILE N'EST PAS UN DÉCOR. `Dim` est `m_DimImage`, allumé par
 *      `SetDim(bool)` — et c'est un APLAT NOIR opaque, pas un vignetage. Le prefab
 *      le laisse `active`, mais c'est l'état d'éditeur : le rendre par défaut
 *      noircirait tout le portrait à 70 %. D'où la prop `dim`, éteinte par défaut.
 *      (La vignette carrée a l'écueil inverse : son `Dim` de racine, lui, est bien
 *      un décor fixe.)
 *
 *   4. LES ÉTOILES SE REMPLISSENT PAR LE HAUT. Ce point ne se lit dans aucun
 *      prefab, seulement dans le code : `CUtilUI.SetStarImage` éteint d'abord tout
 *      le tableau (`Foreach(img => SetActive(false))`), puis allume
 *      `m_StarImage[0 .. ShowUIStar-1]` par indexation DIRECTE, et colore
 *      `m_StarImage[ShowUIStar-1]`. Or l'index 0 est l'emplacement du HAUT — le
 *      prefab numérote ses nœuds `Star1`→`Star6` (l'autre nœud, `Star5`→`Star0`),
 *      mais les positions comme l'ordre du tableau partent du haut dans les deux.
 *      Les étoiles gagnées occupent donc le haut du rail, et celle qui porte la
 *      teinte du « + » est la plus BASSE des allumées.
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
 *      différent de `Text_Name`, et les deux sont résolus : le titre prend l'asset
 *      `NotoSans_Regular`, le nom et le niveau l'asset `NotoSans_Bold`. L'étiquette
 *      Unity ment sur les deux — voir le bloc `m_BestFit`, qui dit ce qu'elles sont
 *      vraiment et porte leurs chasses.
 *
 * Composant SERVEUR (aucun état, aucun hook) : utilisable depuis les guides comme
 * depuis un composant client.
 */
import METRICS from '@datagen/assets/portrait-font-metrics.json';
import { img } from '@/lib/images';
import { transcendenceRow, type StarTone } from '@/components/ui/Thumbnail';

/** Le cadre — `m_SizeDelta` de la racine des deux nœuds. */
const FRAME_W = 180;
const FRAME_H = 344;

/**
 * Un rect RÉSOLU, en unités du cadre et depuis son coin HAUT-gauche (comme le CSS).
 *
 * Le prefab, lui, écrit des `m_SizeDelta` + `m_AnchoredPosition` sur des ancres
 * dégénérées — et l'autre nœud des ancres NORMALISÉES à `m_SizeDelta` nul, ce qui
 * les rendait incomparables sous leur forme d'origine. D'où des rects RÉSOLUS, par
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

// --- la chrome, dans l'ordre où elle se pose --------------------------------

/**
 * Le rail d'étoiles — `Star`, ancré en haut à droite. Le sprite
 * `CM_Character_Thumbnail_Star_Slot` fait 23×136 : EXACTEMENT ce rect, ce qui
 * confirme la lecture. Identique au pixel sur l'autre nœud, ce qui l'a validée.
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
 *
 * Écrites en progression et non en six littéraux, parce que le prefab les pose
 * EXACTEMENT ainsi — 31,21 puis un pas de 15, sans le flottement d'un pixel que
 * les creux ci-dessus, eux, portent bel et bien. Six lignes de moins et une
 * régularité qui se vérifie d'un coup d'œil au lieu de se relire six fois.
 */
const STAR_ON: readonly Rect[] = Array.from({ length: 6 }, (_, i) => ({
  left: 153.15,
  top: 31.21 + 15 * i,
  w: 19,
  h: 19,
}));

/**
 * Classe puis élément, au coin bas-droit. Ils ne sont PAS alignés : la classe
 * s'arrête à 15 unités du bord, l'élément à 9,4. C'est dans la donnée, dans les
 * DEUX nœuds — ne pas « corriger ». Les sprites (`CT_Element_*`,
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

/** Corps maximum du nom et du titre (`m_FontSize` de leurs `Text`). */
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
 *   `Text_Name` + le niveau  →  asset `NotoSans_Bold`    →  **SUIT ExtraBold** (800)
 *   `Text_Demi`              →  asset `NotoSans_Regular` →  **SUIT Bold** (700)
 *
 * L'ÉTIQUETTE UNITY MENT : les deux assets s'appellent Noto, leur table `name` dit
 * SUIT — une famille coréenne de Sunn — et les graisses ne sont pas celles
 * annoncées non plus. Ce ne sont donc pas deux graisses d'écart mais UNE, ce qui
 * explique que le titre reste franchement gras en jeu. Les fichiers de
 * `src/fonts/` portent le vrai nom ; le lien avec l'asset se lit dans
 * `datagen/assets/extract-font-metrics.py`, jamais dans un nom de fichier faux.
 *
 * Elles ne couvrent que le latin et le hangûl (11 435 glyphes, ni kana ni
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
 * « à peu près » : c'est déborder ou non.
 *
 * D'où `portrait-font-metrics.json` : les chasses des 263 glyphes non hangûl de
 * chaque police, plus la chasse unique des 11 172 syllabes, lues au `hmtx` des
 * fichiers de `src/fonts/` — donc de ce que le navigateur télécharge vraiment.
 * C'est de la donnée MÉCANIQUE, re-dérivable d'une commande : elle n'a rien à faire
 * en dur ici, contrairement aux rects du prefab qu'on relit ligne à ligne.
 *
 * Et la somme est EXACTE, à une condition qu'on pose plus bas : les deux polices ont
 * un `GPOS` avec du crénage (`kerning: true` dans le JSON), que le navigateur
 * applique par défaut mais que le jeu n'applique PAS — le `Text` historique d'Unity
 * empile les chasses sans passer par un moteur de composition (c'est TextMeshPro qui
 * a introduit le crénage). Les deux textes portent donc `fontKerning: 'none'` :
 * c'est à la fois plus fidèle au jeu et ce qui rend cette somme juste.
 */
interface FontMetrics {
  /** Le fichier mesuré, sous `src/fonts/`. */
  file: string;
  /** L'asset Unity dont il provient — trompeur, gardé pour la traçabilité. */
  asset: string;
  /** Le nom RÉEL de la famille, lu dans la table `name`. */
  family: string;
  /** `usWeightClass` : la graisse à déclarer, et celle à demander en CSS. */
  weight: number;
  /** La chasse UNIQUE des 11 172 syllabes hangûl. */
  hangul: number;
  /** La moyenne des 52 lettres — le repli d'un glyphe que la police ne couvre pas. */
  latin: number;
  /** Chaque glyphe non hangûl de la police, en em. */
  advance: Record<string, number>;
}

/** Le rôle de chaque police, et la variable CSS que `root-document` lui donne. */
const NAME_FONT = { ...(METRICS.name as FontMetrics), css: 'var(--font-portrait-name)' };
const DEMI_FONT = { ...(METRICS.demi as FontMetrics), css: 'var(--font-portrait-demi)' };
type GameFont = typeof NAME_FONT;

/**
 * Le repli au-dessus de 0x2E80 : kana et idéogrammes, qu'AUCUNE des deux polices ne
 * porte. C'est une police système qui les peint, et elles sont pleine chasse. Seule
 * valeur de ce bloc à ne pas être mesurée — donc la seule à rester ici.
 */
const WIDE_FALLBACK = 1;

function emWidth(text: string, font: GameFont): number {
  let em = 0;
  for (const ch of text) {
    const measured = font.advance[ch];
    if (measured !== undefined) {
      em += measured;
      continue;
    }
    const cp = ch.codePointAt(0) ?? 0;
    // Syllabes hangûl, puis jamo isolés — les deux blocs que le coréen utilise.
    if ((cp >= 0xac00 && cp <= 0xd7af) || (cp >= 0x1100 && cp <= 0x11ff)) em += font.hangul;
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

/**
 * Le nom (`Text_Name`) et son titre (`Text_Demi`), frères sous
 * `CUICharacterMainPageScrollCell` et non enfants du thumbnail.
 *
 * LA LARGEUR DÉCIDE DU CORPS, et c'est ce qui distinguait le plus les deux nœuds :
 * ici le nom a 150 de large, l'autre 100. Comme `m_BestFit` réduit le corps jusqu'à
 * ce que le texte tienne, sur « Tamamo-no-Mae » et son titre « Kitsune of
 * Eternity » ces 150 donnent 16,9 au nom quand le titre reste plafonné à son
 * maximum de 14 — l'écart se lit. À 100 ils tombaient à 11,3 et 10,6, soit au même
 * corps : c'est ce qui avait fait dire à Sevih que le rendu ne collait pas au jeu.
 */
const NAME_BOX: Rect = { left: 18, top: 282, w: 150, h: 30 };
const DEMI_BOX: Rect = { left: 18, top: 260, w: 150, h: 30 };

/**
 * L'EMPLACEMENT — au singulier — des deux badges d'état, `m_FusionIconObj` (`Core`)
 * et `m_SynchroObj` (`Sync`), qui n'existent que sur ce nœud.
 *
 * Le prefab les pose à deux hauteurs différentes, et c'est un LEURRE : leur parent
 * `Sync_Core` (34×74 à 129,5 ; 151) porte un `VerticalLayoutGroup`, qui replace ses
 * enfants ACTIFS au runtime — les `m_AnchoredPosition` écrits sont de l'état
 * d'éditeur, celle de `Core` tombant même hors du conteneur. Le groupe est en
 * `m_ChildAlignment = 7` (LowerCenter) : l'enfant actif est calé en BAS des 74,
 * donc à `top` 191. Et comme un core-fusion ne peut pas être synchronisé, il n'y en
 * a jamais qu'un — les deux badges occupent le MÊME emplacement (constat Sevih ; le
 * layout group dit pourquoi).
 */
const BADGE_BOX: Rect = { left: 129.5, top: 191, w: 34, h: 34 };

/*
 * LES QUATRE VALEURS DE L'AUTRE NŒUD, notées ici et nulle part ailleurs — pour
 * qu'on sache que la différence a été lue, et écartée plutôt que manquée :
 *
 *   nom     20 ; 284, 100×30      (contre 18 ; 282, 150×30)
 *   titre   20 ; 254, 100×30, ancré DANS la boîte du nom au lieu d'en être frère
 *   titre   `m_Alignment = 6` (LowerLeft) au lieu de 3 (MiddleLeft) — 8 unités
 *           plus bas sur une boîte de 30 pour un corps de 14
 *   étoiles allumées teintées #FCDB42 (`m_Color` 0,9882/0,8588/0,2588) au lieu de
 *           blanches ; on ne saurait de toute façon pas la rendre, `m_Color`
 *           MULTIPLIE le sprite et il n'est pas monochrome
 *
 * Tout le reste — rail, élément, classe, voile, ancrage du niveau, corps maximums,
 * effets de texte — est rigoureusement identique dans les deux.
 */

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
  /**
   * Cache le nom ET son titre — certains écrans du jeu ne les montrent pas.
   *
   * C'est aussi la RÉPONSE À LA LISIBILITÉ EN PETIT. Le nom est écrit DANS le
   * cadre, à un corps proportionnel : sous une centaine de pixels de large il
   * devient illisible, et le titre l'est avant lui. Le composant ne s'en occupe
   * pas — il rendrait un seuil que le jeu n'a pas, dans un fichier dont tout le
   * reste est relevé. C'est à l'appelant de couper ici et d'écrire le nom SOUS le
   * cadre, ce que `CharacterPortrait` fait déjà pour la vignette carrée (avec son
   * repli sur le nom court curé quand le nom complet ne tient pas).
   */
  hideName?: boolean;
  /** `SetDim(true)` : le voile noir de l'état grisé (cf. piège 3). */
  dim?: boolean;
  /**
   * `m_FusionIconObj` — entité core-fusion. EXCLUSIF de `synchro` : les deux
   * badges partagent un emplacement, un core ne pouvant pas être synchronisé.
   * Celui-ci l'emporte si les deux sont passées.
   */
  coreFusion?: boolean;
  /** `m_SynchroObj` — perso synchronisé. Mêmes règles que `coreFusion`. */
  synchro?: boolean;
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
  className = 'w-40',
}: PortraitProps) {
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
      {/* L'ART — plein cadre, malgré ce que dit `m_FaceIconRect` (cf. piège 2). */}
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

      {/* LE BADGE d'état — un seul emplacement pour les deux, et un
          seul badge à la fois (cf. `BADGE_BOX`). Le core-fusion l'emporte si les
          deux props sont passées : l'état ne peut pas exister en jeu, autant le
          rendre visible plutôt que d'empiler deux sprites. */}
      {(coreFusion || synchro) && (
        <img
          src={coreFusion ? img.coreFusionTag() : img.syncIcon()}
          alt=""
          aria-hidden
          className="absolute"
          style={box(BADGE_BOX)}
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
            // `LvText` et son nombre portent le même `m_Font` que le nom.
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
          le prefab — ils ne tiennent que par leurs effets. */}
      {!hideName && (
        <>
          {prefix && (
            // `m_Alignment = 3` = MiddleLeft, comme le nom.
            <span
              className="absolute flex items-center overflow-hidden leading-none whitespace-nowrap"
              style={{
                ...box(DEMI_BOX),
                fontSize: cqw(bestFit(prefix, DEMI_BOX.w, DEMI_SIZE, DEMI_FONT)),
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
              ...box(NAME_BOX),
              fontSize: cqw(bestFit(name, NAME_BOX.w, NAME_SIZE, NAME_FONT)),
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
