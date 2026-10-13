// Onglet « Fiche perso » : un perso, choisi dans le picker de héros partagé, et
// ce que le wiki sait de lui en sous-onglets. « Fiche » : rangs, rôle, paliers
// par transcendance, priorité de skills, tags, et ses vidéos — la liste, ✕, et
// l'ajout par la chaîne officielle ou par URL (`video-add.js`). « Pros / Cons » et
// « Synergies » : des textes à tags inline, saisis en anglais, traduits par
// « Traduire », avec leur aperçu tel que le site les rendra — Pros / Cons en
// une carte par colonne : le rendu du site, puis UN texte anglais (une ligne
// = un pro) et les traductions ligne à ligne. « Skills » : les
// cartes de skills du perso et leurs chips d'effets — ✕ en masque une, « ＋ effet »
// en ajoute une du glossaire. « EE » : l'équipement exclusif du perso, quand il en
// a un — ses deux rangs (les cellules de Rangs), ses passifs en lecture, ses chips
// comme une carte de Skills. Une seule savebar, un seul enregistrement, un seul
// commit — sauf « Gear reco » : les builds du perso, un module (`gear.js`) monté
// dans son hôte, avec SA savebar et SON commit ; la fiche ne fait que compter
// ses builds en attente avant de quitter l'onglet ou de changer de perso.
// Sans perso, le récap de la curation : par champ, ce qui est fait et les persos
// à qui il manque — un clic en ouvre un là où le champ se règle. Le picker ne
// s'ouvre qu'à son bouton.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';
import { effectTile, gameText, itemName, itemTile, noteHtml } from '../gear-view.mjs';
import { heroFilters, openHeroPicker } from '../hero-picker.mjs';
import { heroTile } from '../hero-tile.mjs';
import { videoAdder, videoBadge, videoThumb } from '../video-add.js';
import { gearChanges, gearReset, mountGear } from './gear.js';

// Les sous-onglets, dans l'ordre de la fiche du site.
const SUBS = [
  { id: 'fiche', label: 'Fiche' },
  { id: 'pros-cons', label: 'Pros / Cons' },
  { id: 'synergies', label: 'Synergies' },
  { id: 'skills', label: 'Skills' },
  { id: 'ee', label: 'EE' },
  { id: 'gear', label: 'Gear reco' },
];
/** Pourquoi un sous-onglet est éteint — son `title` : un perso sans EE. */
const subOff = (s) => (s.id === 'ee' && sheet && !sheet.ee ? 'pas d’EE' : '');
const subsOn = () => SUBS.filter((s) => !subOff(s));

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
// Les deux rangs de l'EE : des cellules aussi, celles de « EE base » et de
// « EE +10 » dans Rangs — le champ de l'état (`sheet.ee`) qui porte chacune.
const EE_FIELDS = { eeRank: 'rank', eeRank10: 'rank10' };
const EE_RANKS = [
  ['eeRank', 'Au déblocage'],
  ['eeRank10', 'À +10'],
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
// Le récap de la curation (`/api/character/coverage`), montré sans perso : le
// dernier lu, la dernière lecture partie, les champs dont « … et n autres » est
// déplié, et combien de manquants un champ montre replié.
let cover = null;
let coverSeq = 0;
const coverOpen = new Set();
const COVER_SHOWN = 24;
let shut = 0; // les retours au récap : une fiche lue avant le dernier n'est plus posée
// Cellules de rang modifiées, pas encore envoyées : clé → changement.
const cells = new Map();
// Priorité de skills et tags humains saisis ; `null` : ceux du disque.
let prio = null;
let tags = null;
// Les vidéos du perso, dans l'ordre de la page (`null` : celles du disque).
let vids = null;
// Paliers montrés sans valeur : ajoutés par « ＋ palier », ou vidés à la main.
const added = new Set();
// Refus du dernier enregistrement : clé de cellule, de champ ou de ligne → la raison.
let refused = new Map();
// Les lignes de Pros / Cons et de Synergies. Une ligne : sa clé (`k`), son texte
// par langue, l'anglais de sa dernière traduction (`at`), ce que le disque en
// portait (`base`, `null` pour une ligne ajoutée — lu pour un groupe ; un pro
// se compare au disque par son RANG). Un groupe de synergie est une ligne qui
// porte en plus ses héros.
const lists = { pros: [], cons: [], synergies: [] };
// Les traductions d'une colonne que plus aucune ligne anglaise ne reprend,
// mises de côté par `colSettle` (`at`, `text`) : elles reviennent si leur
// anglais est retapé, et sont retranchées à l'enregistrement.
const spare = { pros: [], cons: [] };
// Les groupes du disque retirés : ils comptent dans la savebar (un pro retiré
// compte par son rang).
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
// Les chips de l'EE, sa seule carte : les deux listes telles qu'elles
// partiraient ; `null` : ce que le disque porte.
const ee = { hide: null, add: null };
const fxFilters = heroFilters(); // les filtres du picker d'effets, à lui
let wantedPick = 0; // la carte dont le hash demande le picker d'effets (à partir de 1)
let geared = null; // le perso dont Gear reco porte les builds : monté à sa première venue
let wantedGear = {}; // ce que le hash demande à Gear reco : `build` (à partir de 1), `picker`
let drawnBase = state.imgBase; // la base des images du dernier dessin (cf. `init`)

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const src = (path) => `${esc(state.imgBase)}/images/${path}.webp`;
const rankSrc = (v) => src(`ui/rank/IG_Event_Rank_${v}`);

// ------------------------------------------------------ le modèle
const cellKey = (field, step) => `${field}${step ? `.${step}` : ''}`;
const baseOf = (field, step) =>
  (field in EE_FIELDS
    ? sheet.ee?.[EE_FIELDS[field]]
    : step
      ? sheet.ranks[field][step]
      : sheet.ranks[field]) ?? '';
const valueOf = (field, step) => cells.get(cellKey(field, step))?.to ?? baseOf(field, step);
const listOf = (field) =>
  field in EE_FIELDS ? sheet.eeTiers : field.startsWith('role') ? sheet.roles : sheet.tiers;
/** Les cellules modifiées de l'EE, et celles de la Fiche : chacune compte dans son sous-onglet. */
const eeCells = () => Object.keys(EE_FIELDS).filter((k) => cells.has(k)).length;
const ficheCells = () => cells.size - eeCells();
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
const vidsNow = () => vids ?? sheet.videos;
/** Les vidéos ajoutées et retirées : ce que la carte Vidéos a en attente. */
const vidChanges = () =>
  vidsNow().filter((v) => !sheet.videos.some((d) => d.id === v.id)).length +
  sheet.videos.filter((d) => !vidsNow().some((v) => v.id === d.id)).length;
/** La liste de la page : celle du disque si elle y revient. */
function setVids(list) {
  vids = list;
  if (!vidChanges()) vids = null;
  refused.delete('videos');
}

// Les textes à tags inline. L'anglais se saisit, les autres langues se
// génèrent (« Traduire ») et se relisent ; le site replie une langue absente
// sur l'anglais. Pros / Cons : une colonne est UN texte par langue, une ligne
// par rang, et le rang est l'identité d'une ligne — la ligne i de chaque
// langue traduit le pro i, ce que le disque porte au rang i est sa base. Les
// traductions SUIVENT leur ligne quand l'anglais bouge (`colPlan`).
// Synergies : une ligne = un groupe, qui garde sa clé et sa base.
const def = () => sheet.langs.default;
const others = () => sheet.langs.shown.filter((l) => l !== def());
const byRank = (list) => list !== 'synergies';
/** La clé d'un refus sur une ligne : son rang (pros / cons), ou sa clé (synergies). */
const lineKey = (list, line) => `${list}:${byRank(list) ? lists[list].indexOf(line) : line.k}`;
/** La clé de l'aperçu d'une ligne : la même. */
const pvKey = (list, line, i) => (byRank(list) ? `${list}:${i}` : line.k);
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
/** Ce que le disque porte d'une liste. */
const diskList = (list) =>
  (list === 'synergies' ? sheet.curated.synergies : sheet.curated.prosCons?.[list]) ?? [];
/** Ce que le disque porte au rang `i` d'une colonne, tel qu'il partirait ; `null` au-delà. */
const diskAt = (list, i) => {
  const item = diskList(list)[i];
  return item === undefined ? null : JSON.stringify(textOut(item));
};
/** Un groupe de synergie diffère-t-il de ce que le disque en portait ? */
const lineMoved = (list, line) =>
  line.base === null ? !blank(list, line) : JSON.stringify(lineOut(list, line)) !== line.base;
/**
 * Le rang `i` d'une colonne diffère-t-il de ce que le disque y porte ? Comparé
 * à ce qui s'écrira (`colShown` : l'anglais du rang, les traductions de sa ligne).
 */
const rankMoved = (list, i, shown = colShown(list)) => {
  const now = JSON.stringify(textOut(shown[i] ?? {}));
  return now !== (diskAt(list, i) ?? '{}');
};
/**
 * Lignes ajoutées, modifiées, retirées. Pros / Cons : par rang — un rang que
 * le disque porte et que la page n'a plus compte aussi.
 */
function listChanges(list) {
  if (!byRank(list)) return gone[list] + lists[list].filter((l) => lineMoved(list, l)).length;
  const shown = colShown(list);
  const ranks = Math.max(shown.length, diskList(list).length);
  return Array.from({ length: ranks }, (_, i) => i).filter((i) => rankMoved(list, i, shown)).length;
}
/** Une liste de groupes telle qu'elle partirait : ses lignes non vides. */
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
/** Les listes relues du disque : la saisie en attente y est abandonnée. */
function fromDisk(which = LISTS) {
  for (const list of which) {
    lists[list] = diskList(list).map((item) => newLine(list, item));
    gone[list] = 0;
    if (byRank(list)) spare[list] = [];
  }
  const alive = new Set(LISTS.flatMap((list) => lists[list].map((l, i) => pvKey(list, l, i))));
  for (const k of [...pv.segs.keys()]) if (!alive.has(k)) pv.segs.delete(k);
  // Les « Traductions » d'une colonne (sa carte) restent dépliées.
  const folds = new Set([...alive, ...TEXT_TABS['pros-cons']]);
  for (const k of [...trOpen]) if (!folds.has(k)) trOpen.delete(k);
  pv.sent = '';
}
/** Le disque porte-t-il déjà ce que la liste enverrait ? */
const sameAsDisk = (list) =>
  JSON.stringify(byRank(list) ? colOut(list) : listOut(list).map((l) => lineOut(list, l))) ===
  JSON.stringify(diskList(list).map((item) => lineOut(list, newLine(list, item))));

const en = (line) => (line.text[def()] ?? '').trim();
/** Des traductions qui datent d'un autre anglais que celui saisi. */
const stale = (line) =>
  Boolean(en(line)) && en(line) !== line.at.trim() && others().some((l) => line.text[l]?.trim());
const tally = (line) =>
  `${others().filter((l) => line.text[l]?.trim()).length} / ${others().length}`;

// Les colonnes de Pros / Cons : une langue = une textarea, une ligne par rang.
/** Les lignes anglaises d'une colonne, sans les rangs vides de la fin : une par pro. */
function enLines(list) {
  const out = lists[list].map((l) => (l.text[def()] ?? '').trim());
  while (out.length && !out.at(-1)) out.pop();
  return out;
}
/** Les rangs que l'anglais porte : le nombre de pros. */
const enCount = (list) => enLines(list).length;
/** Un texte porte-t-il une traduction ? */
const hasTr = (text) => Object.entries(text).some(([l, v]) => l !== def() && v.trim());
/** Les traductions d'un rang sous l'anglais d'une autre ligne : ses langues, dans leur ordre. */
function underEn(text, en) {
  const out = Object.fromEntries(Object.entries(text).map(([l, v]) => [l, l === def() ? en : v]));
  return def() in out ? out : { [def()]: en, ...out };
}
/**
 * À qui vont les traductions d'une colonne dont l'anglais a bougé. Le rang est
 * l'identité d'une ligne, mais ses traductions traduisent UN anglais (`at`,
 * celui du disque ou du dernier « Traduire ») : une ligne anglaise identique à
 * cet anglais les garde, où qu'elle soit maintenant ; les autres sont
 * nouvelles. `from` le dit par ligne anglaise — le rang, dans `pool` (les rangs
 * de la colonne puis les traductions mises de côté), qui porte ses
 * traductions, `null` pour une ligne nouvelle : c'est ce qui part au serveur,
 * qui réaligne. À son rang d'abord (un rang jamais traduit dont les
 * traductions sont tapées à la main y compte), puis au premier rang libre.
 * `fresh` : les lignes nouvelles ; `orphans` : les rangs dont plus aucune
 * ligne ne reprend les traductions, retranchées à l'enregistrement ; `stale` :
 * une ligne nouvelle a pris la place d'une ligne traduite.
 */
function colPlan(list) {
  const rows = lists[list];
  const pool = [...rows, ...spare[list]];
  const ens = enLines(list);
  const from = ens.map((en, i) => {
    const at = rows[i].at.trim();
    return at === en || (!at && hasTr(rows[i].text)) ? i : null;
  });
  const used = new Set(from.filter((n) => n !== null));
  ens.forEach((en, i) => {
    if (from[i] !== null) return;
    const n = pool.findIndex((l, k) => !used.has(k) && l.at.trim() === en);
    if (n < 0) return;
    from[i] = n;
    used.add(n);
  });
  const lost = (k) => !used.has(k) && Boolean(pool[k].at.trim()) && hasTr(pool[k].text);
  return {
    ens,
    pool,
    from,
    used,
    fresh: from.filter((n) => n === null).length,
    orphans: pool.filter((_, k) => lost(k)).length,
    stale: from.some((n, i) => n === null && lost(i)),
  };
}
/** Les rangs d'une colonne laissés sans anglais dont les traductions n'ont jamais traduit de ligne : tapés en trop. */
const colExtra = (list, { ens, used }) =>
  lists[list].filter((l, k) => k >= ens.length && !used.has(k) && !l.at.trim());
/**
 * Les textes d'une colonne tels que ses textarea les montrent : par ligne
 * anglaise, son anglais et les traductions de SA ligne (`colPlan`) ; puis les
 * rangs tapés en trop dans une traduction.
 */
function colShown(list) {
  const plan = colPlan(list);
  const { ens, pool, from } = plan;
  return [
    ...ens.map((en, i) =>
      from[i] === i
        ? pool[i].text
        : from[i] === null
          ? { [def()]: en }
          : underEn(pool[from[i]].text, en),
    ),
    ...colExtra(list, plan).map((l) => l.text),
  ];
}
/** Une colonne telle qu'elle s'écrira : ses lignes anglaises, chacune avec ses traductions. */
const colOut = (list) =>
  colShown(list)
    .slice(0, enCount(list))
    .map((text) => textOut(text));
/** Les textes d'une langue par rang, sans les vides de la fin : le contenu de sa textarea. */
function colLines(list, lang) {
  if (lang === def()) return enLines(list);
  const out = colShown(list).map((text) => text[lang] ?? '');
  while (out.length && !out.at(-1).trim()) out.pop();
  return out;
}
/**
 * Pose dans le modèle ce que les textarea montrent déjà : chaque ligne
 * anglaise à son rang avec ses traductions, les rangs tapés en trop derrière,
 * et les traductions orphelines de côté (`spare`). Avant toute écriture dans
 * une traduction — à la main ou par « Traduire » —, qui se fait par rang.
 */
function colSettle(list) {
  const plan = colPlan(list);
  const { ens, pool, from, used } = plan;
  const rows = ens.map((en, i) => {
    const n = from[i];
    if (n === i) return pool[i];
    const line = newLine(list);
    line.text = n === null ? { [def()]: en } : underEn(pool[n].text, en);
    line.at = n === null ? '' : pool[n].at;
    return line;
  });
  const extra = colExtra(list, plan);
  spare[list] = pool
    .filter((l, k) => !used.has(k) && l.at.trim() && hasTr(l.text))
    .map((l) => ({ at: l.at, text: underEn(l.text, '') }));
  lists[list] = [...rows, ...extra];
}
/**
 * Pose une langue d'une colonne, ligne à ligne : la ligne i va au rang i, les
 * rangs au-delà perdent cette langue, et les rangs vides de la fin s'en vont
 * — sauf celui qui garde l'anglais d'une ligne (`at`) : elle peut revenir.
 * L'anglais s'écrit sans ses lignes vides (une ligne = un pro), et ne touche
 * pas aux traductions : `colPlan` dit à quelle ligne elles vont. Une
 * traduction garde ses lignes vides, qui disent « pas traduit » à ce rang ;
 * elle s'écrit sur la colonne posée (`colSettle`), et une ligne jamais
 * traduite qui en reçoit une la tient désormais de son anglais.
 */
function setCol(list, lang, raw) {
  let value = raw.split('\n').map((s) => s.trim());
  if (lang === def()) value = value.filter(Boolean);
  else colSettle(list);
  while (value.length && !value.at(-1)) value.pop();
  const rows = lists[list];
  while (rows.length < value.length) rows.push(newLine(list));
  rows.forEach((l, i) => {
    l.text[lang] = value[i] ?? '';
  });
  while (rows.length && blank(list, rows.at(-1)) && !rows.at(-1).at.trim()) rows.pop();
  if (lang !== def())
    for (const l of rows) if (!l.at.trim() && en(l) && hasTr(l.text)) l.at = en(l);
}
/** Une traduction : ses rangs écrits sur ceux de l'anglais — « 4 / 5 ». */
const colTally = (list, lang) =>
  `${colLines(list, lang).filter((s, i) => i < enCount(list) && s.trim()).length} / ${enCount(list)}`;
/** Une traduction qui a PLUS de lignes que l'anglais : rien ne part tant qu'elle en a. */
function colOver(list, lang) {
  const n = colLines(list, lang).length;
  const m = enCount(list);
  return n > m ? `${plural(n, 'ligne')}, l’anglais en a ${m}` : '';
}
/** « à retraduire » : une ligne nouvelle a pris la place d'une ligne traduite. */
const colStale = (list) => colPlan(list).stale;
/** Les langues traduites à chaque rang de l'anglais — « 3 / 5 ». */
const colDone = (list) =>
  `${
    enCount(list)
      ? others().filter((lang) => colOut(list).every((text) => text[lang]?.trim())).length
      : 0
  } / ${others().length}`;
/**
 * Ce que l'enregistrement fera des traductions d'une colonne dont l'anglais a
 * bougé, dit sous sa textarea : ses lignes nouvelles, qui n'en ont pas, et les
 * traductions que plus aucune ligne ne reprend, retranchées.
 */
function colShift(list) {
  const { fresh, orphans } = colPlan(list);
  const s = (n) => (n > 1 ? 's' : '');
  return [
    fresh ? `${fresh} ligne${s(fresh)} nouvelle${s(fresh)} sans traduction` : '',
    orphans
      ? `${orphans} traduction${s(orphans)} orpheline${s(orphans)} retranchée${s(orphans)}`
      : '',
  ]
    .filter(Boolean)
    .join(', ');
}
/** Un rang de la colonne refusé par le serveur. */
const colRefused = (list) => lists[list].some((l) => refused.has(lineKey(list, l)));

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

// Les chips de l'EE : celles que ses passifs posent (`sheet.ee.chips`), dont le
// curé masque certaines, et les effets qu'il ajoute — une seule carte.
const eeBase = (kind) => sheet.ee?.[KIT[kind]] ?? [];
const eeNow = (kind) => ee[kind] ?? eeBase(kind);
/** Les chips de l'EE masquées, rétablies, ajoutées ou retirées depuis le disque. */
const eeChipChanges = () =>
  apart(eeNow('hide'), eeBase('hide')) + apart(eeNow('add'), eeBase('add'));
/** Pose une liste de l'EE : revenue à celle du disque, elle n'est plus modifiée. */
function eeSet(kind, list) {
  ee[kind] = apart(list, eeBase(kind)) ? list : null;
  refused.delete('ee');
}
/** La saisie que le disque porte maintenant, ou celle d'un perso sans EE : oubliée. */
function eePrune() {
  for (const kind of Object.keys(KIT))
    if (!sheet.ee || (ee[kind] && !apart(ee[kind], eeBase(kind)))) ee[kind] = null;
}
/**
 * Les chips de l'EE telles qu'elles partiraient : ses deux listes ENTIÈRES, et
 * l'entrée curée que la page avait chargée — le serveur refuse si le disque en
 * porte une autre.
 */
function eeOut() {
  if (!eeChipChanges()) return null;
  const { rank, rank10, chipHide, chipAdd } = sheet.ee;
  return {
    chipHide: eeNow('hide'),
    chipAdd: eeNow('add'),
    was: { rank, rank10, chipHide, chipAdd },
  };
}

/** Le sous-onglet d'un refus, d'après sa clé. */
const subOf = (key) =>
  key === 'ee' || key in EE_FIELDS
    ? 'ee'
    : key === 'kit' || key.startsWith('kit:')
      ? 'skills'
      : (Object.keys(TEXT_TABS).find(
          (id) =>
            key === TEXT_FIELDS[id] || TEXT_TABS[id].some((list) => key.startsWith(`${list}:`)),
        ) ?? 'fiche');
const refusedIn = (id) => [...refused.keys()].filter((k) => subOf(k) === id);
/** Ce qu'un sous-onglet a en attente. */
const subChanges = (id) =>
  id === 'fiche'
    ? ficheCells() + Number(prioMoved()) + Number(tagsMoved()) + vidChanges()
    : id === 'skills'
      ? kitChanges()
      : id === 'ee'
        ? eeCells() + eeChipChanges()
        : id === 'gear'
          ? gearChanges()
          : (TEXT_TABS[id] ?? []).reduce((n, list) => n + listChanges(list), 0);

/**
 * Ce que compte la savebar : une cellule de rang (les deux de l'EE comprises), la
 * priorité, les tags, chaque vidéo ajoutée ou retirée, chaque ligne de pros, de
 * cons ou de synergie ajoutée, modifiée ou retirée, et chaque chip de skill ou
 * d'EE masquée, rétablie, ajoutée ou retirée. Pas les builds de Gear reco : ils ont leur barre, et
 * « Enregistrer » d'ici ne les envoie pas.
 */
const changes = () =>
  sheet ? SUBS.reduce((n, s) => n + (s.id === 'gear' ? 0 : subChanges(s.id)), 0) : 0;
/** Tout ce qui attend, builds compris : ce que quitter l'onglet ou changer de perso abandonne. */
const allChanges = () => changes() + gearChanges();

/**
 * Les erreurs que la page voit seule : tant qu'il en reste, rien n'est envoyé.
 * Une priorité hors de 1 à 3 ; une traduction de Pros / Cons qui a plus de
 * lignes que l'anglais. Chacune dit sa carte et son sous-onglet.
 */
const issues = () =>
  sheet
    ? [
        ...PRIOS.filter(([k]) => prioIssue(k)).map(([k, label]) => ({
          sub: 'fiche',
          card: 'kit',
          said: `Priorité de skills · ${label} : ${prioIssue(k)}`,
        })),
        ...TEXT_TABS['pros-cons'].flatMap((list) =>
          others()
            .filter((lang) => colOver(list, lang))
            .map((lang) => ({
              sub: 'pros-cons',
              card: list,
              said: `${cap(list)} · ${lang} : ${colOver(list, lang)}`,
            })),
        ),
      ]
    : [];
const issuesIn = (card) => issues().filter((x) => x.card === card);

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
    [...new Set([...cells.keys(), ...refusedIn('fiche')])].filter(
      (k) => subOf(k) === 'fiche' && !KIT_KEYS.includes(k) && k !== 'videos',
    ),
  kit: () => KIT_KEYS,
  videos: () => ['videos'],
  pros: () => lists.pros.map((l) => lineKey('pros', l)),
  cons: () => lists.cons.map((l) => lineKey('cons', l)),
  'ee-ranks': () => Object.keys(EE_FIELDS),
  'ee-chips': () => ['ee'],
};
const cardMoved = (card) =>
  card === 'ranks'
    ? ficheCells() > 0
    : card === 'kit'
      ? prioMoved() || tagsMoved()
      : card === 'videos'
        ? vidChanges() > 0
        : card === 'ee-ranks'
          ? eeCells() > 0
          : card === 'ee-chips'
            ? eeChipChanges() > 0
            : card in lists
              ? listChanges(card) > 0
              : false;
const cardBad = (card) => cardKeys[card]().some((k) => refused.has(k)) || issuesIn(card).length > 0;

// ------------------------------------------------------ l'en-tête
/** Le perso choisi : sa vignette, nom, élément, classe, sous-classe, rareté, chaîne. */
function who() {
  const c = sheet?.char;
  const trait = (file, slug) =>
    `<span class="c-trait"><img src="${src(`ui/${file}${cap(esc(slug))}`)}" alt="" aria-hidden="true" />${esc(slug)}</span>`;
  drawnBase = state.imgBase;
  $('c-who').innerHTML = c
    ? `<button class="btn ghost sm" type="button" data-act="recap" title="Fermer la fiche : le récap de la curation">← Récap</button>${heroTile(state, c, { px: 56 })}
      <div class="c-id"><strong>${esc(c.name)}</strong>
        <span class="c-traits">${trait('elem/IG_Turn_Element_', c.element)}${trait('class/IG_Turn_Class_', c.class)}${
          c.subClass ? trait('class/CM_Sub_Class_', c.subClass) : ''
        }<span class="c-stars" title="${c.rarity}★">${`<img src="${src('ui/star/CM_icon_star_y')}" alt="" aria-hidden="true" />`.repeat(c.rarity)}</span>${
          c.chain ? `<span class="badge off">chaîne ${esc(c.chain)}</span>` : ''
        }</span>
        <span class="lbl">Ce que le jeu en extrait, et son intégration : <a class="c-link" href="#extractor/character/${esc(c.id)}" data-go="extractor/character/${esc(c.id)}">extraction</a></span>
      </div>`
    : '<span class="lbl">Aucun perso choisi.</span>';
  $('c-pick-label').textContent = c ? 'Changer de perso' : 'Choisir un perso';
}

function bar() {
  const n = changes();
  const no = refused.size;
  const bad = issues().map((x) => x.said);
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
 * portés sont éteints, « EE » aussi pour un perso qui n'en a pas. Un point dit
 * ce que l'onglet porte : accent, des
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
          refusedIn(s.id).length || issues().some((x) => x.sub === s.id)
            ? ['ko', 'refusé ou en erreur']
            : subChanges(s.id)
              ? ['edit', 'modifié, pas encore enregistré']
              : null;
        const off = subOff(s);
        return `<button class="tab" type="button" role="tab" id="c-tab-${s.id}" data-sub="${s.id}" aria-selected="${on}" aria-controls="${s.id === 'gear' ? 'c-gear' : 'c-panel'}" tabindex="${on ? 0 : -1}"${
          off ? ` disabled title="${off}"` : ''
        }>${s.label}${dot ? `<span class="dot ${dot[0]}" role="img" aria-label="${dot[1]}" title="${dot[1]}"></span>` : ''}</button>`;
      }).join('');
  // Sans perso, le panneau porte le récap : il n'est celui d'aucun sous-onglet.
  if (!sheet) $('c-panel').removeAttribute('aria-labelledby');
  else if (sub !== 'gear') $('c-panel').setAttribute('aria-labelledby', `c-tab-${sub}`);
  if (focused) $(`c-tab-${sub}`)?.focus();
}

// ------------------------------------------------------ le récap
/**
 * Une ligne du récap : le champ, son compte, puis les persos à qui il manque,
 * en vignettes — les `COVER_SHOWN` premiers, le reste derrière « … et n autres ».
 * Le compte se lit sur ceux que le champ concerne (`done` + les manquants) :
 * l'EE ne compte que les persos qui en ont un, le Rang PvP que ceux que le PvP
 * admet. `hint`, quand le serveur en donne un, se lit au survol du libellé.
 */
function coverRow(f, rows) {
  const all = coverOpen.has(f.key) || f.missing.length <= COVER_SHOWN;
  const hero = (m) =>
    `<button class="c-cov-hero" type="button" data-cov-id="${esc(m.id)}" data-cov-sub="${esc(f.sub)}" title="${esc(m.name)}" aria-label="${esc(`${m.name} — ${f.label}`)}">${heroTile(state, rows.get(m.id) ?? m, { px: 32 })}</button>`;
  return `<div class="c-cov-row" data-cov="${esc(f.key)}">
      <strong${f.hint ? ` title="${esc(f.hint)}"` : ''}>${esc(f.label)}</strong>
      <span class="badge ${f.missing.length ? 'off' : 'ok'}">${f.done} / ${f.done + f.missing.length}</span>
      <div class="c-cov-miss">${(all ? f.missing : f.missing.slice(0, COVER_SHOWN)).map(hero).join('')}${
        all
          ? ''
          : `<button class="btn ghost sm" type="button" data-cov-more="${esc(f.key)}">… et ${plural(f.missing.length - COVER_SHOWN, 'autre')}</button>`
      }${f.missing.length ? '' : '<span class="lbl">complet</span>'}</div>
    </div>`;
}

/** Le récap de la curation, tel que lu la dernière fois ; rien tant qu'il n'est pas arrivé. */
function recapHtml() {
  if (!cover) return '';
  const rows = new Map((roster ?? []).map((c) => [c.id, c]));
  return `<div class="card c-recap" role="group" aria-label="Récap de la curation">
      <div class="card-head"><strong>Curation — ${plural(cover.total, 'perso')}</strong><span class="lbl">Par champ : ce qui est fait, puis les persos à qui il manque — un clic en ouvre un là où le champ se règle.</span></div>
      <div class="c-cov">${cover.fields.map((f) => coverRow(f, rows)).join('')}</div>
    </div>`;
}

/**
 * Sans perso, le récap, relu du serveur à chaque venue : un enregistrement a
 * pu bouger les comptes. Le dernier lu reste à l'écran pendant la lecture ; une
 * réponse arrivée après une lecture plus récente n'est pas gardée, et rien
 * n'est dessiné par-dessus une fiche ouverte entre-temps.
 */
async function showRecap() {
  if (!roster || sheet || wanted || $('tab-character').hidden) return;
  const mine = ++coverSeq;
  render();
  try {
    const c = await getJson('/api/character/coverage');
    if (mine !== coverSeq) return;
    if (!Array.isArray(c.fields)) throw new Error('réponse sans champs');
    cover = c;
    if (!sheet && !wanted) render();
  } catch (e) {
    log([`Récap illisible : ${e}`], false);
  }
}

/**
 * Un manquant du récap : sa fiche sur le sous-onglet où le champ se règle, ou
 * la section qui le porte (`names`, `extractor/character`), ouverte sur lui.
 */
function openMissing(id, to) {
  if (!SUBS.some((s) => s.id === to)) return sections.go(`${to}/${encodeURIComponent(id)}`);
  sub = to;
  load(id).catch((e) => log([`Fiche illisible : ${e}`], false));
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
  const rk = list !== sheet.roles;
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

/** Une vidéo curée : sa miniature (YouTube) ou le badge de sa plateforme, son titre, son auteur, sa date, ✕. */
const videoRow = (v, i) =>
  `<li${sheet.videos.some((d) => d.id === v.id) ? '' : ' class="dirty"'}>${
    v.platform === 'youtube'
      ? `<img src="${esc(videoThumb(v.id))}" alt="" aria-hidden="true" width="120" height="68" loading="lazy" />`
      : ''
  }<span class="c-vt">${esc(v.title || v.id)}</span>${videoBadge(v.platform)}<span class="lbl">${esc(
    [v.author, v.uploadDate?.slice(0, 10)].filter(Boolean).join(' · '),
  )}</span><button class="btn icon" type="button" data-act="del-video" data-i="${i}" title="Retirer" aria-label="Retirer ${esc(v.title || v.id)}">✕</button></li>`;

// « ＋ vidéo » : le formulaire partagé avec Guides ; la vidéo résolue se pose
// en fin de liste, et part avec « Enregistrer ».
const vidAdd = videoAdder({
  root: $('c-panel'),
  id: 'c-va',
  has: (id) => Boolean(sheet) && vidsNow().some((v) => v.id === id),
  scope: () => sheet?.char.id,
  onAdd: (v) => {
    // `author` et `uploadDate` : YouTube seul les rend.
    setVids([
      ...vidsNow(),
      {
        platform: v.platform,
        id: v.id,
        title: v.title,
        ...(v.author ? { author: v.author } : {}),
        ...(v.uploadDate ? { uploadDate: v.uploadDate } : {}),
      },
    ]);
    render();
    $('c-panel').querySelector('#c-va [data-va="url"]')?.focus();
  },
});

/** L'en-tête d'une carte : son titre, « modifié », « refusé ». */
const cardHead = (card, title, more = '') =>
  `<div class="card-head"><strong>${title}</strong><span class="badge edit" data-mod="${card}">${
    cardMoved(card) ? 'modifié' : ''
  }</span><span class="badge ko" data-ko="${card}">${cardBad(card) ? 'refusé' : ''}</span>${more}</div>`;

function ficheHtml() {
  const p = prioNow();
  const now = tagsNow();
  const derived = sheet.char.tags ?? [];
  const videos = vidsNow();
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
        ${err('skillPriority', refused.get('skillPriority') ?? issuesIn('kit')[0]?.said ?? '')}
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
    <div class="card c-card c-wide${cardBad('videos') ? ' ko' : ''}" data-card="videos">
      ${cardHead('videos', 'Vidéos', `<span class="badge off">${videos.length}</span>`)}
      <div class="c-body">${
        videos.length
          ? `<ul class="c-videos">${videos.map(videoRow).join('')}</ul>`
          : '<p class="lbl">aucune vidéo</p>'
      }${err('videos')}
        <h3>Ajouter une vidéo</h3>
        ${vidAdd.html()}
      </div>
    </div>
  </div>`;
}

// ------------------------------------- « Pros / Cons » et « Synergies »
const viewEnv = () => ({ imgBase: state.imgBase, esc });
/**
 * L'aperçu d'une ligne : ses segments, tels que le site les rend ; `raw`, le
 * texte brut tant qu'ils ne sont pas arrivés (Pros / Cons ; une synergie n'en
 * montre rien).
 */
const pvBody = (key, raw) => {
  const segs = pv.segs.get(key);
  return segs ? noteHtml(viewEnv(), segs) : esc(raw ?? '');
};
/** Le texte d'une ligne dans la langue de l'aperçu : le sien, sinon l'anglais — le repli du site. */
const pvText = (line) =>
  line.text[pv.lang]?.trim() ? line.text[pv.lang] : (line.text[def()] ?? '');
const where = (list, i) => `${cap(LIST_WORDS[list])} ${i + 1}`;

/**
 * Le texte d'une ligne de Synergies : l'anglais (une textarea de deux lignes,
 * qui grandit), son aperçu, son refus, puis les traductions, repliées. Le saut
 * de ligne après `<textarea>` est mangé par le navigateur : sans lui, c'est
 * celui d'un texte qui commence par une ligne vide qui le serait.
 */
function textHtml(list, line, i) {
  const key = lineKey(list, line);
  const what = list === 'synergies' ? `Raison du groupe ${i + 1}` : where(list, i);
  const area = (lang, attrs) =>
    `<textarea rows="2" data-lang="${esc(lang)}" ${attrs}${
      lang === def() && refused.has(key) ? ' class="refused"' : ''
    }>\n${esc(line.text[lang] ?? '')}</textarea>`;
  return `${area(def(), `aria-label="${what}, en anglais"`)}
    <p class="c-pv pv-note${pv.busy ? ' busy' : ''}" data-pv="${line.k}">${pvBody(line.k)}</p>
    ${err(key)}
    <details data-fold="${line.k}"${trOpen.has(line.k) ? ' open' : ''}>
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

/**
 * « Traduire », le même dans les deux sous-onglets : il vaut pour tout
 * l'onglet — dans Pros / Cons, pour les lignes périmées ou pas encore traduites.
 */
const translateHtml = () =>
  `<button class="btn ghost${tr.busy ? ' busy' : ''}" type="button" data-act="translate"${
    tr.busy ? ' disabled' : ''
  } title="Traduit ${
    sub === 'pros-cons'
      ? 'les lignes périmées ou pas encore traduites'
      : 'les textes anglais de l’onglet'
  } vers ${others().join(', ')} et ÉCRASE leurs traductions en place : l’anglais fait foi (DeepL, puis Claude Haiku). À relire ; rien ne s’écrit avant « Enregistrer ».">Traduire</button><span class="badge error" data-tr-error>${esc(tr.error)}</span><p class="c-ko" data-pv-error>${esc(pv.error)}</p>`;

// Pros / Cons : une colonne = UNE carte.
const SIGNS = { pros: '+', cons: '−' };
/**
 * Le rendu du site d'une colonne (`ProsConsSection`) : une puce `+` verte ou
 * `−` rouge par rang, et l'aperçu de la ligne dans la langue de la savebar —
 * le texte brut tant qu'il n'est pas arrivé. Un rang modifié se borde
 * d'accent, un rang refusé de rouge.
 */
function viewHtml(list) {
  const all = colShown(list);
  const shown = all.slice(0, enCount(list));
  if (!shown.length) return `<p class="lbl">Aucun ${LIST_WORDS[list]}.</p>`;
  return `<ul class="c-view ${list}" aria-label="${cap(LIST_WORDS[list])}s, tels que le site les rend">${shown
    .map((text, i) => {
      const key = `${list}:${i}`;
      return `<li class="c-vl${rankMoved(list, i, all) ? ' dirty' : ''}${
        refused.has(key) ? ' ko' : ''
      }" data-rank="${i}"><span class="c-sign" aria-hidden="true">${SIGNS[list]}</span><span class="c-pv pv-note${
        pv.busy ? ' busy' : ''
      }" data-pv="${key}">${pvBody(key, pvText({ text }))}</span></li>`;
    })
    .join('')}</ul>`;
}

/** Les refus d'une colonne, sous sa textarea : ceux de la page, puis ceux du serveur par rang. */
const colSaid = (list) =>
  [
    ...issuesIn(list).map((x) => x.said),
    ...lists[list].flatMap((line, i) =>
      refused.has(lineKey(list, line))
        ? [`${where(list, i)} : ${refused.get(lineKey(list, line))}`]
        : [],
    ),
  ].join(' — ');

/**
 * Une colonne de Pros / Cons : le rendu du site, puis l'anglais en UNE
 * textarea — une ligne = un pro —, ce que l'enregistrement fera de ses
 * traductions si l'anglais a bougé (`colShift`), ses refus, puis les
 * traductions repliées, une textarea par langue, elle aussi une ligne par
 * rang : la ligne i traduit le pro i, l'anglais ligne à ligne en placeholder ;
 * sous chacune, ses rangs écrits « 4 / 5 » et, en ambre, les lignes en trop.
 * Le saut de ligne après `<textarea>` : cf. `textHtml`.
 */
function colHtml(list, title) {
  const word = LIST_WORDS[list];
  const en = colLines(list, def()).join('\n');
  const area = (lang, attrs) =>
    `<textarea rows="${Math.max(3, enCount(list) + 1)}" data-col="${list}" data-lang="${esc(lang)}" ${attrs}>\n${esc(
      colLines(list, lang).join('\n'),
    )}</textarea>`;
  return `<div class="card c-card${cardBad(list) ? ' ko' : ''}" data-card="${list}">
    ${cardHead(
      list,
      title,
      `<span class="badge off" data-n>${enCount(list)}</span><span class="lbl">une ligne par ${word} ; dans chaque langue, la ligne i traduit le ${word} i</span>`,
    )}
    <div class="c-body">
      <div data-view="${list}">${viewHtml(list)}</div>
      ${area(
        def(),
        `aria-label="${title}, en anglais — une ligne par ${word}" placeholder="Un ${word} par ligne"${
          colRefused(list) ? ' class="refused"' : ''
        }`,
      )}
      <p class="c-shift" data-shift>${esc(colShift(list))}</p>
      ${err(list, colSaid(list))}
      <details data-fold="${list}"${trOpen.has(list) ? ' open' : ''}>
        <summary><span class="btn ghost sm">Traductions (${others().length})</span><span class="badge warn" data-stale>${
          colStale(list) ? 'à retraduire' : ''
        }</span><span class="lbl" data-tally>${colDone(list)}</span></summary>
        <div class="c-trs">${others()
          .map(
            (lang) =>
              `<div class="field"><label for="c-${list}-${esc(lang)}">${esc(lang)}</label>${area(
                lang,
                `id="c-${list}-${esc(lang)}" placeholder="${esc(en)}"`,
              )}<span class="c-tc"><span class="lbl" data-tc="${esc(lang)}">${colTally(list, lang)}</span><span class="badge warn" data-over="${esc(lang)}">${esc(colOver(list, lang))}</span></span></div>`,
          )
          .join('')}</div>
      </details>
    </div>
  </div>`;
}

const prosConsHtml = () =>
  `<div class="c-cols">${colHtml('pros', 'Pros')}${colHtml('cons', 'Cons')}
    <div class="c-wide c-foot">${translateHtml()}${err('prosCons')}</div>
  </div>`;

const heroName = (id) => roster?.find((c) => c.id === id)?.name ?? id;
/** Une tuile de héros : sa vignette, son nom dessous, ✕. Le roster pas encore lu : son id, le fond neutre. */
const heroHtml = (id) =>
  `<span class="c-hero">${heroTile(state, roster?.find((c) => c.id === id) ?? { id, name: id }, { name: true })}<button class="btn icon" type="button" data-act="del-hero" data-hero="${esc(id)}" title="Retirer" aria-label="Retirer ${esc(heroName(id))}">✕</button></span>`;

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
/** La tuile d'un effet, celle du site (`effectTile` de `gear-view.mjs`) : 22 px sur une chip, 28 dans le picker. */
const fxTile = (icon, isDebuff, px = 22) => effectTile(viewEnv(), icon, isDebuff, px);

/** Un effet ajouté à une carte, tel que le catalogue le connaît ; sinon sa ref. */
function addedChip(ref, catalog = sheet.kit.catalog) {
  const o = catalog[ref];
  return { ref, name: o?.name ?? ref, icon: o?.icon, isDebuff: o?.isDebuff ?? false };
}

/** Où une carte lit ses deux listes : une carte de skill, ou celle de l'EE. */
const kitAt = (card) => ({
  now: (kind) => kitNow(kind, card),
  base: (kind) => kitBase(kind, card),
});
const eeAt = { now: eeNow, base: eeBase };

/**
 * Une chip d'une carte (`at` : ses listes). Celle que le kit pose (`auto`) : ✕
 * la masque — barrée et atténuée, « rétablir » la rend. Un effet ajouté (`add`) :
 * son badge, et ✕ le retire. Le bord accent : son état n'est pas celui du disque.
 */
function chipHtml(at, c, kind) {
  const add = kind === 'add';
  const now = at.now(add ? 'add' : 'hide').includes(c.ref);
  const off = !add && now;
  const moved = now !== at.base(add ? 'add' : 'hide').includes(c.ref);
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
  const at = kitAt(card.id);
  return `<div class="card-head">${
    card.iconSrc
      ? `<img class="c-skico" src="${srcAt(card.iconSrc)}" alt="" aria-hidden="true" width="36" height="36" />`
      : ''
  }<strong>${esc(card.name || '(sans nom)')}</strong><span class="lbl c-skid">${esc(card.id)} · ${esc(card.type)}</span><span class="badge edit">${
    cardChanges(card.id) ? 'modifié' : ''
  }</span><span class="badge ko">${refused.has(key) ? 'refusé' : ''}</span></div>
    <div class="c-body">
      ${card.desc ? `<p class="c-desc">${gameText(viewEnv(), skillDesc(card.desc))}</p>` : ''}
      <div class="c-chips">${card.chips.map((c) => chipHtml(at, c, 'auto')).join('')}${kitNow(
        'add',
        card.id,
      )
        .map((ref) => chipHtml(at, addedChip(ref), 'add'))
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
function fxOptions(catalog) {
  const all = Object.values(catalog);
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
 * « ＋ effet » : le picker partagé, sur un catalogue d'effets — ceux que la
 * carte n'a pas déjà en ajout (`have`). `onPick` reçoit celui qu'on y choisit.
 */
function pickFx({ title, catalog, have, opener, onPick }) {
  const options = fxOptions(catalog).filter((o) => !have.includes(o.id));
  openHeroPicker({
    title,
    roster: options,
    imgBase: state.imgBase,
    rows: true,
    tile: (o) => `${fxTile(o.icon, o.isDebuff, 28)}<span>${esc(o.name)}</span>`,
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
    opener,
    onPick,
  });
}

/** « ＋ effet » d'une carte de skill : l'effet choisi s'ajoute à la carte. */
const pickEffect = (card) =>
  pickFx({
    title: `Ajouter un effet — ${card.name || card.id}`,
    catalog: sheet.kit.catalog,
    have: kitNow('add', card.id),
    opener: () => skillEl(card.id)?.querySelector('[data-act="add-chip"]'),
    onPick: (id) => {
      kitSet('add', card.id, [...kitNow('add', card.id), id]);
      skillDraw(card);
    },
  });

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

// ------------------------------------------------------ le sous-onglet « EE »
/** La carte des chips de l'EE, à l'écran. */
const eeChipsEl = () => $('c-panel').querySelector('[data-card="ee-chips"]');

/**
 * L'intérieur de la carte « Chips » : la rangée d'une carte de Skills — les chips
 * que les passifs posent, les effets ajoutés, « ＋ effet » — puis l'aide-mémoire :
 * la description de chaque chip visible et de chaque ajout.
 */
function eeChipsInner() {
  const { chips, catalog } = sheet.ee;
  const added = eeNow('add').map((ref) => ({
    ...addedChip(ref, catalog),
    desc: catalog[ref]?.desc,
  }));
  const memo = [...chips.filter((c) => !eeNow('hide').includes(c.ref)), ...added].filter(
    (c) => c.desc,
  );
  return `${cardHead('ee-chips', 'Chips')}
    <div class="c-body">
      <div class="c-chips">${
        chips.length || added.length ? '' : '<span class="lbl">aucune chip</span>'
      }${chips.map((c) => chipHtml(eeAt, c, 'auto')).join('')}${added
        .map((c) => chipHtml(eeAt, c, 'add'))
        .join(
          '',
        )}<button class="btn ghost sm" type="button" data-act="add-chip" aria-haspopup="dialog">＋ effet</button></div>
      ${err('ee')}
      ${
        memo.length
          ? `<ul class="c-memo">${memo
              .map(
                (c) =>
                  `<li class="lbl">${fxTile(c.icon, c.isDebuff)}<span><strong>${esc(c.name)}</strong> — ${gameText(viewEnv(), skillDesc(c.desc))}</span></li>`,
              )
              .join('')}</ul>`
          : ''
      }
    </div>`;
}

/**
 * L'EE du perso : sa tuile d'item et son nom — et son second porteur, quand le
 * site en montre un —, ses deux rangs (les cellules « EE base » et « EE +10 » de
 * Rangs), ses passifs en lecture, ses chips.
 */
function eeHtml() {
  const e = sheet.ee;
  if (!e) return '<div class="empty">Ce perso n’a pas d’EE.</div>';
  return `<div class="c-cols">
    <div class="card pad c-wide c-ee">
      ${itemTile(viewEnv(), e, 56)}
      <div class="c-id">${itemName(viewEnv(), e.name, e.grade, 'c-een')}${
        e.companion ? `<span class="lbl">porté aussi par ${esc(e.companion.name)}</span>` : ''
      }</div>
    </div>
    <div class="card c-card${cardBad('ee-ranks') ? ' ko' : ''}" data-card="ee-ranks">
      ${cardHead('ee-ranks', 'Rangs')}
      <div class="c-body">
        <div class="form">${EE_RANKS.map(
          ([f, label]) =>
            `<div class="field"><label for="c-f-${f}">${label}</label>${cell(f, undefined, `id="c-f-${f}"`)}${err(f)}</div>`,
        ).join('')}</div>
        <span class="lbl">Les colonnes « EE base » et « EE +10 » de la grille Rangs.</span>
      </div>
    </div>
    <div class="card c-card" data-card="ee-passives">
      <div class="card-head"><strong>Passifs</strong><span class="lbl">en lecture</span></div>
      <div class="c-body">${
        e.passives.length
          ? e.passives
              .map(
                (p) =>
                  `<div class="c-passive"><div><span class="badge off">${
                    p.level <= 1 ? 'Déblocage' : `+${esc(p.level)}`
                  }</span><strong>${esc(p.name)}</strong></div>${p.texts
                    .map((t) => `<p class="c-desc">${gameText(viewEnv(), skillDesc(t))}</p>`)
                    .join('')}</div>`,
              )
              .join('')
          : '<p class="lbl">aucun passif</p>'
      }</div>
    </div>
    <div class="card c-card c-wide${cardBad('ee-chips') ? ' ko' : ''}" data-card="ee-chips">${eeChipsInner()}</div>
  </div>`;
}

/**
 * La carte des chips de l'EE redessinée seule, après un geste ; le focus va à
 * `focus` — `[kind, ref]` : le bouton de cette chip ; sinon « ＋ effet ».
 */
function eeDraw(focus) {
  const at = eeChipsEl();
  if (!at) return;
  at.innerHTML = eeChipsInner();
  marks();
  const chip =
    focus &&
    [...at.querySelectorAll('[data-ref]')].find(
      (el) => el.dataset.kind === focus[0] && el.dataset.ref === focus[1],
    );
  (chip ?? at).querySelector(chip ? 'button' : '[data-act="add-chip"]')?.focus();
}

/** Un geste sur la carte des chips de l'EE : « ＋ effet », ou le bouton d'une chip. */
function eeAct(el) {
  const { act } = el.dataset;
  if (act === 'add-chip')
    return pickFx({
      title: `Ajouter un effet — ${sheet.ee.name}`,
      catalog: sheet.ee.catalog,
      have: eeNow('add'),
      opener: () => eeChipsEl()?.querySelector('[data-act="add-chip"]'),
      onPick: (id) => {
        eeSet('add', [...eeNow('add'), id]);
        eeDraw();
      },
    });
  const chip = el.closest('[data-ref]');
  if (!chip) return;
  const { ref } = chip.dataset;
  const kind = act === 'del-chip' ? 'add' : 'hide';
  const now = eeNow(kind);
  eeSet(kind, act === 'hide-chip' ? [...now, ref] : now.filter((r) => r !== ref));
  eeDraw(kind === 'hide' && ['auto', ref]);
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

/**
 * Les lignes à l'aperçu du sous-onglet montré : leur clé, leur texte dans la
 * langue de la savebar — et, pour Pros / Cons, le brut à montrer en attendant.
 * Un rang de colonne sans anglais (une traduction en trop) n'y est pas.
 */
const pvItems = () =>
  (TEXT_TABS[sub] ?? []).flatMap((list) =>
    byRank(list)
      ? colShown(list)
          .slice(0, enCount(list))
          .map((text, i) => ({
            key: `${list}:${i}`,
            text: pvText({ text }),
            raw: pvText({ text }),
          }))
      : lists[list].map((line) => ({ key: line.k, text: pvText(line), raw: undefined })),
  );

/** L'aperçu des lignes en place : son atténuation, et `redraw` son contenu. */
function pvPaint(redraw) {
  const panel = $('c-panel');
  const items = redraw ? new Map(pvItems().map((x) => [x.key, x])) : null;
  for (const at of panel.querySelectorAll('[data-pv]')) {
    at.classList.toggle('busy', pv.busy);
    const item = items?.get(at.dataset.pv);
    if (item) at.innerHTML = pvBody(item.key, item.raw);
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
  if (!sheet || !TEXT_TABS[sub]) return;
  const shown = pvItems();
  if (!shown.length) return;
  const keys = shown.map((x) => x.key);
  const body = JSON.stringify({ texts: shown.map((x) => x.text), lang: pv.lang });
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

/** Les « Traductions » dépliées à l'écran (une colonne, un groupe) : un redessin les rouvre. */
function keepOpen() {
  for (const d of $('c-panel').querySelectorAll('details[data-fold]')) {
    if (d.open) trOpen.add(d.dataset.fold);
    else trOpen.delete(d.dataset.fold);
  }
}

/**
 * Gear reco, monté dans son hôte pour le perso de la fiche — une fois par
 * perso : y revenir retrouve ses builds en attente. Le module prévient à chaque
 * changement : le point du sous-onglet suit. Un état illisible (le journal le
 * dit) se retente à la prochaine venue.
 */
function showGear() {
  const { id } = sheet.char;
  if (geared === id) return;
  geared = id;
  const at = wantedGear;
  wantedGear = {};
  mountGear($('c-gear'), sheet.char, { ...at, onChange: subTabs })
    .then((ok) => {
      if (!ok && geared === id) geared = null;
    })
    .catch((e) => {
      if (geared === id) geared = null;
      log([`Gear reco illisible : ${e}`], false);
    });
}

/**
 * Le sous-onglet montré, redessiné en entier : un autre perso, « Annuler »,
 * l'état relu — et, sans perso, le récap de la curation.
 */
function render() {
  const panel = $('c-panel');
  // Gear reco vit dans son hôte, à côté : il garde son DOM d'une venue à l'autre.
  const gearOn = Boolean(sheet) && sub === 'gear';
  keepOpen();
  panel.hidden = gearOn;
  $('c-gear').hidden = !gearOn;
  panel.innerHTML = !sheet
    ? recapHtml()
    : gearOn
      ? ''
      : sub === 'fiche'
        ? ficheHtml()
        : sub === 'pros-cons'
          ? prosConsHtml()
          : sub === 'synergies'
            ? synHtml()
            : sub === 'ee'
              ? eeHtml()
              : skillsHtml();
  growAll(panel);
  subTabs();
  bar();
  pvLangs();
  pvAsk();
  if (gearOn) showGear();
}

/**
 * Ce qui suit la saisie dans une colonne de Pros / Cons, sans la redessiner :
 * son compte, ce que l'enregistrement fera de ses traductions, « à
 * retraduire », les langues complètes, sous chaque traduction ses rangs écrits
 * et ses lignes en trop, le bord de l'anglais refusé, et dans le rendu les
 * rangs modifiés ou refusés.
 */
function colMarks(card, list) {
  card
    .querySelector(`textarea[data-col][data-lang="${def()}"]`)
    .classList.toggle('refused', colRefused(list));
  card.querySelector('[data-n]').textContent = String(enCount(list));
  card.querySelector('[data-shift]').textContent = colShift(list);
  card.querySelector('[data-stale]').textContent = colStale(list) ? 'à retraduire' : '';
  card.querySelector('[data-tally]').textContent = colDone(list);
  for (const lang of others()) {
    card.querySelector(`[data-tc="${lang}"]`).textContent = colTally(list, lang);
    card.querySelector(`[data-over="${lang}"]`).textContent = colOver(list, lang);
  }
  const shown = colShown(list);
  for (const li of card.querySelectorAll('[data-rank]')) {
    const i = Number(li.dataset.rank);
    li.classList.toggle('dirty', rankMoved(list, i, shown));
    li.classList.toggle('ko', refused.has(`${list}:${i}`));
  }
}

/** Ce qui suit la saisie dans une ligne de Synergies, sans la redessiner. */
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
    if (id in SIGNS) colMarks(card, id);
  }
  for (const at of panel.querySelectorAll('[data-err]')) {
    const key = at.dataset.err;
    at.textContent =
      key === 'tiers'
        ? tiersSaid()
        : key in SIGNS
          ? colSaid(key)
          : (refused.get(key) ?? (key === 'skillPriority' ? (issuesIn('kit')[0]?.said ?? '') : ''));
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

// Frappe dans une priorité ou dans un texte : l'état suit, rien n'est redessiné
// — sauf le rendu d'une colonne de Pros / Cons, qui suit l'anglais ligne à ligne.
$('c-panel').oninput = (e) => {
  if (!sheet) return;
  const col = e.target.closest('textarea[data-col]');
  if (col) {
    const list = col.dataset.col;
    const { lang } = col.dataset;
    setCol(list, lang, col.value);
    // Un refus de la colonne vise un rang qui vient peut-être de bouger : levés.
    for (const k of [...refused.keys()]) if (k.startsWith(`${list}:`)) refused.delete(k);
    refused.delete(TEXT_FIELDS[sub]);
    grow(col);
    const card = col.closest('[data-card]');
    card.querySelector('[data-view]').innerHTML = viewHtml(list);
    // Les traductions suivent leur ligne : chaque textarea montre celles de la
    // ligne anglaise de son rang (`colShown`) — et, pas encore écrite, l'anglais
    // qu'elle remplacera, ligne à ligne.
    if (lang === def()) {
      const en = colLines(list, def()).join('\n');
      for (const other of card.querySelectorAll('.c-trs textarea')) {
        other.placeholder = en;
        other.value = colLines(list, other.dataset.lang).join('\n');
        grow(other);
      }
    }
    marks();
    return pvAsk(PV_DELAY);
  }
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
  // Le récap : « … et n autres » déplie les manquants d'un champ, une vignette ouvre son perso.
  const more = e.target.closest('[data-cov-more]')?.dataset.covMore;
  if (more) {
    coverOpen.add(more);
    render();
    return $('c-panel').querySelectorAll(`[data-cov="${more}"] .c-cov-hero`)[COVER_SHOWN]?.focus();
  }
  const miss = e.target.closest('[data-cov-id]');
  if (miss) return openMissing(miss.dataset.covId, miss.dataset.covSub);
  const el = e.target.closest('[data-act]');
  if (!el || !sheet) return;
  const { act, step } = el.dataset;
  const skill = el.closest('[data-kit]');
  if (skill) return kitAct(skill, el);
  if (el.closest('[data-card="ee-chips"]')) return eeAct(el);
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
  if (act === 'del-video') {
    setVids(vidsNow().filter((_, i) => i !== Number(el.dataset.i)));
    render();
    $('c-panel').querySelector('#c-va [data-va="url"]')?.focus();
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
  // Pros / Cons : par ligne, celles qui sont périmées ou qu'une langue n'a pas ;
  // une ligne traduite partout et à jour ne repart pas — sur la colonne posée
  // (`colSettle`) : une ligne déplacée a ses traductions, une ligne nouvelle
  // n'en a pas. Synergies : toutes.
  for (const list of of) if (byRank(list)) colSettle(list);
  const needs = (list, line) =>
    !byRank(list) || stale(line) || others().some((l) => !line.text[l]?.trim());
  const typed = of.flatMap((list) =>
    lists[list].map((line) => ({ list, line, en: (line.text[def()] ?? '').trim() })),
  );
  const todo = typed.filter((x) => x.en && needs(x.list, x.line));
  if (!todo.length)
    return log(
      [
        typed.some((x) => x.en)
          ? 'Rien à traduire : chaque ligne est traduite partout, et à jour.'
          : 'Rien à traduire : aucun texte anglais dans cet onglet.',
      ],
      true,
    );
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
    // Ce qui vient d'être traduit s'ouvre — la colonne, le groupe : c'est à
    // relire (`render` reprend les « Traductions » dépliées à l'écran).
    for (const line of done) {
      const list = LISTS.find((l) => lists[l].includes(line));
      const d = $('c-panel').querySelector(`details[data-fold="${byRank(list) ? list : line.k}"]`);
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
  const at = shut;
  const s = await getJson(`/api/character/state?id=${encodeURIComponent(id)}`);
  // « ← Récap » pendant la lecture : la fiche fermée ne revient pas.
  if (at !== shut) return;
  // Un serveur plus vieux que cette page ne sert ni les langues des textes, ni le kit, ni l'EE.
  if (!s.langs || !s.kit || s.ee === undefined)
    throw new Error('quick lancé avant ce code : Ctrl-C puis `pnpm quick`');
  // Un autre perso : les builds du précédent ne sont plus ceux de la fiche,
  // ni ce qui était saisi pour lui dans « Ajouter une vidéo ».
  if (sheet?.char.id !== s.char.id) {
    gearReset();
    geared = null;
    vidAdd.reset();
  }
  sheet = s;
  wanted = null;
  pv.lang ||= s.langs.default;
  if (!keep) {
    cells.clear();
    prio = tags = vids = null;
    kit.hide = {};
    kit.add = {};
    ee.hide = ee.add = null;
    refused = new Map();
    tr = { busy: tr.busy, error: '' };
    fromDisk();
  }
  kitPrune();
  eePrune();
  // Un perso sans EE n'a pas ce sous-onglet : la fiche s'ouvre sur le premier.
  if (sub === 'ee' && !sheet.ee) sub = 'fiche';
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
  if (!canDrop()) return false;
  load(id).catch((e) => log([`Fiche illisible : ${e}`], false));
}

/** Lâcher le perso ouvert — pour un autre, pour le récap : sur confirmation s'il porte des changements. */
function canDrop() {
  const n = allChanges();
  return (
    !n ||
    confirm(
      `Abandonner ${plural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${sheet.char.name} ?`,
    )
  );
}

/**
 * « ← Récap » : la fiche se ferme, le récap revient, relu — le garde de
 * `choose` d'abord. Pas pendant un enregistrement : sa réponse se pose sur la
 * fiche.
 */
function toRecap() {
  if (!sheet || $('c-save').classList.contains('busy') || !canDrop()) return;
  shut++;
  gearReset();
  geared = null;
  sheet = null;
  who();
  writeHash();
  showRecap();
  $('c-pick').focus();
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
// « extraction » de l'en-tête : la fiche du perso dans la section Extraction
// (`sections.go` par chemin ; des changements en attente peuvent retenir ici).
$('c-who').addEventListener('click', (e) => {
  if (e.target.closest('[data-act="recap"]')) return toRecap();
  const to = e.target.closest('[data-go]')?.dataset.go;
  if (!to) return;
  e.preventDefault();
  sections.go(to);
});

$('c-reset').onclick = () =>
  load(sheet.char.id).catch((e) => log([`Fiche illisible : ${e}`], false));

$('c-save').onclick = async () => {
  if (!sheet || !changes()) return;
  const bad = issues().map((x) => x.said);
  if (bad.length) return log(['Rien n’est envoyé tant qu’il reste des erreurs :', ...bad], false);

  const id = sheet.char.id;
  const curated = {};
  // Chaque champ part ENTIER, et seulement s'il a bougé.
  if (prioMoved())
    curated.skillPriority = Object.fromEntries(
      PRIOS.filter(([k]) => prioNow()[k] !== '').map(([k]) => [k, Number(prioNow()[k])]),
    );
  if (tagsMoved()) curated.tags = tagsNow();
  if (vidChanges()) curated.videos = vidsNow();
  // Les lignes envoyées, par liste : le serveur situe un refus par son rang
  // dans l'envoi — ici le rang de la colonne, ou la clé du groupe.
  const sentKeys = {};
  const send = (list) => {
    const kept = listOut(list);
    sentKeys[list] = kept.map((l) => l.k);
    return kept.map((l) => lineOut(list, l));
  };
  // Une colonne part PAR RANG, avec les traductions mises de côté ; `from` dit
  // au serveur, par ligne anglaise, quel rang de l'envoi porte ses traductions
  // (`colPlan`) — il réaligne, et retranche celles que plus rien ne reprend.
  // Une colonne que le réalignement laisserait telle quelle part sans `from`.
  const from = {};
  const sendCol = (list) => {
    const plan = colPlan(list);
    const texts = plan.pool.map((l) => textOut(l.text));
    sentKeys[list] = texts.map((_, i) => i);
    const asIs = texts.filter((text) => Object.keys(text).length);
    if (JSON.stringify(asIs) === JSON.stringify(colOut(list))) return asIs;
    from[list] = plan.from;
    return texts;
  };
  if (subChanges('pros-cons')) {
    curated.prosCons = { pros: sendCol('pros'), cons: sendCol('cons') };
    if (Object.keys(from).length) curated.prosCons.from = from;
  }
  if (subChanges('synergies')) curated.synergies = send('synergies');
  const chips = kitOut();
  const eeChips = eeOut();

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
        ...(eeChips ? { ee: eeChips } : {}),
      },
    });
    const said = new Map();
    for (const x of r.refused ?? []) {
      const key =
        x.field === 'ee'
          ? 'ee'
          : x.field === 'kit'
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
    // rangs refusé garde sa saisie (les vidéos comprises) — sauf si c'est le
    // disque qui avait changé (`stale`) : il montre alors le disque. Les listes
    // de textes de même :
    // une liste que le disque porte maintenant telle quelle est relue de lui,
    // une liste refusée garde ses lignes, le refus sur la sienne. Les chips :
    // une carte que le disque porte maintenant comme saisie n'est plus
    // modifiée (`kitPrune`, au chargement), une carte refusée garde sa saisie ;
    // celles de l'EE de même (`eePrune`) — sauf `stale` : elles montrent le disque.
    const pending = [...cells.values()];
    const typed = { prio, tags, vids };
    await load(id, true);
    cells.clear();
    for (const c of pending)
      if (!said.has(cellKey(c.field, c.step))) setCell(c.field, c.step, c.to);
    prio = tags = vids = null;
    if (!r.stale) {
      if (typed.prio && PRIOS.some(([k]) => typed.prio[k] !== prioBase()[k])) prio = typed.prio;
      if (typed.tags && typed.tags.join('|') !== tagsBase().join('|')) tags = typed.tags;
      // Les vidéos : une liste que le disque porte maintenant n'est plus en attente.
      if (typed.vids) setVids(typed.vids);
    }
    for (const list of LISTS) if (r.stale || sameAsDisk(list)) fromDisk([list]);
    if (r.stale) ee.hide = ee.add = null;
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
  const n = allChanges();
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
    // captures) — `ee` vaut `fiche` pour un perso sans EE ; `…/skills/picker/<n>`
    // y ouvre le picker d'effets de la n-ième carte (à partir de 1),
    // `…/gear/build/<n>` montre le n-ième build du perso
    // et `…/gear/picker/<slot>` y ouvre un picker de pièces (les deux se
    // combinent), sans que la page l'écrive dans l'adresse. `lib.js` ne connaît
    // que `#character` : c'est le clic sur l'onglet qui l'ouvre.
    //
    // Gear reco a été une section : ses liens `#gear/<id>…` valent
    // `#character/<id>/gear…`, et `#gear` le sous-onglet, sans perso.
    const hash = location.hash.replace(/^#gear(?:\/([^/]+))?(?=\/|$)/, (_, id) =>
      id ? `#character/${id}/gear` : '#character',
    );
    const [, open, tab, build, pick] =
      /^#character\/([^/]+)(?:\/([a-z-]+))?(?:\/build\/(\d+))?(?:\/picker\/([a-z0-9]+))?$/.exec(
        hash,
      ) ?? [];
    if (hash !== location.hash) sub = 'gear';
    if (open) {
      wanted = decodeURIComponent(open);
      if (subsOn().some((s) => s.id === tab)) sub = tab;
      if (sub === 'skills') wantedPick = Number(pick ?? 0) || 0;
      if (sub === 'gear') wantedGear = { build: Number(build ?? 0), picker: pick ?? '' };
    }
    if (open || hash !== location.hash)
      document.querySelector('#tabs [data-tab="character"]')?.click();
    who();
    bar();
    // Les images sont sous `imgBase`, connu avec `/api/state` : reposées si
    // l'état en annonce une autre.
    stateLoaded.then(() => {
      if (state.imgBase === drawnBase) return;
      who();
      render();
    });
    return getJson('/api/character/roster')
      .then((r) => {
        roster = r.roster;
        $('c-pick').disabled = false;
        if (!wanted) return showRecap();
        return load(wanted).then(() => {
          const card = sheet.kit.cards[wantedPick - 1];
          wantedPick = 0;
          if (card && sub === 'skills') pickEffect(card);
        });
      })
      .catch((e) => {
        wanted = null;
        log([`Fiche perso illisible : ${e}`], false);
        // Le perso demandé ne s'ouvre pas : la page reste sur le récap.
        showRecap();
      });
  },
  // Chaque venue à l'écran : sans perso, le récap relu ; avec, l'adresse — et,
  // s'il n'y a rien en attente, la fiche relue (un rang a pu changer dans Rangs).
  open: () => {
    if (!sheet) {
      showRecap();
      return;
    }
    writeHash();
    if (!changes()) load(sheet.char.id).catch((e) => log([`Fiche illisible : ${e}`], false));
  },
  // Des changements en attente, builds de Gear reco compris, ne survivent pas à
  // un rechargement de la page.
  dirty: allChanges,
  canLeave: leave,
});
