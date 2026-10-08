// Onglet « Fiche perso » : un perso, choisi dans le picker de héros partagé, et
// ce que le wiki sait de lui en sous-onglets. Celui-ci pose la coquille et le
// sous-onglet « Fiche » : rangs, rôle, paliers par transcendance, priorité de
// skills, tags — une seule savebar, un seul enregistrement, un seul commit.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';
import { openHeroPicker } from '../hero-picker.mjs';

// Les sous-onglets, dans l'ordre de la fiche du site. `soon` : pas encore
// porté — l'onglet est là, éteint, et son `title` dit quel lot l'apporte.
const SUBS = [
  { id: 'fiche', label: 'Fiche' },
  { id: 'pros-cons', label: 'Pros / Cons', soon: 'lot B42' },
  { id: 'synergies', label: 'Synergies', soon: 'lot B42' },
  { id: 'skills', label: 'Skills', soon: 'lot B39' },
  { id: 'gear', label: 'Gear reco', soon: 'lot B40' },
];
const subsOn = () => SUBS.filter((s) => !s.soon);

// Les champs de la fiche. Les rangs sont des CELLULES, celles de l'onglet
// « Rangs » : même clé, même forme envoyée (`RankChange`), même refus par
// cellule quand le disque a bougé.
const MAIN = [
  ['rank', 'Rang PvE'],
  ['rankPvp', 'Rang PvP'],
  ['role', 'Rôle'],
];
const TABLES = [
  ['rankByTranscend', 'Rang'],
  ['roleByTranscend', 'Rôle'],
];
const PRIOS = [
  ['first', 'Skill 1'],
  ['second', 'Skill 2'],
  ['ultimate', 'Ultimate'],
];
// Où se pose un refus : la carte de chaque champ hors cellules de rang.
const KIT_KEYS = ['skillPriority', 'tags'];

let roster = null; // `/api/character/roster`, lu une fois : le picker
let sheet = null; // l'état du perso ouvert (`/api/character/state`)
let sub = 'fiche'; // le sous-onglet montré
let wanted = null; // le perso que le hash demande, tant qu'il n'est pas chargé
// Cellules de rang modifiées, pas encore envoyées : clé → changement.
const cells = new Map();
// Priorité de skills et tags humains saisis ; `null` : ceux du disque.
let prio = null;
let tags = null;
// Paliers montrés sans valeur : ajoutés par « ＋ palier », ou vidés à la main.
const added = new Set();
// Refus du dernier enregistrement : clé de cellule ou de champ → la raison.
let refused = new Map();
let drawnBase = state.imgBase; // la base des images du dernier dessin (cf. `init`)

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const src = (path) => `${esc(state.imgBase)}/images/${path}.webp`;
const rankSrc = (v) => src(`ui/rank/IG_Event_Rank_${v}`);

// ------------------------------------------------------ le modèle
const cellKey = (field, step) => `${field}${step ? `.${step}` : ''}`;
const baseOf = (field, step) => (step ? sheet.ranks[field][step] : sheet.ranks[field]) ?? '';
const valueOf = (field, step) => cells.get(cellKey(field, step))?.to ?? baseOf(field, step);
const listOf = (field) => (field.startsWith('role') ? sheet.roles : sheet.tiers);
const stepLabel = (key) => sheet.steps.find((s) => s.key === key)?.label ?? `Trans ${key}`;

/** Pose la valeur d'une cellule : revenue à celle du disque, elle n'est plus modifiée. */
function setCell(field, step, to) {
  const key = cellKey(field, step);
  const from = baseOf(field, step);
  if (to === from) cells.delete(key);
  else cells.set(key, { id: sheet.char.id, field, ...(step ? { step } : {}), from, to });
  refused.delete(key);
}

const prioBase = () =>
  Object.fromEntries(PRIOS.map(([k]) => [k, String(sheet.curated.skillPriority?.[k] ?? '')]));
const prioNow = () => prio ?? prioBase();
const prioMoved = () => PRIOS.some(([k]) => prioNow()[k] !== prioBase()[k]);
/** Une priorité saisie hors de 1 à 3 — celle que le disque portait déjà reste. */
const prioIssue = (k) =>
  prioNow()[k] !== '' && prioNow()[k] !== prioBase()[k] && !/^[1-3]$/.test(prioNow()[k])
    ? 'entre 1 et 3, ou vide'
    : '';

const tagsBase = () => sheet.humanTags.filter((t) => (sheet.curated.tags ?? []).includes(t));
const tagsNow = () => tags ?? tagsBase();
const tagsMoved = () => tagsNow().join('|') !== tagsBase().join('|');

/** Ce que compte la savebar : une cellule de rang, la priorité, les tags. */
const changes = () => (sheet ? cells.size + Number(prioMoved()) + Number(tagsMoved()) : 0);

/** Les erreurs que la page voit seule : tant qu'il en reste, rien n'est envoyé. */
const issues = () =>
  sheet
    ? PRIOS.filter(([k]) => prioIssue(k)).map(
        ([k, label]) => `Priorité de skills · ${label} : ${prioIssue(k)}`,
      )
    : [];

// Les paliers montrés : ceux qui portent un rang ou un rôle, modifications
// comprises, et ceux d'`added`. Une clé héritée hors des paliers pleins n'est
// pas éditable : elle est dite sous la table, comme dans Rangs.
const stepsShown = () =>
  sheet.steps.filter((s) => added.has(s.key) || TABLES.some(([f]) => valueOf(f, s.key)));
const stepsFree = () => {
  const shown = new Set(stepsShown().map((s) => s.key));
  return sheet.steps.filter((s) => !shown.has(s.key));
};
const legacy = () =>
  TABLES.flatMap(([f, label]) =>
    Object.keys(sheet.ranks[f])
      .filter((k) => !sheet.steps.some((s) => s.key === k))
      .map((k) => `${label} ${stepLabel(k)} : ${sheet.ranks[f][k]}`),
  );

/** Les clés que porte chaque carte : son badge, son bord rouge, ses refus. */
const cardKeys = {
  ranks: () =>
    [...new Set([...cells.keys(), ...refused.keys()])].filter((k) => !KIT_KEYS.includes(k)),
  kit: () => KIT_KEYS,
};
const cardMoved = (card) =>
  card === 'ranks' ? cells.size > 0 : card === 'kit' ? prioMoved() || tagsMoved() : false;
const cardBad = (card) =>
  cardKeys[card]().some((k) => refused.has(k)) || (card === 'kit' && issues().length > 0);

// ------------------------------------------------------ l'en-tête
/** Le perso choisi : portrait, nom, élément, classe, sous-classe, rareté, chaîne. */
function who() {
  const c = sheet?.char;
  const trait = (file, slug) =>
    `<span class="c-trait"><img src="${src(`ui/${file}${cap(esc(slug))}`)}" alt="" aria-hidden="true" />${esc(slug)}</span>`;
  drawnBase = state.imgBase;
  $('c-who').innerHTML = c
    ? `<img class="c-face" src="${src(`characters/portrait/CT_${esc(c.id)}`)}" alt="" aria-hidden="true" width="56" height="56" />
      <div class="c-id"><strong>${esc(c.name)}</strong>
        <span class="c-traits">${trait('elem/IG_Turn_Element_', c.element)}${trait('class/IG_Turn_Class_', c.class)}${
          c.subClass ? trait('class/CM_Sub_Class_', c.subClass) : ''
        }<span class="c-stars" title="${c.rarity}★">${`<img src="${src('ui/star/CM_icon_star_y')}" alt="" aria-hidden="true" />`.repeat(c.rarity)}</span>${
          c.chain ? `<span class="badge off">chaîne ${esc(c.chain)}</span>` : ''
        }</span>
      </div>`
    : '<span class="lbl">Aucun perso choisi.</span>';
  $('c-pick-label').textContent = c ? 'Changer de perso' : 'Choisir un perso';
}

function bar() {
  const n = changes();
  const no = refused.size;
  const bad = issues();
  $('c-bar').hidden = !sheet;
  $('c-count').innerHTML =
    `${n ? `<span class="badge edit">${plural(n, 'changement')}</span>` : ''}${
      no ? `<span class="badge ko">${no} refus</span>` : ''
    }${bad.length ? `<span class="badge error">${plural(bad.length, 'erreur')}</span>` : ''}<span class="c-msg" title="${esc(bad.join('\n'))}">${esc(
      bad[0] ?? (n || no ? '' : 'aucune modification'),
    )}</span>`;
  $('c-save').disabled = $('c-reset').disabled = !n;
}

/**
 * La rangée des sous-onglets, entière dès maintenant : ceux qui ne sont pas
 * portés sont éteints. Un point dit ce que l'onglet porte : accent, des
 * changements pas encore enregistrés ; rouge, un refus ou une erreur.
 */
function subTabs() {
  const row = $('c-tabs');
  const focused = row.contains(document.activeElement);
  row.hidden = !sheet;
  row.innerHTML = row.hidden
    ? ''
    : SUBS.map((s) => {
        const on = s.id === sub;
        // Tout ce qui s'édite aujourd'hui est dans « Fiche ».
        const dot =
          s.id !== 'fiche'
            ? null
            : refused.size || issues().length
              ? ['ko', 'refusé ou en erreur']
              : changes()
                ? ['edit', 'modifié, pas encore enregistré']
                : null;
        return `<button class="tab" type="button" role="tab" id="c-tab-${s.id}" data-sub="${s.id}" aria-selected="${on}" aria-controls="c-panel" tabindex="${on ? 0 : -1}"${
          s.soon ? ` disabled title="${s.soon}"` : ''
        }>${s.label}${dot ? `<span class="dot ${dot[0]}" role="img" aria-label="${dot[1]}" title="${dot[1]}"></span>` : ''}</button>`;
      }).join('');
  $('c-panel').setAttribute('aria-labelledby', `c-tab-${sub}`);
  if (focused) $(`c-tab-${sub}`)?.focus();
}

// ------------------------------------------------------ le sous-onglet « Fiche »
// L'icône d'un rang de l'échelle ; vide ou hors échelle, pas d'image.
const rankIcon = (v) =>
  sheet.tiers.includes(v)
    ? `<img class="c-rkico" src="${rankSrc(v)}" alt="" aria-hidden="true" width="22" height="22" />`
    : `<img class="c-rkico" alt="" aria-hidden="true" width="22" height="22" hidden />`;

/**
 * Une cellule de rang ou de rôle, celle de l'onglet « Rangs » : un `select`
 * natif, l'icône du rang dans son cadre, le point d'une cellule modifiée.
 * `attrs` : son `id` (un champ à libellé) ou son `aria-label` (un palier).
 */
function cell(field, step, attrs) {
  const key = cellKey(field, step);
  const cur = valueOf(field, step);
  const list = listOf(field);
  // Valeur héritée hors liste : gardée dans le menu pour ne pas la perdre.
  const extra = [...new Set([baseOf(field, step), cur])].filter((v) => v && !list.includes(v));
  const cls = [cells.has(key) && 'dirty', refused.has(key) && 'refused'].filter(Boolean).join(' ');
  const rk = list === sheet.tiers;
  return `<span class="c-cell${rk ? ' rk' : ''}">${rk ? rankIcon(cur) : ''}<select class="${cls}" data-field="${field}"${
    step ? ` data-step="${step}"` : ''
  } ${attrs}>${['', ...extra, ...list]
    .map(
      (v) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(v) || '—'}</option>`,
    )
    .join('')}</select><i class="c-pt" aria-hidden="true"></i></span>`;
}

/** Le refus d'une clé, sous son champ ; vide, la ligne ne s'affiche pas. */
const err = (key, said = refused.get(key) ?? '') =>
  `<p class="c-err" data-err="${key}">${esc(said)}</p>`;

/** Les refus des cellules de paliers, en une ligne sous leur table. */
const tiersSaid = () =>
  TABLES.flatMap(([f, label]) =>
    sheet.steps
      .filter((s) => refused.has(cellKey(f, s.key)))
      .map((s) => `${s.label} · ${label} : ${refused.get(cellKey(f, s.key))}`),
  ).join(' — ');

/** La table des paliers : transcendance · rang · rôle · ✕, puis « ＋ palier ». */
function tiersHtml() {
  const shown = stepsShown();
  const free = stepsFree();
  const old = legacy();
  const rows = shown
    .map((s) => {
      // Le palier se change : les siens, plus ceux qui sont libres.
      const pick = [s, ...free].sort((a, b) => sheet.steps.indexOf(a) - sheet.steps.indexOf(b));
      return `<tr data-step="${s.key}">
        <td><select class="c-step" data-move="${s.key}" aria-label="Palier de transcendance">${pick
          .map(
            (p) => `<option value="${p.key}"${p === s ? ' selected' : ''}>${esc(p.label)}</option>`,
          )
          .join('')}</select></td>
        ${TABLES.map(
          ([f, label]) =>
            `<td>${cell(
              f,
              s.key,
              `aria-label="${label} à ${esc(s.label)}"${
                refused.has(cellKey(f, s.key))
                  ? ` title="${esc(refused.get(cellKey(f, s.key)))}"`
                  : ''
              }`,
            )}</td>`,
        ).join('')}
        <td class="c-del"><button class="btn icon" type="button" data-act="del-step" data-step="${s.key}" title="Retirer le palier" aria-label="Retirer le palier ${esc(s.label)}">✕</button></td>
      </tr>`;
    })
    .join('');
  return `${
    shown.length
      ? `<table class="c-tiers"><thead><tr><th>Transcendance</th><th>Rang PvE</th><th>Rôle</th><th><span class="sr">Retirer</span></th></tr></thead><tbody>${rows}</tbody></table>`
      : '<p class="lbl">Aucun palier : le rang et le rôle valent à toute transcendance.</p>'
  }
    ${err('tiers', tiersSaid())}
    <div class="c-foot"><button class="btn ghost sm" type="button" data-act="add-step"${
      free.length ? '' : ' disabled title="Tous les paliers sont là."'
    }>＋ palier</button><span class="lbl">Vide = palier non noté : il hérite du palier noté en dessous, sinon de la ligne.${
      old.length ? ` Hérité hors paliers pleins, conservé tel quel : ${esc(old.join(', '))}.` : ''
    }</span></div>`;
}

/** Une vidéo curée, en lecture : son titre, son auteur, sa date. */
const videoRow = (v) =>
  `<li><span class="c-vt">${esc(v.title || v.id)}</span><span class="lbl">${esc(
    [v.author, v.uploadDate?.slice(0, 10)].filter(Boolean).join(' · '),
  )}</span></li>`;

/** L'en-tête d'une carte : son titre, « modifié », « refusé ». */
const cardHead = (card, title, more = '') =>
  `<div class="card-head"><strong>${title}</strong><span class="badge edit" data-mod="${card}">${
    cardMoved(card) ? 'modifié' : ''
  }</span><span class="badge ko" data-ko="${card}">${cardBad(card) ? 'refusé' : ''}</span>${more}</div>`;

function ficheHtml() {
  const p = prioNow();
  const now = tagsNow();
  const derived = sheet.char.tags ?? [];
  const { videos } = sheet;
  return `<div class="c-cols">
    <div class="card c-card${cardBad('ranks') ? ' ko' : ''}" data-card="ranks">
      ${cardHead('ranks', 'Rangs')}
      <div class="c-body">
        <div class="form">${MAIN.map(
          ([f, label]) =>
            `<div class="field"><label for="c-f-${f}">${label}</label>${cell(f, undefined, `id="c-f-${f}"`)}${err(f)}</div>`,
        ).join('')}</div>
        <h3>Par transcendance</h3>
        <div id="c-tiers">${tiersHtml()}</div>
      </div>
    </div>
    <div class="card c-card${cardBad('kit') ? ' ko' : ''}" data-card="kit">
      ${cardHead('kit', 'Kit')}
      <div class="c-body">
        <h3>Priorité de skills</h3>
        <div class="form">${PRIOS.map(
          ([k, label]) =>
            `<div class="field"><label for="c-p-${k}">${label}</label><input id="c-p-${k}" class="w-qty${
              p[k] !== prioBase()[k] ? ' dirty' : ''
            }${prioIssue(k) || refused.has('skillPriority') ? ' refused' : ''}" type="number" min="1" max="3" step="1" inputmode="numeric" data-prio="${k}" value="${esc(p[k])}" /></div>`,
        ).join('')}<span class="lbl c-note">1 à 3 ; vide = non renseigné.</span></div>
        ${err('skillPriority', refused.get('skillPriority') ?? issues()[0] ?? '')}
        <h3>Tags</h3>
        <div class="c-tags">${sheet.humanTags
          .map(
            (t) =>
              `<label class="check"><input type="checkbox" data-tag="${esc(t)}"${now.includes(t) ? ' checked' : ''} /> ${esc(t)}</label>`,
          )
          .join('')}</div>
        ${err('tags')}
        <div class="c-derived"><span class="lbl">déduits des données</span>${
          derived.length
            ? derived.map((t) => `<span class="badge off">${esc(t)}</span>`).join('')
            : '<span class="lbl">— aucun</span>'
        }</div>
      </div>
    </div>
    <div class="card c-card c-wide" data-card="videos">
      <div class="card-head"><strong>Vidéos</strong><span class="badge off">${videos.length}</span><span class="lbl">en lecture</span><a class="c-link" href="#videos" data-act="videos">ajouter dans Vidéos</a></div>
      <div class="c-body">${
        videos.length
          ? `<ul class="c-videos">${videos.map(videoRow).join('')}</ul>`
          : '<p class="lbl">aucune vidéo</p>'
      }</div>
    </div>
  </div>`;
}

/** Le sous-onglet montré, redessiné en entier : un autre perso, « Annuler », l'état relu. */
function render() {
  $('c-panel').innerHTML = sheet && sub === 'fiche' ? ficheHtml() : '';
  subTabs();
  bar();
}

/**
 * Ce qui suit une saisie SANS redessiner la carte — le champ y perdrait le
 * focus : les badges et le bord des cartes, les refus sous les champs, les
 * points des sous-onglets, la savebar.
 */
function marks() {
  const panel = $('c-panel');
  for (const card of panel.querySelectorAll('[data-card]')) {
    const id = card.dataset.card;
    if (!cardKeys[id]) continue;
    card.classList.toggle('ko', cardBad(id));
    card.querySelector(`[data-mod="${id}"]`).textContent = cardMoved(id) ? 'modifié' : '';
    card.querySelector(`[data-ko="${id}"]`).textContent = cardBad(id) ? 'refusé' : '';
  }
  for (const at of panel.querySelectorAll('[data-err]')) {
    const key = at.dataset.err;
    at.textContent =
      key === 'tiers'
        ? tiersSaid()
        : (refused.get(key) ?? (key === 'skillPriority' ? (issues()[0] ?? '') : ''));
  }
  for (const input of panel.querySelectorAll('[data-prio]')) {
    const k = input.dataset.prio;
    input.classList.toggle('dirty', prioNow()[k] !== prioBase()[k]);
    input.classList.toggle('refused', Boolean(prioIssue(k)) || refused.has('skillPriority'));
  }
  subTabs();
  bar();
}

/** La table des paliers seule : un palier ajouté, retiré ou déplacé. */
function tiersDraw(focus) {
  $('c-tiers').innerHTML = tiersHtml();
  marks();
  if (focus) $('c-tiers').querySelector(focus)?.focus();
}

$('c-panel').onchange = (e) => {
  if (!sheet) return;
  const move = e.target.closest('select[data-move]');
  if (move) {
    // Le palier change : son rang et son rôle le suivent.
    const from = move.dataset.move;
    const to = move.value;
    for (const [f] of TABLES) {
      const v = valueOf(f, from);
      setCell(f, from, '');
      setCell(f, to, v);
    }
    added.delete(from);
    added.add(to);
    return tiersDraw(`select[data-move="${to}"]`);
  }
  const s = e.target.closest('select[data-field]');
  if (s) {
    const { field, step } = s.dataset;
    setCell(field, step, s.value);
    // Un palier vidé à la main reste à l'écran : ✕ le retire.
    if (step) added.add(step);
    const key = cellKey(field, step);
    s.className = cells.has(key) ? 'dirty' : '';
    s.removeAttribute('title');
    // L'icône du rang suit le menu.
    const icon = s.parentElement.querySelector('.c-rkico');
    if (icon) {
      icon.hidden = !sheet.tiers.includes(s.value);
      if (!icon.hidden) icon.src = rankSrc(s.value);
    }
    return marks();
  }
  const box = e.target.closest('input[data-tag]');
  if (box) {
    const now = sheet.humanTags.filter(
      (t) => $('c-panel').querySelector(`input[data-tag="${t}"]`)?.checked,
    );
    tags = now.join('|') === tagsBase().join('|') ? null : now;
    refused.delete('tags');
    marks();
  }
};

// Frappe dans une priorité : l'état suit, rien n'est redessiné.
$('c-panel').oninput = (e) => {
  const input = e.target.closest('input[data-prio]');
  if (!input || !sheet) return;
  const next = { ...prioNow(), [input.dataset.prio]: input.value.trim() };
  prio = PRIOS.every(([k]) => next[k] === prioBase()[k]) ? null : next;
  refused.delete('skillPriority');
  marks();
};

$('c-panel').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !sheet) return;
  const { act, step } = el.dataset;
  if (act === 'add-step') {
    const next = stepsFree()[0];
    if (!next) return;
    added.add(next.key);
    return tiersDraw(`select[data-field="rankByTranscend"][data-step="${next.key}"]`);
  }
  if (act === 'del-step') {
    for (const [f] of TABLES) setCell(f, step, '');
    added.delete(step);
    return tiersDraw('[data-act="add-step"]');
  }
  if (act === 'videos') {
    e.preventDefault();
    const id = sheet.char.id;
    sections.go('videos');
    // L'onglet Vidéos s'ouvre sur ce perso, s'il s'est ouvert (des changements
    // en attente peuvent retenir ici) et si sa liste de cibles le propose.
    const target = document.getElementById('v-target');
    const value = `character:${id}`;
    if (
      target &&
      !document.getElementById('tab-videos')?.hidden &&
      [...target.options].some((o) => o.value === value)
    )
      target.value = value;
  }
};

// ------------------------------------------------------ les sous-onglets
/** L'adresse dit le perso et le sous-onglet : recharger y revient. */
const writeHash = () =>
  history.replaceState(
    null,
    '',
    sheet ? `#character/${encodeURIComponent(sheet.char.id)}/${sub}` : '#character',
  );

function showSub(id) {
  if (id === sub || !subsOn().some((s) => s.id === id)) return;
  sub = id;
  render();
  writeHash();
}
$('c-tabs').onclick = (e) => {
  const el = e.target.closest('[role="tab"]:not([disabled])');
  if (el) showSub(el.dataset.sub);
};
// Flèches, Début, Fin : le sous-onglet voisin parmi ceux qui sont allumés (les
// bouts se rejoignent), le premier, le dernier — montré aussitôt, avec le focus.
$('c-tabs').onkeydown = (e) => {
  const on = subsOn();
  const at = on.findIndex((s) => s.id === sub);
  const to = {
    ArrowLeft: (at + on.length - 1) % on.length,
    ArrowRight: (at + 1) % on.length,
    Home: 0,
    End: on.length - 1,
  }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  showSub(on[to].id);
  $(`c-tab-${sub}`)?.focus();
};

// ------------------------------------------------------ le perso
/**
 * La fiche d'un perso, relue du disque : c'est lui qui fait foi. La saisie en
 * attente est abandonnée — sauf `keep`, où l'appelant la repose lui-même
 * (après un enregistrement).
 */
async function load(id, keep = false) {
  const s = await getJson(`/api/character/state?id=${encodeURIComponent(id)}`);
  sheet = s;
  wanted = null;
  if (!keep) {
    cells.clear();
    prio = tags = null;
    refused = new Map();
  }
  added.clear();
  who();
  render();
  // L'adresse n'est celle de la fiche que si c'est elle qui est à l'écran.
  if (!$('tab-character').hidden) writeHash();
}

/**
 * Un perso choisi dans le picker. Rend `false` pour le garder ouvert : des
 * changements en attente, et l'abandon refusé.
 */
function choose(id) {
  if (id === sheet?.char.id) return;
  const n = changes();
  if (
    n &&
    !confirm(
      `Abandonner ${plural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${sheet.char.name} ?`,
    )
  )
    return false;
  load(id).catch((e) => log([`Fiche illisible : ${e}`], false));
}

const pickChar = () =>
  openHeroPicker({
    title: 'Choisir un perso',
    roster: roster ?? [],
    imgBase: state.imgBase,
    chosen: sheet?.char.id,
    opener: () => $('c-pick'),
    onPick: choose,
  });
$('c-pick').onclick = pickChar;

/** Sans perso, la fiche n'a rien à montrer : le picker s'ouvre de lui-même. */
function pickIfEmpty() {
  if (roster && !sheet && !wanted && !$('tab-character').hidden) pickChar();
}

$('c-reset').onclick = () =>
  load(sheet.char.id).catch((e) => log([`Fiche illisible : ${e}`], false));

$('c-save').onclick = async () => {
  if (!sheet || !changes()) return;
  const bad = issues();
  if (bad.length) return log(['Rien n’est envoyé tant qu’il reste des erreurs :', ...bad], false);

  const id = sheet.char.id;
  const curated = {};
  // Chaque champ part ENTIER, et seulement s'il a bougé.
  if (prioMoved())
    curated.skillPriority = Object.fromEntries(
      PRIOS.filter(([k]) => prioNow()[k] !== '').map(([k]) => [k, Number(prioNow()[k])]),
    );
  if (tagsMoved()) curated.tags = tagsNow();

  $('c-save').disabled = $('c-reset').disabled = true;
  $('c-save').classList.add('busy');
  log([], undefined, 'envoi de la fiche au serveur');
  try {
    const r = await post('/api/character', {
      id,
      changes: { ranks: [...cells.values()], curated, was: sheet.curated },
    });
    const said = new Map((r.refused ?? []).map((x) => [cellKey(x.field, x.step), x.reason]));
    // Le disque fait foi, que tout soit passé ou non : on le relit, puis la
    // saisie s'y repose. Une cellule enregistrée ou refusée n'est plus
    // « modifiée » (la refusée montre la valeur du disque, cerclée), comme dans
    // Rangs ; celle qui n'a pas été traitée reste en attente. Un champ hors
    // rangs refusé garde sa saisie — sauf si c'est le disque qui avait changé
    // (`stale`) : il montre alors le disque.
    const pending = [...cells.values()];
    const typed = { prio, tags };
    await load(id, true);
    cells.clear();
    for (const c of pending)
      if (!said.has(cellKey(c.field, c.step))) setCell(c.field, c.step, c.to);
    prio = tags = null;
    if (!r.stale) {
      if (typed.prio && PRIOS.some(([k]) => typed.prio[k] !== prioBase()[k])) prio = typed.prio;
      if (typed.tags && typed.tags.join('|') !== tagsBase().join('|')) tags = typed.tags;
    }
    refused = said;
  } catch (e) {
    log([`Enregistrement interrompu : ${e}`], false);
  } finally {
    $('c-save').classList.remove('busy');
    render();
  }
};

/** Quitter l'onglet avec des changements en attente : sur confirmation. */
function leave() {
  const n = changes();
  return (
    !n ||
    confirm(
      `${plural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${sheet.char.name}. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.`,
    )
  );
}

sections.register('character', {
  init: () => {
    // `#character/<id>` ouvre l'onglet sur la fiche de ce perso, et
    // `#character/<id>/<sous-onglet>` sur ce sous-onglet (un lien, le banc de
    // captures). `lib.js` ne connaît que `#character` : c'est le clic sur
    // l'onglet qui l'ouvre.
    const [, open, tab] = /^#character\/([^/]+)(?:\/([a-z-]+))?$/.exec(location.hash) ?? [];
    if (open) {
      wanted = decodeURIComponent(open);
      if (subsOn().some((s) => s.id === tab)) sub = tab;
      document.querySelector('#tabs [data-tab="character"]')?.click();
    }
    who();
    bar();
    // Les images sont sous `imgBase`, connu avec `/api/state` : reposées si
    // l'état en annonce une autre.
    stateLoaded.then(() => {
      if (state.imgBase === drawnBase) return;
      who();
      if (sheet) render();
    });
    return getJson('/api/character/roster')
      .then((r) => {
        roster = r.roster;
        $('c-pick').disabled = false;
        return wanted ? load(wanted) : pickIfEmpty();
      })
      .catch((e) => {
        wanted = null;
        log([`Fiche perso illisible : ${e}`], false);
      });
  },
  // Chaque venue à l'écran : sans perso, le picker ; avec, l'adresse — et, s'il
  // n'y a rien en attente, la fiche relue (un rang a pu changer dans Rangs).
  open: () => {
    if (!sheet) return pickIfEmpty();
    writeHash();
    if (!changes()) load(sheet.char.id).catch((e) => log([`Fiche illisible : ${e}`], false));
  },
  // Des changements en attente ne survivent pas à un rechargement de la page.
  dirty: changes,
  canLeave: leave,
});
