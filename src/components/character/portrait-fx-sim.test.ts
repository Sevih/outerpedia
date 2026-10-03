import { describe, expect, it } from 'vitest';
import { PORTRAIT_FX, type FxEmitter, type FxMaterial, type Gradient } from './portrait-fx';
import {
  createBillboardSim,
  evalCurve,
  evalGradient,
  evalMinMax,
  frameAge,
  fxBleed,
  isQuadLayer,
  layerVerdict,
  unsupportedBillboard,
} from './portrait-fx-sim';

/**
 * LE SIMULATEUR DES PORTRAITS ANIMÉS, TENU SANS NAVIGATEUR.
 *
 * `portrait-fx-sim` est pur : tout ce qu'il calcule se rejoue sous Node. Un test
 * ne dira jamais si la transcription est FIDÈLE au jeu — seule une capture le
 * dit. Ce qu'il tient, ce sont les propriétés dont le rendu dépend et que l'œil
 * ne voit pas casser : une simulation rejouable à graine donnée, des particules
 * qui ne dépassent ni leur plafond ni leur vie, un débord de canvas qui enveloppe
 * vraiment ce qui s'y dessine, et des refus qui disent quoi.
 *
 * Les émetteurs viennent de la TABLE COMMITTÉE (`portrait-fx.json`), parcourue
 * par famille plutôt que par nom : un prefab renommé par un patch ne casse rien
 * ici. Les cas limites partent d'un émetteur de la table, modifié d'UN champ.
 */

const EFFECTS = Object.entries(PORTRAIT_FX.effects);
const EMITTERS = EFFECTS.flatMap(([effect, { emitters }]) =>
  emitters.map((e) => ({ effect, e, id: `${effect}/${e.name}` })),
);
/** Les émetteurs que le montage SIMULE — ni calques de maille, ni calques-quads. */
const BILLBOARDS = EMITTERS.filter(({ e }) => layerVerdict(e).kind === 'billboard');
/** Un émetteur quelconque, et un billboard quelconque : la base des cas limites. */
const ANY = EMITTERS[0].e;
const BILLBOARD = BILLBOARDS[0].e;

/** Le pas interne maximal de la simulation (`MAX_STEP`), et une image à 60 Hz. */
const MAX_STEP = 1 / 30;
const FRAME = 1 / 60;

const lifeMin = (e: FxEmitter) => Math.min(e.startLifetime, e.startLifetimeMin);
const lifeMax = (e: FxEmitter) => Math.max(e.startLifetime, e.startLifetimeMin);

describe('evalGradient', () => {
  const blend: Gradient = {
    rgb: [
      { t: 0, c: [0, 0, 0] },
      { t: 1, c: [1, 0.5, 0] },
    ],
    a: [
      { t: 0, a: 0 },
      { t: 0.5, a: 1 },
      { t: 1, a: 0 },
    ],
  };

  it('interpole couleurs et alphas SÉPARÉMENT (les deux rampes ont leurs propres clés)', () => {
    expect(evalGradient(blend, 0.25)).toEqual([0.25, 0.125, 0, 0.5]);
    expect(evalGradient(blend, 0.5)).toEqual([0.5, 0.25, 0, 1]);
    expect(evalGradient(blend, 0.75)).toEqual([0.75, 0.375, 0, 0.5]);
  });

  it('hors bornes, rend la clé la plus proche', () => {
    expect(evalGradient(blend, -1)).toEqual([0, 0, 0, 0]);
    expect(evalGradient(blend, 2)).toEqual([1, 0.5, 0, 0]);
  });

  it('une rampe à UNE clé est une constante', () => {
    const flat: Gradient = { rgb: [{ t: 0.3, c: [1, 1, 0] }], a: [{ t: 0.9, a: 0.4 }] };
    expect(evalGradient(flat, 0)).toEqual([1, 1, 0, 0.4]);
    expect(evalGradient(flat, 1)).toEqual([1, 1, 0, 0.4]);
  });

  it('en mode Fixed, chaque clé règne jusqu’à son temps, sans fondu', () => {
    const fixed: Gradient = {
      mode: 1,
      rgb: [
        { t: 0.25, c: [1, 0, 0] },
        { t: 0.5, c: [0, 1, 0] },
        { t: 1, c: [0, 0, 1] },
      ],
      a: [{ t: 0, a: 1 }],
    };
    expect(evalGradient(fixed, 0.1)).toEqual([1, 0, 0, 1]);
    expect(evalGradient(fixed, 0.25)).toEqual([1, 0, 0, 1]);
    expect(evalGradient(fixed, 0.3)).toEqual([0, 1, 0, 1]);
    expect(evalGradient(fixed, 0.99)).toEqual([0, 0, 1, 1]);
    // Au-delà de la dernière clé, c'est elle qui règne.
    expect(evalGradient({ ...fixed, rgb: fixed.rgb.slice(0, 2) }, 0.9)).toEqual([0, 1, 0, 1]);
  });
});

describe('evalMinMax', () => {
  const ramp: Gradient = {
    rgb: [
      { t: 0, c: [0, 0, 0] },
      { t: 1, c: [1, 1, 1] },
    ],
    a: [{ t: 0, a: 1 }],
  };

  it('mode 0 : la couleur, quel que soit l’âge', () => {
    expect(evalMinMax({ mode: 0, max: [0.2, 0.4, 0.6, 0.8] }, 0.7)).toEqual([0.2, 0.4, 0.6, 0.8]);
  });

  it('mode 2 : le tirage de naissance choisit entre les deux couleurs', () => {
    const two = { mode: 2, min: [0, 0, 0, 0], max: [1, 1, 1, 1] };
    expect(evalMinMax(two, 0.9, 0)).toEqual([0, 0, 0, 0]);
    expect(evalMinMax(two, 0.9, 0.25)).toEqual([0.25, 0.25, 0.25, 0.25]);
  });

  it('mode 1 suit l’âge, mode 4 suit le TIRAGE — la teinte ne bouge plus de la vie', () => {
    expect(evalMinMax({ mode: 1, maxGradient: ramp }, 0.25, 0.9)).toEqual([0.25, 0.25, 0.25, 1]);
    expect(evalMinMax({ mode: 4, maxGradient: ramp }, 0.25, 0.9)).toEqual([0.9, 0.9, 0.9, 1]);
  });
});

describe('evalCurve', () => {
  const key = (time: number, value: number, inSlope = 0, outSlope = 0) => ({
    time,
    value,
    inSlope,
    outSlope,
  });

  it('sans clé vaut 1 (un multiplicateur neutre)', () => {
    expect(evalCurve([], 0.5)).toBe(1);
  });

  it('hors bornes, tient la première et la dernière clé', () => {
    const keys = [key(0.2, 3), key(0.8, 5)];
    expect(evalCurve(keys, 0)).toBe(3);
    expect(evalCurve(keys, 0.2)).toBe(3);
    expect(evalCurve(keys, 0.8)).toBe(5);
    expect(evalCurve(keys, 1)).toBe(5);
  });

  it('est l’Hermite d’Unity : les pentes comptent', () => {
    // Pentes égales à la corde : une droite.
    const line = [key(0, 0, 1, 1), key(1, 1, 1, 1)];
    expect(evalCurve(line, 0.3)).toBeCloseTo(0.3, 12);
    // Pentes nulles : le smoothstep 3s² − 2s³.
    const ease = [key(0, 0), key(1, 1)];
    expect(evalCurve(ease, 0.25)).toBeCloseTo(0.15625, 12);
    expect(evalCurve(ease, 0.5)).toBeCloseTo(0.5, 12);
    // La pente est en valeur par unité de TEMPS : un segment deux fois plus long
    // garde la même droite.
    const wide = [key(0, 0, 1, 1), key(2, 2, 1, 1)];
    expect(evalCurve(wide, 0.5)).toBeCloseTo(0.5, 12);
  });

  it('choisit le bon segment d’une courbe à plusieurs clés', () => {
    const saw = [key(0, 0), key(1, 10), key(2, 0)];
    expect(evalCurve(saw, 1)).toBeCloseTo(10, 12);
    expect(evalCurve(saw, 0.5)).toBeCloseTo(5, 12);
    expect(evalCurve(saw, 1.5)).toBeCloseTo(5, 12);
  });

  it('une pente infinie fige le segment sur la clé de gauche', () => {
    const out = [key(0, 2, 0, Infinity), key(1, 7)];
    expect(evalCurve(out, 0.01)).toBe(2);
    expect(evalCurve(out, 0.99)).toBe(2);
    expect(evalCurve(out, 1)).toBe(7);
    const into = [key(0, 2), key(1, 7, -Infinity, 0)];
    expect(evalCurve(into, 0.5)).toBe(2);
  });
});

describe('frameAge', () => {
  const layer = (over: Partial<FxEmitter>): FxEmitter => ({
    ...ANY,
    startLifetime: 2,
    simulationSpeed: 1,
    ringBufferMode: 2,
    ringBufferLoopRange: [0, 1],
    ...over,
  });

  it('sans ring buffer, la rampe s’arrête à 1 : la particule meurt', () => {
    const e = layer({ ringBufferMode: 0 });
    expect(frameAge(e, 1)).toBe(0.5);
    expect(frameAge(e, 2)).toBe(1);
    expect(frameAge(e, 50)).toBe(1);
  });

  it('avec `ringBufferMode = 2`, l’âge REBOUCLE au lieu de s’arrêter', () => {
    const e = layer({});
    expect(frameAge(e, 1)).toBe(0.5);
    expect(frameAge(e, 5)).toBe(0.5);
    for (let t = 0; t < 60; t += 0.37) {
      const age = frameAge(e, t);
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1);
    }
  });

  it('ne reboucle que dans `ringBufferLoopRange`, après une montée normale', () => {
    const e = layer({ ringBufferLoopRange: [0.25, 0.75] });
    // Avant la borne basse : la rampe, intacte.
    expect(frameAge(e, 0.4)).toBeCloseTo(0.2, 12);
    // u = 1 → 0,25 + ((1 − 0,25) mod 0,5) = 0,5.
    expect(frameAge(e, 2)).toBeCloseTo(0.5, 12);
    for (let t = 0.5; t < 60; t += 0.37) {
      const age = frameAge(e, t);
      expect(age).toBeGreaterThanOrEqual(0.25);
      expect(age).toBeLessThan(0.75);
    }
  });

  it('une plage de rebouclage vide fige l’âge sur sa borne', () => {
    expect(frameAge(layer({ ringBufferLoopRange: [0.5, 0.5] }), 7)).toBe(0.5);
  });

  it('`simulationSpeed` raccourcit la vie, et 0 se lit comme 1', () => {
    expect(frameAge(layer({ simulationSpeed: 2 }), 0.5)).toBe(0.5);
    expect(frameAge(layer({ simulationSpeed: 0 }), 1)).toBe(0.5);
  });

  it('une vie nulle ne divise pas par zéro', () => {
    expect(frameAge(layer({ startLifetime: 0 }), 3)).toBe(0);
  });
});

describe('isQuadLayer', () => {
  /** Le patron exact : UNE particule immobile, en rafale unique, dont la vie reboucle. */
  const quad: FxEmitter = {
    ...ANY,
    renderMode: 0,
    shape: undefined,
    emission: { rateOverTime: 0, bursts: [{ count: 1 }] },
    ringBufferMode: 2,
    startSpeed: 0,
    startSpeedMode: 0,
    startRotation: 0,
    startRotationMode: 0,
    startSizeMode: 0,
  };

  it('reconnaît le patron', () => {
    expect(isQuadLayer(quad)).toBe(true);
  });

  it.each<[string, Partial<FxEmitter>]>([
    ['un rendu en maille', { renderMode: 4 }],
    ['une forme d’émission', { shape: { type: 15 } }],
    ['un débit', { emission: { rateOverTime: 2, bursts: [{ count: 1 }] } }],
    ['aucune rafale', { emission: { rateOverTime: 0, bursts: [] } }],
    ['une seconde rafale', { emission: { rateOverTime: 0, bursts: [{ count: 1 }, { count: 1 }] } }],
    ['une rafale de deux', { emission: { rateOverTime: 0, bursts: [{ count: 2 }] } }],
    ['une vie qui ne reboucle pas', { ringBufferMode: 0 }],
    ['une vitesse', { startSpeed: 1 }],
    ['une vitesse tirée', { startSpeedMode: 3 }],
    ['une rotation initiale', { startRotation: 0.5 }],
    ['une rotation tirée', { startRotationMode: 3 }],
    ['une taille tirée', { startSizeMode: 3 }],
  ])('le moindre écart renvoie vers la simulation — %s', (_label, over) => {
    expect(isQuadLayer({ ...quad, ...over })).toBe(false);
  });

  it('ne prend aucun émetteur simulé de la table pour un calque', () => {
    expect(BILLBOARDS.filter(({ e }) => isQuadLayer(e)).map(({ id }) => id)).toEqual([]);
  });
});

describe('unsupportedBillboard', () => {
  const shape = BILLBOARD.shape as Record<string, unknown>;
  const curve = (minMaxState: number) => ({ curve: { minMaxState }, separateAxes: false });

  it('accepte la base des cas limites', () => {
    expect(unsupportedBillboard(BILLBOARD)).toBeNull();
  });

  it.each<[string, Partial<FxEmitter>, string]>([
    ['pas de forme', { shape: undefined }, 'émission sans ShapeModule'],
    ['une sphère', { shape: { ...shape, type: 0 } }, 'forme 0 (seul le Box est transcrit)'],
    [
      'une direction aléatoire',
      { shape: { ...shape, randomDirectionAmount: 0.5 } },
      'randomDirectionAmount',
    ],
    ['des rafales', { emission: { rateOverTime: 2, bursts: [{ count: 5 }] } }, 'rafales (bursts)'],
    [
      'une rotation par axe',
      { rotationOverLifetime: { ...curve(0), separateAxes: true } },
      'rotation sur la vie par axe',
    ],
    [
      'une rotation en courbe',
      { rotationOverLifetime: curve(1) },
      'rotation sur la vie en courbe (état 1)',
    ],
    ['une vitesse sur la vie', { velocityOverLifetime: {} }, 'velocityOverLifetime'],
    ['une feuille UV animée', { textureSheet: { mode: 1, timeMode: 0 } }, 'feuille UV mode 1/0'],
    ['un frein par axe', { limitVelocity: { separateAxis: true } }, 'limite de vitesse par axe'],
    [
      'un bruit remappé',
      { noise: { separateAxes: false, remapEnabled: true } },
      'bruit par axe ou remappé',
    ],
    [
      'une taille par axe',
      { sizeOverLifetime: { separateAxes: true } },
      'taille sur la vie par axe',
    ],
  ])('refuse et DIT quoi — %s', (_label, over, reason) => {
    expect(unsupportedBillboard({ ...BILLBOARD, ...over })).toBe(reason);
  });

  it('une rotation à vitesse constante (états 0 et 3) passe', () => {
    expect(unsupportedBillboard({ ...BILLBOARD, rotationOverLifetime: curve(0) })).toBeNull();
    expect(unsupportedBillboard({ ...BILLBOARD, rotationOverLifetime: curve(3) })).toBeNull();
  });

  it('cumule les motifs d’un émetteur plusieurs fois fautif', () => {
    const e = { ...BILLBOARD, velocityOverLifetime: {}, limitVelocity: { separateAxis: true } };
    expect(unsupportedBillboard(e)).toBe('velocityOverLifetime, limite de vitesse par axe');
  });
});

describe('layerVerdict', () => {
  const mat = (over: Partial<FxMaterial> = {}): FxMaterial => ({
    name: 'M',
    keywords: [],
    textures: {},
    floats: {},
    vectors: {},
    ...over,
  });
  const mesh = { name: 'Q', v: [], uv: [], i: [] };
  const table = (m: FxMaterial = mat()) => ({ materials: { M: m }, meshes: { Q: mesh } });
  const meshLayer: FxEmitter = { ...ANY, active: true, material: 'M', renderMode: 4, mesh: 'Q' };
  const billboard: FxEmitter = { ...BILLBOARD, active: true, material: 'M' };

  it('pose un calque de maille, avec sa maille et son matériau', () => {
    const m = mat();
    expect(layerVerdict(meshLayer, table(m))).toEqual({ kind: 'mesh', material: m, mesh });
  });

  it('pose un calque-quad et un billboard', () => {
    const quad: FxEmitter = {
      ...billboard,
      shape: undefined,
      emission: { rateOverTime: 0, bursts: [{ count: 1 }] },
      ringBufferMode: 2,
      startSpeed: 0,
      startSpeedMode: 0,
      startRotation: 0,
      startRotationMode: 0,
      startSizeMode: 0,
    };
    expect(layerVerdict(quad, table()).kind).toBe('quad');
    expect(layerVerdict(billboard, table()).kind).toBe('billboard');
  });

  it('passe sans un mot ce que le jeu ne dessine pas ou que la table ne porte pas', () => {
    expect(layerVerdict({ ...meshLayer, active: false }, table())).toEqual({
      kind: 'skipped',
      why: 'inactive',
    });
    expect(layerVerdict({ ...meshLayer, material: null }, table())).toEqual({
      kind: 'skipped',
      why: 'no-material',
    });
    expect(layerVerdict({ ...meshLayer, material: 'absent' }, table())).toEqual({
      kind: 'skipped',
      why: 'unknown-material',
    });
    expect(layerVerdict({ ...meshLayer, mesh: 'absente' }, table())).toEqual({
      kind: 'skipped',
      why: 'unknown-mesh',
    });
  });

  it('refuse un mot-clé de shader non transcrit', () => {
    const m = mat({ keywords: ['_MAIN_CLAMP', '_POLAR_UV_ON', '_DISSOLVE_UV_ON'] });
    expect(layerVerdict(meshLayer, table(m))).toEqual({
      kind: 'refused',
      reason: 'M : branche(s) de shader non transcrite(s) — _POLAR_UV_ON, _DISSOLVE_UV_ON',
    });
  });

  it('n’accepte que les blends `SrcAlpha One` et `One One` (défaut : 5/1)', () => {
    expect(layerVerdict(meshLayer, table(mat())).kind).toBe('mesh');
    expect(layerVerdict(meshLayer, table(mat({ floats: { _SrcBlend: 1 } }))).kind).toBe('mesh');
    expect(
      layerVerdict(meshLayer, table(mat({ floats: { _SrcBlend: 5, _DstBlend: 10 } }))),
    ).toEqual({ kind: 'refused', reason: 'M : blend 5/10 non transcrit' });
    expect(layerVerdict(meshLayer, table(mat({ floats: { _SrcBlend: 2, _DstBlend: 1 } })))).toEqual(
      {
        kind: 'refused',
        reason: 'M : blend 2/1 non transcrit',
      },
    );
  });

  it('refuse un billboard non simulable, avec le motif du simulateur', () => {
    const e = { ...billboard, name: 'pluie', velocityOverLifetime: {} };
    expect(layerVerdict(e, table())).toEqual({
      kind: 'refused',
      reason: 'pluie : émetteur non simulable — velocityOverLifetime',
    });
  });

  it('refuse un mode de rendu inconnu — et une maille annoncée sans maille', () => {
    expect(layerVerdict({ ...meshLayer, name: 'trail', renderMode: 2 }, table())).toEqual({
      kind: 'refused',
      reason: 'trail : renderMode 2 non transcrit',
    });
    expect(layerVerdict({ ...meshLayer, name: 'nu', mesh: null }, table())).toEqual({
      kind: 'refused',
      reason: 'nu : renderMode 4 non transcrit',
    });
  });

  it('juge le matériau AVANT l’émetteur : un seul refus remonte', () => {
    const e = { ...billboard, velocityOverLifetime: {} };
    const verdict = layerVerdict(e, table(mat({ keywords: ['_POLAR_UV_ON'] })));
    expect(verdict).toEqual({
      kind: 'refused',
      reason: 'M : branche(s) de shader non transcrite(s) — _POLAR_UV_ON',
    });
  });
});

describe('createBillboardSim', () => {
  it('la table porte des émetteurs simulés (sinon tout ce bloc tourne à vide)', () => {
    expect(BILLBOARDS.length).toBeGreaterThan(0);
  });

  it.each(BILLBOARDS)('à graine fixée, rejoue la même simulation — $id', ({ e }) => {
    const times = [0, 0.5, 1.7, 4.2, 9];
    const a = createBillboardSim(e, 12345);
    const b = createBillboardSim(e, 12345);
    for (const t of times) expect(a.at(t)).toEqual(b.at(t));
    // Et une autre graine donne une autre pluie.
    expect(createBillboardSim(e, 54321).at(9)).not.toEqual(a.at(9));
  });

  it.each(BILLBOARDS)('reste dans ses bornes sur 12 s — $id', ({ e }) => {
    const sheet = e.textureSheet as { tilesX: number; tilesY: number } | undefined;
    const tileCount = sheet ? sheet.tilesX * sheet.tilesY : 1;
    // Le régime permanent d'un débit constant : débit × vie la plus longue.
    const steady = Math.ceil(e.emission.rateOverTime * lifeMax(e)) + 1;
    // Les extrêmes sont relevés à la main et jugés UNE fois : un `expect` par
    // particule et par image en ferait des millions.
    let seen = 0;
    let age: [number, number] = [Infinity, -Infinity];
    let tile: [number, number] = [Infinity, -Infinity];
    let smallest = Infinity;
    let sound = true;
    for (const seed of [1, 2]) {
      const sim = createBillboardSim(e, seed);
      expect(sim.tiles).toEqual(sheet ? [sheet.tilesX, sheet.tilesY] : [1, 1]);
      for (let t = 0; t < 12; t += FRAME) {
        const parts = sim.at(t);
        seen = Math.max(seen, parts.length);
        for (const p of parts) {
          age = [Math.min(age[0], p.age01), Math.max(age[1], p.age01)];
          tile = [Math.min(tile[0], p.frame), Math.max(tile[1], p.frame)];
          smallest = Math.min(smallest, p.w, p.h);
          sound &&=
            Number.isInteger(p.frame) &&
            [p.x, p.y, p.w, p.h, p.rot, p.lerpStart, p.lerpOver].every(Number.isFinite);
        }
      }
    }
    expect(seen).toBeGreaterThan(0);
    expect(seen).toBeLessThanOrEqual(e.maxParticles);
    expect(seen).toBeLessThanOrEqual(steady);
    // Une particule est retirée dès que son âge atteint sa vie.
    expect(age[0]).toBeGreaterThanOrEqual(0);
    expect(age[1]).toBeLessThan(1);
    expect(tile[0]).toBeGreaterThanOrEqual(0);
    expect(tile[1]).toBeLessThan(tileCount);
    expect(smallest).toBeGreaterThanOrEqual(0);
    expect(sound).toBe(true);
    // Un débit qui remplirait plus que `maxParticles` s'arrête PILE au plafond —
    // c'est le cas des étoiles à 10/s pour 25 places.
    if (e.emission.rateOverTime * lifeMin(e) > e.maxParticles) expect(seen).toBe(e.maxParticles);
  });

  it('`maxParticles` plafonne les naissances, et le plafond est atteint', () => {
    const sim = createBillboardSim({ ...BILLBOARD, maxParticles: 3 }, 7);
    let seen = 0;
    for (let t = 0; t < 10; t += FRAME) seen = Math.max(seen, sim.at(t).length);
    expect(seen).toBe(3);
  });

  it('`prewarm` démarre en régime ; sans lui la première image est vide', () => {
    const rate = BILLBOARD.emission.rateOverTime;
    const warm = createBillboardSim({ ...BILLBOARD, prewarm: true }, 7);
    expect(warm.at(0).length).toBeGreaterThan(0);
    // Déjà en régime : des particules de tous âges, pas une cohorte de nouveau-nées.
    expect(Math.max(...warm.at(0).map((p) => p.age01))).toBeGreaterThan(0.5);

    const cold = createBillboardSim({ ...BILLBOARD, prewarm: false }, 7);
    expect(cold.at(0)).toEqual([]);
    expect(cold.at(0.5 / rate)).toEqual([]);
    // La première naissance tombe à 1/débit, au pas d'intégration près.
    expect(cold.at(1 / rate + MAX_STEP).length).toBe(1);
  });

  it('une particule vit entre les deux bornes de `startLifetime`', () => {
    // UNE place : chaque naissance attend la mort de la précédente, l'écart entre
    // deux naissances encadre donc la vie tirée — à l'attente du débit près.
    const e = { ...BILLBOARD, prewarm: false, maxParticles: 1 };
    const sim = createBillboardSim(e, 99);
    const dt = 1 / 120;
    const births: number[] = [];
    let prev = -1;
    for (let t = 0; t < 40; t += dt) {
      const [p] = sim.at(t);
      const age = p ? p.age01 : -1;
      if (p && (prev < 0 || age < prev)) births.push(t);
      prev = age;
    }
    expect(births.length).toBeGreaterThan(5);
    const wait = 1 / e.emission.rateOverTime;
    for (let i = 1; i < births.length; i++) {
      const gap = births[i] - births[i - 1];
      expect(gap).toBeGreaterThanOrEqual(lifeMin(e) - 2 * dt);
      expect(gap).toBeLessThanOrEqual(lifeMax(e) + wait + MAX_STEP + 2 * dt);
    }
  });

  it('ne recule pas : un instant passé rend l’état courant (une pause fige la pluie)', () => {
    const sim = createBillboardSim(BILLBOARD, 7);
    const now = sim.at(3);
    expect(sim.at(3)).toEqual(now);
    expect(sim.at(1)).toEqual(now);
  });

  it('un onglet qui revient de loin ne fait pas diverger l’intégration', () => {
    const sim = createBillboardSim(BILLBOARD, 7);
    sim.at(1);
    const parts = sim.at(600);
    expect(parts.length).toBeGreaterThan(0);
    expect(parts.length).toBeLessThanOrEqual(BILLBOARD.maxParticles);
    for (const p of parts) {
      expect(p.age01).toBeLessThan(1);
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });
});

describe('fxBleed', () => {
  const { frame, holder } = PORTRAIT_FX;

  it('un effet inconnu ne déborde pas', () => {
    expect(fxBleed('FX_UI_Character_List_Absent')).toEqual({ x: 0, y: 0 });
  });

  it.each(EFFECTS)('enveloppe tout ce que le montage dessine — %s', (name, eff) => {
    const bleed = fxBleed(name);
    expect(Number.isFinite(bleed.x) && Number.isFinite(bleed.y)).toBe(true);
    expect(bleed.x).toBeGreaterThanOrEqual(0);
    expect(bleed.y).toBeGreaterThanOrEqual(0);

    // L'étendue de tout ce qui est posé, relevée à la main et jugée UNE fois.
    let x: [number, number] = [Infinity, -Infinity];
    let y: [number, number] = [Infinity, -Infinity];
    const inside = (px: number, py: number) => {
      x = [Math.min(x[0], px), Math.max(x[1], px)];
      y = [Math.min(y[0], py), Math.max(y[1], py)];
    };

    for (const e of eff.emitters) {
      const verdict = layerVerdict(e);
      const ox = holder.x + eff.origin[0] + e.pos[0];
      const oy = holder.y + eff.origin[1] + e.pos[1];
      if (verdict.kind === 'mesh') {
        // Les sommets tels que le montage les pose : taille × échelle, Y retourné.
        for (const [vx, vy] of verdict.mesh.v)
          inside(ox + vx * e.startSize * e.scale[0], oy - vy * e.startSize * e.scale[1]);
      } else if (verdict.kind === 'quad') {
        const hw = 0.5 * e.startSize * e.scale[0];
        const hh = 0.5 * (e.size3D ? e.startSizeY : e.startSize) * e.scale[1];
        inside(ox - hw, oy - hh);
        inside(ox + hw, oy + hh);
      } else if (verdict.kind === 'billboard') {
        // Chaque quad simulé, pris par sa demi-diagonale : toute rotation tient dedans.
        for (const seed of [1, 2, 3]) {
          const sim = createBillboardSim(e, seed);
          for (let t = 0; t < 12; t += FRAME) {
            for (const p of sim.at(t)) {
              const half = 0.5 * Math.hypot(p.w, p.h);
              inside(ox + p.x - half, oy - p.y - half);
              inside(ox + p.x + half, oy - p.y + half);
            }
          }
        }
      }
    }

    // Le canvas, en unités du cadre : le cadre élargi du débord de chaque côté.
    const eps = 1e-6;
    expect(x[0]).toBeGreaterThanOrEqual(-bleed.x * frame.w - eps);
    expect(x[1]).toBeLessThanOrEqual(frame.w * (1 + bleed.x) + eps);
    expect(y[0]).toBeGreaterThanOrEqual(-bleed.y * frame.h - eps);
    expect(y[1]).toBeLessThanOrEqual(frame.h * (1 + bleed.y) + eps);
  });
});
