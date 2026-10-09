// Onglet « Fiche perso » : un perso, choisi dans le picker de héros partagé, et
// ce que le wiki sait de lui en sous-onglets. « Fiche » : rangs, rôle, paliers
// par transcendance, priorité de skills, tags. « Pros / Cons » et
// « Synergies » : des textes à tags inline, saisis en anglais, traduits par
// « Traduire », avec leur aperçu tel que le site les rendra. « Skills » : les
// cartes de skills du perso et leurs chips d'effets — ✕ en masque une, « ＋ effet »
// en ajoute une du glossaire. Une seule savebar, un seul enregistrement, un seul
// commit.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';
import { gameText, noteHtml } from '../gear-view.mjs';
import { heroFilters, openHeroPicker } from '../hero-picker.mjs';

// Les sous-onglets, dans l'ordre de la fiche du site. `soon` : pas encore
// porté — l'onglet est là, éteint, et son `title` dit quel lot l'apporte.
const SUBS = [
  { id: 'fiche', label: 'Fiche' },
  { id: 'pros-cons', label: 'Pros / Cons' },
  { id: 'synergies', label: 'Synergies' },
  { id: 'skills', label: 'Skills' },
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
// Les listes de textes à tags inline, par sous-onglet, et le champ du curé qui
// les porte : sa clé est celle d'un refus qui ne vise aucune ligne.
const LISTS = ['pros', 'cons', 'synergies'];
const TEXT_TABS = { 'pros-cons': ['pros', 'cons'], synergies: ['synergies'] };
const TEXT_FIELDS = { 'pros-cons': 'prosCons', synergies: 'synergies' };
const LIST_WORDS = { pros: 'pro', cons: 'con', synergies: 'groupe' };
// L'aperçu part ce délai après la dernière frappe, celui de Gear reco.
const PV_DELAY = 400;

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
// Refus du dernier enregistrement : clé de cellule, de champ ou de ligne → la raison.
let refused = new Map();
// Les lignes de Pros / Cons et de Synergies. Une ligne : sa clé (`k`), son texte
// par langue, l'anglais de sa dernière traduction (`at`), ce que le disque en
// portait (`base`, `null` pour une ligne ajoutée). Un groupe de synergie est
// une ligne qui porte en plus ses héros.
const lists = { pros: [], cons: [], synergies: [] };
// Les lignes du disque retirées, par liste : elles comptent dans la savebar.
const gone = { pros: 0, cons: 0, synergies: 0 };
let seq = 0;
const trOpen = new Set(); // les « Traductions » dépliées, par clé de ligne
let tr = { busy: false, error: '' }; // « Traduire » : en cours, son dernier refus
// L'aperçu des textes du sous-onglet montré, résolu par le serveur
// (`POST /api/character/preview`) : UNE requête pour toutes ses lignes, UNE
// langue pour toute la fiche.
const pv = {
  lang: '', // posée au premier perso chargé : la langue de repli
  seq: 0, // la dernière requête partie : une réponse plus ancienne est ignorée
  timer: 0, // le délai après la dernière frappe
  sent: '', // ce que la dernière requête portait : la même ne repart pas
  busy: false,
  error: '', // le refus du serveur, ou l'échec réseau
  segs: new Map(), // clé de ligne → ses segments
};
// Les chips des skills : par carte, les refs masquées (`hide`) et les effets
// ajoutés (`add`) tels qu'ils partiraient. Une carte absente : ce que le disque
// porte. Les deux sections du curé, sous leurs noms.
const kit = { hide: {}, add: {} };
const KIT = { hide: 'chipHide', add: 'chipAdd' };
const fxFilters = heroFilters(); // les filtres du picker d'effets, à lui
let wantedPick = 0; // la carte dont le hash demande le picker d'effets (à partir de 1)
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

// Les textes à tags inline. L'anglais se saisit, les autres langues se
// génèrent (« Traduire ») et se relisent ; le site replie une langue absente
// sur l'anglais.
const def = () => sheet.langs.default;
const others = () => sheet.langs.shown.filter((l) => l !== def());
const lineKey = (list, line) => `${list}:${line.k}`;
/** Un texte tel qu'il partirait : les langues écrites, dans leur ordre. */
const textOut = (text) => Object.fromEntries(Object.entries(text).filter(([, v]) => v.trim()));
/** Une ligne telle qu'elle partirait : un texte localisé, ou un groupe de synergie. */
function lineOut(list, line) {
  const text = textOut(line.text);
  if (list !== 'synergies') return text;
  return { heroes: line.heroes, ...(Object.keys(text).length ? { reason: text } : {}) };
}
/** Ni texte ni héros : une ligne vide ne part pas, et ajoutée elle ne compte pas. */
const blank = (list, line) =>
  !Object.keys(textOut(line.text)).length && !(list === 'synergies' && line.heroes.length);
const lineMoved = (list, line) =>
  line.base === null ? !blank(list, line) : JSON.stringify(lineOut(list, line)) !== line.base;
/** Lignes ajoutées, modifiées, retirées. */
const listChanges = (list) => gone[list] + lists[list].filter((l) => lineMoved(list, l)).length;
/** Une liste telle qu'elle partirait : ses lignes non vides. */
const listOut = (list) => lists[list].filter((l) => !blank(list, l));

function newLine(list, item) {
  const text = { ...((list === 'synergies' ? item?.reason : item) ?? {}) };
  const line = {
    k: `t${++seq}`,
    text,
    at: text[def()] ?? '',
    base: null,
    ...(list === 'synergies' ? { heroes: [...(item?.heroes ?? [])] } : {}),
  };
  if (item) line.base = JSON.stringify(lineOut(list, line));
  return line;
}
/** Ce que le disque porte d'une liste. */
const diskList = (list) =>
  (list === 'synergies' ? sheet.curated.synergies : sheet.curated.prosCons?.[list]) ?? [];
/** Les listes relues du disque : la saisie en attente y est abandonnée. */
function fromDisk(which = LISTS) {
  for (const list of which) {
    lists[list] = diskList(list).map((item) => newLine(list, item));
    gone[list] = 0;
  }
  const alive = new Set(LISTS.flatMap((list) => lists[list].map((l) => l.k)));
  for (const k of [...pv.segs.keys()]) if (!alive.has(k)) pv.segs.delete(k);
  for (const k of [...trOpen]) if (!alive.has(k)) trOpen.delete(k);
  pv.sent = '';
}
/** Le disque porte-t-il déjà ce que la liste enverrait ? */
const sameAsDisk = (list) =>
  JSON.stringify(listOut(list).map((l) => lineOut(list, l))) ===
  JSON.stringify(diskList(list).map((item) => lineOut(list, newLine(list, item))));

const en = (line) => (line.text[def()] ?? '').trim();
/** Des traductions qui datent d'un autre anglais que celui saisi. */
const stale = (line) =>
  Boolean(en(line)) && en(line) !== line.at.trim() && others().some((l) => line.text[l]?.trim());
const tally = (line) =>
  `${others().filter((l) => line.text[l]?.trim()).length} / ${others().length}`;

// Les chips des skills. Une carte porte les chips que le kit lui pose (`chips`),
// dont le curé masque certaines, et les effets que le curé lui ajoute.
const kitBase = (kind, card) => sheet.kit[KIT[kind]][card] ?? [];
const kitNow = (kind, card) => kit[kind][card] ?? kitBase(kind, card);
/** Ce qui sépare deux listes de refs : celles de l'une que l'autre n'a pas. */
const apart = (a, b) =>
  a.filter((x) => !b.includes(x)).length + b.filter((x) => !a.includes(x)).length;
/** Les chips d'une carte masquées, rétablies, ajoutées ou retirées depuis le disque. */
const cardChanges = (card) =>
  apart(kitNow('hide', card), kitBase('hide', card)) +
  apart(kitNow('add', card), kitBase('add', card));
const kitChanges = () => sheet.kit.cards.reduce((n, c) => n + cardChanges(c.id), 0);
/** Pose une liste d'une carte : revenue à celle du disque, elle n'est plus modifiée. */
function kitSet(kind, card, list) {
  if (apart(list, kitBase(kind, card))) kit[kind][card] = list;
  else delete kit[kind][card];
  refused.delete(`kit:${card}`);
  refused.delete('kit');
}
/** La saisie que le disque porte maintenant, ou dont la carte n'est plus : oubliée. */
function kitPrune() {
  for (const kind of Object.keys(KIT))
    for (const card of Object.keys(kit[kind]))
      if (
        !sheet.kit.cards.some((c) => c.id === card) ||
        !apart(kit[kind][card], kitBase(kind, card))
      )
        delete kit[kind][card];
}
/** Les chips telles qu'elles partiraient : par carte modifiée, ses deux listes ENTIÈRES. */
function kitOut() {
  const moved = sheet.kit.cards.filter((c) => cardChanges(c.id));
  if (!moved.length) return null;
  const lists = (kind) => Object.fromEntries(moved.map((c) => [c.id, kitNow(kind, c.id)]));
  return {
    cardIds: sheet.kit.cards.map((c) => c.id),
    chipHide: lists('hide'),
    chipAdd: lists('add'),
  };
}

/** Le sous-onglet d'un refus, d'après sa clé. */
const subOf = (key) =>
  key === 'kit' || key.startsWith('kit:')
    ? 'skills'
    : (Object.keys(TEXT_TABS).find(
        (id) => key === TEXT_FIELDS[id] || TEXT_TABS[id].some((list) => key.startsWith(`${list}:`)),
      ) ?? 'fiche');
const refusedIn = (id) => [...refused.keys()].filter((k) => subOf(k) === id);
/** Ce qu'un sous-onglet a en attente. */
const subChanges = (id) =>
  id === 'fiche'
    ? cells.size + Number(prioMoved()) + Number(tagsMoved())
    : id === 'skills'
      ? kitChanges()
      : (TEXT_TABS[id] ?? []).reduce((n, list) => n + listChanges(list), 0);

/**
 * Ce que compte la savebar : une cellule de rang, la priorité, les tags, chaque
 * ligne de pros, de cons ou de synergie ajoutée, modifiée ou retirée, et chaque
 * chip de skill masquée, rétablie, ajoutée ou retirée.
 */
const changes = () => (sheet ? SUBS.reduce((n, s) => n + subChanges(s.id), 0) : 0);

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
    [...new Set([...cells.keys(), ...refusedIn('fiche')])].filter((k) => !KIT_KEYS.includes(k)),
  kit: () => KIT_KEYS,
  pros: () => lists.pros.map((l) => lineKey('pros', l)),
  cons: () => lists.cons.map((l) => lineKey('cons', l)),
};
const cardMoved = (card) =>
  card === 'ranks'
    ? cells.size > 0
    : card === 'kit'
      ? prioMoved() || tagsMoved()
      : card in lists
        ? listChanges(card) > 0
        : false;
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

/** Le groupe des langues de l'aperçu, dans la savebar : là où il y a des textes. */
function pvLangs() {
  const at = $('c-pv-lang');
  at.hidden = !sheet || !TEXT_TABS[sub];
  at.innerHTML = at.hidden
    ? ''
    : `<span class="lbl">Aperçu</span><div class="c-seg" role="group" aria-label="Langue de l’aperçu">${sheet.langs.shown
        .map(
          (l) =>
            `<button type="button" data-lang="${esc(l)}" aria-pressed="${l === pv.lang}">${esc(l)}</button>`,
        )
        .join('')}</div>`;
}
$('c-pv-lang').onclick = (e) => {
  const el = e.target.closest('button[data-lang]');
  if (!el || el.dataset.lang === pv.lang) return;
  pv.lang = el.dataset.lang;
  for (const b of el.parentElement.children) b.setAttribute('aria-pressed', String(b === el));
  pvAsk();
};

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
        const dot =
          refusedIn(s.id).length || (s.id === 'fiche' && issues().length)
            ? ['ko', 'refusé ou en erreur']
            : subChanges(s.id)
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

// ------------------------------------- « Pros / Cons » et « Synergies »
const viewEnv = () => ({ imgBase: state.imgBase, esc });
/** L'aperçu d'une ligne : ses segments, tels que le site les rend. */
const pvBody = (line) => noteHtml(viewEnv(), pv.segs.get(line.k) ?? []);
const where = (list, i) => `${cap(LIST_WORDS[list])} ${i + 1}`;

/**
 * Le texte d'une ligne : l'anglais (une textarea de deux lignes, qui grandit),
 * son aperçu, son refus, puis les traductions, repliées. Le saut de ligne
 * après `<textarea>` est mangé par le navigateur : sans lui, c'est celui d'un
 * texte qui commence par une ligne vide qui le serait.
 */
function textHtml(list, line, i) {
  const key = lineKey(list, line);
  const what = list === 'synergies' ? `Raison du groupe ${i + 1}` : where(list, i);
  const area = (lang, attrs) =>
    `<textarea rows="2" data-lang="${esc(lang)}" ${attrs}${
      lang === def() && refused.has(key) ? ' class="refused"' : ''
    }>\n${esc(line.text[lang] ?? '')}</textarea>`;
  return `${area(def(), `aria-label="${what}, en anglais"`)}
    <p class="c-pv pv-note${pv.busy ? ' busy' : ''}" data-pv>${pvBody(line)}</p>
    ${err(key)}
    <details${trOpen.has(line.k) ? ' open' : ''}>
      <summary><span class="btn ghost sm">Traductions (${others().length})</span><span class="badge warn" data-stale>${
        stale(line) ? 'à retraduire' : ''
      }</span><span class="lbl" data-tally>${tally(line)}</span></summary>
      <div class="c-trs">${others()
        .map(
          (lang) =>
            `<div class="field"><label for="c-${line.k}-${esc(lang)}">${esc(lang)}</label>${area(
              lang,
              `id="c-${line.k}-${esc(lang)}" placeholder="${esc(line.text[def()] ?? '')}"`,
            )}</div>`,
        )
        .join('')}</div>
    </details>`;
}

/** « Traduire », le même dans les deux sous-onglets : il vaut pour tout l'onglet. */
const translateHtml = () =>
  `<button class="btn ghost${tr.busy ? ' busy' : ''}" type="button" data-act="translate"${
    tr.busy ? ' disabled' : ''
  } title="Traduit les textes anglais de l’onglet vers ${others().join(', ')} et ÉCRASE les traductions en place : l’anglais fait foi (DeepL, puis Claude Haiku). À relire ; rien ne s’écrit avant « Enregistrer ».">Traduire</button><span class="badge error" data-tr-error>${esc(tr.error)}</span><p class="c-ko" data-pv-error>${esc(pv.error)}</p>`;

/** Une carte de Pros / Cons : ses lignes, puis « ＋ pro » ou « ＋ con ». */
function sideHtml(list, title) {
  const word = LIST_WORDS[list];
  return `<div class="card c-card${cardBad(list) ? ' ko' : ''}" data-card="${list}">
    ${cardHead(list, title, `<span class="badge off" data-n>${lists[list].length}</span>`)}
    <div class="c-body">
      ${
        lists[list].length
          ? `<ul class="c-lines">${lists[list]
              .map(
                (line, i) =>
                  `<li class="c-line${lineMoved(list, line) ? ' dirty' : ''}" data-list="${list}" data-k="${line.k}"><div class="c-text">${textHtml(list, line, i)}</div><button class="btn icon" type="button" data-act="del-line" title="Retirer" aria-label="Retirer le ${word} ${i + 1}">✕</button></li>`,
              )
              .join('')}</ul>`
          : `<p class="lbl">Aucun ${word}.</p>`
      }
      <div class="c-foot"><button class="btn ghost sm" type="button" data-act="add-line" data-list="${list}">＋ ${word}</button></div>
    </div>
  </div>`;
}

const prosConsHtml = () =>
  `<div class="c-cols">${sideHtml('pros', 'Pros')}${sideHtml('cons', 'Cons')}
    <div class="c-wide c-foot">${translateHtml()}${err('prosCons')}</div>
  </div>`;

const heroName = (id) => roster?.find((c) => c.id === id)?.name ?? id;
/** Une tuile de héros : son portrait, son nom, ✕. */
const heroHtml = (id) =>
  `<span class="c-hero"><img src="${src(`characters/portrait/CT_${esc(id)}`)}" alt="" aria-hidden="true" width="44" height="44" /><span>${esc(heroName(id))}</span><button class="btn icon" type="button" data-act="del-hero" data-hero="${esc(id)}" title="Retirer" aria-label="Retirer ${esc(heroName(id))}">✕</button></span>`;

/** Une carte par groupe : ses héros, « ＋ héros », puis la raison. */
const synHtml = () =>
  `<div class="c-syn">${
    lists.synergies.length
      ? lists.synergies
          .map((line, i) => {
            const bad = refused.has(lineKey('synergies', line));
            return `<div class="card c-card c-group${bad ? ' ko' : ''}" data-list="synergies" data-k="${line.k}">
        <div class="card-head"><strong>Groupe ${i + 1}</strong><span class="badge edit" data-mod-line>${
          lineMoved('synergies', line) ? 'modifié' : ''
        }</span><span class="badge ko" data-ko-line>${bad ? 'refusé' : ''}</span><button class="btn icon" type="button" data-act="del-line" title="Retirer le groupe" aria-label="Retirer le groupe ${i + 1}">✕</button></div>
        <div class="c-body">
          <div class="c-heroes">${line.heroes.map(heroHtml).join('')}<button class="btn ghost sm" type="button" data-act="add-hero" aria-haspopup="dialog">＋ héros</button></div>
          <div class="c-text">${textHtml('synergies', line, i)}</div>
        </div>
      </div>`;
          })
          .join('')
      : '<p class="lbl">Aucune synergie.</p>'
  }
    <div class="c-foot"><button class="btn ghost sm" type="button" data-act="add-line" data-list="synergies">＋ groupe</button>${translateHtml()}${err('synergies')}</div>
  </div>`;

// ------------------------------------------------------ le sous-onglet « Skills »
/** Une image que le serveur a résolue : relative (`/images/…`), elle passe sous `imgBase`. */
const srcAt = (path) => esc(path.startsWith('/') ? `${state.imgBase}${path}` : path);
// Les caractères qu'`encodeURIComponent` laisse et qu'un `url('…')` lirait.
const fxUrl = (icon) =>
  `${state.imgBase}/${sheet.kit.sprite}/${encodeURIComponent(icon).replace(/['()]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}.webp`;

/**
 * La tuile d'un effet, comme le site la peint (`EffectIconTile`) et comme
 * l'onglet Effets : fond noir, l'icône en MASQUE teinté de sa nature — sauf les
 * « Interruption », qui gardent leurs couleurs. Décorative : le nom est à côté.
 */
function fxTile(icon, isDebuff) {
  if (!icon) return '<span class="c-fx none" aria-hidden="true"></span>';
  const url = esc(fxUrl(icon));
  if (icon.includes('Interruption'))
    return `<span class="c-fx" aria-hidden="true"><img src="${url}" alt="" loading="lazy" /></span>`;
  return `<span class="c-fx ${isDebuff ? 'debuff' : 'buff'}" style="--c-src: url('${url}')" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

/** Un effet ajouté à une carte, tel que le catalogue le connaît ; sinon sa ref. */
function addedChip(ref) {
  const o = sheet.kit.catalog[ref];
  return { ref, name: o?.name ?? ref, icon: o?.icon, isDebuff: o?.isDebuff ?? false };
}

/**
 * Une chip d'une carte. Celle que le kit pose (`auto`) : ✕ la masque — barrée
 * et atténuée, « rétablir » la rend. Un effet ajouté (`add`) : son badge, et ✕
 * le retire. Le bord accent : son état n'est pas celui du disque.
 */
function chipHtml(card, c, kind) {
  const add = kind === 'add';
  const now = kitNow(add ? 'add' : 'hide', card.id).includes(c.ref);
  const off = !add && now;
  const moved = now !== kitBase(add ? 'add' : 'hide', card.id).includes(c.ref);
  return `<span class="chip c-chip${off ? ' off' : ''}${moved ? ' dirty' : ''}" data-kind="${kind}" data-ref="${esc(c.ref)}" title="${esc(c.ref)}">${fxTile(c.icon, c.isDebuff)}<span class="c-chn">${esc(c.name)}</span>${
    add ? '<span class="badge edit">ajoutée</span>' : ''
  }${
    off
      ? `<button class="btn ghost sm" type="button" data-act="show-chip" aria-label="Rétablir ${esc(c.name)}">rétablir</button>`
      : `<button class="btn icon" type="button" data-act="${add ? 'del-chip' : 'hide-chip'}" title="${
          add ? 'Retirer' : 'Masquer sur cette carte'
        }" aria-label="${add ? 'Retirer' : 'Masquer'} ${esc(c.name)}">✕</button>`
  }</span>`;
}

/** La description d'un skill, sans les sauts de ligne qui la terminent (la moitié « chaîne » d'un chain_passive). */
const skillDesc = (desc) => desc.replace(/(?:\\n|\s)+$/, '');

/** L'intérieur d'une carte de skill : son en-tête, sa description, ses chips, « ＋ effet ». */
function skillInner(card) {
  const key = `kit:${card.id}`;
  return `<div class="card-head">${
    card.iconSrc
      ? `<img class="c-skico" src="${srcAt(card.iconSrc)}" alt="" aria-hidden="true" width="36" height="36" />`
      : ''
  }<strong>${esc(card.name || '(sans nom)')}</strong><span class="lbl c-skid">${esc(card.id)} · ${esc(card.type)}</span><span class="badge edit">${
    cardChanges(card.id) ? 'modifié' : ''
  }</span><span class="badge ko">${refused.has(key) ? 'refusé' : ''}</span></div>
    <div class="c-body">
      ${card.desc ? `<p class="c-desc">${gameText(viewEnv(), skillDesc(card.desc))}</p>` : ''}
      <div class="c-chips">${card.chips.map((c) => chipHtml(card, c, 'auto')).join('')}${kitNow(
        'add',
        card.id,
      )
        .map((ref) => chipHtml(card, addedChip(ref), 'add'))
        .join(
          '',
        )}<button class="btn ghost sm" type="button" data-act="add-chip" aria-haspopup="dialog">＋ effet</button></div>
      ${err(key)}
    </div>`;
}
const skillClass = (card) => `card c-card c-skill${refused.has(`kit:${card.id}`) ? ' ko' : ''}`;

/** Une carte par skill, comme la fiche du site : mains, passifs, chaîne, duo. */
function skillsHtml() {
  const { cards, error } = sheet.kit;
  if (error) return `<div class="empty">Kit illisible : ${esc(error)}.</div>`;
  if (!cards.length) return '<div class="empty">Aucune carte de skill.</div>';
  return `<div class="c-cols">${cards
    .map((c) => `<div class="${skillClass(c)}" data-kit="${esc(c.id)}">${skillInner(c)}</div>`)
    .join('')}<div class="c-wide c-foot">${err('kit')}</div></div>`;
}

/** La carte d'un skill à l'écran, par son id (`…::dual` : pas un sélecteur sûr). */
const skillEl = (id) =>
  [...$('c-panel').querySelectorAll('[data-kit]')].find((el) => el.dataset.kit === id);

/**
 * Une carte de skill redessinée seule, après un geste sur ses chips ; le focus
 * va à `focus` — `[kind, ref]` : le bouton de cette chip ; sinon « ＋ effet ».
 */
function skillDraw(card, focus) {
  const at = skillEl(card.id);
  if (!at) return;
  at.className = skillClass(card);
  at.innerHTML = skillInner(card);
  marks();
  const chip =
    focus &&
    [...at.querySelectorAll('[data-ref]')].find(
      (el) => el.dataset.kind === focus[0] && el.dataset.ref === focus[1],
    );
  (chip ?? at).querySelector(chip ? 'button' : '[data-act="add-chip"]')?.focus();
}

/**
 * Le catalogue des effets en options du picker, par nom. Des effets DISTINCTS
 * partagent un nom (variante irremovable, natures opposées) : les homonymes
 * sont suffixés, et l'id départage ce qui reste — la règle de l'éditeur de
 * l'admin.
 */
function fxOptions() {
  const all = Object.values(sheet.kit.catalog);
  const counts = new Map();
  for (const o of all)
    counts.set(o.name.toLowerCase(), (counts.get(o.name.toLowerCase()) ?? 0) + 1);
  const seen = new Set();
  return all
    .map((o) => {
      let name = o.name;
      if (counts.get(o.name.toLowerCase()) > 1)
        name = `${o.name} (${[o.irremovable && 'irremovable', o.isDebuff ? 'debuff' : 'buff'].filter(Boolean).join(', ')})`;
      if (seen.has(name.toLowerCase())) name = `${name} [${o.id}]`;
      seen.add(name.toLowerCase());
      return { ...o, name };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * « ＋ effet » : le picker partagé, sur le catalogue des effets — ceux que la
 * carte n'a pas déjà en ajout. Celui qu'on y choisit s'ajoute à la carte.
 */
function pickEffect(card) {
  const have = kitNow('add', card.id);
  const options = fxOptions().filter((o) => !have.includes(o.id));
  openHeroPicker({
    title: `Ajouter un effet — ${card.name || card.id}`,
    roster: options,
    imgBase: state.imgBase,
    rows: true,
    tile: (o) => `${fxTile(o.icon, o.isDebuff)}<span>${esc(o.name)}</span>`,
    hint: (o) => `${o.name} — ${o.id}`,
    placeholder: 'Chercher un effet…',
    none: 'Aucun effet ne correspond.',
    tally: () => plural(options.length, 'effet'),
    seg: {
      label: 'Nature',
      options: [
        ['', 'Tous'],
        ['buff', 'Buffs'],
        ['debuff', 'Debuffs'],
      ],
      test: (o, value) => !value || (value === 'debuff') === o.isDebuff,
    },
    filters: fxFilters,
    opener: () => skillEl(card.id)?.querySelector('[data-act="add-chip"]'),
    onPick: (id) => {
      kitSet('add', card.id, [...kitNow('add', card.id), id]);
      skillDraw(card);
    },
  });
}

/** Un geste sur une carte de skill : « ＋ effet », ou le bouton d'une de ses chips. */
function kitAct(at, el) {
  const card = sheet.kit.cards.find((c) => c.id === at.dataset.kit);
  if (!card) return;
  const { act } = el.dataset;
  if (act === 'add-chip') return pickEffect(card);
  const chip = el.closest('[data-ref]');
  if (!chip) return;
  const { ref } = chip.dataset;
  const kind = act === 'del-chip' ? 'add' : 'hide';
  const now = kitNow(kind, card.id);
  kitSet(kind, card.id, act === 'hide-chip' ? [...now, ref] : now.filter((r) => r !== ref));
  skillDraw(card, kind === 'hide' && ['auto', ref]);
}

/** La ligne d'un élément du panneau : sa liste, son modèle, son élément. */
function lineAt(target) {
  const el = target.closest('[data-k]');
  if (!el) return null;
  const { list, k } = el.dataset;
  const line = lists[list].find((l) => l.k === k);
  return line ? { el, list, line } : null;
}

/** Une textarea prend la hauteur de son texte (deux lignes au moins, par `rows`). */
function grow(area) {
  if (!area.scrollHeight) return;
  area.style.height = 'auto';
  area.style.height = `${area.scrollHeight + 2}px`;
}
const growAll = (root) => root.querySelectorAll('textarea[data-lang]').forEach(grow);

/** L'aperçu des lignes en place : son atténuation, et `redraw` son contenu. */
function pvPaint(redraw) {
  const panel = $('c-panel');
  for (const at of panel.querySelectorAll('[data-pv]')) {
    at.classList.toggle('busy', pv.busy);
    const found = redraw && lineAt(at);
    if (found) at.innerHTML = pvBody(found.line);
  }
  for (const at of panel.querySelectorAll('[data-pv-error]')) at.textContent = pv.error;
}

/**
 * Demande l'aperçu de TOUTES les lignes du sous-onglet montré, dans la langue
 * de la savebar — une langue qu'une ligne ne porte pas se replie sur l'anglais,
 * comme au rendu du site. Pendant la requête le rendu précédent reste, atténué ;
 * une réponse arrivée après une requête plus récente est ignorée ; un refus ou
 * un échec réseau est dit près de « Traduire », et se retente au prochain
 * changement.
 */
async function pvFetch() {
  const of = TEXT_TABS[sub];
  if (!sheet || !of) return;
  const shown = of.flatMap((list) => lists[list]);
  if (!shown.length) return;
  const keys = shown.map((l) => l.k);
  const body = JSON.stringify({
    texts: shown.map((l) => (l.text[pv.lang]?.trim() ? l.text[pv.lang] : (l.text[def()] ?? ''))),
    lang: pv.lang,
  });
  // Les clés comptent : un perso relu du disque a les mêmes textes sous d'autres clés.
  const sent = `${keys.join()} ${body}`;
  if (sent === pv.sent) return;
  pv.sent = sent;
  const mine = ++pv.seq;
  pv.busy = true;
  pvPaint(false);
  let error = '';
  try {
    const res = await fetch('/api/character/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const r = await res.json();
    if (mine !== pv.seq) return;
    if (!res.ok || !r.segments) throw new Error(r.error ?? r.log?.[0] ?? `réponse ${res.status}`);
    keys.forEach((k, i) => pv.segs.set(k, r.segments[i] ?? []));
  } catch (e) {
    if (mine !== pv.seq) return;
    error = `Aperçu indisponible : ${e instanceof Error ? e.message : String(e)}`;
    pv.sent = '';
  }
  pv.error = error;
  pv.busy = false;
  pvPaint(true);
}

/** L'aperçu suit un changement : aussitôt, ou `delay` ms après la dernière frappe. */
function pvAsk(delay = 0) {
  clearTimeout(pv.timer);
  if (delay) pv.timer = setTimeout(pvFetch, delay);
  else pvFetch();
}

/** Les « Traductions » dépliées à l'écran : un redessin les rouvre. */
function keepOpen() {
  for (const d of $('c-panel').querySelectorAll('[data-k] details')) {
    const k = d.closest('[data-k]').dataset.k;
    if (d.open) trOpen.add(k);
    else trOpen.delete(k);
  }
}

/** Le sous-onglet montré, redessiné en entier : un autre perso, « Annuler », l'état relu. */
function render() {
  const panel = $('c-panel');
  keepOpen();
  panel.innerHTML = !sheet
    ? ''
    : sub === 'fiche'
      ? ficheHtml()
      : sub === 'pros-cons'
        ? prosConsHtml()
        : sub === 'synergies'
          ? synHtml()
          : skillsHtml();
  growAll(panel);
  subTabs();
  bar();
  pvLangs();
  pvAsk();
}

/** Ce qui suit la saisie dans une ligne de texte, sans la redessiner. */
function lineMarks({ el, list, line }) {
  const key = lineKey(list, line);
  el.classList.toggle('dirty', lineMoved(list, line));
  el.querySelector(`textarea[data-lang="${def()}"]`).classList.toggle('refused', refused.has(key));
  el.querySelector('[data-stale]').textContent = stale(line) ? 'à retraduire' : '';
  el.querySelector('[data-tally]').textContent = tally(line);
  if (list !== 'synergies') return;
  el.classList.toggle('ko', refused.has(key));
  el.querySelector('[data-mod-line]').textContent = lineMoved(list, line) ? 'modifié' : '';
  el.querySelector('[data-ko-line]').textContent = refused.has(key) ? 'refusé' : '';
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
  for (const el of panel.querySelectorAll('[data-k]')) {
    const found = lineAt(el);
    if (found) lineMarks(found);
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

// Frappe dans une priorité ou dans un texte : l'état suit, rien n'est redessiné.
$('c-panel').oninput = (e) => {
  if (!sheet) return;
  const area = e.target.closest('textarea[data-lang]');
  const found = area && lineAt(area);
  if (found) {
    const { el, list, line } = found;
    const { lang } = area.dataset;
    line.text[lang] = area.value;
    refused.delete(lineKey(list, line));
    refused.delete(TEXT_FIELDS[sub]);
    grow(area);
    // Une traduction pas encore écrite montre l'anglais qu'elle remplacera.
    if (lang === def())
      for (const other of el.querySelectorAll('.c-trs textarea')) other.placeholder = area.value;
    marks();
    return pvAsk(PV_DELAY);
  }
  const input = e.target.closest('input[data-prio]');
  if (!input) return;
  const next = { ...prioNow(), [input.dataset.prio]: input.value.trim() };
  prio = PRIOS.every(([k]) => next[k] === prioBase()[k]) ? null : next;
  refused.delete('skillPriority');
  marks();
};

$('c-panel').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !sheet) return;
  const { act, step } = el.dataset;
  const skill = el.closest('[data-kit]');
  if (skill) return kitAct(skill, el);
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
  if (act === 'translate') return translate();
  if (act === 'add-line') {
    const { list } = el.dataset;
    const line = newLine(list);
    lists[list].push(line);
    render();
    return $('c-panel').querySelector(`[data-k="${line.k}"] textarea`)?.focus();
  }
  const found = lineAt(el);
  if (found && act === 'del-line') {
    const { list, line } = found;
    lists[list] = lists[list].filter((l) => l !== line);
    if (line.base !== null) gone[list]++;
    refused.delete(lineKey(list, line));
    refused.delete(TEXT_FIELDS[sub]);
    render();
    return $('c-panel').querySelector(`[data-act="add-line"][data-list="${list}"]`)?.focus();
  }
  if (found && (act === 'add-hero' || act === 'del-hero')) {
    const { list, line } = found;
    const adder = () => $('c-panel').querySelector(`[data-k="${line.k}"] [data-act="add-hero"]`);
    const set = (heroes) => {
      line.heroes = heroes;
      refused.delete(lineKey(list, line));
      refused.delete(TEXT_FIELDS[sub]);
      render();
      adder()?.focus();
    };
    if (act === 'del-hero') return set(line.heroes.filter((id) => id !== el.dataset.hero));
    // Le picker partagé, en multi : les héros du groupe cochés, le perso de la fiche exclu.
    return openHeroPicker({
      title: 'Héros du groupe',
      roster: (roster ?? []).filter((c) => c.id !== sheet.char.id),
      imgBase: state.imgBase,
      multi: true,
      chosen: line.heroes,
      opener: adder,
      onPick: set,
    });
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

// Des « Traductions » dépliées : leurs textarea prennent leur hauteur (repliées,
// elles n'en avaient pas). `toggle` ne remonte pas : écouté à la descente.
$('c-panel').addEventListener(
  'toggle',
  (e) => {
    if (e.target.open) growAll(e.target);
  },
  true,
);

/**
 * « Traduire » : les textes anglais du sous-onglet montré, d'un seul appel
 * (`POST /api/translate`), posés dans les autres langues — celles en place
 * sont ÉCRASÉES, l'anglais fait foi, comme dans l'admin. Le résultat se pose
 * dans le modèle de la page : il compte dans la savebar et ne part au disque
 * qu'à « Enregistrer », où le serveur contrôle les tags des traductions comme
 * ceux de l'anglais. Un refus (pas de clé, le moteur) va au journal : rien ne
 * bouge.
 */
async function translate() {
  const of = TEXT_TABS[sub];
  if (tr.busy || !of) return;
  const todo = of
    .flatMap((list) => lists[list].map((line) => ({ list, line, en: line.text[def()] ?? '' })))
    .filter((x) => x.en.trim());
  if (!todo.length) return log(['Rien à traduire : aucun texte anglais dans cet onglet.'], true);
  tr = { busy: true, error: '' };
  for (const el of $('c-panel').querySelectorAll('[data-act="translate"]')) {
    el.disabled = true;
    el.classList.add('busy');
  }
  for (const el of $('c-panel').querySelectorAll('[data-tr-error]')) el.textContent = '';
  log([], undefined, `traduction de ${plural(todo.length, 'texte')}`);
  const done = [];
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texts: todo.map((x) => x.en) }),
    });
    const r = await res.json();
    if (!r.results) throw new Error(r.error ?? r.log?.[0] ?? `réponse ${res.status}`);
    if (r.provider === 'none') throw new Error('le traducteur n’a rien rendu');
    let filled = 0;
    todo.forEach((x, i) => {
      // Une ligne retirée pendant l'appel n'attend plus rien.
      if (!lists[x.list].includes(x.line)) return;
      const out = r.results[i] ?? {};
      // Dans l'ordre du moteur, celui des langues du site : une langue nouvelle
      // se range dans le fichier comme dans les textes voisins.
      const got = Object.keys(out).filter((l) => others().includes(l) && out[l]?.trim());
      if (!got.length) return;
      for (const l of got) x.line.text[l] = out[l].trim();
      // L'anglais ENVOYÉ fait référence : retouché pendant l'appel, il reste « à retraduire ».
      x.line.at = x.en;
      refused.delete(lineKey(x.list, x.line));
      filled += got.length;
      done.push(x.line);
    });
    log(
      [
        filled
          ? `${plural(done.length, 'texte')} : ${plural(filled, 'traduction')} posée${filled > 1 ? 's' : ''} par ${
              r.provider === 'haiku' ? 'Claude Haiku (quota DeepL vide)' : 'DeepL'
            } — à relire, puis « Enregistrer ».`
          : 'Le traducteur n’a rien rendu.',
      ],
      true,
    );
  } catch (e) {
    tr.error = e instanceof Error ? e.message : String(e);
    log([`Traduction refusée : ${tr.error}`], false);
  } finally {
    tr.busy = false;
    // Ce qui vient d'être traduit s'ouvre : c'est à relire (`render` reprend
    // les « Traductions » dépliées à l'écran).
    for (const line of done) {
      const d = $('c-panel').querySelector(`[data-k="${line.k}"] details`);
      if (d) d.open = true;
    }
    render();
  }
}

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
  // Un serveur plus vieux que cette page ne sert ni les langues des textes ni le kit.
  if (!s.langs || !s.kit) throw new Error('quick lancé avant ce code : Ctrl-C puis `pnpm quick`');
  sheet = s;
  wanted = null;
  pv.lang ||= s.langs.default;
  if (!keep) {
    cells.clear();
    prio = tags = null;
    kit.hide = {};
    kit.add = {};
    refused = new Map();
    tr = { busy: tr.busy, error: '' };
    fromDisk();
  }
  kitPrune();
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
  // Les lignes envoyées, par liste : le serveur situe un refus par son rang.
  const sentKeys = {};
  const send = (list) => {
    const kept = listOut(list);
    sentKeys[list] = kept.map((l) => l.k);
    return kept.map((l) => lineOut(list, l));
  };
  if (subChanges('pros-cons')) curated.prosCons = { pros: send('pros'), cons: send('cons') };
  if (subChanges('synergies')) curated.synergies = send('synergies');
  const chips = kitOut();

  $('c-save').disabled = $('c-reset').disabled = true;
  $('c-save').classList.add('busy');
  log([], undefined, 'envoi de la fiche au serveur');
  try {
    const r = await post('/api/character', {
      id,
      changes: {
        ranks: [...cells.values()],
        curated,
        was: sheet.curated,
        ...(chips ? { kit: chips } : {}),
      },
    });
    const said = new Map();
    for (const x of r.refused ?? []) {
      const key =
        x.field === 'kit'
          ? `kit${x.card ? `:${x.card}` : ''}`
          : x.list
            ? `${x.list}:${sentKeys[x.list]?.[x.index]}`
            : cellKey(x.field, x.step);
      said.set(key, said.has(key) ? `${said.get(key)} ; ${x.reason}` : x.reason);
    }
    // Le disque fait foi, que tout soit passé ou non : on le relit, puis la
    // saisie s'y repose. Une cellule enregistrée ou refusée n'est plus
    // « modifiée » (la refusée montre la valeur du disque, cerclée), comme dans
    // Rangs ; celle qui n'a pas été traitée reste en attente. Un champ hors
    // rangs refusé garde sa saisie — sauf si c'est le disque qui avait changé
    // (`stale`) : il montre alors le disque. Les listes de textes de même :
    // une liste que le disque porte maintenant telle quelle est relue de lui,
    // une liste refusée garde ses lignes, le refus sur la sienne. Les chips :
    // une carte que le disque porte maintenant comme saisie n'est plus
    // modifiée (`kitPrune`, au chargement), une carte refusée garde sa saisie.
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
    for (const list of LISTS) if (r.stale || sameAsDisk(list)) fromDisk([list]);
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
    // captures) ; `…/skills/picker/<n>` y ouvre le picker d'effets de la n-ième
    // carte (à partir de 1), sans que la page l'écrive dans l'adresse.
    // `lib.js` ne connaît que `#character` : c'est le clic sur l'onglet qui
    // l'ouvre.
    const [, open, tab, pick] =
      /^#character\/([^/]+)(?:\/([a-z-]+))?(?:\/picker\/(\d+))?$/.exec(location.hash) ?? [];
    if (open) {
      wanted = decodeURIComponent(open);
      if (subsOn().some((s) => s.id === tab)) sub = tab;
      if (sub === 'skills') wantedPick = Number(pick ?? 0);
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
        if (!wanted) return pickIfEmpty();
        return load(wanted).then(() => {
          const card = sheet.kit.cards[wantedPick - 1];
          wantedPick = 0;
          if (card && sub === 'skills') pickEffect(card);
        });
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
