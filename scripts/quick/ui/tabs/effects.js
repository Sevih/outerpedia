// Onglet « Effets » : le catalogue des effets (paires buff ↔ debuff, orphelins)
// et l'entrée curée de chacun — nom, description, icône, nature, famille, clés,
// masquage, note — ou la création d'un effet sans texte en jeu.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';

let fx = {
  catalog: { pairs: [], orphanBuffs: [], orphanDebuffs: [] },
  counts: {},
  families: { buff: [], debuff: [] },
  origins: {},
  langs: [],
  sprite: 'images/ui/effect',
  icons: [],
};
let byId = new Map();
let current = null; // l'id de l'effet dont la fiche est montrée
// Effets modifiés, pas encore envoyés : id → les champs de sa fiche. Rien ne
// part tant que « Enregistrer » n'est pas cliqué, et tous partent ensemble.
const edits = new Map();
// Effets CRÉÉS par « ＋ effet », absents du disque : id → une ligne vierge.
const drafts = new Map();
let refused = new Map(); // effets écartés au dernier enregistrement : id → pourquoi
// La réponse de la recherche : id → le champ qui a répondu. `null` : saisie
// vide, tout le catalogue reste. La règle est au serveur (`effect-search`).
let matches = null;
let drawnBase = state.imgBase; // la base du dernier dessin (cf. `init`)

/** Le délai de la recherche des tables du jeu : elle part après la dernière frappe. */
const SEARCH_DELAY = 200;

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const sideOf = (isDebuff) => (isDebuff ? 'debuff' : 'buff');

// ------------------------------------------------------ l'icône
// Les caractères qu'`encodeURIComponent` laisse et qu'un `url('…')` lirait.
const iconUrl = (icon) =>
  `${state.imgBase}/${fx.sprite}/${encodeURIComponent(icon).replace(/['()]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}.webp`;

/**
 * La tuile d'un effet, comme le site la peint (`EffectIconTile`) : fond noir,
 * l'icône en MASQUE teinté de sa nature — sauf les « Interruption », qui
 * gardent leurs couleurs. Décorative : le nom est à côté.
 */
function tile(icon, isDebuff, big) {
  const cls = `x-ico${big ? ' lg' : ''}`;
  if (!icon) return `<span class="${cls} none" aria-hidden="true"></span>`;
  const url = esc(iconUrl(icon));
  if (icon.includes('Interruption'))
    return `<span class="${cls}" aria-hidden="true"><img src="${url}" alt="" loading="lazy" /></span>`;
  return `<span class="${cls} ${sideOf(isDebuff)}" style="--x-src: url('${url}')" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

// ------------------------------------------------------ le modèle
const rowOf = (id) => byId.get(id) ?? drafts.get(id);

/** Les champs de la fiche, d'après l'entrée curée du disque. */
function formOf(row) {
  const c = row.curated ?? {};
  return {
    name: { ...(c.name ?? {}) },
    desc: { ...(c.desc ?? {}) },
    icon: c.icon ?? '',
    isDebuff: c.isDebuff === undefined ? '' : String(c.isDebuff),
    tag: c.tag ?? '',
    keys: (c.keys ?? []).join(', '),
    hidden: Boolean(c.hidden),
    note: c.note ?? '',
  };
}

/** Ce que la fiche montre d'un effet : sa copie de travail, sinon le disque. */
const workOf = (row) => edits.get(row.id) ?? formOf(row);

/** La copie de travail d'un effet, créée à sa première modification. */
function touch(id) {
  if (!edits.has(id)) edits.set(id, formOf(rowOf(id)));
  return edits.get(id);
}

const localized = (values) => {
  const out = {};
  for (const l of fx.langs) {
    const text = (values[l] ?? '').trim();
    if (text) out[l] = text;
  }
  return out;
};

/**
 * Ce qui partirait : l'entrée curée que composent les champs — un champ blanc
 * n'y est pas, les clés se séparent à la virgule ou au retour à la ligne. Le
 * serveur la ramène de toute façon à son contrat (`cleanEffectCurated`).
 */
function curatedOf(f) {
  const c = {};
  const name = localized(f.name);
  const desc = localized(f.desc);
  if (Object.keys(name).length) c.name = name;
  if (Object.keys(desc).length) c.desc = desc;
  if (f.icon.trim()) c.icon = f.icon.trim();
  if (f.isDebuff !== '') c.isDebuff = f.isDebuff === 'true';
  const keys = f.keys
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean);
  if (keys.length) c.keys = keys;
  if (f.tag.trim()) c.tag = f.tag.trim();
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

/** Les effets qui partiraient. Une création laissée vierge n'en est pas. */
const pending = () => [...edits.keys()].filter(changed);

/** La nature EFFECTIVE d'une fiche : celle choisie, sinon l'extrait, sinon buff. */
const debuffOf = (row, f) =>
  f.isDebuff !== '' ? f.isDebuff === 'true' : Boolean(row.extracted?.isDebuff);

// ------------------------------------------------------ le catalogue
const allRows = () => {
  const { pairs, orphanBuffs, orphanDebuffs } = fx.catalog;
  return [...pairs.flatMap((p) => [p.buff, p.debuff]), ...orphanBuffs, ...orphanDebuffs];
};

const FILTERS = [
  ['x-nodesc', (row) => row.noDesc],
  ['x-curated', (row) => row.overridden],
  ['x-hidden', (row) => row.hidden],
];

const filtering = () =>
  Boolean(matches) || Boolean($('x-nature').value) || FILTERS.some(([id]) => $(id).checked);

/** L'effet passe la recherche et les filtres. */
function passes(row) {
  const nature = $('x-nature').value;
  if (nature && sideOf(row.isDebuff) !== nature) return false;
  if (FILTERS.some(([id, is]) => $(id).checked && !is(row))) return false;
  return !matches || Boolean(matches[row.id]);
}

/** Pourquoi la ligne sort : le champ qui a répondu à la recherche. */
function why(m) {
  if (m.field === 'id') return `id ${m.value}`;
  if (m.field === 'key') return `clé ${m.value}`;
  const lang = m.field.slice('name.'.length);
  // Le nom anglais est celui de la ligne : inutile de le redire.
  return lang === 'en' ? 'nom en' : `nom ${lang} · ${m.value}`;
}

/** Le point d'une ligne : rouge = refusée au dernier enregistrement, accent = modifiée. */
const dot = (id) =>
  refused.has(id)
    ? `<i class="pt ko" role="img" aria-label="refusé" title="${esc(refused.get(id))}"></i>`
    : changed(id)
      ? '<i class="pt edit" role="img" aria-label="modifié" title="Modifié, pas encore enregistré"></i>'
      : '';

/**
 * Une ligne du catalogue. `lit` faux : l'effet ne passe pas lui-même, il n'est
 * là que comme MIROIR de celui qui passe — atténué, sans raison.
 */
function rowHtml(row, lit) {
  const draft = drafts.has(row.id);
  const side = sideOf(row.isDebuff);
  const m = lit && matches ? matches[row.id] : null;
  const badges = [
    `<span class="badge x-nat ${side}">${side}</span>`,
    row.irremovable
      ? '<span class="badge off" title="Variante irremovable : un effet à part de sa version normale">irremovable</span>'
      : '',
    draft ? '<span class="badge edit">nouveau</span>' : '',
    row.hidden ? '<span class="badge off">masqué</span>' : '',
    row.noDesc && !draft ? '<span class="badge warn">sans description</span>' : '',
    !row.icon && !draft ? '<span class="badge ko">sans icône</span>' : '',
  ].join('');
  const meta = [
    `<span class="mono">${esc(row.id)}</span>`,
    esc(fx.origins[row.origin] ?? row.origin),
    row.overridden && row.origin !== 'curated' ? 'curé' : '',
    row.family ? esc(row.family) : '',
  ]
    .filter(Boolean)
    .join(' · ');
  return `<button type="button" class="x-row${lit ? '' : ' x-dim'}" data-id="${esc(row.id)}" aria-current="${row.id === current}">${tile(row.icon, row.isDebuff)}<span class="x-main"><span class="x-line"><span class="x-name${row.name ? '' : ' none'}">${esc(row.name || 'sans nom')}</span>${badges}</span><span class="x-meta">${meta}</span>${m ? `<span class="x-why">${esc(why(m))}</span>` : ''}</span><span class="x-pt">${dot(row.id)}</span></button>`;
}

const rowButton = (id) =>
  [...$('x-rows').querySelectorAll('.x-row')].find((b) => b.dataset.id === id);

const sep = (text) => `<div class="x-sep">${esc(text)}</div>`;
const VOID = '<span class="x-void"></span>';

function renderList() {
  const list = $('x-rows');
  const focused = list.contains(document.activeElement) ? document.activeElement.dataset.id : null;
  const nature = $('x-nature').value;
  // L'effet ouvert garde sa ligne : enregistré, il sortirait d'un filtre sous
  // le curseur.
  const shown = (row) => passes(row) || row.id === current;
  const { pairs, orphanBuffs, orphanDebuffs } = fx.catalog;
  const lit = allRows().filter(passes).length;
  drawnBase = state.imgBase;

  let html = drafts.size
    ? sep(`Nouveaux, pas encore enregistrés (${drafts.size})`) +
      [...drafts.values()].map((row) => `<div class="x-pair">${rowHtml(row, true)}</div>`).join('')
    : '';
  let rows = 0;
  if (nature) {
    // Une nature choisie : une seule colonne, les effets en paire puis les autres.
    const side = (row) => sideOf(row.isDebuff) === nature && shown(row);
    const paired = pairs.map((p) => p[nature]).filter(side);
    const alone = (nature === 'buff' ? orphanBuffs : orphanDebuffs).filter(side);
    const line = (row) => `<div class="x-pair">${rowHtml(row, true)}</div>`;
    html += paired.map(line).join('');
    if (alone.length) html += sep(`Sans miroir (${alone.length})`) + alone.map(line).join('');
    rows = paired.length + alone.length;
  } else {
    // Une paire reste entière dès qu'un de ses deux membres passe : on cherche
    // un effet, on veut voir son miroir.
    for (const p of pairs) {
      const b = shown(p.buff);
      const d = shown(p.debuff);
      if (!b && !d) continue;
      html += `<div class="x-pair">${rowHtml(p.buff, b)}${rowHtml(p.debuff, d)}</div>`;
      rows += 1;
    }
    const ob = orphanBuffs.filter(shown);
    const od = orphanDebuffs.filter(shown);
    const n = Math.max(ob.length, od.length);
    if (n) html += sep(`Sans miroir (${ob.length + od.length})`);
    for (let i = 0; i < n; i++)
      html += `<div class="x-pair">${ob[i] ? rowHtml(ob[i], true) : VOID}${od[i] ? rowHtml(od[i], true) : VOID}</div>`;
    rows += n;
  }
  list.innerHTML = html;
  list.classList.toggle('one', Boolean(nature));
  $('x-heads').hidden = Boolean(nature) || !rows;
  if (focused) rowButton(focused)?.focus();

  const c = fx.counts;
  $('x-total').textContent = filtering()
    ? `${lit} sur ${plural(c.total ?? 0, 'effet')}`
    : `${plural(c.total ?? 0, 'effet')} — ${plural(c.statuses ?? 0, 'statut')}, ${plural(c.mechanics ?? 0, 'mécanique')}, ${plural(c.creations ?? 0, 'création')} · ${plural(c.curated ?? 0, 'curé')} · ${c.noDesc ?? 0} sans description · ${plural(c.hidden ?? 0, 'masqué')}`;
  $('x-empty').hidden = rows > 0 || drafts.size > 0;
  $('x-empty').textContent = 'Aucun effet ne correspond.';
}

function refreshBar() {
  const n = pending().length;
  const no = refused.size;
  $('x-count').innerHTML =
    (n
      ? `<span class="badge edit">${plural(n, 'effet')} modifié${n > 1 ? 's' : ''}</span>`
      : '<span>aucune modification</span>') +
    (no ? `<span class="badge ko">${no} refus</span>` : '');
  $('x-save').disabled = !n;
  // « Annuler » retire aussi une création laissée vierge.
  $('x-reset').disabled = !n && !drafts.size && !no;
}

// ------------------------------------------------------ la fiche
/** Le texte du jeu, lisible : balises retirées, `\n` littéraux en sauts de ligne. */
const plain = (s) => (s ?? '').replace(/<\/?[^>]+>/g, '').replace(/\\n/g, '\n');

const ICON_SOURCE = {
  none: '<span class="x-ko">sans icône</span>',
  wiki: '<span class="x-warn">icône du wiki</span>',
  game: '<span class="x-ok">icône du jeu</span>',
};

function sheetBadges(row) {
  const f = workOf(row);
  const side = sideOf(debuffOf(row, f));
  return (
    `<span class="badge x-nat ${side}">${side}</span>` +
    (row.irremovable ? '<span class="badge off">irremovable</span>' : '') +
    (drafts.has(row.id) ? '<span class="badge edit">nouveau</span>' : '') +
    (refused.has(row.id)
      ? `<span class="badge ko" title="${esc(refused.get(row.id))}">refusé</span>`
      : '') +
    (changed(row.id) ? '<span class="badge edit">modifié</span>' : '')
  );
}

/** Les familles du côté EFFECTIF ; un tag d'un autre côté reste proposé, pour ne pas l'effacer. */
function tagOptions(row, f) {
  const side = sideOf(debuffOf(row, f));
  const known = fx.families[side] ?? [];
  return (
    '<option value="">par défaut (taxonomie)</option>' +
    known
      .map(
        (o) =>
          `<option value="${esc(o.value)}"${o.value === f.tag ? ' selected' : ''}>${esc(o.label)}</option>`,
      )
      .join('') +
    (f.tag && !known.some((o) => o.value === f.tag)
      ? `<option value="${esc(f.tag)}" selected>${esc(f.tag)} (autre côté)</option>`
      : '')
  );
}

const preview = (row, f) =>
  tile(f.icon.trim() || row.extracted?.icon || '', debuffOf(row, f), true);
const titleOf = (row, f) => (f.name.en ?? '').trim() || row.extracted?.name.en || row.id;

function renderSheet() {
  const row = rowOf(current);
  if (!row) {
    $('x-sheet').innerHTML = '<div class="empty">Choisir un effet dans le catalogue.</div>';
    return;
  }
  const f = workOf(row);
  const ext = row.extracted;
  const creation = !ext;
  const icon = !row.icon ? 'none' : row.iconEditorial ? 'wiki' : 'game';
  const langField = (kind, l) =>
    kind === 'name'
      ? `<label class="x-lang"><span>${esc(l)}</span><input data-f="name" data-lang="${esc(l)}" value="${esc(f.name[l] ?? '')}" placeholder="${esc(ext?.name[l] ?? '')}" aria-label="Nom — ${esc(l)}" autocomplete="off" /></label>`
      : `<label class="x-lang"><span>${esc(l)}</span><textarea data-f="desc" data-lang="${esc(l)}" placeholder="${esc(ext?.desc[l] ?? '')}" aria-label="Description — ${esc(l)}">${esc(f.desc[l] ?? '')}</textarea></label>`;
  $('x-sheet').innerHTML =
    `<div class="x-who"><span id="x-preview">${preview(row, f)}</span><div class="x-id"><strong id="x-title">${esc(titleOf(row, f))}</strong><span class="x-meta"><span class="mono">${esc(row.id)}</span> · ${esc(fx.origins[row.origin] ?? row.origin)} · ${ICON_SOURCE[icon]}</span><span class="x-badges" id="x-badges">${sheetBadges(row)}</span></div></div>
    ${
      creation
        ? '<p class="hint">Aucune donnée extraite pour cet id : l\'effet est porté en entier par son entrée curée — une mécanique réelle du jeu, sans texte dans les tables (Uncounterable, Elemental Advantage…). Son nom, sa description, son icône et ses clés le définissent.</p>'
        : `<div class="x-ext"><div class="lbl">Ce que le jeu fournit</div>${
            ext.desc.en
              ? `<p class="x-desc">${esc(plain(ext.desc.en))}</p>`
              : '<p class="x-desc none">Pas de description dans les tables.</p>'
          }${
            row.keys.length
              ? `<div class="chips">${row.keys.map((k) => `<span class="chip x-key">${esc(k)}</span>`).join('')}</div>`
              : ''
          }${ext.tooltips.length ? `<p class="x-meta">Tooltips fusionnés : <span class="mono">${esc(ext.tooltips.join(', '))}</span></p>` : ''}</div>`
    }
    <div class="x-block">
      <h3>Nom</h3>
      <p class="hint">${creation ? 'L’anglais est requis.' : 'Vide = le nom extrait, en gris dans le champ.'}</p>
      <div class="x-langs">${fx.langs.map((l) => langField('name', l)).join('')}</div>
    </div>
    <div class="x-block">
      <h3>Description</h3>
      <p class="hint">${creation ? 'Par langue ; sans valeur, l’anglais sert.' : 'Rare : vide = la description extraite.'}</p>
      <div class="x-langs">${fx.langs.map((l) => langField('desc', l)).join('')}</div>
    </div>
    <div class="form">
      <div class="field"><label for="x-icon">Icône (sprite ui/effect)</label><input id="x-icon" data-f="icon" class="w-search mono" list="x-icons" value="${esc(f.icon)}" placeholder="${esc(ext?.icon || 'IG_Buff_AttackUp')}" autocomplete="off" /></div>
      <div class="field"><label for="x-isdebuff">Nature</label><select id="x-isdebuff" data-f="isDebuff">
        <option value=""${f.isDebuff === '' ? ' selected' : ''}>${creation ? 'buff (par défaut)' : `celle de l’extrait (${sideOf(ext.isDebuff)})`}</option>
        <option value="false"${f.isDebuff === 'false' ? ' selected' : ''}>buff</option>
        <option value="true"${f.isDebuff === 'true' ? ' selected' : ''}>debuff</option>
      </select></div>
      <div class="field"><label for="x-tag" id="x-tag-label">Famille éditoriale (${sideOf(debuffOf(row, f))})</label><select id="x-tag" data-f="tag">${tagOptions(row, f)}</select></div>
    </div>
    <div class="field x-wide"><label for="x-keys">Clés éditoriales ({B/…} et {D/…}) — virgule ou retour à la ligne</label><textarea id="x-keys" data-f="keys" class="mono" placeholder="BT_SEAL_COUNTER, UNCOUNTERABLE">${esc(f.keys)}</textarea></div>
    <label class="check"><input type="checkbox" data-f="hidden"${f.hidden ? ' checked' : ''} /> Masquer du site (bruit, interne)</label>
    <div class="field x-wide"><label for="x-note">Note interne</label><textarea id="x-note" data-f="note">${esc(f.note)}</textarea></div>
    <p class="hint">${creation ? 'Une création garde au moins son nom anglais.' : 'Tout vider puis « Enregistrer » retire l’entrée curée : l’extrait fait foi.'}</p>`;
}

// ------------------------------------------------------ la saisie
/** Après une modification de l'effet montré : son point, ses badges, la savebar. */
function afterEdit() {
  const id = current;
  const row = rowOf(id);
  if (!changed(id)) edits.delete(id);
  refused.delete(id);
  const pt = rowButton(id)?.querySelector('.x-pt');
  if (pt) pt.innerHTML = dot(id);
  $('x-badges').innerHTML = sheetBadges(row);
  refreshBar();
}

$('x-sheet').oninput = (e) => {
  const el = e.target;
  const field = el.dataset?.f;
  const row = rowOf(current);
  if (!field || !row) return;
  const f = touch(current);
  if (field === 'name' || field === 'desc') f[field][el.dataset.lang] = el.value;
  else if (field === 'hidden') f.hidden = el.checked;
  else f[field] = el.value;
  // Une frappe ne redessine pas la fiche (le champ garde le curseur) : seuls
  // le titre, la tuile et les familles du côté effectif suivent.
  if (field === 'name') $('x-title').textContent = titleOf(row, f);
  if (field === 'icon' || field === 'isDebuff') $('x-preview').innerHTML = preview(row, f);
  if (field === 'isDebuff') {
    $('x-tag').innerHTML = tagOptions(row, f);
    $('x-tag-label').textContent = `Famille éditoriale (${sideOf(debuffOf(row, f))})`;
  }
  afterEdit();
};

// ------------------------------------------------------ la sélection
function select(id) {
  if (!rowOf(id)) return;
  current = id;
  // L'effet ouvert est dans l'adresse : recharger y revient.
  history.replaceState(null, '', `#effects/${encodeURIComponent(id)}`);
  renderList();
  // Ouvert par l'adresse, il peut être loin dans le catalogue.
  rowButton(id)?.scrollIntoView({ block: 'nearest' });
  renderSheet();
}

$('x-rows').onclick = (e) => {
  const b = e.target.closest('.x-row');
  if (b) select(b.dataset.id);
};

// ------------------------------------------------------ la recherche
let searchTimer;
let searchSeq = 0;

/** Demande au serveur qui répond à la saisie ; seule la dernière demande se dessine. */
async function runSearch() {
  const q = $('x-q').value;
  const seq = ++searchSeq;
  if (!q.trim()) {
    matches = null;
    renderList();
    return;
  }
  try {
    const r = await getJson(`/api/effects/search?q=${encodeURIComponent(q)}`);
    if (seq !== searchSeq) return;
    matches = r.matches;
  } catch (e) {
    log([`Recherche des effets indisponible : ${e}`], false);
    return;
  }
  renderList();
}

$('x-q').oninput = () => {
  clearTimeout(searchTimer);
  // Champ vidé : tout revient aussitôt.
  if (!$('x-q').value.trim()) runSearch();
  else searchTimer = setTimeout(runSearch, SEARCH_DELAY);
};

for (const id of ['x-nature', ...FILTERS.map(([f]) => f)]) $(id).oninput = renderList;

// ------------------------------------------------------ « ＋ effet »
/**
 * Ouvre la fiche vierge d'un effet créé. L'id est forgé par le serveur (la
 * règle de l'admin) ; un id qui existe déjà ne se crée pas, sa fiche s'ouvre.
 */
async function newEffect() {
  const raw = $('x-new-id').value;
  if (!raw.trim()) {
    log(['Un id pour le nouvel effet (ex. UNCOUNTERABLE).'], false);
    return;
  }
  let made;
  try {
    made = await getJson(`/api/effects/id?raw=${encodeURIComponent(raw)}`);
  } catch (e) {
    log([`Création indisponible : ${e}`], false);
    return;
  }
  const { id } = made;
  if (!id) return;
  // Créé ailleurs depuis le chargement de la page : le disque est relu.
  if (made.exists && !rowOf(id)) await loadEffects().catch(() => {});
  if (rowOf(id)) {
    log([`${id} existe déjà : sa fiche est ouverte.`], true);
  } else if (made.exists) {
    log([`${id} existe déjà, mais le catalogue ne le montre pas : recharger la page.`], false);
    return;
  } else {
    drafts.set(id, {
      id,
      name: '',
      icon: '',
      isDebuff: false,
      origin: 'curated',
      iconEditorial: false,
      irremovable: false,
      tag: null,
      family: null,
      overridden: false,
      hidden: false,
      noDesc: true,
      keys: [],
      extracted: null,
      curated: {},
    });
  }
  $('x-new-id').value = '';
  refreshBar();
  select(id);
  $('x-sheet').querySelector('[data-f="name"][data-lang="en"]')?.focus();
}

$('x-new').onclick = newEffect;
$('x-new-id').onkeydown = (e) => {
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault();
    newEffect();
  }
};

// ------------------------------------------------------ l'état
function renderEffects() {
  renderList();
  renderSheet();
  refreshBar();
}

async function loadEffects() {
  fx = await getJson('/api/effects/state');
  byId = new Map(allRows().map((r) => [r.id, r]));
  // Une création enregistrée est sur le disque : elle n'est plus un brouillon.
  for (const id of [...drafts.keys()]) if (byId.has(id)) drafts.delete(id);
  for (const id of [...edits.keys()]) if (!rowOf(id)) edits.delete(id);
  if (current && !rowOf(current)) current = null;
  $('x-icons').innerHTML = fx.icons.map((i) => `<option value="${esc(i)}"></option>`).join('');
}

$('x-reset').onclick = () => {
  edits.clear();
  drafts.clear();
  refused.clear();
  if (current && !rowOf(current)) current = null;
  renderEffects();
};

$('x-save').onclick = async () => {
  const ids = pending();
  if (!ids.length) return;
  const changes = ids.map((id) => ({
    id,
    curated: curatedOf(edits.get(id)),
    was: rowOf(id).curated,
    ...(drafts.has(id) ? { create: true } : {}),
  }));
  $('x-save').disabled = $('x-reset').disabled = true;
  $('x-save').classList.add('busy');
  log([], undefined, 'envoi des effets au serveur');
  try {
    const r = await post('/api/effects', { changes });
    // Le disque fait foi, que tout soit passé ou non : on le relit. Un effet
    // enregistré n'est plus « modifié » ; un refusé garde sa saisie (rien à
    // retaper), marqué d'un point rouge — sauf si le disque avait changé :
    // il montre alors le disque, pour ne pas défaire l'écriture d'un autre.
    refused = new Map((r.refused ?? []).map((id) => [id, r.reasons?.[id] ?? 'Refusé.']));
    await loadEffects();
    for (const id of [...(r.saved ?? []), ...(r.stale ?? [])]) edits.delete(id);
    // Un nom ou une clé a pu changer : la recherche en cours se rejoue.
    if (matches) await runSearch();
  } finally {
    $('x-save').classList.remove('busy');
    renderEffects();
  }
};

/** Quitter l'onglet avec des effets en attente : sur confirmation. */
function effectsLeave() {
  const n = pending().length;
  return (
    !n ||
    confirm(
      `${plural(n, 'effet')} modifié${n > 1 ? 's' : ''}, pas encore enregistré${n > 1 ? 's' : ''}. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.`,
    )
  );
}

sections.register('effects', {
  init: () => {
    // `#effects/<id>` ouvre l'onglet sur la fiche de cet effet (un lien, le
    // banc de captures). `lib.js` ne connaît que `#effects` : c'est le clic sur
    // l'onglet qui l'ouvre.
    const [, open] = /^#effects\/([^/]+)$/.exec(location.hash) ?? [];
    if (open) document.querySelector('#tabs [data-tab="effects"]')?.click();
    // Les icônes sont sous `imgBase`, connu avec `/api/state` : redessinées
    // si l'état en annonce une autre.
    stateLoaded.then(() => {
      if (state.imgBase !== drawnBase && byId.size) renderEffects();
    });
    return loadEffects()
      .then(() => {
        renderEffects();
        if (open) select(decodeURIComponent(open));
      })
      .catch((e) => log([`Effets illisibles : ${e}`], false));
  },
  // Des effets en attente ne survivent pas à un rechargement de la page.
  dirty: () => pending().length,
  canLeave: effectsLeave,
});
