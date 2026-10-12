// Onglet « Événements » : les événements communautaires du site (`/event`,
// `/event/<slug>` — `data/curated/events.json`), l'éditeur « Tools › Events »
// de l'admin porté dans la coquille des Guides : la liste dans l'ordre du
// fichier, un événement ouvert en trois sous-onglets — Méta, Jalons, Blocs.
// Chaque texte localisé est le TEXTE de la Fiche perso et des Guides :
// l'anglais, son aperçu, les traductions repliées, « à retraduire » quand
// l'anglais a bougé ; les six langues sont à l'écran ensemble, plus « une à la
// fois ». L'anglais porte la STRUCTURE (puces, jalons, vidéos) ; « Traduire »
// ne traduit, par sous-onglet, que les textes périmés ou à qui il manque une
// langue. « Enregistrer » envoie la LISTE entière (le contrat de l'admin) :
// validée, écrite, publiée sur R2 — le site la lit au runtime, l'événement
// paraît SANS déploiement —, puis UN commit. Le statut se lit à l'instant du
// SERVEUR (`now` de l'état), jamais à l'horloge du navigateur.
import { $, esc, getJson, log, post, sections, state, stateLoaded } from '../lib.js';
import { noteHtml } from '../gear-view.mjs';

/** Les sous-onglets d'un événement — ceux où un refus du store se pose. */
const SUBS = [
  { id: 'meta', label: 'Méta' },
  { id: 'phases', label: 'Jalons' },
  { id: 'blocks', label: 'Blocs' },
];
// L'aperçu part ce délai après la dernière frappe, celui de la Fiche perso.
const PV_DELAY = 400;
/** Le lien externe en syntaxe markdown, celui que le site rend (`EventBlocks`). */
const LINK_RE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;
/** Le statut du site, en français, et le badge qui le porte. */
const STATUS = {
  upcoming: ['à venir', 'upcoming'],
  ongoing: ['en cours', 'active'],
  ended: ['terminé', 'expired'],
};

let data = null; // `/api/events/state`, relu à chaque venue sans changement en attente
let rows = []; // la liste en cours : { key, e, was } — `e` édité EN PLACE, `was` l'entrée du disque (null : ajoutée)
let was = null; // la liste telle que le disque la portait au chargement (part avec l'enregistrement)
let open = null; // la ligne ouverte, ou null : la liste
let sub = 'meta'; // le sous-onglet montré
let wanted = null; // ce que le hash demande : { slug, sub }, tant que l'état n'est pas chargé
let issues = []; // les refus du dernier enregistrement, chacun avec la `key` de sa ligne
let seq = 0;
const texts = new Map(); // au dessin : clé d'un texte → son objet
const at = new WeakMap(); // un texte → son anglais au chargement, ou à sa dernière traduction
const trOpen = new Set(); // les « Traductions » dépliées, par clé
let tr = { busy: false, error: '' }; // « Traduire » : en cours, son dernier refus
// L'aperçu des textes du sous-onglet montré (`POST /api/events/preview`) : UNE
// requête pour tous, UNE langue pour tout l'événement.
const pv = { lang: '', seq: 0, timer: 0, sent: '', busy: false, error: '', segs: new Map() };
let drawnBase = state.imgBase; // la base des images du dernier dessin (cf. `init`)

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const def = () => data.langs.default;
const others = () => data.langs.shown.filter((l) => l !== def());
const viewEnv = () => ({ imgBase: state.imgBase, esc });
/** Une image du site : son chemin R2 (`/images/…`) sous `imgBase`. */
const imgAt = (path) => `${state.imgBase}${path}`;

// ------------------------------------------------------ le modèle
/** Un texte localisé, tel qu'il partirait : les langues écrites. */
const textOut = (t) =>
  Object.fromEntries(Object.entries(t ?? {}).filter(([, x]) => String(x).trim()));
const hasText = (t) => Object.keys(textOut(t)).length > 0;
const en = (t) => (t?.[def()] ?? '').trim();
/** Des traductions qui datent d'un autre anglais que celui saisi. */
const stale = (t) =>
  Boolean(en(t)) && en(t) !== (at.get(t) ?? '').trim() && others().some((l) => t[l]?.trim());
/** Il manque une langue à ce texte anglais. */
const partial = (t) => Boolean(en(t)) && others().some((l) => !t[l]?.trim());
const tally = (t) => `${others().filter((l) => t[l]?.trim()).length} / ${others().length}`;

/** Un bloc tel qu'il partirait : les clés du modèle, les textes nettoyés, les facultatifs vides absents. */
function blockOut(b) {
  const out = { kind: b.kind };
  if (hasText(b.title)) out.title = textOut(b.title);
  switch (b.kind) {
    case 'prose':
    case 'callout':
      out.text = textOut(b.text);
      break;
    case 'list':
      out.items = (b.items ?? []).map(textOut);
      break;
    case 'sections':
      out.items = (b.items ?? []).map((s) => ({ title: textOut(s.title), text: textOut(s.text) }));
      break;
    case 'cta':
      out.label = textOut(b.label);
      out.href = (b.href ?? '').trim();
      if (hasText(b.note)) out.note = textOut(b.note);
      break;
    case 'videos':
      out.entries = (b.entries ?? []).map((v) => {
        const o = { platform: v.platform, id: (v.id ?? '').trim(), title: (v.title ?? '').trim() };
        if (v.author?.trim()) o.author = v.author.trim();
        if (hasText(v.featured)) o.featured = textOut(v.featured);
        return o;
      });
      break;
    case 'image':
      out.src = (b.src ?? '').trim();
      if (hasText(b.alt)) out.alt = textOut(b.alt);
      if (hasText(b.caption)) out.caption = textOut(b.caption);
      break;
    default:
      break;
  }
  return out;
}

/**
 * Un événement tel qu'il partirait, dans l'ordre des clés du fichier : c'est ce
 * que la savebar compare au disque, et ce que « Enregistrer » envoie.
 */
function eventOut(e) {
  const out = { slug: (e.slug ?? '').trim(), type: e.type, title: textOut(e.title) };
  if (hasText(e.summary)) out.summary = textOut(e.summary);
  if (e.organizer?.trim()) out.organizer = e.organizer.trim();
  if (e.cover?.trim()) out.cover = e.cover.trim();
  out.start = e.start ?? '';
  out.end = e.end ?? '';
  if (e.phases?.length)
    out.phases = e.phases.map((p) => ({ until: p.until ?? '', label: textOut(p.label) }));
  out.blocks = (e.blocks ?? []).map(blockOut);
  if (e.draft) out.draft = true;
  if (e.revealEarly) out.revealEarly = true;
  return out;
}

/** JSON à clés triées : l'ordre des clés ne fait pas un changement. */
const canon = (v) =>
  JSON.stringify(v, (_, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b)))
      : x,
  );

/** La tranche d'un événement que montre un sous-onglet. */
function slice(e, tab) {
  if (tab === 'phases') return e.phases ?? [];
  if (tab === 'blocks') return e.blocks ?? [];
  const meta = { ...e };
  delete meta.phases;
  delete meta.blocks;
  return meta;
}
const changed = (r) => !r.was || canon(eventOut(r.e)) !== canon(r.was);
const tabMoved = (r, tab) =>
  !r.was || canon(slice(eventOut(r.e), tab)) !== canon(slice(r.was, tab));
/** Les événements qui ont bougé, plus ceux retirés de la liste. */
const pending = () =>
  rows.filter(changed).length + (was ? was.length - rows.filter((r) => r.was).length : 0);

/** Les textes d'un événement, dans l'ordre de la page — les OBJETS (la traduction écrit dedans). */
function allTexts(e) {
  const out = [(e.title ??= {}), (e.summary ??= {})];
  for (const p of e.phases ?? []) out.push((p.label ??= {}));
  for (const b of e.blocks ?? []) {
    if (b.kind !== 'cta' && b.kind !== 'image') out.push((b.title ??= {}));
    switch (b.kind) {
      case 'prose':
      case 'callout':
        out.push((b.text ??= {}));
        break;
      case 'list':
        out.push(...(b.items ??= []));
        break;
      case 'sections':
        for (const s of b.items ?? []) out.push((s.title ??= {}), (s.text ??= {}));
        break;
      case 'cta':
        out.push((b.label ??= {}), (b.note ??= {}));
        break;
      case 'videos':
        for (const v of b.entries ?? []) out.push((v.featured ??= {}));
        break;
      case 'image':
        out.push((b.alt ??= {}), (b.caption ??= {}));
        break;
      default:
        break;
    }
  }
  return out;
}
/** La photo des anglais : ce qui est « déjà traduit » au chargement. */
const baseline = () => {
  for (const r of rows) for (const t of allTexts(r.e)) at.set(t, t[def()] ?? '');
};

// ------------------------------------------------------ le statut, les dates
/**
 * Le statut d'un événement à l'instant du SERVEUR (`data.now`), la règle du
 * site (`eventStatus` : fenêtre inclusive, une date illisible dégrade en
 * terminé) — recalculée ici pour les dates que la page retouche.
 */
function statusOf(e) {
  const start = Date.parse(e.start);
  const end = Date.parse(e.end);
  if (Number.isNaN(start) || Number.isNaN(end)) return 'ended';
  const now = Date.parse(data.now);
  if (now < start) return 'upcoming';
  return now <= end ? 'ongoing' : 'ended';
}
/** Un événement à venir sans « dévoiler avant le début » : la page n'en montre que la famille. */
const teased = (e) => statusOf(e) === 'upcoming' && !e.revealEarly;

function statusBadges(r) {
  const e = r.e;
  const [label, cls] = STATUS[statusOf(e)];
  return `<span class="badge ${cls}">${label}</span>${
    e.draft
      ? '<span class="badge warn" title="Jamais publié, quelle que soit la date">brouillon</span>'
      : ''
  }${
    !e.draft && teased(e)
      ? '<span class="badge off" title="À venir sans « dévoiler avant le début » : le site n’annonce que la famille et la date">teaser</span>'
      : ''
  }${changed(r) ? `<span class="badge edit">${r.was ? 'modifié' : 'nouveau'}</span>` : ''}${
    issues.some((i) => i.key === r.key)
      ? `<span class="badge ko" title="${esc(
          issues
            .filter((i) => i.key === r.key)
            .map((i) => i.message)
            .join(' ; '),
        )}">refusé</span>`
      : ''
  }`;
}

/** ISO ⇄ (jour, heure) en UTC — le jeu et le site raisonnent en UTC. */
const splitIso = (iso) => {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso ?? '');
  return m ? [m[1], m[2]] : ['', ''];
};
const joinIso = (day, time) => (day ? `${day}T${time || '00:00'}:00Z` : '');
/** « 2026-03-24 00:00 » (UTC), ou l'ISO tel quel s'il est illisible. */
const utc = (iso) => {
  const [day, time] = splitIso(iso);
  return day ? `${day} ${time}` : iso || '—';
};
/** La même date à l'heure de Paris, en clair : ce que Sevih lit à sa montre. */
function paris(iso) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  const d = new Date(ms);
  const day = d.toLocaleDateString('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} ${time} à Paris`;
}

/** Un jour et une heure UTC, l'heure de Paris à côté : `path` est le champ ISO qu'ils composent. */
function whenHtml(path, iso, label) {
  const [day, time] = splitIso(iso);
  return `<div class="ev-when" data-when="${esc(path)}">
    <span class="lbl">${esc(label)}</span>
    <input type="date" class="w-date" data-path="${esc(path)}" data-part="day" value="${esc(day)}" aria-label="${esc(label)}, jour (UTC)" />
    <input type="time" data-path="${esc(path)}" data-part="time" value="${esc(time)}" aria-label="${esc(label)}, heure (UTC)" />
    <span class="lbl">UTC</span>
    <span class="lbl ev-paris" data-paris>${esc(paris(iso))}</span>
  </div>`;
}

// ------------------------------------------------------ la liste
const siteLink = (slug) =>
  `<a class="btn ghost sm" href="${esc(data.siteBase)}/${esc(slug)}" target="_blank" rel="noopener" title="La page du site (la copie R2, en ligne ≤ 10 min après « Enregistrer »)">ouvrir sur le site ↗</a>`;

const rowHtml = (
  r,
) => `<tr data-key="${r.key}" class="${issues.some((i) => i.key === r.key) ? 'ko' : ''}">
    <td class="ev-cover">${
      r.e.cover
        ? `<img src="${esc(imgAt(r.e.cover))}" alt="" aria-hidden="true" width="72" height="40" loading="lazy" />`
        : ''
    }</td>
    <td><button class="ev-open" type="button" data-open="${r.key}"><strong>${esc(r.e.title?.[def()] || r.e.slug || '(sans titre)')}</strong><span class="mono ev-slug">${esc(r.e.slug || '—')}</span></button></td>
    <td>${esc(data.labels.type[r.e.type] ?? r.e.type)}</td>
    <td class="ev-status"><span class="ev-badges">${statusBadges(r)}</span></td>
    <td class="ev-dates mono">${esc(utc(r.e.start))} → ${esc(utc(r.e.end))}</td>
    <td class="ev-acts"><span class="ev-acts-in">${r.e.slug ? siteLink(r.e.slug) : ''}<button class="btn icon" type="button" data-del="${r.key}" title="Supprimer" aria-label="Supprimer ${esc(r.e.title?.[def()] || r.e.slug || 'l’événement')}">✕</button></span></td>
  </tr>`;

function renderList() {
  drawnBase = state.imgBase;
  $('ev-rows').innerHTML = rows.map(rowHtml).join('');
  $('ev-empty').hidden = rows.length > 0;
  const count = (status) => rows.filter((r) => statusOf(r.e) === status).length;
  const badge = (status, cls, one, many) => {
    const n = count(status);
    return n ? `<span class="badge ${cls}">${n} ${n > 1 ? many : one}</span>` : '';
  };
  const drafts = rows.filter((r) => r.e.draft).length;
  $('ev-summary').innerHTML =
    `<strong>${plural(rows.length, 'événement')}</strong>` +
    badge('ongoing', 'active', 'en cours', 'en cours') +
    badge('upcoming', 'upcoming', 'à venir', 'à venir') +
    (drafts ? `<span class="badge warn">${drafts} brouillon${drafts > 1 ? 's' : ''}</span>` : '') +
    `<span class="lbl">statut à l’heure du serveur : ${esc(utc(data.now))} UTC</span>`;
}

$('ev-rows').onclick = (e) => {
  const opener = e.target.closest('[data-open]');
  const del = e.target.closest('[data-del]');
  if (opener) {
    open = rows.find((r) => String(r.key) === opener.dataset.open) ?? null;
    sub = 'meta';
    render();
    writeHash();
  } else if (del) remove(rows.find((r) => String(r.key) === del.dataset.del));
};

/** « ＋ événement » : le squelette de l'admin (communautaire, brouillon, un paragraphe vide, du jour), ouvert sur Méta. */
$('ev-add').onclick = () => {
  const e = JSON.parse(JSON.stringify(data.skeleton.event));
  for (const t of allTexts(e)) at.set(t, '');
  rows.push({ key: ++seq, e, was: null });
  open = rows[rows.length - 1];
  sub = 'meta';
  render();
  writeHash();
  $('ev-panel').querySelector('[data-path="slug"]')?.focus();
};

/** Supprimer un événement : sur confirmation ; il quitte la liste, rien ne s'écrit avant « Enregistrer ». */
function remove(r) {
  if (!r) return;
  const name = r.e.title?.[def()] || r.e.slug || 'cet événement';
  if (
    !confirm(
      `Supprimer « ${name} » ? Il quitte la liste ; rien ne s’écrit avant « Enregistrer », qui retire alors sa page du site.`,
    )
  )
    return;
  rows = rows.filter((x) => x !== r);
  issues = issues.filter((i) => i.key !== r.key);
  if (open === r) {
    open = null;
    sub = 'meta';
  }
  render();
  writeHash();
}

// ------------------------------------------------------ l'événement ouvert
function head() {
  const el = $('ev-head');
  if (!open) {
    el.innerHTML = '';
    return;
  }
  const e = open.e;
  el.innerHTML = `<button class="btn ghost sm" type="button" data-act="back" title="Revenir à la liste">← Événements</button>
    <div class="ev-id"><strong data-title>${esc(e.title?.[def()] || e.slug || '(sans titre)')}</strong>
      <span class="ev-traits"><span class="mono" data-slug>${esc(e.slug || '—')}</span><span class="badge off">${esc(data.labels.type[e.type] ?? e.type)}</span><span class="ev-badges" data-status>${statusBadges(open)}</span><span class="lbl mono" data-dates>${esc(utc(e.start))} → ${esc(utc(e.end))} UTC</span></span>
    </div>
    <span class="ev-site" data-site>${e.slug && open.was ? siteLink(e.slug) : ''}</span>
    <button class="btn danger sm" type="button" data-act="delete">Supprimer</button>`;
}
$('ev-head').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (el.dataset.act === 'back') back();
  else if (el.dataset.act === 'delete') remove(open);
};

function bar() {
  const n = pending();
  const no = issues.length;
  $('ev-count').innerHTML =
    `${n ? `<span class="badge edit">${plural(n, 'événement')} modifié${n > 1 ? 's' : ''}</span>` : ''}${
      no ? `<span class="badge ko">${no} refus</span>` : ''
    }<span class="ev-msg">${n || no ? '' : 'aucune modification'}</span>`;
  $('ev-save').disabled = $('ev-reset').disabled = !n;
}

/** Le groupe des langues de l'aperçu, dans la savebar. */
function pvLangs() {
  const el = $('ev-pv-lang');
  el.innerHTML = open
    ? `<span class="lbl">Aperçu</span><div class="ev-seg" role="group" aria-label="Langue de l’aperçu">${data.langs.shown
        .map(
          (l) =>
            `<button type="button" data-lang="${esc(l)}" aria-pressed="${l === pv.lang}">${esc(l)}</button>`,
        )
        .join('')}</div>`
    : '';
}
$('ev-pv-lang').onclick = (e) => {
  const el = e.target.closest('button[data-lang]');
  if (!el || el.dataset.lang === pv.lang) return;
  pv.lang = el.dataset.lang;
  for (const b of el.parentElement.children) b.setAttribute('aria-pressed', String(b === el));
  pvAsk();
};

const refusedIn = (tab) => issues.filter((i) => open && i.key === open.key && i.tab === tab);
const refusedAt = (tab, block, entry) =>
  refusedIn(tab).filter((i) => i.block === block && i.entry === entry);
/** Une retouche dans un sous-onglet lève ses refus : le disque les rejugera. */
const forgive = (tab) => {
  issues = issues.filter((i) => !(open && i.key === open.key && i.tab === tab));
};

/** Les sous-onglets : un point accent = modifié, rouge = refusé. */
function subTabs() {
  const row = $('ev-tabs');
  const focused = row.contains(document.activeElement);
  row.innerHTML = open
    ? SUBS.map((s) => {
        const on = s.id === sub;
        const dot = refusedIn(s.id).length
          ? ['ko', 'refusé']
          : tabMoved(open, s.id)
            ? ['edit', 'modifié, pas encore enregistré']
            : null;
        return `<button class="tab" type="button" role="tab" id="ev-tab-${s.id}" data-sub="${s.id}" aria-selected="${on}" aria-controls="ev-panel" tabindex="${on ? 0 : -1}">${s.label}${
          dot
            ? `<span class="dot ${dot[0]}" role="img" aria-label="${dot[1]}" title="${dot[1]}"></span>`
            : ''
        }</button>`;
      }).join('')
    : '';
  $('ev-panel').setAttribute('aria-labelledby', `ev-tab-${sub}`);
  if (focused) $(`ev-tab-${sub}`)?.focus();
}
function showSub(id) {
  if (id === sub || !SUBS.some((s) => s.id === id)) return;
  sub = id;
  render();
}
$('ev-tabs').onclick = (e) => {
  const el = e.target.closest('[role="tab"]');
  if (el) showSub(el.dataset.sub);
};
$('ev-tabs').onkeydown = (e) => {
  const i = SUBS.findIndex((s) => s.id === sub);
  const to = {
    ArrowLeft: (i + SUBS.length - 1) % SUBS.length,
    ArrowRight: (i + 1) % SUBS.length,
    Home: 0,
    End: SUBS.length - 1,
  }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  showSub(SUBS[to].id);
  $(`ev-tab-${sub}`)?.focus();
};

// ------------------------------------------------------ les textes
/** Le refus d'un champ, sous lui ; vide, la ligne ne s'affiche pas. */
const errHtml = (list) => `<p class="ev-err">${esc(list.map((r) => r.message).join(' ; '))}</p>`;

/** Les liens markdown d'un aperçu, rendus en liens : `noteHtml` a déjà échappé le texte. */
const linkify = (html) =>
  html.replace(
    LINK_RE,
    (_, label, href) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer" class="ev-link">${label}</a>`,
  );
/** L'aperçu d'un texte : ses segments, tels que le site les rend, les liens compris. */
const pvBody = (key) => linkify(noteHtml(viewEnv(), pv.segs.get(key) ?? []));

/**
 * Un texte localisé : l'anglais (un champ d'une ligne, ou une textarea qui
 * grandit), son aperçu, ses refus, puis les traductions repliées — le modèle
 * des Guides (F18). `key` identifie le texte au dessin (`texts`), `what` le
 * nomme aux lecteurs d'écran.
 */
function textHtml(key, text, { what, line = false, placeholder = '', bad = [] } = {}) {
  texts.set(key, text);
  const area = (lang, attrs) =>
    line
      ? `<input data-key="${esc(key)}" data-lang="${esc(lang)}" ${attrs} value="${esc(text[lang] ?? '')}" autocomplete="off" />`
      : `<textarea rows="2" data-key="${esc(key)}" data-lang="${esc(lang)}" ${attrs}>\n${esc(text[lang] ?? '')}</textarea>`;
  return `<div class="ev-text${bad.length ? ' ko' : ''}" data-text="${esc(key)}">
    <span class="lbl">${esc(what)}</span>
    ${area(def(), `aria-label="${esc(what)}, en anglais" placeholder="${esc(placeholder)}"${bad.length ? ' class="refused"' : ''}`)}
    <p class="ev-pv pv-note${pv.busy ? ' busy' : ''}" data-pv="${esc(key)}">${pvBody(key)}</p>
    ${errHtml(bad)}
    <details${trOpen.has(key) ? ' open' : ''}>
      <summary><span class="btn ghost sm">Traductions (${others().length})</span><span class="badge warn" data-stale>${
        stale(text) ? 'à retraduire' : ''
      }</span><span class="lbl" data-tally>${tally(text)}</span></summary>
      <div class="ev-trs">${others()
        .map(
          (lang) =>
            `<div class="field"><label>${esc(lang)}${area(lang, `aria-label="${esc(what)}, ${esc(lang)}" placeholder="${esc(text[def()] ?? '')}"`)}</label></div>`,
        )
        .join('')}</div>
    </details>
  </div>`;
}

/** « Traduire », le même sous chaque sous-onglet : il vaut pour l'onglet montré. */
const translateHtml = () =>
  `<div class="ev-foot"><button class="btn ghost${tr.busy ? ' busy' : ''}" type="button" data-act="translate"${
    tr.busy ? ' disabled' : ''
  } title="Traduit les textes anglais de l’onglet vers ${others().join(', ')} — seulement ceux dont l’anglais a bougé (leurs traductions sont alors ÉCRASÉES) ou à qui il manque une langue ; les traductions à jour restent (DeepL, puis Claude Haiku). À relire ; rien ne s’écrit avant « Enregistrer ».">Traduire</button><span class="badge error" data-tr-error>${esc(tr.error)}</span><p class="ev-ko" data-pv-error>${esc(pv.error)}</p></div>`;

/** Les boutons ↑ ↓ ✕ d'une entrée ordonnée (`act` : `block`, `entry`, `phase`). */
const moveHtml = (act, i, count, what) =>
  `<span class="ev-moves"><button class="btn icon" type="button" data-act="up-${act}" data-i="${i}" ${i === 0 ? 'disabled' : ''} title="Monter" aria-label="Monter ${esc(what)}">↑</button><button class="btn icon" type="button" data-act="down-${act}" data-i="${i}" ${i === count - 1 ? 'disabled' : ''} title="Descendre" aria-label="Descendre ${esc(what)}">↓</button><button class="btn icon" type="button" data-act="del-${act}" data-i="${i}" title="Retirer" aria-label="Retirer ${esc(what)}">✕</button></span>`;

// ------------------------------------------------------ « Méta »
function metaHtml() {
  const e = open.e;
  const bad = refusedIn('meta');
  return `<div class="ev-stack">
    ${bad.length ? `<div class="card pad ko">${errHtml(bad)}</div>` : ''}
    <div class="card pad">
      <div class="form">
        <div class="field"><label for="ev-slug">Slug (l’URL : /event/&lt;slug&gt;)</label><input id="ev-slug" class="w-search mono" data-path="slug" value="${esc(e.slug ?? '')}" placeholder="2026-04-tournoi" autocomplete="off" spellcheck="false" /></div>
        <div class="field"><label for="ev-type">Famille</label><select id="ev-type" data-path="type">${data.types
          .map(
            (t) =>
              `<option value="${esc(t)}"${t === e.type ? ' selected' : ''}>${esc(data.labels.type[t] ?? t)}</option>`,
          )
          .join('')}</select></div>
        <label class="check" title="Jamais publié, quelle que soit la date : invisible hors d’ici"><input type="checkbox" data-path="draft"${e.draft ? ' checked' : ''} /> brouillon</label>
        <label class="check" title="Par défaut, un événement pas encore démarré est un TEASER : le site annonce sa famille et sa date, rien d’autre ne quitte le serveur. Cocher pour publier le règlement à l’avance."><input type="checkbox" data-path="revealEarly"${e.revealEarly ? ' checked' : ''} /> dévoiler le contenu avant le début</label>
      </div>
      ${textHtml('meta.title', (e.title ??= {}), { what: 'Titre', line: true, placeholder: 'Titre EN (requis)' })}
      ${textHtml('meta.summary', (e.summary ??= {}), { what: 'Résumé', placeholder: 'La carte de la liste /event et la meta description' })}
    </div>
    <div class="card pad">
      <div class="form">
        <div class="field"><label for="ev-organizer">Organisateur</label><input id="ev-organizer" class="w-search" data-path="organizer" value="${esc(e.organizer ?? '')}" placeholder="Outerpedia / EvaMains" autocomplete="off" /></div>
        <div class="field grow"><label for="ev-cover">Cover (chemin R2 — la source va dans data/editorial/events/ à la main)</label><input id="ev-cover" class="w-url mono" data-path="cover" value="${esc(e.cover ?? '')}" placeholder="/images/events/${esc(e.slug || '<slug>')}/cover.webp" autocomplete="off" spellcheck="false" /></div>
      </div>
      <div class="ev-img" data-img-for="cover">${
        e.cover
          ? `<img src="${esc(imgAt(e.cover))}" alt="" aria-hidden="true" loading="lazy" />`
          : ''
      }</div>
      ${whenHtml('start', e.start, 'Début')}
      ${whenHtml('end', e.end, 'Fin')}
    </div>
    ${translateHtml()}
  </div>`;
}

// ------------------------------------------------------ « Jalons »
function phasesHtml() {
  const e = open.e;
  const phases = (e.phases ??= []);
  return `<div class="ev-stack">
    <div class="card">
      <div class="card-head"><strong>${plural(phases.length, 'jalon')}</strong><span class="lbl">Ce qui se joue À CETTE DATE (ouverture, clôture, dépouillement…) ; le bloc « Calendrier » les rend, l’en-tête du site met en avant le prochain.</span><button class="btn ghost sm" type="button" data-act="add-phase">＋ jalon</button></div>
      ${
        phases.length
          ? phases
              .map(
                (
                  p,
                  i,
                ) => `<div class="ev-entry${refusedAt('phases', undefined, i).length ? ' ko' : ''}" data-i="${i}">
          <div class="ev-entry-head"><span class="badge off">jalon ${i + 1}</span>${whenHtml(`phases.${i}.until`, p.until, 'Date')}${moveHtml('phase', i, phases.length, `le jalon ${i + 1}`)}</div>
          ${textHtml(`phases.${i}.label`, (p.label ??= {}), { what: `Libellé du jalon ${i + 1}`, line: true, placeholder: 'Libellé EN (requis)', bad: refusedAt('phases', undefined, i) })}
        </div>`,
              )
              .join('')
          : '<div class="empty">Aucun jalon : « ＋ jalon » pour en poser un.</div>'
      }
    </div>
    ${translateHtml()}
  </div>`;
}

// ------------------------------------------------------ « Blocs »
/** Les champs d'un bloc selon son genre, sous son titre. */
function blockBody(b, i) {
  const k = `blocks.${i}`;
  const bad = (entry) => refusedAt('blocks', i, entry);
  const entry = (j, count, what, inner) =>
    `<div class="ev-entry${bad(j).length ? ' ko' : ''}" data-i="${j}"><div class="ev-entry-head"><span class="badge off">${esc(what)} ${j + 1}</span>${moveHtml('entry', j, count, `${what} ${j + 1}`)}</div>${inner}</div>`;
  switch (b.kind) {
    case 'prose':
    case 'callout':
      return textHtml(`${k}.text`, (b.text ??= {}), {
        what: 'Texte',
        placeholder: 'Texte EN (requis) — tags inline {I-I/…}, liens [libellé](https://…)',
        bad: bad(undefined),
      });
    case 'list':
      return `${(b.items ??= [])
        .map((item, j) =>
          entry(
            j,
            b.items.length,
            'puce',
            textHtml(`${k}.items.${j}`, item, {
              what: `Puce ${j + 1}`,
              placeholder: 'Texte EN (requis)',
              bad: bad(j),
            }),
          ),
        )
        .join(
          '',
        )}<div class="ev-foot"><button class="btn ghost sm" type="button" data-act="add-entry" data-i="${i}">＋ puce</button></div>`;
    case 'sections':
      return `${(b.items ??= [])
        .map((s, j) =>
          entry(
            j,
            b.items.length,
            'sous-section',
            textHtml(`${k}.items.${j}.title`, (s.title ??= {}), {
              what: `Sous-titre ${j + 1}`,
              line: true,
              placeholder: 'Sous-titre EN (requis)',
              bad: bad(j),
            }) +
              textHtml(`${k}.items.${j}.text`, (s.text ??= {}), {
                what: `Texte de la sous-section ${j + 1}`,
                placeholder: 'Texte EN (requis)',
              }),
          ),
        )
        .join(
          '',
        )}<div class="ev-foot"><button class="btn ghost sm" type="button" data-act="add-entry" data-i="${i}">＋ sous-section</button></div>`;
    case 'timeline':
      return '<p class="lbl">Rend les jalons de l’onglet Jalons — rien à saisir ici.</p>';
    case 'cta':
      return `${textHtml(`${k}.label`, (b.label ??= {}), { what: 'Libellé du bouton', line: true, placeholder: 'Libellé EN (requis)', bad: bad(undefined) })}
        <div class="form"><div class="field grow"><label>URL (http(s), requise)<input class="w-url mono" data-path="${k}.href" value="${esc(b.href ?? '')}" placeholder="https://forms.gle/…" autocomplete="off" spellcheck="false" /></label></div></div>
        ${textHtml(`${k}.note`, (b.note ??= {}), { what: 'Note sous le bouton', line: true, placeholder: 'facultatif' })}`;
    case 'videos':
      return `${(b.entries ??= [])
        .map((v, j) =>
          entry(
            j,
            b.entries.length,
            'vidéo',
            `<div class="form">
              <div class="field"><label>Plateforme<select data-path="${k}.entries.${j}.platform">${data.platforms.map((p) => `<option value="${esc(p)}"${p === v.platform ? ' selected' : ''}>${esc(p)}</option>`).join('')}</select></label></div>
              <div class="field"><label>Identifiant<input class="w-text mono" data-path="${k}.entries.${j}.id" value="${esc(v.id ?? '')}" placeholder="dQw4w9WgXcQ" autocomplete="off" spellcheck="false" /></label></div>
              <div class="field grow"><label>Titre de la vidéo (non traduit)<input class="w-search" data-path="${k}.entries.${j}.title" value="${esc(v.title ?? '')}" autocomplete="off" /></label></div>
              <div class="field"><label>Auteur<input class="w-text" data-path="${k}.entries.${j}.author" value="${esc(v.author ?? '')}" placeholder="facultatif" autocomplete="off" /></label></div>
            </div>
            ${textHtml(`${k}.entries.${j}.featured`, (v.featured ??= {}), { what: `Mise en avant de la vidéo ${j + 1}`, line: true, placeholder: 'ex. 1st place — vide = simple vignette' })}`,
          ),
        )
        .join(
          '',
        )}<div class="ev-foot"><button class="btn ghost sm" type="button" data-act="add-entry" data-i="${i}">＋ vidéo</button></div>`;
    case 'image':
      return `<div class="form"><div class="field grow"><label>Chemin R2 (requis — la source va dans data/editorial/events/ à la main)<input class="w-url mono" data-path="${k}.src" value="${esc(b.src ?? '')}" placeholder="/images/events/<slug>/visuel.webp" autocomplete="off" spellcheck="false" /></label></div></div>
        <div class="ev-img" data-img-for="${k}.src">${b.src ? `<img src="${esc(imgAt(b.src))}" alt="" aria-hidden="true" loading="lazy" />` : ''}</div>
        ${textHtml(`${k}.alt`, (b.alt ??= {}), { what: 'Alt', line: true, placeholder: 'facultatif' })}
        ${textHtml(`${k}.caption`, (b.caption ??= {}), { what: 'Légende', line: true, placeholder: 'facultatif' })}`;
    default:
      return `<p class="ev-ko">Genre de bloc inconnu : ${esc(b.kind)}.</p>`;
  }
}

function blocksHtml() {
  const e = open.e;
  const blocks = (e.blocks ??= []);
  const titled = (b) => b.kind !== 'cta' && b.kind !== 'image';
  return `<div class="ev-stack">
    ${blocks
      .map(
        (
          b,
          i,
        ) => `<div class="card ev-block${refusedAt('blocks', i, undefined).length ? ' ko' : ''}" data-block="${i}">
        <div class="card-head"><span class="badge upcoming">${esc(data.labels.block[b.kind] ?? b.kind)}</span><span class="lbl">bloc ${i + 1}</span>${moveHtml('block', i, blocks.length, `le bloc ${i + 1}`)}</div>
        <div class="ev-body">
          ${titled(b) ? textHtml(`blocks.${i}.title`, (b.title ??= {}), { what: 'Titre du bloc', line: true, placeholder: 'Titre (facultatif)' }) : ''}
          ${blockBody(b, i)}
        </div>
      </div>`,
      )
      .join('')}
    ${blocks.length ? '' : '<div class="empty">Aucun bloc : au moins un est requis.</div>'}
    ${errHtml(refusedIn('blocks').filter((r) => r.block === undefined))}
    <div class="ev-foot"><span class="lbl">＋ bloc</span>${data.kinds
      .map(
        (kind) =>
          `<button class="btn ghost sm" type="button" data-act="add-block" data-kind="${esc(kind)}">＋ ${esc(data.labels.block[kind] ?? kind)}</button>`,
      )
      .join('')}</div>
    ${translateHtml()}
  </div>`;
}

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
  for (const d of $('ev-panel').querySelectorAll('[data-text] details')) {
    const k = d.closest('[data-text]').dataset.text;
    if (d.open) trOpen.add(k);
    else trOpen.delete(k);
  }
}

/** La liste, ou l'événement ouvert et son sous-onglet, redessinés en entier. */
function render() {
  const panel = $('ev-panel');
  keepOpen();
  texts.clear();
  $('ev-list').hidden = Boolean(open && data);
  $('ev-event').hidden = !(open && data);
  if (!data) return;
  renderList();
  if (!open) {
    panel.innerHTML = '';
    head();
    subTabs();
    bar();
    pvLangs();
    return;
  }
  panel.innerHTML = { meta: metaHtml, phases: phasesHtml, blocks: blocksHtml }[sub]();
  growAll(panel);
  head();
  subTabs();
  bar();
  pvLangs();
  pvAsk();
}

/** Ce qui suit une saisie SANS redessiner : les badges, les points, la savebar, l'en-tête. */
function marks() {
  const panel = $('ev-panel');
  for (const el of panel.querySelectorAll('[data-text]')) {
    const t = texts.get(el.dataset.text);
    if (!t) continue;
    el.querySelector('[data-stale]').textContent = stale(t) ? 'à retraduire' : '';
    el.querySelector('[data-tally]').textContent = tally(t);
    el.classList.remove('ko');
    el.querySelector('.refused')?.classList.remove('refused');
    const err = el.querySelector('.ev-err');
    if (err) err.textContent = '';
  }
  for (const el of panel.querySelectorAll('.ev-entry.ko, .ev-block.ko, .card.ko'))
    el.classList.remove('ko');
  const e = open.e;
  const h = $('ev-head');
  h.querySelector('[data-title]').textContent = e.title?.[def()] || e.slug || '(sans titre)';
  h.querySelector('[data-slug]').textContent = e.slug || '—';
  h.querySelector('[data-status]').innerHTML = statusBadges(open);
  h.querySelector('[data-dates]').textContent = `${utc(e.start)} → ${utc(e.end)} UTC`;
  subTabs();
  bar();
}

// ------------------------------------------------------ l'aperçu
/** L'aperçu des textes en place : son atténuation, et `redraw` son contenu. */
function pvPaint(redraw) {
  const panel = $('ev-panel');
  for (const el of panel.querySelectorAll('[data-pv]')) {
    el.classList.toggle('busy', pv.busy);
    if (redraw) el.innerHTML = pvBody(el.dataset.pv);
  }
  for (const el of panel.querySelectorAll('[data-pv-error]')) el.textContent = pv.error;
}

/** Les textes à prévisualiser du sous-onglet montré : clé → texte dans la langue de l'aperçu. */
function pvTexts() {
  const pick = (t) => (t[pv.lang]?.trim() ? t[pv.lang] : (t[def()] ?? ''));
  return [...texts].map(([key, t]) => [key, pick(t)]);
}

/**
 * Demande l'aperçu de TOUS les textes du sous-onglet montré, dans la langue de
 * la savebar — une langue qu'un texte ne porte pas se replie sur l'anglais,
 * comme au rendu du site. Pendant la requête le rendu précédent reste,
 * atténué ; une réponse arrivée après une requête plus récente est ignorée ;
 * un refus est dit près de « Traduire », et se retente au prochain changement.
 */
async function pvFetch() {
  if (!open) return;
  const shown = pvTexts().filter(([, t]) => t.trim());
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
    const res = await fetch('/api/events/preview', {
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
/** Lit ou écrit `path` (`blocks.2.entries.0.id`) dans l'événement ouvert. */
const getAt = (root, path) => path.split('.').reduce((o, k) => o?.[k], root);
function setAt(root, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const o = keys.reduce((x, k) => x[k], root);
  if (value === undefined) delete o[last];
  else o[last] = value;
}

$('ev-panel').oninput = (e) => {
  if (!open) return;
  const field = e.target.closest('[data-key]');
  if (field) {
    const { key, lang } = field.dataset;
    const t = texts.get(key);
    if (!t) return;
    if (field.value || lang === def()) t[lang] = field.value;
    else delete t[lang];
    forgive(sub);
    if (field.tagName === 'TEXTAREA') grow(field);
    // Une traduction pas encore écrite montre l'anglais qu'elle remplacera.
    if (lang === def())
      for (const other of field.closest('[data-text]').querySelectorAll('.ev-trs [data-key]'))
        other.placeholder = field.value;
    marks();
    return pvAsk(PV_DELAY);
  }
  const el = e.target.closest('[data-path]');
  if (!el || el.type === 'checkbox' || el.tagName === 'SELECT') return;
  const { path, part } = el.dataset;
  if (part) {
    // Un jour ou une heure : l'ISO se recompose, l'heure de Paris suit.
    const [day, time] = splitIso(getAt(open.e, path));
    const iso = joinIso(part === 'day' ? el.value : day, part === 'time' ? el.value : time);
    setAt(open.e, path, iso);
    el.closest('.ev-when').querySelector('[data-paris]').textContent = paris(iso);
  } else setAt(open.e, path, el.value);
  const img = $('ev-panel').querySelector(`[data-img-for="${path}"]`);
  if (img)
    img.innerHTML = el.value.trim()
      ? `<img src="${esc(imgAt(el.value.trim()))}" alt="" aria-hidden="true" loading="lazy" />`
      : '';
  forgive(sub);
  marks();
};
$('ev-panel').onchange = (e) => {
  if (!open) return;
  const el = e.target.closest('select[data-path], input[type="checkbox"][data-path]');
  if (!el) return;
  setAt(open.e, el.dataset.path, el.type === 'checkbox' ? el.checked || undefined : el.value);
  forgive(sub);
  marks();
};
// Des « Traductions » dépliées : leurs textarea prennent leur hauteur.
$('ev-panel').addEventListener(
  'toggle',
  (e) => {
    if (e.target.open) growAll(e.target);
  },
  true,
);

/** Échange `list[i]` et son voisin dans la direction `dir` ; rien aux extrémités. */
function move(list, i, dir) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return false;
  [list[i], list[j]] = [list[j], list[i]];
  return true;
}

$('ev-panel').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !open) return;
  const { act } = el.dataset;
  const i = Number(el.dataset.i ?? -1);
  const ev = open.e;
  const redo = (focus) => {
    forgive(sub);
    render();
    if (focus) $('ev-panel').querySelector(focus)?.focus();
  };
  // Une entrée d'un bloc : le bloc est l'ancêtre `[data-block]`, l'entrée `data-i`.
  const blockOf = () => ev.blocks[Number(el.closest('[data-block]')?.dataset.block ?? -1)];
  const entriesOf = (b) => (b.kind === 'videos' ? b.entries : b.items);
  switch (act) {
    case 'translate':
      return translate();
    case 'add-phase':
      (ev.phases ??= []).push({ until: '', label: {} });
      at.set(ev.phases[ev.phases.length - 1].label, '');
      return redo(`[data-when="phases.${ev.phases.length - 1}.until"] [data-part="day"]`);
    case 'up-phase':
    case 'down-phase':
      if (move(ev.phases, i, act === 'up-phase' ? -1 : 1)) redo();
      return;
    case 'del-phase':
      ev.phases.splice(i, 1);
      return redo();
    case 'add-block': {
      const b = JSON.parse(JSON.stringify(data.skeleton.block[el.dataset.kind]));
      ev.blocks.push(b);
      for (const t of allTexts({ blocks: [b] })) at.set(t, '');
      return redo(`[data-block="${ev.blocks.length - 1}"] [data-key][data-lang="${def()}"]`);
    }
    case 'up-block':
    case 'down-block':
      if (move(ev.blocks, i, act === 'up-block' ? -1 : 1)) redo();
      return;
    case 'del-block':
      ev.blocks.splice(i, 1);
      return redo();
    case 'add-entry': {
      const b = ev.blocks[i];
      const fresh = JSON.parse(JSON.stringify(entriesOf(data.skeleton.block[b.kind])[0]));
      entriesOf(b).push(fresh);
      // Ses textes neufs : « déjà traduits » de rien, comme au chargement.
      const born =
        b.kind === 'list'
          ? [fresh]
          : b.kind === 'sections'
            ? [fresh.title, fresh.text]
            : [(fresh.featured ??= {})];
      for (const t of born) at.set(t, '');
      return redo(`[data-block="${i}"] .ev-entry:last-of-type [data-key][data-lang="${def()}"]`);
    }
    case 'up-entry':
    case 'down-entry':
      if (move(entriesOf(blockOf()), i, act === 'up-entry' ? -1 : 1)) redo();
      return;
    case 'del-entry':
      entriesOf(blockOf()).splice(i, 1);
      return redo();
    default:
      return;
  }
};

/**
 * « Traduire » : les textes anglais du sous-onglet montré qu'il FAUT traduire
 * — l'anglais a bougé depuis le chargement ou la dernière traduction (leurs
 * langues sont alors toutes réécrites : l'anglais fait foi), ou une langue
 * manque (elle seule est posée, les autres restent) —, d'un seul appel
 * (`POST /api/translate`). Rien ne part au disque avant « Enregistrer ».
 */
async function translate() {
  if (tr.busy || !open) return;
  const todo = [];
  for (const t of texts.values())
    if (stale(t) || partial(t)) todo.push({ text: t, en: t[def()], all: stale(t) });
  if (!todo.length)
    return log(['Rien à traduire : les textes anglais de cet onglet sont déjà traduits.'], true);
  tr = { busy: true, error: '' };
  for (const el of $('ev-panel').querySelectorAll('[data-act="translate"]')) {
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
      const got = Object.keys(out).filter(
        (l) => others().includes(l) && out[l]?.trim() && (x.all || !x.text[l]?.trim()),
      );
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
    // Ce qui vient d'être traduit s'ouvre : c'est à relire.
    if (filled)
      for (const d of $('ev-panel').querySelectorAll('[data-text] details')) d.open = true;
    render();
  }
}

// ------------------------------------------------------ le disque
/** L'adresse dit l'événement ouvert : recharger y revient (`/<onglet>` : pour un lien ou le banc, pas écrit). */
const writeHash = () =>
  history.replaceState(
    null,
    '',
    open?.e.slug ? `#events/${encodeURIComponent(open.e.slug)}` : '#events',
  );

/**
 * La liste relue du disque : c'est elle qui fait foi, la saisie en attente est
 * abandonnée. `reopen` : le slug à rouvrir (après un enregistrement, l'événement
 * qu'on éditait) — absent du disque, retour à la liste.
 */
async function load(reopen) {
  const s = await getJson('/api/events/state');
  if (!s.events || !s.langs || !s.skeleton)
    throw new Error('quick lancé avant ce code : Ctrl-C puis `pnpm quick`');
  data = s;
  was = JSON.parse(JSON.stringify(s.events));
  rows = s.events.map((e, i) => ({ key: ++seq, e, was: was[i] }));
  pv.lang ||= s.langs.default;
  pv.segs.clear();
  pv.sent = '';
  tr = { busy: tr.busy, error: '' };
  baseline();
  const slug = reopen ?? wanted?.slug;
  const before = open;
  open = slug !== undefined ? (rows.find((r) => r.e.slug === slug) ?? null) : null;
  if (wanted?.sub && SUBS.some((x) => x.id === wanted.sub)) sub = wanted.sub;
  wanted = null;
  if (!open || before?.e.slug !== slug) trOpen.clear();
  if (!open) sub = 'meta';
  render();
  if (!$('tab-events').hidden) writeHash();
}
const reload = (reopen) => load(reopen).catch((e) => log([`Événements illisibles : ${e}`], false));

/** Retour à la liste : les changements restent en attente, la savebar (commune) les compte. */
function back() {
  open = null;
  sub = 'meta';
  render();
  writeHash();
}

$('ev-reset').onclick = () => {
  issues = [];
  reload(open?.e.slug);
};

/**
 * « Enregistrer » : la liste ENTIÈRE et ce que la page avait chargé (`was`),
 * pour le fichier, R2 et UN commit `chore(events): <slug>` ; puis le disque
 * relu, l'événement ouvert rouvert par son slug. Un refus SITUÉ garde la
 * saisie : le message sous le champ, le point rouge sur l'onglet, le badge
 * « refusé » dans la liste — sauf `stale` : le disque avait changé, il est relu
 * tel quel.
 */
$('ev-save').onclick = async () => {
  if (!pending()) return;
  const sent = rows.map((r) => eventOut(r.e));
  const keys = rows.map((r) => r.key);
  const reopen = open?.e.slug?.trim() || undefined;
  $('ev-save').disabled = $('ev-reset').disabled = true;
  $('ev-save').classList.add('busy');
  log([], undefined, 'envoi des événements au serveur');
  try {
    const r = await post('/api/events', { list: sent, was });
    issues = (r.issues ?? []).map((i) => ({
      ...i,
      key: i.index === null || i.index === undefined ? null : (keys[i.index] ?? null),
    }));
    if (r.written || r.stale) await load(reopen);
  } catch (e) {
    log([`Enregistrement interrompu : ${e}`], false);
  } finally {
    $('ev-save').classList.remove('busy');
    render();
  }
};

/** Quitter l'onglet avec des changements en attente : sur confirmation. */
function leave() {
  const n = pending();
  return (
    !n ||
    confirm(
      `${plural(n, 'événement')} modifié${n > 1 ? 's' : ''}, pas encore enregistré${n > 1 ? 's' : ''}. Quitter l’onglet ? ${n > 1 ? 'Ils restent' : 'Il reste'} en attente tant que la page n’est pas rechargée.`,
    )
  );
}

sections.register('events', {
  init: () => {
    // `#events` : la liste ; `#events/<slug>` : un événement (la forme que la
    // page écrit) ; `#events/<slug>/<onglet>` l'ouvre sur ce sous-onglet, pour
    // un lien ou le banc. `lib.js` ne connaît que `#events` : c'est le clic
    // sur l'onglet qui l'ouvre.
    const [, slug, tab] = /^#events\/([^/]+)(?:\/([^/]+))?$/.exec(location.hash) ?? [];
    if (slug) {
      wanted = { slug: decodeURIComponent(slug), sub: tab ? decodeURIComponent(tab) : undefined };
      document.querySelector('#tabs [data-tab="events"]')?.click();
    }
    stateLoaded.then(() => {
      // Les covers sont sous `imgBase`, connu avec `/api/state` : redessinées si
      // l'état en annonce une autre.
      if (data && state.imgBase !== drawnBase) render();
    });
    return reload();
  },
  // Chaque venue à l'écran : la liste relue (les statuts bougent avec l'heure), s'il n'y a rien en attente.
  open: () => {
    if (wanted) return undefined; // l'événement du hash arrive
    if (data && !pending()) return reload(open?.e.slug);
    if (data) writeHash();
    return undefined;
  },
  dirty: () => (data ? pending() : 0),
  canLeave: leave,
});
