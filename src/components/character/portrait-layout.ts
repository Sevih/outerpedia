/**
 * LA GÉOMÉTRIE DU PORTRAIT — relevée du prefab, et rien d'autre.
 *
 * Ce module ne rend rien. Il porte les nombres transcrits de
 * `CharacterThumbnailList` (dans `CUICharacterMainPageScrollCell`), pour que les
 * DEUX rendus du site les lisent au même endroit :
 *
 *   `Portrait.tsx`         le rendu DOM (span + img positionnés en %)
 *   `portrait-canvas.ts`   le rendu CANVAS (export PNG du tier-list-maker)
 *
 * Deux rendus, une transcription. C'est la raison d'être de ce fichier : avant lui,
 * le mode « cartes » du tier-list-maker et son export PNG redessinaient chacun leur
 * approximation du portrait — étoiles empilées à la verticale sans le rail ni les
 * creux, classe et élément posés en pourcentages inventés (26 % et 24 % de la
 * largeur, quand le prefab dit 37 et 46 unités sur 180, soit 20,6 % et 25,6 %),
 * ratio de cadre 120/231 au lieu de 180/344. Trois copies qui divergeaient déjà les
 * unes des autres.
 *
 * Les commentaires de chaque valeur disent CE QUE LE PREFAB ÉCRIT et pourquoi la
 * lecture est celle-là : c'est ce qui permet de confronter la table au prefab ligne
 * à ligne, et c'est pour ça qu'ils voyagent avec les nombres plutôt que de rester
 * dans le composant. Les pièges de lecture, eux, sont documentés en tête de
 * `Portrait.tsx` — ils portent sur le rendu, pas sur les cotes.
 */
import METRICS from '@datagen/assets/portrait-font-metrics.json';

/** Le cadre — `m_SizeDelta` de la racine des deux nœuds. */
export const FRAME_W = 180;
export const FRAME_H = 344;

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
export interface Rect {
  left: number;
  top: number;
  w: number;
  h: number;
}

/**
 * Un effet de texte Unity. `Outline` et `Shadow` ont le MÊME typetree (Outline
 * hérite de Shadow) — seul `m_ClassName` les distingue, et c'est décisif : Outline
 * dessine QUATRE copies aux (±x, ±y), Shadow une seule. Le +Y de Unity MONTE, celui
 * du CSS comme du canvas descend : le Y change de signe au rendu, pas ici.
 */
export interface TextEffect {
  kind: 'outline' | 'shadow';
  x: number;
  y: number;
  a: number;
}

/**
 * Les décalages qu'un effet produit, en unités du cadre et dans le sens de l'ÉCRAN
 * (Y vers le bas). Les deux rendus posent les mêmes copies ; seule leur façon de les
 * peindre diffère (`text-shadow` d'un côté, `fillText` répété de l'autre).
 */
export function effectOffsets({ kind, x, y }: TextEffect): readonly (readonly [number, number])[] {
  return kind === 'outline'
    ? ([
        [x, -y],
        [x, y],
        [-x, -y],
        [-x, y],
      ] as const)
    : ([[x, -y]] as const);
}

/** Le niveau : `Shadow(1,−1)` à 60 % + `Outline(1,−1)` à 50,2 %. */
export const LEVEL_FX: readonly TextEffect[] = [
  { kind: 'shadow', x: 1, y: -1, a: 0.6 },
  { kind: 'outline', x: 1, y: -1, a: 0.502 },
];
/** Le nom et son titre : les deux mêmes effets, tous deux à 50 %. */
export const NAME_FX: readonly TextEffect[] = [
  { kind: 'outline', x: 1, y: -1, a: 0.5 },
  { kind: 'shadow', x: 1, y: -1, a: 0.5 },
];

/**
 * `m_Color` des textes : 0,9451 sur les trois canaux. Posée sur un sprite, donc
 * invariante au thème — relevée telle quelle et NON tokenisée (un token
 * s'inverserait en thème clair, alors que l'art ne change pas).
 */
export const TEXT_COLOR = '#f1f1f1';

/**
 * Le rail d'étoiles — `Star`, ancré en haut à droite. Le sprite
 * `CM_Character_Thumbnail_Star_Slot` fait 23×136 : EXACTEMENT ce rect, ce qui
 * confirme la lecture. Identique au pixel sur l'autre nœud, ce qui l'a validée.
 */
export const STAR_SLOT: Rect = { left: 151.15, top: 10.21, w: 23, h: 136 };
export const STAR_SLOT_ALPHA = 0.9803921580314636;

/**
 * Les six emplacements EN CREUX (`Star_Off_*`), toujours visibles : 15×15 au pas
 * de 15. Sprite `CM_icon_star_B`, teinté 0,8585 de gris à `m_Color.a = 0,749`,
 * plus un `Shadow(2, −2)` noir à 90,2 %.
 */
export const STAR_OFF: readonly Rect[] = [
  { left: 155.15, top: 33.21, w: 15, h: 15 },
  { left: 155.15, top: 48.2, w: 15, h: 15 },
  { left: 155.15, top: 63.18, w: 15, h: 15 },
  { left: 155.15, top: 78.21, w: 15, h: 15 },
  { left: 155.15, top: 93.11, w: 15, h: 15 },
  { left: 155.15, top: 108.11, w: 15, h: 15 },
];
export const STAR_OFF_ALPHA = 0.7490196228027344;
/** Le `Shadow(2, −2)` du creux : sur une IMAGE il se rend en ombre portée. */
export const STAR_OFF_SHADOW = { x: 2, y: 2, a: 0.902 };

/**
 * Les six étoiles ALLUMÉES, **dans l'ordre du tableau `m_StarImage`** : du HAUT
 * vers le bas (cf. le piège 4 de `Portrait.tsx`). Elles font 19×19 quand les creux
 * font 15×15, et partagent leurs centres au pas de 15 : les pleines DÉBORDENT leurs
 * creux, et c'est voulu.
 *
 * Écrites en progression et non en six littéraux, parce que le prefab les pose
 * EXACTEMENT ainsi — 31,21 puis un pas de 15, sans le flottement d'un pixel que
 * les creux ci-dessus, eux, portent bel et bien. Six lignes de moins et une
 * régularité qui se vérifie d'un coup d'œil au lieu de se relire six fois.
 */
export const STAR_ON: readonly Rect[] = Array.from({ length: 6 }, (_, i) => ({
  left: 153.15,
  top: 31.21 + 15 * i,
  w: 19,
  h: 19,
}));

/**
 * Classe puis élément, au coin bas-droit. Ils ne sont PAS alignés : la classe
 * s'arrête à 15 unités du bord, l'élément à 9,4. C'est dans la donnée, dans les
 * DEUX nœuds — ne pas « corriger ». Les sprites (`CT_Element_*`, `CT_Class_*`) font
 * 46×46 et sont déjà ceux de la vignette carrée : la classe est donc réduite de 46
 * à 37.
 */
export const CLASS_BOX: Rect = { left: 128, top: 232, w: 37, h: 37 };
export const ELEMENT_BOX: Rect = { left: 124.6, top: 270, w: 46, h: 46 };

/** `Level` — coin haut-gauche. La LARGEUR est libre (cf. le piège 5). */
export const LEVEL_BOX = { left: 14, top: 6, h: 40 };
export const LEVEL_LABEL_SIZE = 15;
export const LEVEL_VALUE_SIZE = 25;

/** `m_Color.a` du voile de `SetDim`. */
export const DIM_ALPHA = 0.698;

/** Corps maximum du nom et du titre (`m_FontSize` de leurs `Text`). */
export const NAME_SIZE = 22;
export const DEMI_SIZE = 14;
/** `m_MinSize` des deux : le jeu peut réduire jusqu'à 1. */
export const TEXT_MIN_SIZE = 1;

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
 *
 * `m_Alignment = 3` (MiddleLeft) sur les deux : le texte est centré verticalement
 * dans sa boîte de 30, et calé à gauche.
 */
export const NAME_BOX: Rect = { left: 18, top: 282, w: 150, h: 30 };
export const DEMI_BOX: Rect = { left: 18, top: 260, w: 150, h: 30 };

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
export const BADGE_BOX: Rect = { left: 129.5, top: 191, w: 34, h: 34 };

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
export const CLASS_SLUGS = new Set(['defender', 'striker', 'ranger', 'mage', 'healer']);

export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// --- `m_BestFit` -------------------------------------------------------------

/**
 * LES DEUX POLICES DU JEU, et le seul calcul de cette transcription.
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
 * ne passent à la ligne.
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
 * Et la somme est EXACTE, à une condition que les deux rendus posent : les polices
 * ont un `GPOS` avec du crénage (`kerning: true` dans le JSON), que le navigateur
 * applique par défaut mais que le jeu n'applique PAS — le `Text` historique d'Unity
 * empile les chasses sans passer par un moteur de composition (c'est TextMeshPro qui
 * a introduit le crénage). Le DOM le coupe par `fontKerning: 'none'` ; le canvas,
 * par `fontKerning = 'none'` sur son contexte. C'est à la fois plus fidèle au jeu et
 * ce qui rend cette somme juste.
 */
export interface FontMetrics {
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

/**
 * Le rôle de chaque police, et la variable CSS que `root-document` lui donne.
 *
 * `cssVar` est le NOM de la variable, pas son `var(...)` : le DOM en fait un
 * `var(--…)`, le canvas doit en lire la VALEUR (`getPropertyValue`) puisqu'il ne
 * sait pas résoudre une variable CSS.
 */
export const NAME_FONT = { ...(METRICS.name as FontMetrics), cssVar: '--font-portrait-name' };
export const DEMI_FONT = { ...(METRICS.demi as FontMetrics), cssVar: '--font-portrait-demi' };
export type GameFont = typeof NAME_FONT;

/**
 * Le repli au-dessus de 0x2E80 : kana et idéogrammes, qu'AUCUNE des deux polices ne
 * porte. C'est une police système qui les peint, et elles sont pleine chasse. Seule
 * valeur de ce bloc à ne pas être mesurée — donc la seule à rester en dur.
 */
const WIDE_FALLBACK = 1;

export function emWidth(text: string, font: GameFont): number {
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
export function bestFit(text: string, boxW: number, max: number, font: GameFont): number {
  const em = emWidth(text, font);
  if (em <= 0) return max;
  return Math.max(TEXT_MIN_SIZE, Math.min(max, boxW / em));
}
