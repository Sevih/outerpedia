// Onglet « Tables du jeu » : les tables brutes du jeu (`.gamedata/parsed/`),
// celles que le code lit d'abord. Lecture seule : aucune route n'est postée d'ici.
import { $, esc, log, sections } from '../lib.js';

// `/api/gamedata/tables` : le catalogue dans l'ordre du serveur (les tables
// lues d'abord, par nombre de lecteurs), `usedBy` et `note` par table, et les
// colonnes de langue que le tableau ne montre pas (`hiddenColumns`).
let data = { tables: [], used: 0, readers: 0, hiddenColumns: [] };
let byName = new Map();
let hiddenColumns = new Set();
let current = null; // le nom de la table ouverte
// Sa dernière page servie (`/api/gamedata/table`) : le schéma, les lignes, les
// textes résolus, les liens croisés. La table reste au serveur (jusqu'à 18 Mo).
let page = null;
let selected = -1; // le rang, dans la page, de la ligne dont le brut est montré
let opening = -1; // celui que le hash demande, pris à la première page de la table
let filter = { q: '', col: '', exact: false, page: 1 };
let seq = 0;
let typing; // la frappe en attente dans la recherche
let copyTimer;
let loading = null; // le premier chargement du catalogue, lancé à la première venue
let wanted = null; // la table que le hash demandait au démarrage

/** Assez de suggestions pour choisir, pas le catalogue entier sous le champ. */
const MAX_HITS = 40;
/** La frappe de l'admin : la requête part 200 ms après la dernière touche. */
const TYPING_DELAY = 200;
const COPY = 'Copier';
/** Au-delà, une cellule risque d'être coupée (`.t-v`, 60 ch) : elle prend un `title`. */
const LONG_VALUE = 40;

/** Un compte et son nom, les milliers séparés (une table monte à 100 000 lignes). */
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('fr-FR')} ${n > 1 ? many : one}`;
/** Une valeur de l'objet, jamais un membre hérité (`constructor` est une clé de texte possible). */
const own = (o, key) => (Object.hasOwn(o, key) ? o[key] : undefined);

/** Taille de fichier lisible (les tables vont de 4 Ko à 18 Mo). */
const size = (bytes) =>
  bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} Mo`
    : bytes >= 1_000
      ? `${Math.round(bytes / 1_000)} Ko`
      : `${bytes} o`;

const when = (ms) =>
  ms
    ? `extraite le ${new Date(ms).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}`
    : 'date d’extraction inconnue';

/** Lue par N fichiers, ou par aucun : le badge d'une table. */
const usage = (t) =>
  t.usedBy.length
    ? `<span class="badge ok" title="Lue par ${plural(t.usedBy.length, 'fichier')}">utilisée · ${t.usedBy.length}</span>`
    : '<span class="lbl t-unread">jamais lue</span>';

/** Les `…` d'un docblock, en chasse fixe. */
const code = (text) => esc(text).replace(/`([^`]+)`/g, '<code>$1</code>');

// ------------------------------------------------------ l'adresse
const tableHash = (name) => `#gamedata/${encodeURIComponent(name)}`;

/**
 * Le lien croisé filtre la table cible sur sa clé primaire (`ID` partout), en
 * égalité STRICTE — en sous-chaîne, `ID=101` ramènerait aussi `1011` et `2101`.
 */
const linkHash = (target, id) => `${tableHash(target)}?col=ID&exact=1&q=${encodeURIComponent(id)}`;

/**
 * `#gamedata/<Table>` et son filtre facultatif (`?col=&exact=1&q=`), ou `null`.
 * `&row=<n>` y montre en plus la ligne brute de la n-ième ligne de la page, à
 * partir de 0 (le banc de captures ne clique pas).
 */
function parseHash(hash) {
  const m = /^#gamedata\/([^?]+)(?:\?(.*))?$/.exec(hash);
  if (!m) return null;
  const params = new URLSearchParams(m[2] ?? '');
  try {
    return {
      name: decodeURIComponent(m[1]),
      q: params.get('q') ?? '',
      col: params.get('col') ?? '',
      exact: params.get('exact') === '1',
      row: params.has('row') ? Number(params.get('row')) : -1,
    };
  } catch {
    return null;
  }
}

// ------------------------------------------------------ le sélecteur
/** Les tables dont le nom contient la saisie, dans l'ordre du serveur : les lues d'abord. */
function suggest() {
  const typed = $('t-pick').value.trim();
  // Le champ porte le nom de la table ouverte : y revenir propose tout.
  const q = typed === current ? '' : typed.toLowerCase();
  const hits = data.tables.filter((t) => t.name.toLowerCase().includes(q));
  const more = hits.length - MAX_HITS;
  $('t-results').innerHTML = hits.length
    ? hits
        .slice(0, MAX_HITS)
        .map(
          (t) =>
            `<div data-id="${esc(t.name)}"><span class="mono">${esc(t.name)}</span><span class="lbl">${size(t.bytes)}</span>${usage(t)}</div>`,
        )
        .join('') +
      (more > 0 ? `<p class="t-more">… ${plural(more, 'autre')} : préciser le nom.</p>` : '')
    : '<p class="t-more">Aucune table ne porte ce nom.</p>';
  $('t-results').hidden = !data.tables.length;
}

$('t-pick').oninput = suggest;
$('t-pick').onfocus = () => {
  $('t-pick').select();
  suggest();
};
$('t-pick').onkeydown = (e) => {
  if (e.key === 'Escape') $('t-results').hidden = true;
  // Entrée prend la première suggestion.
  if (e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  $('t-results').querySelector('[data-id]')?.click();
};
$('t-results').onclick = (e) => {
  const hit = e.target.closest('[data-id]');
  if (!hit) return;
  // La table ouverte est dans l'adresse : recharger y revient.
  history.replaceState(null, '', tableHash(hit.dataset.id));
  show(hit.dataset.id);
};
// Un clic ailleurs referme la liste.
document.addEventListener('click', (e) => {
  if (!$('t-picker').contains(e.target)) $('t-results').hidden = true;
});

function renderTotal() {
  $('t-total').textContent = data.tables.length
    ? `${plural(data.tables.length, 'table')} · ${plural(data.used, 'lue')} par ${plural(data.readers, 'fichier')}`
    : '';
}

// ------------------------------------------------------ la table choisie
/** Ce que la carte dit quand aucune table n'est montrée ; vide quand il y en a une. */
function nothing() {
  if (!data.tables.length) return data.error ?? 'Aucune table.';
  if (current === null)
    return `Choisir une table : taper son nom — les ${plural(data.used, 'table lue', 'tables lues')} par le code sortent d’abord.`;
  return byName.has(current) ? '' : `table inconnue : ${current}`;
}

function renderInfo() {
  const none = nothing();
  $('t-none').textContent = none;
  $('t-none').hidden = !none;
  $('t-info').hidden = Boolean(none);
  if (none) return;
  const t = byName.get(current);
  $('t-info').innerHTML =
    `<div class="t-id"><strong class="mono">${esc(t.name)}</strong>${usage(t)}<span class="lbl">${size(t.bytes)} · ${esc(when(t.mtimeMs))}</span><span class="lbl" id="t-shape"></span></div>` +
    (t.usedBy.length
      ? `<div class="chips">${t.usedBy.map((r) => `<span class="chip t-reader" title="${esc(r.path)}">${esc(r.name)}</span>`).join('')}</div><p class="t-note">${code(t.note)}</p>`
      : '<p class="t-note">Aucun fichier de datagen, de src/lib/data ni de scripts/quick ne lit cette table par son nom.</p>');
  renderShape();
}

/** Ce que seule la lecture de la table apprend : son nom interne, ses lignes, ses colonnes. */
function renderShape() {
  const shape = $('t-shape');
  if (!shape) return;
  shape.textContent = page
    ? [
        // Le nom interne du parser (`CAdventureTemplet`) diffère du fichier.
        page.table !== current ? page.table : '',
        plural(page.rowCount, 'ligne'),
        `${page.filled.length}/${page.columns.length} colonnes remplies`,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
}

// ------------------------------------------------------ la recherche dans la table
function renderBar() {
  // Avant la première page, le select ne connaît que la colonne du filtre.
  const columns = page?.columns ?? (filter.col ? [filter.col] : []);
  $('t-col').innerHTML =
    '<option value="">toutes les colonnes</option>' +
    columns.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  $('t-col').value = filter.col;
  // L'égalité stricte porte sur UNE colonne : sans elle, la case ne dit rien.
  $('t-exact').checked = filter.exact;
  $('t-exact').disabled = !filter.col;
  $('t-exact').parentElement.title = filter.col
    ? `Égalité stricte sur ${filter.col}, au lieu de la sous-chaîne`
    : 'Choisir une colonne : l’égalité stricte porte sur une colonne';
  const pages = page ? Math.max(1, Math.ceil(page.matched / page.pageSize)) : 1;
  $('t-count').textContent = page
    ? `${plural(page.matched, 'ligne')} sur ${page.rowCount.toLocaleString('fr-FR')}`
    : 'lecture…';
  $('t-page').textContent = page ? `page ${page.page} / ${pages}` : '';
  $('t-prev').disabled = !page || page.page <= 1;
  $('t-next').disabled = !page || page.page >= pages;
}

/**
 * Les colonnes du tableau : celles qu'au moins une ligne renseigne (toutes
 * avec « colonnes vides »), sans les colonnes de langue autres que l'anglais.
 * La ligne brute et le select de la recherche, eux, les gardent toutes.
 */
const shownColumns = () =>
  ($('t-blank').checked ? page.columns : page.filled).filter((c) => !hiddenColumns.has(c));

function cell(row, column) {
  const value = row[column] ?? '';
  const target = value ? own(page.links, column) : undefined;
  const text = own(page.texts, value);
  // Les colonnes `*IDs` portent une LISTE CSV : un lien par id, sinon on
  // filtrerait la cible sur « 1,2,3 ».
  const shown = target
    ? value
        .split(',')
        .map((id) => id.trim())
        .map(
          (id) =>
            `<a href="${esc(linkHash(target, id))}" data-table="${esc(target)}" data-id="${esc(id)}">${esc(id)}</a>`,
        )
        .join('<span class="t-sep">, </span>')
    : esc(value);
  // Une valeur longue est coupée à l'écran : le survol la rend entière.
  const full = value.length > LONG_VALUE ? ` title="${esc(value)}"` : '';
  return `<td><span class="t-v"${full}>${shown}</span>${
    text ? `<span class="t-text" title="${esc(text)}">${esc(text)}</span>` : ''
  }</td>`;
}

function renderRows() {
  if (!page) {
    $('t-head').innerHTML = $('t-rows').innerHTML = '';
    $('t-no-rows').hidden = true;
    return renderRaw();
  }
  const columns = shownColumns();
  $('t-head').innerHTML = `<tr>${columns
    .map((c) => {
      const target = own(page.links, c);
      return `<th>${esc(c)}${target ? `<span class="t-arrow" title="→ ${esc(target)}">↗</span>` : ''}</th>`;
    })
    .join('')}</tr>`;
  $('t-rows').innerHTML = page.rows
    .map(
      (row, i) =>
        `<tr data-i="${i}" tabindex="0" aria-selected="${i === selected}">${columns.map((c) => cell(row, c)).join('')}</tr>`,
    )
    .join('');
  $('t-no-rows').hidden = page.rows.length > 0;
  renderRaw();
}

// ------------------------------------------------------ la ligne brute
/** La ligne telle que le parser l'a produite : toutes ses colonnes, toutes ses langues. */
function renderRaw() {
  const row = page?.rows[selected];
  $('t-raw').hidden = !row;
  if (!row) return;
  const keys = Object.keys(row);
  $('t-raw-count').textContent = plural(keys.length, 'champ');
  $('t-kv').innerHTML = keys
    .map((k) => `<div class="t-pair"><dt>${esc(k)}</dt><dd>${esc(row[k])}</dd></div>`)
    .join('');
}

function select(i) {
  selected = i;
  for (const tr of $('t-rows').querySelectorAll('tr[data-i]'))
    tr.setAttribute('aria-selected', String(Number(tr.dataset.i) === selected));
  renderRaw();
}

$('t-rows').onclick = (e) => {
  const link = e.target.closest('a[data-table]');
  if (link) {
    // Ctrl, Maj, clic du milieu : le navigateur ouvre le lien ailleurs, par son adresse.
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    e.preventDefault();
    // Une entrée d'historique par lien suivi : « Précédent » revient à la table quittée.
    history.pushState(null, '', linkHash(link.dataset.table, link.dataset.id));
    show(link.dataset.table, { col: 'ID', exact: true, q: link.dataset.id });
    return;
  }
  const tr = e.target.closest('tr[data-i]');
  if (tr) select(Number(tr.dataset.i));
};
$('t-rows').onkeydown = (e) => {
  if ((e.key !== 'Enter' && e.key !== ' ') || !e.target.matches?.('tr[data-i]')) return;
  e.preventDefault();
  select(Number(e.target.dataset.i));
};

$('t-raw-close').onclick = () => select(-1);

/** « Copier » : le JSON de la ligne. Le bouton dit deux secondes ce qu'il en a été. */
$('t-copy').onclick = async () => {
  const row = page?.rows[selected];
  if (!row) return;
  let said = 'copié';
  try {
    await navigator.clipboard.writeText(JSON.stringify(row, null, 2));
  } catch {
    said = 'impossible';
  }
  $('t-copy').textContent = said;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => ($('t-copy').textContent = COPY), 2000);
};

// ------------------------------------------------------ la lecture
/** Une page de la table ouverte, d'après le filtre. Seule la DERNIÈRE demande se dessine. */
async function loadRows() {
  clearTimeout(typing);
  const mine = ++seq;
  const name = current;
  const params = new URLSearchParams({
    name,
    q: filter.q,
    col: filter.col,
    exact: filter.exact ? '1' : '0',
    page: String(filter.page),
    resolve: $('t-resolve').checked ? '1' : '0',
  });
  try {
    const res = await fetch(`/api/gamedata/table?${params}`);
    const out = await res.json();
    if (mine !== seq) return;
    if (!res.ok) throw new Error(out.error ?? out.log?.[0] ?? `réponse ${res.status}`);
    page = out;
    filter.page = out.page;
    selected = opening;
    opening = -1;
    renderShape();
    renderBar();
    renderRows();
  } catch (e) {
    if (mine === seq) log([`Table ${name} illisible : ${e}`], false);
  }
}

/** Montre la table `name`, sous le filtre `from` (celui d'un lien croisé), première page. */
function show(name, from = {}) {
  clearTimeout(typing);
  seq += 1; // une réponse de la table quittée ne se dessine plus
  current = name;
  page = null;
  selected = -1;
  const col = from.col ?? '';
  filter = { q: from.q ?? '', col, exact: Boolean(from.exact && col), page: 1 };
  opening = Number.isInteger(from.row) ? from.row : -1;
  $('t-pick').value = name;
  $('t-results').hidden = true;
  $('t-q').value = filter.q;
  renderInfo();
  const known = byName.has(name);
  $('t-card').hidden = !known;
  if (!known) return;
  renderBar();
  renderRows();
  loadRows();
}

$('t-q').oninput = () => {
  filter.q = $('t-q').value;
  filter.page = 1;
  clearTimeout(typing);
  typing = setTimeout(loadRows, TYPING_DELAY);
};
$('t-col').onchange = () => {
  filter.col = $('t-col').value;
  if (!filter.col) filter.exact = false;
  filter.page = 1;
  renderBar();
  loadRows();
};
$('t-exact').onchange = () => {
  filter.exact = $('t-exact').checked;
  filter.page = 1;
  loadRows();
};
$('t-resolve').onchange = loadRows;
$('t-blank').onchange = renderRows;
$('t-prev').onclick = () => {
  filter.page -= 1;
  loadRows();
};
$('t-next').onclick = () => {
  filter.page += 1;
  loadRows();
};

/** Le catalogue et l'usage ; `recompute` fait relire les sources au serveur. */
async function loadTables(recompute = false) {
  const res = await fetch(`/api/gamedata/tables${recompute ? '?recompute=1' : ''}`);
  const out = await res.json();
  if (!res.ok) throw new Error(out.error ?? out.log?.[0] ?? `réponse ${res.status}`);
  data = out;
  byName = new Map(data.tables.map((t) => [t.name, t]));
  hiddenColumns = new Set(data.hiddenColumns);
  renderTotal();
  renderInfo();
  if (current !== null) $('t-card').hidden = !byName.has(current);
}

$('t-recompute').onclick = async () => {
  const btn = $('t-recompute');
  btn.disabled = true;
  btn.classList.add('busy');
  try {
    await loadTables(true);
  } catch (e) {
    log([`Tables du jeu illisibles : ${e}`], false);
  } finally {
    btn.disabled = false;
    btn.classList.remove('busy');
  }
};

// « Précédent » du navigateur après un lien suivi : la table quittée revient.
window.addEventListener('popstate', () => {
  if ($('tab-gamedata').hidden) return;
  const to = parseHash(location.hash);
  if (to) show(to.name, to);
});

sections.register('gamedata', {
  init: () => {
    // `#gamedata/<Table>` ouvre l'onglet sur cette table (un lien croisé ouvert
    // ailleurs, le banc de captures). `lib.js` ne connaît que `#gamedata` :
    // c'est le clic sur l'onglet qui l'ouvre.
    wanted = parseHash(location.hash);
    if (wanted) {
      const hash = location.hash;
      document.querySelector('#tabs [data-tab="gamedata"]')?.click();
      // Le clic a réduit l'adresse à `#gamedata` : la table demandée y revient.
      history.replaceState(null, '', hash);
    }
  },
  // Rien n'est lu avant la première venue à l'écran : la passe sur les sources
  // et le catalogue n'ont pas à peser sur les autres onglets.
  open: () => {
    if (current !== null && byName.has(current)) history.replaceState(null, '', tableHash(current));
    loading ??= loadTables()
      .then(() => {
        if (wanted) show(wanted.name, wanted);
      })
      .catch((e) => {
        loading = null; // la prochaine venue réessaie
        $('t-none').textContent = 'Tables du jeu illisibles.';
        log([`Tables du jeu illisibles : ${e}`], false);
      });
  },
});
