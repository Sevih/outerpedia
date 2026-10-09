// Onglet « Items » : le catalogue d'items du site (gemmes, matériaux, présents,
// boîtes, monnaies, costumes, créations — pas l'équipement) et l'entrée curée
// de chacun — nom, description, icône, masquage, note — ou la création d'un
// item que les tables du jeu ne nomment pas.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';
import { itemTile } from '../gear-view.mjs';

let it = {
  items: [],
  unused: [],
  hasSprites: false,
  counts: {},
  types: [],
  langs: [],
  sprite: 'images/items',
  canBake: true,
  noBake: '',
};
let byId = new Map();
let current = null; // l'id de l'item dont la fiche est montrée
// Items modifiés, pas encore envoyés : id → les champs de sa fiche. Rien ne
// part tant que « Enregistrer » n'est pas cliqué, et tous partent ensemble.
const edits = new Map();
// Items CRÉÉS par « ＋ item », absents du disque : id → une ligne vierge.
const drafts = new Map();
let refused = new Map(); // items écartés au dernier enregistrement : id → pourquoi
// La réponse de la recherche : id → le champ qui a répondu. `null` : saisie
// vide, tout le catalogue reste. La règle est au serveur (celle d'Effets).
let matches = null;
let type = ''; // le type du groupe segmenté ; '' : tous
let limit = 0; // le nombre de lignes dessinées (cf. `PAGE`)
let drawnBase = state.imgBase; // la base du dernier dessin (cf. `init`)

/** Le catalogue se dessine par pages : 1 208 lignes d'un coup figeraient la frappe. */
const PAGE = 100;
/** Le délai de la recherche d'Effets : elle part après la dernière frappe. */
const SEARCH_DELAY = 200;
/** L'id d'une création, la règle du serveur : ni blanc, ni `%`, ni `/`. */
const NEW_ID = /^[^\s%/]+$/;

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

// ------------------------------------------------------ la tuile
/**
 * La tuile d'un item, celle de `gear-view.mjs` : le cadre de rareté de son
 * grade, son icône (sous le dossier que l'état annonce), ses étoiles.
 * Décorative : le nom est à côté.
 */
const tile = (icon, row, size) =>
  itemTile(
    { imgBase: state.imgBase, esc },
    { icon, grade: row.grade, star: row.star, dir: it.sprite.replace(/^images\//, '') },
    size,
  );

// ------------------------------------------------------ le modèle
const rowOf = (id) => byId.get(id) ?? drafts.get(id);

/**
 * Les champs de la fiche, d'après l'entrée curée du disque. Une création née
 * d'un sprite (`TI_…`) part avec son icône DANS le champ (`seedIcon`) : c'est
 * sa fiche vierge, elle ne compte pas tant que rien d'autre n'y est saisi.
 */
function formOf(row) {
  const c = row.curated ?? {};
  return {
    name: { ...(c.name ?? {}) },
    desc: { ...(c.desc ?? {}) },
    icon: c.icon ?? row.seedIcon ?? '',
    hidden: Boolean(c.hidden),
    note: c.note ?? '',
  };
}

/** Ce que la fiche montre d'un item : sa copie de travail, sinon le disque. */
const workOf = (row) => edits.get(row.id) ?? formOf(row);

/** La copie de travail d'un item, créée à sa première modification. */
function touch(id) {
  if (!edits.has(id)) edits.set(id, formOf(rowOf(id)));
  return edits.get(id);
}

const localized = (values) => {
  const out = {};
  for (const l of it.langs) {
    const text = (values[l] ?? '').trim();
    if (text) out[l] = text;
  }
  return out;
};

/**
 * Ce qui partirait : l'entrée curée que composent les champs — une langue
 * blanche n'y est pas, `hidden` seulement s'il est coché. Le serveur la ramène
 * de toute façon à son contrat (`cleanItemCurated`).
 */
function curatedOf(f) {
  const c = {};
  const name = localized(f.name);
  const desc = localized(f.desc);
  if (Object.keys(name).length) c.name = name;
  if (Object.keys(desc).length) c.desc = desc;
  if (f.icon.trim()) c.icon = f.icon.trim();
  if (f.hidden) c.hidden = true;
  if (f.note.trim()) c.note = f.note.trim();
  return c;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function changed(id) {
  const f = edits.get(id);
  const row = rowOf(id);
  return Boolean(f && row) && !same(curatedOf(f), curatedOf(formOf(row)));
}

/** Les items qui partiraient. Une création laissée vierge n'en est pas. */
const pending = () => [...edits.keys()].filter(changed);

// ------------------------------------------------------ le catalogue
const FILTERS = [
  ['i-nodesc', (row) => !row.hasDesc],
  ['i-noicon', (row) => !row.icon],
  ['i-curated', (row) => row.overridden],
  ['i-hidden', (row) => row.hidden],
];

/** « sprites à intégrer » : le catalogue laisse la place aux sprites que rien ne porte. */
const spriteMode = () => $('i-unused').checked;

const filtering = () => Boolean(matches) || Boolean(type) || FILTERS.some(([id]) => $(id).checked);

/** L'item passe la recherche et les filtres. */
function passes(row) {
  if (type && row.type !== type) return false;
  if (FILTERS.some(([id, is]) => $(id).checked && !is(row))) return false;
  return !matches || Boolean(matches[row.id]);
}

/** Pourquoi la ligne sort : le champ qui a répondu à la recherche. */
const why = (m) => (m.field === 'id' ? `id ${m.value}` : 'nom en');

/** Le point d'une ligne : rouge = refusée au dernier enregistrement, accent = modifiée. */
const dot = (id) =>
  refused.has(id)
    ? `<i class="pt ko" role="img" aria-label="refusé" title="${esc(refused.get(id))}"></i>`
    : changed(id)
      ? '<i class="pt edit" role="img" aria-label="modifié" title="Modifié, pas encore enregistré"></i>'
      : '';

const stars = (n) => (n > 0 ? '★'.repeat(n) : '');

/** Une ligne du catalogue. */
function rowHtml(row) {
  const draft = drafts.has(row.id);
  const m = matches ? matches[row.id] : null;
  const marks =
    (row.overridden
      ? '<span class="i-cur" role="img" aria-label="curé" title="Porte une entrée curée">✎</span>'
      : '') +
    (draft ? '<span class="badge edit">nouveau</span>' : '') +
    (row.hidden ? '<span class="badge off">masqué</span>' : '');
  const meta = [`<span class="mono">${esc(row.id)}</span>`, esc(row.type), esc(row.grade)].join(
    ' · ',
  );
  const desc = draft
    ? ''
    : row.hasDesc
      ? '<span class="i-desc ok" title="A une description anglaise">desc ✓</span>'
      : '<span class="i-desc no" title="Pas de description anglaise">desc —</span>';
  return `<button type="button" class="i-row" data-id="${esc(row.id)}" aria-current="${row.id === current}">${tile(row.icon, row, 32)}<span class="i-main"><span class="i-line"><span class="i-name${row.name ? '' : ' none'}">${esc(row.name || 'sans nom')}</span>${marks}</span><span class="i-meta">${meta}</span>${m ? `<span class="i-why">${esc(why(m))}</span>` : ''}</span>${desc}<span class="i-pt">${dot(row.id)}</span></button>`;
}

/** Un sprite que rien ne porte : un clic ouvre la fiche vierge de sa création. */
const spriteHtml = (sprite) =>
  `<button type="button" class="i-row" data-sprite="${esc(sprite)}">${tile(sprite, { grade: 'normal', star: 0 }, 32)}<span class="i-main"><span class="i-line"><span class="i-name mono">${esc(sprite)}</span></span><span class="i-meta">sprite à intégrer — un clic ouvre sa création</span></span></button>`;

const rowButton = (id) =>
  [...$('i-rows').querySelectorAll('.i-row')].find((b) => b.dataset.id === id);

const sep = (text) => `<div class="i-sep">${esc(text)}</div>`;

/** Les lignes que le catalogue montrerait, l'item ouvert compris (cf. `renderList`). */
const shownRows = () => it.items.filter((row) => passes(row) || row.id === current);

function renderList() {
  const list = $('i-rows');
  const focused = list.contains(document.activeElement) ? document.activeElement.dataset.id : null;
  const sprites = spriteMode();
  drawnBase = state.imgBase;
  // Les filtres lisent une ligne du catalogue : un sprite n'en a pas.
  for (const [id] of FILTERS) $(id).disabled = sprites;
  for (const b of $('i-types').querySelectorAll('button')) {
    b.disabled = sprites;
    b.setAttribute('aria-pressed', String(b.dataset.type === type));
  }

  let html = drafts.size
    ? sep(`Nouveaux, pas encore enregistrés (${drafts.size})`) +
      [...drafts.values()].map(rowHtml).join('')
    : '';
  let total;
  let drawn;
  const c = it.counts;
  if (sprites) {
    const rows = it.unused.filter((s) => !drafts.has(s) && (!matches || matches[s]));
    total = rows.length;
    drawn = Math.min(total, limit);
    if (drafts.size && drawn) html += sep('Sprites à intégrer');
    html += rows.slice(0, drawn).map(spriteHtml).join('');
    $('i-total').textContent = !it.hasSprites
      ? 'Images du jeu absentes sur ce poste : aucun sprite à proposer.'
      : matches
        ? `${total} sur ${plural(c.unused ?? 0, 'sprite')} à intégrer`
        : `${plural(c.unused ?? 0, 'sprite')} à intégrer — extraits du jeu, portés par aucun item`;
    $('i-empty').textContent = it.hasSprites
      ? 'Aucun sprite à intégrer.'
      : 'Images du jeu absentes sur ce poste.';
  } else {
    // L'item ouvert garde sa ligne : enregistré, il sortirait d'un filtre sous
    // le curseur.
    const rows = shownRows();
    total = rows.length;
    drawn = Math.min(total, limit);
    if (drafts.size && drawn) html += sep('Catalogue');
    html += rows.slice(0, drawn).map(rowHtml).join('');
    const all = (c.items ?? 0) + (c.currencies ?? 0);
    $('i-total').textContent = filtering()
      ? `${it.items.filter(passes).length} sur ${plural(all, 'entrée')}`
      : `${plural(c.items ?? 0, 'item')} + ${plural(c.currencies ?? 0, 'monnaie')} · ${c.noDesc ?? 0} sans description · ${
          it.hasSprites
            ? `${plural(c.unused ?? 0, 'sprite')} à intégrer`
            : 'sprites : images du jeu absentes sur ce poste'
        } · ${plural(c.curated ?? 0, 'curé')}`;
    $('i-empty').textContent = 'Aucun item ne correspond.';
  }
  list.innerHTML = html;
  if (focused) rowButton(focused)?.focus();
  $('i-empty').hidden = total > 0 || drafts.size > 0;
  $('i-foot').hidden = total <= drawn;
  $('i-shown').textContent = `${drawn} lignes montrées sur ${total}`;
  $('i-more').textContent = `Afficher plus (${Math.min(PAGE, total - drawn)})`;
}

/** Un filtre ou la recherche a bougé : le catalogue repart de sa première page. */
function refilter() {
  limit = PAGE;
  renderList();
}

function refreshBar() {
  const n = pending().length;
  const no = refused.size;
  $('i-count').innerHTML =
    (n
      ? `<span class="badge edit">${plural(n, 'item')} modifié${n > 1 ? 's' : ''}</span>`
      : '<span>aucune modification</span>') +
    (no ? `<span class="badge ko">${no} refus</span>` : '') +
    (it.canBake
      ? ''
      : '<span class="badge warn">enregistrement impossible sur ce poste (tables du jeu absentes)</span>');
  // Sans tables du jeu le serveur refuse tout le lot : inutile de l'envoyer.
  $('i-save').disabled = !n || !it.canBake;
  $('i-save').title = it.canBake ? '' : it.noBake;
  // « Annuler » retire aussi une création laissée vierge.
  $('i-reset').disabled = !n && !drafts.size && !no;
}

// ------------------------------------------------------ la fiche
function sheetBadges(row) {
  const f = workOf(row);
  return (
    (drafts.has(row.id) ? '<span class="badge edit">nouveau</span>' : '') +
    (row.overridden ? '<span class="badge off">curé</span>' : '') +
    (f.hidden ? '<span class="badge off">masqué</span>' : '') +
    (refused.has(row.id) ? '<span class="badge ko">refusé</span>' : '') +
    (changed(row.id) ? '<span class="badge edit">modifié</span>' : '')
  );
}

const iconOf = (row, f) => f.icon.trim() || row.base?.icon || '';
const titleOf = (row, f) => (f.name.en ?? '').trim() || row.base?.name.en || row.id;

/** « clé… » d'un champ texte : la saisie de la clé du jeu et son bouton. */
const keyHtml = (field, example) =>
  `<span class="i-key"><input class="mono" data-key="${field}" placeholder="clé du jeu (ex. ${example})" aria-label="Clé de texte du jeu — ${field === 'name' ? 'nom' : 'description'}" autocomplete="off" /><button type="button" class="btn ghost sm" data-pull="${field}" title="Cherche cette clé dans les textes du jeu et pose ses six langues">clé…</button></span>`;

function renderSheet() {
  const row = rowOf(current);
  if (!row) {
    $('i-sheet').innerHTML = '<div class="empty">Choisir un item dans le catalogue.</div>';
    return;
  }
  const f = workOf(row);
  const base = row.base;
  const creation = !base;
  const langField = (kind, l) =>
    kind === 'name'
      ? `<label class="i-lang"><span>${esc(l)}</span><input data-f="name" data-lang="${esc(l)}" value="${esc(f.name[l] ?? '')}" placeholder="${esc(base?.name[l] ?? '')}" aria-label="Nom — ${esc(l)}" autocomplete="off" /></label>`
      : `<label class="i-lang"><span>${esc(l)}</span><textarea data-f="desc" data-lang="${esc(l)}" placeholder="${esc(base?.desc?.[l] ?? '')}" aria-label="Description — ${esc(l)}">${esc(f.desc[l] ?? '')}</textarea></label>`;
  const meta = [`<span class="mono">${esc(row.id)}</span>`, esc(row.type), esc(row.grade)];
  if (stars(row.star)) meta.push(stars(row.star));
  $('i-sheet').innerHTML =
    `<div class="i-who"><span id="i-preview">${tile(iconOf(row, f), row, 56)}</span><div class="i-id"><strong id="i-title">${esc(titleOf(row, f))}</strong><span class="i-meta">${meta.join(' · ')}</span><span class="i-badges" id="i-badges">${sheetBadges(row)}</span></div></div>
    <p class="i-err" id="i-err"${refused.has(row.id) ? '' : ' hidden'}>${esc(refused.get(row.id) ?? '')}</p>
    ${
      creation
        ? '<p class="hint">Création : cet id est absent du catalogue. Au moins un nom anglais — par « clé… » ou à la main —, puis « Enregistrer ».</p>'
        : row.kind === 'custom'
          ? '<p class="hint">Une création du wiki : elle n’existe que par son entrée curée. La vider puis « Enregistrer » la retire du catalogue.</p>'
          : ''
    }
    <div class="i-block">
      <div class="i-bhead"><h3>Nom</h3>${keyHtml('name', 'SYS_STAMINA')}</div>
      <p class="hint">${creation ? 'L’anglais est requis.' : 'Vide = le nom du catalogue, en gris dans le champ.'}</p>
      <div class="i-langs">${it.langs.map((l) => langField('name', l)).join('')}</div>
    </div>
    <div class="i-block">
      <div class="i-bhead"><h3>Description</h3>${keyHtml('desc', 'SYS_DISC_TICKET_STAMINA')}</div>
      <p class="hint">${creation ? 'Par langue ; facultative.' : 'Vide = la description du catalogue.'}</p>
      <div class="i-langs">${it.langs.map((l) => langField('desc', l)).join('')}</div>
    </div>
    <div class="form">
      <div class="field"><label for="i-icon">Icône (sprite items)</label><input id="i-icon" data-f="icon" class="w-search mono" list="i-sprites" value="${esc(f.icon)}" placeholder="${esc(base?.icon || 'TI_Item_…')}" autocomplete="off" /></div>
      <span class="i-icon-pv" id="i-icon-pv">${tile(iconOf(row, f), row, 34)}</span>
      <label class="check"><input type="checkbox" data-f="hidden"${f.hidden ? ' checked' : ''} /> Masquer du site (bruit, interne)</label>
    </div>
    <div class="field i-wide"><label for="i-note">Note interne</label><textarea id="i-note" data-f="note">${esc(f.note)}</textarea></div>
    <div class="actions"><button type="button" class="btn ghost" id="i-clear">Vider</button><span class="lbl">${creation ? 'Rend la fiche vierge de la création.' : 'Remet la fiche à la base : « Enregistrer » retire alors l’entrée curée.'}</span></div>`;
}

// ------------------------------------------------------ la saisie
/** Après une modification de l'item montré : son point, ses badges, la savebar. */
function afterEdit() {
  const id = current;
  const row = rowOf(id);
  if (!changed(id)) edits.delete(id);
  refused.delete(id);
  const pt = rowButton(id)?.querySelector('.i-pt');
  if (pt) pt.innerHTML = dot(id);
  $('i-badges').innerHTML = sheetBadges(row);
  $('i-err').hidden = true;
  refreshBar();
}

/** Le titre et les deux tuiles de la fiche, d'après la saisie. */
function repaint(row, f) {
  $('i-title').textContent = titleOf(row, f);
  $('i-preview').innerHTML = tile(iconOf(row, f), row, 56);
  $('i-icon-pv').innerHTML = tile(iconOf(row, f), row, 34);
}

$('i-sheet').oninput = (e) => {
  const el = e.target;
  const field = el.dataset?.f;
  const row = rowOf(current);
  if (!field || !row) return;
  const f = touch(current);
  if (field === 'name' || field === 'desc') f[field][el.dataset.lang] = el.value;
  else if (field === 'hidden') f.hidden = el.checked;
  else f[field] = el.value;
  // Une frappe ne redessine pas la fiche (le champ garde le curseur) : seuls
  // le titre et les tuiles suivent.
  if (field === 'name' || field === 'icon') repaint(row, f);
  afterEdit();
};

/**
 * « clé… » : demande au serveur le texte du jeu sous la clé saisie et pose ses
 * six langues dans le champ (nom ou description) — une langue que la clé ne
 * porte pas est vidée, comme dans l'admin.
 */
async function pull(field) {
  const row = rowOf(current);
  const input = $('i-sheet').querySelector(`[data-key="${field}"]`);
  const key = input?.value.trim();
  if (!row || !key) {
    log(['Une clé de texte du jeu (ex. SYS_STAMINA).'], false);
    return;
  }
  const id = current;
  let got;
  try {
    got = await getJson(`/api/items/text?key=${encodeURIComponent(key)}`);
  } catch (e) {
    log([`Textes du jeu indisponibles : ${e}`], false);
    return;
  }
  if (!got.text) {
    log(
      [
        `Clé de texte introuvable : ${key}${it.canBake ? '' : ' — tables du jeu absentes sur ce poste'}.`,
      ],
      false,
    );
    return;
  }
  // La fiche a pu changer pendant la requête : le texte n'est pas pour elle.
  if (id !== current) return;
  const f = touch(id);
  f[field] = Object.fromEntries(it.langs.map((l) => [l, got.text[l] ?? '']));
  for (const el of $('i-sheet').querySelectorAll(`[data-f="${field}"]`))
    el.value = f[field][el.dataset.lang] ?? '';
  repaint(row, f);
  afterEdit();
  log(
    [`${key} : ${field === 'name' ? 'nom posé' : 'description posée'} dans les langues du jeu.`],
    true,
  );
}

/** « Vider » : la fiche revient à la base — l'entrée curée partira vide. */
function clearSheet() {
  const row = rowOf(current);
  if (!row) return;
  // Une création n'a pas de base : elle retrouve sa fiche vierge.
  if (drafts.has(row.id)) edits.delete(row.id);
  else edits.set(row.id, { name: {}, desc: {}, icon: '', hidden: false, note: '' });
  renderSheet();
  afterEdit();
}

$('i-sheet').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.pull) pull(b.dataset.pull);
  else if (b.id === 'i-clear') clearSheet();
};

$('i-sheet').onkeydown = (e) => {
  const field = e.target.dataset?.key;
  if (field && e.key === 'Enter' && !e.isComposing) {
    e.preventDefault();
    pull(field);
  }
};

// ------------------------------------------------------ la sélection
function select(id) {
  if (!rowOf(id)) return;
  current = id;
  // L'item ouvert est dans l'adresse : recharger y revient. L'id est encodé
  // tel quel — `Hero%20Piece` en ressort intact.
  history.replaceState(null, '', `#items/${encodeURIComponent(id)}`);
  // Ouvert par l'adresse, il peut être loin dans le catalogue : sa page vient.
  const at = shownRows().findIndex((row) => row.id === id);
  if (at >= limit) limit = Math.ceil((at + 1) / PAGE) * PAGE;
  renderList();
  rowButton(id)?.scrollIntoView({ block: 'nearest' });
  renderSheet();
}

$('i-rows').onclick = (e) => {
  const b = e.target.closest('.i-row');
  if (!b) return;
  if (b.dataset.sprite) create(b.dataset.sprite);
  else select(b.dataset.id);
};

$('i-more').onclick = () => {
  limit += PAGE;
  renderList();
};

// ------------------------------------------------------ la recherche
let searchTimer;
let searchSeq = 0;

/** Demande au serveur qui répond à la saisie ; seule la dernière demande se dessine. */
async function runSearch() {
  const q = $('i-q').value;
  const seq = ++searchSeq;
  if (!q.trim()) {
    matches = null;
    refilter();
    return;
  }
  try {
    const r = await getJson(`/api/items/search?q=${encodeURIComponent(q)}`);
    if (seq !== searchSeq) return;
    matches = r.matches;
  } catch (e) {
    log([`Recherche des items indisponible : ${e}`], false);
    return;
  }
  refilter();
}

$('i-q').oninput = () => {
  clearTimeout(searchTimer);
  // Champ vidé : tout revient aussitôt.
  if (!$('i-q').value.trim()) runSearch();
  else searchTimer = setTimeout(runSearch, SEARCH_DELAY);
};

for (const id of ['i-unused', ...FILTERS.map(([f]) => f)]) $(id).oninput = refilter;

$('i-types').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  type = b.dataset.type;
  refilter();
};

// ------------------------------------------------------ « ＋ item »
/**
 * Ouvre la fiche vierge d'un item créé sous cet id. Un id qui existe déjà ne
 * se crée pas, sa fiche s'ouvre ; un id nouveau se prend TEL QUEL (ni blanc,
 * ni `%`, ni `/` — la règle du serveur, qui tranche à l'enregistrement). Un id
 * de sprite (`TI_…`) pose son icône dans le champ.
 */
function create(raw) {
  const id = String(raw ?? '').trim();
  if (!id) {
    log(['Un id pour le nouvel item (ex. TI_Item_Stamina).'], false);
    return false;
  }
  if (rowOf(id)) {
    if (byId.has(id)) log([`${id} existe déjà : sa fiche est ouverte.`], true);
  } else if (!NEW_ID.test(id)) {
    log([`Id de création invalide : « ${id} » (ni espace, ni %, ni /).`], false);
    return false;
  } else {
    drafts.set(id, {
      id,
      name: '',
      type: 'custom',
      kind: 'custom',
      grade: 'normal',
      star: 0,
      icon: id.startsWith('TI_') ? id : '',
      hasDesc: false,
      hidden: false,
      overridden: false,
      base: null,
      curated: {},
      seedIcon: id.startsWith('TI_') ? id : '',
    });
  }
  refreshBar();
  select(id);
  $('i-sheet').querySelector('[data-f="name"][data-lang="en"]')?.focus();
  return true;
}

$('i-new').onclick = () => {
  if (create($('i-new-id').value)) $('i-new-id').value = '';
};
$('i-new-id').onkeydown = (e) => {
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault();
    $('i-new').click();
  }
};

// ------------------------------------------------------ l'état
function renderItems() {
  $('i-types').innerHTML = [['', 'tous'], ...it.types.map((t) => [t, t])]
    .map(
      ([value, label]) => `<button type="button" data-type="${esc(value)}">${esc(label)}</button>`,
    )
    .join('');
  if (type && !it.types.includes(type)) type = '';
  renderList();
  renderSheet();
  refreshBar();
}

async function loadItems() {
  it = await getJson('/api/items/state');
  byId = new Map(it.items.map((r) => [r.id, r]));
  // Une création enregistrée est sur le disque : elle n'est plus un brouillon.
  for (const id of [...drafts.keys()]) if (byId.has(id)) drafts.delete(id);
  for (const id of [...edits.keys()]) if (!rowOf(id)) edits.delete(id);
  if (current && !rowOf(current)) current = null;
  if (!limit) limit = PAGE;
  $('i-sprites').innerHTML = it.unused.map((s) => `<option value="${esc(s)}"></option>`).join('');
}

$('i-reset').onclick = () => {
  edits.clear();
  drafts.clear();
  refused.clear();
  if (current && !rowOf(current)) current = null;
  renderItems();
};

$('i-save').onclick = async () => {
  const ids = pending();
  if (!ids.length || !it.canBake) return;
  const changes = ids.map((id) => ({
    id,
    curated: curatedOf(edits.get(id)),
    was: rowOf(id).curated,
    ...(drafts.has(id) ? { create: true } : {}),
  }));
  $('i-save').disabled = $('i-reset').disabled = true;
  $('i-save').classList.add('busy');
  log([], undefined, 'envoi des items au serveur');
  try {
    const r = await post('/api/items', { changes });
    // Le disque fait foi, que tout soit passé ou non : on le relit. Un item
    // enregistré n'est plus « modifié » ; un refusé garde sa saisie (rien à
    // retaper), marqué d'un point rouge, sa raison sur sa fiche — sauf si le
    // disque avait changé : il montre alors le disque, pour ne pas défaire
    // l'écriture d'un autre.
    refused = new Map((r.refused ?? []).map((id) => [id, r.reasons?.[id] ?? 'Refusé.']));
    await loadItems();
    for (const id of [...(r.saved ?? []), ...(r.stale ?? [])]) edits.delete(id);
    // Un nom a pu changer : la recherche en cours se rejoue.
    if (matches) await runSearch();
  } finally {
    $('i-save').classList.remove('busy');
    renderItems();
  }
};

/** Quitter l'onglet avec des items en attente : sur confirmation. */
function itemsLeave() {
  const n = pending().length;
  return (
    !n ||
    confirm(
      `${plural(n, 'item')} modifié${n > 1 ? 's' : ''}, pas encore enregistré${n > 1 ? 's' : ''}. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.`,
    )
  );
}

// Le catalogue pèse plus d'un mégaoctet : lu à la PREMIÈRE venue sur l'onglet,
// pas au démarrage, puis relu à chaque venue tant que rien n'est en attente
// (un item a pu être enregistré dans l'admin, les tables du jeu arriver).
let reading = null;
let wanted = null; // l'id de `#items/<id>`, ouvert une fois l'état lu

function openItems() {
  if (reading) return reading;
  if (byId.size && (edits.size || drafts.size)) return Promise.resolve();
  reading = loadItems()
    .then(() => {
      renderItems();
      if (wanted) {
        // L'adresse porte l'id encodé ; écrit à la main, il peut l'être tel quel.
        let id = wanted;
        try {
          if (rowOf(decodeURIComponent(wanted))) id = decodeURIComponent(wanted);
        } catch {
          /* un `%` nu : l'id est pris tel quel */
        }
        wanted = null;
        select(id);
      }
    })
    .catch((e) => log([`Items illisibles : ${e}`], false))
    .finally(() => (reading = null));
  return reading;
}

sections.register('items', {
  init: () => {
    // `#items/<id>` ouvre l'onglet sur la fiche de cet item (un lien, le banc
    // de captures). `lib.js` ne connaît que `#items` : c'est le clic sur
    // l'onglet qui l'ouvre.
    const [, open] = /^#items\/(.+)$/.exec(location.hash) ?? [];
    if (open) {
      wanted = open;
      document.querySelector('#tabs [data-tab="items"]')?.click();
    }
    // Les icônes sont sous `imgBase`, connu avec `/api/state` : redessinées
    // si l'état en annonce une autre.
    stateLoaded.then(() => {
      if (state.imgBase !== drawnBase && byId.size) renderItems();
    });
  },
  open: openItems,
  // Des items en attente ne survivent pas à un rechargement de la page.
  dirty: () => pending().length,
  canLeave: itemsLeave,
});
