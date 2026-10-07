// Onglet « Rangs ».
import { $, esc, log, post, sections } from '../lib.js';

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

function cell(row, field, step) {
  const key = cellKey(row.id, field, step);
  const cur = valueOf(row, field, step);
  const list = listOf(field);
  // Valeur héritée hors liste : gardée dans le menu pour ne pas la perdre.
  const extra = [...new Set([baseOf(row, field, step), cur])].filter((v) => v && !list.includes(v));
  const cls = [edits.has(key) && 'dirty', refused.has(key) && 'refused'].filter(Boolean).join(' ');
  return `<select class="${cls}" data-id="${row.id}" data-field="${field}"${
    step ? ` data-step="${step}"` : ''
  }${refused.has(key) ? ' title="Refusée : la valeur avait changé sur le disque."' : ''}>${[
    '',
    ...extra,
    ...list,
  ]
    .map(
      (v) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(v) || '—'}</option>`,
    )
    .join('')}</select>`;
}

const badge = (row) =>
  TABLES.map(([f, label]) => [label.toLowerCase(), stepsOf(row, f)])
    .filter(([, steps]) => steps.length)
    .map(([label, steps]) => `${label} ${steps.map(stepLabel).join(' ')}`)
    .join(' · ');

function subRow(row) {
  const legacy = TABLES.flatMap(([f, label]) =>
    Object.keys(row[f])
      .filter((k) => !ranks.steps.some((s) => s.key === k))
      .map((k) => `${label} ${stepLabel(k)} : ${esc(row[f][k])}`),
  );
  return `<tr class="sub" data-sub="${row.id}"><td></td><td colspan="9">
    <table>
      <tr><th></th>${ranks.steps.map((s) => `<th>${s.label}</th>`).join('')}</tr>
      ${TABLES.map(
        ([f, label]) =>
          `<tr><td>${label}</td>${ranks.steps.map((s) => `<td>${cell(row, f, s.key)}</td>`).join('')}</tr>`,
      ).join('')}
    </table>
    <p class="hint" style="margin: 6px 8px 0">
      Vide = palier non noté : il hérite du palier noté en dessous, sinon de la ligne.${
        legacy.length
          ? ` Hérité hors paliers pleins, conservé tel quel : ${legacy.join(', ')}.`
          : ''
      }
    </p>
  </td></tr>`;
}

function mainRow(row) {
  return `<tr data-row="${row.id}">
    <td><button class="ghost" data-fold="${row.id}" title="Réglages par transcendance">▸</button></td>
    <td>${esc(row.name)}<span class="badge" data-badge="${row.id}">${badge(row)}</span></td>
    <td class="cap">${esc(row.element)}</td>
    <td class="cap">${esc(row.class)}</td>
    <td>${row.rarity}★</td>
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
  $('r-count').textContent =
    `${rows} / ${ranks.rows.length} persos · ` +
    (n ? `${n} cellule${n > 1 ? 's' : ''} modifiée${n > 1 ? 's' : ''}` : 'aucune modification');
  $('r-save').disabled = $('r-reset').disabled = !n;
}

// Le tableau n'est redessiné que quand un FILTRE change (ou au rechargement) :
// choisir une valeur ne retouche que sa cellule, sinon la ligne qu'on vient
// de régler sortirait du filtre sous le curseur.
function renderRanks() {
  const open = new Set(
    [...$('r-list').querySelectorAll('tr[data-sub]')].map((tr) => tr.dataset.sub),
  );
  $('r-list').innerHTML = ranks.rows
    .filter(shown)
    .map((row) => mainRow(row) + (open.has(row.id) ? subRow(row) : ''))
    .join('');
  for (const id of open) {
    const b = $('r-list').querySelector(`[data-fold="${id}"]`);
    if (b) b.textContent = '▾';
  }
  refreshBar();
}

$('r-list').onclick = (e) => {
  const b = e.target.closest('[data-fold]');
  if (!b) return;
  const sub = $('r-list').querySelector(`tr[data-sub="${b.dataset.fold}"]`);
  if (sub) sub.remove();
  else {
    const holder = document.createElement('tbody');
    holder.innerHTML = subRow(byId.get(b.dataset.fold));
    b.closest('tr').after(holder.firstElementChild);
  }
  b.textContent = sub ? '▸' : '▾';
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
    renderRanks();
  }
};

sections.register('ranks', {
  // Les rangs se lisent du disque : ils n'attendent pas R2 comme `/api/state`.
  init: () => loadRanks().catch((e) => log([`Rangs illisibles : ${e}`], false)),
  // Des cellules en attente ne survivent pas à un rechargement de la page.
  dirty: () => edits.size,
});
