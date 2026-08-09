/**
 * CE QUE LE `ParticleSystem` DU JEU CALCULE — transcrit, et borné à ce qu'on a lu.
 *
 * `portrait-fx` porte la TABLE (ce que les prefabs déclarent), `portrait-fx-gl`
 * DESSINE ; ce module-ci est l'étage entre les deux : l'évaluation des courbes et
 * dégradés d'Unity, l'âge rebouclé des calques de cadre, le débord du canvas — et
 * la SIMULATION des émetteurs décoratifs — `atlas` et `star` venus avec
 * `_Dungeon`, `bubble` avec `_Seasonal`, tous du même moule (Box plat, frein,
 * bruit statique).
 *
 * CE QUE LA SIMULATION TRANSCRIT, relevé dans les prefabs :
 *
 *   - la ZONE DE NAISSANCE : un Box PLAT (`ShapeModule` type 15, échelle à Y nul),
 *     décalé sous la carte par `m_Position.z`, chez un nœud TOURNÉ de −90° sur X —
 *     si bien que le +Z d'émission pointe vers le HAUT de la carte. La rotation
 *     est appliquée en quaternion, pas supposée ;
 *   - le FREIN (`ClampVelocityModule`) : l'amorti (`dampen`) écrase le coup de
 *     fouet initial (1 à 10 u/s) contre un plafond tiré par particule (0,5 à 1)
 *     en un quart de seconde — la montée de croisière, c'est le PLAFOND. La
 *     traînée (`drag`), multipliée par la petite section des quads, ne fait
 *     qu'effleurer, et la gravité (0,03 en unités monde, divisées par l'échelle
 *     50 du nœud) est un murmure ;
 *   - la FEUILLE UV : `frameOverTime` est CONSTANT sur les deux émetteurs — pas
 *     une animation d'images, un CHOIX de tuile (le halo n° 5 en 4×4, le glint
 *     n° 12 en 8×8 de la même planche) ;
 *   - le SCINTILLEMENT : la courbe de taille de `star` (12 clés en dents de scie),
 *     évaluée en Hermite comme Unity le fait.
 *
 * TROIS APPROXIMATIONS ASSUMÉES, parce que le moteur du jeu ne les publie pas :
 *
 *   1. le BRUIT (`NoiseModule`) est un Perlin interne à Unity, irreproductible
 *      bit à bit. Mais le relevé dit un champ STATIQUE (`scrollSpeed = 0`) : une
 *      particule ne voit le bruit changer qu'en s'y DÉPLAÇANT. Rendu : une
 *      dérive de 0,05 u/s au plus, portée par deux sinus déphasés échantillonnés
 *      sur le CHEMIN parcouru — jamais sur l'horloge. Un sinus temporel ferait
 *      osciller les particules sur place (vécu : petits allers-retours que le
 *      jeu n'a pas) ;
 *   2. le frein suit la RECONSTRUCTION publique du moteur, qu'Unity ne documente
 *      pas : `dampen` s'applique là-bas par image de simulation (rendu ici en
 *      convergence exponentielle calée sur 60 pas/s), et `drag` décélère de
 *      `drag × π·(taille/2)² × vitesse²` — chaque facteur sous son drapeau
 *      (`multiplyDragByParticleSize/Velocity`, tous deux vrais sur `_Dungeon`),
 *      avec la taille de NAISSANCE du quad, Unity ne disant pas s'il prend
 *      celle du moment ;
 *   3. `size3D` tire X et Y sur le MÊME aléa (les plages de `star`, 0,3-0,4 et
 *      0,6-0,8, gardent alors leur rapport ×2 exact). Unity ne dit pas si les
 *      axes tirent ensemble ou séparément.
 *
 * `autoRandomSeed` est VRAI sur ces émetteurs : le jeu lui-même tire une graine
 * par session. Notre aléa par montage est donc conforme, pas un écart.
 */
import { PORTRAIT_FX, type FxEmitter, type Gradient, type MinMaxGradient } from './portrait-fx';

/** Une clé d'`AnimationCurve` Unity, telle que la table la porte. */
interface CurveKey {
  time: number;
  value: number;
  inSlope: number;
  outSlope: number;
}

/** Un `MinMaxCurve` brut : 0 constante, 1 courbe (×`scalar`), 3 deux constantes. */
interface MinMaxCurveRaw {
  minMaxState: number;
  scalar: number;
  minScalar: number;
  maxCurve: { m_Curve: CurveKey[] };
  minCurve: { m_Curve: CurveKey[] };
}

interface ShapeRaw {
  type: number;
  m_Position: { x: number; y: number; z: number };
  m_Scale: { x: number; y: number; z: number };
  randomDirectionAmount: number;
}

interface SheetRaw {
  mode: number;
  timeMode: number;
  tilesX: number;
  tilesY: number;
  cycles: number;
  frameOverTime: MinMaxCurveRaw;
  startFrame: MinMaxCurveRaw;
}

interface LimitVelocityRaw {
  magnitude: MinMaxCurveRaw;
  dampen: number;
  drag: MinMaxCurveRaw;
  separateAxis: boolean;
  multiplyDragByParticleSize: boolean;
  multiplyDragByParticleVelocity: boolean;
}

interface NoiseRaw {
  strength: MinMaxCurveRaw;
  frequency: number;
  positionAmount: MinMaxCurveRaw;
  separateAxes: boolean;
  remapEnabled: boolean;
  scrollSpeed: MinMaxCurveRaw;
}

interface SizeOverLifetimeRaw {
  curve: MinMaxCurveRaw;
  separateAxes: boolean;
}

// --- évaluation des courbes et dégradés d'Unity -----------------------------------

/**
 * La couleur d'un dégradé à l'âge `t` (0..1), en RGBA linéaire-par-morceaux.
 *
 * Les deux rampes s'interpolent SÉPARÉMENT, comme Unity le fait : les points de
 * contrôle des couleurs et ceux des alphas ne coïncident pas (`m_NumColorKeys`
 * et `m_NumAlphaKeys` diffèrent souvent). Hors bornes, la clé la plus proche.
 *
 * En mode FIXED (`mode = 1`), pas de fondu : chaque clé règne jusqu'à son temps
 * — la couleur est celle de la PREMIÈRE clé dont le temps couvre `t`, et la
 * dernière règne au-delà. C'est le mode du dégradé quatre-teintes du `star` de
 * `_2000086` : l'interpoler fabriquerait des mélanges que le jeu n'affiche pas.
 */
export function evalGradient(g: Gradient, t: number): [number, number, number, number] {
  const fixed = g.mode === 1;
  const pick = <K extends { t: number }>(keys: K[]): [K, K, number] => {
    if (keys.length === 1) return [keys[0], keys[0], 0];
    if (fixed) {
      const k = keys.find((key) => key.t >= t) ?? keys[keys.length - 1];
      return [k, k, 0];
    }
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1].t < t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const span = b.t - a.t;
    return [a, b, span > 0 ? Math.min(1, Math.max(0, (t - a.t) / span)) : 0];
  };
  const [c0, c1, cu] = pick(g.rgb);
  const [a0, a1, au] = pick(g.a);
  return [
    c0.c[0] + (c1.c[0] - c0.c[0]) * cu,
    c0.c[1] + (c1.c[1] - c0.c[1]) * cu,
    c0.c[2] + (c1.c[2] - c0.c[2]) * cu,
    a0.a + (a1.a - a0.a) * au,
  ];
}

/**
 * La couleur d'un `MinMaxGradient` à l'âge `t`.
 *
 * Les modes « deux » (2 et 3) tirent au sort À LA NAISSANCE de la particule, une
 * fois pour toutes : `lerp` est donc le tirage, pas une moyenne. Le mode 4
 * (couleur aléatoire) tire de même, mais c'est un POINT du dégradé qu'il tire :
 * `lerp` devient l'abscisse, et l'âge ne compte plus — chaque étincelle du
 * `star` de `_2000086` garde sa teinte (violet, turquoise, orange ou rose,
 * dégradé Fixed) toute sa vie.
 */
export function evalMinMax(
  m: MinMaxGradient,
  t: number,
  lerp = 0.5,
): [number, number, number, number] {
  switch (m.mode) {
    case 0:
      return (m.max ?? [1, 1, 1, 1]) as [number, number, number, number];
    case 2: {
      const a = (m.min ?? [1, 1, 1, 1]) as number[];
      const b = (m.max ?? [1, 1, 1, 1]) as number[];
      return [0, 1, 2, 3].map((i) => a[i] + (b[i] - a[i]) * lerp) as [
        number,
        number,
        number,
        number,
      ];
    }
    case 1:
      return m.maxGradient ? evalGradient(m.maxGradient, t) : [1, 1, 1, 1];
    case 4:
      return m.maxGradient ? evalGradient(m.maxGradient, lerp) : [1, 1, 1, 1];
    default: {
      const a = m.minGradient ? evalGradient(m.minGradient, t) : [1, 1, 1, 1];
      const b = m.maxGradient ? evalGradient(m.maxGradient, t) : [1, 1, 1, 1];
      return [0, 1, 2, 3].map((i) => a[i] + (b[i] - a[i]) * lerp) as [
        number,
        number,
        number,
        number,
      ];
    }
  }
}

/**
 * Une `AnimationCurve` à l'instant `t` — l'Hermite cubique d'Unity, pentes
 * comprises. Une pente infinie (le « constant » de l'éditeur) fige le segment
 * sur la clé de gauche, comme là-bas.
 */
export function evalCurve(keys: CurveKey[], t: number): number {
  if (!keys.length) return 1;
  if (t <= keys[0].time) return keys[0].value;
  const last = keys[keys.length - 1];
  if (t >= last.time) return last.value;
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].time <= t) i++;
  const k0 = keys[i];
  const k1 = keys[i + 1];
  if (!Number.isFinite(k0.outSlope) || !Number.isFinite(k1.inSlope)) return k0.value;
  const h = k1.time - k0.time;
  const s = (t - k0.time) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * k0.value +
    (s3 - 2 * s2 + s) * h * k0.outSlope +
    (-2 * s3 + 3 * s2) * k1.value +
    (s3 - s2) * h * k1.inSlope
  );
}

/** Un `MinMaxCurve` à l'âge `t`, `lerp` étant le tirage de naissance. */
function evalMinMaxCurve(c: MinMaxCurveRaw, t: number, lerp: number): number {
  switch (c.minMaxState) {
    case 0:
      return c.scalar;
    case 3:
      return c.minScalar + (c.scalar - c.minScalar) * lerp;
    case 1:
      return evalCurve(c.maxCurve.m_Curve, t) * c.scalar;
    default: {
      const a = evalCurve(c.minCurve.m_Curve, t);
      const b = evalCurve(c.maxCurve.m_Curve, t);
      return (a + (b - a) * lerp) * c.scalar;
    }
  }
}

/** Le trio plat de la table (`valeur`, `…Min`, `…Mode`) tiré avec l'aléa `u`. */
function mmScalar(value: number, min: number, mode: number, u: number): number {
  return mode === 3 ? min + (value - min) * u : value;
}

/**
 * L'âge normalisé d'une particule de calque de cadre, à l'instant `time`.
 *
 * `ringBufferMode = 2` fait reboucler la vie dans `ringBufferLoopRange` au lieu
 * de tuer la particule : l'âge est donc un modulo, pas une rampe qui s'arrête.
 * Un émetteur SANS ring buffer garde la rampe bornée à 1 — la particule meurt,
 * et c'est à l'appelant de cesser de la dessiner.
 */
export function frameAge(e: FxEmitter, time: number): number {
  const life = e.startLifetime / (e.simulationSpeed || 1);
  if (life <= 0) return 0;
  const u = time / life;
  if (e.ringBufferMode !== 2) return Math.min(1, u);
  const [lo, hi] = e.ringBufferLoopRange;
  if (u <= lo) return u;
  const span = hi - lo;
  return span > 0 ? lo + ((u - lo) % span) : lo;
}

// --- quaternions ------------------------------------------------------------------

type Vec3 = [number, number, number];
type Quat = [number, number, number, number];

/** `q · v · q⁻¹` — la rotation d'Unity, appliquée telle quelle. */
function rotate(q: Quat, v: Vec3): Vec3 {
  const [qx, qy, qz, qw] = q;
  const [vx, vy, vz] = v;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return [
    vx + qw * tx + (qy * tz - qz * ty),
    vy + qw * ty + (qz * tx - qx * tz),
    vz + qw * tz + (qx * ty - qy * tx),
  ];
}

function rotateInv(q: Quat, v: Vec3): Vec3 {
  return rotate([-q[0], -q[1], -q[2], q[3]], v);
}

// --- la simulation des émetteurs billboard ----------------------------------------

/**
 * Ce qu'un émetteur billboard demanderait qu'on n'a PAS transcrit — ou null s'il
 * est simulable. Même politique que `unsupportedKeywords` : refuser plutôt que
 * rendre de travers, et DIRE quoi.
 */
export function unsupportedBillboard(e: FxEmitter): string | null {
  const missing: string[] = [];
  const shape = e.shape as ShapeRaw | undefined;
  if (!shape) missing.push('émission sans ShapeModule');
  else if (shape.type !== 15 && shape.type !== 5)
    missing.push(`forme ${shape.type} (seul le Box est transcrit)`);
  else if (shape.randomDirectionAmount) missing.push('randomDirectionAmount');
  if (e.emission.bursts.length) missing.push('rafales (bursts)');
  if (e.rotationOverLifetime) missing.push('rotationOverLifetime');
  if (e.velocityOverLifetime) missing.push('velocityOverLifetime');
  const sheet = e.textureSheet as SheetRaw | undefined;
  if (sheet && (sheet.mode !== 0 || sheet.timeMode !== 0))
    missing.push(`feuille UV mode ${sheet.mode}/${sheet.timeMode}`);
  const lim = e.limitVelocity as LimitVelocityRaw | undefined;
  if (lim?.separateAxis) missing.push('limite de vitesse par axe');
  const noise = e.noise as NoiseRaw | undefined;
  if (noise && (noise.separateAxes || noise.remapEnabled)) missing.push('bruit par axe ou remappé');
  const size = e.sizeOverLifetime as SizeOverLifetimeRaw | undefined;
  if (size?.separateAxes) missing.push('taille sur la vie par axe');
  return missing.length ? missing.join(', ') : null;
}

/**
 * Un CALQUE-QUAD : un émetteur billboard qui n'est PAS une pluie de particules
 * mais un calque de cadre de plus — une rafale unique d'UNE particule immobile
 * dont la vie reboucle (`ringBufferMode = 2`), le patron exact d'`inner`/`out`,
 * dessiné en quad plein plutôt qu'en maille. Le `web` de `_2000086` est le
 * premier du genre : un voile de 33 × (6,72 ; 11,50) ≈ 222 × 380 unités qui
 * couvre la carte entière.
 *
 * Les critères collent au patron, pas à l'à-peu-près : le moindre écart
 * (vitesse, rotation initiale, forme d'émission, seconde rafale) renvoie
 * l'émetteur vers la simulation, qui refuse LOUD ce qu'elle ne transcrit pas.
 */
export function isQuadLayer(e: FxEmitter): boolean {
  const bursts = e.emission.bursts as { count: number }[];
  return (
    e.renderMode === 0 &&
    !e.shape &&
    e.emission.rateOverTime === 0 &&
    bursts.length === 1 &&
    bursts[0].count === 1 &&
    e.ringBufferMode === 2 &&
    e.startSpeed === 0 &&
    e.startSpeedMode === 0 &&
    e.startRotation === 0 &&
    e.startRotationMode === 0 &&
    e.startSizeMode === 0
  );
}

/** Une particule prête à dessiner — unités du CADRE, relatives à l'émetteur, Y vers le HAUT. */
export interface BillboardParticle {
  x: number;
  y: number;
  /** Tailles PLEINES du quad, en unités du cadre. */
  w: number;
  h: number;
  /** Rotation écran, radians. */
  rot: number;
  /** Âge normalisé 0..1 — l'abscisse de tous les modules « over lifetime ». */
  age01: number;
  /** Tirages de naissance des deux dégradés (start, over) — cf. `evalMinMax`. */
  lerpStart: number;
  lerpOver: number;
  /** Tuile de la feuille UV. */
  frame: number;
}

interface Particle {
  born: number;
  life: number;
  p: Vec3;
  v: Vec3;
  size: number;
  sizeY: number;
  rot: number;
  limit: number;
  lerpStart: number;
  lerpOver: number;
  lerpSheet: number;
  phase: number;
}

/** Le générateur déterministe usuel — une graine par montage, comme `autoRandomSeed`. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deux sinus déphasés en guise de Perlin — cf. l'approximation n° 1 de l'en-tête. */
function wob(t: number, phase: number): number {
  return Math.sin(t * 6.2832 + phase) * 0.62 + Math.sin(t * 13.71 + phase * 1.7 + 1.3) * 0.38;
}

/** Le pas interne maximal : l'intégration reste stable même si un onglet revient de loin. */
const MAX_STEP = 1 / 30;

/**
 * Le facteur de freinage d'un pas `dt` — `ClampVelocityModule` reconstruit
 * (cf. l'approximation n° 2 de l'en-tête) : la traînée décélère de
 * `drag × π·(taille/2)² × vitesse²`, chaque facteur sous son drapeau, puis
 * l'amorti fait converger vers le plafond ce qui le dépasse encore.
 */
function makeBrake(
  lim: LimitVelocityRaw | undefined,
): (sp: number, size: number, limit: number, dt: number) => number {
  if (!lim) return () => 1;
  const { dampen } = lim;
  const dragK = lim.drag.scalar;
  const bySize = lim.multiplyDragByParticleSize;
  const byVel = lim.multiplyDragByParticleVelocity;
  return (sp, size, limit, dt) => {
    if (sp <= 0) return 1;
    const decel = dragK * (bySize ? Math.PI * 0.25 * size * size : 1) * (byVel ? sp * sp : 1);
    let braked = Math.max(0, sp - decel * dt);
    if (braked > limit) braked += (limit - braked) * (1 - Math.pow(1 - dampen, dt * 60));
    return braked / sp;
  };
}

export interface BillboardSim {
  /** Avance la simulation jusqu'à `t` (secondes depuis le montage) et rend les vivantes. */
  at(t: number): BillboardParticle[];
  /** tilesX × tilesY de la feuille UV — 1×1 sans module. */
  tiles: [number, number];
}

/**
 * La simulation d'UN émetteur billboard. Tout l'état vit côté CPU : une perte de
 * contexte WebGL n'y touche pas, et une pause (`elapsed` figé) la fige avec le
 * reste.
 */
export function createBillboardSim(e: FxEmitter, seed: number): BillboardSim {
  const rnd = mulberry32(seed);
  const shape = e.shape as ShapeRaw;
  const sheet = e.textureSheet as SheetRaw | undefined;
  const lim = e.limitVelocity as LimitVelocityRaw | undefined;
  const noise = e.noise as NoiseRaw | undefined;
  const sizeOver = e.sizeOverLifetime as SizeOverLifetimeRaw | undefined;

  // `scalingMode = Hierarchy` : la même échelle porte positions, tailles et
  // vitesses — on simule en unités LOCALES et on ne multiplie qu'à la sortie.
  const s = e.scale[0];
  const q = e.rotation;
  // La gravité est en unités MONDE ; un système simulé en local sous une échelle
  // `s` la reçoit divisée d'autant, et tournée dans son repère.
  const gLocal = rotateInv(q, [0, (-9.81 * e.gravityModifier) / s, 0]);
  const brake = makeBrake(lim);
  const noiseAmp = noise ? noise.strength.scalar * noise.positionAmount.scalar : 0;
  const noiseFreq = noise?.frequency ?? 1;
  const tiles: [number, number] = sheet ? [sheet.tilesX, sheet.tilesY] : [1, 1];
  const tileCount = tiles[0] * tiles[1];
  const maxLife = Math.max(e.startLifetime, e.startLifetimeMin) / (e.simulationSpeed || 1);

  const parts: Particle[] = [];
  let time = 0;
  let acc = 0;

  function spawn(born: number): void {
    const su = rnd();
    // Un Box plat : uniforme sur chaque axe de l'étendue (`m_Scale` est la taille
    // PLEINE de la boîte), décalé par `m_Position` — le shell d'une boîte sans
    // épaisseur est la boîte elle-même.
    const p: Vec3 = [
      shape.m_Position.x + (rnd() * 2 - 1) * shape.m_Scale.x * 0.5,
      shape.m_Position.y + (rnd() * 2 - 1) * shape.m_Scale.y * 0.5,
      shape.m_Position.z + (rnd() * 2 - 1) * shape.m_Scale.z * 0.5,
    ];
    const size = mmScalar(e.startSize, e.startSizeMin, e.startSizeMode, su);
    parts.push({
      born,
      life: mmScalar(e.startLifetime, e.startLifetimeMin, e.startLifetimeMode, rnd()),
      p,
      // Le Box émet le long de son +Z local — que la rotation du nœud pointe
      // vers le haut de la carte (cf. l'en-tête).
      v: [0, 0, mmScalar(e.startSpeed, e.startSpeedMin, e.startSpeedMode, rnd())],
      size,
      // Même aléa que X — approximation n° 3 de l'en-tête.
      sizeY: e.size3D ? mmScalar(e.startSizeY, e.startSizeYMin, e.startSizeYMode, su) : size,
      rot: mmScalar(e.startRotation, e.startRotationMin, e.startRotationMode, rnd()),
      limit: lim ? evalMinMaxCurve(lim.magnitude, 0, rnd()) : Infinity,
      lerpStart: rnd(),
      lerpOver: rnd(),
      lerpSheet: rnd(),
      phase: rnd() * 6.2832,
    });
  }

  function step(dt: number): void {
    for (const p of parts) {
      p.v[0] += gLocal[0] * dt;
      p.v[1] += gLocal[1] * dt;
      p.v[2] += gLocal[2] * dt;
      const k = brake(Math.hypot(p.v[0], p.v[1], p.v[2]), p.size, p.limit, dt);
      p.v[0] *= k;
      p.v[1] *= k;
      p.v[2] *= k;
      p.p[0] += p.v[0] * dt;
      p.p[1] += p.v[1] * dt;
      p.p[2] += p.v[2] * dt;
      if (noiseAmp) {
        // Le champ de bruit est STATIQUE (`scrollSpeed = 0`) : on l'échantillonne
        // sur le chemin parcouru (le z de la particule), jamais sur l'horloge —
        // cf. l'approximation n° 1 de l'en-tête.
        p.p[0] += noiseAmp * wob(p.p[2] * noiseFreq, p.phase) * dt;
        p.p[2] += noiseAmp * wob(p.p[2] * noiseFreq, p.phase + 2.4) * dt;
      }
    }
    time += dt;
    for (let i = parts.length - 1; i >= 0; i--)
      if (time - parts[i].born >= parts[i].life) parts.splice(i, 1);
    acc += e.emission.rateOverTime * dt;
    while (acc >= 1) {
      acc -= 1;
      if (parts.length < e.maxParticles) spawn(time);
    }
  }

  // `prewarm` : le jeu démarre le système comme s'il tournait déjà — on déroule
  // une vie entière avant la première image.
  if (e.prewarm) {
    const warm = Math.ceil(maxLife / MAX_STEP);
    time = -maxLife;
    for (let i = 0; i < warm; i++) step(MAX_STEP);
    time = 0;
  }

  return {
    tiles,
    at(t: number): BillboardParticle[] {
      while (time < t) step(Math.min(MAX_STEP, t - time));
      return parts.map((p) => {
        const age = time - p.born;
        const u = Math.min(age / p.life, 1);
        const mul = sizeOver ? evalMinMaxCurve(sizeOver.curve, u, p.lerpStart) : 1;
        const world = rotate(q, p.p);
        const fRaw = sheet
          ? evalMinMaxCurve(sheet.frameOverTime, u, p.lerpSheet) * (sheet.cycles || 1)
          : 0;
        const frame = sheet
          ? Math.floor(Math.min(Math.max(fRaw, 0), 0.99999) * tileCount) % tileCount
          : 0;
        return {
          x: world[0] * s,
          y: world[1] * s,
          w: p.size * mul * s,
          h: p.sizeY * mul * s,
          rot: p.rot,
          age01: u,
          lerpStart: p.lerpStart,
          lerpOver: p.lerpOver,
          frame,
        };
      });
    },
  };
}

// --- le débord du canvas ----------------------------------------------------------

/** L'excursion extrême le long de l'axe d'émission, par intégration du même modèle. */
function travelExtremes(e: FxEmitter): [number, number] {
  const lim = e.limitVelocity as LimitVelocityRaw | undefined;
  const brake = makeBrake(lim);
  const lifeMax = Math.max(e.startLifetime, e.startLifetimeMin);
  const gz = rotateInv(e.rotation, [0, (-9.81 * e.gravityModifier) / e.scale[0], 0])[2];
  let lo = 0;
  let hi = 0;
  // La traînée dépend de la TAILLE tirée : les deux bornes du tirage encadrent
  // l'excursion, avec celles de la vitesse initiale et du plafond.
  for (const size of [
    Math.min(e.startSize, e.startSizeMin),
    Math.max(e.startSize, e.startSizeMin),
  ]) {
    for (const v0 of [
      Math.min(e.startSpeed, e.startSpeedMin),
      Math.max(e.startSpeed, e.startSpeedMin),
    ]) {
      for (const limit of lim ? [lim.magnitude.minScalar, lim.magnitude.scalar] : [Infinity]) {
        let z = 0;
        let v = v0;
        for (let t = 0; t < lifeMax; t += MAX_STEP) {
          v += gz * MAX_STEP;
          v *= brake(Math.abs(v), size, limit, MAX_STEP);
          z += v * MAX_STEP;
          lo = Math.min(lo, z);
          hi = Math.max(hi, z);
        }
      }
    }
  }
  return [lo, hi];
}

/**
 * DE COMBIEN L'EFFET DÉBORDE DU CADRE, en fraction de sa largeur et de sa hauteur.
 *
 * Le liseré `out` n'est pas posé DANS la carte : ses sommets partent à 95,3 unités
 * du centre de l'émetteur pour un cadre large de 180 — 5,5 hors cadre à gauche,
 * 3,5 à droite — et son épaisseur ne fait que 13. Un canvas à la taille exacte du
 * cadre en coupe donc plus du tiers. Le jeu, lui, ne masque rien à cet endroit :
 * `FX_Holder` est FRÈRE du `Mask`, pas son enfant, et la lueur bave entre les
 * cartes de la grille.
 *
 * Les émetteurs billboard comptent aussi : leur zone de naissance part SOUS le
 * bas de la carte (`_Dungeon`), et leur montée est bornée par le même modèle de
 * vitesse que la simulation — le débord est l'ENVELOPPE de tout ça, jamais un
 * réglage à l'œil.
 */
export function fxBleed(effectName: string): { x: number; y: number } {
  const eff = PORTRAIT_FX.effects[effectName];
  const { frame, holder } = PORTRAIT_FX;
  let x = 0;
  let y = 0;
  const feed = (px: number, py: number) => {
    x = Math.max(x, -px, px - frame.w);
    y = Math.max(y, -py, py - frame.h);
  };
  for (const e of eff?.emitters ?? []) {
    if (!e.active) continue;
    const ox = holder.x + eff.origin[0] + e.pos[0];
    const oy = holder.y + eff.origin[1] + e.pos[1];
    const mesh = e.mesh ? PORTRAIT_FX.meshes[e.mesh] : undefined;
    if (e.renderMode === 4 && mesh) {
      for (const [vx, vy] of mesh.v)
        feed(ox + vx * e.startSize * e.scale[0], oy - vy * e.startSize * e.scale[1]);
    } else if (isQuadLayer(e) && e.material) {
      // Le quad plein d'un calque-quad, étiré par axe comme sa maille l'aurait
      // été — sa rotation initiale est nulle (critère d'`isQuadLayer`), les
      // extents sont donc alignés aux axes, sans marge de rotation à prendre.
      const hw = 0.5 * e.startSize * e.scale[0];
      const hh = 0.5 * (e.size3D ? e.startSizeY : e.startSize) * e.scale[1];
      feed(ox - hw, oy - hh);
      feed(ox + hw, oy + hh);
    } else if (e.renderMode === 0 && e.material && e.shape && !unsupportedBillboard(e)) {
      const shape = e.shape as ShapeRaw;
      const s = e.scale[0];
      const [dLo, dHi] = travelExtremes(e);
      // La demi-diagonale du plus grand quad possible, rotation comprise, plus
      // la dérive de bruit — une VITESSE (champ statique traversé), donc son
      // excursion extrême est ce débit tenu toute une vie.
      const noise = e.noise as NoiseRaw | undefined;
      const sizeMax = Math.max(e.startSize, e.startSizeMin);
      const sizeYMax = e.size3D ? Math.max(e.startSizeY, e.startSizeYMin) : sizeMax;
      const drift = noise
        ? noise.strength.scalar *
          noise.positionAmount.scalar *
          Math.max(e.startLifetime, e.startLifetimeMin)
        : 0;
      const margin = (0.5 * Math.hypot(sizeMax, sizeYMax) + drift) * s;
      for (const cx of [-0.5, 0.5])
        for (const cy of [-0.5, 0.5])
          for (const cz of [-0.5, 0.5])
            for (const d of [dLo, dHi]) {
              const w = rotate(e.rotation, [
                shape.m_Position.x + cx * shape.m_Scale.x,
                shape.m_Position.y + cy * shape.m_Scale.y,
                shape.m_Position.z + cz * shape.m_Scale.z + d,
              ]);
              const px = ox + w[0] * s;
              const py = oy - w[1] * s;
              feed(px - margin, py - margin);
              feed(px + margin, py + margin);
            }
    }
  }
  return { x: x / frame.w, y: y / frame.h };
}
