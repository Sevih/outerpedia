// Onglet « Noms » : le nom court d'affichage et les alias de recherche.
import { $, esc, log, post, sections, state, stateLoaded } from '../lib.js';

let names = { rows: [], langs: [], width: 80 };
let byId = new Map();
let current = null; // l'id du perso dont la fiche est montrée
// Persos modifiés, pas encore envoyés : id → { short, aliases, draft }. Rien ne
// part tant que « Enregistrer » n'est pas cliqué, et tous partent ensemble.
const edits = new Map();
let refused = new Set(); // persos écartés au dernier enregistrement
// Le verdict du site, par TEXTE : la règle ne dépend que du nom. Posé par
// `/api/names/state` (les noms courts du disque), complété par
// `/api/names/fit` à la saisie — la page ne mesure rien elle-même.
const verdicts = new Map();
let drawnBase = state.imgBase; // la base du dernier dessin (cf. `init`)

/** La langue de repli du site (`lRec`) : le nom court anglais sert aux autres. */
const FALLBACK = 'en';
/** Le délai de l'aperçu de Gear reco : le verdict part après la dernière frappe. */
const FIT_DELAY = 300;

const src = (path) => `${esc(state.imgBase)}/images/${path}.webp`;
// Le visage du jeu, comme dans Rangs ; décoratif, le nom est à côté.
const face = (id, px) =>
  `<img class="face" src="${src(`characters/faceicon/FI_${esc(id)}`)}" alt="" aria-hidden="true" width="${px}" height="${px}" loading="lazy" />`;
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

// ------------------------------------------------------ le modèle
/** Ce que la fiche montre d'un perso : sa copie de travail, sinon le disque. */
const workOf = (row) => edits.get(row.id) ?? { short: row.short, aliases: row.aliases, draft: '' };

/** La copie de travail d'un perso, créée à sa première modification. */
function touch(id) {
  const row = byId.get(id);
  if (!edits.has(id))
    edits.set(id, { short: { ...row.short }, aliases: [...row.aliases], draft: '' });
  return edits.get(id);
}

// Ce qui partirait : les langues saisies (un champ blanc n'est pas un nom), et
// le texte encore DANS le champ d'alias — « taper puis Enregistrer » sans
// Entrée envoyait une liste vide dans l'admin, donc supprimait la clé.
const shortOf = (w) =>
  Object.fromEntries(
    names.langs.filter((l) => (w.short[l] ?? '').trim()).map((l) => [l, w.short[l]]),
  );
const aliasesOf = (w) => (w.draft.trim() ? [...w.aliases, w.draft.trim()] : w.aliases);

function changed(id) {
  const w = edits.get(id);
  const row = byId.get(id);
  if (!w || !row) return false;
  const short = shortOf(w);
  const aliases = aliasesOf(w);
  return (
    names.langs.some((l) => (short[l] ?? '') !== (row.short[l] ?? '')) ||
    aliases.length !== row.aliases.length ||
    aliases.some((a, i) => a !== row.aliases[i])
  );
}

/** Le nom court EFFECTIF d'une langue : le sien, sinon l'anglais ; '' sans aucun. */
const effective = (short, lang) => (short[lang] ?? '').trim() || (short[FALLBACK] ?? '').trim();

// L'état d'un perso SUR LE DISQUE, d'après le verdict du serveur : la liste et
// les badges ne suivent la saisie qu'une fois le lot enregistré et relu.
const tooLong = (row) => names.langs.some((l) => row.fits.short[l] === false);
const hasShort = (row) => Object.keys(row.short).length > 0;
const statusOf = (row) =>
  row.todo ? 'todo' : tooLong(row) ? 'long' : hasShort(row) ? 'short' : '';
const STATUS = {
  todo: ['ko', 'déborde', 'Un nom complet déborde, sans nom court qui tienne'],
  long: ['warn', 'court trop long', 'Le nom court déborde dans une langue'],
  short: ['ok', 'court', 'Un nom court, qui tient'],
};
const statusBadge = (row) => {
  const [tone, text, title] = STATUS[statusOf(row)] ?? [];
  return tone ? `<span class="badge ${tone}" title="${title}">${text}</span>` : '';
};

const FILTERS = {
  todo: (row) => row.todo,
  long: tooLong,
  short: hasShort,
  alias: (row) => row.aliases.length > 0,
  all: () => true,
};

// ------------------------------------------------------ la liste
function shown(row) {
  const q = $('n-q').value.trim().toLowerCase();
  if (
    q &&
    !row.name.toLowerCase().includes(q) &&
    ![...row.base, ...row.aliases].some((t) => t.toLowerCase().includes(q))
  )
    return false;
  // Le perso ouvert garde sa ligne : enregistré, il sortirait de « À traiter »
  // sous le curseur.
  return row.id === current || FILTERS[$('n-state').value](row);
}

// À traiter d'abord, puis les noms courts trop longs, puis par nom.
const RANK = { todo: 0, long: 1 };
const byStatus = (a, b) =>
  (RANK[statusOf(a)] ?? 2) - (RANK[statusOf(b)] ?? 2) || a.name.localeCompare(b.name);

/** Le point d'une ligne : rouge = refusée au dernier enregistrement, accent = modifiée. */
const dot = (id) =>
  refused.has(id)
    ? '<i class="pt ko" role="img" aria-label="refusé" title="Refusé : le disque avait changé."></i>'
    : changed(id)
      ? '<i class="pt edit" role="img" aria-label="modifié" title="Modifié, pas encore enregistré"></i>'
      : '';

const rowButton = (id) =>
  [...$('n-list').querySelectorAll('.n-row')].find((b) => b.dataset.id === id);

function renderList() {
  const list = $('n-list');
  const focused = list.contains(document.activeElement) ? document.activeElement.dataset.id : null;
  const rows = names.rows.filter(shown).sort(byStatus);
  drawnBase = state.imgBase;
  list.innerHTML = rows
    .map(
      (row) =>
        `<li><button type="button" class="n-row" data-id="${esc(row.id)}" aria-current="${row.id === current}">${face(row.id, 32)}<span class="n-name">${esc(row.name)}</span>${statusBadge(row)}<span class="n-pt">${dot(row.id)}</span></button></li>`,
    )
    .join('');
  if (focused) rowButton(focused)?.focus();
  const todo = names.rows.filter((r) => r.todo).length;
  $('n-total').innerHTML = `<strong>${todo} à traiter</strong> sur ${names.rows.length}`;
  $('n-empty').hidden = rows.length > 0;
  $('n-empty').textContent =
    $('n-state').value === 'todo' && !$('n-q').value.trim()
      ? 'Aucun perso à traiter : chaque nom tient sous la carte, au besoin par son nom court.'
      : 'Aucun perso ne passe les filtres.';
}

function refreshBar() {
  const n = edits.size;
  const no = refused.size;
  $('n-count').innerHTML =
    (n
      ? `<span class="badge edit">${plural(n, 'perso')} modifié${n > 1 ? 's' : ''}</span>`
      : '<span>aucune modification</span>') +
    (no ? `<span class="badge ko">${no} refus</span>` : '');
  $('n-save').disabled = $('n-reset').disabled = !n;
}

// ------------------------------------------------------ la fiche
const fitBadge = (fits) =>
  fits === null
    ? '<span class="badge off">—</span>'
    : fits === undefined
      ? '<span class="badge off" title="Verdict en cours">…</span>'
      : fits
        ? '<span class="badge ok">tient</span>'
        : '<span class="badge ko">déborde</span>';

/**
 * Le verdict du nom court EFFECTIF d'une langue : sa valeur saisie (elle est
 * dans le champ), sinon « = en : … » — le site replie sur l'anglais —, et le
 * badge. Un texte que le serveur n'a pas encore jugé attend (« … »).
 */
function verdict(w, lang) {
  const text = effective(w.short, lang);
  const own = (w.short[lang] ?? '').trim();
  return `${
    text && !own ? `<span class="n-eff">= ${FALLBACK} : ${esc(text)}</span>` : ''
  }${fitBadge(text ? verdicts.get(text) : null)}`;
}

const sheetBadges = (row) =>
  statusBadge(row) +
  (refused.has(row.id) ? '<span class="badge ko">refusé : le disque avait changé</span>' : '') +
  (changed(row.id) ? '<span class="badge edit">modifié</span>' : '');

function chips(row, w) {
  const known = new Set(row.base.map((t) => t.toLowerCase()));
  return w.aliases
    .map((a, i) => {
      const twin = known.has(a.toLowerCase());
      return `<span class="chip alias${twin ? ' warn' : ''}"${
        twin ? ' title="déjà cherchable sans cet alias"' : ''
      }>${esc(a)}<button type="button" class="btn icon" data-drop="${i}" aria-label="Retirer ${esc(a)}" title="Retirer">✕</button></span>`;
    })
    .join('');
}

function renderSheet() {
  const row = byId.get(current);
  if (!row) {
    $('n-sheet').innerHTML = '<div class="empty">Choisir un perso dans la liste.</div>';
    return;
  }
  const w = workOf(row);
  $('n-sheet').innerHTML =
    `<div class="n-who">${face(row.id, 56)}<div class="n-id"><strong>${esc(row.name)}</strong><span class="n-badges" id="n-badges">${sheetBadges(row)}</span></div></div>
    <p class="hint">Le site affiche le nom court là où le nom complet ne tient pas sur deux lignes de ${names.width} px, la largeur du libellé sur mobile ; sans valeur dans une langue, l'anglais sert.</p>
    <div class="scroll"><table>
      <thead><tr><th>Langue</th><th>Nom complet</th><th>Nom court</th></tr></thead>
      <tbody>${names.langs
        .map(
          (l) => `<tr>
        <td class="n-lang">${esc(l)}</td>
        <td><span class="n-full">${esc(row.full[l])}</span>${fitBadge(row.fits.full[l])}</td>
        <td><div class="n-short"><input data-lang="${esc(l)}" value="${esc(w.short[l] ?? '')}" placeholder="${esc(row.full[l])}" aria-label="Nom court — ${esc(l)}" autocomplete="off" /><span class="n-verdict" data-verdict="${esc(l)}">${verdict(w, l)}</span></div></td>
      </tr>`,
        )
        .join('')}</tbody>
    </table></div>
    <div class="n-aliases">
      <h3>Alias de recherche</h3>
      <p class="hint">Des termes en plus pour le champ recherche des listes de persos (fautes courantes, abréviations, anciens noms). Rien ne s'affiche sur le site.</p>
      <div class="lbl">Déjà cherchable</div>
      <div class="chips">${row.base.map((t) => `<span class="chip base">${esc(t)}</span>`).join('')}</div>
      <div class="lbl" id="n-alias-count"></div>
      <div class="n-box"><span class="chips" id="n-chips"></span><input id="n-alias" value="${esc(w.draft)}" placeholder="+ alias (Entrée, virgule)…" aria-label="Ajouter un alias" autocomplete="off" /></div>
    </div>`;
  paintAliases();
}

function paintAliases() {
  const row = byId.get(current);
  const w = workOf(row);
  $('n-chips').innerHTML = chips(row, w);
  $('n-alias-count').textContent = `Alias (${w.aliases.length})`;
}

function paintVerdicts() {
  const w = workOf(byId.get(current));
  for (const el of $('n-sheet').querySelectorAll('[data-verdict]'))
    el.innerHTML = verdict(w, el.dataset.verdict);
}

// ------------------------------------------------------ le verdict en direct
let fitTimer;

/**
 * Demande au serveur le verdict des noms courts EFFECTIFS du perso montré —
 * tous ses champs en une requête. Rien ne part si chacun est déjà jugé.
 */
async function fetchFits() {
  const id = current;
  const row = byId.get(id);
  if (!row) return;
  const w = workOf(row);
  const texts = [...new Set(names.langs.map((l) => effective(w.short, l)).filter(Boolean))];
  if (texts.every((t) => verdicts.has(t))) return;
  try {
    const res = await fetch('/api/names/fit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texts }),
    });
    const { fits } = await res.json();
    texts.forEach((t, i) => verdicts.set(t, fits[i]));
  } catch (e) {
    log([`Verdict du nom court indisponible : ${e}`], false);
    return;
  }
  if (current === id) paintVerdicts();
}

function askFits() {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fetchFits, FIT_DELAY);
}

// ------------------------------------------------------ la saisie
/** Après une modification du perso montré : son point, ses badges, la savebar. */
function afterEdit() {
  const id = current;
  if (!changed(id)) edits.delete(id);
  refused.delete(id);
  const pt = rowButton(id)?.querySelector('.n-pt');
  if (pt) pt.innerHTML = dot(id);
  $('n-badges').innerHTML = sheetBadges(byId.get(id));
  refreshBar();
}

const addAlias = (w, raw) => {
  if (raw.trim()) w.aliases.push(raw.trim());
};

$('n-sheet').oninput = (e) => {
  const el = e.target;
  if (el.dataset.lang) {
    touch(current).short[el.dataset.lang] = el.value;
    paintVerdicts();
    askFits();
  } else if (el.id === 'n-alias') {
    const w = touch(current);
    // La virgule sépare : chaque morceau devient un alias.
    if (el.value.includes(',')) {
      for (const part of el.value.split(',')) addAlias(w, part);
      el.value = '';
    }
    w.draft = el.value;
    paintAliases();
  } else return;
  afterEdit();
};

$('n-sheet').onkeydown = (e) => {
  const el = e.target;
  // Entrée valide aussi une composition (japonais, coréen) : pas un alias.
  if (el.id !== 'n-alias' || e.isComposing) return;
  if (e.key === 'Enter') {
    e.preventDefault();
    const w = touch(current);
    addAlias(w, el.value);
    el.value = w.draft = '';
  } else if (e.key === 'Backspace' && !el.value && workOf(byId.get(current)).aliases.length) {
    touch(current).aliases.pop();
  } else return;
  paintAliases();
  afterEdit();
};

$('n-sheet').onclick = (e) => {
  const b = e.target.closest('[data-drop]');
  if (!b) return;
  touch(current).aliases.splice(Number(b.dataset.drop), 1);
  paintAliases();
  afterEdit();
  // La croix vient de disparaître : le focus revient au champ d'alias.
  $('n-alias').focus();
};

// ------------------------------------------------------ la sélection
function select(id) {
  if (!byId.has(id)) return;
  current = id;
  // Le perso ouvert est dans l'adresse : recharger y revient.
  history.replaceState(null, '', `#names/${encodeURIComponent(id)}`);
  renderList();
  // Ouvert par l'adresse, il peut être loin dans la liste.
  rowButton(id)?.scrollIntoView({ block: 'nearest' });
  renderSheet();
  fetchFits();
}

$('n-list').onclick = (e) => {
  const b = e.target.closest('.n-row');
  if (b) select(b.dataset.id);
};

for (const id of ['n-q', 'n-state']) $(id).oninput = renderList;

function renderNames() {
  renderList();
  renderSheet();
  refreshBar();
}

async function loadNames() {
  names = await (await fetch('/api/names/state')).json();
  byId = new Map(names.rows.map((r) => [r.id, r]));
  for (const row of names.rows)
    for (const l of names.langs) {
      const text = effective(row.short, l);
      if (text && row.fits.short[l] !== null) verdicts.set(text, row.fits.short[l]);
    }
  if (!byId.has(current)) current = null;
  for (const id of [...edits.keys()]) if (!byId.has(id)) edits.delete(id);
}

$('n-reset').onclick = () => {
  edits.clear();
  refused.clear();
  renderNames();
};

$('n-save').onclick = async () => {
  if (!edits.size) return;
  const changes = [...edits].map(([id, w]) => {
    const row = byId.get(id);
    return {
      id,
      short: shortOf(w),
      aliases: aliasesOf(w),
      was: { short: row.short, aliases: row.aliases },
    };
  });
  $('n-save').disabled = $('n-reset').disabled = true;
  $('n-save').classList.add('busy');
  log([], undefined, 'envoi des noms au serveur');
  try {
    const r = await post('/api/names', { changes });
    // Le disque fait foi, que tout soit passé ou non : on le relit. Un perso
    // enregistré ou refusé n'est plus « modifié » (le refusé montre le disque,
    // marqué d'un point rouge) ; celui qui n'a pas été traité — échec avant
    // écriture — reste en attente, rien n'est à ressaisir.
    refused = new Set(r.refused ?? []);
    await loadNames();
    for (const id of [...(r.saved ?? []), ...refused]) edits.delete(id);
  } finally {
    $('n-save').classList.remove('busy');
    renderNames();
  }
};

/** Quitter l'onglet avec des persos en attente : sur confirmation. */
function namesLeave() {
  const n = edits.size;
  return (
    !n ||
    confirm(
      `${plural(n, 'perso')} modifié${n > 1 ? 's' : ''}, pas encore enregistré${n > 1 ? 's' : ''}. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.`,
    )
  );
}

sections.register('names', {
  init: () => {
    // `#names/<id>` ouvre l'onglet sur la fiche de ce perso (un lien, le banc
    // de captures). `lib.js` ne connaît que `#names` : c'est le clic sur
    // l'onglet qui l'ouvre.
    const [, open] = /^#names\/([^/]+)$/.exec(location.hash) ?? [];
    if (open) document.querySelector('#tabs [data-tab="names"]')?.click();
    // Les visages sont sous `imgBase`, connu avec `/api/state` : redessinés
    // si l'état en annonce une autre.
    stateLoaded.then(() => {
      if (state.imgBase !== drawnBase && names.rows.length) renderNames();
    });
    return loadNames()
      .then(() => {
        renderNames();
        if (open) select(decodeURIComponent(open));
      })
      .catch((e) => log([`Noms illisibles : ${e}`], false));
  },
  // Des persos en attente ne survivent pas à un rechargement de la page.
  dirty: () => edits.size,
  canLeave: namesLeave,
});
