// Onglet « Rangs ».
import { $, esc, log, post, sections, state, stateLoaded } from '../lib.js';

let ranks = { rows: [], tiers: [], eeTiers: [], roles: [], steps: [] };
let byId = new Map();
// Cellules modifiées, pas encore envoyées : clé de cellule → changement.
// Rien ne part tant que « Enregistrer » n'est pas cliqué.
const edits = new Map();
let refused = new Set(); // cellules écartées au dernier enregistrement
const TABLES = [
  ['rankByTranscend', 'Rang PvE'],
  ['roleByTranscend', 'Rôle'],
];
// Le nom de chaque menu pour un lecteur d'écran : sa colonne, puis le perso.
const COLUMNS = {
  role: 'Rôle',
  rank: 'PvE',
  rankPvp: 'PvP',
  eeRank: 'EE base',
  eeRank10: 'EE +10',
  ...Object.fromEntries(TABLES),
};

const cellKey = (id, field, step) => `${id}|${field}${step ? `.${step}` : ''}`;
const baseOf = (row, field, step) => (step ? row[field][step] : row[field]) ?? '';
const valueOf = (row, field, step) =>
  edits.get(cellKey(row.id, field, step))?.to ?? baseOf(row, field, step);
const listOf = (field) =>
  field === 'role' || field === 'roleByTranscend'
    ? ranks.roles
    : field.startsWith('ee')
      ? ranks.eeTiers
      : ranks.tiers;
const isRank = (field) => listOf(field) !== ranks.roles;
const stepLabel = (key) => ranks.steps.find((s) => s.key === key)?.label ?? `Trans ${key}`;

// Paliers d'une table qui portent une valeur, modifications comprises. Une
// clé héritée hors des paliers pleins y reste : elle n'est pas éditable ici
// mais elle compte dans l'escalier, donc elle se montre.
const stepsOf = (row, field) =>
  [...new Set([...Object.keys(row[field]), ...ranks.steps.map((s) => s.key)])]
    .filter((k) => valueOf(row, field, k))
    .sort((a, b) => a - b);
const hasTrans = (row) => TABLES.some(([f]) => stepsOf(row, f).length);
const isDirty = (row) => [...edits.values()].some((e) => e.id === row.id);

// ------------------------------------------------------ images du jeu
// Les mêmes fichiers que le site (`src/lib/images.ts`), sous `imgBase`.
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const src = (path) => `${esc(state.imgBase)}/images/${path}.webp`;
const rankSrc = (v) => src(`ui/rank/IG_Event_Rank_${v}`);
let drawnBase = state.imgBase; // la base du dernier dessin (cf. `init`)

/**
 * Élément, classe, sous-classe : l'icône et son nom. L'`alt` porte le nom, le
 * texte à côté est donc caché aux lecteurs d'écran (lu une fois) — et replié
 * en fenêtre étroite, où l'icône reste seule avec son `title`.
 */
const trait = (file, slug) =>
  slug
    ? `<span class="lab"><img class="ic" src="${src(`ui/${file}${cap(slug)}`)}" alt="${esc(cap(slug))}" title="${esc(cap(slug))}" width="20" height="20" loading="lazy" /><span aria-hidden="true">${esc(cap(slug))}</span></span>`
    : '';

const star = () =>
  `<img class="star" src="${src('ui/star/CM_icon_star_y')}" alt="" width="14" height="14" loading="lazy" />`;
const stars = (n) => {
  const label = `${n} étoile${n > 1 ? 's' : ''}`;
  return `<span class="stars" role="img" aria-label="${label}" title="${label}">${star().repeat(n)}</span>`;
};
// « 5★ » : l'étoile du jeu devant le chiffre ; un autre libellé reste du texte.
const stepMark = (label) =>
  label.endsWith('★') ? `${star()}${esc(label.slice(0, -1))}` : esc(label);

// L'icône d'un rang de l'échelle ; vide ou hors échelle, pas d'image.
const rankIcon = (v) =>
  ranks.tiers.includes(v)
    ? `<img class="rkico" src="${rankSrc(v)}" alt="" aria-hidden="true" width="22" height="22" loading="lazy" />`
    : `<img class="rkico" alt="" aria-hidden="true" width="22" height="22" hidden />`;

const CHEVRON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>';

/**
 * Une cellule éditable : un `select` natif (Tab, flèches, première lettre),
 * l'icône du rang posée dans son cadre, et le point d'une cellule modifiée.
 */
function cell(row, field, step) {
  const key = cellKey(row.id, field, step);
  const cur = valueOf(row, field, step);
  const list = listOf(field);
  // Valeur héritée hors liste : gardée dans le menu pour ne pas la perdre.
  const extra = [...new Set([baseOf(row, field, step), cur])].filter((v) => v && !list.includes(v));
  const cls = [edits.has(key) && 'dirty', refused.has(key) && 'refused'].filter(Boolean).join(' ');
  const name = `${COLUMNS[field]}${step ? ` à ${stepLabel(step)}` : ''} — ${row.name}`;
  return `<span class="cell${isRank(field) ? ' rk' : ''}">${
    isRank(field) ? rankIcon(cur) : ''
  }<select class="${cls}" data-id="${row.id}" data-field="${field}"${
    step ? ` data-step="${step}"` : ''
  } aria-label="${esc(name)}"${
    refused.has(key) ? ' title="Refusée : la valeur avait changé sur le disque."' : ''
  }>${['', ...extra, ...list]
    .map(
      (v) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(v) || '—'}</option>`,
    )
    .join('')}</select><i class="pt" aria-hidden="true"></i></span>`;
}

const badge = (row) =>
  TABLES.map(([f, label]) => [label.toLowerCase(), stepsOf(row, f)])
    .filter(([, steps]) => steps.length)
    .map(([label, steps]) => `${label} ${steps.map(stepLabel).join(' ')}`)
    .join(' · ');

// Les lignes par transcendance d'un perso : une par palier plein, dans la
// grille de la table (le rôle sous « Rôle », le rang PvE sous « PvE »), puis
// la ligne qui dit comment un palier vide hérite.
function subRow(row) {
  const legacy = TABLES.flatMap(([f, label]) =>
    Object.keys(row[f])
      .filter((k) => !ranks.steps.some((s) => s.key === k))
      .map((k) => `${label} ${stepLabel(k)} : ${esc(row[f][k])}`),
  );
  return `${ranks.steps
    .map(
      (s) => `<tr class="sub" data-sub="${row.id}">
    <td></td>
    <td class="step"><span class="lab">${stepMark(s.label)}</span></td>
    <td colspan="4"></td>
    <td>${cell(row, 'roleByTranscend', s.key)}</td>
    <td>${cell(row, 'rankByTranscend', s.key)}</td>
    <td colspan="3"></td>
  </tr>`,
    )
    .join('')}<tr class="sub note" data-sub="${row.id}"><td></td><td colspan="10">
    <p class="hint">
      Vide = palier non noté : il hérite du palier noté en dessous, sinon de la ligne.${
        legacy.length
          ? ` Hérité hors paliers pleins, conservé tel quel : ${legacy.join(', ')}.`
          : ''
      }
    </p>
  </td></tr>`;
}

function mainRow(row, open) {
  return `<tr data-row="${row.id}">
    <td class="fold"><button class="btn icon disclose" type="button" data-fold="${row.id}" aria-expanded="${open}" aria-label="Réglages par transcendance — ${esc(row.name)}" title="Réglages par transcendance">${CHEVRON}</button></td>
    <td class="perso"><div class="who"><img class="face" src="${src(`characters/faceicon/FI_${row.id}`)}" alt="" aria-hidden="true" width="36" height="36" loading="lazy" /><span class="name">${esc(row.name)} <span class="badge edit" data-badge="${row.id}">${badge(row)}</span></span></div></td>
    <td>${trait('elem/IG_Turn_Element_', row.element)}</td>
    <td>${trait('class/IG_Turn_Class_', row.class)}</td>
    <td class="dim">${trait('class/CM_Sub_Class_', row.subClass)}</td>
    <td>${stars(row.rarity)}</td>
    <td>${cell(row, 'role')}</td>
    <td>${cell(row, 'rank')}</td>
    <td>${cell(row, 'rankPvp')}</td>
    <td>${row.hasEe ? cell(row, 'eeRank') : ''}</td>
    <td>${row.hasEe ? cell(row, 'eeRank10') : ''}</td>
  </tr>`;
}

function shown(row) {
  const q = $('r-q').value.trim().toLowerCase();
  if (q && !row.name.toLowerCase().includes(q)) return false;
  const col = $('r-col').value;
  const rank = $('r-rank').value; // '' = tous, '-' = sans rang
  if (rank) {
    if (col.startsWith('ee') && !row.hasEe) return false;
    const v = valueOf(row, col);
    if (rank === '-' ? v : v !== rank) return false;
  }
  const role = $('r-role').value;
  if (role && (role === '-' ? valueOf(row, 'role') : valueOf(row, 'role') !== role)) return false;
  if ($('r-trans').checked && !hasTrans(row)) return false;
  if ($('r-dirty').checked && !isDirty(row)) return false;
  return true;
}

function refreshBar() {
  const rows = $('r-list').querySelectorAll('tr[data-row]').length;
  const n = edits.size;
  const no = refused.size;
  $('r-count').innerHTML =
    `<strong>${rows} / ${ranks.rows.length} persos</strong>` +
    (n
      ? `<span class="badge edit">${n} modification${n > 1 ? 's' : ''}</span>`
      : '<span>aucune modification</span>') +
    (no ? `<span class="badge ko">${no} refus</span>` : '');
  $('r-save').disabled = $('r-reset').disabled = !n;
  $('r-empty').hidden = rows > 0;
  $('r-shown').textContent =
    `${rows} ligne${rows > 1 ? 's' : ''} montrée${rows > 1 ? 's' : ''} sur ${ranks.rows.length}`;
}

// Le tableau n'est redessiné que quand un FILTRE change (ou au rechargement) :
// choisir une valeur ne retouche que sa cellule, sinon la ligne qu'on vient
// de régler sortirait du filtre sous le curseur.
function renderRanks() {
  const open = new Set(
    [...$('r-list').querySelectorAll('tr[data-sub]')].map((tr) => tr.dataset.sub),
  );
  drawnBase = state.imgBase;
  $('r-list').innerHTML = ranks.rows
    .filter(shown)
    .map((row) => mainRow(row, open.has(row.id)) + (open.has(row.id) ? subRow(row) : ''))
    .join('');
  refreshBar();
}

// Le pied de la carte : l'échelle des rangs en icônes, du plus bas au plus haut.
function renderScale() {
  const scale = [...ranks.tiers].reverse();
  $('r-scale').innerHTML =
    `Échelle des rangs, de ${esc(scale[0])} à ${esc(scale.at(-1))} : ` +
    scale
      .map(
        (v) =>
          `<img src="${rankSrc(v)}" alt="${esc(v)}" title="${esc(v)}" width="22" height="22" loading="lazy" />`,
      )
      .join('');
}

$('r-list').onclick = (e) => {
  const b = e.target.closest('[data-fold]');
  if (!b) return;
  const subs = $('r-list').querySelectorAll(`tr[data-sub="${b.dataset.fold}"]`);
  if (subs.length) for (const tr of subs) tr.remove();
  else {
    const holder = document.createElement('tbody');
    holder.innerHTML = subRow(byId.get(b.dataset.fold));
    b.closest('tr').after(...holder.children);
  }
  b.setAttribute('aria-expanded', String(!subs.length));
};

$('r-list').onchange = (e) => {
  const s = e.target.closest('select[data-field]');
  if (!s) return;
  const { id, field, step } = s.dataset;
  const row = byId.get(id);
  const key = cellKey(id, field, step);
  const from = baseOf(row, field, step);
  if (s.value === from) edits.delete(key);
  else edits.set(key, { id, field, step, from, to: s.value });
  refused.delete(key);
  s.className = edits.has(key) ? 'dirty' : '';
  s.removeAttribute('title');
  // L'icône du rang suit le menu.
  const icon = s.parentElement.querySelector('.rkico');
  if (icon) {
    icon.hidden = !ranks.tiers.includes(s.value);
    if (!icon.hidden) icon.src = rankSrc(s.value);
  }
  $('r-list').querySelector(`[data-badge="${id}"]`).textContent = badge(row);
  refreshBar();
};

for (const id of ['r-q', 'r-col', 'r-rank', 'r-role', 'r-trans', 'r-dirty'])
  $(id).oninput = renderRanks;

async function loadRanks() {
  ranks = await (await fetch('/api/ranks')).json();
  byId = new Map(ranks.rows.map((r) => [r.id, r]));
  const opts = (list, none) =>
    `<option value="">tous</option>${list
      .map((v) => `<option>${v}</option>`)
      .join('')}<option value="-">${none}</option>`;
  $('r-rank').innerHTML = opts(ranks.tiers, 'sans rang');
  $('r-role').innerHTML = opts(ranks.roles, 'sans rôle');
  renderScale();
  renderRanks();
}

$('r-reset').onclick = () => {
  edits.clear();
  refused.clear();
  renderRanks();
};

$('r-save').onclick = async () => {
  if (!edits.size) return;
  $('r-save').disabled = $('r-reset').disabled = true;
  $('r-save').classList.add('busy');
  log([], undefined, 'envoi des rangs au serveur');
  try {
    const r = await post('/api/ranks', { changes: [...edits.values()] });
    // Le disque fait foi, que tout soit passé ou non : on le relit. Une
    // cellule enregistrée ou refusée n'est plus « modifiée » (la refusée
    // montre la valeur du disque, cerclée) ; celle qui n'a pas été traitée
    // — échec avant écriture — reste en attente, rien n'est à ressaisir.
    refused = new Set((r.refused ?? []).map((c) => cellKey(c.id, c.field, c.step)));
    ranks = await (await fetch('/api/ranks')).json();
    byId = new Map(ranks.rows.map((row) => [row.id, row]));
    for (const [key, e] of [...edits]) {
      const row = byId.get(e.id);
      if (refused.has(key) || !row || baseOf(row, e.field, e.step) === e.to) edits.delete(key);
    }
  } finally {
    $('r-save').classList.remove('busy');
    renderRanks();
  }
};

sections.register('ranks', {
  // Les rangs se lisent du disque : ils n'attendent pas R2 comme `/api/state`.
  // Les images, elles, viennent de `imgBase`, connu avec `/api/state` : la
  // table est dessinée avant, sur la base par défaut, et redessinée si l'état
  // en annonce une autre.
  init: () => {
    stateLoaded.then(() => {
      if (state.imgBase === drawnBase || !ranks.rows.length) return;
      renderScale();
      renderRanks();
    });
    return loadRanks().catch((e) => log([`Rangs illisibles : ${e}`], false));
  },
  // Des cellules en attente ne survivent pas à un rechargement de la page.
  dirty: () => edits.size,
});
