// Onglet « Monstres » : un monstre, choisi dans le picker partagé — ceux que les
// guides désignent d'abord —, et le câblage des chips d'effets sur les cartes de
// skills de son kit (`data/curated/monster-skills.json`) : ✕ masque une chip sur
// sa carte, « rétablir » la rend, « ＋ effet » en ajoute une du glossaire, et le
// menu d'une chip la pose sur une autre carte du kit. Une savebar, un
// enregistrement, un commit. Les stats, l'intégration et les versions d'un
// monstre restent à l'extractor de l'admin.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';
import { gameText } from '../gear-view.mjs';
import { heroFilters, openHeroPicker } from '../hero-picker.mjs';

// Les types, dans l'ordre des pastilles du picker : les boss d'abord.
const TYPES = [
  ['boss', 'boss'],
  ['area_boss', 'area boss'],
  ['season_boss', 'season boss'],
  ['named', 'named'],
  ['monster', 'monster'],
];
// Les deux sections par carte du curé, sous leurs noms.
const KIT = { hide: 'chipHide', add: 'chipAdd' };

let roster = null; // `/api/monsters/roster`, lu à la première venue : le picker
let asked = false; // le roster est demandé, ou là
let sheet = null; // l'état du monstre ouvert (`/api/monsters/state`)
let wanted = null; // le monstre que le hash demande, tant qu'il n'est pas demandé
let loading = null; // le monstre en cours de chargement
// Les chips déplacées, pas encore envoyées : buff → sa carte, `null` = par défaut.
let own = {};
// Par carte, les buffs masqués (`hide`) et les effets ajoutés (`add`) tels
// qu'ils partiraient. Une carte absente : ce que le disque porte.
const kit = { hide: {}, add: {} };
// Refus du dernier enregistrement : `kit:<carte>`, ou `kit` pour l'envoi entier.
let refused = new Map();
const pkFilters = heroFilters(); // les filtres du picker de monstres, à lui
const fxFilters = heroFilters(); // ceux du picker d'effets
const nameWords = new Map(); // id → les mots de son nom, pour la recherche
let drawnBase = state.imgBase; // la base des images du dernier dessin (cf. `init`)

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const typeLabel = (type) => TYPES.find(([t]) => t === type)?.[1] ?? type;
/** Une image que le serveur a résolue : relative (`/images/…`), elle passe sous `imgBase`. */
const srcAt = (path) => esc(path.startsWith('/') ? `${state.imgBase}${path}` : path);

// ------------------------------------------------------ le modèle
const chipOf = (buff) => sheet.kit.chips.find((c) => c.buff === buff);
const cardOf = (id) => sheet.kit.cards.find((c) => c.id === id);
const cardLabel = (card) => `${card.name || '(sans nom)'} · ${card.type}`;

// La place d'une chip : la carte que le curé lui pose (`chipOwner`), sinon
// celles que les règles lui donnent.
const ownerBase = (buff) => sheet.disk.chipOwner[buff] ?? null;
const ownerNow = (buff) => (buff in own ? own[buff] : ownerBase(buff));
const placesOf = (chip) => (ownerNow(chip.buff) ? [ownerNow(chip.buff)] : chip.defaultCards);

const kitBase = (kind, card) => sheet.disk[KIT[kind]][card] ?? [];
const kitNow = (kind, card) => kit[kind][card] ?? kitBase(kind, card);
/** Ce qui sépare deux listes de refs : celles de l'une que l'autre n'a pas. */
const apart = (a, b) =>
  a.filter((x) => !b.includes(x)).length + b.filter((x) => !a.includes(x)).length;
/** Les chips d'une carte masquées, rétablies, ajoutées ou retirées depuis le disque. */
const cardChanges = (card) =>
  apart(kitNow('hide', card), kitBase('hide', card)) +
  apart(kitNow('add', card), kitBase('add', card));
/** Une carte porte-t-elle un changement : une de ses listes, ou une chip qui en part ou y arrive. */
const cardMoved = (card) =>
  cardChanges(card.id) > 0 ||
  Object.keys(own).some((buff) => {
    const chip = chipOf(buff);
    const before = ownerBase(buff) ? [ownerBase(buff)] : (chip?.defaultCards ?? []);
    return Boolean(chip) && [...before, ...placesOf(chip)].includes(card.id);
  });
/** Ce que compte la savebar : chaque chip déplacée, masquée, rétablie, ajoutée ou retirée. */
const changes = () =>
  sheet ? Object.keys(own).length + sheet.kit.cards.reduce((n, c) => n + cardChanges(c.id), 0) : 0;

/** Pose une liste d'une carte : revenue à celle du disque, elle n'est plus modifiée. */
function kitSet(kind, card, list) {
  if (apart(list, kitBase(kind, card))) kit[kind][card] = list;
  else delete kit[kind][card];
  refused.delete(`kit:${card}`);
  refused.delete('kit');
}

/**
 * Pose une chip sur une carte (`null` : par défaut). Revenue à ce que le
 * disque porte, elle n'est plus déplacée. Sur sa carte cible elle est montrée :
 * elle n'y reste pas masquée (la règle de l'éditeur de l'admin).
 */
function setOwner(buff, target) {
  if (target === ownerBase(buff)) delete own[buff];
  else own[buff] = target;
  if (target && kitNow('hide', target).includes(buff))
    kitSet(
      'hide',
      target,
      kitNow('hide', target).filter((r) => r !== buff),
    );
  refused.delete('kit');
}

/** La saisie que le disque porte maintenant, ou dont la carte ou la chip n'est plus : oubliée. */
function prune() {
  for (const buff of Object.keys(own))
    if (!chipOf(buff) || own[buff] === ownerBase(buff) || (own[buff] && !cardOf(own[buff])))
      delete own[buff];
  for (const kind of Object.keys(KIT))
    for (const card of Object.keys(kit[kind]))
      if (!cardOf(card) || !apart(kit[kind][card], kitBase(kind, card))) delete kit[kind][card];
}

/** Toute la saisie en attente, abandonnée. */
function forget() {
  own = {};
  kit.hide = {};
  kit.add = {};
}

/**
 * Les chips d'une carte : celles qui y sont PLACÉES (visibles ou masquées), puis
 * celles que la carte masque alors qu'elles sont montrées ailleurs — un
 * masquage resté du fichier, qu'on peut lever.
 */
function cardChips(card) {
  const hidden = kitNow('hide', card.id);
  const here = sheet.kit.chips.filter((c) => placesOf(c).includes(card.id));
  const stray = sheet.kit.chips.filter((c) => hidden.includes(c.buff) && !here.includes(c));
  return { here, stray };
}

// ------------------------------------------------------ l'en-tête
/** Le monstre choisi : icône, nom, type, id, mode · zone, ses guides. */
function who() {
  const m = sheet?.monster;
  drawnBase = state.imgBase;
  const guides = () =>
    m.guides.length
      ? `<span class="lbl">Guides :</span> ${m.guides
          .map(
            (g) =>
              `<a class="m-link" href="${esc(sheet.guideBase)}/${esc(g.category)}/${esc(g.slug)}" target="_blank" rel="noopener">${esc(g.title)}</a>`,
          )
          .join(', ')}`
      : '<span class="badge off">aucun guide</span>';
  $('m-who').innerHTML = m
    ? `<img class="m-face" src="${srcAt(m.icon)}" alt="" aria-hidden="true" width="56" height="56" />
      <div class="m-id"><strong>${esc(m.name)}</strong>
        <span class="m-traits"><span class="badge off">${esc(typeLabel(m.type))}</span><span class="m-mono">${esc(m.id)}</span>${
          m.place ? `<span>${esc(m.place)}</span>` : ''
        }</span>
        <span class="m-guides">${guides()}</span>
        <span class="lbl">Stats, intégration et versions : extractor (étapes 19-20).</span>
      </div>`
    : '<span class="lbl">Aucun monstre choisi.</span>';
  $('m-pick-label').textContent = m ? 'Changer de monstre' : 'Choisir un monstre';
}

function bar() {
  const n = changes();
  const no = refused.size;
  $('m-bar').hidden = !sheet;
  $('m-count').innerHTML =
    `${n ? `<span class="badge edit">${plural(n, 'changement')}</span>` : ''}${
      no ? `<span class="badge ko">${no} refus</span>` : ''
    }<span class="m-msg">${n || no ? '' : 'aucune modification'}</span>`;
  $('m-save').disabled = $('m-reset').disabled = !n;
}

// ------------------------------------------------------ les cartes du kit
// Les caractères qu'`encodeURIComponent` laisse et qu'un `url('…')` lirait.
const fxUrl = (icon) =>
  `${state.imgBase}/${sheet.sprite}/${encodeURIComponent(icon).replace(/['()]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}.webp`;

/**
 * La tuile d'un effet, celle de la « Fiche perso » et de l'onglet Effets : fond
 * noir, l'icône en MASQUE teinté de sa nature — sauf les « Interruption », qui
 * gardent leurs couleurs. Décorative : le nom est à côté.
 */
function fxTile(icon, isDebuff) {
  if (!icon) return '<span class="m-fx none" aria-hidden="true"></span>';
  const url = esc(fxUrl(icon));
  if (icon.includes('Interruption'))
    return `<span class="m-fx" aria-hidden="true"><img src="${url}" alt="" loading="lazy" /></span>`;
  return `<span class="m-fx ${isDebuff ? 'debuff' : 'buff'}" style="--m-src: url('${url}')" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

/** Le refus d'une clé, sous sa carte ; vide, la ligne ne s'affiche pas. */
const err = (key) => `<p class="m-err" data-err="${esc(key)}">${esc(refused.get(key) ?? '')}</p>`;

/**
 * Le menu d'une chip : la carte du kit où la poser. Sans réglage il invite
 * (« sur la carte… ») ; déplacée, il montre sa carte, et « par défaut » la rend
 * aux règles.
 */
function moveHtml(chip) {
  const at = ownerNow(chip.buff);
  return `<select class="m-move${at !== ownerBase(chip.buff) ? ' dirty' : ''}" data-move="${esc(chip.buff)}" aria-label="Carte de ${esc(chip.name)}" title="Poser cette chip sur une autre carte du kit"><option value=""${
    at ? '' : ' selected'
  }>${at ? 'par défaut' : 'sur la carte…'}</option>${sheet.kit.cards
    .map(
      (c) =>
        `<option value="${esc(c.id)}"${c.id === at ? ' selected' : ''}>${esc(cardLabel(c))}</option>`,
    )
    .join('')}</select>`;
}

/**
 * Une chip du kit sur une carte. Placée ici (`auto`) : ✕ la masque — pointillés,
 * nom barré, « rétablir » —, son menu la déplace, « déplacée » quand le curé la
 * pose. Masquée ici mais montrée ailleurs (`stray`) : « rétablir » seulement. Le
 * bord accent : son état n'est pas celui du disque.
 */
function chipHtml(card, chip, kind) {
  const off = kitNow('hide', card.id).includes(chip.buff);
  const moved = kind === 'auto' && ownerNow(chip.buff) !== null;
  const dirty =
    off !== kitBase('hide', card.id).includes(chip.buff) ||
    (kind === 'auto' && ownerNow(chip.buff) !== ownerBase(chip.buff));
  return `<span class="chip m-chip${off ? ' off' : ''}${dirty ? ' dirty' : ''}" data-kind="${kind}" data-ref="${esc(chip.buff)}" title="${esc(chip.buff)} — porté par ${esc(chip.carrier)}">${fxTile(chip.icon, chip.isDebuff)}<span class="m-chn">${esc(chip.name)}</span>${
    moved ? '<span class="badge edit">déplacée</span>' : ''
  }${kind === 'auto' && !off ? moveHtml(chip) : ''}${
    off
      ? `<button class="btn ghost sm" type="button" data-act="show-chip" aria-label="Rétablir ${esc(chip.name)}">rétablir</button>`
      : `<button class="btn icon" type="button" data-act="hide-chip" title="Masquer sur cette carte" aria-label="Masquer ${esc(chip.name)}">✕</button>`
  }</span>`;
}

/** Un effet ajouté à une carte, tel que le catalogue le connaît ; sinon sa ref. Son ✕ le retire. */
function addedHtml(card, ref) {
  const o = sheet.catalog[ref];
  const name = o?.name ?? ref;
  const dirty = !kitBase('add', card.id).includes(ref);
  return `<span class="chip m-chip${dirty ? ' dirty' : ''}" data-kind="add" data-ref="${esc(ref)}" title="${esc(ref)}">${fxTile(o?.icon, o?.isDebuff ?? false)}<span class="m-chn">${esc(name)}</span><span class="badge edit">ajoutée</span><button class="btn icon" type="button" data-act="del-chip" title="Retirer" aria-label="Retirer ${esc(name)}">✕</button></span>`;
}

/** La description d'un skill, sans les sauts de ligne qui la terminent. */
const skillDesc = (desc) => desc.replace(/(?:\\n|\s)+$/, '');

/** Le badge d'un skill que d'autres monstres portent : ce qu'on y règle vaut pour tous. */
function sharedHtml(card) {
  const sh = sheet.shared[card.id];
  if (!sh) return '';
  return `<span class="badge off" title="${esc(`Masquer ou ajouter une chip ici vaut pour tous : ${sh.names.join(', ')}${sh.count > sh.names.length ? '…' : ''}`)}">partagé par ${sh.count} monstres</span>`;
}

/** L'intérieur d'une carte de skill : son en-tête, sa description, ses chips, « ＋ effet ». */
function cardInner(card) {
  const key = `kit:${card.id}`;
  const { here, stray } = cardChips(card);
  return `<div class="card-head">${
    card.iconSrc
      ? `<img class="m-skico" src="${srcAt(card.iconSrc)}" alt="" aria-hidden="true" width="36" height="36" />`
      : ''
  }<strong>${esc(card.name || '(sans nom)')}</strong><span class="lbl m-skid">${esc(card.id)} · ${esc(card.type)}</span>${sharedHtml(card)}<span class="badge edit">${
    cardMoved(card) ? 'modifié' : ''
  }</span><span class="badge ko">${refused.has(key) ? 'refusé' : ''}</span></div>
    <div class="m-body">
      ${card.desc ? `<p class="m-desc">${gameText({ imgBase: state.imgBase, esc }, skillDesc(card.desc))}</p>` : ''}
      <div class="m-chips">${here.map((c) => chipHtml(card, c, 'auto')).join('')}${stray
        .map((c) => chipHtml(card, c, 'stray'))
        .join('')}${kitNow('add', card.id)
        .map((ref) => addedHtml(card, ref))
        .join(
          '',
        )}<button class="btn ghost sm" type="button" data-act="add-chip" aria-haspopup="dialog">＋ effet</button></div>
      ${err(key)}
    </div>`;
}
const cardClass = (card) => `card m-card${refused.has(`kit:${card.id}`) ? ' ko' : ''}`;

/** La carte d'un skill à l'écran, par son id. */
const cardEl = (id) =>
  [...$('m-panel').querySelectorAll('[data-kit]')].find((el) => el.dataset.kit === id);

/** Les cartes du kit, deux par rangée ; dessous, le refus de l'envoi entier. */
function render() {
  const panel = $('m-panel');
  if (!sheet) panel.innerHTML = '';
  else if (!sheet.kit.cards.length)
    panel.innerHTML = '<div class="empty">Aucune carte de skill.</div>';
  else
    panel.innerHTML = `<div class="m-cols">${sheet.kit.cards
      .map((c) => `<div class="${cardClass(c)}" data-kit="${esc(c.id)}">${cardInner(c)}</div>`)
      .join('')}<div class="m-wide">${err('kit')}</div></div>`;
  bar();
}

/**
 * Des cartes redessinées seules, après un geste sur leurs chips ; le focus va à
 * `focus` — `[carte, kind, ref]` : le premier contrôle de cette chip ; sinon au
 * « ＋ effet » de la première.
 */
function draw(ids, focus) {
  for (const id of new Set(ids)) {
    const card = cardOf(id);
    const at = card && cardEl(id);
    if (!at) continue;
    at.className = cardClass(card);
    at.innerHTML = cardInner(card);
  }
  const kitErr = $('m-panel').querySelector('[data-err="kit"]');
  if (kitErr) kitErr.textContent = refused.get('kit') ?? '';
  bar();
  const at = cardEl(focus?.[0] ?? ids[0]);
  const chip =
    focus &&
    [...(at?.querySelectorAll('[data-ref]') ?? [])].find(
      (el) => el.dataset.kind === focus[1] && el.dataset.ref === focus[2],
    );
  (chip ?? at)?.querySelector(chip ? 'select, button' : '[data-act="add-chip"]')?.focus();
}

// ------------------------------------------------------ « ＋ effet »
/**
 * Le catalogue des effets en options du picker, par nom. Des effets DISTINCTS
 * partagent un nom (variante irremovable, natures opposées) : les homonymes
 * sont suffixés, et l'id départage ce qui reste — la règle de la « Fiche perso ».
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

/** « ＋ effet » d'une carte : le picker partagé sur le catalogue, moins ce qu'elle a déjà en ajout. */
function pickEffect(card) {
  const options = fxOptions(sheet.catalog).filter((o) => !kitNow('add', card.id).includes(o.id));
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
    opener: () => cardEl(card.id)?.querySelector('[data-act="add-chip"]'),
    onPick: (id) => {
      kitSet('add', card.id, [...kitNow('add', card.id), id]);
      draw([card.id]);
    },
  });
}

// ------------------------------------------------------ les gestes
$('m-panel').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  const at = el?.closest('[data-kit]');
  const card = sheet && at && cardOf(at.dataset.kit);
  if (!card) return;
  const { act } = el.dataset;
  if (act === 'add-chip') return pickEffect(card);
  const chip = el.closest('[data-ref]');
  if (!chip) return;
  const { ref, kind } = chip.dataset;
  const list = act === 'del-chip' ? 'add' : 'hide';
  const now = kitNow(list, card.id);
  kitSet(list, card.id, act === 'hide-chip' ? [...now, ref] : now.filter((r) => r !== ref));
  draw([card.id], list === 'hide' && [card.id, kind, ref]);
};

// Le menu d'une chip : elle quitte ses cartes pour sa cible (ou y revient). Les
// cartes quittées et celles d'arrivée sont redessinées, pas les autres.
$('m-panel').onchange = (e) => {
  const menu = e.target.closest('select[data-move]');
  const chip = sheet && menu && chipOf(menu.dataset.move);
  if (!chip) return;
  const before = placesOf(chip);
  setOwner(chip.buff, menu.value || null);
  const after = placesOf(chip);
  draw([...before, ...after], [after[0], 'auto', chip.buff]);
};

// Une icône que le site n'a pas (un monstre hors de ses pages) : son cadre reste, vide.
$('tab-monsters').addEventListener(
  'error',
  (e) => {
    if (e.target.tagName === 'IMG') e.target.style.visibility = 'hidden';
  },
  true,
);

// ------------------------------------------------------ le monstre
/** L'adresse dit le monstre : recharger y revient. */
const writeHash = () =>
  history.replaceState(
    null,
    '',
    sheet ? `#monsters/${encodeURIComponent(sheet.monster.id)}` : '#monsters',
  );

/**
 * Le kit d'un monstre, relu du disque : c'est lui qui fait foi. La saisie en
 * attente est abandonnée — sauf `keep`, où elle se repose sur le disque relu
 * (après un enregistrement).
 */
async function load(id, keep = false) {
  loading = id;
  try {
    const s = await getJson(`/api/monsters/state?id=${encodeURIComponent(id)}`);
    if (!s.kit || !s.disk) throw new Error('quick lancé avant ce code : Ctrl-C puis `pnpm quick`');
    sheet = s;
    if (!keep) {
      forget();
      refused = new Map();
    }
    prune();
    who();
    render();
    // L'adresse n'est celle du monstre que si c'est lui qui est à l'écran.
    if (!$('tab-monsters').hidden) writeHash();
  } finally {
    if (loading === id) loading = null;
  }
}
const reload = (id) => load(id).catch((e) => log([`Monstre illisible : ${e}`], false));

/**
 * Un monstre choisi dans le picker. Rend `false` pour le garder ouvert : des
 * changements en attente, et l'abandon refusé.
 */
function choose(id) {
  if (id === sheet?.monster.id) return;
  const n = changes();
  if (
    n &&
    !confirm(
      `Abandonner ${plural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${sheet.monster.name} ?`,
    )
  )
    return false;
  reload(id);
}

/** Les mots d'un texte : minuscules, sans accents, suites de lettres et de chiffres. */
const wordsOf = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/**
 * La recherche du picker, celle d'Effets : chaque mot de la saisie COMMENCE un
 * mot du nom (« tes » ne trouve pas « Vitesse ») ; ou la saisie commence l'id.
 */
function matches(m, q) {
  if (m.id.startsWith(q)) return true;
  const needle = wordsOf(q);
  const words = nameWords.get(m.id) ?? [];
  return needle.length > 0 && needle.every((n) => words.some((w) => w.startsWith(n)));
}

/** Une ligne du picker : icône, nom, mode · zone dessous, type, « N guides ». */
const pickTile = (m) =>
  `<span class="m-pk"><img class="m-pico" src="${srcAt(m.icon)}" alt="" aria-hidden="true" width="36" height="36" loading="lazy" /><span class="m-pn"><span class="m-pname">${esc(m.name)}</span><span class="m-pwhere">${esc(m.place || m.id)}</span></span><span class="badge off">${esc(typeLabel(m.type))}</span>${
    m.guides.length ? `<span class="badge edit">${plural(m.guides.length, 'guide')}</span>` : ''
  }</span>`;

/**
 * Le picker partagé, en lignes : les monstres des GUIDES d'office, « Site » pour
 * élargir à tous ceux que le site utilise, les pastilles de type, la recherche
 * sur le nom ou l'id.
 */
function pickMonster() {
  const types = new Set(roster.roster.map((m) => m.type));
  openHeroPicker({
    title: 'Choisir un monstre',
    roster: roster.roster,
    imgBase: state.imgBase,
    rows: true,
    tile: pickTile,
    hint: (m) => [`${m.name} — ${m.id}`, ...m.guides.map((g) => g.title)].join('\n'),
    placeholder: 'Chercher un monstre (nom ou id)…',
    none: 'Aucun monstre ne correspond.',
    tally: () =>
      `${roster.counts.guides} des guides · ${
        roster.siteError ? 'site illisible' : `${roster.counts.site} avec le site`
      }`,
    seg: {
      label: 'Périmètre',
      options: [
        ['', 'Guides'],
        ['site', 'Site'],
      ],
      test: (m, value) => value === 'site' || m.guides.length > 0,
    },
    pills: { label: 'Type', options: TYPES.filter(([t]) => types.has(t)), of: (m) => m.type },
    match: matches,
    filters: pkFilters,
    chosen: sheet?.monster.id,
    opener: () => $('m-pick'),
    onPick: choose,
  });
}
$('m-pick').onclick = pickMonster;

/** Sans monstre, l'onglet n'a rien à montrer : le picker s'ouvre de lui-même. */
function pickIfEmpty() {
  if (roster && !sheet && !wanted && !loading && !$('tab-monsters').hidden) pickMonster();
}

/** Le roster, demandé à la première venue sur l'onglet : il coûte un calcul au serveur. */
function askRoster() {
  if (asked) return;
  asked = true;
  getJson('/api/monsters/roster')
    .then((r) => {
      roster = r;
      for (const m of r.roster) nameWords.set(m.id, wordsOf(m.name));
      $('m-pick').disabled = false;
      pickIfEmpty();
    })
    .catch((e) => {
      asked = false;
      log([`Monstres illisibles : ${e}`], false);
    });
}

$('m-reset').onclick = () => reload(sheet.monster.id);

$('m-save').onclick = async () => {
  if (!sheet || !changes()) return;
  const id = sheet.monster.id;
  // Chaque carte modifiée part avec ses deux listes ENTIÈRES : une ref héritée
  // du fichier, que la carte ne montre pas, y reste.
  const moved = sheet.kit.cards.filter((c) => cardChanges(c.id));
  const lists = (kind) => Object.fromEntries(moved.map((c) => [c.id, kitNow(kind, c.id)]));

  $('m-save').disabled = $('m-reset').disabled = true;
  $('m-save').classList.add('busy');
  log([], undefined, 'envoi du kit au serveur');
  try {
    const r = await post('/api/monsters', {
      id,
      changes: { chipOwner: { ...own }, chipHide: lists('hide'), chipAdd: lists('add') },
      was: sheet.disk,
    });
    const said = new Map();
    for (const x of r.refused ?? []) {
      const key = x.card ? `kit:${x.card}` : 'kit';
      said.set(key, said.has(key) ? `${said.get(key)} ; ${x.reason}` : x.reason);
    }
    // Le disque fait foi, que tout soit passé ou non : on le relit, et la saisie
    // s'y repose. Ce que le disque porte maintenant n'est plus « modifié »
    // (`prune`) ; une carte refusée garde sa saisie, cerclée — sauf si c'est le
    // disque qui avait changé (`stale`) : elle montre alors le disque.
    await load(id, true);
    if (r.stale) forget();
    refused = said;
  } catch (e) {
    log([`Enregistrement interrompu : ${e}`], false);
  } finally {
    $('m-save').classList.remove('busy');
    render();
  }
};

/** Quitter l'onglet avec des changements en attente : sur confirmation. */
function leave() {
  const n = changes();
  return (
    !n ||
    confirm(
      `${plural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${sheet.monster.name}. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.`,
    )
  );
}

sections.register('monsters', {
  init: () => {
    // `#monsters/<id>` ouvre l'onglet sur le kit de ce monstre (un lien, le
    // banc de captures). `lib.js` ne connaît que `#monsters` : c'est le clic sur
    // l'onglet qui l'ouvre.
    const [, open] = /^#monsters\/([^/]+)$/.exec(location.hash) ?? [];
    if (open) {
      wanted = decodeURIComponent(open);
      document.querySelector('#tabs [data-tab="monsters"]')?.click();
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
  },
  // Chaque venue à l'écran : le roster à la première ; le monstre du hash ; sans
  // monstre, le picker ; avec, l'adresse — et, s'il n'y a rien en attente, le
  // kit relu (l'admin ou l'autre poste a pu l'écrire).
  open: () => {
    askRoster();
    if (wanted) {
      const id = wanted;
      wanted = null;
      return load(id)
        .catch((e) => log([`Monstre illisible : ${e}`], false))
        .then(pickIfEmpty);
    }
    if (loading) return;
    if (!sheet) return pickIfEmpty();
    writeHash();
    if (!changes()) reload(sheet.monster.id);
  },
  // Des changements en attente ne survivent pas à un rechargement de la page.
  dirty: changes,
  canLeave: leave,
});
