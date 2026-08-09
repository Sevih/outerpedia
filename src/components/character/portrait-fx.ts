/**
 * L'EFFET ANIMÉ DU PORTRAIT — la table, relevée du jeu et rien d'autre.
 *
 * `portrait-layout` porte la géométrie du portrait STATIQUE. Ce module-ci porte
 * le nœud que cette transcription laisse vide : `FX_Holder`, soit
 * `CUICharacterThumbnail.m_EffectHolder`. `SetEffect` y instancie un prefab dont
 * le NOM vient de `CharacterExtraTemplet.ThumbnailEffect` — 25 personnages sur
 * 124 en ont un, pour dix prefabs.
 *
 * LA TABLE EST GÉNÉRÉE, pas écrite : `datagen/assets/extract-portrait-fx.py` la
 * tire des bundles. Elle n'a rien à faire en dur ici, contrairement aux rects de
 * `portrait-layout` qu'on relit ligne à ligne — celle-ci est re-dérivable d'une
 * commande, et elle porte des mailles et des matériaux entiers.
 *
 * CE QUI ANIME, ET CE QUI N'ANIME PAS. Les prefabs ne contiennent aucun
 * `AnimationClip` : seulement des `ParticleSystem`, en deux familles.
 *
 *   1. LES CALQUES DE CADRE (`inner`, `out`…) n'émettent QU'UNE particule, en
 *      `m_RenderMode = Mesh` sur une maille dédiée. Leur `looping` est faux et
 *      leur durée de vie vaut `lengthInSec` : on croirait un one-shot de 1,5 s.
 *      C'est `ringBufferMode = 2` (LoopUntilReplaced) qui tranche — la particule
 *      ne meurt jamais, son âge reboucle. Tout le mouvement vient du SHADER, qui
 *      fait défiler les UV sur le temps (cf. `portrait-fx-gl`).
 *
 *   2. LES ÉMETTEURS DÉCORATIFS (`star`, `atlas`, `bubble`) sont de vraies
 *      particules. `_Demi`, le premier effet servi, n'en a AUCUN — d'où l'ordre
 *      dans lequel les paliers ont été pris. Leurs modules sont pourtant déjà
 *      dans la table (`shape`, `sizeOverLifetime`, `textureSheet`…) : la table
 *      dit ce que le jeu fait, pas ce que le site sait rendre.
 *
 * L'EXÉCUTION est ailleurs : `portrait-fx-sim` transcrit ce que le
 * `ParticleSystem` du jeu CALCULE (courbes, âges, naissances, vitesses,
 * débords), `portrait-fx-gl` le dessine, `AnimatedPortrait` le monte. Ce
 * fichier ne rend rien — même partage que
 * `portrait-layout` / `Portrait` / `portrait-canvas`.
 */
import FX from '@datagen/assets/portrait-fx.json';

/** Un dégradé Unity : deux rampes INDÉPENDANTES, couleurs et alphas. */
export interface Gradient {
  rgb: { t: number; c: number[] }[];
  a: { t: number; a: number }[];
}

/**
 * `MinMaxGradient` — `mode` 0 = couleur, 1 = dégradé, 2 = deux couleurs (tirage
 * au sort à la naissance), 3 = deux dégradés. Les modes 2 et 3 n'apparaissent
 * que sur les émetteurs décoratifs.
 */
export interface MinMaxGradient {
  mode: number;
  max?: number[];
  min?: number[];
  maxGradient?: Gradient;
  minGradient?: Gradient;
}

export interface FxEmitter {
  name: string;
  active: boolean;
  /** Position en unités du cadre, Y vers le BAS (convention de `portrait-layout`). */
  pos: [number, number];
  /** `m_LocalScale`, dans le sens d'Unity (Y vers le haut) — il n'a pas de signe. */
  scale: [number, number, number];
  /**
   * `m_LocalRotation`, quaternion Unity (x, y, z, w) TEL QUEL. Identité sur les
   * calques de cadre ; −90° sur X pour les émetteurs de particules, dont le +Z
   * d'émission pointe alors vers le HAUT de la carte.
   */
  rotation: [number, number, number, number];
  lengthInSec: number;
  simulationSpeed: number;
  looping: boolean;
  prewarm: boolean;
  /** 0 = désactivé, 1 = pause en fin de vie, 2 = la vie REBOUCLE. Cf. l'en-tête. */
  ringBufferMode: number;
  ringBufferLoopRange: [number, number];
  /**
   * Les scalaires initiaux suivent tous le même trio : valeur (= le max des
   * tirages), `…Min`, et `…Mode` — le `minMaxState` d'Unity : 0 constante,
   * 1 courbe, 3 tirage entre les deux constantes.
   */
  startLifetime: number;
  startLifetimeMin: number;
  startLifetimeMode: number;
  startSize: number;
  startSizeMin: number;
  startSizeMode: number;
  /** Vrai = la hauteur du billboard tire sa PROPRE plage (`startSizeY`). */
  size3D: boolean;
  startSizeY: number;
  startSizeYMin: number;
  startSizeYMode: number;
  startSpeed: number;
  startSpeedMin: number;
  startSpeedMode: number;
  /** Rotation initiale du quad, radians, axe Z seul (`rotation3D` faux partout). */
  startRotation: number;
  startRotationMin: number;
  startRotationMode: number;
  /** ×`Physics.gravity`, en unités MONDE — un système local sous échelle 50 la divise d'autant. */
  gravityModifier: number;
  /** 0 = Hierarchy : l'échelle du transform s'applique aux positions, tailles ET vitesses. */
  scalingMode: number;
  maxParticles: number;
  startColor: MinMaxGradient;
  emission: { rateOverTime: number; bursts: unknown[] };
  /** 0 = Billboard (quads simulés), 4 = Mesh (calques de cadre). */
  renderMode: number;
  /** `m_SortingOrder` du renderer — 10 met les particules AU-DESSUS des cadres. */
  sortingOrder: number;
  /**
   * `ParticleSystemRenderer.m_ApplyActiveColorSpace` : si vrai, Unity convertit
   * la couleur de particule (startColor × colorOverLifetime) en LINÉAIRE à la
   * cuisson. La chaîne UIParticle → Canvas ajoute ensuite SA conversion à TOUS
   * les émetteurs (UGUI ne convertit pas les couleurs de sommet en Linear, le
   * paquet s'en charge) : un émetteur qui porte ce drapeau arrive donc DEUX fois
   * converti au shader — relevé à l'écran, le rouge profond du liseré `_Demi`
   * ne s'obtient pas autrement. VARIE PAR ÉMETTEUR : vrai pour les deux calques
   * de `_Demi`, faux pour la plupart des autres prefabs.
   */
  applyActiveColorSpace: boolean;
  mesh: string | null;
  material: string | null;
  colorOverLifetime?: MinMaxGradient;
  /**
   * Modules des émetteurs décoratifs, publiés BRUTS (le typetree d'Unity tel
   * quel) : c'est `portrait-fx-sim` qui les lit, et qui REFUSE ce qu'il ne
   * transcrit pas plutôt que de le rendre de travers.
   */
  shape?: unknown;
  sizeOverLifetime?: unknown;
  rotationOverLifetime?: unknown;
  textureSheet?: unknown;
  noise?: unknown;
  velocityOverLifetime?: unknown;
  limitVelocity?: unknown;
}

export interface FxMaterial {
  name: string;
  /** `m_ValidKeywords` : ce sont EUX qui décident de la variante du shader. */
  keywords: string[];
  textures: Record<string, { tex: string; st: number[] }>;
  floats: Record<string, number>;
  vectors: Record<string, number[]>;
}

export interface FxMesh {
  name: string;
  /** Sommets XY en unités Unity (Y vers le HAUT), avant taille et échelle. */
  v: [number, number][];
  uv: [number, number][];
  /** Triangles, indices dans `v`. */
  i: number[];
}

export interface FxTexture {
  w: number;
  h: number;
  /** 0 = Repeat, 1 = Clamp, 2 = Mirror. */
  wrapU: number;
  wrapV: number;
  /** 0 = Point, 1 = Bilinear, 2 = Trilinear. */
  filter: number;
  /** Nombre de niveaux du jeu. 1 = AUCUN mip, et il faut alors n'en fabriquer aucun. */
  mips: number;
  /** 1 = la texture est marquée sRGB, donc linéarisée à l'échantillonnage. */
  srgb: number;
}

interface FxTable {
  frame: { w: number; h: number };
  /**
   * `ColorSpace` du projet du jeu, lu dans `globalgamemanagers`. `linear` ici —
   * et ce n'est pas un détail d'étalonnage : c'est ce qui rend `_MainStrength = 70`
   * sensé. En supposant `gamma`, le produit de trois échantillons à mi-gris part à
   * 8,75 au lieu de 0,65 et blanchit la carte entière.
   */
  colorSpace: 'linear' | 'gamma' | 'unknown';
  /** Rect résolu de `FX_Holder` dans le cadre, en coordonnées CSS. */
  holder: { x: number; y: number; w: number; h: number };
  /** `CharacterID → nom d'effet`, les 25 lignes du jeu. */
  byCharacter: Record<string, string>;
  effects: Record<string, { origin: [number, number]; emitters: FxEmitter[] }>;
  materials: Record<string, FxMaterial>;
  meshes: Record<string, FxMesh>;
  textures: Record<string, FxTexture>;
}

export const PORTRAIT_FX = FX as unknown as FxTable;

/** Le nom d'effet d'un personnage, ou undefined — la grande majorité n'en a pas. */
export function fxNameOf(characterId: string): string | undefined {
  return PORTRAIT_FX.byCharacter[characterId];
}

/**
 * L'effet d'un personnage, s'il en a un ET qu'il est extrait.
 *
 * Les deux conditions sont distinctes et il faut les garder distinctes : un perso
 * peut porter un `ThumbnailEffect` que la table connaît mais dont le prefab n'a
 * pas encore été sorti (`extract-portrait-fx.py` ne sort que les effets servis).
 * Confondre les deux ferait passer un palier de portage pour une absence d'effet.
 */
export function fxOf(characterId: string) {
  const name = fxNameOf(characterId);
  return name ? PORTRAIT_FX.effects[name] : undefined;
}

/**
 * LES BRANCHES DU SHADER QUE LE PORTAGE A LUES, et elles seules.
 *
 * `MASTA/S_Assemble_Particle_UI` est un ubershader : ses 672 variantes compilées
 * ne sont que le même code sous `#ifdef`. `portrait-fx-gl` en rejoue les branches
 * relevées dans le GLSL ES 3.0 du bundle `shader/common` — pas celles qu'on
 * devinerait d'un nom de propriété. Un matériau qui demanderait autre chose est
 * REFUSÉ plutôt que rendu de travers : c'est ce que dit `unsupportedKeywords`.
 *
 * Les huit effets restants en auront besoin (`_POLAR_UV_ON` et `_DISSOLVE_UV_ON`
 * notamment) ; ce sera le moment de relire les variantes correspondantes.
 */
export const SUPPORTED_KEYWORDS = new Set([
  '_MAIN_CONTRAST_ON',
  '_MAIN_CLAMP',
  '_MAIN_ALPHACHANNEL_ON',
  '_NOISE_UV_ON',
  '_SECOND_TEX_ON',
  '_SECOND_TYPE_ADD',
  '_THIRD_TEX_ON',
  '_THIRD_TYPE_ADD',
  '_ALPHA_TEX_ON',
]);

export function unsupportedKeywords(mat: FxMaterial): string[] {
  return mat.keywords.filter((k) => !SUPPORTED_KEYWORDS.has(k));
}
