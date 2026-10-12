// Onglet « Extraction » : la revue de maintenance de l'admin — l'extraction
// fraîche des tables du jeu contre ce que le site committe —, cible par cible,
// et ses gestes : confirmer une extraction, appliquer ses retouches mineures,
// intégrer ou retirer un item. Chaque geste écrit et COMMITTE. Rien ne se
// saisit : la page n'est jamais « sale ».
import { $, esc, getJson, log, post, sections } from '../lib.js';

let ov = null; // la vue d'ensemble : `/api/extractor`
let tg = null; // la cible ouverte : `/api/extractor/target`
let current = null; // l'id de la cible ouverte
let status = ''; // le statut filtré ; '' : tout
let limit = 0; // le nombre de lignes dessinées (cf. `PAGE`)
let busy = false; // un geste tourne : les autres attendent
let seq = 0; // la dernière lecture d'une cible est la seule qui se dessine
const opened = new Set(); // les clés des entités dépliées

/** Les entités se dessinent par pages : une cible peut en porter des centaines. */
const PAGE = 100;
/** La recherche part après la dernière frappe. */
const SEARCH_DELAY = 200;

const STATUSES = [
  ['', 'tout'],
  ['new', 'new'],
  ['diff', 'diff'],
  ['minor', 'minor'],
  ['typo', 'typo'],
  ['removed', 'removed'],
];
/** La teinte du badge d'un statut : les vrais écarts en rouge, le nouveau en accent, le reste discret. */
const TONE = { new: 'edit', diff: 'ko', minor: 'off', typo: 'off', removed: 'ko' };

const plural = (n, one, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

const targetHash = (id, key) =>
  `#extractor${id ? `/${encodeURIComponent(id)}` : ''}${key ? `/${encodeURIComponent(key)}` : ''}`;

/** `#extractor`, `#extractor/<cible>`, `#extractor/<cible>/<clé>`. */
function parseHash(hash) {
  const m = /^#extractor(?:\/([^/]+))?(?:\/(.+))?$/.exec(hash);
  if (!m) return null;
  const part = (s) => {
    if (s === undefined) return null;
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  return { id: part(m[1]), key: part(m[2]) };
}

// ------------------------------------------------------ la vue d'ensemble
const cell = (n, kind) => `<td class="ex-n ${kind}${n ? '' : ' zero'}">${n}</td>`;

function renderOverview() {
  const rows = ov?.targets ?? [];
  $('ex-tables').innerHTML = ov
    ? ov.tables
      ? '<span class="badge ok">tables du jeu présentes</span>'
      : `<span class="badge warn">${esc(ov.reason ?? 'tables du jeu absentes')}</span>`
    : '';
  $('ex-tbody').innerHTML = rows
    .map((t) => {
      const b = t.buckets;
      const quiet = !t.actionable && !t.soft;
      return `<tr class="${quiet ? 'ex-quiet' : ''}" data-id="${esc(t.id)}"><td><span class="ex-tlabel"><strong>${esc(t.label)}</strong>${t.site ? '<span class="ex-scope">périmètre du site</span>' : ''}</span></td><td class="code">${esc(t.file)}</td>${cell(b.new, 'new')}${cell(b.diff, 'diff')}${cell(b.minor, 'minor')}${cell(b.typo, 'typo')}${cell(b.removed, 'removed')}<td class="ex-n">${t.committed}</td><td>${
        quiet && ov.tables ? '<span class="lbl">rien à revoir</span> ' : ''
      }<button type="button" class="btn ghost sm" data-open="${esc(t.id)}">Ouvrir</button></td></tr>`;
    })
    .join('');
  $('ex-ov-empty').hidden = rows.length > 0;
}

async function loadOverview() {
  const btn = $('ex-refresh');
  btn.disabled = true;
  btn.classList.add('busy');
  try {
    ov = await getJson('/api/extractor');
    renderOverview();
  } catch (e) {
    log([`Extraction illisible : ${e}`], false);
  } finally {
    btn.disabled = false;
    btn.classList.remove('busy');
  }
}

$('ex-refresh').onclick = loadOverview;
$('ex-tbody').onclick = (e) => {
  const id = e.target.closest('[data-open]')?.dataset.open ?? e.target.closest('tr')?.dataset.id;
  if (id) openTarget(id);
};

// ------------------------------------------------------ le diff
/** Des segments de mots en spans : retiré, ajouté, inchangé ; la couleur du jeu posée. */
const segs = (list) =>
  list
    .map(
      (s) =>
        `<span class="ex-w${s.kind === 'removed' ? ' rm' : s.kind === 'added' ? ' ad' : ''}"${s.color ? ` style="color:${esc(s.color)}"` : ''}>${esc(s.text)}</span>`,
    )
    .join('');

/** Un arbre : une ligne par clé, indentée par sa profondeur (`--d`). */
const tree = (lines) =>
  lines
    .map(
      (l) =>
        `<div class="ex-tl${l.value ? '' : ' branch'}${l.absent ? ' absent' : ''}" style="--d:${l.depth}">${
          l.key ? `<span class="ex-tk">${esc(l.key)}${l.value ? ':' : ''}</span>` : ''
        }${
          l.value
            ? `<span class="ex-tv">${segs(l.value)}${l.label ? ` <span class="ex-tlabel-id">— ${esc(l.label)}</span>` : ''}</span>`
            : `<span class="ex-tcount">(${l.count ?? 0})</span>`
        }</div>`,
    )
    .join('');

function fieldHtml(f) {
  const body =
    f.kind === 'text'
      ? `<div class="ex-text del"><span class="ex-side">existant</span>${segs(f.existing)}</div><div class="ex-text add"><span class="ex-side">extrait</span>${segs(f.extracted)}</div>`
      : `<div class="ex-trees"><div class="ex-tree del"><span class="ex-side">existant</span>${tree(f.existing)}</div><div class="ex-tree add"><span class="ex-side">extrait</span>${tree(f.extracted)}</div></div>`;
  return `<div class="ex-field"><span class="ex-fname">${esc(f.name)}</span>${body}</div>`;
}

/** Le titre d'un groupe : la racine, puis l'élément résolu (« skills › Fire Strike »). */
function groupTitle(g) {
  const cut = g.title.indexOf(' › ');
  if (cut < 0) return esc(g.title);
  return `${esc(g.title.slice(0, cut))} › <span class="ex-glabel">${esc(g.title.slice(cut + 3))}</span>`;
}

const diffHtml = (groups) =>
  groups.length
    ? `<div class="ex-diff">${groups
        .map(
          (g) =>
            `<div class="ex-group"><div class="ex-gtitle">${groupTitle(g)}</div>${g.fields.map(fieldHtml).join('')}</div>`,
        )
        .join('')}</div>`
    : '';

// ------------------------------------------------------ la cible
const isItem = () => tg?.id === 'item';

function rowHtml(e) {
  const open = opened.has(e.key);
  const fields = e.status === 'new' || e.status === 'removed' ? '' : plural(e.fields, 'champ');
  const action = isItem()
    ? `<button type="button" class="btn ghost sm" data-item="${esc(e.key)}"${busy || !tg.tables ? ' disabled' : ''}>${e.status === 'removed' ? 'Retirer' : 'Intégrer'}</button>`
    : '';
  return `<div class="ex-row" data-key="${esc(e.key)}"><div class="ex-line"><button type="button" class="ex-toggle" data-key="${esc(e.key)}" aria-expanded="${open}"><span class="badge ${TONE[e.status] ?? 'off'}">${esc(e.status)}</span><span class="ex-name">${esc(e.name)}</span><span class="ex-key">${esc(e.key)}</span><span class="ex-fields">${fields}</span><span class="ex-chev" aria-hidden="true">▶</span></button>${action}</div>${open ? diffHtml(e.diff) : ''}</div>`;
}

function renderStatuses() {
  const b = tg?.buckets ?? {};
  $('ex-status').innerHTML = STATUSES.map(
    ([value, label]) =>
      `<button type="button" data-status="${value}" aria-pressed="${status === value}">${label}<span class="ex-c">${value ? (b[value] ?? 0) : (tg?.total ?? 0)}</span></button>`,
  ).join('');
}

function renderHead() {
  const b = tg.buckets;
  $('ex-title').textContent = tg.label;
  $('ex-meta').textContent = `data/generated/${tg.file}`;
  const badges = [];
  if (!tg.tables)
    badges.push(`<span class="badge warn">${esc(tg.reason ?? 'tables absentes')}</span>`);
  else if (!tg.total) badges.push('<span class="badge ok">rien à revoir</span>');
  if (b.new) badges.push(`<span class="badge edit">${b.new} new</span>`);
  if (b.diff) badges.push(`<span class="badge ko">${b.diff} diff</span>`);
  if (b.minor) badges.push(`<span class="badge off">${b.minor} minor</span>`);
  if (b.typo) badges.push(`<span class="badge off">${b.typo} typo</span>`);
  if (b.removed) badges.push(`<span class="badge ko">${b.removed} removed</span>`);
  $('ex-badges').innerHTML = badges.join('');
  const soft = b.minor + b.typo;
  const minor = $('ex-minor');
  minor.hidden = !tg.tables || !soft;
  minor.textContent = `Appliquer les retouches mineures (${soft})`;
  minor.disabled = busy;
  const accept = $('ex-accept');
  accept.hidden = !tg.tables || !tg.total;
  accept.disabled = busy;
  $('ex-note').textContent = tg.site
    ? 'Les monstres sont comptés au périmètre du SITE (ceux qu’une page sert) ; « Confirmer l’extraction » écrit quand même le fichier entier, toute l’extraction.'
    : isItem()
      ? 'Un item s’intègre ou se retire un par un, par sa ligne ; « Confirmer l’extraction » écrit tout le catalogue d’un coup.'
      : 'Les retouches mineures (texte reformulé sans nombre changé, costume ajouté, coquille) s’appliquent d’un geste ; les vrais écarts attendent « Confirmer l’extraction », tout ou rien par fichier.';
  $('ex-plan').hidden = true;
}

function renderList() {
  const rows = tg?.entities ?? [];
  const drawn = Math.min(rows.length, limit);
  $('ex-rows').innerHTML = rows.slice(0, drawn).map(rowHtml).join('');
  $('ex-empty').hidden = rows.length > 0;
  $('ex-empty').textContent = tg?.tables
    ? 'Aucune entité ne correspond.'
    : (tg?.reason ?? 'Tables du jeu absentes sur ce poste.');
  $('ex-foot').hidden = rows.length <= drawn;
  $('ex-shown').textContent = `${drawn} lignes montrées sur ${rows.length}`;
  $('ex-more').textContent = `${Math.min(PAGE, rows.length - drawn)} de plus`;
  const filtering = Boolean(status) || Boolean($('ex-q').value.trim());
  $('ex-total').textContent = tg
    ? filtering
      ? `${tg.shown} sur ${plural(tg.total, 'entité')}`
      : tg.total
        ? `${plural(tg.total, 'entité')} à revoir`
        : 'rien à revoir'
    : '';
}

function renderTarget() {
  renderHead();
  renderStatuses();
  renderList();
}

/** Lit la cible ouverte avec ses filtres ; seule la dernière demande se dessine. */
async function loadTarget() {
  if (!current) return;
  const mine = ++seq;
  const q = $('ex-q').value.trim();
  const url = `/api/extractor/target?id=${encodeURIComponent(current)}${status ? `&status=${status}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  try {
    const got = await getJson(url);
    if (mine !== seq) return;
    tg = got;
    renderTarget();
  } catch (e) {
    if (mine === seq) log([`Cible illisible : ${e}`], false);
  }
}

/** Une clé demandée par l'adresse : sa ligne dépliée, amenée à l'écran. */
function reveal(key) {
  if (!tg) return;
  const at = tg.entities.findIndex((e) => e.key === key);
  if (at < 0) return;
  opened.add(key);
  if (at >= limit) limit = Math.ceil((at + 1) / PAGE) * PAGE;
  renderList();
  [...$('ex-rows').querySelectorAll('.ex-row')]
    .find((r) => r.dataset.key === key)
    ?.scrollIntoView({ block: 'nearest' });
}

async function openTarget(id, key = null) {
  if (id !== current) {
    current = id;
    status = '';
    $('ex-q').value = '';
    opened.clear();
    limit = PAGE;
    tg = null;
    $('ex-assets').hidden = true;
  }
  history.replaceState(null, '', targetHash(id, key));
  $('ex-overview').hidden = true;
  $('ex-target').hidden = false;
  $('ex-rows').innerHTML = '';
  $('ex-empty').hidden = false;
  $('ex-empty').textContent = 'Lecture…';
  await loadTarget();
  if (key) reveal(key);
}

function showOverview() {
  current = null;
  tg = null;
  $('ex-target').hidden = true;
  $('ex-overview').hidden = false;
  history.replaceState(null, '', targetHash());
  return loadOverview();
}

$('ex-back').onclick = showOverview;

$('ex-rows').onclick = (e) => {
  const item = e.target.closest('[data-item]');
  if (item) {
    integrate(item.dataset.item, item.textContent.trim() === 'Retirer');
    return;
  }
  const b = e.target.closest('.ex-toggle');
  if (!b) return;
  const key = b.dataset.key;
  if (opened.has(key)) opened.delete(key);
  else opened.add(key);
  history.replaceState(null, '', targetHash(current, opened.has(key) ? key : null));
  const row = b.closest('.ex-row');
  const entity = tg.entities.find((x) => x.key === key);
  if (row && entity) row.outerHTML = rowHtml(entity);
};

$('ex-more').onclick = () => {
  limit += PAGE;
  renderList();
};

$('ex-status').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  status = b.dataset.status;
  limit = PAGE;
  loadTarget();
};

let searchTimer;
$('ex-q').oninput = () => {
  clearTimeout(searchTimer);
  limit = PAGE;
  searchTimer = setTimeout(loadTarget, $('ex-q').value.trim() ? SEARCH_DELAY : 0);
};

// ------------------------------------------------------ les gestes
/** Le bilan d'images d'un geste, dans sa carte ; sans bilan, elle reste cachée. */
function showAssets(a) {
  if (!a) return;
  const n = a.missing?.length ?? 0;
  $('ex-assets-text').textContent =
    `${plural(a.staged, 'produite')}, ${plural(a.restaged, 'refaite')}, ${a.present} déjà là${n ? `, ${plural(n, 'manquante')}` : ''}.`;
  $('ex-assets-missing').innerHTML = (a.missing ?? [])
    .map((m) => `<li><code>${esc(m.key)}</code> — ${esc(m.reason)}</li>`)
    .join('');
  $('ex-assets').hidden = false;
}

$('ex-assets-close').onclick = () => ($('ex-assets').hidden = true);

/** Pendant un geste, aucun autre ne part ; après, la cible et les comptes se relisent. */
async function gesture(doing, path, payload) {
  if (busy) return null;
  busy = true;
  renderHead();
  for (const b of $('ex-rows').querySelectorAll('[data-item]')) b.disabled = true;
  log([], undefined, doing);
  let r = null;
  try {
    r = await post(path, payload);
  } finally {
    busy = false;
    // Le disque fait foi : la cible est relue, refus `stale` compris.
    await loadTarget();
    if (r?.assets) showAssets(r.assets);
  }
  return r;
}

const bk = () => tg?.buckets ?? {};

$('ex-minor').onclick = () => {
  if (!tg) return;
  const soft = bk().minor + bk().typo;
  gesture(
    `${tg.label} : ${plural(soft, 'retouche mineure', 'retouches mineures')} dans data/generated/${tg.file}, puis commit`,
    '/api/extractor/accept',
    { id: tg.id, mode: 'minor', was: tg.was },
  );
};

$('ex-accept').onclick = () => {
  if (!tg) return;
  const parts = [];
  if (bk().new)
    parts.push(
      `${plural(bk().new, 'entité nouvelle', 'entités nouvelles')} écrite${bk().new > 1 ? 's' : ''}`,
    );
  const changed = bk().diff + bk().minor + bk().typo;
  if (changed)
    parts.push(
      `${plural(changed, 'entité modifiée', 'entités modifiées')} (dont ${bk().minor} mineure${bk().minor > 1 ? 's' : ''} et ${bk().typo} coquille${bk().typo > 1 ? 's' : ''}) réécrite${changed > 1 ? 's' : ''}`,
    );
  if (bk().removed)
    parts.push(
      `${plural(bk().removed, 'entité retirée', 'entités retirées')} SUPPRIMÉE${bk().removed > 1 ? 'S' : ''}`,
    );
  $('ex-plan-text').textContent =
    `Écrire l’extraction fraîche ENTIÈRE dans data/generated/${tg.file}${tg.site ? ' — toute l’extraction, pas seulement le périmètre du site' : ''} : ${parts.join(', ') || 'aucun écart'} — tout ou rien, puis un commit « chore(extractor): ${tg.id} — extraction confirmee ».`;
  $('ex-plan').hidden = false;
  $('ex-plan-go').focus();
};

$('ex-plan-cancel').onclick = () => ($('ex-plan').hidden = true);
$('ex-plan-go').onclick = () => {
  if (!tg) return;
  $('ex-plan').hidden = true;
  gesture(
    `${tg.label} : écriture de l’extraction entière dans data/generated/${tg.file}, puis commit`,
    '/api/extractor/accept',
    { id: tg.id, mode: 'all', was: tg.was },
  );
};

function integrate(key, removing) {
  if (!tg) return;
  const e = tg.entities.find((x) => x.key === key);
  const name = e ? `${e.name} (${key})` : key;
  gesture(
    `${name} : ${removing ? 'retrait de' : 'intégration dans'} data/generated/items.json, puis commit`,
    '/api/extractor/item',
    { key, was: tg.was },
  );
}

// Les boutons qui renvoient à une autre section (« Ouvrir Patch »).
$('tab-extractor').addEventListener('click', (e) => {
  const to = e.target.closest('[data-go]')?.dataset.go;
  if (to) sections.go(to);
});

// ------------------------------------------------------ l'onglet
let wanted = null; // ce que le hash demandait au démarrage

/** Ce que le hash demande : la vue d'ensemble, une cible, une entité. */
function route() {
  // Le clic d'`init` a réduit l'adresse à `#extractor` : ce qu'elle demandait
  // est gardé (`wanted`) pour cette première venue.
  const here = parseHash(location.hash);
  const to = here?.id ? here : (wanted ?? here);
  wanted = null;
  if (to?.id) return openTarget(to.id, to.key);
  return showOverview();
}

sections.register('extractor', {
  init: () => {
    // `#extractor/<cible>` ouvre l'onglet sur cette cible (le tableau de bord,
    // le banc de captures). `lib.js` ne connaît que `#extractor` : c'est le
    // clic sur l'onglet qui l'ouvre, et l'adresse demandée y revient.
    wanted = parseHash(location.hash);
    if (wanted?.id) {
      const hash = location.hash;
      document.querySelector('#tabs [data-tab="extractor"]')?.click();
      history.replaceState(null, '', hash);
    }
  },
  // À chaque venue à l'écran : la vue d'ensemble ou la cible que l'adresse
  // demande — `sections.go('extractor/<cible>')` passe par ici aussi.
  open: route,
});
