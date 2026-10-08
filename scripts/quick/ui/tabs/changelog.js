// Onglet « Journal du site » : le changelog du site (`changelog.json`) — une
// entrée se pose par gabarit, se traduit, et se relit telle que la page
// `/changelog` la montrera.
import { $, esc, log, post, sections, state, stateLoaded } from '../lib.js';

// `/api/changelog/state` : le fichier curé dans son ordre, le jour UTC, le
// roster (id, nom anglais, slug), les gabarits et leurs champs préremplis, les
// libellés des types et des sortes de lien, les langues (`file` : l'ordre du
// fichier ; `shown` : celui de l'écran).
let data = {
  entries: [],
  today: '',
  roster: [],
  templates: [],
  types: [],
  linkKinds: [],
  langs: { default: 'en', file: ['en'], shown: ['en'] },
};
// La liste en cours d'édition, récent → ancien. Une ligne : { key, date, type,
// draft, title: { langue: texte }, content: { langue: les puces, une par ligne },
// linkKind, linkValue, image, was, base, enAt } — `was` est l'entrée du disque
// dont elle vient (`null` pour une entrée posée ici), `base` ce qu'elle
// enverrait intacte, `enAt` l'anglais de la dernière traduction (ou du
// chargement). Rien ne part tant que « Enregistrer » n'est pas cliqué.
let rows = [];
let removed = []; // entrées du disque retirées, pas encore enregistrées
let issues = new Map(); // clé de ligne → le refus du dernier enregistrement
let opened = new Set(); // les fiches dépliées
let limit = 0; // combien de lignes sont dessinées (cf. `PAGE`)
let form = null; // le gabarit dont le formulaire est ouvert
let seq = 0;
let drawnBase = state.imgBase; // la base du dernier dessin (cf. `init`)
// L'aperçu : une langue pour toutes les fiches, et par ligne sa requête en
// cours, son dernier rendu, son refus.
const pv = { lang: 'en', of: new Map() };
// « Traduire » : les lignes dont la traduction court, et leur dernier refus.
const tr = { busy: new Set(), error: new Map() };

/**
 * Le journal a 150 entrées, six langues chacune : les dessiner toutes, c'est
 * 1 800 champs redessinés à chaque frappe — ce que l'éditeur de l'admin
 * faisait. Ici une entrée est une LIGNE, et la liste n'en dessine que `PAGE` à
 * la fois.
 */
const PAGE = 40;
/** L'aperçu se relance tant de ms après la dernière frappe. */
const PV_DELAY = 400;
/** Assez de suggestions pour choisir, pas le roster entier sous le champ. */
const MAX_HITS = 12;

const plural = (n, one, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;
const def = () => data.langs.default;
/** Les langues à traduire : celles de l'écran, moins l'anglais. */
const others = () => data.langs.shown.filter((l) => l !== def());
/** Les puces d'une zone de texte : une par ligne, les vides ôtées. */
const linesOf = (text) =>
  String(text ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
const typeLabel = (type) => data.types.find((t) => t.value === type)?.label ?? type;
// Le visage du jeu, comme dans Bannières ; décoratif, le nom est à côté.
const face = (id, px) =>
  `<img class="face" src="${esc(state.imgBase)}/images/characters/faceicon/FI_${esc(id)}.webp" alt="" aria-hidden="true" width="${px}" height="${px}" loading="lazy" />`;

// ------------------------------------------------------ le modèle
/** L'entrée que la ligne enverrait : la forme du fichier, langues dans son ordre. */
function toEntry(r) {
  const title = {};
  const content = {};
  for (const l of data.langs.file) {
    const t = (r.title[l] ?? '').trim();
    if (t) title[l] = t;
    const lines = linesOf(r.content[l]);
    if (lines.length) content[l] = lines;
  }
  const value = r.linkValue.trim();
  const link =
    r.linkKind && value
      ? r.linkKind === 'character'
        ? { kind: 'character', slug: value }
        : { kind: r.linkKind, href: value }
      : null;
  const image = r.image.trim();
  return {
    date: r.date,
    type: r.type,
    title,
    content,
    ...(link && { link }),
    ...(image && { image }),
    ...(r.draft && { draft: true }),
  };
}

/** L'anglais d'une ligne — titre et puces —, pour savoir s'il a bougé. */
const enOf = (r) => JSON.stringify([(r.title[def()] ?? '').trim(), ...linesOf(r.content[def()])]);

function fromEntry(e, was = e) {
  const r = {
    key: ++seq,
    date: e.date ?? '',
    type: e.type ?? '',
    draft: e.draft === true,
    title: { ...e.title },
    content: Object.fromEntries(
      Object.entries(e.content ?? {}).map(([l, lines]) => [l, (lines ?? []).join('\n')]),
    ),
    linkKind: e.link?.kind ?? '',
    linkValue: (e.link?.kind === 'character' ? e.link.slug : e.link?.href) ?? '',
    image: e.image ?? '',
    was,
  };
  r.base = JSON.stringify(toEntry(r));
  r.enAt = enOf(r);
  return r;
}

/** Une entrée posée et laissée vide : elle ne compte pas, et ne part pas. */
function blank(r) {
  const e = toEntry(r);
  return !Object.keys(e.title).length && !Object.keys(e.content).length && !e.link && !e.image;
}
const changed = (r) => (r.was ? JSON.stringify(toEntry(r)) !== r.base : !blank(r));
const pending = () => rows.filter(changed).length + removed.length;
/** Des traductions qui datent d'un autre anglais que celui saisi. */
const stale = (r) =>
  enOf(r) !== r.enAt &&
  others().some((l) => (r.title[l] ?? '').trim() || linesOf(r.content[l]).length);
/** Combien de langues portent un titre (`title`) ou des puces (`content`). */
const filled = (r, part) =>
  others().filter((l) =>
    part === 'title' ? (r.title[l] ?? '').trim() : linesOf(r.content[l]).length,
  ).length;

// Récent → ancien ; une entrée sans date reste en tête. Le tri est stable : à
// date égale l'ordre du fichier tient, et le diff reste court.
const byDateDesc = (a, b) => (b.date || '9999').localeCompare(a.date || '9999');

function resetRows() {
  for (const p of pv.of.values()) clearTimeout(p.timer);
  pv.of.clear();
  tr.error.clear();
  rows = data.entries.map((e) => fromEntry(e)).sort(byDateDesc);
  removed = [];
  issues = new Map();
  opened = new Set();
  limit = PAGE;
}

// ------------------------------------------------------ l'aperçu
const pvOf = (r) => {
  let p = pv.of.get(r.key);
  if (!p)
    pv.of.set(r.key, (p = { timer: 0, seq: 0, sent: '', view: null, error: '', busy: false }));
  return p;
};

/**
 * La carte de `/changelog`, d'après `POST /api/changelog/preview` : la vignette
 * (le portrait ou la carte du guide, sinon l'emoji du type), le badge, la date,
 * le titre, les puces en segments (le gras), l'appel du lien — et, en plus de
 * la page, où il mène.
 */
function pvCard(v) {
  const src = v.image ? (v.image.startsWith('/') ? `${state.imgBase}${v.image}` : v.image) : '';
  const thumb = src
    ? `<img src="${esc(src)}" alt="" aria-hidden="true" width="56" height="56" loading="lazy" />`
    : `<span aria-hidden="true">${esc(v.icon)}</span>`;
  const seg = (s) => (s.bold ? `<strong>${esc(s.text)}</strong>` : esc(s.text));
  const bullets = v.bullets.length
    ? `<ul>${v.bullets.map((b) => `<li>${b.map(seg).join('')}</li>`).join('')}</ul>`
    : '';
  const link = v.link
    ? `<div class="j-goto"><span>${esc(v.link.label)} <span aria-hidden="true">→</span></span><span class="lbl mono">${esc(v.link.href)}</span></div>`
    : '';
  return `<div class="j-card"><div class="j-thumb">${thumb}</div><div class="j-card-in"><div class="j-meta"><span class="j-badge j-t-${esc(v.type)}">${esc(v.badge)}</span><span class="j-when">${esc(v.date)}</span></div><div class="j-card-title${v.title ? '' : ' none'}">${esc(v.title || 'sans titre')}</div>${bullets}${link}</div></div>`;
}

/** Le contenu d'un aperçu : le refus, sinon le dernier rendu reçu pour la ligne. */
function pvBody(r) {
  const p = pvOf(r);
  if (p.error) return `<p class="j-pv-ko">Aperçu refusé : ${esc(p.error)}</p>`;
  return p.view ? pvCard(p.view) : '<p class="lbl">Aperçu en cours…</p>';
}

/** L'aperçu de la fiche en place : son atténuation, et `redraw` son contenu. */
function pvPaint(r, redraw) {
  const at = itemEl(r)?.querySelector('[data-pv]');
  if (!at) return;
  at.classList.toggle('busy', pvOf(r).busy);
  if (redraw) at.innerHTML = pvBody(r);
}

/**
 * Demande l'aperçu d'UNE entrée, telle qu'elle partirait à l'enregistrement.
 * Pendant la requête le bloc garde son rendu, atténué ; une réponse arrivée
 * après une requête plus récente est ignorée ; un refus ou un échec réseau
 * s'affiche dans le bloc, et se retente au prochain changement.
 */
async function pvFetch(r) {
  if (!opened.has(r.key) || !rows.includes(r)) return;
  const p = pvOf(r);
  const body = JSON.stringify({ entry: toEntry(r), lang: pv.lang });
  if (body === p.sent) return;
  p.sent = body;
  const n = ++p.seq;
  p.busy = true;
  pvPaint(r, false);
  let error = '';
  try {
    const res = await fetch('/api/changelog/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const out = await res.json();
    if (n !== p.seq) return;
    if (!res.ok || !out.bullets)
      throw new Error(out.error ?? out.log?.[0] ?? `réponse ${res.status}`);
    p.view = out;
  } catch (e) {
    if (n !== p.seq) return;
    error = e instanceof Error ? e.message : String(e);
    p.sent = '';
  }
  p.error = error;
  p.busy = false;
  pvPaint(r, true);
}

/** L'aperçu suit un changement : aussitôt, ou `delay` ms après la dernière frappe. */
function pvAsk(r, delay = 0) {
  const p = pvOf(r);
  clearTimeout(p.timer);
  if (delay) p.timer = setTimeout(() => pvFetch(r), delay);
  else pvFetch(r);
}

$('j-pv-lang').onclick = (e) => {
  const el = e.target.closest('button[data-lang]');
  if (!el || el.dataset.lang === pv.lang) return;
  pv.lang = el.dataset.lang;
  for (const b of el.parentElement.children) b.setAttribute('aria-pressed', String(b === el));
  for (const r of rows) if (opened.has(r.key)) pvAsk(r);
};

// ------------------------------------------------------ une entrée : sa ligne, sa fiche
const itemEl = (r) => $('j-list').querySelector(`.j-item[data-key="${r.key}"]`);
const fid = (r, name) => `j${r.key}-${name}`;
const options = (list, cur) =>
  list
    .map(
      (o) =>
        `<option value="${esc(o.value)}"${o.value === cur ? ' selected' : ''}>${esc(o.label)}</option>`,
    )
    .join('');

/** Pliée, une entrée est une ligne : date, type, titre anglais, lien, états. */
function lineInner(r) {
  const title = (r.title[def()] ?? '').trim();
  const value = r.linkValue.trim();
  const when = r.draft
    ? '<span class="badge warn" title="Jamais publiée, quelle que soit sa date">brouillon</span>'
    : r.date > data.today
      ? '<span class="badge upcoming" title="En ligne à sa date (UTC), une fois le site bâti">programmée</span>'
      : '';
  return `<span class="j-caret" aria-hidden="true">▸</span><span class="j-date">${esc(r.date || 'sans date')}</span><span class="j-badge j-t-${esc(r.type)}">${esc(typeLabel(r.type))}</span><span class="j-title${title ? '' : ' none'}">${esc(title || 'sans titre')}</span>${
    r.linkKind && value
      ? `<span class="j-chip" title="${esc(value)}">${esc(r.linkKind)} · ${esc(value)}</span>`
      : ''
  }${when}${
    issues.has(r.key)
      ? `<span class="badge ko" title="${esc(issues.get(r.key))}">refusée</span>`
      : ''
  }${
    changed(r)
      ? `<span class="dot j-edit" title="${r.was ? 'Modifiée' : 'Nouvelle'}, pas encore enregistrée"></span>`
      : ''
  }`;
}

/** Ce que le champ du lien attend, selon sa sorte. */
const linkHint = (kind) =>
  kind === 'character'
    ? ['Slug du perso', 'chercher un perso, ou son slug']
    : ['Chemin', '/guides/…'];

/** Dépliée, la fiche : les champs, « Traduire », puis l'aperçu. */
function sheetHtml(r) {
  const en = def();
  const langs = others();
  const titles = filled(r, 'title');
  const bullets = filled(r, 'content');
  const busy = tr.busy.has(r.key);
  const [linkLabel, linkPlaceholder] = linkHint(r.linkKind);
  return `<div class="j-sheet">
    <div class="form">
      <div class="field"><label for="${fid(r, 'date')}">Date</label><input type="date" class="w-date" id="${fid(r, 'date')}" data-f="date" value="${esc(r.date)}" /></div>
      <div class="field"><label for="${fid(r, 'type')}">Type</label><select id="${fid(r, 'type')}" data-f="type">${options(data.types, r.type)}</select></div>
      <label class="check"><input type="checkbox" data-f="draft"${r.draft ? ' checked' : ''} />brouillon</label>
      <button class="btn danger sm j-del" type="button" data-act="del">Supprimer</button>
    </div>
    <div class="field"><label for="${fid(r, 't-en')}">Titre (${esc(en)})</label><input id="${fid(r, 't-en')}" data-t="${esc(en)}" value="${esc(r.title[en] ?? '')}" autocomplete="off" /></div>
    <details class="j-more"${titles ? ' open' : ''}>
      <summary><span class="btn ghost sm">Titre — autres langues</span><span class="lbl" data-tally="title">${titles} / ${langs.length}</span></summary>
      <div class="j-grid">${langs
        .map(
          (l) =>
            `<div class="field"><label for="${fid(r, `t-${l}`)}">${esc(l)}</label><input id="${fid(r, `t-${l}`)}" data-t="${esc(l)}" value="${esc(r.title[l] ?? '')}" autocomplete="off" /></div>`,
        )
        .join('')}</div>
    </details>
    <div class="field"><label for="${fid(r, 'j-en')}">Puces (${esc(en)}) — une par ligne ; **gras**</label><textarea id="${fid(r, 'j-en')}" data-c="${esc(en)}">${esc(r.content[en] ?? '')}</textarea></div>
    <div class="j-tr"><button class="btn ghost${busy ? ' busy' : ''}" type="button" data-act="translate"${busy ? ' disabled' : ''} title="Traduit le titre et les puces de CETTE entrée vers les cinq autres langues, et les réécrit toutes (DeepL, puis Claude Haiku). Rien ne s’écrit avant « Enregistrer ».">Traduire</button><span class="badge warn" data-stale>${stale(r) ? 'à retraduire' : ''}</span><span class="badge error" data-tr-error>${esc(tr.error.get(r.key) ?? '')}</span></div>
    <details class="j-more"${bullets ? ' open' : ''}>
      <summary><span class="btn ghost sm">Puces — autres langues</span><span class="lbl" data-tally="content">${bullets} / ${langs.length}</span></summary>
      <div class="j-grid">${langs
        .map(
          (l) =>
            `<div class="field"><label for="${fid(r, `j-${l}`)}">${esc(l)}</label><textarea id="${fid(r, `j-${l}`)}" data-c="${esc(l)}">${esc(r.content[l] ?? '')}</textarea></div>`,
        )
        .join('')}</div>
    </details>
    <div class="form">
      <div class="field"><label for="${fid(r, 'kind')}">Lien</label><select id="${fid(r, 'kind')}" data-f="linkKind">${options(data.linkKinds, r.linkKind)}</select></div>
      <div class="field picker" data-linkbox${r.linkKind ? '' : ' hidden'}><label for="${fid(r, 'link')}" data-link-label>${linkLabel}</label><input class="w-url mono" id="${fid(r, 'link')}" data-f="linkValue" value="${esc(r.linkValue)}" placeholder="${linkPlaceholder}" autocomplete="off" /><div class="results" hidden></div></div>
      <div class="field"><label for="${fid(r, 'image')}">Image (chemin, facultatif — sinon le portrait du perso, la carte du guide ou l’icône du type)</label><input class="w-url mono" id="${fid(r, 'image')}" data-f="image" value="${esc(r.image)}" placeholder="/images/…" autocomplete="off" /></div>
    </div>
    <div class="j-pv"><div class="j-pv-head">Aperçu<span class="lbl">ce que la page /changelog montrera</span></div><div class="j-pv-body${pvOf(r).busy ? ' busy' : ''}" data-pv>${pvBody(r)}</div></div>
  </div>`;
}

const itemClass = (r) =>
  `j-item${opened.has(r.key) ? ' open' : ''}${issues.has(r.key) ? ' ko' : ''}`;
const itemInner = (r) =>
  `<button class="j-line" type="button" data-act="toggle" aria-expanded="${opened.has(r.key)}">${lineInner(r)}</button>${opened.has(r.key) ? sheetHtml(r) : ''}`;

/** Redessine UNE entrée en place — sa ligne, et sa fiche si elle est dépliée. */
function redraw(r) {
  const li = itemEl(r);
  if (!li) return;
  li.className = itemClass(r);
  li.innerHTML = itemInner(r);
}

// ------------------------------------------------------ la liste
/**
 * Le filtre : un type, et un texte cherché dans les titres, les puces, le lien
 * et la date. Une entrée dépliée, ou posée ici et pas encore enregistrée, reste
 * à l'écran quoi qu'il dise — elle ne disparaît pas sous la frappe.
 */
function shown(r) {
  if (!r.was || opened.has(r.key)) return true;
  const type = $('j-type').value;
  if (type && r.type !== type) return false;
  const q = $('j-q').value.trim().toLowerCase();
  return (
    !q ||
    [...Object.values(r.title), ...Object.values(r.content), r.linkValue, r.date]
      .join('\n')
      .toLowerCase()
      .includes(q)
  );
}

function renderSummary() {
  const drafts = rows.filter((r) => r.draft).length;
  const later = rows.filter((r) => !r.draft && r.date > data.today).length;
  $('j-summary').innerHTML =
    `<strong>${plural(rows.length, 'entrée')}</strong>` +
    (drafts ? `<span class="badge warn">${plural(drafts, 'brouillon')}</span>` : '') +
    (later ? `<span class="badge upcoming">${plural(later, 'programmée')}</span>` : '');
}

function renderList() {
  const visible = rows.filter(shown);
  // Une fiche dépliée se dessine même au-delà de la page montrée.
  const drawn = visible.filter((r, i) => i < limit || opened.has(r.key));
  drawnBase = state.imgBase;
  $('j-list').innerHTML = drawn
    .map((r) => `<li class="${itemClass(r)}" data-key="${r.key}">${itemInner(r)}</li>`)
    .join('');
  $('j-empty').hidden = visible.length > 0;
  $('j-empty').textContent = rows.length
    ? 'Aucune entrée ne correspond au filtre.'
    : 'Aucune entrée.';
  $('j-foot').hidden = !visible.length;
  $('j-shown').textContent =
    `${plural(drawn.length, 'entrée montrée', 'entrées montrées')} sur ${visible.length}` +
    (visible.length < rows.length ? ` — ${rows.length} en tout` : '');
  const more = visible.length - drawn.length;
  $('j-more').hidden = more <= 0;
  $('j-more').textContent = `Afficher plus (${Math.min(PAGE, more)})`;
  renderSummary();
}

function refreshBar() {
  const n = pending();
  const no = issues.size;
  $('j-count').innerHTML =
    (n
      ? `<span class="badge edit">${plural(n, 'entrée modifiée', 'entrées modifiées')}</span>`
      : '<span>aucune modification</span>') +
    (no ? `<span class="badge ko">${no} refus</span>` : '');
  $('j-save').disabled = !n;
  // Une entrée posée et encore vide ne compte pas, mais « Annuler » la retire.
  $('j-reset').disabled = !n && !rows.some((r) => !r.was);
}

function render() {
  renderList();
  refreshBar();
}

/** Ce qui ne change qu'avec l'état : les gabarits, le filtre de type, les langues. */
function renderStatic() {
  $('j-templates').innerHTML = data.templates
    .map(
      (t) =>
        `<button class="btn ghost sm" type="button" data-tpl="${esc(t.id)}" aria-pressed="false">＋ ${esc(t.label)}</button>`,
    )
    .join('');
  const type = $('j-type').value;
  $('j-type').innerHTML = `<option value="">Tous les types</option>${options(data.types, type)}`;
  if (!data.langs.shown.includes(pv.lang)) pv.lang = def();
  $('j-pv-lang').innerHTML =
    `<span class="lbl">Aperçu</span><div class="j-seg" role="group" aria-label="Langue de l’aperçu">${data.langs.shown
      .map(
        (l) =>
          `<button type="button" data-lang="${esc(l)}" aria-pressed="${l === pv.lang}">${esc(l)}</button>`,
      )
      .join('')}</div>`;
  renderForm();
}

$('j-q').oninput = $('j-type').onchange = () => {
  limit = PAGE;
  renderList();
};
$('j-more').onclick = () => {
  limit += PAGE;
  renderList();
};

// ------------------------------------------------------ la saisie
const rowOf = (el) => {
  const key = el?.closest?.('.j-item')?.dataset.key;
  return rows.find((r) => String(r.key) === key);
};

/** Les persos du roster dont le nom ou le slug contient la saisie, ceux qui commencent par elle d'abord. */
function rosterHits(q) {
  const starts = (c) => Number(!c.name.toLowerCase().startsWith(q));
  return q.length < 2
    ? []
    : data.roster
        .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
        .sort((a, b) => starts(a) - starts(b))
        .slice(0, MAX_HITS);
}

/** La liste de suggestions sous un champ de recherche de perso. */
function suggest(input, on = true) {
  const box = input.parentElement.querySelector('.results');
  const hits = on ? rosterHits(input.value.trim().toLowerCase()) : [];
  box.innerHTML = hits
    .map(
      (c) =>
        `<div data-id="${esc(c.id)}" data-slug="${esc(c.slug)}">${face(c.id, 24)}<span>${esc(c.name)}</span><span class="lbl mono">${esc(c.slug)}</span></div>`,
    )
    .join('');
  box.hidden = !hits.length;
}

/**
 * Une saisie est entrée dans le modèle : la ligne, ses badges, le compte et
 * l'aperçu suivent. La fiche n'est PAS redessinée — le champ garde le curseur.
 */
function touched(r, li) {
  issues.delete(r.key);
  li.className = itemClass(r);
  li.querySelector('.j-line').innerHTML = lineInner(r);
  const flag = li.querySelector('[data-stale]');
  if (flag) flag.textContent = stale(r) ? 'à retraduire' : '';
  for (const part of ['title', 'content']) {
    const tally = li.querySelector(`[data-tally="${part}"]`);
    if (tally) tally.textContent = `${filled(r, part)} / ${others().length}`;
  }
  renderSummary();
  refreshBar();
  pvAsk(r, PV_DELAY);
}

// `input` et `change` : une case, un menu et une date n'émettent pas tous le
// premier selon le navigateur. Le second ne refait rien que le premier n'ait fait.
$('j-list').oninput = $('j-list').onchange = (e) => {
  const el = e.target;
  const r = rowOf(el);
  if (!r) return;
  const li = el.closest('.j-item');
  if (el.dataset.t) r.title[el.dataset.t] = el.value;
  else if (el.dataset.c) r.content[el.dataset.c] = el.value;
  else if (el.dataset.f === 'draft') r.draft = el.checked;
  else if (el.dataset.f === 'linkKind') {
    r.linkKind = el.value;
    const box = li.querySelector('[data-linkbox]');
    const [label, placeholder] = linkHint(r.linkKind);
    box.hidden = !r.linkKind;
    box.querySelector('[data-link-label]').textContent = label;
    box.querySelector('input').placeholder = placeholder;
    suggest(box.querySelector('input'), false);
  } else if (el.dataset.f === 'linkValue') {
    r.linkValue = el.value;
    // Le lien d'un perso se cherche par son nom ; les autres se tapent.
    if (e.type === 'input') suggest(el, r.linkKind === 'character');
  } else if (el.dataset.f) r[el.dataset.f] = el.value;
  else return;
  touched(r, li);
};

$('j-list').onkeydown = (e) => {
  // Entrée dans le lien d'un perso prend la première suggestion.
  if (e.key !== 'Enter' || e.target.dataset?.f !== 'linkValue' || e.isComposing) return;
  const hit = e.target.parentElement.querySelector('.results [data-slug]');
  if (!hit) return;
  e.preventDefault();
  hit.click();
};

$('j-list').onclick = (e) => {
  const r = rowOf(e.target);
  if (!r) return;
  const hit = e.target.closest('.results [data-slug]');
  if (hit) {
    const input = hit.closest('[data-linkbox]').querySelector('input');
    r.linkValue = input.value = hit.dataset.slug;
    suggest(input, false);
    return touched(r, itemEl(r));
  }
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'toggle') {
    if (opened.has(r.key)) opened.delete(r.key);
    else opened.add(r.key);
    redraw(r);
    if (opened.has(r.key)) pvAsk(r);
  } else if (act === 'del') {
    rows = rows.filter((x) => x !== r);
    if (r.was) removed.push(r.was);
    opened.delete(r.key);
    issues.delete(r.key);
    clearTimeout(pvOf(r).timer);
    pv.of.delete(r.key);
    render();
  } else if (act === 'translate') translate(r);
};

/**
 * « Traduire » : le titre et les puces anglaises de CETTE entrée, d'un seul
 * appel, vers les cinq autres langues. UNE PUCE = UN TEXTE (la règle de
 * `changelog-text.ts`) : le nombre de puces d'une langue suit l'anglais, aucun
 * redécoupage ne peut les mélanger. Le bouton FORCE tout — une langue déjà
 * remplie est réécrite, pas seulement celles qui manquent : c'est pour ça qu'on
 * le clique. Le résultat se pose dans le modèle et ne part qu'à « Enregistrer ».
 */
async function translate(r) {
  if (tr.busy.has(r.key)) return;
  const bullets = linesOf(r.content[def()]);
  const texts = [(r.title[def()] ?? '').trim(), ...bullets];
  tr.error.delete(r.key);
  if (!texts.some(Boolean)) {
    redraw(r);
    return log(['Rien à traduire : ni titre ni puce en anglais.'], true);
  }
  tr.busy.add(r.key);
  redraw(r);
  log([], undefined, `traduction de « ${texts[0] || 'sans titre'} »`);
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texts }),
    });
    const out = await res.json();
    if (!out.results) throw new Error(out.error ?? out.log?.[0] ?? `réponse ${res.status}`);
    const done = [];
    for (const l of others()) {
      const title = out.results[0]?.[l]?.trim();
      // Une puce que le moteur n'a pas rendue garde sa traduction, sinon son
      // anglais : la liste reste alignée, et c'est à relire.
      const was = linesOf(r.content[l]);
      const lines = bullets.map((line, k) => out.results[k + 1]?.[l]?.trim() || was[k] || line);
      const got = bullets.some((_, k) => out.results[k + 1]?.[l]?.trim());
      if (title) r.title[l] = title;
      if (got) r.content[l] = lines.join('\n');
      if (title || got) done.push(l);
    }
    // L'anglais ENVOYÉ fait référence : retouché pendant l'appel, il reste « à retraduire ».
    r.enAt = JSON.stringify(texts);
    log(
      [
        done.length
          ? `${done.join(', ')} : traduit par ${
              out.provider === 'haiku' ? 'Claude Haiku (quota DeepL vide)' : 'DeepL'
            } — à relire, puis « Enregistrer ».`
          : 'Le traducteur n’a rien rendu.',
      ],
      true,
    );
  } catch (e) {
    tr.error.set(r.key, e instanceof Error ? e.message : String(e));
    log([`Traduction refusée : ${tr.error.get(r.key)}`], false);
  } finally {
    tr.busy.delete(r.key);
    if (rows.includes(r)) {
      issues.delete(r.key);
      redraw(r);
      renderSummary();
      refreshBar();
      if (opened.has(r.key)) pvAsk(r);
    }
  }
}

// ------------------------------------------------------ une nouvelle entrée
/**
 * Le formulaire du gabarit choisi, sous les boutons : la recherche du roster
 * pour Perso (le choix pose l'entrée), sinon un champ par champ du gabarit,
 * préremplis par le serveur, et « Poser l'entrée ».
 */
function renderForm() {
  for (const b of $('j-templates').children)
    b.setAttribute('aria-pressed', String(b.dataset.tpl === form?.id));
  const box = $('j-form');
  box.hidden = !form;
  if (!form) {
    box.innerHTML = '';
    return;
  }
  const who = form.fields.find((f) => f.kind === 'character');
  box.innerHTML = who
    ? `<div class="field picker"><label for="j-new-${esc(who.key)}">${esc(who.label)}</label><input class="w-search" id="j-new-${esc(who.key)}" data-pick placeholder="${esc(who.placeholder)}" autocomplete="off" /><div class="results" hidden></div></div><span class="lbl j-form-note">Le choix pose l’entrée : titre dans les six langues, puce en anglais, lien.</span>`
    : `${form.fields
        .map((f) =>
          f.kind === 'choice'
            ? `<div class="field"><label for="j-new-${esc(f.key)}">${esc(f.label)}</label><select id="j-new-${esc(f.key)}" data-v="${esc(f.key)}">${options(f.options, f.value)}</select></div>`
            : `<div class="field"><label for="j-new-${esc(f.key)}">${esc(f.label)}</label><input class="${f.kind === 'month' ? 'w-text' : 'w-search'}" id="j-new-${esc(f.key)}" data-v="${esc(f.key)}" value="${esc(f.value)}" placeholder="${esc(f.placeholder)}" autocomplete="off" /></div>`,
        )
        .join(
          '',
        )}<button class="btn ghost" type="button" data-act="pose">Poser l’entrée</button><span class="lbl j-form-note">Un champ laissé vide reste écrit dans l’entrée ({guide}) : à compléter, refusé sinon.</span>`;
}

/**
 * Pose en tête de liste l'entrée d'un gabarit, remplie par le serveur
 * (`fillTemplate`, cf. `GET /api/changelog/fill`) : la date du jour, le type,
 * le titre, les puces anglaises, le lien. Elle s'ouvre, son aperçu avec.
 */
async function pose(id, values) {
  let fill;
  try {
    const res = await fetch(
      `/api/changelog/fill?${new URLSearchParams({ template: id, ...values })}`,
    );
    fill = await res.json();
    if (!res.ok || fill.error || !fill.link)
      throw new Error(fill.error ?? fill.log?.[0] ?? `réponse ${res.status}`);
  } catch (e) {
    return log([`Gabarit refusé : ${e instanceof Error ? e.message : String(e)}`], false);
  }
  const r = fromEntry(
    {
      date: fill.date,
      type: fill.type,
      title: fill.title,
      content: { [def()]: fill.content },
    },
    null,
  );
  // La sorte de lien est posée même sans valeur : c'est la moitié du geste.
  r.linkKind = fill.link.kind;
  r.linkValue = fill.link.value;
  rows.unshift(r);
  opened.add(r.key);
  form = null;
  renderForm();
  render();
  itemEl(r)?.querySelector(`[data-t="${def()}"]`)?.focus();
  pvAsk(r);
}

$('j-templates').onclick = (e) => {
  const id = e.target.closest('[data-tpl]')?.dataset.tpl;
  const t = data.templates.find((x) => x.id === id);
  if (!t) return;
  // Sans champ, le gabarit pose son entrée d'un clic ; avec, il ouvre son
  // formulaire — et un second clic le referme.
  if (!t.fields.length) return pose(t.id, {});
  form = form?.id === t.id ? null : t;
  renderForm();
  $('j-form').querySelector('input, select')?.focus();
};

const poseForm = () =>
  pose(
    form.id,
    Object.fromEntries(
      [...$('j-form').querySelectorAll('[data-v]')].map((el) => [el.dataset.v, el.value]),
    ),
  );

$('j-form').oninput = (e) => {
  if (e.target.hasAttribute('data-pick')) suggest(e.target);
};
$('j-form').onkeydown = (e) => {
  if (e.key !== 'Enter' || e.isComposing || !form) return;
  // Entrée : la première suggestion du roster, ou l'entrée posée.
  if (e.target.hasAttribute('data-pick')) {
    e.preventDefault();
    $('j-form').querySelector('.results [data-id]')?.click();
  } else if (e.target.dataset?.v && e.target.tagName === 'INPUT') {
    e.preventDefault();
    poseForm();
  }
};
$('j-form').onclick = (e) => {
  if (!form) return;
  const hit = e.target.closest('.results [data-id]');
  if (hit) pose(form.id, { character: hit.dataset.id });
  else if (e.target.closest('[data-act="pose"]')) poseForm();
};

// ------------------------------------------------------ le disque
async function load() {
  data = await (await fetch('/api/changelog/state')).json();
  resetRows();
}

$('j-reset').onclick = () => {
  resetRows();
  render();
};

$('j-save').onclick = async () => {
  if (!pending()) return;
  // La liste est l'ÉTAT COMPLET, dans l'ordre du fichier : récent → ancien. Une
  // entrée intacte repart telle que le disque la porte.
  const sent = rows.filter((r) => !blank(r)).sort(byDateDesc);
  const titleOf = (e) => e.title?.[def()] ?? '';
  const moved = [...rows.filter(changed).map((r) => titleOf(toEntry(r))), ...removed.map(titleOf)];
  $('j-save').disabled = $('j-reset').disabled = true;
  $('j-save').classList.add('busy');
  log([], undefined, 'envoi du journal au serveur');
  try {
    const out = await post('/api/changelog', {
      list: sent.map((r) => (changed(r) ? toEntry(r) : r.was)),
      changed: moved,
    });
    // Un refus n'a rien écrit : les changements restent en attente, l'entrée
    // fautive est marquée. Sinon le disque fait foi, que git ait suivi ou non.
    issues = new Map();
    for (const issue of out.issues ?? []) {
      const key = sent[issue.index]?.key;
      if (key !== undefined)
        issues.set(key, [issues.get(key), issue.message].filter(Boolean).join(' ; '));
    }
    if (out.written) await load();
  } catch (e) {
    log([`Enregistrement du journal interrompu : ${e}`], false);
  } finally {
    $('j-save').classList.remove('busy');
    render();
  }
};

/** Quitter l'onglet avec des changements en attente : sur confirmation. */
function changelogLeave() {
  const n = pending();
  return (
    !n ||
    confirm(
      `${plural(n, 'entrée modifiée', 'entrées modifiées')}, pas encore enregistrée${n > 1 ? 's' : ''}. Quitter l’onglet ? ${n > 1 ? 'Elles restent' : 'Elle reste'} en attente tant que la page n’est pas rechargée.`,
    )
  );
}

sections.register('changelog', {
  init: () => {
    // `#changelog/<n>` ouvre l'onglet sur la fiche de la n-ième entrée de la
    // liste, à partir de 0 — la plus récente (un lien, le banc de captures).
    // `lib.js` ne connaît que `#changelog` : c'est le clic sur l'onglet qui l'ouvre.
    const [, at] = /^#changelog\/(\d+)$/.exec(location.hash) ?? [];
    if (at) document.querySelector('#tabs [data-tab="changelog"]')?.click();
    // Les visages et les vignettes sont sous `imgBase`, connu avec
    // `/api/state` : redessinés si l'état en annonce une autre.
    stateLoaded.then(() => {
      if (state.imgBase !== drawnBase && data.today) render();
    });
    return load()
      .then(() => {
        renderStatic();
        const r = at ? rows[Number(at)] : null;
        if (r) {
          opened.add(r.key);
          limit = Math.max(PAGE, Number(at) + 1);
        }
        render();
        if (r) pvAsk(r);
      })
      .catch((e) => log([`Journal du site illisible : ${e}`], false));
  },
  // Des changements en attente ne survivent pas à un rechargement de la page.
  dirty: () => pending(),
  canLeave: changelogLeave,
});
