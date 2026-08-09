/**
 * LE SHADER DU JEU, REJOUÉ — pas imité.
 *
 * Les 22 matériaux des dix effets de portrait partagent UN shader,
 * `MASTA/S_Assemble_Particle_UI` (bundle `shader/common`). Son GLSL ES 3.0
 * compilé est lisible dans le bundle : 672 variantes, qui ne sont que le même
 * ubershader sous `#ifdef`, et 44 fragments distincts. Le fragment ci-dessous en
 * est la transcription — même ordre d'opérations, mêmes noms d'uniformes.
 *
 * D'où le WebGL2 plutôt qu'un empilement de `background-position` animés : ce
 * n'est pas une question d'effet, c'est que la formule EXISTE et qu'on peut la
 * poser telle quelle.
 *
 * TOUT SE JOUE EN LUMIÈRE LINÉAIRE, et c'est LA valeur qui décide de l'étalonnage.
 * `globalgamemanagers` donne `m_ActiveColorSpace = 1` (Linear) : les textures
 * marquées sRGB sont donc linéarisées à l'échantillonnage, le mélange additif se
 * fait en linéaire, et l'encodage sRGB n'a lieu qu'une fois, à l'écriture finale.
 * Ce n'est pas un raffinement : `_MainStrength` vaut 70 sur le liseré et multiplie
 * le produit de trois échantillons. À mi-gris, ce produit vaut 0,0088 en linéaire
 * (× 70 = 0,62, une lueur) et 0,125 en gamma (× 70 = 8,75, un aplat blanc). Un
 * premier jet supposait gamma : la carte entière était blanche.
 *
 * D'où la chaîne en trois temps, qui n'existe QUE pour ça :
 *   1. les textures montent en `SRGB8_ALPHA8` — le GPU rend des valeurs linéaires ;
 *   2. tout se dessine dans une cible qui TIENT du linéaire (cf. `buildGL`), où le
 *      mélange additif se fait donc en linéaire, comme le `Blend SrcAlpha One`
 *      du jeu ;
 *   3. une passe de report encode en sRGB vers le canvas, une seule fois.
 *
 * L'ART DU PORTRAIT EST PEINT DANS LE CANVAS, et pas laissé au `<img>` en dessous.
 * C'est le prix du point précédent : l'effet s'AJOUTE à l'art, et cette addition
 * doit avoir lieu en linéaire. Un `mix-blend-mode: plus-lighter` l'aurait faite en
 * sRGB — donc pas la même. Le `<img>` de `Portrait` reste dessous, comme repli
 * quand WebGL manque.
 *
 * LE CONTEXTE EST PÉRISSABLE, ET C'EST UN CAS NORMAL, pas une panne. L'éviction
 * d'`AnimatedPortrait` perd les contextes VOLONTAIREMENT (`loseContext`), et le
 * navigateur perd les siens tout seul (Memory Saver au retour d'onglet, reset du
 * pilote). Deux faits mesurés — sur Chrome/ANGLE, pas supposés — dictent la
 * structure du montage :
 *
 *   1. un canvas ne rend jamais qu'UN contexte : après une perte, `getContext`
 *      rend le MÊME objet, perdu. Le remontage d'une carte évincée doit donc le
 *      RESSUSCITER (`restoreContext`), pas en attendre un neuf ;
 *   2. `restoreContext` est MUET si `webglcontextlost` n'a pas été annulé — et
 *      c'est `destroy()` qui perd le contexte, donc l'événement part quand les
 *      écouteurs de la session sont déjà retirés. L'annulation est donc posée par
 *      un écouteur qui SURVIT au démontage (cf. `RESTORABLE`) ;
 *   3. sur un contexte perdu, `getExtension` rend NULL — y compris pour
 *      `WEBGL_lose_context`. L'extension qui sait ressusciter doit donc être
 *      RETENUE pendant que le contexte est vivant (cf. `LOSE_EXT`) : la demander
 *      au remontage d'un canvas recyclé rend null, et un `?.` par-dessus en
 *      ferait un non-geste silencieux — c'est arrivé.
 *
 * Tout ce qui vit dans le GPU se reconstruit via `buildGL`, au montage et à
 * chaque `webglcontextrestored`, depuis des caches CPU (géométrie, images
 * décodées) — une restauration ne repasse pas par le réseau.
 *
 * DEUX ÉCARTS ASSUMÉS, notés sur `/dev/AnimatedPortrait` :
 *
 *   1. LE `_ClipRect` EST IGNORÉ. Le fragment du jeu commence par un `discard`
 *      hors du rect de masque du Canvas. Le portrait n'a pas de masque actif sur
 *      cette branche de l'arbre (`FX_Holder` est FRÈRE du `Mask`, pas dedans),
 *      donc le test passe toujours — le transcrire écrirait un `discard` mort.
 *
 *   2. LA CHROME RESTE EN DOM. Étoiles, niveau, nom et badges sont posés par
 *      `Portrait` par-dessus le canvas, donc composés en sRGB par le navigateur
 *      alors que le jeu les mélange en linéaire. Ils sont opaques ou presque, où
 *      les deux espaces coïncident ; l'effet, lui, ne l'est pas, et c'est pourquoi
 *      c'est LUI qu'on a rapatrié dans le canvas.
 */
import { img } from '@/lib/images';
import { PORTRAIT_FX, unsupportedKeywords, type FxEmitter, type FxMaterial } from './portrait-fx';
import {
  createBillboardSim,
  evalMinMax,
  frameAge,
  fxBleed,
  isQuadLayer,
  unsupportedBillboard,
  type BillboardSim,
} from './portrait-fx-sim';

/*
 * LES SOURCES GLSL SONT EN ASCII PUR, commentaires compris, et c'est une
 * contrainte du langage — pas un choix de style. GLSL ES n'admet pas d'autre jeu
 * de caractères : un « é » dans un commentaire fait échouer la compilation, et
 * ANGLE la refuse en rendant un journal VIDE (`getShaderInfoLog` à `null`), donc
 * sans rien dire de la cause. Toute explication en français va dans les
 * commentaires TypeScript AUTOUR des littéraux, jamais dedans.
 */

/**
 * Le sommet des calques : la géométrie est posée en unités Unity (Y vers le
 * HAUT), le clip l'est aussi — aucun retournement ici. `uM` est la matrice 2×2
 * locale → clip (colonnes xy puis zw) et `uT` la translation : un calque de
 * cadre n'y met qu'une diagonale, un billboard y plie sa taille ET sa rotation.
 */
const VERT = `#version 300 es
in vec2 aPos;
in vec2 aUV;
uniform vec4 uM;
uniform vec2 uT;
out vec2 vUV;
void main() {
  vUV = aUV;
  gl_Position = vec4(mat2(uM.xy, uM.zw) * aPos + uT, 0.0, 1.0);
}`;

/**
 * Le fragment, ligne à ligne d'après les variantes compilées.
 *
 * L'original écrit `_Time.x * 20.0` : `_Time.x` vaut `t/20`, le produit vaut donc
 * les SECONDES. `uTime` les porte directement.
 *
 * Le bruit est échantillonné UNE fois puis décale les UV de main, second et third
 * — mais PAS celles de l'alpha, qui n'en reçoit pas dans les variantes lues. Le
 * `clamp` de `_MAIN_CLAMP`, lui, ne s'applique qu'à main, et APRÈS le bruit.
 *
 * Le test `uMainContrast != 0.0` est celui du jeu, et il vit À L'INTÉRIEUR de la
 * variante « contraste allumé » : un contraste nul y laisse la couleur intacte au
 * lieu de la ramener à 1. Le recopier en dehors changerait le rendu.
 *
 * Aucune conversion de couleur ici : les échantillonneurs rendent déjà du
 * linéaire (textures `SRGB8_ALPHA8`), la cible garde du linéaire, et l'encodage
 * sRGB attend la passe de report.
 *
 * LE `clamp` FINAL EST DU JEU, pas une prudence. Le jeu écrit dans une cible 8
 * bits, qui borne la sortie du fragment à [0,1] — et `_MainStrength = 70` la fait
 * largement déborder, ce qui SATURE le liseré en blanc et fait perdre sa teinte
 * rose. C'est voulu là-bas, donc c'est écrit ici : notre cible flottante ne
 * bornerait rien, et le liseré ressortirait teinté là où le jeu le brûle.
 *
 * L'échantillon principal s'appelle `mainTex` et non `main` : GLSL ES refuse de
 * déclarer une variable qui porte le nom de la fonction englobante.
 *
 * LA SORTIE EST PRÉMULTIPLIÉE PAR LE SHADER, pas par le blend : le jeu clampe
 * (c, a) à l'écriture UNORM puis mélange `SrcAlpha One` (ou `One One`) sur un
 * fond OPAQUE. Notre canvas, lui, a un canal alpha que le jeu n'a pas — on y
 * écrit l'OCCLUSION de la lumière ajoutée, sa composante la plus forte : une
 * lumière additive ne couvre la page que là où elle éclaire. L'alpha de
 * TEXTURE, lui, peut être plein sur tout le quad — vécu : l'alpha plat de la
 * bulle de `_Seasonal` posait des carrés opaques dans le débord. (Les
 * commentaires DANS les sources restent ASCII : GLSL ES interdit le reste, et
 * la garde de `compile` le refuse — vécu aussi.)
 */
const FRAG = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 outColor;

uniform sampler2D uMainTex;
uniform sampler2D uSecondTex;
uniform sampler2D uThirdTex;
uniform sampler2D uNoiseTex;
uniform sampler2D uAlphaTex;

uniform vec4 uMainST, uSecondST, uThirdST, uNoiseST, uAlphaST;
uniform vec2 uMainSpeed, uSecondSpeed, uThirdSpeed, uNoiseSpeed, uAlphaSpeed;

uniform float uTime;
uniform float uMainContrast, uMainStrength, uNoiseStrength, uAlphaStrength;
uniform vec4 uColor;      // _Color of the material, already linear
uniform vec4 uParticle;   // startColor x colorOverLifetime, linearized on the CPU

uniform bool uMainContrastOn, uMainClamp, uMainAlphaChannel;
uniform bool uNoiseOn, uSecondOn, uSecondAdd, uThirdOn, uThirdAdd, uAlphaTexOn;
uniform bool uSrcAlphaBlend; // _SrcBlend = SrcAlpha (les cadres) vs One (star)

void main() {
  float t = uTime;

  vec2 n = vec2(0.0);
  if (uNoiseOn) {
    vec2 nuv = vUV * uNoiseST.xy + uNoiseST.zw + t * uNoiseSpeed;
    n = texture(uNoiseTex, nuv).xy * uNoiseStrength;
  }

  vec2 muv = vUV * uMainST.xy + uMainST.zw + t * uMainSpeed + n;
  if (uMainClamp) muv = clamp(muv, 0.0, 1.0);
  vec4 mainTex = texture(uMainTex, muv);

  vec3 c = mainTex.rgb;
  if (uMainContrastOn && uMainContrast != 0.0) c = pow(c, vec3(uMainContrast));

  if (uSecondOn) {
    vec3 s = texture(uSecondTex, vUV * uSecondST.xy + uSecondST.zw + t * uSecondSpeed + n).rgb;
    c = uSecondAdd ? c + s : c * s;
  }
  if (uThirdOn) {
    vec3 d = texture(uThirdTex, vUV * uThirdST.xy + uThirdST.zw + t * uThirdSpeed + n).rgb;
    c = uThirdAdd ? c + d : c * d;
  }

  c *= uMainStrength;
  c *= uParticle.rgb * uColor.rgb;

  float a = uMainAlphaChannel ? mainTex.a : mainTex.r;
  if (uAlphaTexOn) a *= texture(uAlphaTex, vUV * uAlphaST.xy + uAlphaST.zw + t * uAlphaSpeed).r;
  a *= uAlphaStrength;
  a *= uColor.a * uParticle.a;

  // Contribution du jeu, premultipliee ICI plutot que par le blend ; l'alpha
  // ecrit est l'OCCLUSION de la lumiere ajoutee - cf. le bloc au-dessus de FRAG.
  vec3 light = clamp(c, 0.0, 1.0) * (uSrcAlphaBlend ? clamp(a, 0.0, 1.0) : 1.0);
  outColor = vec4(light, max(light.r, max(light.g, light.b)));
}`;

/**
 * Le programme à TOUT FAIRE des quads : il pose l'art dans la cible linéaire, puis
 * reporte la cible sur le canvas.
 *
 * `uEncode` fait toute la différence entre les deux emplois : la cible est en
 * `SRGB8_ALPHA8`, donc le GPU encode ce qu'on y écrit et la passe de l'art n'a
 * rien à faire ; le canvas, lui, n'est pas sRGB et le report doit encoder à la
 * main. Il dépréultiplie d'abord et repréultiplie ensuite — la courbe sRGB n'est
 * pas linéaire, l'appliquer à une couleur prémultipliée fausserait les bords
 * translucides du débord.
 *
 * L'OCCLUSION ACCUMULÉE EST BORNÉE À 1 AVANT LE DÉ-PRÉMULTIPLIÉ : l'art opaque
 * PLUS chaque calque qui le recouvre peuvent la porter au-delà, et diviser par
 * un alpha > 1 sous-évalue la couleur que le ×alpha regonfle ensuite dans la
 * courbe sRGB — le quad entier ressortait délavé vers le blanc (vécu : les
 * bulles et le voile de `_Seasonal`).
 *
 * Aucun retournement nulle part : les textures montent en `UNPACK_FLIP_Y`, donc
 * leur v = 0 est le BAS de l'image, et le quad place son `aPos.y = 0` en bas du
 * rect. Les deux conventions coïncident déjà.
 */
const QUAD_VERT = `#version 300 es
in vec2 aPos;
uniform vec4 uRect;
out vec2 vUV;
void main() {
  vUV = aPos;
  gl_Position = vec4(aPos * uRect.xy + uRect.zw, 0.0, 1.0);
}`;

const QUAD_FRAG = `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 outColor;
uniform sampler2D uTex;
uniform bool uEncode;

vec3 linearToSrgb(vec3 c) {
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), c));
}

void main() {
  vec4 s = texture(uTex, vUV);
  if (!uEncode) { outColor = s; return; }
  // L'occlusion accumulee peut depasser 1 : bornee AVANT le depremultiplie,
  // sinon tout le quad ressort delave - cf. le bloc au-dessus du programme.
  float a = min(s.a, 1.0);
  vec3 lin = a > 0.0 ? min(s.rgb, vec3(1.0)) / a : vec3(0.0);
  outColor = vec4(linearToSrgb(min(lin, vec3(1.0))) * a, a);
}`;

/** Les cinq échantillonneurs, dans l'ordre des unités de texture. */
const SLOTS = ['_MainTex', '_SecondTex', '_ThirdTex', '_NoiseTex', '_AlphaTex'] as const;
type Slot = (typeof SLOTS)[number];
const UNIFORM_OF: Record<Slot, string> = {
  _MainTex: 'uMainTex',
  _SecondTex: 'uSecondTex',
  _ThirdTex: 'uThirdTex',
  _NoiseTex: 'uNoiseTex',
  _AlphaTex: 'uAlphaTex',
};
const ST_OF: Record<Slot, string> = {
  _MainTex: 'uMainST',
  _SecondTex: 'uSecondST',
  _ThirdTex: 'uThirdST',
  _NoiseTex: 'uNoiseST',
  _AlphaTex: 'uAlphaST',
};
const SPEED_PROP: Record<Slot, string> = {
  _MainTex: '_MainSpeed',
  _SecondTex: '_SecondTexSpeed',
  _ThirdTex: '_ThirdTexSpeed',
  _NoiseTex: '_NoiseSpeed',
  _AlphaTex: '_AlphaSpeed',
};
const SPEED_OF: Record<Slot, string> = {
  _MainTex: 'uMainSpeed',
  _SecondTex: 'uSecondSpeed',
  _ThirdTex: 'uThirdSpeed',
  _NoiseTex: 'uNoiseSpeed',
  _AlphaTex: 'uAlphaSpeed',
};

/**
 * Sur-échantillonnage de la cible intermédiaire.
 *
 * On ne peut plus compter sur le MSAA du canvas : le dessin passe par une cible
 * hors écran, qui n'en a pas. Or les calques sont des rubans de 13 unités de large
 * sur un cadre de 180 — leurs bords crénèleraient franchement. Deux fois en
 * chaque axe, redescendus au report en filtrage linéaire, coûtent quatre fois des
 * fragments sur une carte de 180×344 : rien.
 */
const SUPERSAMPLE = 2;

/** `TextureWrapMode` d'Unity → constante GL. 0 Repeat, 1 Clamp, 2 Mirror. */
function wrapOf(gl: WebGL2RenderingContext, mode: number): number {
  return mode === 1 ? gl.CLAMP_TO_EDGE : mode === 2 ? gl.MIRRORED_REPEAT : gl.REPEAT;
}

/** sRGB → linéaire, la courbe exacte, pour les couleurs venues de la table. */
function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Compile une source, ou rend `null` en DISANT pourquoi.
 *
 * Le journal du pilote peut être VIDE sur les erreurs de jeu de caractères — un
 * seul octet non-ASCII, fût-il dans un commentaire, et ANGLE refuse la source
 * sans un mot. C'est la seule panne de ce module qu'on ne pourrait pas
 * diagnostiquer à la lecture du log, d'où le contrôle explicite : le message
 * cite le caractère fautif et sa ligne.
 */
function compile(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
  label: string,
  onError: (m: string) => void,
): WebGLShader | null {
  const bad = /[^\x00-\x7F]/.exec(src);
  if (bad) {
    const line = src.slice(0, bad.index).split('\n').length;
    onError(`${label} : caractère non-ASCII « ${bad[0]} » ligne ${line} — GLSL ES l'interdit`);
    return null;
  }
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh;
  onError(`${label} refusé — ${gl.getShaderInfoLog(sh) || '(journal vide)'}`);
  gl.deleteShader(sh);
  return null;
}

function link(
  gl: WebGL2RenderingContext,
  vert: string,
  frag: string,
  attribs: string[],
  label: string,
  onError: (m: string) => void,
): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vert, `${label}/sommet`, onError);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag, `${label}/fragment`, onError);
  if (!vs || !fs) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  attribs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
  gl.linkProgram(p);
  if (gl.getProgramParameter(p, gl.LINK_STATUS)) return p;
  onError(`${label} non lié — ${gl.getProgramInfoLog(p)}`);
  return null;
}

/** Un calque de CADRE (`renderMode = 4`) : la maille du prefab, posée une fois. */
interface MeshLayer {
  kind: 'mesh';
  emitter: FxEmitter;
  material: FxMaterial;
  /** `m_SortingOrder` — l'ordre de tirage entre émetteurs. */
  order: number;
  /** Sommets entrelacés (x, y, u, v) et triangles — la matière du VAO, côté CPU. */
  data: Float32Array;
  indices: Uint16Array;
  /** Recréé par `buildGL` : un VAO ne survit pas à une perte de contexte. */
  vao: WebGLVertexArrayObject | null;
  count: number;
  /** Position/échelle de la maille vers le clip — constante, calculée une fois. */
  xform: [number, number, number, number];
}

/**
 * Un émetteur BILLBOARD (`renderMode = 0`) : des quads dont `portrait-fx-sim`
 * calcule vie, position et taille — l'état vit côté CPU et SURVIT donc aux
 * pertes de contexte, seul le dessin se rejoue.
 */
interface BillboardLayer {
  kind: 'billboard';
  emitter: FxEmitter;
  material: FxMaterial;
  order: number;
  sim: BillboardSim;
  /** Origine de l'émetteur dans le cadre, en CSS. */
  ox: number;
  oy: number;
}

type Layer = MeshLayer | BillboardLayer;

export interface PortraitFxHandle {
  /** Coupe ou relance la boucle SANS perdre le contexte ni le temps écoulé. */
  setRunning(on: boolean): void;
  destroy(): void;
}

/** Poignée inerte — sortie d'échec, pour que l'appelant n'ait jamais à tester null. */
const NO_FX: PortraitFxHandle = { setRunning: () => {}, destroy: () => {} };

export interface PortraitFxOptions {
  /** Nom du prefab d'effet (`FX_UI_Character_List_*`). */
  effect: string;
  /**
   * URL de l'art du portrait. Le canvas le PEINT, il ne se contente pas de le
   * survoler : l'effet s'ajoute à lui en lumière linéaire, ce qu'un mélange CSS
   * ne sait pas faire (cf. l'en-tête).
   */
  art: string;
  /**
   * Remonte les refus : WebGL absent, branche de shader non transcrite, texture
   * 404. TOUT refus passe aussi par la console, qu'on écoute ou non — un effet
   * qui ne se monte pas laisse un portrait parfaitement normal à l'écran, donc
   * rien ne signalerait la panne si personne n'écoutait.
   */
  onError?: (message: string) => void;
  /**
   * Ne monter QUE ces émetteurs, par nom de nœud. Existe pour la page de
   * contrôle, qui montre chaque calque isolément : le jeu, lui, les pose tous.
   */
  only?: readonly string[];
  /**
   * `false` : dessiner UNE image dès les textures prêtes, puis s'arrêter. C'est
   * ce que veut `prefers-reduced-motion` — la parure reste visible, elle ne
   * bouge plus. Elle ne porte aucune information (les étoiles et les tags disent
   * la même chose), donc on la fige au lieu de la ralentir.
   */
  autoplay?: boolean;
}

/**
 * Les canvas déjà armés contre la perte de contexte.
 *
 * L'écouteur qui ANNULE `webglcontextlost` doit SURVIVRE au démontage : c'est
 * `destroy()` qui perd le contexte (éviction), donc l'événement part quand les
 * écouteurs de la session sont déjà retirés — et un événement non annulé rend
 * `restoreContext()` définitivement muet (mesuré sur Chrome/ANGLE). Posé une
 * seule fois par canvas, jamais retiré.
 */
const RESTORABLE = new WeakSet<HTMLCanvasElement>();

/**
 * L'extension `WEBGL_lose_context` de chaque canvas, RETENUE pendant que son
 * contexte est vivant. Sur un contexte perdu, `getExtension` rend null — la
 * résurrection d'un canvas recyclé par l'éviction ne peut donc passer que par
 * l'instance retenue au montage précédent (elle survit aux pertes et aux
 * restaurations : mesuré sur deux cycles complets).
 */
const LOSE_EXT = new WeakMap<HTMLCanvasElement, WEBGL_lose_context>();

export function mountPortraitFx(
  canvas: HTMLCanvasElement,
  { effect: effectName, art, onError: report, only, autoplay = true }: PortraitFxOptions,
): PortraitFxHandle {
  const onError = (m: string) => {
    console.error(`portrait-fx [${effectName}] : ${m}`);
    report?.(m);
  };

  const effect = PORTRAIT_FX.effects[effectName];
  let disposed = false;
  let raf = 0;

  if (!effect) {
    onError(`effet « ${effectName} » absent de portrait-fx.json (non extrait ?)`);
    return NO_FX;
  }
  if (PORTRAIT_FX.colorSpace !== 'linear') {
    // Se tromper d'espace ne se voit pas « un peu » : en gamma, le liseré part à
    // 8,75 et blanchit la carte. Mieux vaut ne rien poser.
    onError(`espace colorimétrique « ${PORTRAIT_FX.colorSpace} » non transcrit`);
    return NO_FX;
  }

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    // Le MSAA du canvas ne servirait à rien : tout est dessiné hors écran puis
    // reporté. C'est `SUPERSAMPLE` qui tient les bords.
    antialias: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) {
    onError('WebGL2 indisponible');
    return NO_FX;
  }
  if (!RESTORABLE.has(canvas)) {
    canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
    RESTORABLE.add(canvas);
  }
  if (!gl.isContextLost()) {
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) LOSE_EXT.set(canvas, lose);
  }

  // --- géométrie — pure, elle survit aux pertes de contexte -----------------------
  const { frame, holder, meshes, materials, textures: texMeta } = PORTRAIT_FX;
  const bleed = fxBleed(effectName);
  const spanW = frame.w * (1 + 2 * bleed.x);
  const spanH = frame.h * (1 + 2 * bleed.y);

  // Le blend est celui du MATÉRIAU (`_SrcBlend`/`_DstBlend`), pas une constante :
  // les cadres mélangent en `SrcAlpha One`, les glints de `star` en `One One`.
  // La destination reste `One` partout — c'est elle qui rend l'ordre de tirage
  // indifférent pour la couleur, et un matériau qui demanderait autre chose est
  // refusé plutôt qu'approché. Le facteur source, lui, s'applique DANS le shader
  // (`uSrcAlphaBlend`) : la sortie est prémultipliée, et son canal alpha porte
  // l'occlusion du canvas, pas l'alpha du matériau — cf. la fin de `FRAG`.
  const BLEND_SRC = new Set([1, 5]);

  const prepared: Layer[] = [];
  const needed = new Set<string>();

  for (const e of effect.emitters) {
    if (only && !only.includes(e.name)) continue;
    if (!e.active || !e.material) continue;
    const mat = materials[e.material];
    if (!mat) continue;
    const missing = unsupportedKeywords(mat);
    if (missing.length) {
      onError(`${mat.name} : branche(s) de shader non transcrite(s) — ${missing.join(', ')}`);
      continue;
    }
    if (!BLEND_SRC.has(mat.floats._SrcBlend ?? 5) || (mat.floats._DstBlend ?? 1) !== 1) {
      onError(`${mat.name} : blend ${mat.floats._SrcBlend}/${mat.floats._DstBlend} non transcrit`);
      continue;
    }

    // L'origine de l'émetteur dans le cadre : le holder, décalé par l'origine du
    // prefab puis par la position du nœud. Y est déjà en sens CSS dans la table.
    const ox = holder.x + effect.origin[0] + e.pos[0];
    const oy = holder.y + effect.origin[1] + e.pos[1];

    if (e.renderMode === 4 && e.mesh) {
      const mesh = meshes[e.mesh];
      if (!mesh) continue;
      const data = new Float32Array(mesh.v.length * 4);
      for (let i = 0; i < mesh.v.length; i++) {
        data[i * 4] = mesh.v[i][0];
        data[i * 4 + 1] = mesh.v[i][1];
        data[i * 4 + 2] = mesh.uv[i][0];
        data[i * 4 + 3] = mesh.uv[i][1];
      }
      // La maille est multipliée par la TAILLE de la particule (`startSize`) puis
      // par l'échelle du transform — `scalingMode = Hierarchy` : les deux comptent.
      const sx = e.startSize * e.scale[0];
      const sy = e.startSize * e.scale[1];
      prepared.push({
        kind: 'mesh',
        emitter: e,
        material: mat,
        order: e.sortingOrder,
        data,
        indices: new Uint16Array(mesh.i),
        vao: null,
        count: mesh.i.length,
        xform: [
          (2 * sx) / spanW,
          (2 * sy) / spanH,
          (2 * (ox + bleed.x * frame.w)) / spanW - 1,
          1 - (2 * (oy + bleed.y * frame.h)) / spanH,
        ],
      });
    } else if (e.renderMode === 0 && isQuadLayer(e)) {
      // Un CALQUE-QUAD (cf. `isQuadLayer`) : même patron qu'un calque-maille —
      // une particule éternelle, l'âge par `frameAge` — mais la géométrie est le
      // quad unitaire du billboard, UV pleins, v = 0 en BAS comme les mailles.
      // La taille suit la même règle : `startSize` × échelle du transform, PAR
      // AXE — un billboard sous l'échelle non uniforme du mode Hierarchy
      // s'étire, et le `web` de `_2000086` (×6,7 en X, ×11,5 en Y) ne couvre la
      // carte de 344 qu'à cette condition.
      const sx = e.startSize * e.scale[0];
      const sy = (e.size3D ? e.startSizeY : e.startSize) * e.scale[1];
      prepared.push({
        kind: 'mesh',
        emitter: e,
        material: mat,
        order: e.sortingOrder,
        data: new Float32Array([
          -0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, -0.5, 0.5, 0, 1, 0.5, 0.5, 1, 1,
        ]),
        indices: new Uint16Array([0, 1, 2, 2, 1, 3]),
        vao: null,
        count: 6,
        xform: [
          (2 * sx) / spanW,
          (2 * sy) / spanH,
          (2 * (ox + bleed.x * frame.w)) / spanW - 1,
          1 - (2 * (oy + bleed.y * frame.h)) / spanH,
        ],
      });
    } else if (e.renderMode === 0) {
      const reason = unsupportedBillboard(e);
      if (reason) {
        onError(`${e.name} : émetteur non simulable — ${reason}`);
        continue;
      }
      prepared.push({
        kind: 'billboard',
        emitter: e,
        material: mat,
        order: e.sortingOrder,
        // La graine par montage est CONFORME : `autoRandomSeed` est vrai côté
        // jeu, chaque session y tire la sienne.
        sim: createBillboardSim(e, (Math.random() * 0x100000000) >>> 0),
        ox,
        oy,
      });
    } else {
      onError(`${e.name} : renderMode ${e.renderMode} non transcrit`);
      continue;
    }
    for (const slot of SLOTS) if (mat.textures[slot]) needed.add(mat.textures[slot].tex);
  }
  // `m_SortingOrder` d'abord (10 met `atlas` et `star` au-dessus des cadres),
  // ordre du prefab ensuite — le tri de JS est stable.
  prepared.sort((a, b) => a.order - b.order);

  if (!prepared.length) {
    onError(`aucun calque rendable dans « ${effectName} »`);
    return NO_FX;
  }

  /** L'art occupe le cadre EXACT à l'intérieur du canvas, débord compris. */
  const ART_RECT: [number, number, number, number] = [
    (2 * frame.w) / spanW,
    (2 * frame.h) / spanH,
    (2 * bleed.x * frame.w) / spanW - 1,
    (2 * bleed.y * frame.h) / spanH - 1,
  ];

  // --- images décodées — cache CPU, une restauration ne re-télécharge rien --------
  const decoded = new Map<string, HTMLImageElement>();
  let artImage: HTMLImageElement | null = null;

  // --- ressources GPU — tout ce qui meurt avec le contexte ------------------------
  let live = false;
  let fxProg: WebGLProgram | null = null;
  let quadProg: WebGLProgram | null = null;
  let U: Record<string, WebGLUniformLocation | null> = {};
  let Q: {
    rect: WebGLUniformLocation | null;
    tex: WebGLUniformLocation | null;
    encode: WebGLUniformLocation | null;
  } = { rect: null, tex: null, encode: null };
  let quadVao: WebGLVertexArrayObject | null = null;
  let bbVao: WebGLVertexArrayObject | null = null;
  const byName = new Map<string, WebGLTexture>();
  let artTex: WebGLTexture | null = null;
  let FORMATS: [number, string][] = [];
  let fbo: WebGLFramebuffer | null = null;
  let fboTex: WebGLTexture | null = null;
  let fboW = 0;
  let fboH = 0;
  let format: number | null = null;
  let formatLabel = '';
  let targetFailed = false;

  function upload(
    image: HTMLImageElement,
    meta?: { wrapU: number; wrapV: number; filter: number; mips: number; srgb?: number },
  ) {
    const tex = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.pixelStorei(gl!.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    // Unity garde l'origine des UV EN BAS ; le DOM la met en haut.
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
    // `SRGB8_ALPHA8` : c'est le GPU qui linéarise, comme dans le jeu — pour les
    // textures que le jeu MARQUE sRGB (les huit de `_Demi` le sont, l'art aussi).
    // Une texture marquée data (`srgb = 0` dans la table) monterait brute.
    const internal = meta?.srgb === 0 ? gl!.RGBA8 : gl!.SRGB8_ALPHA8;
    gl!.texImage2D(gl!.TEXTURE_2D, 0, internal, gl!.RGBA, gl!.UNSIGNED_BYTE, image);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, wrapOf(gl!, meta?.wrapU ?? 1));
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, wrapOf(gl!, meta?.wrapV ?? 1));
    // LES MIPS DU JEU, ET PAS D'AUTRES. Cinq des huit textures de `_Demi` n'en ont
    // AUCUN (`m_MipCount = 1`) : leur en fabriquer lisserait un bruit de 512 sur un
    // ruban de 13 unités jusqu'à l'effacer. Le jeu, lui, échantillonne le niveau 0.
    const mips = (meta?.mips ?? 1) > 1;
    if (mips) gl!.generateMipmap(gl!.TEXTURE_2D);
    // `FilterMode.Bilinear` d'Unity = bilinéaire DANS un niveau, saut sec entre
    // niveaux ; `Trilinear` interpole aussi entre les niveaux.
    const tri = (meta?.filter ?? 1) >= 2;
    gl!.texParameteri(
      gl!.TEXTURE_2D,
      gl!.TEXTURE_MIN_FILTER,
      mips ? (tri ? gl!.LINEAR_MIPMAP_LINEAR : gl!.LINEAR_MIPMAP_NEAREST) : gl!.LINEAR,
    );
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    return tex;
  }

  /** L'art est POSÉ, pas répété : `CLAMP_TO_EDGE`, et pas de mips (il est
   * dessiné à sa taille, jamais minifié au-delà du sur-échantillonnage). */
  const ART_META = { wrapU: 1, wrapV: 1, filter: 1, mips: 1 };

  function buildVao(data: Float32Array, indices: Uint16Array): WebGLVertexArrayObject {
    const vao = gl!.createVertexArray()!;
    gl!.bindVertexArray(vao);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW);
    gl!.enableVertexAttribArray(0);
    gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 16, 0);
    gl!.enableVertexAttribArray(1);
    gl!.vertexAttribPointer(1, 2, gl!.FLOAT, false, 16, 8);
    gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, indices, gl!.STATIC_DRAW);
    gl!.bindVertexArray(null);
    return vao;
  }

  /**
   * (RE)CONSTRUIT tout ce qui vit dans le GPU — au montage, puis à chaque
   * `webglcontextrestored`. Programmes, emplacements d'uniformes, VAOs, textures
   * (depuis le cache d'images) et l'état de la cible : un `format` choisi sur un
   * contexte mort ne dit rien du vivant, il repart à zéro comme le reste.
   */
  function buildGL(): boolean {
    live = false;
    fxProg = link(gl!, VERT, FRAG, ['aPos', 'aUV'], 'effet', onError);
    quadProg = link(gl!, QUAD_VERT, QUAD_FRAG, ['aPos'], 'quad', onError);
    if (!fxProg || !quadProg) return false;

    // Les emplacements d'uniformes, résolus UNE fois par contexte :
    // `getUniformLocation` est une requête au pilote, et la boucle en ferait une
    // trentaine par calque et par image — sur une grille de portraits, ça se voit.
    U = Object.fromEntries(
      [
        'uM',
        'uT',
        'uTime',
        'uColor',
        'uParticle',
        'uMainContrast',
        'uMainStrength',
        'uNoiseStrength',
        'uAlphaStrength',
        'uMainContrastOn',
        'uMainClamp',
        'uMainAlphaChannel',
        'uNoiseOn',
        'uSecondOn',
        'uSecondAdd',
        'uThirdOn',
        'uThirdAdd',
        'uAlphaTexOn',
        'uSrcAlphaBlend',
        ...SLOTS.flatMap((s) => [UNIFORM_OF[s], ST_OF[s], SPEED_OF[s]]),
      ].map((n) => [n, gl!.getUniformLocation(fxProg!, n)]),
    ) as Record<string, WebGLUniformLocation | null>;
    Q = {
      rect: gl!.getUniformLocation(quadProg, 'uRect'),
      tex: gl!.getUniformLocation(quadProg, 'uTex'),
      encode: gl!.getUniformLocation(quadProg, 'uEncode'),
    };

    for (const p of prepared) if (p.kind === 'mesh') p.vao = buildVao(p.data, p.indices);

    // Le quad unitaire : [0,1]² en attribut, placé par `uRect`.
    quadVao = gl!.createVertexArray()!;
    gl!.bindVertexArray(quadVao);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl!.STATIC_DRAW);
    gl!.enableVertexAttribArray(0);
    gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 8, 0);
    gl!.bindVertexArray(null);

    // Le quad des billboards : aPos CENTRÉ (±0,5) pour tourner autour du centre
    // de la particule, aUV en [0,1]² — même origine bas-gauche que les mailles.
    bbVao = gl!.createVertexArray()!;
    gl!.bindVertexArray(bbVao);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(
      gl!.ARRAY_BUFFER,
      new Float32Array([-0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, -0.5, 0.5, 0, 1, 0.5, 0.5, 1, 1]),
      gl!.STATIC_DRAW,
    );
    gl!.enableVertexAttribArray(0);
    gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 16, 0);
    gl!.enableVertexAttribArray(1);
    gl!.vertexAttribPointer(1, 2, gl!.FLOAT, false, 16, 8);
    gl!.bindVertexArray(null);

    // LA CIBLE LINÉAIRE. Tout se dessine dedans, en lumière linéaire, et le report
    // en sRGB n'a lieu qu'une fois — la seule façon de reproduire un pipeline
    // Unity en Linear. Reste à choisir un format que CE contexte accepte VRAIMENT
    // en cible (l'extension se re-demande ici : elle appartient au contexte) :
    //
    //   `RGBA16F`         le meilleur, et pas seulement par défaut : seize bits
    //                     flottants évitent la quantification du linéaire, où huit
    //                     bits font bander les ombres. Demande une extension de
    //                     rendu flottant, présente sur tout WebGL2 de bureau.
    //   `SRGB8_ALPHA8`    l'équivalent exact du jeu (mélange en linéaire, encodage
    //                     à l'écriture) — accepté partout où on a mesuré, mais
    //                     l'essai reste : un statut se constate, il ne se déduit pas.
    //
    // Aucun des deux : on ne dessine RIEN. Un `RGBA8` linéaire tiendrait l'écran
    // mais mentirait sur les ombres, et un effet faux vaut moins que pas d'effet.
    const HDR =
      gl!.getExtension('EXT_color_buffer_half_float') ?? gl!.getExtension('EXT_color_buffer_float');
    FORMATS = [
      ...(HDR ? ([[gl!.RGBA16F, 'RGBA16F']] as [number, string][]) : []),
      [gl!.SRGB8_ALPHA8, 'SRGB8_ALPHA8'],
    ];
    fbo = null;
    fboTex = null;
    fboW = 0;
    fboH = 0;
    format = null;
    formatLabel = '';
    targetFailed = false;

    byName.clear();
    artTex = null;
    for (const [name, image] of decoded) byName.set(name, upload(image, texMeta[name]));
    if (artImage) artTex = upload(artImage, ART_META);

    live = true;
    return true;
  }

  function ensureTarget(w: number, h: number): boolean {
    // Sur un contexte perdu, tout statut est du bruit : on se tait — ce n'est pas
    // aux formats de porter le chapeau, et `webglcontextrestored` reconstruira.
    if (gl!.isContextLost()) return false;
    if (targetFailed) return false;
    if (fboW === w && fboH === h) return true;
    if (fboTex) gl!.deleteTexture(fboTex);
    if (fbo) gl!.deleteFramebuffer(fbo);
    fboW = w;
    fboH = h;

    // Le format n'est cherché qu'UNE fois par contexte : un redimensionnement ne
    // rejoue pas l'essai, un pilote ne change pas d'avis en cours de route.
    const tried: string[] = [];
    for (const [fmt, label] of format ? [[format, formatLabel] as [number, string]] : FORMATS) {
      fboTex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, fboTex);
      gl!.texStorage2D(gl!.TEXTURE_2D, 1, fmt, w, h);
      // `getError` dit POURQUOI (taille invalide, mémoire) là où le statut du
      // framebuffer ne dit que « incomplet » — la différence entre un rapport
      // actionnable et un code nu.
      const err = gl!.getError();
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, fboTex, 0);
      const st = gl!.checkFramebufferStatus(gl!.FRAMEBUFFER);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      if (st === gl!.FRAMEBUFFER_COMPLETE) {
        format = fmt;
        formatLabel = label;
        return true;
      }
      tried.push(`${label} → 0x${st.toString(16)}${err ? ` (glError 0x${err.toString(16)})` : ''}`);
      gl!.deleteTexture(fboTex);
      gl!.deleteFramebuffer(fbo);
      fboTex = null;
      fbo = null;
    }
    // Une perte survenue PENDANT l'essai rendrait n'importe quoi : même silence
    // qu'en tête, et pas de condamnation — le contexte suivant retentera.
    if (gl!.isContextLost()) {
      fboW = 0;
      fboH = 0;
      return false;
    }
    targetFailed = true;
    onError(`aucune cible linéaire acceptée en ${w}×${h} (${tried.join(', ')})`);
    return false;
  }

  // --- boucle -----------------------------------------------------------------------
  // `elapsed` survit aux pauses ET aux pertes de contexte : reprendre à zéro
  // ferait sauter l'effet, alors que celui du jeu est continu et sans état.
  let elapsed = 0;
  let last = 0;
  let paused = !autoplay;
  let ready = false;

  function draw(now: number) {
    if (disposed || !gl || !live || gl.isContextLost()) return;
    elapsed += last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    const t = elapsed;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (!ensureTarget(w * SUPERSAMPLE, h * SUPERSAMPLE)) return;

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fboW, fboH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);

    // 1. L'ART, opaque, à la place exacte du cadre.
    if (artTex) {
      gl.disable(gl.BLEND);
      gl.useProgram(quadProg);
      gl.bindVertexArray(quadVao);
      gl.uniform4f(Q.rect, ART_RECT[0], ART_RECT[1], ART_RECT[2], ART_RECT[3]);
      gl.uniform1i(Q.encode, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, artTex);
      gl.uniform1i(Q.tex, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // 2. LES CALQUES, dans l'additif du jeu — la contribution (`c × a` ou `c`
    //    selon `_SrcBlend`) est prémultipliée PAR LE SHADER, le blend n'est plus
    //    qu'une addition : l'ordre de tirage est indifférent pour la couleur, et
    //    c'est pourquoi le `sortingFudge` de 2 sur `out` ne change rien. L'alpha
    //    accumulé est l'OCCLUSION pour la composition du canvas — la lumière
    //    ajoutée, pas l'alpha des matériaux (cf. la fin de `FRAG`).
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(fxProg);
    gl.uniform1f(U.uTime, t);

    for (const p of prepared) {
      const { emitter: e, material: m } = p;
      gl.uniform1i(U.uSrcAlphaBlend, (m.floats._SrcBlend ?? 5) === 5 ? 1 : 0);
      const col = m.vectors._Color ?? [1, 1, 1, 1];
      gl.uniform4f(U.uColor, toLinear(col[0]), toLinear(col[1]), toLinear(col[2]), col[3]);
      gl.uniform1f(U.uMainContrast, m.floats._MainContrast ?? 1);
      gl.uniform1f(U.uMainStrength, m.floats._MainStrength ?? 1);
      gl.uniform1f(U.uNoiseStrength, m.floats._NoiseStrength ?? 0);
      gl.uniform1f(U.uAlphaStrength, m.floats._AlphaStrength ?? 1);

      // Les MOTS-CLÉS font foi, pas les flottants `_XXX_ON` : c'est eux qui
      // sélectionnent la variante compilée côté jeu. Le prefab porte les deux, et
      // ils concordent — mais si l'un devait mentir, ce serait le flottant.
      const kw = (k: string) => (m.keywords.includes(k) ? 1 : 0);
      gl.uniform1i(U.uMainContrastOn, kw('_MAIN_CONTRAST_ON'));
      gl.uniform1i(U.uMainClamp, kw('_MAIN_CLAMP'));
      gl.uniform1i(U.uMainAlphaChannel, kw('_MAIN_ALPHACHANNEL_ON'));
      gl.uniform1i(U.uNoiseOn, kw('_NOISE_UV_ON'));
      gl.uniform1i(U.uSecondOn, kw('_SECOND_TEX_ON'));
      gl.uniform1i(U.uSecondAdd, kw('_SECOND_TYPE_ADD'));
      gl.uniform1i(U.uThirdOn, kw('_THIRD_TEX_ON'));
      gl.uniform1i(U.uThirdAdd, kw('_THIRD_TYPE_ADD'));
      gl.uniform1i(U.uAlphaTexOn, kw('_ALPHA_TEX_ON'));

      SLOTS.forEach((slot, unit) => {
        const decl = m.textures[slot];
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, decl ? (byName.get(decl.tex) ?? null) : null);
        gl.uniform1i(U[UNIFORM_OF[slot]], unit);
        const sp = m.vectors[SPEED_PROP[slot]] ?? [0, 0, 0, 0];
        gl.uniform2f(U[SPEED_OF[slot]], sp[0], sp[1]);
      });

      // DEUX conversions possibles sur la route de la couleur de particule :
      // `m_ApplyActiveColorSpace` la linéarise à la CUISSON (émetteur par
      // émetteur, relevé dans la table), puis la chaîne UIParticle → Canvas
      // linéarise TOUTES les couleurs de sommet cuites — UGUI ne le fait pas en
      // Linear, le paquet s'en charge. Un émetteur qui porte le drapeau arrive
      // donc DEUX fois converti. Confronté à l'écran du jeu : le corps du liseré
      // de `_Demi` est rouge PROFOND (vert/rouge ≈ 0,1) — une conversion seule
      // plafonne ce rapport à 0,34 (le rose 0,618 → 0,34) et blanchit le ruban,
      // deux le mènent à 0,095, exactement la teinte du jeu. L'alpha, lui, n'est
      // jamais converti.
      const lin = e.applyActiveColorSpace ? (v: number) => toLinear(toLinear(v)) : toLinear;

      if (p.kind === 'mesh') {
        const age = frameAge(e, t);
        const start = evalMinMax(e.startColor, age);
        const over = e.colorOverLifetime ? evalMinMax(e.colorOverLifetime, age) : [1, 1, 1, 1];
        gl.bindVertexArray(p.vao);
        SLOTS.forEach((slot) => {
          const st = m.textures[slot]?.st ?? [1, 1, 0, 0];
          gl.uniform4f(U[ST_OF[slot]], st[0], st[1], st[2], st[3]);
        });
        gl.uniform4f(U.uM, p.xform[0], 0, 0, p.xform[1]);
        gl.uniform2f(U.uT, p.xform[2], p.xform[3]);
        gl.uniform4f(
          U.uParticle,
          lin(start[0] * over[0]),
          lin(start[1] * over[1]),
          lin(start[2] * over[2]),
          start[3] * over[3],
        );
        gl.drawElements(gl.TRIANGLES, p.count, gl.UNSIGNED_SHORT, 0);
      } else {
        // Un tirage par particule : la couleur vient des dégradés à SON âge (avec
        // SES tirages de naissance), la tuile de la feuille UV se compose avec le
        // ST du matériau — tous les échantillonneurs la partagent, comme au jeu
        // (`uvChannelMask = -1`).
        const parts = p.sim.at(t);
        if (!parts.length) continue;
        gl.bindVertexArray(bbVao);
        const [tilesX, tilesY] = p.sim.tiles;
        const kx = 2 / spanW;
        const ky = 2 / spanH;
        for (const bp of parts) {
          const start = evalMinMax(e.startColor, bp.age01, bp.lerpStart);
          const over = e.colorOverLifetime
            ? evalMinMax(e.colorOverLifetime, bp.age01, bp.lerpOver)
            : [1, 1, 1, 1];
          gl.uniform4f(
            U.uParticle,
            lin(start[0] * over[0]),
            lin(start[1] * over[1]),
            lin(start[2] * over[2]),
            start[3] * over[3],
          );
          const colTile = bp.frame % tilesX;
          const rowTile = Math.floor(bp.frame / tilesX);
          const tsx = 1 / tilesX;
          const tsy = 1 / tilesY;
          const tox = colTile / tilesX;
          const toy = 1 - (rowTile + 1) / tilesY;
          SLOTS.forEach((slot) => {
            const st = m.textures[slot]?.st ?? [1, 1, 0, 0];
            gl.uniform4f(
              U[ST_OF[slot]],
              st[0] * tsx,
              st[1] * tsy,
              st[0] * tox + st[2],
              st[1] * toy + st[3],
            );
          });
          const cos = Math.cos(bp.rot);
          const sin = Math.sin(bp.rot);
          gl.uniform4f(U.uM, kx * cos * bp.w, ky * sin * bp.w, -kx * sin * bp.h, ky * cos * bp.h);
          gl.uniform2f(
            U.uT,
            (2 * (p.ox + bp.x + bleed.x * frame.w)) / spanW - 1,
            1 - (2 * (p.oy - bp.y + bleed.y * frame.h)) / spanH,
          );
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      }
    }

    // 3. LE REPORT sur le canvas, avec le SEUL encodage sRGB de la chaîne.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(quadProg);
    gl.bindVertexArray(quadVao);
    gl.uniform4f(Q.rect, 2, 2, -1, -1);
    gl.uniform1i(Q.encode, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.uniform1i(Q.tex, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    if (!paused) raf = requestAnimationFrame(draw);
  }

  // La perte arrête la boucle SANS toucher à `paused` ni à `elapsed` : l'état
  // demandé par l'appelant et le temps écoulé survivent, la restauration les
  // retrouve tels quels.
  const onLost = () => {
    live = false;
    cancelAnimationFrame(raf);
  };
  const onRestored = () => {
    if (disposed) return;
    if (!buildGL()) return;
    cancelAnimationFrame(raf);
    last = 0;
    // Même en pause, une image : c'est la règle du kickoff, la restauration n'y
    // déroge pas (`draw` s'arrête seul quand `paused`).
    if (ready) raf = requestAnimationFrame(draw);
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  if (gl.isContextLost()) {
    // Canvas recyclé par l'éviction : `getContext` a rendu le MÊME contexte,
    // perdu. On le ressuscite via l'extension RETENUE (la demander maintenant
    // rendrait null — cf. l'en-tête) ; la construction viendra de
    // `webglcontextrestored`. Sans instance retenue (perte spontanée avant tout
    // montage), on s'en remet à la restauration du navigateur, que le même
    // écouteur attrape.
    try {
      LOSE_EXT.get(canvas)?.restoreContext();
    } catch {
      // Perte non restaurable (GPU mort) : le repli <img> de `Portrait` reste.
    }
  } else if (!buildGL()) {
    // Échec sur un contexte VIVANT : une vraie panne (transcription, pilote),
    // déjà rapportée par `link`. Rien ne se dessinera jamais ici.
    canvas.removeEventListener('webglcontextlost', onLost);
    canvas.removeEventListener('webglcontextrestored', onRestored);
    return NO_FX;
  }

  function load(src: string, onDone: (image: HTMLImageElement) => void) {
    return new Promise<void>((done) => {
      const image = new Image();
      // R2 sert les images sur un autre domaine que le site : sans CORS, le canvas
      // serait « teinté » et `texImage2D` refusé.
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (!disposed) onDone(image);
        done();
      };
      image.onerror = () => {
        onError(`image introuvable : ${src}`);
        done();
      };
      image.src = src;
    });
  }

  // Chaque image rejoint le cache CPU, et monte au GPU tout de suite si le
  // contexte est vivant — sinon `buildGL` la montera à la restauration.
  const loads = [
    ...[...needed].map((name) =>
      load(img.portraitFx(name), (image) => {
        decoded.set(name, image);
        if (live) byName.set(name, upload(image, texMeta[name]));
      }),
    ),
    load(art, (image) => {
      artImage = image;
      if (live) artTex = upload(image, ART_META);
    }),
  ];

  void Promise.all(loads).then(() => {
    if (disposed) return;
    ready = true;
    // Une image est tirée MÊME en pause : sinon un effet monté hors écran, ou
    // figé par `prefers-reduced-motion`, resterait un canvas vide.
    raf = requestAnimationFrame(draw);
  });

  return {
    setRunning(on: boolean) {
      if (paused === !on) return; // déjà dans l'état demandé
      paused = !on;
      cancelAnimationFrame(raf);
      // `last` remis à zéro : le temps ne s'écoule pas pendant la pause, sinon
      // reprendre ferait sauter l'effet de toute la durée passée hors écran.
      last = 0;
      if (on && ready && !disposed) raf = requestAnimationFrame(draw);
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      // `loseContext` LIBÈRE le GPU mais laisse le canvas ressuscitable : le
      // prochain montage récupérera ce même contexte et le restaurera — grâce à
      // l'écouteur permanent de `RESTORABLE` et à l'extension retenue dans
      // `LOSE_EXT`, qui restent tous deux en place.
      LOSE_EXT.get(canvas)?.loseContext();
    },
  };
}
