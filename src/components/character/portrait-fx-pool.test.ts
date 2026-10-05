import { describe, expect, it } from 'vitest';
import {
  createFrameLoop,
  createRefCache,
  lastByTarget,
  type FrameLoopHost,
  type RefCacheHost,
} from './portrait-fx-pool';

/**
 * CE QUE LES CARTES PARTAGENT, TENU SANS NAVIGATEUR.
 *
 * `portrait-fx-pool` ne touche ni à WebGL ni au DOM : l'horloge, la minuterie et
 * `requestAnimationFrame` lui sont injectés, donc les trois règles se jouent ici
 * à la main — quand une texture est rendue, qui est dessiné à chaque image, ce
 * que dit un lot de l'observateur. Le RENDU, lui (ce que `portrait-fx-gl` fait de
 * ces décisions dans le contexte partagé), n'est pas testé ici : il se contrôle à
 * l'écran, au pixel.
 */

/** Une horloge et UNE file de minuteries, avancées à la main. */
function fakeClock() {
  let now = 0;
  let seq = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const host: RefCacheHost = {
    now: () => now,
    defer(fn, ms) {
      timers.set(++seq, { at: now + ms, fn });
      return seq;
    },
    cancel(handle) {
      timers.delete(handle as number);
    },
  };
  return {
    host,
    /** Avance de `ms`, en déclenchant dans l'ordre les minuteries échues. */
    advance(ms: number) {
      const end = now + ms;
      for (;;) {
        const due = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]);
        now = due[1].at;
        due[1].fn();
      }
      now = end;
    },
    get pending() {
      return timers.size;
    },
  };
}

function cacheUnderTest(graceMs = 10_000) {
  const clock = fakeClock();
  const created: string[] = [];
  const disposed: string[] = [];
  let emptied = 0;
  const cache = createRefCache<{ key: string }>({
    graceMs,
    dispose: (_value, key) => disposed.push(key),
    onEmpty: () => emptied++,
    host: clock.host,
  });
  const acquire = (key: string) =>
    cache.acquire(key, () => {
      created.push(key);
      return { key };
    });
  return { clock, cache, acquire, created, disposed, emptied: () => emptied };
}

describe('createRefCache — une texture par clé, rendue quand plus personne ne la lit', () => {
  it('ne crée la valeur qu’au premier preneur, et rend la MÊME aux suivants', () => {
    const { acquire, created, cache } = cacheUnderTest();
    const a = acquire('demi');
    const b = acquire('demi');
    const c = acquire('art-1');
    expect(a).toBe(b);
    expect(c).not.toBe(a);
    expect(created).toEqual(['demi', 'art-1']);
    expect(cache.size).toBe(2);
  });

  it('ne rend rien tant qu’une carte tient encore la clé', () => {
    const { acquire, cache, clock, disposed } = cacheUnderTest();
    acquire('demi');
    acquire('demi');
    cache.release('demi');
    clock.advance(60_000);
    expect(disposed).toEqual([]);
    expect(cache.size).toBe(1);
  });

  it('rend la valeur une fois le sursis passé — pas avant, et une seule fois', () => {
    const { acquire, cache, clock, disposed } = cacheUnderTest(10_000);
    acquire('demi');
    cache.release('demi');
    clock.advance(9_999);
    expect(disposed).toEqual([]);
    clock.advance(1);
    expect(disposed).toEqual(['demi']);
    expect(cache.size).toBe(0);
    clock.advance(60_000);
    expect(disposed).toEqual(['demi']);
  });

  it('reprise pendant le sursis : ni rendue, ni recréée (le changement de filtre)', () => {
    const { acquire, cache, clock, created, disposed } = cacheUnderTest(10_000);
    const first = acquire('demi');
    cache.release('demi');
    clock.advance(4_000);
    // Une autre carte du même effet entre à l'écran.
    expect(acquire('demi')).toBe(first);
    clock.advance(60_000);
    expect(created).toEqual(['demi']);
    expect(disposed).toEqual([]);
    // Et le sursis repart de zéro à la prochaine libération.
    cache.release('demi');
    clock.advance(9_999);
    expect(disposed).toEqual([]);
    clock.advance(1);
    expect(disposed).toEqual(['demi']);
  });

  it('chaque entrée a SON sursis : la minuterie revient pour la plus jeune', () => {
    const { acquire, cache, clock, disposed } = cacheUnderTest(10_000);
    acquire('a');
    acquire('b');
    acquire('tenue');
    cache.release('a');
    clock.advance(6_000);
    cache.release('b');
    clock.advance(4_000);
    expect(disposed).toEqual(['a']);
    clock.advance(5_999);
    expect(disposed).toEqual(['a']);
    clock.advance(1);
    expect(disposed).toEqual(['a', 'b']);
    // Plus rien en sursis : aucune minuterie ne tourne pour l'entrée tenue.
    expect(clock.pending).toBe(0);
    expect(cache.size).toBe(1);
  });

  it('recrée après le sursis : la clé rendue repart d’une valeur neuve', () => {
    const { acquire, cache, clock, created } = cacheUnderTest(10_000);
    const first = acquire('demi');
    cache.release('demi');
    clock.advance(10_000);
    expect(acquire('demi')).not.toBe(first);
    expect(created).toEqual(['demi', 'demi']);
  });

  it('signale le cache vide quand la DERNIÈRE entrée est rendue, pas avant', () => {
    const { acquire, cache, clock, emptied } = cacheUnderTest(10_000);
    acquire('a');
    acquire('b');
    cache.release('a');
    clock.advance(10_000);
    expect(emptied()).toBe(0);
    cache.release('b');
    clock.advance(9_999);
    expect(emptied()).toBe(0);
    clock.advance(1);
    expect(emptied()).toBe(1);
  });

  it('ignore une libération de trop ou d’une clé inconnue', () => {
    const { acquire, cache, clock, disposed } = cacheUnderTest(10_000);
    acquire('a');
    cache.release('inconnue');
    cache.release('a');
    cache.release('a');
    // La seconde libération n'a pas rendu le compteur négatif : une reprise
    // suffit à tenir l'entrée.
    acquire('a');
    clock.advance(60_000);
    expect(disposed).toEqual([]);
  });

  it('`values` rend les entrées tenues ET celles en sursis (reconstruction après une perte)', () => {
    const { acquire, cache, clock } = cacheUnderTest(10_000);
    acquire('tenue');
    acquire('sursis');
    cache.release('sursis');
    clock.advance(5_000);
    expect([...cache.values()].map((v) => v.key)).toEqual(['tenue', 'sursis']);
  });

  it('`clear` rend tout sur-le-champ et arrête la minuterie', () => {
    const { acquire, cache, clock, disposed, emptied } = cacheUnderTest(10_000);
    acquire('a');
    acquire('b');
    cache.release('b');
    cache.clear();
    expect(disposed).toEqual(['a', 'b']);
    expect(cache.size).toBe(0);
    expect(clock.pending).toBe(0);
    clock.advance(60_000);
    expect(disposed).toEqual(['a', 'b']);
    // `clear` est la FIN du contexte : il ne se signale pas à lui-même.
    expect(emptied()).toBe(0);
  });
});

/** Un `requestAnimationFrame` joué à la main : au plus un callback en file. */
function fakeFrames() {
  let queued: ((now: number) => void) | null = null;
  let id = 0;
  let requests = 0;
  let cancels = 0;
  const host: FrameLoopHost = {
    request(cb) {
      if (queued) throw new Error('deux images demandées à la fois');
      queued = cb;
      requests++;
      return ++id;
    },
    cancel(handle) {
      if (handle === id && queued) {
        queued = null;
        cancels++;
      }
    },
  };
  return {
    host,
    /** Joue l'image en file à l'instant `now` ; faux s'il n'y en avait pas. */
    frame(now: number) {
      const cb = queued;
      if (!cb) return false;
      queued = null;
      cb(now);
      return true;
    },
    get waiting() {
      return queued !== null;
    },
    get requests() {
      return requests;
    },
    get cancels() {
      return cancels;
    },
  };
}

function loopUnderTest() {
  const frames = fakeFrames();
  const drawn: [string, number][] = [];
  /** Les cartes que `draw` refuse (contexte perdu pas encore signalé, par exemple). */
  const failing = new Set<string>();
  let idle = 0;
  let after = 0;
  const loop = createFrameLoop<string>(
    frames.host,
    (card, seconds) => {
      if (failing.has(card)) return false;
      drawn.push([card, seconds]);
      return true;
    },
    { afterFrame: () => after++, onIdle: () => idle++ },
  );
  /** Ce qui a été dessiné depuis le dernier appel. */
  const take = () => drawn.splice(0);
  return { frames, loop, take, failing, idle: () => idle, after: () => after };
}

describe('createFrameLoop — une boucle pour toutes les cartes', () => {
  it('ne demande aucune image tant qu’aucune carte n’est prête', () => {
    const { frames, loop } = loopUnderTest();
    loop.add('a');
    loop.setRunning('a', true);
    expect(frames.waiting).toBe(false);
    expect(frames.requests).toBe(0);
  });

  it('une carte prête mais EN PAUSE reçoit une image, une seule (mouvement réduit, hors écran)', () => {
    const { frames, loop, take, idle } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    expect(frames.waiting).toBe(true);
    frames.frame(1000);
    expect(take()).toEqual([['a', 0]]);
    // L'image due est payée : plus rien n'est demandé au navigateur.
    expect(frames.waiting).toBe(false);
    expect(idle()).toBe(1);
  });

  it('demande UNE image par tour, quel que soit le nombre de cartes animées', () => {
    const { frames, loop, take } = loopUnderTest();
    for (const c of ['a', 'b', 'c']) {
      loop.add(c);
      loop.ready(c);
      loop.setRunning(c, true);
    }
    expect(frames.requests).toBe(1);
    frames.frame(1000);
    expect(take().map(([c]) => c)).toEqual(['a', 'b', 'c']);
    expect(frames.requests).toBe(2);
    frames.frame(1016);
    expect(take().map(([c]) => c)).toEqual(['a', 'b', 'c']);
    expect(frames.requests).toBe(3);
  });

  it('ne dessine que les cartes animées ou en dette d’une image', () => {
    const { frames, loop, take } = loopUnderTest();
    for (const c of ['visible', 'horsEcran']) {
      loop.add(c);
      loop.ready(c);
    }
    loop.setRunning('visible', true);
    frames.frame(1000);
    // La première image paie la dette des deux.
    expect(take().map(([c]) => c)).toEqual(['visible', 'horsEcran']);
    frames.frame(1016);
    frames.frame(1032);
    expect(take().map(([c]) => c)).toEqual(['visible', 'visible']);
  });

  it('compte le temps de CHAQUE carte, en secondes, depuis sa première image', () => {
    const { frames, loop, take } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    loop.setRunning('a', true);
    frames.frame(1000);
    frames.frame(1016);
    loop.add('b');
    loop.ready('b');
    loop.setRunning('b', true);
    frames.frame(1032);
    const times = take();
    expect(times[0]).toEqual(['a', 0]);
    expect(times[1][1]).toBeCloseTo(0.016, 10);
    expect(times[2][1]).toBeCloseTo(0.032, 10);
    // `b` part de zéro à SA première image, pas à l'horloge de `a`.
    expect(times[3]).toEqual(['b', 0]);
  });

  it('borne un trou entre deux images à 100 ms (onglet qui revient de loin)', () => {
    const { frames, loop, take } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    loop.setRunning('a', true);
    frames.frame(1000);
    frames.frame(61_000);
    expect(take()[1][1]).toBeCloseTo(0.1, 10);
  });

  it('le temps ne s’écoule pas pendant la pause', () => {
    const { frames, loop, take } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    loop.setRunning('a', true);
    frames.frame(1000);
    frames.frame(1050);
    loop.setRunning('a', false);
    expect(frames.waiting).toBe(false);
    loop.setRunning('a', true);
    // La reprise ne compte pas l'intervalle depuis la dernière image…
    frames.frame(9000);
    // … et le temps repart ensuite, d'image en image.
    frames.frame(9020);
    const times = take().map(([, t]) => t);
    expect(times[1]).toBeCloseTo(0.05, 10);
    expect(times[2]).toBeCloseTo(0.05, 10);
    expect(times[3]).toBeCloseTo(0.07, 10);
  });

  it('s’arrête quand la dernière carte animée se fige ou part, et le signale', () => {
    const { frames, loop, idle } = loopUnderTest();
    for (const c of ['a', 'b']) {
      loop.add(c);
      loop.ready(c);
      loop.setRunning(c, true);
    }
    frames.frame(1000);
    loop.setRunning('a', false);
    expect(frames.waiting).toBe(true);
    expect(idle()).toBe(0);
    loop.remove('b');
    expect(frames.waiting).toBe(false);
    expect(frames.cancels).toBe(1);
    expect(idle()).toBe(1);
    expect(loop.size).toBe(1);
  });

  it('passe `afterFrame` après chaque image jouée', () => {
    const { frames, loop, after } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    loop.setRunning('a', true);
    frames.frame(1000);
    frames.frame(1016);
    expect(after()).toBe(2);
  });

  it('contexte perdu : plus aucune image, et rien n’est oublié à la reprise', () => {
    const { frames, loop, take, idle } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    loop.setRunning('a', true);
    frames.frame(1000);
    frames.frame(1050);
    loop.suspend();
    expect(frames.waiting).toBe(false);
    // Une suspension n'est pas un repos : les cibles ne sont pas à rendre, elles
    // sont mortes avec le contexte.
    expect(idle()).toBe(0);
    // Une carte qui devient prête pendant la perte attend la reprise.
    loop.add('b');
    loop.ready('b');
    expect(frames.waiting).toBe(false);
    loop.resume();
    frames.frame(50_000);
    const times = take();
    // `a` reprend où elle en était (0,05 s), sans compter le temps de la perte.
    expect(times.slice(2)).toEqual([
      ['a', times[1][1]],
      ['b', 0],
    ]);
    expect(times[1][1]).toBeCloseTo(0.05, 10);
  });

  it('un dessin refusé reste dû : la boucle redemande une image jusqu’à ce qu’il passe', () => {
    const { frames, loop, take, failing } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    failing.add('a');
    frames.frame(1000);
    expect(take()).toEqual([]);
    // La dette n'est pas payée : la boucle redemande une image.
    expect(frames.waiting).toBe(true);
    failing.delete('a');
    frames.frame(1016);
    expect(take()).toEqual([['a', 0]]);
    expect(frames.waiting).toBe(false);
  });

  it('le temps d’une carte n’avance pas sur une image refusée, ni ne la rattrape', () => {
    const { frames, loop, take, failing } = loopUnderTest();
    loop.add('a');
    loop.ready('a');
    loop.setRunning('a', true);
    frames.frame(1000);
    frames.frame(1020);
    failing.add('a');
    frames.frame(1040);
    failing.delete('a');
    frames.frame(1060);
    frames.frame(1080);
    const times = take().map(([, t]) => t);
    expect(times).toHaveLength(4);
    expect(times[1]).toBeCloseTo(0.02, 10);
    // L'image refusée (1040) et l'intervalle qui la suit ne comptent pas.
    expect(times[2]).toBeCloseTo(0.02, 10);
    expect(times[3]).toBeCloseTo(0.04, 10);
  });

  it('une carte retirée PENDANT l’image n’est pas dessinée, les autres le sont', () => {
    const frames = fakeFrames();
    const drawn: string[] = [];
    const loop = createFrameLoop<string>(frames.host, (card) => {
      if (card === 'a') loop.remove('b');
      drawn.push(card);
      return true;
    });
    for (const c of ['a', 'b', 'c']) {
      loop.add(c);
      loop.ready(c);
      loop.setRunning(c, true);
    }
    frames.frame(1000);
    expect(drawn).toEqual(['a', 'c']);
    frames.frame(1016);
    expect(drawn).toEqual(['a', 'c', 'a', 'c']);
  });

  it('ignore une carte inconnue, et un `ready` répété ne redoit pas d’image', () => {
    const { frames, loop, take } = loopUnderTest();
    loop.setRunning('fantome', true);
    loop.ready('fantome');
    loop.remove('fantome');
    expect(frames.waiting).toBe(false);
    loop.add('a');
    loop.ready('a');
    frames.frame(1000);
    loop.ready('a');
    expect(frames.waiting).toBe(false);
    expect(take()).toEqual([['a', 0]]);
  });
});

describe('lastByTarget — le dernier mot de chaque cible d’un lot', () => {
  it('garde la DERNIÈRE entrée d’une cible, dans l’ordre du lot', () => {
    const a = { id: 'a' };
    const b = { id: 'b' };
    const out = lastByTarget([
      { target: a, isIntersecting: true },
      { target: b, isIntersecting: false },
      { target: a, isIntersecting: false },
    ]);
    expect([...out]).toEqual([
      [a, false],
      [b, false],
    ]);
  });

  it('rend une table vide pour un lot vide', () => {
    expect(lastByTarget([]).size).toBe(0);
  });
});
