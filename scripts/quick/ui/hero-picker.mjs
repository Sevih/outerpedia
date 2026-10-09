/**
 * quick/ui/hero-picker — le picker de héros, PARTAGÉ : la modale où l'on
 * choisit un perso (« Fiche perso », Gear reco) ou plusieurs (les partenaires
 * d'une synergie) — recherche, pastilles d'élément et de classe, grille de
 * visages. Elle sert aussi à choisir AUTRE CHOSE qu'un héros, quand ce n'est
 * qu'une question de contenu (un effet du glossaire, « Fiche perso » › Skills) :
 * l'appelant dessine alors ses tuiles (`tile`, `rows`) et nomme ce qu'on y
 * cherche (`placeholder`, `none`).
 *
 * Sa modale est À LUI : posée dans `<body>` au premier appel, stylée par
 * `hero-picker.css` (classes `hp-`), elle s'ouvre donc de n'importe quelle
 * section — celle de Gear reco vit dans son onglet, caché dès qu'on le quitte.
 * Une seule ouverte à la fois.
 *
 * Clavier, celui des pickers de pièces de Gear reco : Entrée dans la recherche
 * VALIDE un multi-choix (Ctrl + Entrée aussi) et, en choix unique, prend la
 * première tuile ; Entrée ou Espace sur une tuile la choisit (c'est un bouton) ;
 * Échap, la croix et un clic sur le voile ferment sans rien poser ; Tab reste
 * dans le panneau.
 *
 * Du `.mjs` typé par JSDoc (`checkJs` de `scripts/tsconfig.json`), comme
 * `gear-view.mjs` : la page le charge tel quel, les tests l'importent.
 */

/**
 * Un perso du roster. `element` manque quand l'appelant ne le connaît pas : la
 * tuile se passe de son icône, la rangée de sa pastille — de même `class`, pour
 * ce qui n'est pas un héros.
 * @typedef {{ id: string, name: string, class?: string, element?: string }} Hero
 */

/**
 * Les filtres, gardés par l'appelant d'une ouverture à l'autre (la recherche,
 * elle, repart vide) : les pastilles enfoncées, et la valeur du groupe `seg`.
 * @typedef {{ elements: Set<string>, classes: Set<string>, seg: string }} HeroFilters
 */

/**
 * @typedef {object} HeroPickerOptions
 * @property {readonly Hero[]} roster Les persos proposés, dans l'ordre montré.
 * @property {string} imgBase La base des images du site (`state.imgBase`).
 * @property {string} title
 * @property {(picked: any) => unknown} onPick Choix unique : l'id cliqué — rendre
 *   `false` garde la modale ouverte (un abandon refusé). Multi-choix : les ids
 *   cochés, dans l'ordre des clics, à « Valider ».
 * @property {boolean} [multi] Plusieurs tuiles se cochent, un pied valide.
 * @property {string | readonly string[]} [chosen] Le perso en cours (son
 *   anneau), ou en multi-choix ceux déjà cochés.
 * @property {() => (HTMLElement | null | undefined)} [opener] Qui reprend le
 *   focus à la fermeture.
 * @property {HeroFilters} [filters] Où garder les filtres ; sans lui, ceux du module.
 * @property {() => string} [tally] Le badge de tête ; sans lui, le compte.
 * @property {{ label: string, options: readonly (readonly [string, string])[], test: (hero: any, value: string) => boolean }} [seg]
 *   Un groupe segmenté de plus dans la rangée de filtres (« Avec recos »).
 * @property {(hero: any) => number | undefined} [count] La pastille d'une tuile
 *   (son nombre de builds), atténuée à zéro.
 * @property {(hero: any) => string} [hint] Le `title` d'une tuile ; sans lui, le nom.
 * @property {(item: any) => string} [tile] Le contenu d'une tuile, dessiné par
 *   l'appelant (déjà échappé) ; sans lui, le visage du héros, son élément, son nom.
 * @property {boolean} [rows] Des tuiles en lignes (une icône, un nom à côté),
 *   sur plusieurs colonnes, au lieu de la grille de visages.
 * @property {string} [placeholder] Ce que la recherche invite à chercher ; sans
 *   lui, « Chercher un perso… ».
 * @property {string} [none] Ce que dit une recherche sans résultat ; sans lui,
 *   « Aucun perso ne correspond. ».
 */

/** L'ordre des pastilles, celui du site (`ELEMENT_ORDER`, `CLASS_ORDER`). */
const ELEMENTS = ['fire', 'water', 'earth', 'light', 'dark'];
const CLASSES = ['defender', 'striker', 'ranger', 'mage', 'healer'];

/** Les filtres d'un appelant qui n'en garde pas. */
export const heroFilters = () => ({ elements: new Set(), classes: new Set(), seg: '' });
/** @type {HeroFilters} */
const shared = heroFilters();

const SEARCH =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>';

const PLACEHOLDER = 'Chercher un perso…';
const NONE = 'Aucun perso ne correspond.';

const MARKUP = `<div class="hp-panel" role="dialog" aria-modal="true" aria-labelledby="hp-title">
  <div class="hp-head">
    <strong id="hp-title"></strong>
    <span class="badge" id="hp-tally"></span>
    <button class="btn icon del" id="hp-close" type="button" aria-label="Fermer" title="Fermer">✕</button>
  </div>
  <div class="hp-top">
    <div class="hp-search">${SEARCH}<input id="hp-q" autocomplete="off" /></div>
    <div class="hp-filters" id="hp-filters"></div>
  </div>
  <div class="hp-body">
    <div class="hp-tiles" id="hp-results"></div>
    <div class="empty" id="hp-none" hidden></div>
  </div>
  <div class="hp-foot" id="hp-foot" hidden></div>
</div>`;

/** @param {unknown} v */
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
/** @param {string} slug */
const cap = (slug) => slug.charAt(0).toUpperCase() + slug.slice(1);
/**
 * @param {number} n
 * @param {string} word
 */
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

/** @param {string} id */
const el = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
const search = () => /** @type {HTMLInputElement} */ (document.getElementById('hp-q'));

/**
 * Le picker ouvert : ses options, ses filtres, et en multi-choix les ids cochés.
 * @type {{ opts: HeroPickerOptions, filters: HeroFilters, sel: string[] } | null}
 */
let open = null;

/** @param {string} path */
const src = (path) => `${esc(open?.opts.imgBase ?? '')}/images/${path}.webp`;
/**
 * L'icône d'un élément ou d'une classe : décorative, doublée par un nom.
 * @param {'element' | 'class'} kind
 * @param {string} slug
 * @param {string} [cls]
 */
const icon = (kind, slug, cls = '') =>
  `<img${cls ? ` class="${cls}"` : ''} src="${src(
    `ui/${kind === 'element' ? 'elem/IG_Turn_Element_' : 'class/IG_Turn_Class_'}${cap(esc(slug))}`,
  )}" alt="" aria-hidden="true" />`;

/** La rangée de filtres : les pastilles que le roster porte, puis le groupe `seg`. */
function filtersHtml() {
  if (!open) return '';
  const { opts, filters } = open;
  const elements = new Set(opts.roster.map((c) => c.element));
  const classes = new Set(opts.roster.map((c) => c.class));
  /**
   * @param {'element' | 'class'} kind
   * @param {string} slug
   * @param {boolean} on
   */
  const tog = (kind, slug, on) =>
    `<button class="hp-tog" type="button" data-${kind}="${slug}" aria-pressed="${on}" title="${cap(slug)}" aria-label="${cap(slug)}">${icon(kind, slug)}</button>`;
  return `<div class="hp-togs" role="group" aria-label="Élément">${ELEMENTS.filter((e) =>
    elements.has(e),
  )
    .map((e) => tog('element', e, filters.elements.has(e)))
    .join('')}</div><div class="hp-togs" role="group" aria-label="Classe">${CLASSES.filter((c) =>
    classes.has(c),
  )
    .map((c) => tog('class', c, filters.classes.has(c)))
    .join('')}</div>${
    opts.seg
      ? `<div class="hp-seg" role="group" aria-label="${esc(opts.seg.label)}">${opts.seg.options
          .map(
            ([value, text]) =>
              `<button type="button" data-seg="${esc(value)}" aria-pressed="${value === filters.seg}">${esc(text)}</button>`,
          )
          .join('')}</div>`
      : ''
  }`;
}

/** Les persos que montrent la recherche et les filtres, dans l'ordre du roster. */
function shown() {
  if (!open) return [];
  const { opts, filters } = open;
  const q = search().value.trim().toLowerCase();
  const { seg } = opts;
  return opts.roster.filter(
    (c) =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (!filters.elements.size || (c.element !== undefined && filters.elements.has(c.element))) &&
      (!filters.classes.size || (c.class !== undefined && filters.classes.has(c.class))) &&
      (!seg || seg.test(c, filters.seg)),
  );
}

/** @param {Hero} c */
function tile(c) {
  if (!open) return '';
  const { opts, sel } = open;
  const on = opts.multi ? sel.includes(c.id) : c.id === opts.chosen;
  const n = opts.count?.(c);
  const head = `<button class="hp-tile" type="button" data-id="${esc(c.id)}" title="${esc(opts.hint?.(c) ?? c.name)}"${
    opts.multi ? ` aria-pressed="${on}"` : on ? ' aria-current="true"' : ''
  }>`;
  if (opts.tile) return `${head}${opts.tile(c)}</button>`;
  return `${head}<span class="hp-ring${on ? ' on' : ''}"><img class="hp-fi" src="${src(
    `characters/faceicon/FI_${esc(c.id)}`,
  )}" alt="" aria-hidden="true" width="64" height="64" loading="lazy" />${
    c.element ? icon('element', c.element, 'hp-el') : ''
  }${
    opts.multi && on
      ? '<span class="hp-cnt">✓</span>'
      : n === undefined
        ? ''
        : `<span class="hp-cnt${n ? '' : ' zero'}">${n}</span>`
  }</span><span class="hp-n">${esc(c.name)}</span></button>`;
}

/** Le pied d'un multi-choix : les persos cochés, puis « Annuler » et « Valider ». */
function footHtml() {
  if (!open?.opts.multi) return '';
  const { opts, sel } = open;
  const names = sel.map((id) => opts.roster.find((c) => c.id === id)?.name ?? id);
  return `<div class="hp-recap"><span>${esc(names.length ? names.join(', ') : 'Aucun perso.')}</span></div><button class="btn ghost" type="button" data-hp="cancel">Annuler</button><button class="btn primary" type="button" data-hp="ok" title="Entrée dans la recherche, ou Ctrl + Entrée">Valider</button>`;
}

/** La grille, le badge et le pied ; `all` : la rangée de filtres aussi. */
function draw(all = false) {
  if (!open) return;
  const { opts, sel } = open;
  const rows = shown();
  // La tuile cliquée est redessinée : elle reprend le focus (clavier).
  const at = /** @type {HTMLElement | null | undefined} */ (
    document.activeElement?.closest('#hp-results .hp-tile')
  )?.dataset.id;
  el('hp-tally').textContent =
    opts.tally?.() ??
    (opts.multi
      ? `${plural(sel.length, 'choisi')} sur ${opts.roster.length}`
      : plural(opts.roster.length, 'perso'));
  if (all) el('hp-filters').innerHTML = filtersHtml();
  el('hp-results').innerHTML = rows.map(tile).join('');
  el('hp-none').hidden = rows.length > 0;
  el('hp-foot').innerHTML = footHtml();
  if (at !== undefined)
    /** @type {HTMLElement[]} */ ([...el('hp-results').children])
      .find((t) => t.dataset.id === at)
      ?.focus();
}

/** Ferme sans rien poser ; le focus revient à qui a ouvert. */
export function closeHeroPicker() {
  if (!open) return;
  const { opener } = open.opts;
  open = null;
  el('hp-modal').hidden = true;
  el('hp-foot').innerHTML = '';
  opener?.()?.focus();
}

/** « Valider » d'un multi-choix : les ids cochés, dans l'ordre des clics. */
function done() {
  if (!open) return;
  const { opts, sel } = open;
  closeHeroPicker();
  opts.onPick([...sel]);
}

/**
 * Une tuile choisie. Multi-choix : elle se coche ou se décoche. Choix unique :
 * `onPick` — la modale se ferme, sauf s'il rend `false`.
 * @param {string} id
 */
function pick(id) {
  if (!open) return;
  const { opts, sel } = open;
  if (opts.multi) {
    const at = sel.indexOf(id);
    if (at < 0) sel.push(id);
    else sel.splice(at, 1);
    return draw();
  }
  if (opts.onPick(id) !== false) closeHeroPicker();
}

/** @param {Element} tog Un bouton de la rangée de filtres. */
function toggle(tog) {
  if (!open) return;
  const { filters } = open;
  const data = /** @type {HTMLElement} */ (tog).dataset;
  if (data.seg !== undefined) {
    filters.seg = data.seg;
    for (const b of tog.parentElement?.children ?? [])
      b.setAttribute('aria-pressed', String(b === tog));
    return;
  }
  const [set, slug] = data.element
    ? [filters.elements, data.element]
    : [filters.classes, data.class ?? ''];
  if (!set.delete(slug)) set.add(slug);
  tog.setAttribute('aria-pressed', String(set.has(slug)));
}

/** La modale, posée dans `<body>` et branchée au premier appel. */
function mount() {
  const there = document.getElementById('hp-modal');
  if (there) return there;
  const modal = document.createElement('div');
  modal.className = 'hp-modal';
  modal.id = 'hp-modal';
  modal.hidden = true;
  modal.innerHTML = MARKUP;
  document.body.append(modal);

  el('hp-close').onclick = closeHeroPicker;
  search().oninput = () => draw();
  modal.onclick = (e) => {
    // Un clic sur le voile, hors du panneau, ferme.
    if (e.target === modal) return closeHeroPicker();
    if (!open) return;
    const target = /** @type {Element} */ (e.target);
    const hit = /** @type {HTMLElement | null} */ (target.closest('.hp-tile'));
    if (hit) return pick(hit.dataset.id ?? '');
    const act = /** @type {HTMLElement | null} */ (target.closest('[data-hp]'));
    if (act) return act.dataset.hp === 'ok' ? done() : closeHeroPicker();
    const tog = target.closest('#hp-filters button');
    if (!tog) return;
    toggle(tog);
    draw();
  };
  modal.onkeydown = (e) => {
    if (!open) return;
    if (e.key === 'Enter' && e.target === search()) {
      // Multi-choix : Entrée valide, comme « Valider » (Ctrl + Entrée aussi).
      // Choix unique : la première tuile de la grille.
      if (open.opts.multi) return done();
      const first = /** @type {HTMLElement | null} */ (el('hp-results').querySelector('.hp-tile'));
      if (first) pick(first.dataset.id ?? '');
      return;
    }
    // Tab reste dans le panneau.
    if (e.key !== 'Tab') return;
    const stops = /** @type {HTMLElement[]} */ ([
      ...modal.querySelectorAll('button:not([disabled]), input'),
    ]);
    const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
    if (document.activeElement !== edge) return;
    e.preventDefault();
    (e.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHeroPicker();
  });
  return modal;
}

/**
 * Ouvre le picker sur `opts.roster`. La recherche repart vide ; les filtres
 * sont ceux d'`opts.filters`, tels que la dernière ouverture les a laissés.
 * @param {HeroPickerOptions} opts
 */
export function openHeroPicker(opts) {
  const modal = mount();
  const chosen = opts.chosen;
  open = {
    opts,
    filters: opts.filters ?? shared,
    sel:
      opts.multi && chosen !== undefined
        ? [...(typeof chosen === 'string' ? [chosen] : chosen)]
        : [],
  };
  el('hp-title').textContent = opts.title;
  search().value = '';
  search().placeholder = opts.placeholder ?? PLACEHOLDER;
  search().setAttribute('aria-label', (opts.placeholder ?? PLACEHOLDER).replace(/…$/, ''));
  el('hp-none').textContent = opts.none ?? NONE;
  el('hp-results').classList.toggle('rows', Boolean(opts.rows));
  el('hp-foot').hidden = !opts.multi;
  modal.hidden = false;
  draw(true);
  search().focus();
}
