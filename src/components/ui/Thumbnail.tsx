/**
 * LA VIGNETTE DU JEU, à l'identique — monstre ET personnage.
 *
 * Ce n'est pas un portrait « inspiré du jeu » : c'est la transcription de deux
 * prefabs lus aux bundles avec UnityPy (comme `datagen/assets/extract-face-layout.py`
 * le fait déjà pour les icônes de visage) :
 *
 *   monstre → `assets/editor/resources/prefabs/ui/uimonsterthumbnail.prefab`
 *   perso   → `assets/editor/resources/prefabs/ui/uicharacterthumbnail.prefab`
 *
 * UN SEUL COMPOSANT parce que le jeu n'en a qu'un : les deux prefabs portent le
 * même MonoBehaviour, `CUICharacterThumbnail` — c'est cette classe « perso » qui
 * expose `SetMonsterBG(CHARACTER_TYPE)`. Deux habillages d'un même composant,
 * pas deux composants qui se ressemblent. La table `SKIN` ci-dessous met les
 * deux prefabs côte à côte : tout ce qui n'y figure pas est commun, et c'est
 * l'essentiel — case de 128, portrait de 122, bande du bas de 122×32 remontée de
 * 3, étoiles de 22 au pas de 18, ancrages de l'élément et de la classe au coin
 * haut-droit, bannière de 60×20 au coin haut-gauche.
 *
 * Chaque nombre est une valeur de RectTransform relevée dans le prefab — d'où
 * les unités d'origine plutôt que des pourcentages recalculés à la main : on
 * peut confronter la table au prefab ligne à ligne.
 *
 * Trois pièges que le prefab tranche, et qu'on ne peut pas deviner du sprite :
 *
 *   1. LE FOND DU MONSTRE VIENT DU TYPE, PAS DE LA RARETÉ. `SetMonsterBG` prend
 *      un `CHARACTER_TYPE` ; le BasicStar part, lui, dans les ÉTOILES (le
 *      `SetData` privé prend `_byBasicStar` ET `_nStar`, deux paramètres). Chez
 *      le PERSO, à l'inverse, c'est bien la rareté qui choisit le fond —
 *      `m_BGObjects = [Magic, Rare, Unique]`, indexé sur 1..3.
 *
 *   2. UN SPRITE POSÉ N'EST PAS UN SPRITE DESSINÉ. Les deux prefabs assignent un
 *      cartouche au niveau (`MT_Slot_Level_Box` / `CT_Slot_Level_Bg`) avec
 *      `m_Color.a = 0` et un CanvasRenderer qui cull les meshes transparents :
 *      il n'est JAMAIS dessiné. Le chiffre tient sur ses deux effets de texte.
 *      Même piège pour `DefaultBG` côté perso.
 *
 *   3. LE VIGNETAGE N'EST PAS L'ÉTAT GRISÉ. Le prefab perso a deux nœuds `Dim` :
 *      celui de la racine (122×122) est un décor fixe, celui de `Thumbnail`
 *      (124×124) est `m_DimImage`, allumé par `SetDim(bool)` — on ne rend que le
 *      premier. Chez le monstre `m_DimImage` vaut carrément null.
 *
 *   4. LES ÉTOILES D'UN PERSO NE SONT PAS DANS LE PREFAB. Il fige quatre rangées
 *      d'apparence plausible, toutes INACTIVES et dont une contredit le jeu ; la
 *      règle vit dans `CharacterTranscendentTemplet`, que le script lit. Cf.
 *      `TRANSCENDENCE` — c'est le seul calque dont la vérité n'est pas ici.
 *
 *   5. L'ÉLÉMENT DÉBORDE. Sa boîte est ancrée sur le coin haut-droit avec un
 *      offset POSITIF : il sort de la case. Le conteneur ne doit donc pas rogner
 *      — c'est voulu, et c'est ce qui donne à la vignette sa silhouette. À
 *      l'appelant de prévoir la marge (cf. la page /dev/thumbnail).
 *
 * Composant SERVEUR (aucun état, aucun hook) : utilisable depuis les guides
 * comme depuis un composant client.
 */
import { img } from '@/lib/images';

/**
 * Les deux prefabs travaillent dans une case de 128×128 — toutes les mesures
 * sont exprimées dans cette unité, puis rendues en % pour que la vignette suive
 * la taille qu'on lui donne.
 */
const BOX = 128;
const pc = (n: number) => `${(n / BOX) * 100}%`;
/** Même conversion, mais relative à la CASE et non au parent direct (@container). */
const cqw = (n: number) => `${(n / BOX) * 100}cqw`;

/** Un RectTransform tel que le prefab l'écrit : taille + position du pivot. */
interface Node {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Traduction d'un RectTransform ancré sur un COIN (anchorMin = anchorMax = pivot)
 * vers du CSS. Convention Unity : +Y vers le haut, la position place le PIVOT sur
 * le point d'ancrage. Seuls les deux coins que les prefabs emploient sont couverts.
 */
function corner(at: 'top-left' | 'top-right', n: Node): React.CSSProperties {
  const size = { width: pc(n.w), height: pc(n.h) };
  return at === 'top-left'
    ? { ...size, left: pc(n.x), top: pc(-n.y) }
    : { ...size, right: pc(-n.x), top: pc(-n.y) };
}

/** RectTransform ancré au CENTRE du parent (le cas le plus courant des prefabs). */
function centered(n: Node): React.CSSProperties {
  return {
    width: pc(n.w),
    height: pc(n.h),
    left: pc(BOX / 2 + n.x - n.w / 2),
    top: pc(BOX / 2 - n.y - n.h / 2),
  };
}

/** Positionne un enfant CENTRÉ dans une boîte parente carrée de `parent` unités. */
function inBox(parent: number, n: ElementBox): React.CSSProperties {
  return {
    width: `${(n.s / parent) * 100}%`,
    height: `${(n.s / parent) * 100}%`,
    left: `${50 + (n.x / parent) * 100}%`,
    top: `${50 - (n.y / parent) * 100}%`,
    transform: 'translate(-50%, -50%)',
  };
}

/**
 * Un effet de texte Unity rendu en `text-shadow`. `Outline` et `Shadow` ont le
 * MÊME typetree (Outline hérite de Shadow) — seul le script les distingue, et
 * c'est décisif : Outline dessine QUATRE copies aux (±x, ±y), Shadow une seule.
 * Le +Y de Unity monte, celui de CSS descend : le Y change de signe.
 * En `cqw` (1 % de la case) pour que l'effet suive la taille de la vignette.
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

/**
 * Chaque élément a sa PROPRE boîte : les sprites n'ont pas le même cadrage utile
 * et certains sont recalés d'une fraction de pixel. Sans ça, un `w-full` uniforme
 * les déforme.
 */
interface ElementBox {
  x: number;
  y: number;
  s: number;
}

/** Tout ce qui DIFFÈRE entre les deux prefabs. Le reste est commun. */
interface Skin {
  /**
   * `Thumbnail > Image` / `Bottom_Bg` — l'ombre du bas, étirée de 60 à 122.
   *
   * `slice` = le `m_Border` du sprite, en unités de sprite. Les deux prefabs
   * posent cette Image en `Sliced` (9-slice), mais le sprite MONSTRE déclare un
   * border NUL — donc pur étirement — quand le sprite PERSO en déclare 28 de
   * chaque côté : ses extrémités gardent leur taille et seuls les 4 pixels du
   * centre s'étirent. Les deux bitmaps sont pourtant identiques octet pour
   * octet : la différence de rendu ne vient que de cette métadonnée, elle est
   * invisible dans les fichiers.
   */
  bottom: { sprite: string; slice: number };
  /** Le vignetage FIXE (cf. piège 3), avec son `m_Color.a`. */
  vignette: { sprite: string; opacity: number };
  element: {
    /** Le conteneur, ancré haut-droite. */
    box: Node;
    /** Unité dans laquelle les enfants sont écrits (avant `m_LocalScale`). */
    parent: number;
    inner: Record<string, ElementBox>;
    sprite: (slug: string) => string;
  };
  klass: { box: Node; sprite: (slug: string) => string };
  star: {
    /** Centre de la rangée, mesuré depuis le HAUT de la case. */
    centerY: number;
    /** Sprite d'une étoile pour la teinte demandée (cf. `starRow`). */
    sprite: (tone: StarTone) => string;
  };
  level: {
    /** La boîte du TEXTE (pas le cartouche, jamais dessiné — cf. piège 2). */
    box: Node;
    /** Plancher de `m_BestFit` : le corps auquel le jeu cesse de réduire. */
    minSize: number;
    /** `m_Color` du UI.Text. Posée sur un sprite : invariante au thème, donc
     *  relevée telle quelle et non tokenisée (un token s'inverserait). */
    color: string;
    effects: readonly TextEffect[];
  };
  /** Bannière du coin haut-gauche. */
  boss: string;
}

/** `CHARACTER_STAR_COLOR` du jeu, dans le suffixe de sprite (`CM_icon_star_*`). */
type StarTone = 'y' | 'o' | 'r' | 'v';

/**
 * LES ÉTOILES D'UN PERSO NE SE COMPTENT PAS, ELLES SE LISENT DANS UNE TABLE.
 *
 * `CharacterTranscendentTemplet`, colonnes `ShowUIStar` / `StarColor` /
 * `StarPlus`, portée telle quelle : clé = BasicStar, sous-clé = TransStar (le
 * palier de transcendance), valeur = [étoiles affichées, teinte, niveau du +].
 *
 * Deux pièges, et le prefab ment sur les deux :
 *
 *   1. `StarPlus` n'est PAS un nombre d'étoiles colorées, c'est le « + » du
 *      palier (5★+1, 5★+2). Il n'y a jamais qu'UNE étoile colorée — la dernière
 *      — et seulement quand ce niveau dépasse 0.
 *
 *   2. Le prefab fige quatre rangées `Star_4` / `Star_5` / `Star_5_Plus` /
 *      `Star_6` qui ressemblent à la règle. Elles sont INACTIVES, et `Star_6`
 *      (six étoiles violettes) ne correspond à AUCUNE ligne de la table : le
 *      palier à six étoiles les affiche jaunes. Ce sont des maquettes d'éditeur.
 *      La rangée réellement rendue est `Star`, dont le script réassigne les
 *      sprites d'après cette table.
 *
 * Le nombre d'étoiles ne suit donc pas le palier : 4 étoiles au palier 5, puis 5
 * au palier 6, puis toujours 5 aux paliers 7 et 8, puis 6 au palier 9.
 *
 * Les raretés 1 et 2 gardent leur `StarPlus` mais avec une teinte JAUNE : le +
 * existe, il ne se voit pas. Seuls les persos 3★ ont des étoiles colorées.
 *
 * (La table porte aussi 70 lignes propres à dix personnages — toutes rigoureuse-
 * ment identiques au générique 3★ pour ces trois colonnes. Rien à porter.)
 */
const TRANSCENDENCE: Record<number, Record<number, readonly [number, StarTone, number]>> = {
  1: {
    1: [1, 'y', 0],
    2: [2, 'y', 0],
    3: [3, 'y', 0],
    4: [4, 'y', 0],
    5: [4, 'y', 1],
    6: [5, 'y', 0],
    7: [5, 'y', 1],
    8: [5, 'y', 2],
    9: [6, 'y', 0],
  },
  2: {
    2: [2, 'y', 0],
    3: [3, 'y', 0],
    4: [4, 'y', 0],
    5: [4, 'y', 1],
    6: [5, 'y', 0],
    7: [5, 'y', 1],
    8: [5, 'y', 2],
    9: [6, 'y', 0],
  },
  3: {
    3: [3, 'y', 0],
    4: [4, 'y', 0],
    5: [4, 'o', 1],
    6: [5, 'y', 0],
    7: [5, 'r', 1],
    8: [5, 'v', 2],
    9: [6, 'y', 0],
  },
};

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Corps du texte de niveau, en unités de case. `m_FontSize` des deux prefabs. */
const LEVEL_SIZE = 20;

/**
 * `m_BestFit` du UI.Text : le jeu RÉDUIT le corps jusqu'à `min` pour que le
 * nombre tienne dans sa boîte, au lieu de le laisser déborder. Ça compte : la
 * boîte du perso ne fait que 32 de large, et un niveau à trois chiffres à corps
 * 20 en sort franchement.
 *
 * On ne peut pas mesurer le texte côté serveur — mais le chiffre est rendu en
 * chasse fixe, donc sa largeur se déduit du nombre de caractères. `CHAR_EM` est
 * la chasse de notre police mono : une APPROXIMATION assumée, là où le jeu
 * mesure vraiment. Elle ne joue que sur les nombres qui débordent (3 chiffres
 * chez le perso), et se trompe au pire d'une fraction de point.
 */
const CHAR_EM = 0.6;

const fitSize = (text: string, box: number, min: number) =>
  Math.max(min, Math.min(LEVEL_SIZE, box / (text.length * CHAR_EM)));

const SKIN: Record<'monster' | 'character', Skin> = {
  monster: {
    bottom: { sprite: img.boss('MT_Slot_Bottom'), slice: 0 },
    vignette: { sprite: img.boss('CT_Slot_Dim_2'), opacity: 0.549 },
    element: {
      // 46×46 à (+7,77 ; +5,61). Water/Light/Dark font 50 dans une boîte de 46 :
      // ils débordent leur propre conteneur, et le prefab l'assume.
      box: { x: 7.77, y: 5.61, w: 46, h: 46 },
      parent: 46,
      inner: {
        earth: { x: 0, y: 0, s: 46 },
        water: { x: 0, y: 0, s: 50 },
        fire: { x: 0, y: 0.4, s: 46 },
        light: { x: 0, y: 0, s: 50 },
        dark: { x: -1.3, y: 0, s: 50 },
      },
      sprite: (slug) => img.boss(`MT_Element_${cap(slug)}`),
    },
    klass: {
      box: { x: 0.19, y: -39.08, w: 35, h: 35 },
      sprite: (slug) => img.boss(`MT_Class_${cap(slug)}`),
    },
    // `Star` est ancré au centre à y = −50 → 64 + 50 = 114 depuis le haut.
    // Un seul sprite : un monstre ne se transcende pas, donc pas de teinte.
    star: { centerY: 114, sprite: () => img.boss('MT_Slot_Star') },
    level: {
      // `Level` (+46 ; −24) plus l'offset de `LevelText` (+1,08 ; +0,52).
      box: { x: 47.08, y: -23.48, w: 50, h: 30 },
      minSize: 8,
      color: '#fffff3',
      effects: [
        { kind: 'shadow', x: 2, y: -2, a: 0.8 },
        { kind: 'outline', x: -2, y: 2, a: 0.4 },
      ],
    },
    boss: img.tag('MT_Boss'),
  },
  character: {
    // Le bitmap est identique octet pour octet à `MT_Slot_Bottom` — mais son
    // `m_Border` ne l'est pas, d'où le `slice` (cf. `Skin.bottom`). Deux
    // fichiers pour un même bitmap, donc, et c'est voulu : ils ne se rendent pas
    // pareil, et un renvoi d'une famille à l'autre casserait en biais le jour où
    // le jeu en retouche un seul.
    bottom: { sprite: img.boss('CT_Slot_Bottom'), slice: 28 },
    vignette: { sprite: img.boss('CT_Slot_Dim_2'), opacity: 0.651 },
    element: {
      // 50×50 à (+6,1 ; +5,61) AVEC `m_LocalScale = 0,9` : le scale s'applique
      // autour du pivot (1,1), donc le coin haut-droit ne bouge pas et la boîte
      // rendue fait 45. Les enfants restent écrits en unités de 50 — d'où
      // `parent: 50` sur une boîte de 45, qui applique le 0,9 tout seul.
      box: { x: 6.1, y: 5.61, w: 45, h: 45 },
      parent: 50,
      inner: {
        earth: { x: 0, y: -0.78, s: 47 },
        water: { x: 0, y: 0, s: 50 },
        fire: { x: 0, y: 0.12, s: 46 },
        light: { x: 0, y: 0, s: 50 },
        dark: { x: 0, y: 0, s: 50 },
      },
      sprite: (slug) => img.boss(`CT_Element_${cap(slug)}`),
    },
    klass: {
      box: { x: 0, y: -39.08, w: 34, h: 34 },
      sprite: (slug) => img.boss(`CT_Class_${cap(slug)}`),
    },
    star: {
      // Le prefab l'ancre en BAS à +4 sur une hauteur de 22 → 128 − 4 − 11 = 113.
      centerY: 113,
      // Les teintes viennent de la table, pas du prefab (cf. `TRANSCENDENCE`).
      sprite: (tone) => img.star(tone),
    },
    level: {
      // `Level_New` (+46 ; −24) plus l'offset de `LevelText` (0 ; +1). La boîte
      // ne fait que 32 de large : c'est ELLE qui rend `m_BestFit` visible, un
      // niveau à trois chiffres n'y tient pas à corps 20 (cf. `fitSize`).
      box: { x: 46, y: -23, w: 32, h: 32 },
      minSize: 12,
      color: '#f1f1f1',
      effects: [
        { kind: 'outline', x: 2, y: -2, a: 0.502 },
        { kind: 'shadow', x: -2, y: 2, a: 0.5 },
      ],
    },
    boss: img.boss('CT_Slot_Boss'),
  },
};

/** Commun aux deux prefabs : le cadre du portrait et l'ombre du bas. */
const ICON: Node = { x: 0, y: 0, w: 122, h: 122 };
const BOTTOM = { w: BOX - 6, h: 32, bottom: 3 };
const BANNER: Node = { x: 0, y: 0, w: 60, h: 20 };
const STAR = { size: 22, step: 18 };

/** Largeur de la rangée, telle que le HorizontalLayoutGroup la calcule. */
const starRowWidth = (n: number) => n * STAR.size + (n - 1) * (STAR.step - STAR.size);

/** Types de monstre qui portent la bannière BOSS. Même set que `SetMonsterBG` → Rare. */
const BOSS_TYPES = new Set(['boss', 'area_boss', 'season_boss']);

type Common = {
  /** Slug d'élément (fire/water/earth/light/dark). */
  element?: string;
  /** Slug de classe du site (striker/defender/ranger/mage/healer). */
  cls?: string;
  /** Niveau. Omis = pas de chiffre. */
  level?: number;
  /** Force la bannière BOSS (un renfort de type `boss` n'en porte pas). */
  boss?: boolean;
  /** Nom, pour l'alternative textuelle du portrait. */
  name?: string;
  /**
   * Taille de la case. Une seule dimension suffit (`w-24`) : la case est tenue
   * CARRÉE par `aspect-square` — toute la géométrie du prefab s'exprime en % de
   * la case, et les % horizontaux se résolvent sur la largeur quand les
   * verticaux se résolvent sur la hauteur : un rectangle décalerait tout.
   */
  className?: string;
};

export type ThumbnailProps = Common &
  (
    | {
        kind: 'monster';
        /** `FaceIconID` brut (`monsters.json.icon`) — `img.monster` tranche MT_ vs FI_. */
        icon: string;
        /** Slug de `CHARACTER_TYPE`. Choisit le FOND et, par défaut, la bannière. */
        type: string;
        /**
         * Étoiles affichées, 1..6 — le BasicStar du `MonsterTemplet`. Un simple
         * compteur ici, contrairement au perso : un monstre ne se transcende pas.
         * Omis = pas de rangée.
         */
        stars?: number;
      }
    | {
        kind: 'character';
        /** Id de perso (`characters.json`) — sert la face icon composée. */
        id: string;
        /** BasicStar 1..3 : choisit le FOND (Magic / Rare / Unique). */
        rarity: number;
        /**
         * Palier de transcendance (`TransStar`), de la rareté jusqu'à 9. C'est
         * LUI qui décide combien d'étoiles s'affichent et de quelle teinte —
         * pas un compteur (cf. `TRANSCENDENCE`). Omis = perso non transcendé,
         * donc autant d'étoiles jaunes que sa rareté.
         *
         * Le site ne stocke pas cet état joueur : la prop n'existe que pour les
         * rendus qui le connaissent (guides de build, comparatifs).
         */
        transcendence?: number;
      }
  );

/**
 * CE QU'IL FAUT D'UN MONSTRE POUR EN RENDRE LA VIGNETTE, et rien de plus.
 *
 * Les guides résolvent leurs monstres côté SERVEUR (`lib/data/monsters` lit le
 * disque) puis passent le résultat à des composants client — menus d'étage,
 * sélecteurs de renforts, grilles de stages. Ils leur passaient jusqu'ici une
 * URL déjà construite, ce qui suffisait à afficher une face nue mais perdait en
 * route le type, la rareté, l'élément et la classe : de quoi rendre la vignette,
 * jamais transmis. D'où cette forme, sérialisable et volontairement plate — elle
 * se déverse telle quelle dans `Thumbnail` (`{...thumb}`), et `monsterThumb()`
 * la construit depuis un `Monster`.
 */
export interface MonsterThumb {
  icon: string;
  type: string;
  stars: number;
  element: string;
  cls: string;
}

/**
 * La rangée d'étoiles : une teinte par étoile, de gauche à droite. Vide = pas de
 * rangée. Chez le monstre c'est un compteur ; chez le perso, la table décide.
 */
function starRow(props: ThumbnailProps): StarTone[] {
  if (props.kind === 'monster') {
    const n = props.stars && props.stars > 0 ? Math.min(props.stars, 6) : 0;
    return Array.from({ length: n }, () => 'y');
  }
  const row = TRANSCENDENCE[props.rarity]?.[props.transcendence ?? props.rarity];
  // Rareté ou palier hors table : on retombe sur « autant de jaunes que la
  // rareté » plutôt que de ne rien afficher — une donnée inattendue ne doit pas
  // faire disparaître la rangée.
  if (!row) return Array.from({ length: Math.min(Math.max(props.rarity, 0), 6) }, () => 'y');
  const [show, tone, plus] = row;
  return Array.from({ length: show }, (_, i) => (plus > 0 && i === show - 1 ? tone : 'y'));
}

export function Thumbnail(props: ThumbnailProps) {
  const { element, cls, level, boss, name = '', className = 'h-16 w-16' } = props;
  const skin = SKIN[props.kind];
  const isMonster = props.kind === 'monster';

  const slotSrc = isMonster ? img.monsterSlotByType(props.type) : img.characterSlot(props.rarity);
  const iconSrc = isMonster ? img.monster(props.icon) : img.face(props.id);
  const showBoss = boss ?? (isMonster && BOSS_TYPES.has(props.type));
  const stars = starRow(props);
  const n = stars.length;

  return (
    // `@container` : le niveau est du TEXTE, il lui faut une taille liée à la
    // case et non au flux typographique de la page (cf. `cqw` plus bas).
    // `aspect-square` : filet de sécurité, pas un doublon des classes de taille
    // — il ne s'applique QUE si l'appelant laisse une dimension libre (`w-24`
    // seul), et s'efface dès que les deux sont données.
    // Pas d'`overflow-hidden` : l'élément déborde, le prefab le veut ainsi.
    <span className={`@container relative block aspect-square shrink-0 ${className}`}>
      <img
        src={slotSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full"
        loading="lazy"
      />

      {/* LE PORTRAIT — 122×122 CENTRÉ, donc en retrait de 3 de chaque côté, et
          pas en pleine case. Le nœud `Thumbnail` des prefabs ne sert à rien (son
          Image est à alpha 0) : l'affichage passe par `m_FaceIconRect`, qui
          instancie le prefab `FI_<icon>` du bundle faceicon. Or CE prefab cadre
          son contenu dans un `Thumbnail` de 122×122 — pour les 234 persos comme
          pour les 499 monstres, sans exception. Le sprite `MT_` fait 128 : le jeu
          le RÉDUIT à 122. C'est ce retrait qui empêche l'art de mordre sur la
          bordure du fond. */}
      <img src={iconSrc} alt={name} className="absolute" style={centered(ICON)} loading="lazy" />

      {/* L'OMBRE DU BAS en `border-image` et pas en `<img>` : le prefab la pose
          en `Sliced`, et une image étirée ne sait pas préserver ses extrémités.
          Un seul chemin pour les deux habillages — avec `slice: 0` la règle se
          réduit exactement à « toute l'image étirée », ce que fait le monstre.
          Les bordures sont en `cqw` (1 % de la case) pour que les 28 unités du
          sprite gardent leur proportion à toutes les tailles. */}
      <span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: pc(BOTTOM.w),
          height: pc(BOTTOM.h),
          bottom: pc(BOTTOM.bottom),
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderWidth: `0 ${cqw(skin.bottom.slice)}`,
          borderImage: `url("${skin.bottom.sprite}") 0 ${skin.bottom.slice} fill / 0 ${cqw(skin.bottom.slice)} stretch`,
        }}
      />

      {/* Le prefab pose ce calque à une opacité précise (`m_Color.a`) — à plein
          il noircit franchement les bords. La valeur vient de là, pas du goût. */}
      <img
        src={skin.vignette.sprite}
        alt=""
        aria-hidden
        className="absolute"
        style={{ ...centered(ICON), opacity: skin.vignette.opacity }}
        loading="lazy"
      />

      {showBoss && (
        <img
          src={skin.boss}
          alt="boss"
          className="absolute"
          style={corner('top-left', BANNER)}
          loading="lazy"
        />
      )}

      {n > 0 && (
        // La rangée porte une largeur EXPLICITE (celle que le HorizontalLayoutGroup
        // calcule : n×22 avec un espacement de −4). Sans elle le conteneur est en
        // largeur automatique, et les pourcentages des étoiles n'ont plus rien à
        // quoi se rapporter — elles retombent sur la taille native du sprite,
        // donc identiques quelle que soit la taille de la vignette.
        <span
          className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
          style={{
            top: pc(skin.star.centerY),
            width: pc(starRowWidth(n)),
            height: pc(STAR.size),
          }}
        >
          {stars.map((tone, i) => (
            <img
              key={i}
              src={skin.star.sprite(tone)}
              alt=""
              aria-hidden
              className="block h-full"
              style={{
                // En % de la RANGÉE, pas de la case : le parent direct fait foi.
                width: `${(STAR.size / starRowWidth(n)) * 100}%`,
                marginLeft: i ? `${((STAR.step - STAR.size) / starRowWidth(n)) * 100}%` : undefined,
              }}
              loading="lazy"
            />
          ))}
        </span>
      )}

      {element && (
        // Élément et classe sont DÉCORATIFS pour un lecteur d'écran : leur `alt`
        // ne pouvait être que le slug anglais brut (« dark », « mage ») dans les
        // cinq langues, et le composant ne traduit rien. Mieux vaut se taire que
        // dire « dark » à un lecteur japonais — l'info reste portée par le nom
        // à côté, lui localisé.
        <span className="absolute" style={corner('top-right', skin.element.box)}>
          <img
            src={skin.element.sprite(element)}
            alt=""
            aria-hidden
            className="absolute"
            style={inBox(
              skin.element.parent,
              skin.element.inner[element] ?? { x: 0, y: 0, s: skin.element.parent },
            )}
            loading="lazy"
          />
        </span>
      )}

      {cls && (
        <img
          src={skin.klass.sprite(cls)}
          alt=""
          aria-hidden
          className="absolute"
          style={corner('top-right', skin.klass.box)}
          loading="lazy"
        />
      )}

      {level != null && (
        // Le chiffre SEUL, sans plaque derrière (cf. piège 2) : ce qui le
        // détache du portrait, ce sont ses deux effets. Le corps est en `cqw`
        // (1 % de la case) : il suit la vignette et non la typo de la page.
        // Graisse NORMALE — `m_FontStyle` vaut 0 dans les deux prefabs.
        <span
          className="absolute grid place-items-center font-mono leading-none tabular-nums"
          style={{
            ...centered(skin.level.box),
            fontSize: cqw(fitSize(String(level), skin.level.box.w, skin.level.minSize)),
            color: skin.level.color,
            textShadow: textShadow(skin.level.effects),
          }}
        >
          {level}
        </span>
      )}
    </span>
  );
}
