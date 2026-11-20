// Onglet « Guides » : la vue d'ensemble des guides du site, une catégorie à la
// fois (une rangée de catégories, la recherche les traverse toutes), et
// l'éditeur des guides de boss (les catégories de `GUIDE_SPECS` : joint
// challenge, world boss, guild raid, special request, irregular extermination,
// adventure license, adventure, dimensional singularity) — l'éditeur « Guide editor » de
// l'admin, sans ses catégories mortes — et, sous la même coquille, les quatre
// guides GÉNÉRAUX à fragment éditable (Premium & Limited, Free Heroes, Shop
// priorities, Core Fusion), rendus d'après la FORME que le serveur sert (`gen`, plus bas),
// plus l'import d'une contribution depuis la vue d'ensemble. Un guide à la
// fois, en sous-onglets : Méta (titre et description en six langues, caché),
// Combat (ce que la catégorie demande, et pour un versionné les pins en
// lecture), Intro, puis par version — Tips, Notes, Persos, Équipe, Vidéos.
// Un guild raid (F33) a ses sous-onglets à lui — Combat, Phase 1, Phase 2 — et
// ne s'édite qu'au gabarit ; une version à l'ancien format s'y lit.
// L'anglais se saisit et porte la structure, « Traduire » génère les autres
// langues, chaque texte porte son aperçu. Vidéos : la liste, ✕, et l'ajout par
// la chaîne officielle ou par URL (`video-add.js`). Une savebar, un enregistrement, un
// commit : tout le guide part en un geste (`saveGuideDraft` réécrit toutes les
// versions), le `meta.json` re-daté avec lui.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';
import { noteHtml } from '../gear-view.mjs';
import { heroFilters, openHeroPicker } from '../hero-picker.mjs';
import { heroTile } from '../hero-tile.mjs';
import { sortable } from '../sortable.mjs';
import { videoAdder } from '../video-add.js';
import { openTemplate } from './changelog.js';

// Les sous-onglets, dans l'ordre de l'éditeur de l'admin ; `scoped` : par version.
const SUBS = [
  { id: 'meta', label: 'Méta' },
  { id: 'battle', label: 'Combat' },
  { id: 'intro', label: 'Intro' },
  { id: 'tips', label: 'Tips', scoped: true, when: (spec) => !spec.raid },
  { id: 'notes', label: 'Notes', scoped: true, when: (spec) => spec.notes },
  { id: 'reco', label: 'Persos', scoped: true, when: (spec) => !spec.raid },
  { id: 'team', label: 'Équipe', scoped: true, when: (spec) => spec.teams !== 'none' },
  { id: 'videos', label: 'Vidéos', scoped: true, when: (spec) => spec.videos },
  // Un guild raid : ses deux phases, celles de la version.
  { id: 'phase1', label: 'Phase 1', scoped: true, when: (spec) => spec.raid },
  { id: 'phase2', label: 'Phase 2', scoped: true, when: (spec) => spec.raid },
];
/** Le mode d'un gabarit « Mise à jour » du Journal du site, par catégorie versionnée. */
const UPDATE_MODE = {
  'joint-challenge': 'Joint Challenge',
  'world-boss': 'World Boss',
  'guild-raid': 'Guild Raid',
};
/** Nombre max de slots d'une équipe (contrainte du jeu). */
const MAX_SLOTS = 4;
// L'aperçu part ce délai après la dernière frappe, celui de la Fiche perso.
const PV_DELAY = 400;

let overview = null; // `/api/guides`, relu à chaque venue sur la vue d'ensemble
let withHidden = false; // la case « cachés »
let query = ''; // la recherche de la vue d'ensemble
let cat = null; // la catégorie dépliée de la vue d'ensemble (son slug)
let sheet = null; // l'état du guide ouvert (`/api/guides/state`)
let draft = null; // son brouillon, celui que la page retouche
let meta = null; // ses textes de meta, retouchés
let was = null; // le brouillon et le meta tels que le disque les portait au chargement
let sub = 'meta'; // le sous-onglet montré
let ver = 0; // la version montrée (index dans `draft.versions`)
let wanted = null; // ce que le hash demande : { cat, slug, version }, tant que ce n'est pas chargé
let wantedSub = null; // le sous-onglet que le hash demande de ce guide, tant qu'il n'est pas chargé
let gen = null; // le guide GÉNÉRAL ouvert : { slug, form, data, was } — `draft` et `meta` restent nuls
const genOpen = new Set(); // par clé : les notes de produit ouvertes par « ＋ note » tant qu'elles sont vides, les groupes (`group`) dépliés
let openEntry = null; // l'entrée dépliée d'un bloc `roster` (une review) : l'objet lui-même, les index bougent
let refused = []; // les refus du dernier enregistrement (`GuideRefusal`)
const pinTouched = new Set(); // les versions dont la page a touché les pins
const texts = new Map(); // au dessin : clé d'un texte → son objet (ou sa liste, pour un bloc)
const at = new WeakMap(); // un texte → son anglais au chargement, ou à sa dernière traduction
const trOpen = new Set(); // les « Traductions » dépliées, par clé
let tr = { busy: false, error: '' }; // « Traduire » : en cours, son dernier refus
let adding = false; // le formulaire « ＋ version » est ouvert
let created = null; // la version que « ＋ version » vient de poser : la proposition du Journal
const pkFilters = heroFilters(); // les filtres des pickers en lignes, à eux
// L'aperçu des textes du sous-onglet montré (`POST /api/guides/preview`) : UNE
// requête pour tous, UNE langue pour tout le guide.
const pv = { lang: '', seq: 0, timer: 0, sent: '', busy: false, error: '', segs: new Map() };
let drawnBase = state.imgBase; // la base des images du dernier dessin (cf. `init`)

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const src = (path) => `${esc(state.imgBase)}/images/${path}.webp`;
/** Une image que le serveur a résolue : relative (`/images/…`), elle passe sous `imgBase`. */
const srcAt = (path) => esc(path.startsWith('/') ? `${state.imgBase}${path}` : path);
const viewEnv = () => ({ imgBase: state.imgBase, esc });
const def = () => sheet.langs.default;
const others = () => sheet.langs.shown.filter((l) => l !== def());

/** Les mots d'un texte : minuscules, sans accents, suites de lettres et de chiffres. */
const wordsOf = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
/** La recherche d'Effets : chaque mot de la saisie COMMENCE un mot du champ. */
const starts = (field, q) => {
  const words = wordsOf(field);
  return wordsOf(q).every((w) => words.some((x) => x.startsWith(w)));
};

// ------------------------------------------------------ le modèle
const spec = () => sheet.spec;
const v = () => draft?.versions[ver];
/** Les sous-onglets : ceux de la forme d'un guide général, ou ceux de la spec d'un guide de boss. */
const subsOn = () => (gen ? gen.form.tabs : SUBS.filter((s) => !s.when || s.when(spec())));
/** Un texte localisé, tel qu'il partirait : les langues écrites. */
const textOut = (t) =>
  Object.fromEntries(Object.entries(t ?? {}).filter(([, x]) => String(x).trim()));
const hasText = (t) => Object.keys(textOut(t)).length > 0;
/** Un texte facultatif (un titre, une raison, une note) : absent s'il est vide. */
const optText = (t) => (hasText(t) ? textOut(t) : undefined);

/**
 * Une version telle qu'elle partirait : les clés du modèle, les textes nettoyés,
 * et les MÊMES règles que le store à l'écriture (`fromVersionDraft`) — une
 * section sans conseil, un groupe sans perso ni raison, une équipe sans slot
 * rempli n'existent pas sur le disque. C'est ce que la savebar compare au
 * disque : une ligne ouverte puis laissée vide ne compte pas. `pinned` ne part
 * que si la page y a touché.
 */
function versionOut(x) {
  const names = (list) => list.map((n) => n.trim()).filter(Boolean);
  const group = (g) => ({
    characters: names(g.characters),
    ...(optText(g.reason) ? { reason: optText(g.reason) } : {}),
  });
  const keptGroup = (g) => g.characters.length || g.reason;
  return {
    key: x.key,
    ...(x.labelOverride ? { labelOverride: x.labelOverride } : {}),
    ...(x.hidden ? { hidden: true } : {}),
    ...(x.group ? { group: x.group } : {}),
    ...(pinTouched.has(x.key) && x.pinned ? { pinned: x.pinned } : {}),
    ...(x.dungeons?.length ? { dungeons: x.dungeons } : {}),
    ...(x.bossId ? { bossId: x.bossId } : {}),
    tipSections: x.tipSections
      .map((s) => ({
        ...(optText(s.title) ? { title: optText(s.title) } : {}),
        ...(s.rawTitle ? { rawTitle: s.rawTitle } : {}),
        tips: s.tips.filter(hasText).map(textOut),
      }))
      .filter((s) => s.tips.length),
    notes: x.notes.filter(hasText).map(textOut),
    recommended: x.recommended.map(group).filter(keptGroup),
    recoSections: x.recoSections
      .map((s) => ({
        ...(optText(s.title) ? { title: optText(s.title) } : {}),
        ...(s.rawTitle ? { rawTitle: s.rawTitle } : {}),
        groups: s.groups.map(group).filter(keptGroup),
      }))
      .filter((s) => s.groups.length),
    teams: x.teams
      .map((t) => ({
        ...(t.stages ? { stages: t.stages } : {}),
        ...(t.rawTitle ? { rawTitle: t.rawTitle } : {}),
        ...(optText(t.title) ? { title: optText(t.title) } : {}),
        slots: t.slots.map(names).filter((slot) => slot.length),
        ...(optText(t.note) ? { note: optText(t.note) } : {}),
        ...(t.notes?.filter(hasText).length ? { notes: t.notes.filter(hasText).map(textOut) } : {}),
      }))
      .filter((t) => t.slots.length),
    videos: x.videos,
    ...(x.raid ? { raid: raidOut(x.raid) } : {}),
  };
}
/** Un brouillon tel qu'il partirait — le même nettoyage pour le disque et la saisie. */
const cleanDraft = (d) => ({ intro: textOut(d.intro), versions: d.versions.map(versionOut) });
const cleanMeta = (m) => ({
  title: textOut(m.title),
  description: textOut(m.description),
  hidden: Boolean(m.hidden),
  updating: Boolean(m.updating),
});
const draftOut = () => cleanDraft(draft);
const metaOut = () => cleanMeta(meta);

/**
 * La TRANCHE d'un sous-onglet, dans un brouillon : ce que la savebar compare au
 * disque. `meta` et `intro` valent pour tout le guide ; `battle`, pour un
 * versionné, c'est le combat (partagé) et les pins de la version ; `version`
 * (une tranche sans sous-onglet), ce que la barre des versions édite — sa case
 * « Cachée ».
 */
function sliceOf(d, m, tab, vi) {
  const x = d.versions[vi];
  switch (tab) {
    case 'meta':
      return m;
    case 'intro':
      return d.intro;
    case 'battle':
      // Les pins du disque ne comptent que si la page y a touché (sinon ils ne partent pas).
      return x
        ? {
            group: x.group,
            dungeons: x.dungeons,
            bossId: x.bossId,
            pinned: x.pinned,
            // Un guild raid : les trois combats de la version.
            raid: x.raid && [x.raid.subA, x.raid.subB, x.raid.main],
          }
        : null;
    case 'tips':
      return x?.tipSections;
    case 'notes':
      return x?.notes;
    case 'reco':
      return x ? { recommended: x.recommended, recoSections: x.recoSections } : null;
    case 'team':
      return x?.teams;
    case 'videos':
      return x?.videos;
    case 'phase1':
      return x?.raid ? [x.raid.bossA, x.raid.bossB] : null;
    case 'phase2':
      return x?.raid?.teams;
    case 'version':
      return x ? { hidden: Boolean(x.hidden) } : null;
    default:
      return null;
  }
}
// Le brouillon nettoyé ne se recalcule pas à chaque tranche : celui du disque
// tant que `was` est le même objet (il ne change qu'au chargement), celui de
// la saisie le temps d'UN passage de `counted` (les points des onglets, des
// versions et la savebar le lisent une trentaine de fois de suite, sans
// qu'aucune saisie ne s'intercale — un guild raid porte des centaines de textes).
let wasMemo = { of: null, draft: null };
let nowMemo = null;
const cleanWas = () => {
  if (wasMemo.of !== was) wasMemo = { of: was, draft: cleanDraft(was.draft) };
  return wasMemo.draft;
};
const cleanNow = () => (nowMemo ? (nowMemo.draft ??= cleanDraft(draft)) : cleanDraft(draft));
/** Joue `fn` avec le brouillon de la saisie nettoyé UNE fois : rien ne s'y saisit entre-temps. */
function counted(fn) {
  if (nowMemo) return fn();
  nowMemo = { draft: null };
  try {
    return fn();
  } finally {
    nowMemo = null;
  }
}
/** Ce que le disque portait d'une tranche, nettoyé comme la saisie — comparable. */
const diskSlice = (tab, vi) => sliceOf(cleanWas(), cleanMeta(was.meta), tab, vi);
const nowSlice = (tab, vi) => sliceOf(cleanNow(), cleanMeta(meta), tab, vi);
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
/** Un sous-onglet (d'une version) diffère-t-il du disque ? */
const tabMoved = (tab, vi = ver) =>
  Boolean(sheet) && (gen ? tabMovedGen(tab) : !same(nowSlice(tab, vi), diskSlice(tab, vi)));
/** Les tranches à comparer : les partagées, puis celles de chaque version. */
function slices() {
  if (!sheet) return [];
  const shared = subsOn().filter((s) => !s.scoped && s.id !== 'battle');
  const scoped = subsOn().filter((s) => s.scoped || s.id === 'battle');
  const own = spec().versioned ? ['version'] : [];
  return [
    ...shared.map((s) => [s.id, 0]),
    ...draft.versions.flatMap((x, vi) =>
      // Une version du disque disparue (jamais : la page n'en retire pas) ne compte pas.
      was.draft.versions[vi]
        ? [...scoped.map((s) => s.id), ...own].map((id) => [id, vi])
        : [['guide', vi]],
    ),
  ];
}
/** Ce que compte la savebar : les sous-onglets, par version, qui diffèrent du disque. */
const changes = () =>
  gen
    ? subsOn().filter((t) => tabMovedGen(t.id)).length
    : slices().filter(([tab, vi]) => tabMoved(tab, vi)).length;

/** Les refus qui visent un sous-onglet d'une version (`version` absente : tout le guide). */
const refusedIn = (tab, vi = ver) =>
  refused.filter(
    (r) =>
      (r.tab === tab || (tab === 'guide' && !subsOn().some((s) => s.id === r.tab))) &&
      (r.version === undefined || r.version === draft?.versions[vi]?.key),
  );
/** Les refus d'une ligne d'un sous-onglet ; `field` donné : ceux de ce champ seulement. */
const refusedAt = (tab, index, field) =>
  refusedIn(tab).filter((r) => r.index === index && (field === undefined || r.field === field));
/** Retire les refus d'un sous-onglet : y retoucher les lève. */
const forgive = (tab, vi = ver) => {
  refused = refused.filter((r) => !refusedIn(tab, vi).includes(r));
};

// Le roster, par nom d'affichage anglais (ce que les guides écrivent) et par id.
const heroByName = (name) => sheet.options.roster.find((c) => c.name === name);
const heroById = (id) => sheet.options.roster.find((c) => c.id === id);

/** Les textes d'un brouillon, dans l'ordre — les OBJETS (la traduction écrit dedans). */
function allTexts(d) {
  const out = [d.intro];
  for (const x of d.versions) {
    for (const s of x.tipSections) {
      if (s.title) out.push(s.title);
      out.push(...s.tips);
    }
    out.push(...x.notes);
    for (const g of x.recommended) if (g.reason) out.push(g.reason);
    for (const s of x.recoSections) {
      if (s.title) out.push(s.title);
      for (const g of s.groups) if (g.reason) out.push(g.reason);
    }
    for (const t of x.teams) {
      if (t.title) out.push(t.title);
      if (t.note) out.push(t.note);
      if (t.notes) out.push(...t.notes);
    }
    out.push(...rTexts(x.raid));
  }
  return out;
}
const en = (t) => (t?.[def()] ?? '').trim();
/** Des traductions qui datent d'un autre anglais que celui saisi. */
const stale = (t) =>
  Boolean(en(t)) && en(t) !== (at.get(t) ?? '').trim() && others().some((l) => t[l]?.trim());
const tally = (t) => `${others().filter((l) => t[l]?.trim()).length} / ${others().length}`;

/**
 * Un bloc édité → une liste de textes, EN PLACE. L'anglais est la STRUCTURE :
 * l'éditer ajoute ou retire des entrées ; une autre langue ne fait que remplir
 * les traductions, par index — la règle de `guide-text.ts` de l'admin. Sans
 * elle, traduire un guide en japonais pourrait en supprimer des conseils.
 */
function blockToItems(block, list, lang) {
  const lines = block.split('\n');
  if (lang === def()) {
    const next = lines.map((line, i) => {
      const t = list[i] ?? { [def()]: '' };
      t[def()] = line;
      return t;
    });
    list.length = 0;
    list.push(...next);
    return;
  }
  list.forEach((t, i) => {
    const line = lines[i] ?? '';
    if (line.trim()) t[lang] = line;
    else delete t[lang];
  });
}
const itemsToBlock = (list, lang) => list.map((t) => t[lang] ?? '').join('\n');

// ------------------------------------------------------ la vue d'ensemble
const dateOf = (iso) => iso || '—';

/** Une ligne de guide : un bouton quand quick l'édite, sinon une ligne atténuée et le site. */
function rowHtml(cat, g) {
  const site = `${esc(overview.siteBase)}/${esc(cat.slug)}/${esc(g.slug)}`;
  // Éditable par guide : une catégorie de `GUIDE_SPECS` l'est entière, les
  // généraux trois sur quatorze (`editable` de la ligne ; absent : celui de la catégorie).
  const editable = g.editable ?? cat.editable;
  const badges = `${g.hidden ? '<span class="badge off">caché</span>' : ''}${
    g.updating ? '<span class="badge off">en mise à jour</span>' : ''
  }${editable ? '' : '<span class="badge off">contenu en code</span>'}`;
  const shy = g.hiddenVersions
    ? ` <span class="lbl">dont ${g.hiddenVersions} cachée${g.hiddenVersions > 1 ? 's' : ''}</span>`
    : '';
  const title = editable
    ? `<button class="gd-open" type="button" data-cat="${esc(cat.slug)}" data-slug="${esc(g.slug)}">${esc(g.title)}</button>`
    : `<span class="gd-name">${esc(g.title)}</span>`;
  return `<tr class="gd-row${editable ? '' : ' dim'}${g.hidden ? ' off' : ''}" data-slug="${esc(g.slug)}">
    <td>${title}<span class="lbl gd-slug">${esc(g.slug)}</span></td>
    <td class="dim">${esc(g.battle || '—')}</td>
    <td class="code">${esc(dateOf(g.updated))}</td>
    <td>${g.versions ? `<span class="badge off">${g.versions} · ${esc(g.newest)}</span>${shy}` : '<span class="lbl">plat</span>'}</td>
    <td class="gd-state">${badges}</td>
    <td class="gd-site"><a href="${site}" target="_blank" rel="noopener" title="Ouvrir sur le site de dev">site ↗</a></td>
  </tr>`;
}

// La dernière catégorie montrée survit au rechargement ; un stockage refusé
// (navigation privée) ne doit pas casser l'onglet.
const CAT_KEY = 'quick.guides.cat';
const lastCat = () => {
  try {
    return localStorage.getItem(CAT_KEY);
  } catch {
    return null;
  }
};
const keepCat = (slug) => {
  try {
    localStorage.setItem(CAT_KEY, slug);
  } catch {}
};
/** Une catégorie qui s'ouvre : servie, et quick y édite au moins un guide. */
const opens = (slug) => Boolean(overview?.categories.some((c) => c.slug === slug && c.editable));
/**
 * La catégorie dépliée : celle demandée (le hash, un clic, le guide quitté)
 * tant que le serveur la sert, sinon la dernière montrée (`renderOverview` la
 * retient), sinon la première éditable.
 */
function openCat() {
  if (opens(cat)) return cat;
  const last = lastCat();
  return opens(last) ? last : (overview?.categories.find((c) => c.editable)?.slug ?? null);
}

/** Les lignes d'une catégorie ; sous un sous-titre par palier quand ses guides en portent un. */
function rowsHtml(c) {
  const rows = (guides) => guides.map((g) => rowHtml(c, g)).join('');
  if (!c.guides.some((g) => g.tier)) return `<tbody>${rows(c.guides)}</tbody>`;
  const tiers = overview.tiers ?? [];
  const known = (g) => tiers.some((t) => t.key === g.tier);
  return [...tiers, { key: '', label: 'Sans palier' }]
    .map((t) => ({ ...t, guides: c.guides.filter((g) => (t.key ? g.tier === t.key : !known(g))) }))
    .filter((t) => t.guides.length)
    .map(
      (t) =>
        `<tbody class="gd-tier" data-tier="${esc(t.key)}"><tr class="gd-tier-head"><th colspan="6" scope="rowgroup">${esc(t.label)}<span class="lbl mono">${esc(t.key)}</span></th></tr>${rows(t.guides)}</tbody>`,
    )
    .join('');
}

/** La carte d'une catégorie : son en-tête, la table de ses guides. */
const catHtml = (c) => `<div class="card gd-cat" data-cat="${esc(c.slug)}">
      <div class="card-head"><strong>${esc(c.label)}</strong><span class="lbl mono">${esc(c.slug)}</span><span class="badge off">${plural(c.guides.length, 'guide')}</span>${
        c.hidden ? `<span class="badge off">${c.hidden} caché${c.hidden > 1 ? 's' : ''}</span>` : ''
      }${c.editable ? '' : '<span class="badge warn">contenu en code</span>'}</div>
      <div class="scroll"><table>
        <thead><tr><th>Guide</th><th>Boss / combat</th><th>Mis à jour</th><th>Versions</th><th>État</th><th><span class="sr">Site</span></th></tr></thead>
        ${rowsHtml(c)}
      </table></div>
    </div>`;

/**
 * La liste : UNE catégorie, celle de la rangée ; ou, tant que la recherche
 * n'est pas vide, les correspondances de TOUTES les catégories, une carte par
 * catégorie qui en a.
 */
function overviewHtml() {
  const q = query.trim();
  if (!q) {
    const c = overview.categories.find((x) => x.slug === cat);
    return c ? catHtml(c) : '<div class="empty">Aucune catégorie à ouvrir.</div>';
  }
  const cats = overview.categories
    .map((c) => ({ ...c, guides: c.guides.filter((g) => starts(g.title, q) || starts(g.slug, q)) }))
    .filter((c) => c.guides.length);
  if (!cats.length) return '<div class="empty">Aucun guide ne correspond.</div>';
  return cats.map(catHtml).join('');
}

/**
 * La rangée des catégories, dans l'ordre du site : un onglet par catégorie
 * servie, son compte ; une catégorie dont tout le contenu est en code reste
 * visible, grise, et ne s'ouvre pas. Pendant une recherche la liste les
 * traverse toutes : aucun onglet n'est l'actif.
 */
function catsHtml() {
  const searching = Boolean(query.trim());
  return overview.categories
    .map((c) => {
      const on = !searching && c.slug === cat;
      return `<button class="tab" type="button" role="tab" id="gd-cat-${esc(c.slug)}" data-cat="${esc(c.slug)}" aria-selected="${on}" aria-controls="gd-list" tabindex="${c.slug === cat ? 0 : -1}"${
        c.editable ? '' : ' disabled title="Contenu en code : rien à éditer ici"'
      }>${esc(c.label)}<span class="badge off">${c.guides.length}</span>${
        c.editable ? '' : '<span class="lbl">contenu en code</span>'
      }</button>`;
    })
    .join('');
}

/** La rangée et la liste, redessinées ; le focus d'un onglet de catégorie lui revient. */
function drawList() {
  const focused = document.activeElement?.closest?.('#gd-cats [role="tab"]')?.dataset.cat;
  $('gd-cats').innerHTML = catsHtml();
  $('gd-list').innerHTML = overviewHtml();
  if (focused) $(`gd-cat-${focused}`)?.focus();
}

function renderOverview() {
  $('gd-overview').hidden = Boolean(sheet);
  $('gd-guide').hidden = !sheet;
  if (sheet) return;
  drawnBase = state.imgBase;
  if (!overview) {
    $('gd-cats').innerHTML = '';
    $('gd-list').innerHTML = '';
    $('gd-total').textContent = '';
    return;
  }
  const { counts } = overview;
  $('gd-total').textContent =
    `${plural(counts.guides, 'guide')} dans ${plural(counts.categories, 'catégorie')}` +
    (counts.hidden ? ` · ${counts.hidden} caché${counts.hidden > 1 ? 's' : ''}` : '');
  cat = openCat();
  if (cat) keepCat(cat);
  drawList();
}

/** Une catégorie choisie dans la rangée : elle se déplie seule, la recherche levée. */
function showCat(slug) {
  if (!opens(slug)) return;
  cat = slug;
  keepCat(slug);
  query = $('gd-q').value = '';
  drawList();
  writeHash();
}

/** La vue d'ensemble, relue du disque. */
async function loadOverview() {
  const o = await getJson(`/api/guides${withHidden ? '?hidden=1' : ''}`);
  if (!o.categories) throw new Error('quick lancé avant ce code : Ctrl-C puis `pnpm quick`');
  overview = o;
  renderOverview();
  // La catégorie dépliée est dans l'adresse (un guide ouvert entre-temps garde la sienne).
  if (!sheet && !$('tab-guides').hidden) writeHash();
}
const reloadOverview = () => loadOverview().catch((e) => log([`Guides illisibles : ${e}`], false));

$('gd-q').oninput = () => {
  query = $('gd-q').value;
  if (overview) drawList();
};
$('gd-cats').onclick = (e) => {
  const el = e.target.closest('[role="tab"]:not([disabled])');
  if (el) showCat(el.dataset.cat);
};
$('gd-cats').onkeydown = (e) => {
  const on = (overview?.categories ?? []).filter((c) => c.editable);
  const i = on.findIndex((c) => c.slug === cat);
  const to = {
    ArrowLeft: (i + on.length - 1) % on.length,
    ArrowRight: (i + 1) % on.length,
    Home: 0,
    End: on.length - 1,
  }[e.key];
  if (to === undefined || !on.length) return;
  e.preventDefault();
  showCat(on[to].slug);
  $(`gd-cat-${cat}`)?.focus();
};
$('gd-hidden').onchange = () => {
  withHidden = $('gd-hidden').checked;
  reloadOverview();
};
$('gd-list').onclick = (e) => {
  const b = e.target.closest('.gd-open');
  if (b) choose(b.dataset.cat, b.dataset.slug);
};

// ------------------------------------------------------ l'en-tête du guide
/** Le combat ou le boss d'un guide, en clair : d'après ses options. */
function battleLabel() {
  const x = v();
  if (!x) return '';
  if (spec().monster === 'bossId-meta')
    return sheet.options.monsters.find((m) => m.id === x.bossId)?.label ?? x.bossId ?? '';
  if (spec().monster === 'dungeons-meta') {
    const d = x.dungeons ?? [];
    const first = sheet.options.dungeons.find((o) => o.id === d[0])?.label ?? d[0];
    return d.length ? (d.length > 1 ? `${first} (+${d.length - 1})` : first) : '';
  }
  if (spec().raid) {
    // Un guild raid : le boss principal de sa version au gabarit la plus récente.
    const main = draft.versions.find((y) => y.raid?.main)?.raid.main;
    return rOpts().mains.find((g) => g.group === main)?.label ?? main ?? '';
  }
  const group = draft.versions.find((y) => y.group)?.group;
  return sheet.options.groups.find((g) => g.group === group)?.label ?? group ?? '';
}

function head() {
  const g = sheet?.guide;
  drawnBase = state.imgBase;
  $('gd-head').innerHTML = g
    ? `<button class="btn ghost sm" type="button" data-act="back" title="Revenir à la vue d’ensemble">← Guides</button>
      <div class="gd-id"><strong>${esc(meta?.title[def()] || g.title)}</strong>
        <span class="gd-traits"><span class="badge off">${esc(g.label)}</span><span class="mono">${esc(g.category)}/${esc(g.slug)}</span>${
          battleLabel() ? `<span>${esc(battleLabel())}</span>` : ''
        }<span class="lbl">mis à jour le ${esc(g.updated || '—')}</span>${
          g.versions.length
            ? `<span class="badge off">${plural(g.versions.length, 'version')}</span>`
            : ''
        }<span class="badge off" data-hidden>${meta?.hidden ? 'caché' : ''}</span><span class="badge off" data-updating>${
          meta?.updating ? 'en mise à jour' : ''
        }</span></span>
      </div>
      <a class="btn ghost sm gd-site-link" href="${esc(sheet.siteBase)}/${esc(g.category)}/${esc(g.slug)}" target="_blank" rel="noopener">ouvrir sur le site ↗</a>`
    : '';
}

function bar() {
  const n = sheet ? changes() : 0;
  const no = refused.length;
  $('gd-bar').hidden = !sheet;
  $('gd-count').innerHTML =
    `${n ? `<span class="badge edit">${n} onglet${n > 1 ? 's' : ''} modifié${n > 1 ? 's' : ''}</span>` : ''}${
      no ? `<span class="badge ko">${no} refus</span>` : ''
    }<span class="gd-msg">${n || no ? '' : 'aucune modification'}</span>`;
  $('gd-save').disabled = $('gd-reset').disabled = !n;
}

/** Le groupe des langues de l'aperçu, dans la savebar : là où il y a des textes. */
function pvLangs() {
  const el = $('gd-pv-lang');
  el.hidden = !sheet || sub === 'battle' || sub === 'videos';
  el.innerHTML = el.hidden
    ? ''
    : `<span class="lbl">Aperçu</span><div class="gd-seg" role="group" aria-label="Langue de l’aperçu">${sheet.langs.shown
        .map(
          (l) =>
            `<button type="button" data-lang="${esc(l)}" aria-pressed="${l === pv.lang}">${esc(l)}</button>`,
        )
        .join('')}</div>`;
}
$('gd-pv-lang').onclick = (e) => {
  const el = e.target.closest('button[data-lang]');
  if (!el || el.dataset.lang === pv.lang) return;
  pv.lang = el.dataset.lang;
  for (const b of el.parentElement.children) b.setAttribute('aria-pressed', String(b === el));
  pvAsk();
};

/** Les sous-onglets : un point accent = modifié, rouge = refusé. */
function subTabs() {
  const row = $('gd-tabs');
  const focused = row.contains(document.activeElement);
  row.hidden = !sheet;
  row.innerHTML = row.hidden
    ? ''
    : subsOn()
        .map((s) => {
          const on = s.id === sub;
          const moved = s.scoped || s.id === 'battle' ? tabMoved(s.id) : tabMoved(s.id, 0);
          const dot = refusedIn(s.id).length
            ? ['ko', 'refusé']
            : moved
              ? ['edit', 'modifié, pas encore enregistré']
              : null;
          return `<button class="tab" type="button" role="tab" id="gd-tab-${s.id}" data-sub="${s.id}" aria-selected="${on}" aria-controls="gd-panel" tabindex="${on ? 0 : -1}">${s.label}${
            dot
              ? `<span class="dot ${dot[0]}" role="img" aria-label="${dot[1]}" title="${dot[1]}"></span>`
              : ''
          }</button>`;
        })
        .join('');
  $('gd-panel').setAttribute('aria-labelledby', `gd-tab-${sub}`);
  if (focused) $(`gd-tab-${sub}`)?.focus();
}

/** La date d'une clé de version, comme le site la libelle (`November 2026`). */
const monthOf = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/** Le lien vers le Journal du site, prérempli pour une version nouvelle. */
function changelogLink(key) {
  const g = sheet.guide;
  const values = {
    template: 'update',
    guide: (meta.title[def()] || g.title).replace(
      /\s+(Joint Challenge|World Boss|Guild Raid)\s+Guide$/i,
      '',
    ),
    mode: UPDATE_MODE[g.category] ?? '',
    month: monthOf(key),
    slug: g.slug,
  };
  return `#changelog?${new URLSearchParams(values)}`;
}

/** La barre des versions d'un guide versionné : un onglet par version, « ＋ version », son formulaire. */
function versionsBar() {
  const el = $('gd-versions');
  const on = Boolean(sheet) && spec().versioned;
  el.hidden = !on;
  if (!on) {
    el.innerHTML = '';
    return;
  }
  const tabs = draft.versions
    .map((x, i) => {
      const bad = refused.some((r) => r.version === x.key);
      const moved =
        tabMoved('version', i) ||
        subsOn()
          .filter((s) => s.scoped || s.id === 'battle')
          .some((s) => tabMoved(s.id, i));
      return `<button class="tab" type="button" data-ver="${i}" aria-selected="${i === ver}">${esc(x.key)}${
        i === 0 ? '<span class="lbl">récente</span>' : ''
      }${x.hidden ? '<span class="lbl">cachée</span>' : ''}${rLegacy(x.raid) ? '<span class="lbl">ancien format</span>' : ''}${bad ? '<span class="dot ko" title="refusé"></span>' : moved ? '<span class="dot edit" title="modifiée"></span>' : ''}</button>`;
    })
    .join('');
  // Un guild raid : la clé du mois en cours, et la copie d'une version AU
  // GABARIT seulement (la plus récente d'abord) — une ancienne ne se duplique pas.
  const isRaid = Boolean(spec().raid);
  const sources = draft.versions.filter((x) => !isRaid || (x.raid && !rLegacy(x.raid)));
  const month = isRaid ? new Intl.DateTimeFormat('sv-SE').format(new Date()).slice(0, 7) : '';
  const form = adding
    ? `<div class="form gd-addv">
        <div class="field"><label for="gd-newkey">Nouvelle version (AAAA-MM)</label><input id="gd-newkey" class="w-text mono" placeholder="2026-11" value="${esc(month)}" autocomplete="off" /></div>
        ${
          sources.length
            ? `<div class="field"><label for="gd-fromkey">Dupliquer depuis</label><select id="gd-fromkey">${sources
                .map((x) => `<option value="${esc(x.key)}">${esc(x.key)}</option>`)
                .join('')}</select></div>`
            : isRaid
              ? '<span class="gd-ko">Aucune version au gabarit à dupliquer.</span>'
              : '<span class="lbl">Première version : vierge.</span>'
        }
        <button class="btn ghost" type="button" data-act="create-version">Créer la version</button>
        <button class="btn ghost sm" type="button" data-act="cancel-version">annuler</button>
        <span class="lbl">Écrit le dossier sans committer : « Enregistrer » l’emportera.</span>
      </div>`
    : '';
  const note = created
    ? `<p class="lbl gd-note">Version ${esc(created)} posée sur le disque, pas encore committée : « Enregistrer » l’emportera. <a href="${esc(changelogLink(created))}" data-act="changelog">Ouvrir le Journal du site prérempli ↗</a></p>`
    : '';
  // La case de la version MONTRÉE ; redessinée à chaque coche, elle garde le focus.
  const x = v();
  const hide = x
    ? `<label class="check"><input type="checkbox" data-vhidden${x.hidden ? ' checked' : ''} /> Cachée — hors du sélecteur du site, joignable par <span class="mono">#version=${esc(x.key)}</span></label>`
    : '';
  const focused = document.activeElement?.matches?.('[data-vhidden]');
  el.innerHTML = `<div class="gd-vtabs" role="tablist" aria-label="Versions">${tabs}<button class="btn ghost sm" type="button" data-act="add-version" aria-expanded="${adding}">＋ version</button><span class="lbl">${
    isRaid
      ? 'Méta et Intro valent pour tout le guide ; Combat, Phase 1 et Phase 2 sont ceux de la version.'
      : 'Méta, Combat et Intro valent pour tout le guide ; l’état du boss, Tips, Notes, Persos, Équipe et Vidéos sont ceux de la version.'
  }</span></div>${hide}${form}${note}`;
  if (focused) el.querySelector('[data-vhidden]')?.focus();
}

// ------------------------------------------------------ les textes
/** Le refus d'une clé, sous son champ ; vide, la ligne ne s'affiche pas. */
const errHtml = (list) => `<p class="gd-err">${esc(list.map((r) => r.reason).join(' ; '))}</p>`;

/** L'aperçu d'un texte : ses segments, tels que le site les rend. */
const pvBody = (key) => noteHtml(viewEnv(), pv.segs.get(key) ?? []);

/**
 * Un texte localisé : l'anglais (un champ, ou une textarea qui grandit), son
 * aperçu, ses refus, puis les traductions repliées — le modèle de la Fiche
 * perso (B42). `key` identifie le texte au dessin (`texts`), `what` le nomme
 * aux lecteurs d'écran, `line` en fait un champ d'une ligne (un titre).
 */
function textHtml(key, text, { what, line = false, placeholder = '', bad = [] } = {}) {
  texts.set(key, text);
  const area = (lang, attrs) =>
    line
      ? `<input data-key="${esc(key)}" data-lang="${esc(lang)}" ${attrs} value="${esc(text[lang] ?? '')}" autocomplete="off" />`
      : `<textarea rows="2" data-key="${esc(key)}" data-lang="${esc(lang)}" ${attrs}>\n${esc(text[lang] ?? '')}</textarea>`;
  return `<div class="gd-text${bad.length ? ' ko' : ''}" data-text="${esc(key)}">
    ${area(def(), `aria-label="${esc(what)}, en anglais" placeholder="${esc(placeholder)}"${bad.length ? ' class="refused"' : ''}`)}
    <p class="gd-pv pv-note${pv.busy ? ' busy' : ''}" data-pv="${esc(key)}">${pvBody(key)}</p>
    ${errHtml(bad)}
    <details${trOpen.has(key) ? ' open' : ''}>
      <summary><span class="btn ghost sm">Traductions (${others().length})</span><span class="badge warn" data-stale>${
        stale(text) ? 'à retraduire' : ''
      }</span><span class="lbl" data-tally>${tally(text)}</span></summary>
      <div class="gd-trs">${others()
        .map(
          (lang) =>
            `<div class="field"><label>${esc(lang)}${area(lang, `aria-label="${esc(what)}, ${esc(lang)}" placeholder="${esc(text[def()] ?? '')}"`)}</label></div>`,
        )
        .join('')}</div>
    </details>
  </div>`;
}

/**
 * Un BLOC de textes (les conseils, les paragraphes d'une note d'équipe) : une
 * ligne par entrée, l'anglais porte la structure. L'aperçu rend chaque entrée
 * à sa puce ; les traductions sont des blocs aussi, remplis par index.
 */
function blockHtml(key, list, { what, placeholder = 'Une entrée par ligne…', bad = [] } = {}) {
  texts.set(key, list);
  const area = (lang, attrs) =>
    `<textarea rows="4" data-key="${esc(key)}" data-lang="${esc(lang)}" data-block ${attrs}>\n${esc(itemsToBlock(list, lang))}</textarea>`;
  const preview = list.length
    ? `<ul>${list.map((_, i) => `<li data-pv="${esc(`${key}:${i}`)}">${pvBody(`${key}:${i}`)}</li>`).join('')}</ul>`
    : '';
  return `<div class="gd-text${bad.length ? ' ko' : ''}" data-text="${esc(key)}">
    ${area(def(), `aria-label="${esc(what)}, en anglais" placeholder="${esc(placeholder)}"${bad.length ? ' class="refused"' : ''}`)}
    <div class="gd-pv pv-note${pv.busy ? ' busy' : ''}" data-pv-list="${esc(key)}">${preview}</div>
    ${errHtml(bad)}
    <details${trOpen.has(key) ? ' open' : ''}>
      <summary><span class="btn ghost sm">Traductions (${others().length})</span><span class="badge warn" data-stale>${
        list.some(stale) ? 'à retraduire' : ''
      }</span><span class="lbl" data-tally>${
        list.length
          ? `${list.filter((t) => others().every((l) => t[l]?.trim())).length} / ${list.length} entières`
          : '—'
      }</span></summary>
      <div class="gd-trs">${others()
        .map(
          (lang) =>
            `<div class="field"><label>${esc(lang)}${area(lang, `aria-label="${esc(what)}, ${esc(lang)}" placeholder="${esc(itemsToBlock(list, def()))}"`)}</label></div>`,
        )
        .join('')}</div>
    </details>
  </div>`;
}

/** « Traduire », le même dans chaque sous-onglet de textes : il vaut pour l'onglet montré. */
const translateHtml = () =>
  `<div class="gd-foot"><button class="btn ghost${tr.busy ? ' busy' : ''}" type="button" data-act="translate"${
    tr.busy ? ' disabled' : ''
  } title="Traduit les textes anglais de l’onglet vers ${others().join(', ')} et ÉCRASE les traductions en place : l’anglais fait foi (DeepL, puis Claude Haiku). À relire ; rien ne s’écrit avant « Enregistrer ».">Traduire</button><span class="badge error" data-tr-error>${esc(tr.error)}</span><p class="gd-ko" data-pv-error>${esc(pv.error)}</p></div>`;

/** Les refus d'un sous-onglet qui ne visent aucune ligne, en tête du panneau. */
const tabErr = (tab) => errHtml(refusedIn(tab).filter((r) => r.index === undefined));

/** Le titre d'une section (tips, persos, équipe) : libre, ou auto (`rawTitle`) tant qu'on ne le remplace pas. */
const titleField = (key, s, what, i) =>
  textHtml(key, (s.title ??= { [def()]: '' }), {
    what: `Titre ${what} ${i + 1}`,
    line: true,
    placeholder:
      s.rawTitle && !hasText(s.title)
        ? 'Titre automatique — saisir pour remplacer'
        : 'Titre (facultatif)',
    bad: refusedAt(sub, i, 'title'),
  });

// ------------------------------------------------------ « Méta »
function metaHtml() {
  const g = sheet.guide;
  return `<div class="gd-cols">
    <div class="card gd-card" data-card="title">
      <div class="card-head"><strong>Titre</strong><span class="lbl">six langues</span></div>
      <div class="gd-body">${textHtml('meta.title', meta.title, { what: 'Titre', line: true, bad: refusedAt('meta', undefined, 'title') })}</div>
    </div>
    <div class="card gd-card" data-card="description">
      <div class="card-head"><strong>Description</strong><span class="lbl">SEO et cartes de liste</span></div>
      <div class="gd-body">${textHtml('meta.description', meta.description, { what: 'Description', bad: refusedAt('meta', undefined, 'description') })}</div>
    </div>
    <div class="card gd-card gd-wide" data-card="flags">
      <div class="gd-body">
        <div class="form">
          <label class="check"><input type="checkbox" data-meta="hidden"${meta.hidden ? ' checked' : ''} /> Caché — hors des listes du site, joignable par son URL</label>
          <span class="lbl">icône <span class="mono">${esc(g.icon)}</span> · auteur ${esc(g.author)} · mis à jour le ${esc(g.updated || '—')} (posé au commit)</span>
        </div>
        <div class="form">
          <label class="check"><input type="checkbox" data-meta="updating"${meta.updating ? ' checked' : ''} /> En cours de mise à jour — le guide reste listé, sa page porte un avertissement</label>
        </div>
        ${tabErr('meta')}
      </div>
    </div>
    <div class="gd-wide">${translateHtml()}</div>
  </div>`;
}

// ------------------------------------------------------ « Combat »
/** Un monstre épinglé ou live, pour une version : la lecture, et « dépingler ». */
function pinHtml(target) {
  const pinned = (v().pinned ?? []).find((k) => k.split('@')[0] === target.id);
  const archive = pinned && target.archives.find((a) => a.key === pinned);
  const label = archive
    ? archive.label
      ? `v${archive.version} · ${archive.label}`
      : `v${archive.version} · ${archive.committedAt.slice(0, 10)}`
    : pinned;
  return `<div class="gd-pin" data-pin="${esc(target.id)}">
    ${target.icon ? `<img src="${srcAt(target.icon)}" alt="" aria-hidden="true" width="36" height="36" />` : ''}
    <div class="gd-pn"><strong>${esc(target.name)}</strong><span class="lbl">${esc(target.where.join(', '))}</span></div>
    ${
      pinned
        ? `<span class="badge warn">épinglé · ${esc(label)}</span><button class="btn ghost sm" type="button" data-act="unpin" data-id="${esc(target.id)}">dépingler</button>`
        : `<span class="badge ok">live</span><span class="lbl">${
            target.archives.length
              ? `${plural(target.archives.length, 'archive')} — s’épingle depuis l’extractor`
              : 'jamais versionné'
          }</span>`
    }
  </div>`;
}

function battleHtml() {
  const x = v();
  const s = spec();
  let body = '';
  if (s.monster === 'dungeons-meta') {
    const d = x.dungeons ?? [];
    const label = (id) => sheet.options.dungeons.find((o) => o.id === id)?.label ?? id;
    body = `<div class="card-head"><strong>Donjons</strong><span class="lbl">du plus facile au plus dur</span></div>
      <div class="gd-body">
        ${
          d.length
            ? `<ol class="gd-dungeons">${d
                .map(
                  (id, i) =>
                    `<li><span>${esc(label(id))}</span><span class="mono lbl">${esc(id)}</span><button class="btn icon" type="button" data-act="up-dungeon" data-i="${i}" title="Monter" aria-label="Monter ${esc(label(id))}"${i ? '' : ' disabled'}>↑</button><button class="btn icon" type="button" data-act="down-dungeon" data-i="${i}" title="Descendre" aria-label="Descendre ${esc(label(id))}"${i < d.length - 1 ? '' : ' disabled'}>↓</button><button class="btn icon" type="button" data-act="del-dungeon" data-i="${i}" title="Retirer" aria-label="Retirer ${esc(label(id))}">✕</button></li>`,
                )
                .join('')}</ol>`
            : '<p class="gd-ko">Au moins un donjon est requis.</p>'
        }
        <div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-dungeon" aria-haspopup="dialog">＋ donjon</button></div>
      </div>`;
  } else if (s.monster === 'bossId-meta') {
    const m = sheet.options.monsters.find((o) => o.id === x.bossId);
    body = `<div class="card-head"><strong>Boss</strong></div>
      <div class="gd-body">
        <div class="gd-battle">${
          x.bossId
            ? `<strong>${esc(m?.label ?? x.bossId)}</strong><span class="mono lbl">${esc(x.bossId)}</span>`
            : '<span class="gd-ko">Un boss (monstre) est requis.</span>'
        }<button class="btn ghost sm" type="button" data-act="pick-boss" aria-haspopup="dialog">${x.bossId ? 'Changer…' : 'Choisir un boss…'}</button></div>
      </div>`;
  } else {
    const group = s.versioned ? draft.versions.find((y) => y.group)?.group : x.group;
    const g = sheet.options.groups.find((o) => o.group === group);
    body = `<div class="card-head"><strong>Combat</strong>${
      s.versioned
        ? '<span class="lbl">un seul pour tout le guide : changer ici vaut pour toutes les versions qui en portent un</span>'
        : ''
    }</div>
      <div class="gd-body">
        <div class="gd-battle">${
          group
            ? `${g?.icon ? `<img src="${srcAt(g.icon)}" alt="" aria-hidden="true" width="36" height="36" />` : ''}<strong>${esc(g?.label ?? group)}</strong><span class="mono lbl">${esc(group)}</span>`
            : '<span class="gd-ko">Un combat (monstre) est requis.</span>'
        }<button class="btn ghost sm" type="button" data-act="pick-group" aria-haspopup="dialog">${group ? 'Changer…' : 'Choisir un combat…'}</button></div>
      </div>`;
  }
  const pins = s.versioned
    ? `<div class="card gd-card" data-card="pins">
        <div class="card-head"><strong>État du boss pour ${esc(x.key)}</strong><span class="lbl">live, ou une archive figée — se dépingle ici, s’épingle depuis l’extractor</span></div>
        <div class="gd-body">${
          sheet.pins.length
            ? sheet.pins.map(pinHtml).join('')
            : '<p class="lbl">Aucun combat sur ce guide : rien à épingler.</p>'
        }</div>
      </div>`
    : '';
  return `<div class="gd-stack"><div class="card gd-card" data-card="battle">${body}</div>${pins}${tabErr('battle')}</div>`;
}

// ------------------------------------------------------ « Intro »
const introHtml = () =>
  `<div class="gd-stack"><div class="card gd-card" data-card="intro">
    <div class="card-head"><strong>Intro</strong>${spec().versioned ? '<span class="lbl">partagée par toutes les versions</span>' : ''}${
      spec().introRequired ? '<span class="badge off">requise</span>' : ''
    }</div>
    <div class="gd-body">${textHtml('intro', draft.intro, { what: 'Intro', bad: refusedIn('intro') })}</div>
  </div>${translateHtml()}</div>`;

// ------------------------------------------------------ « Tips »
function tipsHtml() {
  const x = v();
  if (!spec().tipTitles) {
    const s = (x.tipSections[0] ??= { tips: [] });
    return `<div class="gd-stack"><div class="card gd-card" data-card="tips">
      <div class="card-head"><strong>Conseils</strong><span class="lbl">un par ligne</span></div>
      <div class="gd-body">${blockHtml('tips.0', s.tips, { what: 'Conseils', placeholder: 'Un conseil par ligne…', bad: refusedIn('tips') })}</div>
    </div>${translateHtml()}</div>`;
  }
  return `<div class="gd-stack">${
    x.tipSections.length
      ? x.tipSections
          .map(
            (s, i) => `<div class="card gd-card" data-card="tips-${i}" data-i="${i}">
        <div class="card-head"><strong>Section ${i + 1}</strong><button class="btn icon" type="button" data-act="del-section" data-i="${i}" title="Retirer la section" aria-label="Retirer la section ${i + 1}">✕</button></div>
        <div class="gd-body">${titleField(`tips.${i}.title`, s, 'de la section', i)}${blockHtml(`tips.${i}`, s.tips, { what: `Conseils de la section ${i + 1}`, placeholder: 'Un conseil par ligne…', bad: refusedAt('tips', i).filter((r) => r.field !== 'title') })}</div>
      </div>`,
          )
          .join('')
      : '<p class="lbl">Aucune section.</p>'
  }${tabErr('tips')}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-section">＋ section</button></div>${translateHtml()}</div>`;
}

// ------------------------------------------------------ « Notes »
function notesHtml() {
  const x = v();
  return `<div class="gd-stack">${
    x.notes.length
      ? x.notes
          .map(
            (t, i) => `<div class="card gd-card" data-card="note-${i}">
        <div class="card-head"><strong>Note ${i + 1}</strong><span class="lbl">un paragraphe</span><button class="btn icon" type="button" data-act="del-note" data-i="${i}" title="Retirer" aria-label="Retirer la note ${i + 1}">✕</button></div>
        <div class="gd-body">${textHtml(`notes.${i}`, t, { what: `Note ${i + 1}`, bad: refusedAt('notes', i) })}</div>
      </div>`,
          )
          .join('')
      : '<p class="lbl">Aucune note.</p>'
  }${tabErr('notes')}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-note">＋ note</button></div>${translateHtml()}</div>`;
}

// ------------------------------------------------------ les persos
/** Une tuile de perso, par son nom d'affichage anglais : sa vignette, son nom dessous, ✕. */
function heroHtml(name, act, more = '') {
  const c = heroByName(name);
  return `<span class="gd-hero${c ? '' : ' unknown'}" title="${esc(c ? c.name : `« ${name} » : hors du roster`)}">${heroTile(
    state,
    c ?? { name },
    { name: true },
  )}<button class="btn icon" type="button" data-act="${act}" data-name="${esc(name)}" ${more} title="Retirer" aria-label="Retirer ${esc(name)}">✕</button></span>`;
}
/** Une rangée de persos (un groupe, un slot) et son « ＋ héros ». */
const heroesHtml = (names, act, addAct, more = '') =>
  `<div class="gd-heroes">${names.map((n) => heroHtml(n, act, more)).join('')}<button class="btn ghost sm" type="button" data-act="${addAct}" ${more} aria-haspopup="dialog">＋ héros</button></div>`;

/** Un groupe de persos recommandés : ses tuiles, sa raison. */
const groupHtml = (g, key, i, more, bad) =>
  `<div class="card gd-card gd-group${bad.length ? ' ko' : ''}" ${more}>
    <div class="card-head"><strong>Groupe ${i + 1}</strong><button class="btn icon" type="button" data-act="del-group" ${more} title="Retirer le groupe" aria-label="Retirer le groupe ${i + 1}">✕</button></div>
    <div class="gd-body">${heroesHtml(g.characters, 'del-hero', 'add-hero', more)}${textHtml(`${key}.reason`, (g.reason ??= { [def()]: '' }), { what: `Raison du groupe ${i + 1}`, placeholder: 'Pourquoi ces persos (facultatif)…', bad: bad.filter((r) => r.field !== 'title') })}</div>
  </div>`;

function recoHtml() {
  const x = v();
  if (spec().recoSections)
    return `<div class="gd-stack">${
      x.recoSections.length
        ? x.recoSections
            .map(
              (s, si) => `<div class="card gd-card gd-section" data-card="reco-${si}">
        <div class="card-head"><strong>Section ${si + 1}</strong><button class="btn icon" type="button" data-act="del-reco-section" data-s="${si}" title="Retirer la section" aria-label="Retirer la section ${si + 1}">✕</button></div>
        <div class="gd-body">${titleField(`reco.${si}.title`, s, 'de la section', si)}
          <div class="gd-stack">${s.groups.map((g, i) => groupHtml(g, `reco.${si}.${i}`, i, `data-s="${si}" data-i="${i}"`, refusedAt('reco', si))).join('')}</div>
          <div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-group" data-s="${si}">＋ groupe</button></div>
        </div>
      </div>`,
            )
            .join('')
        : '<p class="lbl">Aucune section.</p>'
    }${tabErr('reco')}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-reco-section">＋ section</button></div>${translateHtml()}</div>`;
  return `<div class="gd-stack">${
    x.recommended.length
      ? x.recommended
          .map((g, i) => groupHtml(g, `reco.${i}`, i, `data-i="${i}"`, refusedAt('reco', i)))
          .join('')
      : '<p class="lbl">Aucun groupe.</p>'
  }${tabErr('reco')}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-group">＋ groupe</button></div>${translateHtml()}</div>`;
}

// ------------------------------------------------------ « Équipe »
/** Les slots d'une équipe : une rangée par slot (ses alternatives), ✕, « ＋ slot ». */
const slotsHtml = (t, ti) =>
  `<div class="gd-slots">${t.slots
    .map(
      (slot, si) =>
        `<div class="gd-slot"><span class="lbl">${si + 1}</span>${heroesHtml(slot, 'del-hero', 'add-hero', `data-i="${ti}" data-slot="${si}"`)}<button class="btn icon" type="button" data-act="del-slot" data-i="${ti}" data-slot="${si}" title="Retirer le slot" aria-label="Retirer le slot ${si + 1}">✕</button></div>`,
    )
    .join('')}${
    t.slots.length < MAX_SLOTS
      ? `<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-slot" data-i="${ti}">＋ slot</button></div>`
      : ''
  }</div>`;

function teamHtml() {
  const x = v();
  const kind = spec().teams;
  const word = {
    buckets: 'plage de stages',
    sections: 'équipe (phase)',
    named: 'équipe',
    slots: 'équipe',
  }[kind];
  if (kind === 'slots') {
    const t = (x.teams[0] ??= { slots: [] });
    return `<div class="gd-stack"><div class="card gd-card${refusedAt('team', 0).length ? ' ko' : ''}" data-card="team-0">
      <div class="card-head"><strong>Équipe</strong><span class="lbl">${MAX_SLOTS} slots au plus ; une ligne = les alternatives d’un slot</span></div>
      <div class="gd-body">${slotsHtml(t, 0)}${errHtml(refusedAt('team', 0).filter((r) => !r.field))}${textHtml('team.0.note', (t.note ??= { [def()]: '' }), { what: 'Note d’équipe', placeholder: 'Note (facultatif)…', bad: refusedAt('team', 0, 'note') })}</div>
    </div>${tabErr('team')}${translateHtml()}</div>`;
  }
  return `<div class="gd-stack">${
    x.teams.length
      ? x.teams
          .map((t, i) => {
            const bad = refusedAt('team', i);
            const head =
              kind === 'buckets'
                ? `<span class="lbl">Stages</span><input class="w-qty" type="number" min="1" data-stage="0" data-i="${i}" value="${esc(t.stages?.[0] ?? 1)}" aria-label="Premier stage" /><span class="lbl">→</span><input class="w-qty" type="number" min="1" data-stage="1" data-i="${i}" value="${esc(t.stages?.[1] ?? 1)}" aria-label="Dernier stage" />`
                : `<strong>${kind === 'sections' ? 'Phase' : 'Équipe'} ${i + 1}</strong>`;
            const note =
              kind === 'named'
                ? blockHtml(`team.${i}.notes`, (t.notes ??= []), {
                    what: `Note de l’équipe ${i + 1}`,
                    placeholder: 'Un paragraphe par ligne…',
                    bad: bad.filter((r) => r.field !== 'title'),
                  })
                : textHtml(`team.${i}.note`, (t.note ??= { [def()]: '' }), {
                    what: `Note de l’équipe ${i + 1}`,
                    placeholder: 'Note (facultatif)…',
                    bad: bad.filter((r) => r.field === 'note'),
                  });
            return `<div class="card gd-card${bad.length ? ' ko' : ''}" data-card="team-${i}">
        <div class="card-head">${head}<button class="btn icon" type="button" data-act="del-team" data-i="${i}" title="Retirer" aria-label="Retirer l’${word} ${i + 1}">✕</button></div>
        <div class="gd-body">${kind === 'buckets' ? '' : titleField(`team.${i}.title`, t, 'de l’équipe', i)}${slotsHtml(t, i)}${errHtml(bad.filter((r) => !r.field))}${note}</div>
      </div>`;
          })
          .join('')
      : `<p class="lbl">Aucune ${word}.</p>`
  }${tabErr('team')}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="add-team">＋ ${word}</button></div>${translateHtml()}</div>`;
}

// ------------------------------------------------------ « Vidéos »
// « ＋ vidéo » : le formulaire partagé avec la Fiche perso, plus le libellé
// d'onglet. La vidéo résolue se pose en fin de liste de la version MONTRÉE —
// chaque version a la sienne — et part avec « Enregistrer ».
const vidAdd = videoAdder({
  root: $('gd-panel'),
  id: 'gd-va',
  label: true,
  has: (id) => Boolean(v()?.videos.some((vid) => vid.id === id)),
  scope: () => v(),
  onAdd: (vid, label) => {
    // `author` : YouTube seul le rend.
    v().videos.push({
      platform: vid.platform,
      id: vid.id,
      title: vid.title,
      ...(vid.author ? { author: vid.author } : {}),
      ...(label ? { label } : {}),
    });
    forgive('videos');
    render();
    $('gd-panel').querySelector('#gd-va [data-va="url"]')?.focus();
  },
});

function videosHtml() {
  const x = v();
  return `<div class="gd-stack"><div class="card gd-card" data-card="videos">
    <div class="card-head"><strong>Vidéos</strong><span class="badge off">${x.videos.length}</span></div>
    <div class="gd-body">${
      x.videos.length
        ? `<ul class="gd-videos">${x.videos
            .map(
              (vid, i) =>
                `<li><span class="gd-vt">${esc(vid.title || vid.id)}</span><span class="lbl">${esc([vid.author, vid.platform ?? 'youtube', vid.id].filter(Boolean).join(' · '))}</span>${
                  vid.label ? `<span class="badge off">${esc(vid.label)}</span>` : ''
                }<button class="btn icon" type="button" data-act="del-video" data-i="${i}" title="Retirer" aria-label="Retirer ${esc(vid.title || vid.id)}">✕</button></li>`,
            )
            .join('')}</ul>`
        : '<p class="lbl">aucune vidéo</p>'
    }${tabErr('videos')}</div>
  </div>
  <div class="card gd-card">
    <div class="card-head"><strong>Ajouter une vidéo</strong><span class="lbl">YouTube, Twitch ou Bilibili — elle part avec « Enregistrer »</span></div>
    <div class="gd-body">${vidAdd.html()}</div>
  </div></div>`;
}

// ------------------------------------------------------ le guild raid (F33)
// Un guild raid n'a pas la forme des autres guides de boss : deux phases, trois
// combats, quatre fichiers par version. Sa version voyage dans `raid` du
// brouillon — au GABARIT (`guild-raid-draft.ts` : builds en `requirements`,
// notes en `p` / `ul`, `element` ou `icon`, `author` des vidéos), elle
// s'édite ; à l'ANCIEN FORMAT (`legacy` : ses écarts, ses fichiers), elle se
// lit sous un bandeau et aucun enregistrement ne la réécrit. Sous-onglets :
// Combat (les trois `group` de la version), Phase 1 (les deux sous-boss),
// Phase 2 (les équipes, une à la fois, dans un ordre réordonnable).
/** Les deux sous-boss : leur clé dans le brouillon, leur combat, leur fichier, leur nom. */
const R_BOSSES = [
  { key: 'bossA', group: 'subA', label: 'Sous-boss A' },
  { key: 'bossB', group: 'subB', label: 'Sous-boss B' },
];
/** Les combats d'une version, dans l'ordre de `config.json` : leur clé, leur rôle. */
const R_GROUPS = [
  { key: 'subA', label: 'Sous-boss A', main: false },
  { key: 'subB', label: 'Sous-boss B', main: false },
  { key: 'main', label: 'Boss principal', main: true },
];
const R_STAT = {
  spd: 'SPD',
  eff: 'EFF',
  atk: 'ATK',
  def: 'DEF',
  hp: 'HP',
  chc: 'CHC',
  chd: 'CHD',
  trans: 'Trans.',
};
/** L'équipement d'un build : son libellé, le tag de son token, la liste de `refs` qui le propose. */
const R_EQUIP = {
  weapon: { label: 'Arme', tag: 'I-W', refs: 'weapon' },
  amulet: { label: 'Amulette', tag: 'I-A', refs: 'amulet' },
  talisman: { label: 'Talisman', tag: 'I-T', refs: 'talisman' },
  set: { label: 'Set', tag: 'AS', refs: 'set' },
  ee: { label: 'EE' },
};
/** Le nom d'un champ refusé (`GuideRefusal.field`), en clair. */
const R_FIELD = {
  title: 'titre',
  badge: 'badge',
  slots: 'postes',
  geas: 'geas',
  notes: 'notes',
  recommended: 'persos recommandés',
  teamNote: 'note d’équipe',
  buildsNote: 'note des builds',
  video: 'vidéo',
};

let rTeam = 0; // l'équipe de phase 2 montrée (index dans `raid().teams`)
let rVid = ''; // le logement où « ＋ vidéo » est ouvert (`bossA`, `teams.2`), ou rien
const tokens = new Map(); // au dessin : clé d'une chaîne nue à prévisualiser → la chaîne

const raid = () => v()?.raid;
const rLegacy = (r = raid()) => Boolean(r && 'legacy' in r);
const rOpts = () => sheet.options.raid;
const rGroup = (key, group) =>
  (key === 'main' ? rOpts().mains : rOpts().subs).find((o) => o.group === group);

/**
 * Une version de guild raid telle qu'elle partirait : les clés du gabarit, les
 * textes nettoyés — ce que la savebar compare au disque. Un poste vidé RESTE
 * (le serveur le refuse : il se retire par son ✕) ; une version à l'ancien
 * format ne part pas, le serveur garde celle du disque.
 */
function raidOut(r) {
  if (rLegacy(r)) return { legacy: true };
  const list = (texts) => (texts ?? []).filter(hasText).map(textOut);
  const names = (all) => all.map((n) => n.trim()).filter(Boolean);
  const opt = (key, t) => (optText(t) ? { [key]: optText(t) } : {});
  const boss = (b) => ({
    notes: list(b.notes),
    recommended: b.recommended
      .map((g) => ({ characters: names(g.characters), ...opt('reason', g.reason) }))
      .filter((g) => g.characters.length || g.reason),
    slots: b.slots.map(names),
    ...opt('teamNote', b.teamNote),
    ...(b.video ? { video: b.video } : {}),
  });
  const build = (e) => {
    const stats = Object.fromEntries(Object.entries(e.stats ?? {}).filter(([, s]) => s.trim()));
    const equipment = Object.fromEntries(
      Object.entries(e.equipment ?? {})
        .map(([k, lines]) => [k, lines.filter((s) => s.trim())])
        .filter(([, lines]) => lines.length),
    );
    const prio = (e.prio ?? []).filter((s) => s.trim());
    return {
      character: e.character,
      ...(Object.keys(stats).length ? { stats } : {}),
      ...(prio.length ? { prio } : {}),
      ...(Object.keys(equipment).length ? { equipment } : {}),
      ...(list(e.notes).length ? { notes: list(e.notes) } : {}),
    };
  };
  return {
    ...(r.subA ? { subA: r.subA } : {}),
    ...(r.subB ? { subB: r.subB } : {}),
    ...(r.main ? { main: r.main } : {}),
    bossA: boss(r.bossA),
    bossB: boss(r.bossB),
    teams: r.teams.map((t) => ({
      title: textOut(t.title),
      ...(t.element ? { element: t.element } : t.icon?.trim() ? { icon: t.icon.trim() } : {}),
      slots: t.slots.map(names),
      geas: { bonus: [...t.geas.bonus], malus: [...t.geas.malus] },
      builds: t.builds.map(build),
      ...opt('buildsNote', t.buildsNote),
      notes: t.notes
        .map((b) => ('ul' in b ? { ul: list(b.ul) } : { p: textOut(b.p) }))
        .filter((b) => ('ul' in b ? b.ul.length : hasText(b.p))),
      ...(t.video ? { video: t.video } : {}),
    })),
  };
}

/** Les textes d'un sous-boss, d'une équipe — les OBJETS (la traduction écrit dedans). */
const rBossTexts = (b) =>
  [...b.notes, ...b.recommended.map((g) => g.reason), b.teamNote].filter(Boolean);
const rTeamTexts = (t) =>
  [
    t.title,
    t.buildsNote,
    ...t.builds.flatMap((e) => e.notes ?? []),
    ...t.notes.flatMap((b) => ('ul' in b ? b.ul : [b.p])),
  ].filter(Boolean);
/** Les textes d'une phase d'une version au gabarit : TOUS, l'équipe montrée et les autres. */
function rTexts(r, tab) {
  if (!r || rLegacy(r)) return [];
  const one = tab !== 'phase2' ? R_BOSSES.flatMap((b) => rBossTexts(r[b.key])) : [];
  const two = tab !== 'phase1' ? r.teams.flatMap(rTeamTexts) : [];
  return [...one, ...two];
}

/** Le bandeau d'une version à l'ancien format : pourquoi, et ce que ça implique. */
function rBanner() {
  const r = raid();
  if (!rLegacy(r)) return '';
  const shown = r.legacy.slice(0, 3);
  const more = r.legacy.length - shown.length;
  return `<div class="card pad gd-legacy" role="note">
    <div class="form"><span class="badge warn">ancien format</span><strong>Version ${esc(v().key)} : ancien format, non éditable dans quick.</strong></div>
    <span class="lbl">Elle se lit ici ; aucun enregistrement ne la réécrit. Ce qui l’écarte du gabarit : ${esc(shown.join(' ; '))}${more > 0 ? ` ; et ${more} de plus` : ''}.</span>
  </div>`;
}

/** Les refus d'une carte (un sous-boss, une équipe) qu'aucun champ ne montre sous lui. */
const rErr = (bad) =>
  bad.length
    ? `<p class="gd-err">${esc(
        bad
          .map((x) => {
            const [, kind, n] = /^(build|note)\.(\d+)$/.exec(x.field ?? '') ?? [];
            const where = kind ? `${kind} ${Number(n) + 1}` : (R_FIELD[x.field] ?? x.field);
            return where ? `${where} : ${x.reason}` : x.reason;
          })
          .join(' ; '),
      )}</p>`
    : '';

// --- Combat
function rBattleHtml() {
  const r = raid();
  const old = rLegacy(r);
  const cfg = old ? (r.files.config ?? {}) : r;
  const bad = refusedIn('battle');
  const row = ({ key, label }) => {
    const group = typeof cfg[key] === 'string' ? cfg[key] : '';
    const g = rGroup(key, group);
    const none = old
      ? '<span class="lbl">aucun combat</span>'
      : '<span class="gd-ko">Un combat est requis.</span>';
    return `<div class="gd-battle gd-rgroup" data-rgroup="${key}"><span class="lbl gd-rrole">${label}</span>${
      group
        ? `${g?.icon ? `<img src="${srcAt(g.icon)}" alt="" aria-hidden="true" width="36" height="36" />` : ''}<strong>${esc(g?.label ?? group)}</strong><span class="mono lbl">${esc(group)}</span>`
        : none
    }${
      old
        ? ''
        : `<button class="btn ghost sm" type="button" data-act="raid" data-do="pick-group" data-k="${key}" aria-haspopup="dialog">${group ? 'Changer…' : 'Choisir un combat…'}</button>`
    }${errHtml(bad.filter((x) => x.field === key))}</div>`;
  };
  const pins = old
    ? ''
    : `<div class="card gd-card" data-card="pins">
        <div class="card-head"><strong>État des boss pour ${esc(v().key)}</strong><span class="lbl">live, ou une archive figée — se dépingle ici, s’épingle depuis l’extractor</span></div>
        <div class="gd-body">${
          sheet.pins.length
            ? sheet.pins.map(pinHtml).join('')
            : '<p class="lbl">Aucun combat sur ce guide : rien à épingler.</p>'
        }</div>
      </div>`;
  return `<div class="gd-stack">${rBanner()}<div class="card gd-card" data-card="battle">
    <div class="card-head"><strong>Combats de ${esc(v().key)}</strong><span class="lbl">ceux de la version : deux sous-boss (phase 1, leurs geas), le boss principal (phase 2)</span></div>
    <div class="gd-body">${R_GROUPS.map(row).join('')}</div>
  </div>${pins}${errHtml(bad.filter((x) => !x.field))}</div>`;
}

// --- Les briques partagées des deux phases
/** Des persos en LECTURE : leurs tuiles, sans geste. */
const rTiles = (names) =>
  `<div class="gd-heroes">${names
    .map((n) => {
      const c = heroByName(n);
      return `<span class="gd-hero${c ? '' : ' unknown'}">${heroTile(state, c ?? { name: n }, { name: true })}</span>`;
    })
    .join('')}</div>`;
/** Une rangée de persos (un groupe, un poste) à `path` dans la version, et son « ＋ héros ». */
const rHeroes = (names, path) =>
  `<div class="gd-heroes">${names
    .map((n) => {
      const c = heroByName(n);
      return `<span class="gd-hero${c ? '' : ' unknown'}" title="${esc(c ? c.name : `« ${n} » : hors du roster`)}">${heroTile(
        state,
        c ?? { name: n },
        { name: true },
      )}<button class="btn icon" type="button" data-act="raid" data-do="del-hero" data-path="${path}" data-name="${esc(n)}" title="Retirer" aria-label="Retirer ${esc(n)}">✕</button></span>`;
    })
    .join(
      '',
    )}<button class="btn ghost sm" type="button" data-act="raid" data-do="add-hero" data-path="${path}" aria-haspopup="dialog">＋ héros</button></div>`;
/** Les postes d'une équipe : une rangée numérotée par poste (ses alternatives), ✕, « ＋ poste ». */
const rSlots = (slots, path) =>
  `<div class="gd-slots">${slots
    .map(
      (slot, si) =>
        `<div class="gd-slot"><span class="lbl">${si + 1}</span>${rHeroes(slot, `${path}.${si}`)}<button class="btn icon" type="button" data-act="raid" data-do="del" data-path="${path}" data-i="${si}" title="Retirer le poste" aria-label="Retirer le poste ${si + 1}">✕</button></div>`,
    )
    .join('')}${
    slots.length < rOpts().maxSlots
      ? `<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="raid" data-do="add-slot" data-path="${path}">＋ poste</button></div>`
      : ''
  }</div>`;
/** Une section d'une carte : son titre en capitales grises, une indication, son corps. */
const rSec = (title, hint, body) =>
  `<div class="gd-rsec"><div class="gd-rh"><span>${title}</span>${hint ? `<span class="lbl">${hint}</span>` : ''}</div>${body}</div>`;
/** ↑ ↓ ✕ d'une ligne d'une liste ordonnée à `path`. */
const rMoves = (path, i, count, what) =>
  `<button class="btn icon" type="button" data-act="raid" data-do="move" data-path="${path}" data-i="${i}" data-d="-1" title="Monter" aria-label="Monter ${what}"${i ? '' : ' disabled'}>↑</button><button class="btn icon" type="button" data-act="raid" data-do="move" data-path="${path}" data-i="${i}" data-d="1" title="Descendre" aria-label="Descendre ${what}"${i < count - 1 ? '' : ' disabled'}>↓</button><button class="btn icon" type="button" data-act="raid" data-do="del" data-path="${path}" data-i="${i}" title="Retirer" aria-label="Retirer ${what}">✕</button>`;

// « ＋ vidéo » d'un sous-boss ou d'une équipe : le formulaire partagé, dans le
// logement ouvert (`rVid`). UNE vidéo par logement ; son `author` vient de
// YouTube et se corrige dans son champ.
const raidVid = videoAdder({
  root: $('gd-panel'),
  id: 'gd-rva',
  has: () => false,
  scope: () => `${v()?.key} ${rVid}`,
  onAdd: (vid) => {
    const owner = getAt(raid(), pathOf(rVid));
    if (!owner) return;
    owner.video = {
      platform: vid.platform,
      id: vid.id,
      title: vid.title,
      ...(vid.author ? { author: vid.author } : {}),
    };
    const path = rVid;
    rVid = '';
    forgive(sub);
    render();
    $('gd-panel').querySelector(`[data-rauthor="${path}"]`)?.focus();
  },
});
/** La vidéo d'un logement (`path` : `bossA`, `teams.2`) : sa ligne et son auteur, ou « ＋ vidéo ». */
function rVideo(owner, path) {
  const vid = owner.video;
  if (vid)
    return `<ul class="gd-videos"><li><span class="gd-vt">${esc(vid.title || vid.id || 'vidéo sans id')}</span><span class="lbl">${esc([vid.platform ?? 'youtube', vid.id || 'id vide'].join(' · '))}</span><label class="gd-rauthor"><span class="lbl">Auteur</span><input class="w-text" data-rauthor="${path}" value="${esc(vid.author ?? '')}" placeholder="chaîne ou pseudo" autocomplete="off" /></label><button class="btn icon" type="button" data-act="raid" data-do="del-video" data-path="${path}" title="Retirer" aria-label="Retirer la vidéo">✕</button></li></ul>`;
  return rVid === path
    ? `${raidVid.html()}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="raid" data-do="close-video">annuler</button><span class="lbl">Elle part avec « Enregistrer ».</span></div>`
    : `<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="raid" data-do="open-video" data-path="${path}">＋ vidéo</button></div>`;
}

// --- Phase 1
function rPhase1Html() {
  const r = raid();
  if (rLegacy(r)) return rOldPhase1(r);
  const card = (b, bi) => {
    const boss = r[b.key];
    const bad = refusedAt('phase1', bi);
    const g = rGroup(b.group, r[b.group]);
    const at = (field) => bad.filter((x) => x.field === field);
    const groups = boss.recommended
      .map(
        (grp, gi) =>
          `<div class="gd-rgroup-row" data-reco="${gi}">${rHeroes(grp.characters, `${b.key}.recommended.${gi}.characters`)}<button class="btn icon" type="button" data-act="raid" data-do="del" data-path="${b.key}.recommended" data-i="${gi}" title="Retirer le groupe" aria-label="Retirer le groupe ${gi + 1}">✕</button>${textHtml(
            `p1.${bi}.reco.${gi}`,
            (grp.reason ??= { [def()]: '' }),
            {
              what: `Raison du groupe ${gi + 1}, ${b.label}`,
              placeholder: 'Pourquoi ces persos (facultatif)…',
            },
          )}</div>`,
      )
      .join('');
    return `<div class="card gd-card${bad.length ? ' ko' : ''}" data-card="boss-${bi}">
      <div class="card-head">${g?.icon ? `<img class="gd-rico" src="${srcAt(g.icon)}" alt="" aria-hidden="true" width="28" height="28" />` : ''}<strong>${b.label}</strong><span class="lbl">${esc(g?.label ?? r[b.group] ?? 'aucun combat')}</span></div>
      <div class="gd-body">
        ${rSec('Notes', 'un paragraphe par ligne', blockHtml(`p1.${bi}.notes`, boss.notes, { what: `Notes du ${b.label}`, placeholder: 'Un paragraphe par ligne…', bad: at('notes') }))}
        ${rSec('Persos recommandés', 'un groupe = des persos et leur raison', `${groups}${rErr(at('recommended'))}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="raid" data-do="add-group" data-path="${b.key}.recommended">＋ groupe</button></div>`)}
        ${rSec('Équipe', `${rOpts().maxSlots} postes au plus ; une ligne = les alternatives d’un poste`, `${rSlots(boss.slots, `${b.key}.slots`)}${rErr(at('slots'))}${textHtml(`p1.${bi}.teamNote`, (boss.teamNote ??= { [def()]: '' }), { what: `Note d’équipe, ${b.label}`, placeholder: 'Note (facultatif)…', bad: at('teamNote') })}`)}
        ${rSec('Vidéo', '', `${rVideo(boss, b.key)}${rErr(at('video'))}`)}
      </div>
    </div>`;
  };
  return `<div class="gd-stack">${R_BOSSES.map(card).join('')}${tabErr('phase1')}${translateHtml()}</div>`;
}

// --- Phase 2
const rPoints = (p) => `${p > 0 ? '+' : ''}${p / 10}%`;
/** La pastille d'une équipe : son élément, ou son sprite d'effet. */
function rBadge(t) {
  const path = t.element
    ? `ui/elem/IG_Turn_Element_${t.element[0].toUpperCase()}${t.element.slice(1)}`
    : t.icon?.trim()
      ? `ui/effect/${t.icon.trim()}`
      : '';
  return path
    ? `<img class="gd-rbadge" src="${src(esc(path))}" alt="" aria-hidden="true" width="20" height="20" />`
    : '';
}
/** Le pool d'une version : les geas que ses deux sous-boss débloquent, une fois chacun. */
function rPool(r) {
  const seen = new Set();
  return [...(rOpts().geas[r.subA] ?? []), ...(rOpts().geas[r.subB] ?? [])].filter((c) =>
    seen.has(c.id) ? false : (seen.add(c.id), true),
  );
}
/** Les geas d'une équipe : le pool en deux colonnes (bonus, malus de score), ceux actifs enfoncés. */
function rGeasHtml(t, r) {
  const pool = rPool(r);
  const active = new Set([...t.geas.bonus, ...t.geas.malus]);
  const stray = [...active].filter((id) => !pool.some((c) => c.id === id));
  const one = (c) =>
    `<button class="gd-geas" type="button" data-act="raid" data-do="geas" data-id="${esc(c.id)}" aria-pressed="${active.has(c.id)}" title="geas ${esc(c.id)} — palier ${c.kill}"><span class="gd-gico"><img src="${srcAt(c.frame)}" alt="" aria-hidden="true" width="36" height="36" />${c.icon ? `<img class="${c.positive ? 'aid' : 'harm'}" src="${srcAt(c.icon)}" alt="" aria-hidden="true" />` : ''}</span><span class="gd-gtext">${esc(c.text)}</span><span class="gd-gpts ${c.bonus ? 'up' : 'down'}">${rPoints(c.points)}</span></button>`;
  const col = (title, list) =>
    `<div class="gd-gcol"><div class="gd-rh"><span>${title}</span><span class="badge off">${list.filter((c) => active.has(c.id)).length} / ${list.length}</span></div>${list.map(one).join('')}</div>`;
  const byKill = (a, b) => a.kill - b.kill;
  return `${
    pool.length
      ? `<div class="gd-geas-cols">${col('Bonus de score', pool.filter((c) => c.bonus).sort(byKill))}${col('Malus de score', pool.filter((c) => !c.bonus).sort(byKill))}</div>`
      : '<p class="gd-ko">Aucun geas déblocable : les sous-boss de la version n’ont pas de table de geas (onglet Combat).</p>'
  }${
    stray.length
      ? `<div class="chips">${stray.map((id) => `<span class="chip gd-stray">geas ${esc(id)} — hors du pool de la version<button class="btn icon" type="button" data-act="raid" data-do="geas" data-id="${esc(id)}" aria-label="Retirer le geas ${esc(id)}">✕</button></span>`).join('')}</div>`
      : ''
  }`;
}
/** Le build d'un perso : ses stats, sa priorité, son équipement en tokens, ses notes. */
function rBuildHtml(e, ti, bi, count) {
  const key = `p2.${ti}.b${bi}`;
  const c = heroByName(e.character);
  const bad = refusedAt('phase2', ti, `build.${bi}`);
  const stat = (k) =>
    `<label class="gd-rstat"><span class="lbl">${R_STAT[k] ?? k}</span><input data-rstat="${k}" data-b="${bi}" value="${esc(e.stats?.[k] ?? '')}" autocomplete="off" aria-label="${R_STAT[k] ?? k} de ${esc(e.character)}" /></label>`;
  const prio = (e.prio ?? []).join(' > ');
  tokens.set(`${key}.prio`, (e.prio ?? []).join(' › '));
  const equip = rOpts()
    .equipment.map((k) => {
      const lines = e.equipment?.[k] ?? [];
      const meta = R_EQUIP[k] ?? { label: k };
      tokens.set(`${key}.${k}`, lines.join(', '));
      return `<div class="gd-requip"><div class="gd-rh"><span>${meta.label}</span>${
        meta.tag
          ? `<button class="btn ghost sm" type="button" data-act="raid" data-do="pick-token" data-kind="${k}" data-b="${bi}" aria-haspopup="dialog" title="Insérer un token {${meta.tag}/…}">＋</button>`
          : ''
      }</div><textarea class="mono" rows="${Math.max(2, lines.length)}" data-requip="${k}" data-b="${bi}" placeholder="une option par ligne" aria-label="${meta.label} de ${esc(e.character)}, une option par ligne">\n${esc(lines.join('\n'))}</textarea><p class="gd-pv pv-note${pv.busy ? ' busy' : ''}" data-pv="${esc(`${key}.${k}`)}">${pvBody(`${key}.${k}`)}</p></div>`;
    })
    .join('');
  return `<div class="gd-rbuild${bad.length ? ' ko' : ''}" data-build="${bi}">
    <div class="gd-rbuild-head"><span class="gd-hero${c ? '' : ' unknown'}" title="${esc(c ? c.name : `« ${e.character} » : hors du roster`)}">${heroTile(state, c ?? { name: e.character }, { name: true })}</span>
      <div class="gd-rstats">${rOpts().stats.map(stat).join('')}</div>
      <span class="gd-rmoves">${rMoves(`teams.${ti}.builds`, bi, count, `le build de ${esc(e.character)}`)}</span>
    </div>
    ${rErr(bad)}
    <div class="gd-rprio"><div class="gd-rh"><span>Priorité de stats</span><button class="btn ghost sm" type="button" data-act="raid" data-do="pick-token" data-kind="prio" data-b="${bi}" aria-haspopup="dialog" title="Ajouter un token {S/…}">＋</button></div><input class="mono" data-rprio data-b="${bi}" value="${esc(prio)}" placeholder="{S/ATK} > {S/CHC}" autocomplete="off" aria-label="Priorité de stats de ${esc(e.character)}, séparées par >" /><p class="gd-pv pv-note${pv.busy ? ' busy' : ''}" data-pv="${esc(`${key}.prio`)}">${pvBody(`${key}.prio`)}</p></div>
    <div class="gd-requips">${equip}</div>
    ${blockHtml(`${key}.notes`, (e.notes ??= []), { what: `Notes du build de ${e.character}`, placeholder: 'Une note par ligne…' })}
  </div>`;
}
function rTeamHtml(t, ti, r) {
  const bad = refusedAt('phase2', ti);
  const at = (field) => bad.filter((x) => x.field === field);
  const kind = t.element ? t.element : t.icon !== undefined ? 'icon' : '';
  const icons = [
    ...new Set(
      draft.versions.flatMap((x) =>
        x.raid && !rLegacy(x.raid) ? x.raid.teams.map((y) => y.icon?.trim()).filter(Boolean) : [],
      ),
    ),
  ].sort();
  const badge = `<div class="form"><div class="field"><label for="gd-rkind">Badge</label><select id="gd-rkind" data-rkind>
      <option value=""${kind ? '' : ' selected'}>aucun</option>${rOpts()
        .elements.map(
          (el) => `<option value="${el}"${kind === el ? ' selected' : ''}>${el}</option>`,
        )
        .join(
          '',
        )}<option value="icon"${kind === 'icon' ? ' selected' : ''}>sprite d’effet…</option></select></div>${
        kind === 'icon'
          ? `<div class="field"><label for="gd-ricon">Sprite d’effet</label><input id="gd-ricon" class="w-text mono" data-ricon list="gd-ricons" value="${esc(t.icon ?? '')}" placeholder="IG_Buff_Dot_Burn" autocomplete="off" /><datalist id="gd-ricons">${icons.map((i) => `<option value="${esc(i)}"></option>`).join('')}</datalist></div>`
          : ''
      }<span class="gd-rbadge-pv" data-rbadge>${rBadge(t)}</span></div>${rErr(at('badge'))}`;
  const builds = t.builds.map((e, bi) => rBuildHtml(e, ti, bi, t.builds.length)).join('');
  const notes = t.notes
    .map((b, ni) => {
      const list = 'ul' in b;
      const opts = {
        what: `${list ? 'Liste' : 'Paragraphe'} ${ni + 1} de l’équipe`,
        bad: at(`note.${ni}`),
      };
      return `<div class="gd-rnote" data-note="${ni}"><div class="gd-rh"><span>${list ? 'Liste à puces' : 'Paragraphe'}</span><span class="gd-rmoves">${rMoves(`teams.${ti}.notes`, ni, t.notes.length, `la note ${ni + 1}`)}</span></div>${
        list
          ? blockHtml(`p2.${ti}.n${ni}`, b.ul, { ...opts, placeholder: 'Une puce par ligne…' })
          : textHtml(`p2.${ti}.n${ni}`, b.p, opts)
      }</div>`;
    })
    .join('');
  const active = t.geas.bonus.length + t.geas.malus.length;
  return `<div class="card gd-card${bad.length ? ' ko' : ''}" data-card="team-${ti}">
    <div class="card-head"><strong>Équipe ${ti + 1}</strong><span class="lbl">${plural(t.slots.length, 'poste')} · ${active} geas · ${plural(t.builds.length, 'build')}</span><button class="btn icon" type="button" data-act="raid" data-do="move-team" data-d="-1" title="Avancer l’équipe" aria-label="Avancer l’équipe"${ti ? '' : ' disabled'}>←</button><button class="btn icon gd-rnext" type="button" data-act="raid" data-do="move-team" data-d="1" title="Reculer l’équipe" aria-label="Reculer l’équipe"${ti < r.teams.length - 1 ? '' : ' disabled'}>→</button><button class="btn icon gd-rnext" type="button" data-act="raid" data-do="del-team" title="Retirer l’équipe" aria-label="Retirer l’équipe ${ti + 1}">✕</button></div>
    <div class="gd-body">
      ${rSec('Titre', 'le nom de l’onglet de l’équipe, et sa pastille', `${textHtml(`p2.${ti}.title`, t.title, { what: `Titre de l’équipe ${ti + 1}`, line: true, placeholder: 'Titre (requis)', bad: at('title') })}${badge}`)}
      ${rSec('Postes', `${rOpts().maxSlots} au plus ; une ligne = les alternatives d’un poste`, `${rSlots(t.slots, `teams.${ti}.slots`)}${rErr(at('slots'))}`)}
      ${rSec('Geas actifs', 'ceux que les deux sous-boss de la version débloquent, rangés par le signe de leurs points comme sur le site', `${rGeasHtml(t, r)}${rErr(at('geas'))}`)}
      ${rSec('Builds', 'un par perso ; le site les trie par vitesse, un build sans SPD garde sa place', `${builds || '<p class="lbl">Aucun build.</p>'}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="raid" data-do="add-build" aria-haspopup="dialog">＋ build</button></div>${textHtml(`p2.${ti}.buildsNote`, (t.buildsNote ??= { [def()]: '' }), { what: 'Note de pied des builds', placeholder: 'Note de pied du tableau (facultatif)…', bad: at('buildsNote') })}`)}
      ${rSec('Notes', 'des paragraphes et des listes à puces, dans l’ordre', `${notes || '<p class="lbl">Aucune note.</p>'}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="raid" data-do="add-p">＋ paragraphe</button><button class="btn ghost sm" type="button" data-act="raid" data-do="add-ul">＋ liste</button></div>`)}
      ${rSec('Vidéo', '', `${rVideo(t, `teams.${ti}`)}${rErr(at('video'))}`)}
    </div>
  </div>`;
}
function rPhase2Html() {
  const r = raid();
  if (rLegacy(r)) return rOldPhase2(r);
  rTeam = Math.max(0, Math.min(rTeam, r.teams.length - 1));
  const tabs = r.teams
    .map(
      (t, i) =>
        `<button class="tab gd-rtab" type="button" role="tab" draggable="true" data-act="raid" data-do="show-team" data-i="${i}" aria-selected="${i === rTeam}">${rBadge(t)}<span>${esc(t.title[def()] || `Équipe ${i + 1}`)}</span>${
          refusedAt('phase2', i).length ? '<span class="dot ko" title="refusée"></span>' : ''
        }</button>`,
    )
    .join('');
  const t = r.teams[rTeam];
  return `<div class="gd-stack">
    <div class="gd-rbar"><div class="gd-rteams" role="tablist" aria-label="Équipes de phase 2">${tabs}</div><button class="btn ghost sm" type="button" data-act="raid" data-do="add-team">＋ équipe</button><span class="lbl">une équipe à la fois ; glisser un onglet, ou ← →, change l’ordre du site</span></div>
    ${t ? rTeamHtml(t, rTeam, r) : '<div class="empty">Aucune équipe : « ＋ équipe » pour commencer.</div>'}
    ${tabErr('phase2')}${translateHtml()}
  </div>`;
}

// --- Une version à l'ancien format, en lecture : ce que ses fichiers portent
const rText = (t) => esc(t?.[def()] ?? '');
const rOldVideo = (vid) =>
  vid
    ? `<p class="lbl">Vidéo : ${esc([vid.title || vid.id, vid.author, vid.platform ?? 'youtube'].filter(Boolean).join(' · '))}</p>`
    : '';
const rOldSlots = (slots) =>
  `<div class="gd-slots">${(slots ?? []).map((slot, si) => `<div class="gd-slot"><span class="lbl">${si + 1}</span>${rTiles(slot)}</div>`).join('')}</div>`;
function rOldPhase1(r) {
  const card = (b) => {
    const file = r.files[b.group];
    const g = rGroup(b.group, r.files.config?.[b.group]);
    const body = file
      ? `${(file.notes ?? []).map((t) => `<p class="gd-ro">${rText(t)}</p>`).join('')}${(
          file.recommended ?? []
        )
          .map(
            (grp) =>
              `<div class="gd-rgroup-row">${rTiles(grp.characters ?? [])}<p class="gd-ro">${rText(grp.reason)}</p></div>`,
          )
          .join(
            '',
          )}${file.team ? `${rOldSlots(file.team.slots)}<p class="gd-ro">${rText(file.team.note)}</p>` : ''}${rOldVideo(file.video)}`
      : '<p class="lbl">Aucun contenu.</p>';
    return `<div class="card gd-card gd-old" data-card="old-${b.key}"><div class="card-head"><strong>${b.label}</strong><span class="lbl">${esc(g?.label ?? 'aucun combat')}</span><span class="badge off">lecture</span></div><div class="gd-body">${body}</div></div>`;
  };
  return `<div class="gd-stack">${rBanner()}${R_BOSSES.map(card).join('')}</div>`;
}
function rOldPhase2(r) {
  const teams = r.files.main?.teams ?? [];
  const note = (b) => {
    if (b.turnOrder)
      return `<p class="gd-ro"><span class="badge warn">turnOrder</span> ${esc(b.turnOrder.map((s) => `${s.character} ${s.speed}`).join(' › '))}${b.note ? ` — ${rText(b.note)}` : ''}</p>`;
    if (b.ul) return `<ul class="gd-ro">${b.ul.map((t) => `<li>${rText(t)}</li>`).join('')}</ul>`;
    return `<p class="gd-ro">${rText(b.p)}</p>`;
  };
  const build = (e) =>
    `<li><strong>${esc(e.character)}</strong> <span class="lbl">${esc(
      [
        ...Object.entries(e.stats ?? {}).map(([k, s]) => `${R_STAT[k] ?? k} ${s}`),
        ...(e.prio?.length ? [`prio ${e.prio.join(' > ')}`] : []),
        ...Object.entries(e.equipment ?? {}).map(
          ([k, l]) => `${R_EQUIP[k]?.label ?? k} : ${l.join(', ')}`,
        ),
        ...(e.notes?.length ? [plural(e.notes.length, 'note')] : []),
      ].join(' · '),
    )}</span></li>`;
  const card = (t, i) => {
    const geas = (t.geasActive?.bonus?.length ?? 0) + (t.geasActive?.malus?.length ?? 0);
    const builds = t.requirements?.entries ?? [];
    return `<div class="card gd-card gd-old" data-card="old-team-${i}">
      <div class="card-head">${rBadge(t)}<strong>${rText(t.title) || `Équipe ${i + 1}`}</strong><span class="lbl">${plural((t.slots ?? []).length, 'poste')} · ${geas} geas · ${plural(builds.length, 'build')}</span><span class="badge off">lecture</span></div>
      <div class="gd-body">${rOldSlots(t.slots)}${builds.length ? `<ul class="gd-ro">${builds.map(build).join('')}</ul>${t.requirements.note ? `<p class="gd-ro">${rText(t.requirements.note)}</p>` : ''}` : ''}${(t.notes ?? []).map(note).join('')}${rOldVideo(t.video)}</div>
    </div>`;
  };
  return `<div class="gd-stack">${rBanner()}${teams.length ? teams.map(card).join('') : '<div class="empty">Aucune équipe.</div>'}</div>`;
}

// --- Les gestes
/** Les gestes d'un guild raid (`data-act="raid"`, `data-do`) sur la version montrée, au gabarit. */
function raidAct(el) {
  const r = raid();
  if (!r || rLegacy(r)) return undefined;
  const what = el.dataset.do;
  const { path } = el.dataset;
  const i = Number(el.dataset.i ?? -1);
  const t = r.teams[rTeam];
  const at = () => getAt(r, pathOf(path ?? ''));
  const redo = (focus) => {
    forgive(sub);
    render();
    if (focus) $('gd-panel').querySelector(focus)?.focus();
  };
  switch (what) {
    case 'pick-group': {
      const key = el.dataset.k;
      const main = key === 'main';
      return pickRows({
        title: main ? 'Choisir le boss principal' : 'Choisir un sous-boss',
        options: (main ? rOpts().mains : rOpts().subs).map((g) => ({
          id: g.group,
          name: g.label,
          icon: g.icon,
        })),
        chosen: r[key],
        placeholder: 'Chercher un combat de guild raid…',
        none: 'Aucun combat ne correspond.',
        opener: () => el,
        onPick: (group) => {
          r[key] = group;
          redo(`[data-do="pick-group"][data-k="${key}"]`);
        },
      });
    }
    case 'add-hero':
    case 'del-hero': {
      const names = at();
      if (!Array.isArray(names)) return undefined;
      const set = (next) => {
        names.length = 0;
        names.push(...next);
        redo(`[data-do="add-hero"][data-path="${path}"]`);
      };
      if (what === 'del-hero') return set(names.filter((n) => n !== el.dataset.name));
      return pickHeroes(names, () => el, set);
    }
    case 'add-slot': {
      const slots = at();
      if (!Array.isArray(slots) || slots.length >= rOpts().maxSlots) return undefined;
      slots.push([]);
      return redo(`[data-do="add-hero"][data-path="${path}.${slots.length - 1}"]`);
    }
    case 'add-group': {
      const groups = at();
      groups.push({ characters: [] });
      return redo(`[data-do="add-hero"][data-path="${path}.${groups.length - 1}.characters"]`);
    }
    case 'del':
      at()?.splice(i, 1);
      return redo();
    case 'move': {
      const list = at();
      const j = i + Number(el.dataset.d);
      if (!Array.isArray(list) || j < 0 || j >= list.length) return undefined;
      [list[i], list[j]] = [list[j], list[i]];
      return redo(`[data-do="move"][data-path="${path}"][data-i="${j}"][data-d="${el.dataset.d}"]`);
    }
    case 'show-team':
      if (i === rTeam) return undefined;
      rTeam = i;
      rVid = '';
      render();
      return $('gd-panel').querySelector(`.gd-rtab[data-i="${i}"]`)?.focus();
    case 'add-team':
      r.teams.push({
        title: { [def()]: '' },
        slots: [],
        geas: { bonus: [], malus: [] },
        builds: [],
        notes: [],
      });
      rTeam = r.teams.length - 1;
      rVid = '';
      return redo(`[data-key="p2.${rTeam}.title"]`);
    case 'del-team':
      if (
        !t ||
        !confirm(`Retirer l’équipe « ${t.title[def()] || rTeam + 1} » de la version ${v().key} ?`)
      )
        return undefined;
      r.teams.splice(rTeam, 1);
      rVid = '';
      return redo('[data-do="add-team"]');
    case 'move-team': {
      const j = rTeam + Number(el.dataset.d);
      if (!t || j < 0 || j >= r.teams.length) return undefined;
      [r.teams[rTeam], r.teams[j]] = [r.teams[j], r.teams[rTeam]];
      rTeam = j;
      rVid = '';
      return redo(`[data-do="move-team"][data-d="${el.dataset.d}"]`);
    }
    case 'geas': {
      const { id } = el.dataset;
      if (!t) return undefined;
      const on = t.geas.bonus.includes(id) || t.geas.malus.includes(id);
      t.geas.bonus = t.geas.bonus.filter((x) => x !== id);
      t.geas.malus = t.geas.malus.filter((x) => x !== id);
      // Le fichier range les aides (`positive`) en `bonus`, les handicaps en `malus`.
      const c = rPool(r).find((x) => x.id === id);
      if (!on && c) t.geas[c.positive ? 'bonus' : 'malus'].push(id);
      return redo(`[data-do="geas"][data-id="${id}"]`);
    }
    case 'add-build':
      if (!t) return undefined;
      return pickHero(
        () => el,
        undefined,
        (name) => {
          if (!t.builds.some((e) => e.character === name)) t.builds.push({ character: name });
          redo(
            `[data-build="${t.builds.findIndex((e) => e.character === name)}"] [data-rstat="spd"]`,
          );
        },
      );
    case 'add-p':
    case 'add-ul':
      if (!t) return undefined;
      t.notes.push(what === 'add-ul' ? { ul: [] } : { p: { [def()]: '' } });
      return redo(`[data-note="${t.notes.length - 1}"] textarea`);
    case 'open-video':
      rVid = path;
      raidVid.reset();
      render();
      return $('gd-panel').querySelector('#gd-rva [data-va="url"]')?.focus();
    case 'close-video':
      rVid = '';
      return render();
    case 'del-video': {
      const owner = at();
      if (owner) delete owner.video;
      return redo(`[data-do="open-video"][data-path="${path}"]`);
    }
    case 'pick-token': {
      const e = t?.builds[Number(el.dataset.b)];
      const { kind } = el.dataset;
      const meta = kind === 'prio' ? { label: 'Stat', tag: 'S', refs: 'stat' } : R_EQUIP[kind];
      if (!e || !meta?.tag) return undefined;
      return pickRows({
        title: `${meta.label} — insérer un token`,
        options: (sheet.refs[meta.refs] ?? []).map((x) => ({ id: x.value, name: x.label })),
        placeholder: 'Chercher par le début d’un mot…',
        none: 'Rien ne correspond.',
        opener: () => el,
        onPick: (value) => {
          const token = `{${meta.tag}/${value}}`;
          if (kind === 'prio') e.prio = [...(e.prio ?? []), token];
          else rSetEquip(e, kind, [...(e.equipment?.[kind] ?? []), token]);
          redo(`[data-do="pick-token"][data-kind="${kind}"][data-b="${el.dataset.b}"]`);
        },
      });
    }
    default:
      return undefined;
  }
}

/** Pose une ligne d'équipement d'un build, les clés rangées dans l'ordre du rendu. */
function rSetEquip(e, kind, lines) {
  const next = { ...(e.equipment ?? {}), [kind]: lines };
  e.equipment = Object.fromEntries(
    rOpts()
      .equipment.filter((k) => next[k]?.length)
      .map((k) => [k, next[k]]),
  );
}

/** La saisie des champs nus d'un guild raid (stats, priorité, équipement, badge, auteur) ; rend `true` si c'en était un. */
function raidInput(el) {
  const r = raid();
  if (!r || rLegacy(r)) return false;
  const t = r.teams[rTeam];
  const e = el.dataset.b !== undefined ? t?.builds[Number(el.dataset.b)] : undefined;
  const key = `p2.${rTeam}.b${el.dataset.b}`;
  if (el.dataset.rauthor !== undefined) {
    const vid = getAt(r, pathOf(el.dataset.rauthor))?.video;
    if (!vid) return true;
    if (el.value.trim()) vid.author = el.value.trim();
    else delete vid.author;
  } else if (el.dataset.ricon !== undefined && t) {
    t.icon = el.value;
    const pvEl = $('gd-panel').querySelector('[data-rbadge]');
    if (pvEl) pvEl.innerHTML = rBadge(t);
  } else if (el.dataset.rkind !== undefined && t) {
    delete t.element;
    if (el.value === 'icon') t.icon ??= '';
    else {
      delete t.icon;
      if (el.value) t.element = el.value;
    }
    forgive(sub);
    render();
    $('gd-panel')
      .querySelector(el.value === 'icon' ? '[data-ricon]' : '[data-rkind]')
      ?.focus();
    return true;
  } else if (el.dataset.rstat !== undefined && e) {
    const next = { ...(e.stats ?? {}), [el.dataset.rstat]: el.value };
    e.stats = Object.fromEntries(
      rOpts()
        .stats.filter((k) => next[k]?.trim())
        .map((k) => [k, next[k]]),
    );
  } else if (el.dataset.rprio !== undefined && e) {
    e.prio = el.value
      .split('>')
      .map((s) => s.trim())
      .filter(Boolean);
    tokens.set(`${key}.prio`, e.prio.join(' › '));
  } else if (el.dataset.requip !== undefined && e) {
    const lines = el.value.split('\n').filter((s) => s.trim());
    rSetEquip(e, el.dataset.requip, lines);
    tokens.set(`${key}.${el.dataset.requip}`, lines.join(', '));
    el.rows = Math.max(2, el.value.split('\n').length);
  } else return false;
  forgive(sub);
  marks();
  pvAsk(PV_DELAY);
  return true;
}

// Le glisser-déposer des onglets d'équipe : l'ordre des équipes est celui du
// site. ← → de la carte restent le chemin du clavier et du banc.
sortable($('gd-panel'), {
  item: '.gd-rtab',
  list: '.gd-rteams',
  onMove: (from, to) => {
    const r = raid();
    if (gen || !r || rLegacy(r)) return;
    const shown = r.teams[rTeam];
    const [moved] = r.teams.splice(from, 1);
    if (!moved) return;
    r.teams.splice(to, 0, moved);
    rTeam = r.teams.indexOf(shown);
    rVid = '';
    forgive(sub);
    render();
    $('gd-panel').querySelector(`.gd-rtab[data-i="${to}"]`)?.focus();
  },
});

// ------------------------------------------------------ les guides généraux
// Quatre guides généraux ont un fragment éditable (Premium & Limited, Free
// Heroes, Shop priorities, Core Fusion) : la page ne les connaît pas par leur nom, elle rend
// la FORME que le serveur sert (`spec.tabs` : des onglets, des blocs, les
// champs de chaque entrée — cf. `general-guide-form.ts`) sur les données du
// store (`gen.data`), dans la même coquille que les guides de boss : en-tête,
// savebar, sous-onglets, « Traduire » par onglet, un commit par « Enregistrer ».
const getAt = (root, path) =>
  path.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), root);
/** Pose `value` à `path` (les objets manquants créés) ; `undefined` retire la clé. */
function setAt(root, path, value) {
  let o = root;
  path.slice(0, -1).forEach((k, i) => {
    // Un segment numérique à suivre : une liste à créer, pas un objet.
    if (!o[k] || typeof o[k] !== 'object') o[k] = /^\d+$/.test(path[i + 1]) ? [] : {};
    o = o[k];
  });
  const last = path[path.length - 1];
  if (value === undefined) delete o[last];
  else o[last] = value;
}
/** Ce qui vit à `path`, ou ce que `make` pose là : la MÊME référence d'un dessin à l'autre. */
function ensureAt(root, path, make) {
  const cur = getAt(root, path);
  if (cur !== undefined && cur !== null) return cur;
  const made = make();
  setAt(root, path, made);
  return made;
}
const pathOf = (key) => key.split('.');
/** Les refus posés sur une clé de champ (ou d'entrée). */
const refusedKey = (key) => refused.filter((r) => r.key === key);

/** Les champs d'une entrée nettoyés comme le store les écrirait : un texte vide absent, une case fausse absente. */
function cleanFields(e, fields) {
  for (const f of fields ?? []) {
    if (f.kind === 'text') {
      const t = optText(e[f.key]);
      if (t) e[f.key] = t;
      else delete e[f.key];
    } else if (f.kind === 'check' && !e[f.key]) delete e[f.key];
    else if (f.kind === 'group') {
      // Un groupe : ses textes nettoyés de même ; sans aucun, il est absent.
      const g = e[f.key];
      if (g) cleanFields(g, f.fields);
      if (!g || !Object.keys(g).length) delete e[f.key];
    } else if (
      (f.kind === 'number' || f.kind === 'priority') &&
      (e[f.key] === '' || e[f.key] === null)
    )
      delete e[f.key];
  }
}
/**
 * Les données d'un guide général telles qu'elles partiraient : une copie où
 * chaque bloc de la forme est nettoyé (les textes réduits aux langues
 * écrites, un texte facultatif vide absent, un paragraphe vide retiré). C'est
 * ce que la savebar compare au disque, nettoyé de même.
 */
function genClean(d) {
  const out = JSON.parse(JSON.stringify(d));
  for (const tab of gen.form.tabs)
    for (const block of tab.blocks) {
      const value = getAt(out, block.path);
      if (block.kind === 'text') setAt(out, block.path, optText(value));
      else if (block.kind === 'texts')
        setAt(out, block.path, (value ?? []).filter(hasText).map(textOut));
      else {
        const list = value ?? [];
        for (const e of list) {
          cleanFields(e, block.fields);
          if (block.nested)
            for (const s of e[block.nested.key] ?? []) cleanFields(s, block.nested.fields);
        }
        setAt(out, block.path, list);
      }
    }
  return out;
}
/** La tranche d'un onglet dans des données nettoyées : ses blocs, à leur chemin. */
const genSlice = (clean, tab) =>
  Object.fromEntries(tab.blocks.map((b) => [b.id, getAt(clean, b.path) ?? null]));
/** Un onglet d'un guide général diffère-t-il du disque ? */
function tabMovedGen(id) {
  const tab = gen.form.tabs.find((t) => t.id === id);
  return Boolean(tab) && !same(genSlice(genClean(gen.data), tab), genSlice(genClean(gen.was), tab));
}
/**
 * Les textes LIVE d'un guide général, dans l'ordre de la forme (la traduction
 * écrit dedans) ; `tabId` : ceux d'un seul onglet — « Traduire » vaut pour
 * l'onglet montré, ses reviews repliées comprises (un bloc `roster` n'en
 * dessine qu'une).
 */
function genTexts(tabId) {
  const out = [];
  const ofFields = (e, fields) => {
    for (const f of fields ?? [])
      if (f.kind === 'text' && e[f.key]) out.push(e[f.key]);
      else if (f.kind === 'group' && e[f.key]) ofFields(e[f.key], f.fields);
  };
  for (const tab of gen.form.tabs.filter((t) => !tabId || t.id === tabId))
    for (const block of tab.blocks) {
      const value = getAt(gen.data, block.path);
      if (block.kind === 'text') {
        if (value) out.push(value);
      } else if (block.kind === 'texts') out.push(...(value ?? []));
      else
        for (const e of value ?? []) {
          ofFields(e, block.fields);
          if (block.nested)
            for (const s of e[block.nested.key] ?? []) ofFields(s, block.nested.fields);
        }
    }
  return out;
}

/** Une entrée neuve d'après ses champs : vide selon le genre, ou `default`. */
function blankEntry(fields, name = '') {
  const e = {};
  for (const f of fields ?? []) {
    if (f.default !== undefined) e[f.key] = JSON.parse(JSON.stringify(f.default));
    else if (f.kind === 'text') e[f.key] = { [def()]: '' };
    else if (f.kind === 'hero') e[f.key] = name;
    else if (f.kind === 'heroes') e[f.key] = [];
    else if (f.kind === 'select') e[f.key] = f.options?.[0]?.value ?? '';
    else if (f.kind === 'string' || f.kind === 'target') e[f.key] = '';
    else if (f.kind === 'stars') e[f.key] = stepsOf(name)[0]?.value ?? 3;
    else if (f.kind === 'impact')
      e[f.key] = Object.fromEntries(['3', '4', '5', '6'].map((s) => [s, { pve: '', pvp: '' }]));
  }
  if (name) for (const f of fields ?? []) if (f.kind === 'hero') e[f.key] = name;
  return e;
}
/** Les paliers pleins d'un perso, par son nom : ce que « Palier » propose. */
const stepsOf = (name) => {
  const c = heroByName(name);
  return (c && sheet.options.steps?.[c.id]) ?? [];
};

/** Les niveaux de fusion d'un héros fusion, par son nom : ce que « Niveaux recommandés » propose. */
const levelsOf = (name) => {
  const c = heroByName(name);
  return (c && sheet.options.levels?.[c.id]) ?? [];
};

/** Une tuile de perso sans ✕ (le perso d'une review, d'un palier). */
function heroFace(name) {
  const c = heroByName(name);
  return `<span class="gd-hero${c ? '' : ' unknown'}" title="${esc(c ? c.name : name ? `« ${name} » : hors du roster` : 'aucun perso')}">${heroTile(
    state,
    c ?? { name: name || '—' },
    { name: true },
  )}</span>`;
}

/* --- les cibles de transcendance (`target`) : la chaîne du site, lue et écrite comme `RecoTargetStars` --- */
/** « 4 to 5 » / « Any » / « 5 (support) 6 (dps) » → { any, min?, max?, note }. */
function parseReco(s) {
  const t = (s ?? '').trim();
  if (!t) return { any: false, note: '' };
  if (/^any$/i.test(t)) return { any: true, note: '' };
  const m = /^(\d)(?:\s*to\s*(\d))?\s*(.*)$/i.exec(t);
  if (m) {
    const min = Number(m[1]);
    return { any: false, min, max: m[2] ? Number(m[2]) : min, note: m[3].trim() };
  }
  return { any: false, note: t };
}
function formatReco(r) {
  if (r.any) return 'Any';
  const base = r.min ? (r.min === r.max ? String(r.min) : `${r.min} to ${r.max}`) : '';
  return [base, r.note].filter(Boolean).join(' ').trim();
}
/** Un clic sur l'étoile `s` d'une cible : la règle du site (une seule, une plage, une borne retirée). */
function recoStar(r, s) {
  if (r.any || r.min === undefined) return { ...r, any: false, min: s, max: s };
  const min = r.min;
  const max = r.max ?? r.min;
  if (min === max) {
    if (s === min) return { ...r, min: undefined, max: undefined };
    return { ...r, min: Math.min(min, s), max: Math.max(max, s) };
  }
  if (s < min) return { ...r, min: s };
  if (s > max) return { ...r, max: s };
  if (s === min) return { ...r, min: min + 1 };
  if (s === max) return { ...r, max: max - 1 };
  return { ...r, min: s, max: s };
}
const recoOn = (r, s) => !r.any && r.min !== undefined && s >= r.min && s <= (r.max ?? r.min);

/**
 * Le sélecteur de palier d'une entrée : les crans PLEINS de son perso, sous
 * leur libellé du jeu (« 3★ » — `.gd-step` lui donne la largeur de le montrer).
 * Un perso sans paliers connus garde sa valeur NUE : c'est un `TransStar` (9
 * pour 6★), pas un compte d'étoiles.
 */
function starsSelect(f, e, key, more = '') {
  const steps = stepsOf(e.name ?? '');
  const cur = e[f.key];
  const opts = steps.length ? steps : [{ value: cur, label: String(cur) }];
  return `<select class="w-qty gd-step" ${genAttr(key, 'number')} aria-label="${esc(f.label)}${e.name ? ` de ${esc(e.name)}` : ''}" ${more}>${opts
    .map(
      (o) =>
        `<option value="${esc(o.value)}"${o.value === cur ? ' selected' : ''}>${esc(o.label)}</option>`,
    )
    .join('')}</select>`;
}
/** Le sélecteur de relation d'une entrée avec la SUIVANTE (`op`) : `>`, `≥`, ou rien (`null`, l'option vide). */
function opSelect(f, e, key) {
  const cur = e[f.key] ?? '';
  return `<select class="w-qty" ${genAttr(key, 'nullable')} aria-label="${esc(f.label)}${e.name ? ` de ${esc(e.name)}` : ''}" title="${esc(f.label)} : > strictement avant, ≥ avant ou à égalité, — sans relation">${(
    f.options ?? []
  )
    .map(
      (o) =>
        `<option value="${esc(o.value)}"${o.value === cur ? ' selected' : ''}>${esc(o.label)}</option>`,
    )
    .join('')}</select>`;
}
const fieldLabel = (f) => `<span class="lbl">${esc(f.label)}</span>`;
const genAttr = (key, type) => `data-gen="${esc(key)}" data-type="${type}"`;

/** Un champ d'une entrée, selon son genre ; `ek` : la clé de l'entrée, `e` l'entrée. */
function fieldHtml(f, e, ek, block) {
  const key = `${ek}.${f.key}`;
  const bad = refusedKey(key);
  switch (f.kind) {
    case 'text':
      return `<div class="gd-field gd-field-text">${fieldLabel(f)}${textHtml(
        key,
        ensureAt(e, [f.key], () => ({ [def()]: '' })),
        { what: f.label, line: f.line, placeholder: f.placeholder ?? '', bad },
      )}</div>`;
    case 'hero': {
      const free = f.unreleasedKey && e[f.unreleasedKey] === true;
      return `<div class="gd-field gd-field-hero${bad.length ? ' ko' : ''}">${
        free
          ? `<input class="w-text" ${genAttr(key, 'string')} value="${esc(e[f.key] ?? '')}" placeholder="Nom du perso pas encore sorti" aria-label="${esc(f.label)}" autocomplete="off" />`
          : `${heroFace(e[f.key] ?? '')}<button class="btn ghost sm" type="button" data-act="gen-pick-hero" data-key="${esc(key)}" aria-haspopup="dialog">${e[f.key] ? 'Changer…' : 'Choisir…'}</button>`
      }${errHtml(bad)}</div>`;
    }
    case 'heroes':
      return `<div class="gd-field${bad.length ? ' ko' : ''}">${fieldLabel(f)}${heroesHtml(
        ensureAt(e, [f.key], () => []),
        'gen-del-hero',
        'gen-add-heroes',
        `data-key="${esc(key)}"`,
      )}${errHtml(bad)}</div>`;
    case 'select':
      return `<label class="gd-field gd-field-inline">${fieldLabel(f)}<select ${genAttr(key, 'string')} aria-label="${esc(f.label)}">${(
        f.options ?? []
      )
        .map(
          (o) =>
            `<option value="${esc(o.value)}"${o.value === e[f.key] ? ' selected' : ''}>${esc(o.label)}</option>`,
        )
        .join('')}</select></label>`;
    case 'stars':
      return `<label class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}${starsSelect(f, e, key)}${errHtml(bad)}</label>`;
    case 'target': {
      const r = parseReco(e[f.key] ?? '');
      return `<div class="gd-field gd-field-inline gd-target${bad.length ? ' ko' : ''}">${fieldLabel(f)}<span class="gd-stars" role="group" aria-label="${esc(f.label)}, étoiles">${[
        3, 4, 5, 6,
      ]
        .map(
          (st) =>
            `<button type="button" data-act="gen-target-star" data-key="${esc(key)}" data-value="${st}" aria-pressed="${recoOn(r, st)}" title="${st}★">${recoOn(r, st) ? '★' : '☆'}<small>${st}</small></button>`,
        )
        .join(
          '',
        )}</span><button class="btn ghost sm" type="button" data-act="gen-target-any" data-key="${esc(key)}" aria-pressed="${r.any}">Any</button><input class="w-text" data-tnote="${esc(key)}" value="${esc(r.note)}" placeholder="note (facultatif)" aria-label="${esc(f.label)}, note" autocomplete="off" /><span class="lbl mono" data-tout>${esc(e[f.key] || '—')}</span>${errHtml(bad)}</div>`;
    }
    case 'string':
      return `<label class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}<input class="${block.title === f.key ? 'w-search' : 'w-text'}" ${genAttr(key, 'string')} value="${esc(e[f.key] ?? '')}" placeholder="${esc(f.placeholder ?? '')}" aria-label="${esc(f.label)}" autocomplete="off" />${errHtml(bad)}</label>`;
    case 'number':
      return `<label class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}<input class="w-qty" type="number" ${genAttr(key, 'number')} value="${esc(e[f.key] ?? '')}" aria-label="${esc(f.label)}" />${errHtml(bad)}</label>`;
    case 'check':
      return `<label class="check gd-field-check"><input type="checkbox" ${genAttr(key, 'bool')}${e[f.key] ? ' checked' : ''} /> ${esc(f.label)}</label>`;
    case 'priority':
      return `<div class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}<div class="gd-prio" role="group" aria-label="${esc(f.label)}">${(
        f.options ?? []
      )
        .map(
          (o) =>
            `<button type="button" data-act="gen-prio" data-key="${esc(key)}" data-value="${esc(o.value)}" aria-pressed="${o.value === e[f.key]}" title="${o.value === e[f.key] ? 'Effacer' : `Priorité ${esc(o.value)}`}">${esc(o.label)}</button>`,
        )
        .join('')}</div>${errHtml(bad)}</div>`;
    case 'impact': {
      const grid = ensureAt(e, [f.key], () => ({}));
      // Cinq étoiles par case, comme `ImpactStars` du site : re-cliquer la note vide la case.
      const cell = (star, side) => {
        const n = Number(grid[star]?.[side] ?? '') || 0;
        return `<span class="gd-stars" role="group" aria-label="${esc(f.label)} ${star}★ ${side}">${[
          1, 2, 3, 4, 5,
        ]
          .map(
            (i) =>
              `<button type="button" data-act="gen-impact" data-key="${esc(`${key}.${star}.${side}`)}" data-value="${i}" aria-pressed="${i <= n}" title="${i === n ? 'Effacer' : String(i)}">${i <= n ? '★' : '☆'}</button>`,
          )
          .join('')}</span>`;
      };
      return `<div class="gd-field${bad.length ? ' ko' : ''}">${fieldLabel(f)}<table class="gd-impact"><thead><tr><th>★</th><th>PvE</th><th>PvP</th></tr></thead><tbody>${[
        '3',
        '4',
        '5',
        '6',
      ]
        .map(
          (star) =>
            `<tr><td>${star}★</td><td>${cell(star, 'pve')}</td><td>${cell(star, 'pvp')}</td></tr>`,
        )
        .join('')}</tbody></table>${errHtml(bad)}</div>`;
    }
    case 'levels': {
      // Des cases : les niveaux de la table du jeu du héros ; un niveau écrit qui n'en est pas reste visible (et refusé).
      const on = ensureAt(e, [f.key], () => []);
      const all = [...new Set([...levelsOf(e.name ?? ''), ...on])].sort((a, b) => a - b);
      return `<div class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}<div class="gd-prio gd-levels" role="group" aria-label="${esc(f.label)}">${all
        .map(
          (lv) =>
            `<button type="button" data-act="gen-level" data-key="${esc(key)}" data-value="${lv}" aria-pressed="${on.includes(lv)}" title="Niveau ${lv}${on.includes(lv) ? ' : retirer' : ''}">${lv}</button>`,
        )
        .join(
          '',
        )}</div>${all.length ? '' : '<span class="lbl">choisir d’abord un héros fusion</span>'}${errHtml(bad)}</div>`;
    }
    case 'op':
      return `<label class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}${opSelect(f, e, key)}${errHtml(bad)}</label>`;
    case 'group': {
      // Des textes facultatifs repliés sous un libellé ; ouvert : dit par `genOpen`, ou un refus dedans.
      const g = ensureAt(e, [f.key], () => ({}));
      const subs = f.fields ?? [];
      const written = subs.filter((sf) => hasText(g[sf.key])).length;
      const sbad = subs.some((sf) => refusedKey(`${key}.${sf.key}`).length);
      return `<details class="gd-group${bad.length || sbad ? ' ko' : ''}" data-group="${esc(key)}"${genOpen.has(key) || sbad ? ' open' : ''}>
        <summary><span class="btn ghost sm">${esc(f.label)}</span><span class="badge off" data-count>${written} / ${subs.length}</span></summary>
        <div class="gd-body">${subs.map((sf) => fieldHtml(sf, g, key, block)).join('')}${errHtml(bad)}</div>
      </details>`;
    }
    case 'cost': {
      const c = e[f.key];
      return `<div class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}<input class="w-qty" type="number" min="0" ${genAttr(`${key}.amount`, 'number')} value="${esc(c?.amount ?? '')}" aria-label="${esc(f.label)}, montant" /><input class="w-text" ${genAttr(`${key}.currency`, 'string')} value="${esc(c?.currency ?? '')}" placeholder="monnaie" aria-label="${esc(f.label)}, monnaie" autocomplete="off" />${errHtml(bad)}</div>`;
    }
    case 'limit': {
      const l = e[f.key];
      return `<div class="gd-field gd-field-inline${bad.length ? ' ko' : ''}">${fieldLabel(f)}<input class="w-qty" type="number" min="1" ${genAttr(`${key}.count`, 'number')} value="${esc(l?.count ?? '')}" aria-label="${esc(f.label)}, compte" /><select ${genAttr(`${key}.period`, 'string')} aria-label="${esc(f.label)}, période"${l ? '' : ' disabled'}>${(
        f.options ?? []
      )
        .map(
          (o) =>
            `<option value="${esc(o.value)}"${o.value === l?.period ? ' selected' : ''}>${esc(o.label)}</option>`,
        )
        .join('')}</select>${errHtml(bad)}</div>`;
    }
    case 'product': {
      const name = e.name?.[def()] ?? '';
      // Comme l'admin : « ×10,000 » sauf si le nom le dit déjà (« 10,000 Gold »).
      const fmt = Number(e.gives ?? 0).toLocaleString('en-US');
      const gives = e.gives > 1 && !name.includes(fmt) ? ` ×${fmt}` : '';
      const icon = e.icon
        ? `<img class="ico" src="${src(`${e.iconKind === 'equipment' ? 'equipment' : 'items'}/${esc(e.icon)}`)}" alt="" aria-hidden="true" width="24" height="24" />`
        : '';
      const cur = block.currency?.icon
        ? `<img class="ico" src="${src(`items/${esc(block.currency.icon)}`)}" alt="" aria-hidden="true" width="18" height="18" title="${esc(block.currency.name)}" />`
        : '';
      return `<span class="gd-prod-item rw">${icon}<span class="gd-prod-name">${esc(name)}<span class="lbl">${esc(gives)}</span></span></span><span class="gd-prod-cost mono">${esc(e.cost ?? '')}${cur}</span><span class="lbl gd-prod-limit">${
        e.limit?.count > 0 ? `${esc(e.limit.count)} / ${esc(e.limit.period)}` : '—'
      }</span>`;
    }
    default:
      return '';
  }
}

/** Une entrée d'une liste : une ligne pour un produit ou un palier, une carte sinon. */
function entryHtml(block, e, ek, i, count, listKey) {
  const fields = block.fields ?? [];
  const bad = refusedKey(ek);
  const del = block.add
    ? `<button class="btn icon" type="button" data-act="gen-del" data-key="${esc(listKey)}" data-i="${i}" title="Retirer" aria-label="Retirer l’entrée ${i + 1}">✕</button>`
    : '';
  if (fields.some((f) => f.kind === 'product')) {
    const prod = fields.find((f) => f.kind === 'product');
    const rest = fields.filter((f) => f.kind !== 'product');
    const note = rest.find((f) => f.kind === 'text');
    const open =
      note &&
      (hasText(e[note.key]) ||
        genOpen.has(`${ek}.${note.key}`) ||
        refusedKey(`${ek}.${note.key}`).length);
    return `<div class="gd-prod${bad.length ? ' ko' : ''}" data-entry="${esc(ek)}">
      <div class="gd-prod-row">${rest
        .filter((f) => f.kind !== 'text')
        .map((f) => fieldHtml(f, e, ek, block))
        .join('')}${fieldHtml(prod, e, ek, block)}${
        note && !open
          ? `<button class="btn ghost sm" type="button" data-act="gen-note" data-key="${esc(`${ek}.${note.key}`)}">＋ note</button>`
          : ''
      }</div>${open ? fieldHtml(note, e, ek, block) : ''}${errHtml(bad)}
    </div>`;
  }
  if (block.ordered) {
    const hero = fields.find((f) => f.kind === 'hero');
    const rest = fields.filter((f) => f !== hero);
    return `<div class="gd-rank${bad.length ? ' ko' : ''}" data-entry="${esc(ek)}">
      <span class="lbl mono gd-rank-n">${i + 1}</span>${hero ? fieldHtml(hero, e, ek, block) : ''}${rest.map((f) => fieldHtml(f, e, ek, block)).join('')}
      <button class="btn icon" type="button" data-act="gen-up" data-key="${esc(listKey)}" data-i="${i}" title="Monter" aria-label="Monter ${esc(e.name ?? '')}"${i ? '' : ' disabled'}>↑</button><button class="btn icon" type="button" data-act="gen-down" data-key="${esc(listKey)}" data-i="${i}" title="Descendre" aria-label="Descendre ${esc(e.name ?? '')}"${i < count - 1 ? '' : ' disabled'}>↓</button>${del}${errHtml(bad)}
    </div>`;
  }
  const title = fields.find((f) => f.key === block.title);
  const head =
    title?.kind === 'hero'
      ? fieldHtml(title, e, ek, block)
      : `<strong>${esc(block.addLabel ? `${block.addLabel.charAt(0).toUpperCase()}${block.addLabel.slice(1)} ${i + 1}` : `Entrée ${i + 1}`)}</strong>`;
  const body = fields.filter((f) => f !== title || title.kind !== 'hero');
  const nested = block.nested
    ? `<div class="gd-sub"><span class="lbl">${esc(block.nested.label)}s</span>${ensureAt(
        e,
        [block.nested.key],
        () => [],
      )
        .map((s, j) => {
          const sk = `${ek}.${block.nested.key}.${j}`;
          const sbad = refusedKey(sk);
          return `<div class="card gd-card gd-nested${sbad.length ? ' ko' : ''}" data-entry="${esc(sk)}">
            <div class="card-head"><strong>${esc(block.nested.label.charAt(0).toUpperCase() + block.nested.label.slice(1))} ${j + 1}</strong><button class="btn icon" type="button" data-act="gen-del" data-key="${esc(`${ek}.${block.nested.key}`)}" data-i="${j}" title="Retirer" aria-label="Retirer l’${esc(block.nested.label)} ${j + 1}">✕</button></div>
            <div class="gd-body">${block.nested.fields.map((f) => fieldHtml(f, s, sk, block)).join('')}${errHtml(sbad)}</div>
          </div>`;
        })
        .join(
          '',
        )}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="gen-add-sub" data-key="${esc(ek)}">＋ ${esc(block.nested.label)}</button></div></div>`
    : '';
  return `<div class="card gd-card gd-entry${bad.length ? ' ko' : ''}" data-entry="${esc(ek)}">
    <div class="card-head">${head}${del}</div>
    <div class="gd-body">${body.map((f) => fieldHtml(f, e, ek, block)).join('')}${errHtml(bad)}${nested}</div>
  </div>`;
}

/* --- `view: 'roster'` : les reviews à la façon de contribute/premium-reviews --- */
/** Une review compte quand son anglais est écrit (la règle du site : une entrée vide n'enfle pas le compteur). */
const reviewed = (e) => Boolean(e?.review?.[def()]?.trim());
/**
 * Les persos ATTENDUS sans review que la forme dit de signaler (`missing` d'un
 * bloc `roster` : son absence coûte, le badge le dit) — nom → le libellé. Lu
 * des données en cours, tous onglets confondus : la vignette d'un palier le
 * porte comme la ligne de la liste.
 */
function unreviewed() {
  const out = new Map();
  for (const tab of gen.form.tabs)
    for (const block of tab.blocks) {
      if (block.view !== 'roster' || !block.missing) continue;
      const list = getAt(gen.data, block.path) ?? [];
      for (const name of sheet.options.rosters?.[block.roster ?? ''] ?? [])
        if (!reviewed(list.find((e) => e.name === name))) out.set(name, block.missing);
    }
  return out;
}
/** Le badge ambre d'un perso attendu sans review (`unreviewed`), ou rien. */
const unreviewedBadge = (name) => {
  const said = unreviewed().get(name);
  return said ? `<span class="badge warn gd-unreviewed">${esc(said)}</span>` : '';
};
/**
 * Le résumé d'une review en une ligne, d'après les champs du bloc : avec une
 * grille d'impact, « PvE 5 · PvP Any · impact 3/2 · 2/2 · 3/5 · 2/4 » (3★ → 6★,
 * PvE/PvP, « – » pour une case vide) ; avec des niveaux et un groupe, « Lv 3,
 * 5 · 5 / 6 changements ».
 */
function reviewSummary(block, e) {
  const fields = block.fields ?? [];
  const parts = [];
  for (const f of fields)
    if (f.kind === 'levels') parts.push(`Lv ${(e[f.key] ?? []).join(', ') || '—'}`);
    else if (f.kind === 'group')
      parts.push(
        `${(f.fields ?? []).filter((sf) => hasText(e[f.key]?.[sf.key])).length} / ${(f.fields ?? []).length} changements`,
      );
  if (fields.some((f) => f.kind === 'impact')) {
    const cells = ['3', '4', '5', '6']
      .map((st) => `${e.impact?.[st]?.pve || '–'}/${e.impact?.[st]?.pvp || '–'}`)
      .join(' · ');
    parts.push(`PvE ${e.recommendedPve || '—'} · PvP ${e.recommendedPvp || '—'} · impact ${cells}`);
  }
  return parts.join(' · ');
}
/** Une ligne de la liste compacte : la vignette, ★ ou ☆, le nom, le badge d'un attendu sans review (`missing` de la forme), le résumé ; un clic déplie sa review (ou la crée, pour un perso du roster). */
function rosterRowHtml(block, listKey, name, e, i) {
  const c = heroByName(name);
  const open = e !== undefined && e === openEntry;
  const ek = e !== undefined ? `${listKey}.${i}` : '';
  // Un refus sur l'entrée, sur un de ses champs, ou sur un texte d'un de ses groupes.
  const bad = ek
    ? refusedKey(ek).length ||
      (block.fields ?? []).some(
        (f) =>
          refusedKey(`${ek}.${f.key}`).length ||
          (f.fields ?? []).some((sf) => refusedKey(`${ek}.${f.key}.${sf.key}`).length),
      )
    : false;
  const label = name || '(sans nom)';
  return `<button class="gd-rrow${open ? ' open' : ''}${bad ? ' ko' : ''}${c ? '' : ' unknown'}" type="button" data-act="gen-open" data-key="${esc(listKey)}"${
    ek ? ` data-entry="${esc(ek)}"` : ''
  } data-name="${esc(name)}" aria-expanded="${open}" title="${esc(open ? 'Replier' : e ? 'Déplier la review' : 'Écrire la review')}">${heroTile(
    state,
    c ?? { name: label },
    { px: 32 },
  )}<span class="gd-rmark" aria-label="${reviewed(e) ? 'review écrite' : 'review à écrire'}">${reviewed(e) ? '★' : '☆'}</span><span class="gd-rname">${esc(label)}</span>${
    e?.unreleased
      ? '<span class="badge warn">pas encore sorti</span>'
      : c
        ? ''
        : '<span class="badge warn">hors roster</span>'
  }${unreviewedBadge(name)}${e ? `<span class="gd-rsum lbl mono">${esc(reviewSummary(block, e))}</span>` : '<span class="gd-rsum lbl">— pas de review</span>'}</button>`;
}
/** Le bloc des reviews : le compteur et les manquants, la liste du roster puis les entrées hors roster, UNE review dépliée. */
function rosterBlockHtml(block) {
  const key = block.path.join('.');
  const bad = refusedKey(key);
  const list = ensureAt(gen.data, block.path, () => []);
  const names = sheet.options.rosters?.[block.roster ?? ''] ?? [];
  const indexOf = (name) => list.findIndex((e) => e.name === name);
  const done = names.filter((n) => reviewed(list[indexOf(n)])).length;
  const missing = names.filter((n) => !reviewed(list[indexOf(n)]));
  const off = list.map((e, i) => [e, i]).filter(([e]) => !names.includes(e.name));
  // « Pas encore sorti » n'existe que si la forme libère le nom (`unreleasedKey` du héros).
  const free = (block.fields ?? []).some((f) => f.kind === 'hero' && f.unreleasedKey);
  const row = (name, i) =>
    rosterRowHtml(block, key, name, i >= 0 ? list[i] : undefined, i) +
    (i >= 0 && list[i] === openEntry
      ? entryHtml(block, list[i], `${key}.${i}`, i, list.length, key)
      : '');
  return `<div class="card gd-card gd-roster-card${bad.length ? ' ko' : ''}" data-block="${esc(block.id)}">
    <div class="card-head"><strong>${esc(block.label)}</strong>${block.hint ? `<span class="lbl">${esc(block.hint)}</span>` : ''}<span class="badge off" data-count>${done} / ${names.length} reviews</span>${
      missing.length ? `<span class="badge warn">${plural(missing.length, 'manquante')}</span>` : ''
    }</div>
    <div class="gd-body">${
      missing.length ? `<p class="lbl gd-missing">Sans review : ${esc(missing.join(', '))}</p>` : ''
    }<div class="gd-roster" role="list">${names.map((n) => row(n, indexOf(n))).join('')}${
      off.length
        ? `<span class="lbl gd-roster-sep">${free ? 'Hors roster · pas encore sortis' : 'Hors roster'}</span>${off.map(([e, i]) => row(e.name, i)).join('')}`
        : ''
    }${names.length || off.length ? '' : '<p class="lbl">Aucune review.</p>'}</div>${errHtml(bad)}<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="gen-add-review" data-key="${esc(key)}" aria-haspopup="dialog">＋ review</button>${
      free
        ? `<button class="btn ghost sm" type="button" data-act="gen-add-unreleased" data-key="${esc(key)}" title="Un perso absent de la data : son nom reste libre, la review attend sa sortie">＋ pas encore sorti</button>`
        : ''
    }</div></div>
  </div>`;
}

/* --- `view: 'tiles'` : les paliers en rangées de vignettes, glisser-déposer --- */
/** Une vignette d'un palier : le rang, le perso, son palier de transcendance, sa relation avec la suivante (`op`, si la forme en a une), le badge d'un attendu sans review, ↑ ↓ ✕ ; `draggable`. */
function tileHtml(block, e, ek, i, count, listKey) {
  const bad = refusedKey(ek);
  const stars = (block.fields ?? []).find((f) => f.kind === 'stars');
  const op = (block.fields ?? []).find((f) => f.kind === 'op');
  const fbad = (block.fields ?? []).flatMap((f) => refusedKey(`${ek}.${f.key}`));
  const name = e.name ?? '';
  return `<div class="gd-pick${bad.length || fbad.length ? ' ko' : ''}" draggable="true" role="listitem" data-entry="${esc(ek)}" data-key="${esc(listKey)}" data-i="${i}" aria-label="${esc(`rang ${i + 1} : ${name || 'aucun perso'}`)}">
      <span class="gd-pick-n lbl mono">${i + 1}</span>${heroFace(name)}${stars ? starsSelect(stars, e, `${ek}.${stars.key}`) : ''}${op ? opSelect(op, e, `${ek}.${op.key}`) : ''}${unreviewedBadge(name)}
      <span class="gd-pick-acts"><button class="btn icon" type="button" data-act="gen-up" data-key="${esc(listKey)}" data-i="${i}" title="Monter" aria-label="Monter ${esc(name)}"${i ? '' : ' disabled'}>↑</button><button class="btn icon" type="button" data-act="gen-down" data-key="${esc(listKey)}" data-i="${i}" title="Descendre" aria-label="Descendre ${esc(name)}"${i < count - 1 ? '' : ' disabled'}>↓</button><button class="btn icon" type="button" data-act="gen-del" data-key="${esc(listKey)}" data-i="${i}" title="Retirer" aria-label="Retirer ${esc(name)}">✕</button></span>${errHtml([...bad, ...fbad])}
    </div>`;
}
/** Un palier : son libellé, sa rangée de vignettes (la liste du glisser-déposer), « ＋ » en multi-choix. */
function tierHtml(block) {
  const key = block.path.join('.');
  const bad = refusedKey(key);
  const list = ensureAt(gen.data, block.path, () => []);
  return `<div class="gd-tier${bad.length ? ' ko' : ''}" data-block="${esc(block.id)}">
    <div class="gd-tier-head"><strong>${esc(block.label)}</strong><span class="badge off">${list.length}</span></div>
    <div class="gd-tiles" role="list" aria-label="${esc(block.label)}" data-key="${esc(key)}">${list
      .map((e, i) => tileHtml(block, e, `${key}.${i}`, i, list.length, key))
      .join(
        '',
      )}<button class="btn ghost sm gd-tiles-add" type="button" data-act="gen-pick-tiles" data-key="${esc(key)}" aria-haspopup="dialog" title="Choisir les persos du palier : cochés = ceux du palier, les nouveaux à la suite ; « Valider » remplace">＋</button></div>${errHtml(bad)}
  </div>`;
}
/** Les blocs `tiles` d'un onglet, dans UNE carte : un palier par rangée, le glisser-déposer d'une rangée à l'autre. */
const tiersHtml = (tab) =>
  `<div class="card gd-card gd-tiers"><div class="card-head"><strong>Priorités</strong><span class="lbl">l’ordre est celui de la page — glisser une vignette, aussi d’un palier à l’autre ; ↑ ↓ au clavier</span></div><div class="gd-body">${tab.blocks
    .map(tierHtml)
    .join('')}</div></div>`;

/** Un bloc de la forme : un texte seul, des textes, ou une liste d'entrées, dans sa carte. */
function genBlockHtml(block) {
  if (block.view === 'roster' && block.kind === 'list') return rosterBlockHtml(block);
  const key = block.path.join('.');
  const bad = refusedKey(key);
  const add = (label) =>
    block.add
      ? `<div class="gd-foot"><button class="btn ghost sm" type="button" data-act="${block.add === 'hero' ? 'gen-add-hero' : 'gen-add'}" data-key="${esc(key)}"${block.add === 'hero' ? ' aria-haspopup="dialog"' : ''}>＋ ${esc(label)}</button></div>`
      : '';
  const head = (badge = '') =>
    `<div class="card-head"><strong>${esc(block.label)}</strong>${block.hint ? `<span class="lbl">${esc(block.hint)}</span>` : ''}${badge}</div>`;
  if (block.kind === 'text') {
    const t = ensureAt(gen.data, block.path, () => ({ [def()]: '' }));
    return `<div class="card gd-card${bad.length ? ' ko' : ''}" data-block="${esc(block.id)}">${head()}<div class="gd-body">${textHtml(key, t, { what: block.label, bad })}</div></div>`;
  }
  if (block.kind === 'texts') {
    const list = ensureAt(gen.data, block.path, () => []);
    return `<div class="card gd-card${bad.length ? ' ko' : ''}" data-block="${esc(block.id)}">${head(`<span class="badge off">${list.length}</span>`)}<div class="gd-body">${
      list.length
        ? list
            .map(
              (t, i) =>
                `<div class="gd-gen-text" data-entry="${esc(`${key}.${i}`)}"><span class="lbl mono">${i + 1}</span>${textHtml(`${key}.${i}`, t, { what: `${block.label} ${i + 1}`, bad: refusedKey(`${key}.${i}`) })}<button class="btn icon" type="button" data-act="gen-del" data-key="${esc(key)}" data-i="${i}" title="Retirer" aria-label="Retirer ${esc(block.addLabel ?? 'le texte')} ${i + 1}">✕</button></div>`,
            )
            .join('')
        : '<p class="lbl">Aucun texte.</p>'
    }${errHtml(bad)}${add(block.addLabel ?? 'texte')}</div></div>`;
  }
  const list = ensureAt(gen.data, block.path, () => []);
  const rows = list.map((e, i) => entryHtml(block, e, `${key}.${i}`, i, list.length, key));
  const compact = block.ordered || (block.fields ?? []).some((f) => f.kind === 'product');
  return `<div class="card gd-card${bad.length ? ' ko' : ''}" data-block="${esc(block.id)}">${head(`<span class="badge off">${list.length}</span>`)}<div class="gd-body${compact ? ' gd-compact' : ''}">${
    rows.length
      ? compact
        ? `<div class="gd-rows">${rows.join('')}</div>`
        : `<div class="gd-stack">${rows.join('')}</div>`
      : '<p class="lbl">Aucune entrée.</p>'
  }${errHtml(bad)}${add(block.add === 'hero' ? 'héros' : (block.addLabel ?? 'entrée'))}</div></div>`;
}

/** Le sous-onglet montré d'un guide général : ses blocs, les refus de l'onglet, « Traduire ». */
function genTabHtml() {
  const tab = gen.form.tabs.find((t) => t.id === sub) ?? gen.form.tabs[0];
  const blocks =
    tab.blocks.length && tab.blocks.every((b) => b.view === 'tiles' && b.kind === 'list')
      ? tiersHtml(tab)
      : tab.blocks.map(genBlockHtml).join('');
  return `<div class="gd-stack">${blocks}${errHtml(refusedIn(tab.id).filter((r) => !r.key))}${translateHtml()}</div>`;
}

/** Le picker en choix unique : le nom du perso choisi. */
function pickHero(opener, chosen, onName) {
  openHeroPicker({
    title: 'Choisir un perso',
    roster: sheet.options.roster,
    imgBase: state.imgBase,
    chosen: heroByName(chosen ?? '')?.id,
    opener,
    onPick: (id) => onName(heroById(id)?.name ?? id),
  });
}

/** Les gestes d'un guide général (`data-act="gen-…"`), sur la clé du bloc, de l'entrée ou du champ. */
function genAct(el, act) {
  const key = el.dataset.key ?? '';
  const path = pathOf(key);
  const i = Number(el.dataset.i ?? -1);
  const opener = () => el;
  const redo = (focus) => {
    forgive(sub);
    render();
    if (focus) $('gd-panel').querySelector(focus)?.focus();
  };
  const blockAt = (k) => {
    for (const tab of gen.form.tabs)
      for (const block of tab.blocks) {
        const prefix = block.path.join('.');
        if (k === prefix || k.startsWith(`${prefix}.`)) return block;
      }
    return undefined;
  };
  const block = blockAt(key);
  switch (act) {
    case 'translate':
      return translate();
    case 'gen-add': {
      const list = ensureAt(gen.data, path, () => []);
      list.push(block?.kind === 'texts' ? { [def()]: '' } : blankEntry(block?.fields));
      return redo(
        `[data-entry="${key}.${list.length - 1}"] input, [data-entry="${key}.${list.length - 1}"] textarea, [data-entry="${key}.${list.length - 1}"] button`,
      );
    }
    case 'gen-add-sub': {
      if (!block?.nested) return;
      const e = getAt(gen.data, path);
      if (!e) return;
      const list = ensureAt(e, [block.nested.key], () => []);
      list.push(blankEntry(block.nested.fields));
      return redo(
        `[data-entry="${key}.${block.nested.key}.${list.length - 1}"] [data-act="gen-add-heroes"]`,
      );
    }
    case 'gen-add-hero':
      return pickHero(opener, '', (name) => {
        const list = ensureAt(gen.data, path, () => []);
        list.push(blankEntry(block?.fields, name));
        redo(
          `[data-entry="${key}.${list.length - 1}"] textarea, [data-entry="${key}.${list.length - 1}"] select`,
        );
      });
    // Un bloc `roster` : une ligne cliquée déplie sa review (un autre clic la
    // replie) ; un perso du roster sans entrée en reçoit une, dépliée.
    case 'gen-open': {
      const list = ensureAt(gen.data, path, () => []);
      let e = el.dataset.entry ? getAt(gen.data, pathOf(el.dataset.entry)) : undefined;
      if (e && e === openEntry) {
        openEntry = null;
        return redo(`[data-act="gen-open"][data-entry="${el.dataset.entry}"]`);
      }
      if (!e) {
        e = blankEntry(block?.fields, el.dataset.name ?? '');
        list.push(e);
      }
      openEntry = e;
      return redo(`[data-entry="${key}.${list.indexOf(e)}"] textarea`);
    }
    // « ＋ review » : le picker, en choix unique, sur les persos du roster du bucket qui n'ont pas d'entrée.
    case 'gen-add-review': {
      const list = ensureAt(gen.data, path, () => []);
      const names = sheet.options.rosters?.[block?.roster ?? ''] ?? [];
      const left = names.filter((n) => !list.some((e) => e.name === n));
      return openHeroPicker({
        title: 'Une review pour…',
        roster: sheet.options.roster.filter((c) => left.includes(c.name)),
        imgBase: state.imgBase,
        none: 'Tous les persos du roster ont leur review.',
        opener,
        onPick: (id) => {
          const e = blankEntry(block?.fields, heroById(id)?.name ?? id);
          list.push(e);
          openEntry = e;
          redo(`[data-entry="${key}.${list.length - 1}"] textarea`);
        },
      });
    }
    // « ＋ pas encore sorti » : une entrée au nom libre, dépliée, comme le site.
    case 'gen-add-unreleased': {
      const list = ensureAt(gen.data, path, () => []);
      const e = blankEntry(block?.fields);
      const free = block?.fields?.find((f) => f.kind === 'hero')?.unreleasedKey;
      if (free) e[free] = true;
      list.push(e);
      openEntry = e;
      return redo(`[data-entry="${key}.${list.length - 1}"] input[data-gen]`);
    }
    // « ＋ » d'un palier : le picker en multi, cochés = les persos du palier ; les
    // nouveaux à la suite dans l'ordre des clics, les décochés partent (un nom
    // hors du roster, que le picker ne connaît pas, reste à sa place).
    case 'gen-pick-tiles': {
      const list = ensureAt(gen.data, path, () => []);
      return openHeroPicker({
        title: block?.label ?? 'Persos',
        roster: sheet.options.roster,
        imgBase: state.imgBase,
        multi: true,
        chosen: list.map((e) => heroByName(e.name)?.id).filter(Boolean),
        opener,
        onPick: (ids) => {
          const next = ids.map((id) => {
            const name = heroById(id)?.name ?? id;
            return list.find((e) => e.name === name) ?? blankEntry(block?.fields, name);
          });
          list.forEach((e, i) => {
            if (!heroByName(e.name)) next.splice(Math.min(i, next.length), 0, e);
          });
          list.length = 0;
          list.push(...next);
          redo(`[data-act="gen-pick-tiles"][data-key="${key}"]`);
        },
      });
    }
    // Une cible (`target`) : ses étoiles 3-6 et « Any », la chaîne du site réécrite.
    case 'gen-target-star': {
      const r = recoStar(parseReco(getAt(gen.data, path)), Number(el.dataset.value));
      setAt(gen.data, path, formatReco(r));
      return redo(
        `[data-act="gen-target-star"][data-key="${key}"][data-value="${el.dataset.value}"]`,
      );
    }
    case 'gen-target-any': {
      const r = parseReco(getAt(gen.data, path));
      setAt(gen.data, path, formatReco({ ...r, any: !r.any, min: undefined, max: undefined }));
      return redo(`[data-act="gen-target-any"][data-key="${key}"]`);
    }
    // Une case d'impact : la note cliquée, ou vide si c'est déjà elle.
    case 'gen-impact': {
      const cur = getAt(gen.data, path);
      setAt(gen.data, path, cur === el.dataset.value ? '' : el.dataset.value);
      return redo(`[data-act="gen-impact"][data-key="${key}"][data-value="${el.dataset.value}"]`);
    }
    // Un niveau de fusion : coché ou décoché, la liste gardée en ordre croissant.
    case 'gen-level': {
      const list = ensureAt(gen.data, path, () => []);
      const lv = Number(el.dataset.value);
      const next = list.includes(lv) ? list.filter((n) => n !== lv) : [...list, lv];
      list.length = 0;
      list.push(...next.sort((a, b) => a - b));
      return redo(`[data-act="gen-level"][data-key="${key}"][data-value="${lv}"]`);
    }
    case 'gen-pick-hero': {
      const cur = getAt(gen.data, path);
      return pickHero(opener, typeof cur === 'string' ? cur : '', (name) => {
        setAt(gen.data, path, name);
        // Un palier qui ne vaut pas pour le nouveau perso : son premier palier plein.
        const e = getAt(gen.data, path.slice(0, -1));
        const stars = block?.fields?.find((f) => f.kind === 'stars');
        if (e && stars && !stepsOf(name).some((s) => s.value === e[stars.key]))
          e[stars.key] = stepsOf(name)[0]?.value ?? e[stars.key];
        redo(`[data-act="gen-pick-hero"][data-key="${key}"]`);
      });
    }
    case 'gen-del': {
      const list = getAt(gen.data, path);
      if (!Array.isArray(list)) return;
      list.splice(i, 1);
      return redo(
        `[data-act="gen-add"][data-key="${key}"], [data-act="gen-add-hero"][data-key="${key}"], [data-act="gen-add-sub"]`,
      );
    }
    case 'gen-up':
    case 'gen-down': {
      const list = getAt(gen.data, path);
      const j = act === 'gen-up' ? i - 1 : i + 1;
      if (!Array.isArray(list) || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      return redo(`[data-act="${act}"][data-key="${key}"][data-i="${j}"]`);
    }
    case 'gen-add-heroes':
    case 'gen-del-hero': {
      const names = getAt(gen.data, path);
      if (!Array.isArray(names)) return;
      const set = (next) => {
        names.length = 0;
        names.push(...next);
        redo(`[data-act="gen-add-heroes"][data-key="${key}"]`);
      };
      if (act === 'gen-del-hero') return set(names.filter((n) => n !== el.dataset.name));
      return pickHeroes(names, opener, set);
    }
    case 'gen-prio': {
      const cur = getAt(gen.data, path);
      setAt(gen.data, path, cur === el.dataset.value ? undefined : el.dataset.value);
      return redo(`[data-act="gen-prio"][data-key="${key}"][data-value="${el.dataset.value}"]`);
    }
    case 'gen-note':
      ensureAt(gen.data, path, () => ({ [def()]: '' }));
      genOpen.add(key);
      return redo(`[data-key="${key}"][data-lang="${def()}"]`);
    default:
      return undefined;
  }
}

/** La note libre d'une cible (`data-tnote`) : la chaîne recomposée, son écho mis à jour sans redessin. */
function targetNote(el) {
  const path = pathOf(el.dataset.tnote);
  const value = formatReco({ ...parseReco(getAt(gen.data, path)), note: el.value });
  setAt(gen.data, path, value);
  const out = el.parentElement?.querySelector('[data-tout]');
  if (out) out.textContent = value || '—';
  forgive(sub);
  marks();
}

/** Une saisie dans un champ nu d'un guide général (`data-gen`) : la valeur posée à sa clé. */
function genInput(el) {
  const path = pathOf(el.dataset.gen);
  const type = el.dataset.type;
  const value =
    type === 'bool'
      ? el.checked
      : type === 'number'
        ? el.value === ''
          ? undefined
          : Number(el.value)
        : type === 'nullable'
          ? el.value || null
          : el.value;
  const parent = path[path.length - 2];
  // Un coût ou une limite naissent avec une valeur entière, comme dans l'admin ;
  // vider le montant ou le compte les retire.
  if (parent === 'cost' || parent === 'limit') {
    const at = path.slice(0, -1);
    const last = path[path.length - 1];
    if ((last === 'amount' || last === 'count') && value === undefined)
      setAt(gen.data, at, undefined);
    else {
      const o = ensureAt(gen.data, at, () =>
        parent === 'cost' ? { currency: 'TBD', amount: 0 } : { count: 1, period: 'weekly' },
      );
      o[last] = value;
    }
  } else setAt(gen.data, path, value);
  forgive(sub);
  // Une case ou une limite changent la forme du champ voisin : redessin ; sinon les marques suffisent.
  if (type === 'bool' || parent === 'limit') return render();
  marks();
  return undefined;
}

/** La photo des anglais d'un guide général : ce qui est « déjà traduit » au chargement. */
function genBaseline() {
  for (const t of genTexts()) at.set(t, t[def()] ?? '');
}

/**
 * Un guide général relu du disque : son état (`/api/guides/general`), sa
 * forme, ses données — c'est lui qui fait foi, la saisie en attente est
 * abandonnée, sauf `keep`.
 */
async function loadGeneral(slug, keep = false) {
  const s = await getJson(`/api/guides/general?slug=${encodeURIComponent(slug)}`);
  if (!s.data || !s.spec || !s.langs)
    throw new Error('quick lancé avant ce code : Ctrl-C puis `pnpm quick`');
  const first = !sheet;
  const other = !gen || gen.slug !== slug;
  sheet = s;
  wanted = null;
  pv.lang ||= s.langs.default;
  was = JSON.parse(JSON.stringify(s.data));
  draft = null;
  meta = null;
  if (!keep || other) {
    gen = { slug, form: s.spec, data: s.data, was };
    refused = [];
    pinTouched.clear();
    tr = { busy: tr.busy, error: '' };
    pv.segs.clear();
    pv.sent = '';
    openEntry = null;
    genBaseline();
  } else gen.was = was;
  if (other) {
    const tabs = s.spec.tabs;
    // Un autre guide s'ouvre sur son premier onglet.
    if (!tabs.some((t) => t.id === sub) || !first) sub = tabs[0].id;
    created = null;
    adding = false;
    trOpen.clear();
    genOpen.clear();
  }
  // Le sous-onglet que le hash demande passe devant, s'il est de ce guide.
  if (subsOn().some((t) => t.id === wantedSub)) sub = wantedSub;
  wantedSub = null;
  ver = 0;
  render();
  if (!$('tab-guides').hidden) writeHash();
}

// ------------------------------------------------------ l'import de contribution
/** Un fichier déposé : lu, remis au serveur tel quel ; la vue d'ensemble relue s'il a écrit. */
async function importFile(file) {
  let contribution;
  try {
    contribution = JSON.parse(await file.text());
  } catch (e) {
    return log(
      [
        `Contribution illisible : ${file.name} n’est pas du JSON (${e instanceof Error ? e.message : e}).`,
      ],
      false,
    );
  }
  const drop = $('gd-drop');
  drop.classList.add('busy');
  drop.setAttribute('aria-busy', 'true');
  log([], undefined, `import de ${file.name}`);
  try {
    const r = await post('/api/guides/import', { contribution });
    if (r.imported) reloadOverview();
  } catch (e) {
    log([`Import interrompu : ${e}`], false);
  } finally {
    drop.classList.remove('busy');
    drop.removeAttribute('aria-busy');
  }
  return undefined;
}
$('gd-drop').onclick = () => $('gd-file').click();
$('gd-drop').onkeydown = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    $('gd-file').click();
  }
};
$('gd-drop').ondragover = (e) => {
  e.preventDefault();
  $('gd-drop').classList.add('over');
};
$('gd-drop').ondragleave = () => $('gd-drop').classList.remove('over');
$('gd-drop').ondrop = (e) => {
  e.preventDefault();
  $('gd-drop').classList.remove('over');
  const f = e.dataTransfer?.files?.[0];
  if (f) importFile(f);
};
$('gd-file').onchange = () => {
  const f = $('gd-file').files?.[0];
  if (f) importFile(f);
  $('gd-file').value = '';
};

// ------------------------------------------------------ le dessin
/** Une textarea prend la hauteur de son texte (deux lignes au moins, par `rows`). */
function grow(area) {
  if (!area.scrollHeight) return;
  area.style.height = 'auto';
  area.style.height = `${area.scrollHeight + 2}px`;
}
const growAll = (root) => root.querySelectorAll('textarea[data-key]').forEach(grow);

/** Les « Traductions » dépliées à l'écran : un redessin les rouvre. */
function keepOpen() {
  for (const d of $('gd-panel').querySelectorAll('[data-text] details')) {
    const k = d.closest('[data-text]').dataset.text;
    if (d.open) trOpen.add(k);
    else trOpen.delete(k);
  }
}

/** Le sous-onglet montré, redessiné en entier. */
function render() {
  const panel = $('gd-panel');
  keepOpen();
  texts.clear();
  tokens.clear();
  renderOverview();
  if (!sheet) {
    panel.innerHTML = '';
    head();
    bar();
    subTabs();
    versionsBar();
    pvLangs();
    return;
  }
  // Les refus qui ne visent aucun sous-onglet (le disque a changé, la forme) : en tête.
  const global = errHtml(refused.filter((r) => !subsOn().some((t) => t.id === r.tab)));
  if (gen) {
    if (!subsOn().some((t) => t.id === sub)) sub = subsOn()[0].id;
    panel.innerHTML = global + genTabHtml();
    growAll(panel);
    head();
    subTabs();
    versionsBar();
    bar();
    pvLangs();
    pvAsk();
    return;
  }
  if (!v() && sub !== 'meta' && sub !== 'intro') sub = 'meta';
  const content = !v()
    ? sub === 'meta'
      ? metaHtml()
      : sub === 'intro'
        ? introHtml()
        : '<div class="empty">Aucune version : « ＋ version » pour commencer.</div>'
    : {
        meta: metaHtml,
        battle: spec().raid ? rBattleHtml : battleHtml,
        intro: introHtml,
        tips: tipsHtml,
        notes: notesHtml,
        reco: recoHtml,
        team: teamHtml,
        videos: videosHtml,
        phase1: rPhase1Html,
        phase2: rPhase2Html,
      }[sub]();
  panel.innerHTML = global + content;
  growAll(panel);
  head();
  counted(() => {
    subTabs();
    versionsBar();
    bar();
  });
  pvLangs();
  pvAsk();
}

/** Ce qui suit une saisie SANS redessiner : les badges, les points, la savebar, l'en-tête. */
function marks() {
  const panel = $('gd-panel');
  for (const el of panel.querySelectorAll('[data-text]')) {
    const t = texts.get(el.dataset.text);
    if (!t) continue;
    const list = Array.isArray(t);
    el.querySelector('[data-stale]').textContent = (list ? t.some(stale) : stale(t))
      ? 'à retraduire'
      : '';
    el.querySelector('[data-tally]').textContent = list
      ? t.length
        ? `${t.filter((x) => others().every((l) => x[l]?.trim())).length} / ${t.length} entières`
        : '—'
      : tally(t);
    el.classList.remove('ko');
    el.querySelector('.refused')?.classList.remove('refused');
    const err = el.querySelector('.gd-err');
    if (err) err.textContent = '';
  }
  if (!gen && sub === 'meta') {
    const strong = $('gd-head').querySelector('strong');
    if (strong) strong.textContent = meta.title[def()] || sheet.guide.title;
    const hidden = $('gd-head').querySelector('[data-hidden]');
    if (hidden) hidden.textContent = meta.hidden ? 'caché' : '';
    const updating = $('gd-head').querySelector('[data-updating]');
    if (updating) updating.textContent = meta.updating ? 'en mise à jour' : '';
  }
  counted(() => {
    subTabs();
    versionsBar();
    bar();
  });
}

// ------------------------------------------------------ l'aperçu
/** L'aperçu des textes en place : son atténuation, et `redraw` son contenu. */
function pvPaint(redraw) {
  const panel = $('gd-panel');
  for (const el of panel.querySelectorAll('[data-pv], [data-pv-list]')) {
    el.classList.toggle('busy', pv.busy);
    if (!redraw) continue;
    if (el.dataset.pv !== undefined) el.innerHTML = pvBody(el.dataset.pv);
    else {
      const list = texts.get(el.dataset.pvList) ?? [];
      el.innerHTML = list.length
        ? `<ul>${list.map((_, i) => `<li data-pv="${esc(`${el.dataset.pvList}:${i}`)}">${pvBody(`${el.dataset.pvList}:${i}`)}</li>`).join('')}</ul>`
        : '';
    }
  }
  for (const el of panel.querySelectorAll('[data-pv-error]')) el.textContent = pv.error;
}

/** Les textes à prévisualiser du sous-onglet montré : clé → texte dans la langue de l'aperçu. */
function pvTexts() {
  const out = [];
  const pick = (t) => (t[pv.lang]?.trim() ? t[pv.lang] : (t[def()] ?? ''));
  for (const [key, t] of texts)
    if (Array.isArray(t)) t.forEach((x, i) => out.push([`${key}:${i}`, pick(x)]));
    else out.push([key, pick(t)]);
  // Les chaînes nues d'un build de guild raid (priorité, équipement) : telles quelles.
  for (const [key, value] of tokens) out.push([key, value]);
  return out;
}

/**
 * Demande l'aperçu de TOUS les textes du sous-onglet montré, dans la langue de
 * la savebar — une langue qu'un texte ne porte pas se replie sur l'anglais,
 * comme au rendu du site. Pendant la requête le rendu précédent reste,
 * atténué ; une réponse arrivée après une requête plus récente est ignorée ;
 * un refus est dit près de « Traduire », et se retente au prochain changement.
 */
async function pvFetch() {
  if (!sheet) return;
  const shown = pvTexts();
  if (!shown.length) return;
  const body = JSON.stringify({ texts: shown.map(([, t]) => t), lang: pv.lang });
  const sent = `${shown.map(([k]) => k).join()} ${body}`;
  if (sent === pv.sent) return;
  pv.sent = sent;
  const mine = ++pv.seq;
  pv.busy = true;
  pvPaint(false);
  let error = '';
  try {
    const res = await fetch('/api/guides/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const r = await res.json();
    if (mine !== pv.seq) return;
    if (!res.ok || !r.segments) throw new Error(r.error ?? r.log?.[0] ?? `réponse ${res.status}`);
    shown.forEach(([k], i) => pv.segs.set(k, r.segments[i] ?? []));
  } catch (e) {
    if (mine !== pv.seq) return;
    error = `Aperçu indisponible : ${e instanceof Error ? e.message : String(e)}`;
    pv.sent = '';
  }
  pv.error = error;
  pv.busy = false;
  pvPaint(true);
}
function pvAsk(delay = 0) {
  clearTimeout(pv.timer);
  if (delay) pv.timer = setTimeout(pvFetch, delay);
  else pvFetch();
}

// ------------------------------------------------------ la saisie
$('gd-panel').oninput = (e) => {
  if (!sheet) return;
  const note = e.target.closest('[data-tnote]');
  if (note) return targetNote(note);
  const nude = e.target.closest('[data-gen]');
  if (nude) return genInput(nude);
  // Un champ nu d'un guild raid (stat, priorité, équipement, sprite, auteur) ; son `select` : `change`.
  if (!gen && spec().raid && !e.target.matches('select') && raidInput(e.target)) return undefined;
  const field = e.target.closest('[data-key]');
  if (field) {
    const key = field.dataset.key;
    const { lang } = field.dataset;
    const t = texts.get(key);
    if (!t) return;
    if (field.hasAttribute('data-block')) blockToItems(field.value, t, lang);
    else if (field.value || lang === def()) t[lang] = field.value;
    else delete t[lang];
    forgive(sub);
    if (field.tagName === 'TEXTAREA') grow(field);
    // Une traduction pas encore écrite montre l'anglais qu'elle remplacera.
    if (lang === def())
      for (const other of field.closest('[data-text]').querySelectorAll('.gd-trs [data-key]'))
        other.placeholder = field.value;
    marks();
    return pvAsk(PV_DELAY);
  }
  const stage = e.target.closest('input[data-stage]');
  if (stage) {
    const t = v().teams[Number(stage.dataset.i)];
    if (!t) return;
    const s = [...(t.stages ?? [1, 1])];
    s[Number(stage.dataset.stage)] = Number(stage.value) || 1;
    t.stages = s;
    forgive('team');
    marks();
  }
};
$('gd-panel').onchange = (e) => {
  if (!sheet) return;
  // Un `select` ou une case d'un guide général : `change` seulement, pas `input`.
  const nude = e.target.closest('select[data-gen], input[type="checkbox"][data-gen]');
  if (nude) return genInput(nude);
  if (!gen && spec().raid && e.target.matches('select[data-rkind]')) return raidInput(e.target);
  const box = e.target.closest('input[data-meta="hidden"], input[data-meta="updating"]');
  if (box) {
    meta[box.dataset.meta] = box.checked;
    forgive('meta');
    marks();
  }
};
// Des « Traductions » dépliées : leurs textarea prennent leur hauteur. Un groupe
// (`group`) déplié le reste d'un dessin à l'autre : sa clé dans `genOpen`.
$('gd-panel').addEventListener(
  'toggle',
  (e) => {
    const group = e.target.dataset?.group;
    if (group) genOpen[e.target.open ? 'add' : 'delete'](group);
    if (e.target.open) growAll(e.target);
  },
  true,
);

// Le glisser-déposer des vignettes d'un palier (`view: 'tiles'`), branché UNE
// fois sur le panneau : les rangées se redessinent, le branchement tient. Un
// dépôt écrit la liste de départ et celle d'arrivée (la même, ou un autre
// palier), puis redessine ; le palier (`stars`) suit le perso.
sortable($('gd-panel'), {
  item: '.gd-pick',
  list: '.gd-tiles',
  onMove: (from, to, fromList, toList) => {
    if (!gen) return;
    const a = getAt(gen.data, pathOf(fromList.dataset.key ?? ''));
    const b = fromList === toList ? a : getAt(gen.data, pathOf(toList.dataset.key ?? ''));
    if (!Array.isArray(a) || !Array.isArray(b)) return;
    const [e] = a.splice(from, 1);
    if (!e) return;
    b.splice(to, 0, e);
    forgive(sub);
    render();
    $('gd-panel')
      .querySelector(`.gd-pick[data-key="${toList.dataset.key}"][data-i="${to}"] select`)
      ?.focus();
  },
});

/** Le picker partagé, en lignes, sur des options `{ id, name, icon? }`. */
function pickRows({ title, options, chosen, placeholder, none, opener, onPick }) {
  openHeroPicker({
    title,
    roster: options,
    imgBase: state.imgBase,
    rows: true,
    tile: (o) =>
      `${o.icon ? `<img class="gd-pico" src="${srcAt(o.icon)}" alt="" aria-hidden="true" width="36" height="36" loading="lazy" />` : ''}<span class="gd-pk"><span class="gd-pname">${esc(o.name)}</span><span class="gd-pid">${esc(o.id)}</span></span>`,
    hint: (o) => `${o.name} — ${o.id}`,
    match: (o, q) => starts(o.name, q) || o.id.toLowerCase().startsWith(q),
    placeholder,
    none,
    tally: () => plural(options.length, 'choix'),
    filters: pkFilters,
    chosen,
    opener,
    onPick,
  });
}

/** Le picker de héros, en multi, sur les noms d'une rangée : les noms choisis reviennent. */
function pickHeroes(names, opener, set) {
  openHeroPicker({
    title: 'Persos',
    roster: sheet.options.roster,
    imgBase: state.imgBase,
    multi: true,
    chosen: names.map((n) => heroByName(n)?.id).filter(Boolean),
    opener,
    onPick: (ids) => set(ids.map((id) => heroById(id)?.name ?? id)),
  });
}

$('gd-panel').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !sheet) return;
  const { act } = el.dataset;
  if (gen) return genAct(el, act);
  if (act === 'raid') return raidAct(el);
  const i = Number(el.dataset.i ?? -1);
  const si = Number(el.dataset.s ?? -1);
  const x = v();
  const redo = (focus) => {
    forgive(sub);
    render();
    if (focus) $('gd-panel').querySelector(focus)?.focus();
  };
  const groupAt = () => (spec().recoSections ? x.recoSections[si]?.groups[i] : x.recommended[i]);
  const opener = () => el;
  const groupSelector = si >= 0 ? `[data-s="${si}"][data-i="${i}"]` : `[data-i="${i}"]`;

  switch (act) {
    case 'translate':
      return translate();
    // Méta — rien de plus que la case (`onchange`).
    // Combat.
    case 'pick-group': {
      const options = sheet.options.groups.map((g) => ({
        id: g.group,
        name: g.label,
        icon: g.icon,
      }));
      return pickRows({
        title: 'Choisir un combat',
        options,
        chosen: spec().versioned ? draft.versions.find((y) => y.group)?.group : x.group,
        placeholder: 'Chercher un combat…',
        none: 'Aucun combat ne correspond.',
        opener,
        onPick: (group) => {
          // Versionné : à TOUTES les versions qui en portent déjà un, et à celle-ci.
          if (spec().versioned)
            for (const y of draft.versions)
              if (y.group || y === x) y.group = group;
              else x.group = group;
          redo('[data-act="pick-group"]');
        },
      });
    }
    case 'pick-boss':
      return pickRows({
        title: 'Choisir un boss',
        options: sheet.options.monsters.map((m) => ({ id: m.id, name: m.label })),
        chosen: x.bossId,
        placeholder: 'Chercher un monstre…',
        none: 'Aucun monstre ne correspond.',
        opener,
        onPick: (id) => {
          x.bossId = id;
          redo('[data-act="pick-boss"]');
        },
      });
    case 'add-dungeon':
      return pickRows({
        title: 'Ajouter un donjon',
        options: sheet.options.dungeons
          .filter((d) => !(x.dungeons ?? []).includes(d.id))
          .map((d) => ({ id: d.id, name: d.label })),
        placeholder: 'Chercher un donjon…',
        none: 'Aucun donjon ne correspond.',
        opener,
        onPick: (id) => {
          x.dungeons = [...(x.dungeons ?? []), id];
          redo('[data-act="add-dungeon"]');
        },
      });
    case 'del-dungeon':
      x.dungeons = (x.dungeons ?? []).filter((_, j) => j !== i);
      return redo('[data-act="add-dungeon"]');
    case 'up-dungeon':
    case 'down-dungeon': {
      const d = [...(x.dungeons ?? [])];
      const j = act === 'up-dungeon' ? i - 1 : i + 1;
      if (j < 0 || j >= d.length) return;
      [d[i], d[j]] = [d[j], d[i]];
      x.dungeons = d;
      return redo(`[data-act="${act}"][data-i="${j}"]`);
    }
    case 'unpin':
      x.pinned = (x.pinned ?? []).filter((k) => k.split('@')[0] !== el.dataset.id);
      pinTouched.add(x.key);
      return redo();
    // Tips.
    case 'add-section':
      x.tipSections.push({ tips: [] });
      return redo(`[data-card="tips-${x.tipSections.length - 1}"] input`);
    case 'del-section':
      x.tipSections.splice(i, 1);
      return redo('[data-act="add-section"]');
    // Notes.
    case 'add-note':
      x.notes.push({ [def()]: '' });
      return redo(`[data-card="note-${x.notes.length - 1}"] textarea`);
    case 'del-note':
      x.notes.splice(i, 1);
      return redo('[data-act="add-note"]');
    // Persos.
    case 'add-reco-section':
      x.recoSections.push({ groups: [] });
      return redo(`[data-card="reco-${x.recoSections.length - 1}"] input`);
    case 'del-reco-section':
      x.recoSections.splice(si, 1);
      return redo('[data-act="add-reco-section"]');
    case 'add-group': {
      const list = spec().recoSections ? x.recoSections[si]?.groups : x.recommended;
      if (!list) return;
      list.push({ characters: [] });
      return redo(
        `.gd-group[data-i="${list.length - 1}"]${si >= 0 ? `[data-s="${si}"]` : ''} [data-act="add-hero"]`,
      );
    }
    case 'del-group': {
      const list = spec().recoSections ? x.recoSections[si]?.groups : x.recommended;
      list?.splice(i, 1);
      return redo(`[data-act="add-group"]${si >= 0 ? `[data-s="${si}"]` : ''}`);
    }
    // Équipe.
    case 'add-team':
      x.teams.push(spec().teams === 'buckets' ? { stages: [1, 1], slots: [] } : { slots: [] });
      return redo(`[data-card="team-${x.teams.length - 1}"] [data-act="add-slot"]`);
    case 'del-team':
      x.teams.splice(i, 1);
      return redo('[data-act="add-team"]');
    case 'add-slot':
      if (x.teams[i].slots.length < MAX_SLOTS) x.teams[i].slots.push([]);
      return redo(`[data-card="team-${i}"] .gd-slot:last-child [data-act="add-hero"]`);
    case 'del-slot':
      x.teams[i].slots.splice(Number(el.dataset.slot), 1);
      return redo(`[data-card="team-${i}"] [data-act="add-slot"]`);
    // Les persos d'un slot ou d'un groupe.
    case 'add-hero':
    case 'del-hero': {
      const slot =
        el.dataset.slot !== undefined ? x.teams[i]?.slots[Number(el.dataset.slot)] : null;
      const group = slot ? null : groupAt();
      const names = slot ?? group?.characters;
      if (!names) return;
      const set = (next) => {
        names.length = 0;
        names.push(...next);
        redo(
          slot
            ? `[data-card="team-${i}"] [data-slot="${el.dataset.slot}"][data-act="add-hero"]`
            : `.gd-group${groupSelector} [data-act="add-hero"]`,
        );
      };
      if (act === 'del-hero') return set(names.filter((n) => n !== el.dataset.name));
      return pickHeroes(names, opener, set);
    }
    // Vidéos.
    case 'del-video':
      x.videos.splice(i, 1);
      return redo('#gd-va [data-va="url"]');
    default:
      return;
  }
};

$('gd-head').onclick = (e) => {
  if (e.target.closest('[data-act="back"]')) back();
};

$('gd-versions').onclick = (e) => {
  const tab = e.target.closest('[data-ver]');
  if (tab) return showVersion(Number(tab.dataset.ver));
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const { act } = el.dataset;
  if (act === 'add-version') {
    adding = !adding;
    versionsBar();
    $('gd-newkey')?.focus();
  } else if (act === 'cancel-version') {
    adding = false;
    versionsBar();
  } else if (act === 'create-version') createVersion();
  else if (act === 'changelog') {
    e.preventDefault();
    const values = Object.fromEntries(new URLSearchParams(el.getAttribute('href').split('?')[1]));
    sections.go('changelog');
    if (!document.getElementById('tab-changelog')?.hidden) {
      const { template, ...rest } = values;
      if (!openTemplate(template, rest))
        log(
          ['Le Journal du site n’est pas encore chargé : « ＋ Mise à jour » dans son onglet.'],
          false,
        );
    }
  }
};
$('gd-versions').onchange = (e) => {
  const box = e.target.closest('input[data-vhidden]');
  if (!box || !v()) return;
  if (box.checked) v().hidden = true;
  else delete v().hidden;
  marks();
};
$('gd-versions').onkeydown = (e) => {
  if (e.key === 'Enter' && e.target.id === 'gd-newkey') {
    e.preventDefault();
    createVersion();
  }
};

/**
 * « Traduire » : les textes anglais du sous-onglet montré, d'un seul appel
 * (`POST /api/translate`), posés dans les autres langues — celles en place
 * sont ÉCRASÉES, l'anglais fait foi, comme dans l'admin. Rien ne part au
 * disque avant « Enregistrer ». Un refus va au journal, rien ne bouge.
 */
async function translate() {
  if (tr.busy || !sheet) return;
  const todo = [];
  // Les textes de l'onglet : ceux dessinés — ou, pour un guide général, ceux de ses données.
  // … et pour une phase d'un guild raid, ceux de TOUTES ses équipes, pas de la seule montrée.
  const phase = !gen && spec().raid && (sub === 'phase1' || sub === 'phase2');
  for (const t of gen ? genTexts(sub) : phase ? rTexts(raid(), sub) : texts.values())
    for (const x of Array.isArray(t) ? t : [t]) if (en(x)) todo.push({ text: x, en: x[def()] });
  if (!todo.length) return log(['Rien à traduire : aucun texte anglais dans cet onglet.'], true);
  tr = { busy: true, error: '' };
  for (const el of $('gd-panel').querySelectorAll('[data-act="translate"]')) {
    el.disabled = true;
    el.classList.add('busy');
  }
  log([], undefined, `traduction de ${plural(todo.length, 'texte')}`);
  let filled = 0;
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texts: todo.map((x) => x.en) }),
    });
    const r = await res.json();
    if (!r.results) throw new Error(r.error ?? r.log?.[0] ?? `réponse ${res.status}`);
    if (r.provider === 'none') throw new Error('le traducteur n’a rien rendu');
    todo.forEach((x, i) => {
      const out = r.results[i] ?? {};
      const got = Object.keys(out).filter((l) => others().includes(l) && out[l]?.trim());
      if (!got.length) return;
      for (const l of got) x.text[l] = out[l].trim();
      at.set(x.text, x.en);
      filled += got.length;
    });
    forgive(sub);
    log(
      [
        filled
          ? `${plural(todo.length, 'texte')} : ${plural(filled, 'traduction')} posée${filled > 1 ? 's' : ''} par ${
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
    if (filled)
      for (const d of $('gd-panel').querySelectorAll('[data-text] details')) d.open = true;
    render();
  }
}

// ------------------------------------------------------ les sous-onglets, les versions
/** L'adresse dit le guide et sa version, ou la catégorie dépliée : recharger y revient. */
const writeHash = () =>
  history.replaceState(
    null,
    '',
    sheet
      ? `#guides/${encodeURIComponent(sheet.guide.category)}/${encodeURIComponent(sheet.guide.slug)}${
          spec().versioned && v() ? `/${encodeURIComponent(v().key)}` : ''
        }`
      : cat
        ? `#guides/${encodeURIComponent(cat)}`
        : '#guides',
  );

function showSub(id) {
  if (id === sub || !subsOn().some((s) => s.id === id)) return;
  sub = id;
  render();
}
$('gd-tabs').onclick = (e) => {
  const el = e.target.closest('[role="tab"]');
  if (el) showSub(el.dataset.sub);
};
$('gd-tabs').onkeydown = (e) => {
  const on = subsOn();
  const i = on.findIndex((s) => s.id === sub);
  const to = {
    ArrowLeft: (i + on.length - 1) % on.length,
    ArrowRight: (i + 1) % on.length,
    Home: 0,
    End: on.length - 1,
  }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  showSub(on[to].id);
  $(`gd-tab-${sub}`)?.focus();
};

function showVersion(i) {
  if (!draft.versions[i] || i === ver) return;
  ver = i;
  rTeam = 0;
  rVid = '';
  render();
  writeHash();
}

// ------------------------------------------------------ le guide
/** La photo des anglais : ce qui est « déjà traduit » au chargement. */
function baseline() {
  for (const t of [...allTexts(draft), meta.title, meta.description]) at.set(t, t[def()] ?? '');
}

/**
 * Un guide relu du disque : c'est lui qui fait foi. La saisie en attente est
 * abandonnée — sauf `keep`, où l'appelant la repose lui-même.
 */
async function load(cat, slug, keep = false) {
  if (cat === 'general-guides') return loadGeneral(slug, keep);
  const s = await getJson(
    `/api/guides/state?cat=${encodeURIComponent(cat)}&slug=${encodeURIComponent(slug)}`,
  );
  if (!s.draft || !s.spec || !s.langs)
    throw new Error('quick lancé avant ce code : Ctrl-C puis `pnpm quick`');
  // Lu : un guide général ouvert cède la place (illisible, il reste entier).
  gen = null;
  const key = wanted?.version ?? (draft ? v()?.key : undefined);
  const first = !sheet;
  const other = sheet?.guide.category !== cat || sheet?.guide.slug !== slug;
  sheet = s;
  wanted = null;
  pv.lang ||= s.langs.default;
  was = JSON.parse(JSON.stringify({ draft: s.draft, meta: s.meta }));
  if (!keep || other) {
    draft = s.draft;
    meta = s.meta;
    refused = [];
    pinTouched.clear();
    tr = { busy: tr.busy, error: '' };
    pv.segs.clear();
    pv.sent = '';
    baseline();
  }
  if (other) {
    // Un autre guide s'ouvre sur Méta ; le premier garde le sous-onglet montré.
    if (!first || !subsOn().some((t) => t.id === sub)) sub = 'meta';
    created = null;
    adding = false;
    trOpen.clear();
    vidAdd.reset();
    raidVid.reset();
    rTeam = 0;
    rVid = '';
  }
  // Le sous-onglet que le hash demande passe devant, s'il est de ce guide.
  if (subsOn().some((t) => t.id === wantedSub)) sub = wantedSub;
  wantedSub = null;
  const i = draft.versions.findIndex((x) => x.key === key);
  ver = i >= 0 ? i : 0;
  render();
  if (!$('tab-guides').hidden) writeHash();
}
const reload = (cat, slug) => load(cat, slug).catch((e) => log([`Guide illisible : ${e}`], false));

/** Un guide choisi dans la vue d'ensemble (ou par le hash). */
function choose(cat, slug) {
  if (sheet && sheet.guide.category === cat && sheet.guide.slug === slug) return;
  if (!leave()) return;
  reload(cat, slug);
}

/**
 * Retour à la vue d'ensemble, sur la catégorie du guide (ou `to`, celle que le
 * hash demande) : sur confirmation s'il reste des changements.
 */
function back(to = sheet?.guide.category) {
  if (!sheet || !leave()) return;
  cat = to;
  sheet = draft = meta = was = gen = null;
  refused = [];
  render();
  writeHash();
  reloadOverview();
}

$('gd-reset').onclick = () => reload(sheet.guide.category, sheet.guide.slug);

/**
 * « Enregistrer » : tout le guide — le brouillon entier, le meta, et ce que la
 * page avait chargé (`was`) — pour UN commit `chore(guides): <cat>/<slug>`,
 * puis le disque relu. Un refus SITUÉ garde la saisie, son message sous la
 * ligne, le point rouge sur l'onglet et la version — sauf `stale` : le disque
 * avait changé, il est relu tel quel.
 */
$('gd-save').onclick = async () => {
  if (!sheet || !changes()) return;
  const { category, slug } = sheet.guide;
  $('gd-save').disabled = $('gd-reset').disabled = true;
  $('gd-save').classList.add('busy');
  log([], undefined, 'envoi du guide au serveur');
  try {
    // Un guide général : ses données entières à sa route ; un guide de boss : le brouillon et le meta.
    const r = gen
      ? await post('/api/guides/general', { slug, data: genClean(gen.data), was })
      : await post('/api/guides', {
          category,
          slug,
          draft: draftOut(),
          meta: metaOut(),
          was,
        });
    refused = r.refused ?? [];
    if (r.written || r.stale) {
      // Le disque fait foi : relu, la saisie abandonnée (écrite, ou périmée).
      await load(category, slug);
      refused = r.refused ?? [];
    }
  } catch (e) {
    log([`Enregistrement interrompu : ${e}`], false);
  } finally {
    $('gd-save').classList.remove('busy');
    render();
  }
};

/** « ＋ version » : la clé saisie, dupliquée de la version choisie ; sans changement en attente. */
async function createVersion() {
  const key = $('gd-newkey')?.value.trim() ?? '';
  const from = $('gd-fromkey')?.value ?? '';
  if (!key) return log(['Clé de version requise (AAAA-MM).'], false);
  if (changes())
    return log(
      ['Des changements attendent : « Enregistrer » d’abord, puis « ＋ version ».'],
      false,
    );
  const { category, slug } = sheet.guide;
  const btn = $('gd-versions').querySelector('[data-act="create-version"]');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('busy');
  }
  log([], undefined, `création de la version ${key}`);
  try {
    const r = await post('/api/guides/version', { category, slug, newKey: key, fromKey: from });
    if (!r.ok || !r.draft) return;
    adding = false;
    created = r.version;
    wanted = { cat: category, slug, version: r.version };
    await load(category, slug);
  } catch (e) {
    log([`Création interrompue : ${e}`], false);
  } finally {
    versionsBar();
  }
}

/** Quitter le guide avec des changements en attente : sur confirmation. */
function leave() {
  const n = sheet ? changes() : 0;
  return (
    !n ||
    confirm(
      `${n} onglet${n > 1 ? 's' : ''} modifié${n > 1 ? 's' : ''}, pas encore enregistré${n > 1 ? 's' : ''} sur ${sheet.guide.category}/${sheet.guide.slug}. Quitter ? Les changements restent en attente tant que la page n’est pas rechargée.`,
    )
  );
}

/**
 * Ce que le hash demande de Guides : une catégorie (`{ cat }`), un guide
 * (`{ cat, slug, version, sub }`, la version et le sous-onglet s'il les
 * porte), ou rien — `#guides` nu, l'adresse d'une autre section.
 */
function asked() {
  const [, gcat, slug, ...rest] =
    /^#guides\/([^/]+)\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(location.hash) ?? [];
  // Une catégorie seule : `openCat` la retient si le serveur la sert et que quick l'édite.
  const [, only] = /^#guides\/([^/]+)$/.exec(location.hash) ?? [];
  if (only) return { cat: decodeURIComponent(only) };
  if (!gcat) return null;
  const parts = rest.filter(Boolean).map(decodeURIComponent);
  const version = /^\d{4}-\d{2}$/.test(parts[0] ?? '') ? parts.shift() : undefined;
  // Ce qui reste : un sous-onglet (`tips`, `team`, ou `premium`, `guild` d'un guide général).
  return { cat: decodeURIComponent(gcat), slug: decodeURIComponent(slug), version, sub: parts[0] };
}

/**
 * Le guide que le hash demandait ne s'est pas lu : plus rien n'est attendu
 * (`open()` ne l'attend plus à chaque retour), le journal le dit — « inconnu »
 * quand c'est le mot du serveur (`guide inconnu : …`, que `getJson` rapporte),
 * « illisible » et la cause sinon : un contenu en code, des données
 * illisibles, un serveur qui ne répond pas. Le guide ouvert reste et
 * l'adresse le redit ; sans guide ouvert, la vue d'ensemble, sur la catégorie
 * demandée si elle s'ouvre (`openCat` : sinon la dernière montrée, sinon la
 * première).
 */
function missed(to, e) {
  wanted = wantedSub = null;
  log(
    [
      String(e).includes('guide inconnu')
        ? `Guide inconnu : ${to.cat}/${to.slug}`
        : `Guide illisible : ${e}`,
    ],
    false,
  );
  if (sheet) return writeHash();
  cat = to.cat;
  return reloadOverview();
}

/**
 * Ce que le hash demande, la page déjà chargée (`sections.go('guides/…')`,
 * d'une autre section ou d'ici) : ce guide, sur sa version et son sous-onglet,
 * ou la vue d'ensemble sur cette catégorie. Le guide ouvert ne se quitte avec
 * des changements que sur confirmation (`leave`) ; refusé, il reste, et
 * l'adresse le redit.
 */
function follow(to) {
  if (!to.slug) {
    if (sheet) {
      back(to.cat);
      if (sheet) writeHash();
      return undefined;
    }
    cat = to.cat;
    query = $('gd-q').value = '';
    writeHash();
    return reloadOverview();
  }
  const same = sheet?.guide.category === to.cat && sheet.guide.slug === to.slug;
  if (same && changes()) {
    // Le guide ouvert, sa saisie en attente : pas de relecture, la version et
    // le sous-onglet demandés se montrent sur elle.
    const i = draft?.versions.findIndex((x) => x.key === to.version) ?? -1;
    if (i >= 0) ver = i;
    if (subsOn().some((t) => t.id === to.sub)) sub = to.sub;
    render();
    writeHash();
    return undefined;
  }
  if (!same && !leave()) {
    writeHash();
    return undefined;
  }
  wanted = { cat: to.cat, slug: to.slug, version: to.version };
  wantedSub = to.sub ?? null;
  return load(to.cat, to.slug).catch((e) => missed(to, e));
}

sections.register('guides', {
  init: () => {
    // `#guides` : la vue d'ensemble, sur la dernière catégorie visitée ;
    // `#guides/<cat>` : sur cette catégorie ; `#guides/<cat>/<slug>` : un guide
    // (un général aussi : `#guides/general-guides/premium-limited`) ;
    // `#guides/<cat>/<slug>/<version>` : une de ses versions — les formes
    // que la page écrit. Un segment de plus, `/<sous-onglet>` (`tips`,
    // `team`, ou `limited`, `guild` d'un général), l'ouvre sur ce sous-onglet :
    // pour un lien ou le banc, la page ne l'écrit pas. `lib.js` ne connaît que `#guides` : c'est le clic sur
    // l'onglet qui l'ouvre.
    const to = asked();
    if (to?.slug) {
      wanted = { cat: to.cat, slug: to.slug, version: to.version };
      wantedSub = to.sub ?? null;
    } else if (to) cat = to.cat;
    if (to) document.querySelector('#tabs [data-tab="guides"]')?.click();
    head();
    bar();
    stateLoaded.then(() => {
      if (state.imgBase === drawnBase) return;
      render();
    });
    // Le guide du hash : inconnu du serveur, la section ne reste pas blanche.
    if (wanted) return load(to.cat, to.slug).catch((e) => missed(to, e));
    return undefined;
  },
  // Chaque venue à l'écran : ce que le hash demande (une venue par un chemin,
  // `sections.go('guides/<cat>/<slug>')` de l'Extraction), sinon la vue
  // d'ensemble relue, ou le guide (s'il n'y a rien en attente).
  open: () => {
    const to = asked();
    const coming = wanted && wanted.cat === to?.cat && wanted.slug === to.slug;
    if (to && !coming) return follow(to);
    if (wanted) return undefined; // le guide du hash arrive
    if (!sheet) {
      writeHash();
      return reloadOverview();
    }
    writeHash();
    if (!changes()) reload(sheet.guide.category, sheet.guide.slug);
    return undefined;
  },
  dirty: () => (sheet ? changes() : 0),
  canLeave: leave,
});
