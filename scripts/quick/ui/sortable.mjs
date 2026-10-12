/**
 * quick/ui/sortable — le GLISSER-DÉPOSER natif d'une liste d'éléments, PARTAGÉ :
 * les vignettes des paliers de Premium & Limited (F25), celles de Core Fusion
 * ensuite (C13), et toute rangée dont l'ordre est le contenu.
 *
 * Il ne déplace rien dans le DOM : il dit à l'appelant « l'élément `from` de
 * cette liste va en `to` de celle-là », et l'appelant redessine depuis ses
 * données (le modèle de toute la page : un geste écrit l'état, `render()`
 * suit). Il ne pose que des classes, le temps du geste :
 *   - `.dragging` sur l'élément saisi (son fantôme est celui du navigateur ;
 *     la source s'atténue) ;
 *   - `.drop-before` / `.drop-after` sur l'élément survolé — le TRAIT
 *     d'insertion, du côté où l'élément tombera (la moitié survolée) ;
 *   - `.drop-end` sur une liste survolée hors de ses éléments (une liste vide,
 *     l'espace après le dernier) : il tombera en fin.
 * Le CSS de l'appelant dessine le trait sur ces classes.
 *
 * Par DÉLÉGATION sur `root` : l'appelant redessine ses listes autant qu'il
 * veut (`innerHTML`), le branchement tient. Les éléments déplaçables portent
 * `draggable="true"` (ou répondent à `item`) ; une liste est l'ancêtre qui
 * répond à `list` — sans `list`, `root` est la seule liste. Un élément peut
 * tomber dans une AUTRE liste du même `root` (un palier à l'autre) : `onMove`
 * reçoit les deux.
 *
 * Les boutons ↑ ↓ de l'appelant restent le chemin du clavier et du banc :
 * un `drop` sans souris n'existe pas, et happy-dom ne connaît pas `DragEvent`
 * — les tests tirent des `Event` nus, sans `dataTransfer` ni coordonnées
 * (`clientX` absent : l'élément tombe AVANT celui qu'il survole).
 *
 * Du `.mjs` typé par JSDoc (`checkJs` de `scripts/tsconfig.json`), comme
 * `hero-tile.mjs` : la page le charge tel quel, les tests l'importent.
 */

/**
 * @typedef {object} SortableOptions
 * @property {(from: number, to: number, fromList: HTMLElement, toList: HTMLElement) => void} onMove
 *   L'élément `from` de `fromList` va en `to` de `toList` — `to` est son index
 *   APRÈS le geste, dans la liste d'arrivée (dans la même liste, le retrait
 *   est déjà compté). Jamais appelé pour un geste qui ne bouge rien.
 * @property {string} [item] Ce qui se déplace ; sans lui, `[draggable="true"]`.
 * @property {string} [list] L'ancêtre qui fait liste ; sans lui, `root` seul.
 */

const DRAGGING = 'dragging';
const MARKS = ['drop-before', 'drop-after', 'drop-end'];

/**
 * Branche le glisser-déposer sous `root` ; rend ce qui le débranche.
 * @param {HTMLElement} root
 * @param {SortableOptions} opts
 */
export function sortable(root, { onMove, item = '[draggable="true"]', list }) {
  /** @type {{ el: HTMLElement, list: HTMLElement } | null} L'élément saisi, et sa liste. */
  let held = null;
  /** @type {HTMLElement | null} Ce qui porte le trait d'insertion. */
  let marked = null;

  /**
   * Un nœud du DOM, ou rien (le texte d'un bouton n'a pas `closest`) — sans
   * `instanceof Element` : le banc tourne hors du navigateur, où ce global manque.
   * @param {EventTarget | null} target
   */
  const nodeOf = (target) => {
    const any = /** @type {{ closest?: unknown, parentElement?: Element | null } | null} */ (
      target
    );
    if (any && typeof any.closest === 'function') return /** @type {Element} */ (target);
    return any?.parentElement ?? null;
  };
  /** @param {EventTarget | null} target */
  const itemOf = (target) =>
    /** @type {HTMLElement | null} */ (nodeOf(target)?.closest(item) ?? null);
  /** @param {Element} el */
  const listOf = (el) =>
    list
      ? /** @type {HTMLElement | null} */ (el.closest(list))
      : el === root || root.contains(el)
        ? root
        : null;
  /** @param {HTMLElement} l */
  const itemsOf = (l) => [...l.querySelectorAll(item)].filter((x) => listOf(x) === l);

  const unmark = () => {
    if (marked) marked.classList.remove(...MARKS);
    marked = null;
  };
  const release = () => {
    held?.el.classList.remove(DRAGGING);
    held = null;
    unmark();
  };

  /**
   * Où l'élément tomberait : la liste et l'index d'insertion parmi ses
   * éléments (avant celui survolé, ou après lui si la souris est passée la
   * moitié ; en fin de liste hors de tout élément), et quoi marquer.
   * @param {DragEvent | Event} e
   */
  const spot = (e) => {
    const over = itemOf(e.target);
    // Sur l'élément saisi lui-même : nulle part.
    if (over && over === held?.el) return null;
    if (over) {
      const l = listOf(over);
      if (!l) return null;
      const rect = over.getBoundingClientRect();
      const x = /** @type {{ clientX?: number }} */ (e).clientX;
      const after = rect.width > 0 && typeof x === 'number' && x >= rect.left + rect.width / 2;
      const items = itemsOf(l);
      return {
        list: l,
        index: items.indexOf(over) + (after ? 1 : 0),
        mark: over,
        cls: after ? 'drop-after' : 'drop-before',
      };
    }
    const node = nodeOf(e.target);
    const l = node ? listOf(node) : null;
    if (!l) return null;
    // Hors de tout élément (une liste vide, l'espace après le dernier) : en fin de liste.
    return { list: l, index: itemsOf(l).length, mark: l, cls: 'drop-end' };
  };

  /** @param {Event} e */
  const start = (e) => {
    const el = itemOf(e.target);
    const l = el && listOf(el);
    if (!el || !l) return;
    held = { el, list: l };
    el.classList.add(DRAGGING);
    const dt = /** @type {DragEvent} */ (e).dataTransfer;
    if (dt) {
      dt.effectAllowed = 'move';
      // Firefox n'entame pas le geste sans donnée.
      dt.setData('text/plain', '');
    }
  };
  /** @param {Event} e */
  const over = (e) => {
    if (!held) return;
    const at = spot(e);
    if (!at) return unmark();
    e.preventDefault();
    const dt = /** @type {DragEvent} */ (e).dataTransfer;
    if (dt) dt.dropEffect = 'move';
    if (marked !== at.mark || !at.mark.classList.contains(at.cls)) {
      unmark();
      marked = at.mark;
      marked.classList.add(at.cls);
    }
  };
  /** @param {Event} e */
  const drop = (e) => {
    if (!held) return;
    const at = spot(e);
    const { el, list: fromList } = held;
    release();
    if (!at) return;
    e.preventDefault();
    const from = itemsOf(fromList).indexOf(el);
    if (from < 0) return;
    let to = at.index;
    // Dans la même liste, l'index d'arrivée compte le retrait.
    if (at.list === fromList && to > from) to -= 1;
    if (at.list === fromList && to === from) return;
    onMove(from, to, fromList, at.list);
  };

  root.addEventListener('dragstart', start);
  root.addEventListener('dragover', over);
  root.addEventListener('drop', drop);
  root.addEventListener('dragend', release);
  return () => {
    root.removeEventListener('dragstart', start);
    root.removeEventListener('dragover', over);
    root.removeEventListener('drop', drop);
    root.removeEventListener('dragend', release);
    release();
  };
}
