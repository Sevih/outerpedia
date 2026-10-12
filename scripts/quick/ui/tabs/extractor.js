// Onglet « Extraction » : la revue de maintenance de l'admin — l'extraction
// fraîche des tables du jeu contre ce que le site committe —, cible par cible,
// et ses gestes : confirmer une extraction, appliquer ses retouches mineures,
// intégrer ou retirer un item. Puis la FICHE d'une entité — un perso, un
// monstre, une famille d'équipement — : ce que le jeu en dit, son écart, et
// « Intégrer », qui l'écrit ; et « Intégrer un mode » sur la cible monster.
// Un monstre a de plus son bloc « Versions » : ses archives figées, qui les
// épingle, et « Figer et ré-épingler » — le plan des guides touchés AVANT de
// figer, la note, puis le rapport. Chaque geste écrit et COMMITTE. Rien ne se
// saisit que la note d'une archive : la page n'est jamais « sale ».
import { $, esc, getJson, log, post, sections, state } from '../lib.js';
import { gameText } from '../gear-view.mjs';

let ov = null; // la vue d'ensemble : `/api/extractor`
let tg = null; // la cible ouverte : `/api/extractor/target`
let current = null; // l'id de la cible ouverte
let status = ''; // le statut filtré ; '' : tout
let limit = 0; // le nombre de lignes dessinées (cf. `PAGE`)
let busy = false; // un geste tourne : les autres attendent
let seq = 0; // la dernière lecture d'une cible est la seule qui se dessine
const opened = new Set(); // les clés des entités dépliées
let en = null; // la fiche ouverte : `/api/extractor/entity`
let enAt = null; // `{ target, key }` de la fiche ouverte
let enSeq = 0; // la dernière lecture d'une fiche est la seule qui se dessine
let enPending = null; // `cible/clé` de la fiche en cours de lecture
let modePlan = null; // le plan d'« Intégrer un mode » montré
let fz = null; // le plan de « Figer et ré-épingler » du monstre ouvert : `/api/extractor/freeze`
let fzWhy = ''; // pourquoi il n'y a pas de plan (monstre pas encore committé, lecture en échec)
let fzOpen = false; // le plan est à l'écran
let fzReport = null; // le rapport du dernier figeage de cette fiche

/** Les entités se dessinent par pages : une cible peut en porter des centaines. */
const PAGE = 100;
/** La recherche part après la dernière frappe. */
const SEARCH_DELAY = 200;
/** Les ids d'un plan de mode montrés avant « n de plus ». */
const MODE_IDS_SHOWN = 40;

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
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/** Une image du site, sous `imgBase`. */
const src = (path) => `${esc(state.imgBase)}/images/${esc(path)}.webp`;
/**
 * Une adresse que le serveur a résolue : une image du site (`/images/…`) passe
 * sous `imgBase` ; un sprite brut (`/api/sprite/…`) est celui de quick.
 */
const srcAt = (path) => esc(path.startsWith('/images/') ? `${state.imgBase}${path}` : path);

const targetHash = (id, key) =>
  `#extractor${id ? `/${encodeURIComponent(id)}` : ''}${key ? `/${encodeURIComponent(key)}` : ''}`;

/** `#extractor`, `#extractor/<cible>`, `#extractor/<cible>/<clé>` (et `…/monster/<id>/freeze`). */
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

/** Les trois vues : une seule à l'écran. */
function showView(which) {
  $('ex-overview').hidden = which !== 'overview';
  $('ex-target').hidden = which !== 'target';
  $('ex-entity').hidden = which !== 'entity';
  if (which === 'overview') $('ex-assets').hidden = true;
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
    : tg?.sheet
      ? `<button type="button" class="btn ghost sm" data-sheet="${esc(e.key)}">Fiche</button>`
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
    ? 'Les monstres sont comptés au périmètre du SITE (ceux qu’une page sert) ; « Confirmer l’extraction » écrit quand même le fichier entier, toute l’extraction. « Fiche » : les stats, les rencontres, les skills, les archives et « Intégrer » d’un monstre.'
    : isItem()
      ? 'Un item s’intègre ou se retire un par un, par sa ligne ; « Confirmer l’extraction » écrit tout le catalogue d’un coup.'
      : tg.sheet
        ? 'Les retouches mineures (texte reformulé sans nombre changé, costume ajouté, coquille) s’appliquent d’un geste ; les vrais écarts attendent « Confirmer l’extraction », tout ou rien par fichier — ou « Fiche », puis « Intégrer » : cette seule entité.'
        : 'Les retouches mineures (texte reformulé sans nombre changé, costume ajouté, coquille) s’appliquent d’un geste ; les vrais écarts attendent « Confirmer l’extraction », tout ou rien par fichier.';
  $('ex-plan').hidden = true;
  renderMode();
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
    modePlan = null;
    $('ex-assets').hidden = true;
  }
  en = null;
  enAt = null;
  history.replaceState(null, '', targetHash(id, key));
  showView('target');
  $('ex-rows').innerHTML = '';
  $('ex-empty').hidden = false;
  $('ex-empty').textContent = 'Lecture…';
  await loadTarget();
  if (key) reveal(key);
}

function showOverview() {
  current = null;
  tg = null;
  en = null;
  enAt = null;
  showView('overview');
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
  const sheet = e.target.closest('[data-sheet]');
  if (sheet) {
    openEntity(current, sheet.dataset.sheet);
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

// ------------------------------------------------------ « Intégrer un mode »
/** La carte du mode : la cible monster seule, son select, le plan montré s'il y en a un. */
function renderMode() {
  const modes = tg?.modes ?? [];
  const card = $('ex-mode');
  card.hidden = !tg?.tables || !modes.length;
  if (card.hidden) {
    modePlan = null;
    $('ex-mode-box').hidden = true;
    return;
  }
  const select = $('ex-mode-select');
  const chosen = select.value;
  select.innerHTML = modes
    .map((m) => `<option value="${esc(m.value)}">${esc(m.label)}</option>`)
    .join('');
  select.value = modes.some((m) => m.value === chosen) ? chosen : modes[0].value;
  $('ex-mode-plan').disabled = busy;
  $('ex-mode-go').disabled = busy;
  $('ex-mode-box').hidden = !modePlan || modePlan.mode !== select.value;
}

$('ex-mode-select').onchange = () => {
  modePlan = null;
  $('ex-mode-box').hidden = true;
};

$('ex-mode-plan').onclick = async () => {
  const mode = $('ex-mode-select').value;
  if (!mode || busy) return;
  const btn = $('ex-mode-plan');
  btn.disabled = true;
  btn.classList.add('busy');
  try {
    modePlan = await getJson(`/api/extractor/mode?mode=${encodeURIComponent(mode)}`);
  } catch (e) {
    modePlan = null;
    log([`Plan du mode illisible : ${e}`], false);
    return;
  } finally {
    btn.disabled = false;
    btn.classList.remove('busy');
  }
  const p = modePlan;
  $('ex-mode-text').textContent = p.count
    ? `Écrire ${plural(p.count, 'monstre')} du mode ${p.label} dans data/generated/monsters.json, monster-skills.json et encounters.json (les spawnés, puis leurs adds), re-dériver damage et solver, puis un commit « ${p.commit} ».`
    : `Aucun monstre ne spawne dans le mode ${p.label} : rien à écrire.`;
  const shown = p.ids.slice(0, MODE_IDS_SHOWN);
  $('ex-mode-ids').innerHTML =
    shown
      .map(
        (m) =>
          `<span class="ex-mode-id${m.add ? ' add' : ''}" title="${m.add ? 'add : invoqué ou lié' : 'spawne dans le mode'}"><code>${esc(m.id)}</code> ${esc(m.name)}</span>`,
      )
      .join('') +
    (p.ids.length > shown.length
      ? `<span class="lbl">… ${p.ids.length - shown.length} de plus</span>`
      : '');
  $('ex-mode-go').hidden = !p.count;
  $('ex-mode-box').hidden = false;
  if (p.count) $('ex-mode-go').focus();
};

$('ex-mode-cancel').onclick = () => {
  modePlan = null;
  $('ex-mode-box').hidden = true;
};
$('ex-mode-go').onclick = () => {
  if (!modePlan || !tg) return;
  const p = modePlan;
  modePlan = null;
  $('ex-mode-box').hidden = true;
  gesture(
    `mode ${p.label} : intégration de ${plural(p.count, 'monstre')} dans data/generated, re-dérivation, puis commit`,
    '/api/extractor/mode',
    { mode: p.mode, was: p.was },
  );
};

// ------------------------------------------------------ la fiche
/** La tuile d'un effet : fond noir, l'icône en masque teinté de sa nature (celle des Monstres). */
function fxTile(icon, isDebuff) {
  if (!icon) return '<span class="ex-fx none" aria-hidden="true"></span>';
  const url = esc(
    `${state.imgBase}/${en.effectSprite}/${encodeURIComponent(icon).replace(/['()]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}.webp`,
  );
  if (icon.includes('Interruption'))
    return `<span class="ex-fx" aria-hidden="true"><img src="${url}" alt="" loading="lazy" /></span>`;
  return `<span class="ex-fx ${isDebuff ? 'debuff' : 'buff'}" style="--ex-src: url('${url}')" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

const chipHtml = (c) =>
  `<span class="chip ex-chip" title="${esc(c.ref)}">${fxTile(c.icon, c.isDebuff)}<span class="ex-chn">${esc(c.name)}</span></span>`;

const env = () => ({ imgBase: state.imgBase, esc });
/** Une description de skill, sans les sauts de ligne qui la terminent. */
const skillDesc = (desc) => desc.replace(/(?:\\n|\s)+$/, '');

/** Les cartes de skills, deux par rangée : icône, nom, id · type, la description du jeu, les chips. */
const cardsHtml = (cards) =>
  cards.length
    ? `<div class="ex-cols">${cards
        .map(
          (c) =>
            `<div class="card ex-skill" data-kit="${esc(c.id)}"><div class="card-head">${
              c.iconSrc
                ? `<img class="ex-skico" src="${srcAt(c.iconSrc)}" alt="" aria-hidden="true" width="36" height="36" />`
                : ''
            }<strong>${esc(c.name)}</strong><span class="lbl ex-skid">${esc(c.id)} · ${esc(c.typeLabel)}</span></div><div class="ex-body">${
              c.desc ? `<p class="ex-desc">${gameText(env(), skillDesc(c.desc))}</p>` : ''
            }${c.chips.length ? `<div class="ex-chips">${c.chips.map(chipHtml).join('')}</div>` : ''}</div></div>`,
        )
        .join('')}</div>`
    : '<div class="empty">Aucune carte de skill.</div>';

/** Une carte de section de la fiche : un titre, un badge de compte, son corps. */
const section = (title, body, { count, cls = '' } = {}) =>
  `<div class="card pad ex-sec ${cls}"><div class="ex-sec-head"><strong>${esc(title)}</strong>${
    count !== undefined ? `<span class="badge off">${count}</span>` : ''
  }</div>${body}</div>`;

/** Une icône d'élément ou de classe du site, suivie de son slug. */
const trait = (file, slug) =>
  `<span class="ex-trait"><img src="${src(`ui/${file}${cap(slug)}`)}" alt="" aria-hidden="true" width="18" height="18" />${esc(slug)}</span>`;

const stars = (n) =>
  `<span class="ex-stars" title="${n}★">${`<img src="${src('ui/star/CM_icon_star_y')}" alt="" aria-hidden="true" />`.repeat(n)}</span>`;

/** La grille des stats : une cellule par stat, son abréviation puis sa valeur. */
const gridHtml = (cells) =>
  `<div class="ex-grid">${cells
    .map(
      (c) =>
        `<div class="ex-cell"><span class="ex-cell-k">${esc(c.abbr)}</span><span class="ex-cell-v">${esc(c.value)}${
          c.bars ? `<span class="lbl"> × ${c.bars} barres</span>` : ''
        }</span></div>`,
    )
    .join('')}</div>`;

// --- le perso
function characterSheet(c) {
  const skills = cardsHtml(c.cards);
  const tags = c.tags.length
    ? `<div class="ex-tags">${c.tags
        .map(
          (t) =>
            `<span class="ex-tag"><code>${esc(t.slug)}</code> · ${esc(t.label)}${t.group ? ` <span class="lbl">· groupe ${esc(t.group)}</span>` : ''}${t.detail ? ` <span class="lbl">· ${esc(t.detail)}</span>` : ''}</span>`,
        )
        .join('')}</div>`
    : '<p class="lbl">Aucun tag dérivé des données du jeu.</p>';
  const effects = c.effects.length
    ? `<div class="ex-fxlist">${c.effects
        .map(
          (e) =>
            `<span class="chip ex-chip${e.hidden ? ' off' : ''}" title="${esc(e.id)}">${fxTile(e.icon, e.isDebuff)}<a class="ex-link" href="#effects/${encodeURIComponent(e.id)}" data-go="effects/${esc(e.id)}">${esc(e.name)}</a>${
              e.hidden ? '<span class="badge off">caché du live</span>' : ''
            }</span>`,
        )
        .join(
          '',
        )}</div><p class="hint">Cacher un statut du live se règle dans Éditeurs › Effets, sur sa fiche : chaque nom y mène.</p>`
    : '';
  return (
    section('Stats extraites', gridHtml(c.stats), { count: c.stats.length }) +
    section(
      'Tags détectés',
      `${tags}<p class="hint">Acquisition ← bannière (RecruitGroupTemplet) · ignore-defense ← buffs de pénétration (kit, EE, transcendance) · core-fusion ← lignée. Le seul tag humain (free) est sur la Fiche perso. « festival » est le ruban OUTER_FES du jeu — « limited » est le GROUPE de festival + seasonal + collab, jamais un tag en soi.</p>`,
      { count: c.tags.length },
    ) +
    section('Skills', skills, { count: c.cards.length, cls: 'ex-sec-wide' }) +
    (effects ? section('Statuts référencés', effects, { count: c.effects.length }) : '') +
    (c.costumes.length
      ? section(
          'Costumes',
          `<ul class="ex-ul">${c.costumes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`,
          {
            count: c.costumes.length,
          },
        )
      : '')
  );
}

// --- le monstre
/** La carte des stats d'un monstre : le select de la rencontre, la grille, le contexte en lignes. */
function monsterStatsHtml(m) {
  const s = m.stats;
  const sel = s.selected;
  return `<div class="ex-mstats" data-stats><div class="form"><div class="field"><label for="ex-enc">Rencontre</label><select id="ex-enc" class="w-search"${
    s.options.length < 2 ? ' disabled' : ''
  }>${s.options
    .map(
      (o, i) =>
        `<option value="${i}"${i === sel ? ' selected' : ''}>${esc(o.label)} — ${esc(o.where)}</option>`,
    )
    .join(
      '',
    )}</select></div></div><div id="ex-enc-body">${monsterStatsOption(s.options[sel])}</div></div>`;
}

const monsterStatsOption = (o) =>
  `${gridHtml(o.cells)}<div class="ex-ctx">${o.context.map((l) => `<p>${esc(l)}</p>`).join('')}${
    o.passives.length
      ? `<p><span class="lbl">Passifs du palier :</span> ${o.passives.map((p) => `<span class="ex-pass">${esc(p)}</span>`).join(' ')}</p>`
      : ''
  }</div>`;

const monsterRef = (r) =>
  `<a class="ex-link" href="#extractor/monster/${encodeURIComponent(r.id)}" data-go="extractor/monster/${esc(r.id)}">${esc(r.name)}</a>`;

function monsterSheet(m) {
  const enc = m.encounters;
  const rel = m.relations;
  const encounters = enc.rows.length
    ? `<ul class="ex-ul ex-enc">${enc.rows
        .map(
          (r) =>
            `<li><span class="ex-enc-mode">${esc(r.mode)}</span> · ${esc(r.name)}${r.area ? ` <span class="lbl">(${esc(r.area)})</span>` : ''} · <strong>Lv ${r.level}</strong>${
              r.hpLines ? ` <span class="lbl">· ${r.hpLines} barres</span>` : ''
            }</li>`,
        )
        .join('')}${enc.more ? `<li class="lbl">… ${enc.more} de plus</li>` : ''}</ul>`
    : rel.summonedBy.length || rel.linkedTo.length
      ? `<p class="lbl">Jamais spawné directement — ${
          rel.summonedBy.length
            ? `invoqué par : ${rel.summonedBy.map(monsterRef).join(', ')}. `
            : ''
        }${rel.linkedTo.length ? `lié au kit de : ${rel.linkedTo.map(monsterRef).join(', ')}. ` : ''}Localisé par ces monstres.</p>`
      : '<p class="lbl">Aucun spawn ni invocateur connu (contenu retiré, ou à venir ?).</p>';
  const summons = rel.summons.length
    ? `<p class="lbl">Invoque : ${rel.summons.map(monsterRef).join(', ')}</p>`
    : '';
  const imm = m.immunities;
  const immunities =
    imm.chips.length || imm.unresolved.length
      ? section(
          'Immunités',
          `${imm.chips.length ? `<div class="ex-chips">${imm.chips.map(chipHtml).join('')}</div>` : ''}${
            imm.unresolved.length
              ? `<p class="ex-warn">⚠ sans entrée au glossaire des effets : ${imm.unresolved.map(esc).join(', ')}</p>`
              : ''
          }`,
          { count: imm.chips.length },
        )
      : '';
  return (
    section('Stats à la rencontre', monsterStatsHtml(m), { cls: 'ex-sec-wide' }) +
    section('Rencontres', encounters + summons, { count: enc.total }) +
    immunities +
    section('Skills', cardsHtml(m.cards), { count: m.cards.length, cls: 'ex-sec-wide' })
  );
}

// --- l'équipement
const passiveHtml = (p) =>
  `<li class="ex-passive"><p class="ex-passive-head"><img class="ex-pico" src="${srcAt(p.iconSrc)}" alt="" aria-hidden="true" width="24" height="24" /><strong>${esc(p.name)}</strong><span class="lbl">niv. ${p.level}${p.isAdd ? ' (s’ajoute)' : ''} · ${plural(p.levels, 'palier')}</span></p><p class="ex-desc">${gameText(env(), p.first)}</p>${
    p.last ? `<p class="ex-desc"><span class="lbl">max :</span> ${gameText(env(), p.last)}</p>` : ''
  }</li>`;

const pills = (list) =>
  list.length
    ? `<p class="ex-pills">${list.map((s) => `<span class="ex-pill">${esc(s)}</span>`).join('')}</p>`
    : '';

function gearSheetHtml(g) {
  const out = [];
  if (g.mainStats.length)
    out.push(section('Main stats', pills(g.mainStats), { count: g.mainStats.length }));
  if (g.passives.length || g.classVariants)
    out.push(
      section(
        g.kind === 'ee' ? 'Passif (base → +10)' : 'Passif',
        `<ul class="ex-ul ex-passives">${g.passives.map(passiveHtml).join('')}</ul>${(
          g.classVariants ?? []
        )
          .map(
            (v) =>
              `<div class="ex-variant"><p class="ex-variant-head"><img class="ex-pico" src="${srcAt(v.iconSrc)}" alt="" aria-hidden="true" width="24" height="24" /><strong>variante ${esc(v.classLimit)}</strong><code>${esc(v.id)}</code></p>${pills(v.mainStats)}<ul class="ex-ul ex-passives">${v.passives.map(passiveHtml).join('')}</ul></div>`,
          )
          .join('')}${pills(g.effects)}`,
        { count: g.passives.length },
      ),
    );
  if (g.pieces)
    out.push(
      section(
        'Pièces (6★)',
        `<div class="ex-pieces">${g.pieces
          .map(
            (p) =>
              `<span class="ex-piece"><img src="${srcAt(p.iconSrc)}" alt="" aria-hidden="true" width="40" height="40" /><span class="lbl">${esc(p.slot)}</span></span>`,
          )
          .join('')}</div>`,
        { count: g.pieces.length },
      ),
    );
  if (g.tiers)
    out.push(
      section(
        'Bonus (base → enchanté)',
        `<ul class="ex-ul">${g.tiers
          .map(
            (t, i) =>
              `<li><strong>${i === 0 ? 'base' : 'enchanté'}</strong>${t.p2 ? ` · 2P : ${gameText(env(), t.p2)}` : ''}${t.p4 ? ` · 4P : ${gameText(env(), t.p4)}` : ''}</li>`,
          )
          .join('')}</ul>`,
      ),
    );
  if (g.kind === 'family')
    out.push(
      section('Membres de la famille', `<p class="ex-mono">${g.members.map(esc).join(' · ')}</p>`, {
        count: g.members.length,
      }),
    );
  return out.join('');
}

// --- l'en-tête et le tout
/** Le libellé de la cible d'une fiche, pour le bouton de retour. */
const targetLabel = () => en?.label ?? enAt?.target ?? 'cible';

function entityNote() {
  if (!en.tables) return en.reason ?? 'Tables du jeu absentes sur ce poste.';
  if (en.target === 'character')
    return en.character
      ? '« Intégrer » écrit ce perso et ses skills dans data/generated, régénère les slugs et les dates de sortie, stage ses images, re-dérive damage et solver, puis committe. Un perso sans date de sortie est refusé avant d’écrire.'
      : 'Ce perso n’est pas dans l’extraction fraîche : rien à intégrer.';
  if (en.target === 'monster')
    return en.monster
      ? en.monster.committedOnly
        ? 'Ce monstre n’est plus dans l’extraction fraîche : la fiche montre le committé, rien à intégrer.'
        : '« Intégrer » écrit ce monstre, ses skills et ses donjons dans data/generated, re-dérive damage et solver, puis committe — pas d’images. Figer une version et ré-épingler ses guides : le bloc « Versions ».'
      : 'Ce monstre n’est connu ni du frais ni du committé.';
  return en.gear
    ? '« Intégrer » écrit la famille entière (ses lignes, families.json, les pools, passifs et paliers référencés) dans data/generated/equipment, stage ses icônes, puis committe.'
    : 'Cette entité n’est pas dans l’extraction fraîche : rien à intégrer.';
}

function renderEntity() {
  $('ex-entity-target').textContent = targetLabel();
  $('ex-entity-empty').hidden = true;
  if (!en) return;
  const c = en.character;
  const m = en.monster;
  const g = en.gear;
  const missing = c?.missing ?? [];
  // L'en-tête : l'icône, le nom, la ligne d'identité.
  $('ex-face').innerHTML = c
    ? `<img class="ex-portrait" src="${srcAt(c.portrait)}" alt="" aria-hidden="true" width="56" height="56" />`
    : m
      ? `<span class="ex-slot"><img src="${srcAt(m.slotSrc)}" alt="" aria-hidden="true" /><img class="ex-slot-icon" src="${srcAt(m.iconSrc)}" alt="" aria-hidden="true" />${
          m.badgeSrc ? `<img class="ex-slot-badge" src="${srcAt(m.badgeSrc)}" alt="boss" />` : ''
        }</span>`
      : g
        ? `<span class="ex-slot"><img src="${srcAt(g.frame)}" alt="" aria-hidden="true" /><img class="ex-slot-gear" src="${srcAt(g.iconSrc)}" alt="" aria-hidden="true" /></span>`
        : '';
  $('ex-entity-title').textContent = c
    ? c.name
    : m
      ? `${m.name}${m.nickname ? ` — ${m.nickname}` : ''}`
      : g
        ? g.name.en
        : en.key;
  $('ex-entity-meta').innerHTML = c
    ? `<code>${esc(c.id)}</code>${trait('elem/IG_Turn_Element_', c.element)}${trait('class/IG_Turn_Class_', c.class)}${
        c.subClass ? trait('class/CM_Sub_Class_', c.subClass) : ''
      }<span>${esc(c.race)}</span>${stars(c.rarity)}${c.chain ? `<span class="badge off">chaîne ${esc(c.chain)}</span>` : ''}`
    : m
      ? `<code>${esc(m.id)}</code><span class="badge off">${esc(m.type)}</span>${trait('elem/IG_Turn_Element_', m.element)}${trait('class/IG_Turn_Class_', m.class)}${
          m.subClass ? `<span>/ ${esc(m.subClass)}</span>` : ''
        }<span>${esc(m.race)}</span>${stars(m.rarity)}${m.aiType ? `<span class="lbl">IA ${esc(m.aiType)}</span>` : ''}`
      : g
        ? `<code>${esc(g.id)}</code><span class="badge off">${esc(g.kind === 'family' ? en.target : g.kind)}</span><span>${esc(g.grade)}</span>${
            g.stars.length ? `<span>★ ${g.stars.join('/')}</span>` : ''
          }${g.mode ? `<span class="badge off">${esc(g.mode)}</span>` : ''}${
            g.classLimits.length
              ? `<span class="lbl">classes : ${g.classLimits.map(esc).join(', ')}</span>`
              : ''
          }${g.characterId ? `<span class="lbl">EE de <code>${esc(g.characterId)}</code> · confiance ${g.trustLevel}</span>` : ''}`
        : `<code>${esc(en.key)}</code>`;
  // Les badges : le statut de revue.
  const badges = [];
  if (!en.tables)
    badges.push(`<span class="badge warn">${esc(en.reason ?? 'tables absentes')}</span>`);
  else if (en.review === 'added')
    badges.push('<span class="badge edit">new — pas encore intégré</span>');
  else if (en.review === 'changed')
    badges.push(
      `<span class="badge ko">${plural(en.fields, 'champ')} diverge${en.fields > 1 ? 'nt' : ''}</span>`,
    );
  else if (en.review === 'removed')
    badges.push('<span class="badge warn">absent de l’extraction fraîche</span>');
  else if (en.review === 'same')
    badges.push('<span class="badge ok">à jour — le committé est l’extraction</span>');
  $('ex-entity-badges').innerHTML = badges.join('');
  // Les liens croisés.
  const links = [];
  if (en.links?.sheet)
    links.push(
      `<a class="ex-link" href="#${esc(en.links.sheet)}" data-go="${esc(en.links.sheet)}">${en.target === 'ee' ? 'fiche perso › EE' : 'fiche perso'}</a>`,
    );
  if (en.links?.chips)
    links.push(
      `<a class="ex-link" href="#${esc(en.links.chips)}" data-go="${esc(en.links.chips)}">câbler les chips</a>`,
    );
  $('ex-entity-links').innerHTML = links.length
    ? `<span class="lbl">Voir aussi :</span> ${links.join(' · ')}`
    : '';
  renderGestures();
  $('ex-entity-note').textContent = entityNote();
  const box = $('ex-missing');
  box.hidden = !missing.length;
  box.innerHTML = missing.length
    ? `<p><strong>Intégration refusée avant d’écrire</strong> — ${missing.length > 1 ? 'ces persos n’ont' : 'ce perso n’a'} de date de sortie d’aucune source (ni les notes de mise à jour, ni le curé) :</p><ul>${missing
        .map((x) => `<li><code>${esc(x.id)}</code> ${esc(x.label || '(sans nom)')}</li>`)
        .join(
          '',
        )}</ul><p>Ajouter la clé à la main dans <code>data/curated/character-release.json</code> (<code>"${esc(missing[0].id)}": "AAAA-MM-JJ"</code>), puis relire la fiche.</p>`
    : '';
  $('ex-iplan').hidden = true;
  // Le diff de la cible, en tête.
  $('ex-entity-diff').hidden = !en.tables || !en.fields;
  $('ex-entity-fields').textContent = en.fields ? plural(en.fields, 'champ') : '';
  $('ex-entity-diff-body').innerHTML = en.fields ? diffHtml(en.diff ?? []) : '';
  // La fiche.
  $('ex-sheet').innerHTML = !en.tables
    ? ''
    : c
      ? characterSheet(c)
      : m
        ? monsterSheet(m)
        : g
          ? gearSheetHtml(g)
          : '';
  renderVersions();
}

/**
 * Les gestes de l'en-tête. « Intégrer » : le frais existe ; caché à jour pour
 * un perso ou un monstre (la règle de l'admin) ; refusé tant qu'une date de
 * sortie manque. Pour un monstre qui a CHANGÉ et que le figeage ré-épinglerait
 * encore (des guides le désignent en live), l'ordre du flux type prend sa
 * place : « 1. Figer l'état actuel », « 2. Intégrer l'extraction ».
 */
function renderGestures() {
  if (!en) return;
  const c = en.character;
  const m = en.monster;
  const g = en.gear;
  const fresh = Boolean(c || (m && !m.committedOnly) || g);
  const missing = c?.missing ?? [];
  const ordered = Boolean(
    en.tables && m && !m.committedOnly && en.review === 'changed' && fz && fz.guides > 0,
  );
  const btn = $('ex-integrate');
  btn.hidden = !en.tables || !fresh || (en.review === 'same' && !g) || ordered;
  btn.textContent = en.review === 'added' ? 'Intégrer' : 'Ré-intégrer';
  btn.disabled = busy || missing.length > 0;
  btn.title = missing.length ? 'Une date de sortie manque : voir ci-dessous.' : '';
  $('ex-order').hidden = !ordered;
  $('ex-order-freeze').disabled = busy;
  $('ex-order-integrate').disabled = busy;
}

// ------------------------------------------------------ « Versions »
/** Un guide en lien vers Guides, sur sa version s'il y en a une. */
const guideLink = (guide, version) => {
  const path = `guides/${guide}${version ? `/${version}` : ''}`;
  return `<a class="ex-link" href="#${esc(path)}" data-go="${esc(path)}">${esc(guide)}</a>`;
};

/** Qui épingle une archive : le guide, puis la version (ou le champ d'un guide plat). */
const pinRefHtml = (p) =>
  `${guideLink(p.guide, p.version)} <span class="lbl">· ${esc(p.version ?? (p.field === 'meta.bossId' ? 'bossId' : 'monsters'))}</span>`;

const archiveHtml = (a) =>
  `<li><code>${esc(a.key)}</code> — ${esc(a.committedAt.slice(0, 10))}, source ${esc(a.ref)}${
    a.gameVersion ? `, jeu ${esc(a.gameVersion)}` : ''
  }${a.label ? ` — ${esc(a.label)}` : ''} <span class="lbl">· ${plural(a.skills, 'skill')}</span> ${
    a.pinnedBy.length
      ? `<span class="ex-pinby">épinglée par ${a.pinnedBy.map(pinRefHtml).join(', ')}</span>`
      : '<span class="badge warn">orpheline</span>'
  }</li>`;

/** Un groupe du plan ou du rapport : son titre, son compte, ses lignes ; rien s'il est vide. */
const fgroup = (title, items, empty = '') =>
  items.length || empty
    ? `<div class="ex-fgroup"><div class="ex-fgroup-head"><strong>${esc(title)}</strong><span class="badge off">${items.length}</span></div>${
        items.length
          ? `<ul class="ex-ul">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`
          : `<p class="lbl">${esc(empty)}</p>`
      }</div>`
    : '';

const editLine = (e) =>
  `${guideLink(e.guide)} · <code>${esc(e.field)}</code> : <code>${esc(e.before)}</code> → <code>${esc(e.after)}</code>`;
const keptLine = (k) =>
  `${guideLink(k.guide, k.version)}${k.version ? ` · version ${esc(k.version)}` : ''} — ${esc(k.why)}`;
const pendingLine = (p) =>
  `${esc(p.guide)} · combat <code>${esc(p.group)}</code> — guide plat, rien d’automatique : <a class="ex-link" href="#${esc(p.go)}" data-go="${esc(p.go)}">ouvrir dans Guides</a>`;

/** Les guides d'un plan, rangés par ce qui leur arrive. */
function freezePlanHtml(p) {
  return (
    fgroup(
      'Guides ré-épinglés',
      [
        ...p.edits.map(editLine),
        ...p.pins.map(
          (x) =>
            `${guideLink(x.guide, x.version)} · version <strong>${esc(x.version)}</strong> (combat <code>${esc(x.group)}</code>) : <code>pinned</code> + <code>${esc(p.key)}</code>`,
        ),
      ],
      'Aucun guide à ré-épingler : l’archive naîtra orpheline.',
    ) +
    fgroup('Laissés en live', p.kept.map(keptLine)) +
    fgroup('En attente', p.pending.map(pendingLine)) +
    fgroup(
      'Re-datés (meta.updated)',
      p.stamps.map((g) => guideLink(g)),
    )
  );
}

/** Ce que le figeage a fait : l'archive, puis les mêmes groupes, tels qu'écrits. */
function freezeReportHtml(r) {
  return (
    `<p><span class="badge ok">figé</span> <code>${esc(r.key)}</code> — ${plural(r.skills, 'skill')}, <code>${esc(r.file)}</code>. Dépingler une version : dans Guides, onglet Combat.</p>` +
    fgroup(
      'Guides ré-épinglés',
      [
        ...r.edits.map(editLine),
        ...r.pinned.map(
          (x) =>
            `${guideLink(x.guide, x.version)} · version <strong>${esc(x.version)}</strong> épinglée`,
        ),
      ],
      'Aucun guide ré-épinglé : l’archive est orpheline.',
    ) +
    fgroup('Laissés en live', r.kept.map(keptLine)) +
    fgroup('En attente', r.pending.map(pendingLine)) +
    fgroup(
      'Re-datés (meta.updated)',
      r.stamped.map((g) => guideLink(g)),
    ) +
    fgroup(
      'Non écrits',
      r.skipped.map((g) => `${esc(g)} — meta.json refusé par le store`),
    )
  );
}

/** Le plan à l'écran : la clé créée, l'état figé, les guides, le refus « sale », le commit. */
function renderFreezePlan() {
  const box = $('ex-fplan');
  box.hidden = !fz || !fzOpen;
  if (box.hidden) return;
  const p = fz;
  $('ex-fplan-text').innerHTML =
    `Créer <code>${esc(p.key)}</code> : l’état COMMITTÉ de ${esc(p.name)} — HEAD <code>${esc(p.head.ref)}</code> du ${esc(p.head.committedAt.slice(0, 10))}${
      p.head.gameVersion ? `, jeu ${esc(p.head.gameVersion)}` : ''
    } — figé dans <code>${esc(p.file)}</code>. Les guides touchés :`;
  $('ex-fplan-body').innerHTML = freezePlanHtml(p);
  const dirty = $('ex-fdirty');
  dirty.hidden = !p.dirty.length;
  dirty.innerHTML = p.dirty.length
    ? `<p><strong>Figeage refusé avant d’écrire</strong> — ce monstre a des changements non committés dans :</p><ul>${p.dirty
        .map((f) => `<li><code>${esc(f)}</code></li>`)
        .join(
          '',
        )}</ul><p>L’archive fige HEAD, pas le working tree : enregistrer d’abord, ou annuler. Committer fait de HEAD le NOUVEL état — pour figer l’ancien, annuler ces changements, figer, puis ré-intégrer.</p>`
    : '';
  $('ex-fplan-commit').textContent =
    `Puis UN commit « ${p.commit} » : l’archive, les meta.json et les config.json touchés, les meta.json re-datés.`;
  $('ex-fplan-go').disabled = busy || p.dirty.length > 0;
}

/** Le bloc « Versions » d'un monstre : ses archives et qui les épingle, le geste, le plan, le rapport. */
function renderVersions() {
  const m = en?.monster;
  const card = $('ex-versions');
  card.hidden = !en?.tables || !m;
  if (card.hidden) return;
  $('ex-ver-count').textContent = m.archives.length;
  $('ex-archives').innerHTML = m.archives.map(archiveHtml).join('');
  $('ex-archives').hidden = !m.archives.length;
  $('ex-ver-live').textContent = fz
    ? fz.guides
      ? `${plural(fz.guides, 'guide')} le désigne${fz.guides > 1 ? 'nt' : ''} encore en live`
      : 'aucun guide à ré-épingler'
    : '';
  const btn = $('ex-freeze');
  btn.hidden = !fz;
  btn.disabled = busy;
  $('ex-ver-note').textContent = fz
    ? `${m.archives.length ? '' : 'Aucune version figée : les guides suivent le live. '}« Figer et ré-épingler » fige l’état COMMITTÉ (HEAD), pas l’extraction fraîche, et montre d’abord son plan. Une archive ne se supprime pas ; dépingler une version se fait dans Guides, onglet Combat.`
    : fzWhy;
  renderFreezePlan();
  const report = $('ex-freport');
  report.hidden = !fzReport;
  report.innerHTML = fzReport ? freezeReportHtml(fzReport) : '';
}

/** Le plan de figeage du monstre ouvert ; sans plan, la raison (pas encore committé, lecture en échec). */
async function readFreeze(key) {
  try {
    return { plan: await getJson(`/api/extractor/freeze?id=${encodeURIComponent(key)}`), why: '' };
  } catch (e) {
    return {
      plan: null,
      why:
        /HTTP 404/.test(String(e)) && /absent du committé/.test(String(e))
          ? 'Ce monstre n’est pas encore committé : rien à figer — l’intégrer d’abord.'
          : `Plan de figeage illisible : ${e}`,
    };
  }
}

function openFreezePlan() {
  if (!fz || busy) return;
  fzOpen = true;
  renderFreezePlan();
  $('ex-versions').scrollIntoView?.({ block: 'nearest' });
  (fz.dirty.length ? $('ex-fplan-cancel') : $('ex-fnote')).focus();
}

$('ex-freeze').onclick = openFreezePlan;
$('ex-order-freeze').onclick = openFreezePlan;
$('ex-fplan-cancel').onclick = () => {
  fzOpen = false;
  renderFreezePlan();
};
$('ex-fplan-go').onclick = async () => {
  if (!fz || !enAt || busy || fz.dirty.length) return;
  const p = fz;
  busy = true;
  renderGestures();
  renderVersions();
  log(
    [],
    undefined,
    `${p.name} (${p.id}) : état de ${p.head.ref} figé sous ${p.key}, guides ré-épinglés, puis commit`,
  );
  let r = null;
  try {
    r = await post('/api/extractor/freeze', { id: p.id, label: $('ex-fnote').value, was: p.was });
  } finally {
    busy = false;
    // Un refus (plan périmé, working tree sale) : le plan RELU reste à l'écran.
    fzOpen = Boolean(r && !r.ok && (r.stale || r.dirty));
    if (r?.report) {
      fzReport = r.report;
      $('ex-fnote').value = '';
    }
    // Le disque fait foi : la fiche, ses archives et le plan sont relus.
    tg = null;
    await loadEntity();
  }
};

/** Lit la fiche ouverte ; seule la dernière demande se dessine. */
async function loadEntity() {
  if (!enAt) return;
  const mine = ++enSeq;
  const { target, key } = enAt;
  enPending = `${target}/${key}`;
  try {
    // Un monstre : sa fiche et le plan de son figeage, lus ensemble — l'ordre
    // « figer puis intégrer » se décide sur les deux.
    const [got, freeze] = await Promise.all([
      getJson(
        `/api/extractor/entity?target=${encodeURIComponent(target)}&key=${encodeURIComponent(key)}`,
      ),
      target === 'monster' ? readFreeze(key) : { plan: null, why: '' },
    ]);
    if (mine !== enSeq) return false;
    en = got;
    fz = freeze.plan;
    fzWhy = freeze.why;
    renderEntity();
    return true;
  } catch (e) {
    if (mine !== enSeq) return false;
    // Une cible sans fiche (effet, armure, item) : la clé est une entité de la
    // cible, dépliée — le comportement de la cible.
    if (/HTTP 404/.test(String(e)) && /pas de fiche/.test(String(e))) {
      enAt = null;
      await openTarget(target, key);
      return false;
    }
    log([`Fiche illisible : ${e}`], false);
    $('ex-entity-empty').hidden = false;
    $('ex-entity-empty').textContent = `Fiche illisible : ${e}`;
    return false;
  } finally {
    if (mine === enSeq) enPending = null;
  }
}

async function openEntity(target, key, plan = false) {
  // La même fiche demandée deux fois pendant sa lecture (le clic d'`init`, puis
  // l'ouverture de `start`) : une seule lecture.
  if (enPending === `${target}/${key}`) return;
  en = null;
  enAt = { target, key };
  fz = null;
  fzWhy = '';
  fzOpen = plan;
  fzReport = null;
  history.replaceState(null, '', targetHash(target, key));
  showView('entity');
  $('ex-assets').hidden = true;
  $('ex-versions').hidden = true;
  $('ex-order').hidden = true;
  $('ex-fnote').value = '';
  $('ex-face').innerHTML = '';
  $('ex-entity-title').textContent = key;
  $('ex-entity-meta').textContent = '';
  $('ex-entity-badges').innerHTML = '';
  $('ex-entity-links').innerHTML = '';
  $('ex-integrate').hidden = true;
  $('ex-missing').hidden = true;
  $('ex-iplan').hidden = true;
  $('ex-entity-diff').hidden = true;
  $('ex-sheet').innerHTML = '';
  $('ex-entity-target').textContent = tg?.id === target ? tg.label : target;
  $('ex-entity-empty').hidden = false;
  $('ex-entity-empty').textContent = 'Lecture…';
  await loadEntity();
}

$('ex-entity-back').onclick = () => {
  if (!enAt) return showOverview();
  const { target } = enAt;
  en = null;
  enAt = null;
  return openTarget(target);
};

function openIntegratePlan() {
  if (!en?.plan || busy) return;
  const p = en.plan;
  $('ex-iplan-text').textContent = `Écrire dans data/generated :`;
  $('ex-iplan-files').innerHTML =
    p.files.map((f) => `<li>${esc(f)}</li>`).join('') +
    `<li>puis UN commit « ${esc(p.commit)} »</li>`;
  $('ex-iplan').hidden = false;
  $('ex-iplan-go').focus();
}
$('ex-integrate').onclick = openIntegratePlan;
$('ex-order-integrate').onclick = openIntegratePlan;
$('ex-iplan-cancel').onclick = () => ($('ex-iplan').hidden = true);
$('ex-iplan-go').onclick = async () => {
  if (!en || !enAt || busy) return;
  $('ex-iplan').hidden = true;
  const { target, key } = enAt;
  const name = $('ex-entity-title').textContent;
  busy = true;
  renderGestures();
  renderVersions();
  log([], undefined, `${name} (${key}) : intégration dans data/generated, puis commit`);
  let r = null;
  try {
    r = await post('/api/extractor/integrate', { target, key, was: en.was });
  } finally {
    busy = false;
    // Le disque fait foi : la fiche est relue, refus `stale` compris ; la
    // cible, si elle est encore derrière, se relira à son retour.
    tg = null;
    await loadEntity();
    if (r?.assets) showAssets(r.assets);
  }
};

// Le select de la rencontre : l'option choisie se dessine, rien n'est demandé.
$('ex-sheet').addEventListener('change', (e) => {
  if (e.target.id !== 'ex-enc' || !en?.monster) return;
  const o = en.monster.stats.options[Number(e.target.value)];
  if (o) $('ex-enc-body').innerHTML = monsterStatsOption(o);
});

// Les liens qui mènent ailleurs (« Ouvrir Patch », les fiches croisées, un
// monstre lié, un statut dans Effets) : `sections.go` par chemin.
$('tab-extractor').addEventListener('click', (e) => {
  const el = e.target.closest('[data-go]');
  if (!el) return;
  e.preventDefault();
  sections.go(el.dataset.go);
});

// ------------------------------------------------------ l'onglet
let wanted = null; // ce que le hash demandait au démarrage

/** Ce que le hash demande : la vue d'ensemble, une cible, une fiche (ou une entité dépliée). */
function route() {
  // Le clic d'`init` a réduit l'adresse à `#extractor` : ce qu'elle demandait
  // est gardé (`wanted`) pour cette première venue.
  const here = parseHash(location.hash);
  const to = here?.id ? here : (wanted ?? here);
  wanted = null;
  // Une clé : la fiche, si la cible en a une — le serveur le dit (404 sinon,
  // et la cible s'ouvre sur l'entité dépliée). `#extractor/monster/<id>/freeze`
  // ouvre la fiche d'un monstre sur le PLAN de son figeage (le banc de
  // captures ne clique pas ; rien n'est posté).
  if (to?.id && to.key) {
    const freeze = to.id === 'monster' ? /^(.+)\/freeze$/.exec(to.key) : null;
    return openEntity(to.id, freeze ? freeze[1] : to.key, Boolean(freeze));
  }
  if (to?.id) return openTarget(to.id);
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
  // À chaque venue à l'écran : la vue d'ensemble, la cible ou la fiche que
  // l'adresse demande — `sections.go('extractor/<cible>/<clé>')` passe par ici aussi.
  open: route,
});
