// Onglet « Bannières » : les fenêtres de recrutement de la home (`banner.json`),
// et ce que la table du jeu en sait de plus.
import { $, esc, log, post, sections, state, stateLoaded } from '../lib.js';

// `/api/banners/state` : le fichier curé, le jour UTC, le roster, et le diff du
// serveur contre la table du jeu (`missing`, `drift` ; `game` à `null` et
// `gameError` tant qu'aucun pull n'a posé la table).
let data = { banners: [], today: '', roster: [], game: null, missing: [], drift: [] };
let names = new Map(); // id → nom complet anglais du roster
// La liste en cours d'édition. Une ligne : { key, id, name, start, end, was } —
// `was` est la bannière du disque dont elle vient, `null` pour une ligne ajoutée.
// Rien ne part tant que « Enregistrer » n'est pas cliqué, et tout part ensemble.
let rows = [];
let removed = []; // bannières du disque retirées, pas encore enregistrées
let issues = new Map(); // clé de ligne → le refus du dernier enregistrement
let offered = { missing: [], drift: [] }; // ce que la carte « Dans le jeu » propose
let seq = 0;
let drawnBase = state.imgBase; // la base du dernier dessin (cf. `init`)

const FIELDS = ['id', 'name', 'start', 'end'];
const DAY = 86_400_000;
/** Le `RecruitType` du jeu, tel que la carte le dit. */
const TYPES = {
  outer_fes: 'fes',
  seasonal_selection: 'seasonal · sélection',
  outer_fes_selection: 'fes · sélection',
};
/** Assez de suggestions pour choisir, pas le roster entier sous le champ. */
const MAX_HITS = 12;

// Le visage du jeu, comme dans Rangs ; décoratif, le nom est à côté.
const face = (id, px) =>
  `<img class="face" src="${esc(state.imgBase)}/images/characters/faceicon/FI_${esc(id)}.webp" alt="" aria-hidden="true" width="${px}" height="${px}" loading="lazy" />`;
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

// ------------------------------------------------------ le modèle
const fresh = (banner) => ({ key: ++seq, id: '', name: '', start: '', end: '', ...banner });

/** Une ligne ajoutée et laissée vide : elle ne compte pas, et ne part pas. */
const blank = (r) => FIELDS.every((f) => !r[f].trim());
const changed = (r) => (r.was ? FIELDS.some((f) => r[f] !== r.was[f]) : !blank(r));
const pending = () => rows.filter(changed).length + removed.length;

// Récent → ancien ; une ligne sans début (un brouillon) reste en tête. Le tri
// est stable : à début égal, l'ordre du fichier tient, et le diff reste court.
const byStartDesc = (a, b) => (b.start || '9999').localeCompare(a.start || '9999');

function resetRows() {
  rows = data.banners.map((b) => fresh({ ...b, was: b })).sort(byStartDesc);
  removed = [];
  issues = new Map();
}

// ------------------------------------------------------ le statut
/** Jours entiers de `a` à `b`. */
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

/** Le statut d'une fenêtre au jour UTC du serveur — la règle de la home. */
function statusOf(b) {
  if (!b.start || !b.end) return 'draft';
  if (b.start > data.today) return 'upcoming';
  if (b.end < data.today) return 'expired';
  return 'active';
}

function statusBadge(b) {
  const status = statusOf(b);
  if (status === 'draft')
    return '<span class="badge warn" title="Sans dates : refusée à l’enregistrement">brouillon</span>';
  if (status === 'upcoming')
    return `<span class="badge upcoming">à venir · dans ${days(data.today, b.start)} j</span>`;
  if (status === 'expired') return '<span class="badge expired">expirée</span>';
  const left = days(data.today, b.end);
  return `<span class="badge active">active · ${left ? `${left} j restant${left > 1 ? 's' : ''}` : 'dernier jour'}</span>`;
}

// ------------------------------------------------------ la carte « Dans le jeu »
const typeBadge = (type) => `<span class="badge">${esc(TYPES[type] ?? type)}</span>`;

// Un perso de la table que le site n'a pas intégré se montre, sans s'insérer :
// la home ne saurait pas l'afficher.
const OFF_ROSTER =
  '<span class="badge ko" title="Ce perso n’est pas dans le roster du site : la home ne saurait pas l’afficher.">hors roster</span>';

const missingLine = (w, i) =>
  `<li class="b-win">${face(w.characterId, 32)}<span class="b-name">${esc(names.get(w.characterId) ?? w.characterId)}</span>${w.unknown ? OFF_ROSTER : ''}${typeBadge(w.type)}<span class="b-period">${esc(w.start)} → ${esc(w.end)}</span>${statusBadge(w)}<button class="btn ghost sm" data-insert="${i}"${w.unknown ? ' disabled' : ''}>Insérer</button></li>`;

const driftLine = (d, i) =>
  `<li class="b-win">${face(d.id, 32)}<span class="b-name">${esc(d.row.name || d.name)}</span>${typeBadge(d.type)}<span class="b-period">${esc(d.start)} → fin curée <strong>${esc(d.row.end || 'vide')}</strong>, jeu <strong>${esc(d.game)}</strong></span><button class="btn ghost sm" data-align="${i}">Aligner sur le jeu</button></li>`;

/**
 * Ce que le serveur propose, moins ce que la liste en cours porte déjà : une
 * fenêtre insérée ou une fin alignée sont des changements en attente, elles
 * quittent la carte tout de suite — et y reviennent si la ligne est retirée.
 */
function renderGame() {
  const box = $('b-game');
  if (!data.game) {
    offered = { missing: [], drift: [] };
    $('b-game-count').innerHTML = '';
    $('b-insert-all').hidden = true;
    box.innerHTML = `<p class="b-note">${esc(data.gameError ?? 'Pas de données du jeu.')}</p>`;
    return;
  }
  offered = {
    missing: data.missing.filter(
      (w) => !rows.some((r) => r.id === w.characterId && r.start === w.start),
    ),
    drift: data.drift.flatMap((d) =>
      rows
        .filter((r) => r.id === d.id && r.start === d.start && r.end !== d.game)
        .map((row) => ({ ...d, row })),
    ),
  };
  const { missing, drift } = offered;
  $('b-game-count').innerHTML =
    (missing.length ? `<span class="badge edit">${missing.length} à insérer</span>` : '') +
    (drift.length ? `<span class="badge warn">${drift.length} à aligner</span>` : '');
  $('b-insert-all').hidden = !missing.some((w) => !w.unknown);
  box.innerHTML =
    missing.length || drift.length
      ? `<ul class="b-wins">${missing.map(missingLine).join('')}${drift.map(driftLine).join('')}</ul>`
      : '<p class="b-note">Les bannières du jeu sont toutes dans la liste.</p>';
}

/** Ajoute à la liste curée des fenêtres du jeu : le nom du roster, leurs dates. */
function insert(windows) {
  for (const w of windows) {
    if (!w || w.unknown) continue;
    rows.push(
      fresh({
        id: w.characterId,
        name: names.get(w.characterId) ?? '',
        start: w.start,
        end: w.end,
        was: null,
      }),
    );
  }
  rows.sort(byStartDesc);
  render();
}

$('b-game').onclick = (e) => {
  const ins = e.target.closest('[data-insert]');
  const ali = e.target.closest('[data-align]');
  if (ins) insert([offered.missing[Number(ins.dataset.insert)]]);
  else if (ali) {
    const d = offered.drift[Number(ali.dataset.align)];
    d.row.end = d.game;
    render();
  }
};

$('b-insert-all').onclick = () => insert(offered.missing);

// ------------------------------------------------------ la liste curée
/**
 * Une ligne expirée se masque, sauf si elle porte un changement ou un refus :
 * une fenêtre insérée ou alignée qui vient de finir ne disparaît pas sous le
 * clic.
 */
const shown = (r) =>
  !$('b-hide').checked || statusOf(r) !== 'expired' || changed(r) || issues.has(r.key);

const statusCell = (r) =>
  `<span class="b-badges">${statusBadge(r)}${
    changed(r) ? `<span class="badge edit">${r.was ? 'modifiée' : 'nouvelle'}</span>` : ''
  }${
    issues.has(r.key)
      ? `<span class="badge ko" title="${esc(issues.get(r.key))}">refusée</span>`
      : ''
  }</span>`;

const rowClass = (r) =>
  [statusOf(r) === 'expired' ? 'expired' : '', issues.has(r.key) ? 'ko' : '']
    .filter(Boolean)
    .join(' ');

// Une ligne ajoutée cherche d'abord son perso ; choisi, elle montre son visage
// et son nom, qui se retouche (c'est le nom affiché sur le site).
const who = (r) =>
  r.id
    ? `<div class="b-who">${face(r.id, 32)}<input class="w-search" data-f="name" value="${esc(r.name)}" aria-label="Nom affiché" autocomplete="off" /></div>`
    : `<div class="b-who picker"><input class="w-search" data-pick placeholder="Chercher un perso…" aria-label="Perso de la bannière" autocomplete="off" /><div class="results" hidden></div></div>`;

const rowHtml = (r) => `<tr data-key="${r.key}" class="${rowClass(r)}">
    <td>${who(r)}</td>
    <td><input type="date" data-f="start" value="${esc(r.start)}" aria-label="Début" /></td>
    <td><input type="date" data-f="end" value="${esc(r.end)}" aria-label="Fin" /></td>
    <td class="b-status">${statusCell(r)}</td>
    <td class="b-del"><button class="btn icon" data-del title="Retirer" aria-label="Retirer ${esc(r.name || 'la ligne')}">✕</button></td>
  </tr>`;

function renderSummary() {
  const count = (status) => rows.filter((r) => statusOf(r) === status).length;
  const badge = (status, cls, one, many) => {
    const n = count(status);
    return n ? `<span class="badge ${cls}">${n} ${n > 1 ? many : one}</span>` : '';
  };
  $('b-summary').innerHTML =
    `<strong>${plural(rows.length, 'bannière')}</strong>` +
    badge('active', 'active', 'active', 'actives') +
    badge('upcoming', 'upcoming', 'à venir', 'à venir') +
    badge('draft', 'warn', 'brouillon', 'brouillons') +
    badge('expired', 'expired', 'expirée', 'expirées');
}

function renderList() {
  const visible = rows.filter(shown);
  drawnBase = state.imgBase;
  $('b-list').innerHTML = visible.map(rowHtml).join('');
  renderSummary();
  const hidden = rows.length - visible.length;
  $('b-empty').hidden = visible.length > 0;
  $('b-empty').textContent = hidden
    ? `Aucune bannière active ou à venir — ${plural(hidden, 'expirée')} masquée${hidden > 1 ? 's' : ''}.`
    : 'Aucune bannière.';
}

function refreshBar() {
  const n = pending();
  const no = issues.size;
  $('b-count').innerHTML =
    (n
      ? `<span class="badge edit">${plural(n, 'changement')}</span>`
      : '<span>aucune modification</span>') +
    (no ? `<span class="badge ko">${no} refus</span>` : '');
  $('b-save').disabled = !n;
  // Une ligne ajoutée et encore vide ne compte pas, mais « Annuler » la retire.
  $('b-reset').disabled = !n && !rows.some((r) => !r.was);
}

function render() {
  renderGame();
  renderList();
  refreshBar();
}

// ------------------------------------------------------ la saisie
const rowOf = (el) => {
  const key = el?.closest('tr')?.dataset.key;
  return rows.find((r) => String(r.key) === key);
};

/** Les persos du roster dont le nom contient la saisie, ceux qui commencent par elle d'abord. */
function suggest(input) {
  const box = input.parentElement.querySelector('.results');
  const q = input.value.trim().toLowerCase();
  const starts = (c) => Number(!c.name.toLowerCase().startsWith(q));
  const hits =
    q.length < 2
      ? []
      : data.roster
          .filter((c) => c.name.toLowerCase().includes(q))
          .sort((a, b) => starts(a) - starts(b))
          .slice(0, MAX_HITS);
  box.innerHTML = hits
    .map((c) => `<div data-id="${esc(c.id)}">${face(c.id, 24)}<span>${esc(c.name)}</span></div>`)
    .join('');
  box.hidden = !hits.length;
}

$('b-list').oninput = (e) => {
  const el = e.target;
  const row = rowOf(el);
  if (!row) return;
  if (el.hasAttribute('data-pick')) return suggest(el);
  if (!el.dataset.f) return;
  row[el.dataset.f] = el.value;
  issues.delete(row.key);
  // La ligne n'est pas redessinée : le champ garde le curseur.
  const tr = el.closest('tr');
  tr.className = rowClass(row);
  tr.querySelector('.b-status').innerHTML = statusCell(row);
  renderSummary();
  renderGame();
  refreshBar();
};

$('b-list').onkeydown = (e) => {
  // Entrée dans la recherche prend la première suggestion.
  if (e.key !== 'Enter' || !e.target.hasAttribute('data-pick') || e.isComposing) return;
  e.preventDefault();
  e.target.parentElement.querySelector('.results [data-id]')?.click();
};

$('b-list').onclick = (e) => {
  const row = rowOf(e.target);
  if (!row) return;
  const hit = e.target.closest('.results [data-id]');
  if (hit) {
    row.id = hit.dataset.id;
    row.name = names.get(row.id) ?? '';
    issues.delete(row.key);
    render();
    // Le perso est posé : la suite est la période.
    $('b-list').querySelector(`tr[data-key="${row.key}"] [data-f="start"]`)?.focus();
  } else if (e.target.closest('[data-del]')) {
    rows = rows.filter((r) => r !== row);
    if (row.was) removed.push(row.was);
    issues.delete(row.key);
    render();
  }
};

$('b-add').onclick = () => {
  rows.unshift(fresh({ was: null }));
  render();
  $('b-list').querySelector('[data-pick]')?.focus();
};

$('b-hide').onchange = renderList;

$('b-reset').onclick = () => {
  resetRows();
  render();
};

// ------------------------------------------------------ le disque
async function loadBanners() {
  data = await (await fetch('/api/banners/state')).json();
  names = new Map(data.roster.map((c) => [c.id, c.name]));
  resetRows();
}

$('b-save').onclick = async () => {
  if (!pending()) return;
  // La liste est l'ÉTAT COMPLET, dans l'ordre du fichier : récent → ancien.
  const sent = rows.filter((r) => !blank(r)).sort(byStartDesc);
  const moved = [...rows.filter(changed).map((r) => r.name), ...removed.map((b) => b.name)];
  $('b-save').disabled = $('b-reset').disabled = true;
  $('b-save').classList.add('busy');
  log([], undefined, 'envoi des bannières au serveur');
  try {
    const r = await post('/api/banners', {
      list: sent.map(({ id, name, start, end }) => ({ id, name, start, end })),
      changed: moved,
    });
    // Un refus de validation n'a rien écrit : les changements restent en
    // attente, la ligne fautive est marquée. Sinon le disque fait foi, que R2
    // ou git aient suivi ou non : on le relit, et la détection avec lui.
    issues = new Map();
    for (const issue of r.issues ?? []) {
      const key = sent[issue.index]?.key;
      if (key !== undefined)
        issues.set(key, [issues.get(key), issue.message].filter(Boolean).join(' ; '));
    }
    if (r.written) await loadBanners();
  } catch (e) {
    log([`Enregistrement des bannières interrompu : ${e}`], false);
  } finally {
    $('b-save').classList.remove('busy');
    render();
  }
};

/** Quitter l'onglet avec des changements en attente : sur confirmation. */
function bannersLeave() {
  const n = pending();
  return (
    !n ||
    confirm(
      `${plural(n, 'changement')} pas encore enregistré${n > 1 ? 's' : ''}. Quitter l’onglet ? ${n > 1 ? 'Ils restent' : 'Il reste'} en attente tant que la page n’est pas rechargée.`,
    )
  );
}

sections.register('banners', {
  init: () => {
    // Les visages sont sous `imgBase`, connu avec `/api/state` : redessinés si
    // l'état en annonce une autre.
    stateLoaded.then(() => {
      if (state.imgBase !== drawnBase && data.today) render();
    });
    return loadBanners()
      .then(render)
      .catch((e) => log([`Bannières illisibles : ${e}`], false));
  },
  // Des changements en attente ne survivent pas à un rechargement de la page.
  dirty: () => pending(),
  canLeave: bannersLeave,
});
