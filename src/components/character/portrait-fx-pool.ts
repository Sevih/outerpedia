/**
 * CE QUE LES CARTES ANIMÉES PARTAGENT — les règles, sans une ligne de WebGL.
 *
 * `portrait-fx-gl` tient UN contexte pour toutes les cartes de la page. Trois
 * décisions en découlent, qui n'ont rien de graphique et vivent donc ici, où
 * elles se testent sans navigateur :
 *
 *   1. QUAND UNE TEXTURE EST RENDUE (`createRefCache`). Elle est montée une
 *      fois, à son premier lecteur, et comptée ; elle n'est rendue que lorsque
 *      plus AUCUNE carte montée ne la lit, et seulement après un délai de grâce.
 *   2. QUI EST DESSINÉ À CHAQUE IMAGE (`createFrameLoop`). Une seule boucle
 *      `requestAnimationFrame` pour toutes les cartes, qui ne tourne que s'il y
 *      a quelque chose à dessiner.
 *   3. CE QUE DIT UN LOT DE L'OBSERVATEUR (`lastByTarget`).
 *
 * Tout ce qui touche au temps ou au navigateur est INJECTÉ (horloge, minuterie,
 * `requestAnimationFrame`) : les tests jouent les mêmes règles à la main.
 */

// --- textures : une par clé, rendue quand plus personne ne la lit -----------------

/** L'horloge et la minuterie du cache — `performance.now` et `setTimeout` en vrai. */
export interface RefCacheHost {
  now(): number;
  defer(fn: () => void, ms: number): unknown;
  cancel(handle: unknown): void;
}

export interface RefCache<V> {
  /** Prend une référence ; `create` n'est appelé qu'au PREMIER preneur de la clé. */
  acquire(key: string, create: () => V): V;
  /** Rend une référence. À zéro, l'entrée devient libérable après le délai. */
  release(key: string): void;
  /** Toutes les entrées, tenues ou en sursis — pour rebâtir après une perte. */
  values(): IterableIterator<V>;
  readonly size: number;
  /** Rend tout, tout de suite (fin du contexte). */
  clear(): void;
}

/**
 * UN CACHE À COMPTEUR DE RÉFÉRENCES, AVEC SURSIS.
 *
 * La règle de libération, en entier : une entrée vit tant qu'au moins une carte
 * MONTÉE la tient (à l'écran ou non — une carte hors écran reviendra, et
 * remonter ses textures à chaque va-et-vient de défilement serait le coût même
 * que le contexte partagé supprime). Quand la dernière la rend, l'entrée n'est
 * pas détruite sur-le-champ : elle attend `graceMs`. Reprise dans ce délai, elle
 * resert telle quelle ; sinon elle est rendue.
 *
 * Le sursis n'est pas un confort : un changement de filtre démonte une carte
 * `_Demi` et en monte une autre dans le même rendu, et la nouvelle ne prend ses
 * références qu'à son entrée à l'écran, une image plus tard. Sans délai, les
 * huit textures de l'effet seraient détruites puis remontées à chaque clic.
 *
 * `onEmpty` est appelé quand la DERNIÈRE entrée vient d'être rendue : plus rien
 * n'est monté depuis au moins `graceMs`, c'est le signal pour rendre le contexte.
 */
export function createRefCache<V>({
  graceMs,
  dispose,
  onEmpty,
  host,
}: {
  graceMs: number;
  dispose: (value: V, key: string) => void;
  onEmpty?: () => void;
  host: RefCacheHost;
}): RefCache<V> {
  interface Entry {
    value: V;
    refs: number;
    /** Instant où la dernière référence a été rendue — sans objet tant que `refs > 0`. */
    idleSince: number;
  }
  const entries = new Map<string, Entry>();
  let timer: unknown = null;

  function arm(ms: number): void {
    if (timer !== null) return;
    timer = host.defer(sweep, ms);
  }

  function sweep(): void {
    timer = null;
    const now = host.now();
    let next = Infinity;
    let freed = false;
    for (const [key, e] of entries) {
      if (e.refs > 0) continue;
      const left = e.idleSince + graceMs - now;
      if (left > 0) {
        next = Math.min(next, left);
        continue;
      }
      entries.delete(key);
      dispose(e.value, key);
      freed = true;
    }
    // Une entrée rendue plus tard que celle qui a armé la minuterie a encore du
    // sursis : on revient pour elle.
    if (next !== Infinity) arm(next);
    if (freed && entries.size === 0) onEmpty?.();
  }

  return {
    acquire(key, create) {
      let e = entries.get(key);
      if (!e) {
        e = { value: create(), refs: 0, idleSince: 0 };
        entries.set(key, e);
      }
      e.refs++;
      return e.value;
    },
    release(key) {
      const e = entries.get(key);
      if (!e || e.refs === 0) return;
      if (--e.refs > 0) return;
      e.idleSince = host.now();
      arm(graceMs);
    },
    values: function* () {
      for (const e of entries.values()) yield e.value;
    },
    get size() {
      return entries.size;
    },
    clear() {
      if (timer !== null) host.cancel(timer);
      timer = null;
      for (const [key, e] of entries) dispose(e.value, key);
      entries.clear();
    },
  };
}

// --- la boucle : une pour toutes les cartes ---------------------------------------

/** `requestAnimationFrame` et son annulation — injectés pour les tests. */
export interface FrameLoopHost {
  request(cb: (now: number) => void): number;
  cancel(id: number): void;
}

export interface FrameLoop<C> {
  /** Inscrit une carte : en pause, et pas encore prête. */
  add(card: C): void;
  remove(card: C): void;
  /** Les textures de la carte sont là : elle doit UNE image, même en pause. */
  ready(card: C): void;
  /** Anime ou fige la carte, sans toucher à son temps écoulé. */
  setRunning(card: C, on: boolean): void;
  /** Le contexte est perdu : plus rien ne se dessine, tous les états sont gardés. */
  suspend(): void;
  /** Le contexte est revenu : la boucle reprend là où elle en était. */
  resume(): void;
  readonly size: number;
}

/**
 * UNE SEULE BOUCLE POUR TOUTES LES CARTES, et elle ne tourne que s'il y a de quoi.
 *
 * À chaque image, sont dessinées les cartes PRÊTES (textures arrivées) qui sont
 * soit animées (`setRunning(true)` — à l'écran, onglet visible, mouvement non
 * réduit : c'est l'appelant qui en décide), soit en dette d'UNE image. La dette
 * naît quand la carte devient prête : sans elle, une carte montée sous
 * `prefers-reduced-motion`, ou sortie de l'écran avant la fin de ses
 * chargements, resterait un canvas vide. Une fois payée, plus rien — et si
 * aucune carte n'est animée, aucune image n'est plus demandée au navigateur.
 *
 * CHAQUE CARTE GARDE SON TEMPS. `draw` reçoit les secondes écoulées pour CETTE
 * carte : elles ne s'écoulent que quand elle est animée ET dessinée — ni en
 * pause, ni contexte perdu, sinon reprendre ferait sauter l'effet de toute la
 * durée passée hors écran — et un trou entre deux images est borné à 100 ms
 * (onglet qui revient de loin). `draw` rend `false` quand il n'a rien pu
 * dessiner : le temps n'avance pas et l'image reste due.
 *
 * `afterFrame` passe après chaque image jouée, `onIdle` quand la boucle n'a plus
 * rien à demander (c'est là que `portrait-fx-gl` rend ses cibles de rendu).
 */
export function createFrameLoop<C>(
  host: FrameLoopHost,
  draw: (card: C, seconds: number) => boolean,
  { afterFrame, onIdle }: { afterFrame?: () => void; onIdle?: () => void } = {},
): FrameLoop<C> {
  interface Slot {
    ready: boolean;
    running: boolean;
    owed: boolean;
    elapsed: number;
    /** Horodatage de la dernière image ANIMÉE — 0 : la prochaine ne compte pas de temps. */
    last: number;
  }
  const slots = new Map<C, Slot>();
  let raf = 0;
  let scheduled = false;
  let suspended = false;

  const wants = (s: Slot) => s.ready && (s.running || s.owed);

  /** Accorde la demande d'image à l'état : une en file s'il y a de quoi, aucune sinon. */
  function sync(): void {
    let need = false;
    if (!suspended) for (const s of slots.values()) if ((need = wants(s))) break;
    if (need && !scheduled) {
      scheduled = true;
      raf = host.request(tick);
    } else if (!need && scheduled) {
      scheduled = false;
      host.cancel(raf);
      if (!suspended) onIdle?.();
    }
  }

  function tick(now: number): void {
    scheduled = false;
    // Sur une copie : `draw` peut retirer une carte (cible refusée pour de bon).
    for (const [card, s] of [...slots]) {
      if (!slots.has(card) || !wants(s)) continue;
      const seconds = s.elapsed + (s.last ? Math.min(now - s.last, 100) / 1000 : 0);
      if (!draw(card, seconds)) {
        // Rien n'a été dessiné : cette image ne compte pas, la suivante non plus
        // ne rattrapera pas l'intervalle.
        s.last = 0;
        continue;
      }
      s.elapsed = seconds;
      s.last = s.running ? now : 0;
      s.owed = false;
    }
    afterFrame?.();
    sync();
    if (!scheduled && !suspended) onIdle?.();
  }

  const slot = (card: C) => slots.get(card);

  return {
    add(card) {
      if (!slots.has(card))
        slots.set(card, { ready: false, running: false, owed: false, elapsed: 0, last: 0 });
    },
    remove(card) {
      if (slots.delete(card)) sync();
    },
    ready(card) {
      const s = slot(card);
      if (!s || s.ready) return;
      s.ready = true;
      s.owed = true;
      sync();
    },
    setRunning(card, on) {
      const s = slot(card);
      if (!s || s.running === on) return;
      s.running = on;
      // Le temps ne s'écoule pas pendant la pause.
      s.last = 0;
      sync();
    },
    suspend() {
      suspended = true;
      sync();
    },
    resume() {
      suspended = false;
      for (const s of slots.values()) s.last = 0;
      sync();
    },
    get size() {
      return slots.size;
    },
  };
}

// --- l'observateur : le dernier mot de chaque cible --------------------------------

/**
 * L'état FINAL de chaque cible d'un lot d'`IntersectionObserver`.
 *
 * Deux franchissements de la même carte peuvent s'accumuler avant que le
 * callback passe (défilement rapide) ; les entrées arrivent en ordre
 * chronologique, la DERNIÈRE l'emporte. Ne lire que la première laisserait une
 * carte visible figée, ou une carte sortie encore animée.
 */
export function lastByTarget<T>(
  entries: readonly { target: T; isIntersecting: boolean }[],
): Map<T, boolean> {
  const out = new Map<T, boolean>();
  for (const e of entries) out.set(e.target, e.isIntersecting);
  return out;
}
