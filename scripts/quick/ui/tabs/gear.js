// Onglet « Gear reco ».
import { $, esc, log, post, sections, state, stateLoaded } from '../lib.js';
// Le mix de sets (un principal, des secondaires) : le module que les tests couvrent.
import { composeSetCombos, splitSetCombos } from '../gear-sets.mjs';
// La tuile d'item « comme /equipment » : idem, un module pur et testé.
import { itemName, itemTile, previewHtml, setGrid, setRow } from '../gear-view.mjs';
// Le picker de perso : la modale partagée avec « Fiche perso ».
import { openHeroPicker } from '../hero-picker.mjs';

// Les builds d'UN perso, édités ici puis envoyés d'un bloc : la liste
// complète remplace celle du disque (contrat de `upsertGearReco`).
//
// Un slot à preset garde le `$slug` que le DISQUE cite et, à côté, ses
// pièces dépliées : tant qu'on n'en change pas les pièces il repart sous
// ce slug, à l'identique. Deux presets peuvent avoir le même contenu —
// renvoyer des pièces laisserait le store choisir lequel des deux écrire.
let gear = {
  roster: [],
  presets: { talismans: {}, sets: {}, substats: {} },
  options: { weapons: [], amulets: [], talismans: [], sets: [] },
  langs: { default: 'en', main: [], extra: [] },
};
let gChar = null; // le perso choisi (ligne du roster)
let gBuilds = []; // ses builds, dans le modèle de la page
let gActive = 0; // le build montré (son onglet) : un index, le temps de la page
let gBase = new Map(); // clé de build → ce qui partirait sans y toucher
let gOrder = []; // les clés dans l'ordre du disque
let gServer = []; // erreurs du dernier enregistrement, par clé de build
let gTr = { busy: false, error: '' }; // « Traduire » : en cours, son dernier refus
const gTrOpen = new Set(); // les « Traductions » dépliées, par clé de build
let gSeq = 0;
// L'aperçu : ce que la fiche perso fera des builds, résolu par le serveur
// (`POST /api/gear-reco/preview`) et rendu par `previewHtml`. UNE requête pour
// tous les builds du perso, UNE langue pour tout l'onglet.
const gPv = {
  lang: gear.langs.default,
  seq: 0, // la dernière requête partie : une réponse plus ancienne est ignorée
  timer: 0, // le délai après la dernière frappe
  sent: '', // ce que la dernière requête portait : la même ne repart pas
  busy: false,
  error: '', // le refus du serveur, ou l'échec réseau
  labels: null, // les libellés de la fiche, dans la langue de l'aperçu
  builds: new Map(), // clé de build → son build résolu
  shut: new Set(), // les aperçus repliés : le temps de la page, rien n'est retenu
};
const G_PV_DELAY = 400;
// Élément et rareté par perso : le roster des recos ne les porte pas, celui
// de « Rangs » (`/api/ranks`) si. Sans lui, le picker se passe d'élément.
let gMeta = new Map();
// Les filtres du picker de perso : ils survivent à sa fermeture, pas la
// recherche. `seg` : le groupe « Tous · Avec recos · Sans recos ».
const gPick = { elements: new Set(), classes: new Set(), seg: '' };

const G_KEYS = ['name', 'weapons', 'amulets', 'talismans', 'sets', 'substats', 'note'];
const G_LISTS = ['weapons', 'amulets', 'talismans', 'sets'];
const G_SLOTS = {
  name: 'Nom',
  weapons: 'Armes',
  amulets: 'Amulettes',
  talismans: 'Talismans',
  sets: 'Sets',
  substats: 'Substats',
  note: 'Note',
};
const gLangs = () => [...gear.langs.main, ...gear.langs.extra];
const gPlural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

/** Un build du disque (`disk`) et le même en pièces (`pieces`) → modèle. */
function gFromDisk(disk, pieces) {
  const tal = disk.talismans ?? [];
  const preset = tal.length === 1 && tal[0].startsWith('$') ? tal[0].slice(1) : '';
  const pick = (p) => ({ id: p.id, mainStat: p.mainStat ?? '' });
  return {
    k: `g${++gSeq}`,
    keys: Object.keys(disk),
    name: disk.name ?? '',
    weapons: (disk.weapons ?? []).map(pick),
    amulets: (disk.amulets ?? []).map(pick),
    tal: { preset, pieces: [...(preset ? (pieces.talismans ?? []) : tal)] },
    sets: (disk.sets ?? []).map((c, i) => ({
      preset: c.preset ?? '',
      pieces: (pieces.sets?.[i]?.pieces ?? []).map((p) => ({ set: p.set, count: p.count })),
    })),
    sub: {
      preset: disk.substats?.startsWith('$') ? disk.substats.slice(1) : '',
      text: pieces.substats ?? '',
    },
    note: { ...(disk.note ?? {}) },
    noteKeys: Object.keys(disk.note ?? {}),
    // L'anglais dont datent les traductions : celui du disque, puis celui de
    // chaque « Traduire ». Propre à la page, jamais écrit.
    noteAt: disk.note?.[gear.langs.default] ?? '',
  };
}

const gNewBuild = () => ({
  k: `g${++gSeq}`,
  keys: [],
  name: '',
  weapons: [],
  amulets: [],
  tal: { preset: '', pieces: [] },
  sets: [],
  sub: { preset: '', text: '' },
  note: {},
  noteKeys: [],
  noteAt: '',
});

/**
 * Modèle → build à envoyer. Un build intact rend le JSON de son entrée du
 * disque, clés dans le même ordre : seuls les builds touchés bougent dans
 * le diff. Une clé vide ne s'écrit pas, sauf une liste que le disque
 * portait déjà.
 */
function gToBuild(b) {
  const pick = (p) => (p.mainStat ? { id: p.id, mainStat: p.mainStat } : { id: p.id });
  const all = {
    name: b.name,
    weapons: b.weapons.map(pick),
    amulets: b.amulets.map(pick),
    talismans: b.tal.preset ? [`$${b.tal.preset}`] : [...b.tal.pieces],
    sets: b.sets.map((c) =>
      c.preset
        ? { preset: c.preset }
        : { pieces: c.pieces.map((p) => ({ set: p.set, count: p.count })) },
    ),
    substats: b.sub.preset ? `$${b.sub.preset}` : b.sub.text,
    note: Object.fromEntries(
      // Les langues du disque dans leur ordre, les nouvelles dans celui du site.
      [...new Set([...b.noteKeys, ...gLangs()])]
        .filter((l) => b.note[l])
        .map((l) => [l, b.note[l]]),
    ),
  };
  const filled = (key) =>
    key === 'name' ||
    (G_LISTS.includes(key)
      ? all[key].length > 0 || b.keys.includes(key)
      : key === 'note'
        ? Object.keys(all.note).length > 0
        : all[key] !== '');
  return Object.fromEntries(
    [...new Set([...b.keys, ...G_KEYS])]
      .filter((key) => key in all && filled(key))
      .map((key) => [key, all[key]]),
  );
}

const gStatus = (b) =>
  !gBase.has(b.k)
    ? 'nouveau'
    : JSON.stringify(gToBuild(b)) !== gBase.get(b.k).json
      ? 'modifié'
      : '';

// La note se saisit en ANGLAIS ; les autres langues se génèrent (« Traduire »)
// et se relisent. Le site replie une langue absente sur l'anglais.
const gTrLangs = () => gLangs().filter((l) => l !== gear.langs.default);
const gEn = (b) => (b.note[gear.langs.default] ?? '').trim();
const gMoved = (b) => gEn(b) !== b.noteAt.trim();
/** Des traductions qui datent d'un autre anglais que celui saisi. */
const gStale = (b) => Boolean(gEn(b)) && gMoved(b) && gTrLangs().some((l) => b.note[l]);
/**
 * Ce qui part au traducteur (règle de `createFreshness`, côté admin) : un
 * anglais retouché depuis la dernière traduction, ou une langue qui manque.
 * Le reste est à jour — le renvoyer brûlerait du quota pour le même texte.
 */
const gToTranslate = (b) =>
  Boolean(gEn(b)) && (gMoved(b) || gTrLangs().some((l) => !b.note[l]?.trim()));
const gLen = (b) => gPlural((b.note[gear.langs.default] ?? '').length, 'caractère');
const gTally = (b) =>
  `${gTrLangs().filter((l) => b.note[l]).length} / ${gTrLangs().length} — une langue absente se replie sur l’anglais au rendu`;

/**
 * Pose une traduction reçue pour l'anglais `sent`. Anglais retouché : il fait
 * foi, toutes les langues sont réécrites. Anglais inchangé : seules les langues
 * VIDES sont remplies — celles en place ont été relues contre ce même texte
 * (en vider une la fait regénérer). Rend le nombre de langues posées.
 */
function gApply(b, sent, tr) {
  const moved = sent.trim() !== b.noteAt.trim();
  let n = 0;
  for (const lang of gTrLangs()) {
    const next = tr[lang]?.trim();
    if (!next || next === b.note[lang] || (!moved && b.note[lang]?.trim())) continue;
    b.note[lang] = next;
    n++;
  }
  b.noteAt = sent;
  return n;
}

/** Builds ajoutés, modifiés, supprimés — et l'ordre, compté une fois. */
function gearChanges() {
  if (!gChar) return 0;
  const now = gBuilds.map((b) => b.k);
  const kept = gOrder.filter((k) => now.includes(k));
  const moved = now.filter((k) => gBase.has(k)).join() !== kept.join();
  return gOrder.length - kept.length + gBuilds.filter((b) => gStatus(b)).length + (moved ? 1 : 0);
}

/** Quitter l'onglet avec des builds en attente : sur confirmation. */
function gearLeave() {
  const n = gearChanges();
  return (
    !n ||
    confirm(
      `${gPlural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${gChar.name}. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.`,
    )
  );
}

// Ce que le store écrira à la place de pièces saisies une à une : le preset
// de même contenu (`collapseBuild` — le premier trouvé ; le dernier pour
// les sets). Dit à l'écran (le badge d'un combo, des talismans), pour que le
// `$slug` du commit ne surprenne pas.
const gTalKey = (ids) => [...ids].sort().join('|');
const gSetKey = (pieces) =>
  pieces
    .map((p) => `${p.set}:${p.count}`)
    .sort()
    .join('|');
const gTwin = {
  talismans: (pieces) =>
    pieces.length && !pieces.some((t) => t.startsWith('$'))
      ? Object.keys(gear.presets.talismans).find(
          (s) => gTalKey(gear.presets.talismans[s]) === gTalKey(pieces),
        )
      : undefined,
  sets: (pieces) =>
    pieces.length
      ? Object.keys(gear.presets.sets).findLast(
          (s) => gSetKey(gear.presets.sets[s]) === gSetKey(pieces),
        )
      : undefined,
  substats: (text) =>
    text
      ? Object.keys(gear.presets.substats).find((s) => gear.presets.substats[s] === text)
      : undefined,
};
const gTwinText = (slug) =>
  slug ? `Même contenu que le preset $${slug} : enregistré sous ce preset.` : '';

const gLabel = (slot, id) => gear.options[slot].find((o) => o.id === id)?.label ?? `⚠ ${id}`;
const gSetText = (pieces) => pieces.map((p) => `${gLabel('sets', p.set)} ×${p.count}`).join(' + ');
const gTalText = (ids) => ids.map((id) => gLabel('talismans', id)).join(', ');
/** Les presets de substats en lignes de menu : le slug, puis son texte. */
const gSubPresets = () =>
  Object.entries(gear.presets.substats).map(([slug, text]) => ({
    id: slug,
    label: `$${slug} — ${text}`,
  }));
/** Le badge d'un slot à pièces : le `$slug` qui sera écrit, ou qu'il n'y en a pas. */
const gPresetBadge = (slug) =>
  `<span class="badge ${slug ? 'preset' : 'off'}">${slug ? `$${esc(slug)}` : 'sans preset'}</span>`;

/**
 * Les erreurs d'un build, situées (slot, rang) : ce que la page voit seule —
 * une pièce pas choisie, un nom vide — puis celles que le serveur a rendues
 * au dernier enregistrement. Tant qu'il en reste, rien n'est envoyé.
 */
function gIssues(b) {
  const out = [];
  const add = (slot, message, index) => void out.push({ slot, index, message });
  const { presets, options } = gear;
  if (!b.name.trim()) add('name', 'nom vide');
  for (const slot of ['weapons', 'amulets'])
    b[slot].forEach((p, i) => {
      if (!p.id) add(slot, 'pièce non choisie', i);
      else if (!options[slot].some((o) => o.id === p.id))
        add(slot, `pièce inconnue « ${p.id} »`, i);
      else if (!gStatsOf(p).length) add(slot, 'stat principale non choisie', i);
    });
  if (b.tal.preset) {
    if (!Object.hasOwn(presets.talismans, b.tal.preset))
      add('talismans', `preset inconnu « $${b.tal.preset} »`);
  } else
    b.tal.pieces.forEach((t, i) => {
      if (!t) add('talismans', 'talisman non choisi', i);
    });
  b.sets.forEach((c, i) => {
    if (c.preset) {
      if (!Object.hasOwn(presets.sets, c.preset)) add('sets', `preset inconnu « $${c.preset} »`, i);
    } else if (!c.pieces.length) add('sets', 'combo vide', i);
    else if (c.pieces.some((p) => !p.set)) add('sets', 'set non choisi', i);
  });
  if (b.sub.preset && !Object.hasOwn(presets.substats, b.sub.preset))
    add('substats', `preset inconnu « $${b.sub.preset} »`);
  const def = gear.langs.default;
  if (Object.values(b.note).some(Boolean) && !b.note[def])
    add('note', `pas de texte « ${def} », la langue de repli`);
  return [...out, ...gServer.filter((x) => x.k === b.k)];
}

const gIssueText = (x) =>
  `${G_SLOTS[x.slot] ?? 'Build'}${x.index === undefined ? '' : ` ${x.index + 1}`} : ${x.message}`;
/** Où se pose une erreur dans la carte : sa pièce, sinon son slot, sinon l'en-tête. */
function gPlace(b, x) {
  if (!Object.hasOwn(G_SLOTS, x.slot)) return '*';
  const rows = {
    weapons: b.weapons.length,
    amulets: b.amulets.length,
    talismans: b.tal.pieces.length,
    sets: b.sets.length,
  }[x.slot];
  return x.index !== undefined && x.index < (rows ?? 0) ? `${x.slot}:${x.index}` : x.slot;
}
const gIssueBadges = (b, issues, key) =>
  issues
    .filter((x) => gPlace(b, x) === key)
    .map((x) => `<span class="badge error">${esc(key === '*' ? gIssueText(x) : x.message)}</span>`)
    .join('');
const gCardClass = (b, issues) =>
  `card g-build${issues.length ? ' ko' : gStatus(b) ? ' dirty' : ''}`;
/** Les erreurs qui retiennent l'envoi, une ligne chacune. */
const gBad = () =>
  gBuilds.flatMap((b, i) =>
    gIssues(b).map((x) => `build ${i + 1}${b.name ? ` « ${b.name} »` : ''} · ${gIssueText(x)}`),
  );

// Les icônes du site, sous `imgBase` : décoratives, doublées par un nom.
const gSrc = (path) => `${esc(state.imgBase)}/images/${path}.webp`;
const gCap = (slug) => slug.charAt(0).toUpperCase() + slug.slice(1);
const gIcon = (kind, slug, cls = '') =>
  `<img${cls ? ` class="${cls}"` : ''} src="${gSrc(
    `ui/${kind === 'element' ? 'elem/IG_Turn_Element_' : 'class/IG_Turn_Class_'}${gCap(esc(slug))}`,
  )}" alt="" aria-hidden="true" />`;
// La tuile d'item du jeu (`gear-view.mjs`) : 64 px dans un picker, 44 px dans
// une carte de build ; un set, ses pièces — 34 px en grille, 32 px en rangée.
const gEnv = () => ({ imgBase: state.imgBase, esc });
/** La tuile d'une option d'arme, d'amulette ou de talisman — ou sa place vide. */
const gPieceTile = (o, size) => itemTile(gEnv(), o, size);
/** Le nom d'une pièce, coloré par son grade ; un set est toujours unique. */
const gName = (label, grade, cls) => itemName(gEnv(), label, grade, cls);
const G_SVG = (path, w = 2.2) =>
  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const G_ICONS = {
  dup: G_SVG(
    '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    2,
  ),
  up: G_SVG('<path d="M6 15l6-6 6 6"/>'),
  down: G_SVG('<path d="M6 9l6 6 6-6"/>'),
};

const gOpt = (value, label, cur) =>
  `<option value="${esc(value)}"${value === cur ? ' selected' : ''}>${esc(label)}</option>`;

/** Un menu. La valeur courante y reste même hors liste, pour ne pas la perdre. */
function gSelect({ attrs, cur, none, list, bad }) {
  const stray = cur && !list.some((o) => o.id === cur);
  return `<select ${attrs}${bad ? ' class="refused"' : ''}>${gOpt('', none, cur)}${
    stray ? gOpt(cur, `⚠ ${cur} (hors liste)`, cur) : ''
  }${list.map((o) => gOpt(o.id, o.label, cur)).join('')}</select>`;
}

const gOption = (slot, id) => gear.options[slot].find((o) => o.id === id);
const gFits = (o) => !o.classLimits?.length || o.classLimits.includes(gChar.class);
/** Armes et amulettes du perso : celles de sa classe, plus les pièces déjà posées. */
function gGearList(slot, placed) {
  const off = gear.options[slot].filter((o) => placed.includes(o.id) && !gFits(o));
  return [...off, ...gear.options[slot].filter(gFits)];
}

const gStatsOf = (p) =>
  p.mainStat
    .split('/')
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Stat principale : celles du pool de CETTE pièce, en bascules. Plusieurs
 * actives = une stat composée (« PEN%/CHD », dans l'ordre où on les active).
 * Une stat hors pool (le disque en porte) reste là, en rouge : un clic la
 * retire, et elle ne revient pas.
 */
function gStats(slot, i, p, one, bad) {
  const pool = gOption(slot, p.id)?.mainStats ?? [];
  const on = gStatsOf(p);
  const tog = (stat, out) =>
    `<button class="g-stat${out ? ' out' : ''}" type="button" data-act="stat" data-slot="${slot}" data-i="${i}" data-stat="${esc(stat)}" aria-pressed="${on.includes(stat)}"${
      out ? ' title="Hors du pool de cette pièce : un clic la retire."' : ''
    }>${out ? '⚠ ' : ''}${esc(stat)}</button>`;
  return `<div class="g-stats${bad ? ' refused' : ''}" role="group" aria-label="Stat principale de l’${one} ${i + 1}">${on
    .filter((stat) => !pool.includes(stat))
    .map((stat) => tog(stat, true))
    .join('')}${pool.map((stat) => tog(stat, false)).join('')}</div>`;
}

function gCard(b) {
  const issues = gIssues(b);
  const badSlot = (slot) => issues.some((x) => x.slot === slot);
  const badAt = (slot, i) =>
    issues.some((x) => x.slot === slot && (x.index === undefined || x.index === i));
  const base = gBase.get(b.k)?.build;
  const now = gToBuild(b);
  // Un build NOUVEAU est marqué d'un bloc, pas champ par champ.
  const moved = (key) =>
    base && JSON.stringify(now[key] ?? null) !== JSON.stringify(base[key] ?? null);
  const slotClass = (key, wide) => `g-slot${wide ? ' wide' : ''}${moved(key) ? ' dirty' : ''}`;
  const rm = (act, data, what) =>
    `<button class="btn icon del" data-act="${act}" ${data} title="Retirer" aria-label="Retirer ${what}">✕</button>`;
  // Les erreurs posées à cet endroit de la carte (cf. `gPlace`).
  const iss = (key, tag = 'span') =>
    `<${tag} class="g-iss" data-iss="${key}">${gIssueBadges(b, issues, key)}</${tag}>`;
  // Les substats sous preset : leur `$slug`, et le bouton qui rend le texte.
  const slug = (preset) => `<span class="badge preset">$${esc(preset)}</span>`;
  const free = (data) =>
    `<button class="btn ghost sm g-push" data-act="free" ${data}>régler à la pièce</button>`;
  const at = gBuilds.indexOf(b);

  // Une pièce : sa tuile (un clic ouvre le picker du slot) puis, à côté, ses stats.
  const picks = (slot, one) =>
    `<div class="${slotClass(slot)}"><h3>${G_SLOTS[slot]}${iss(slot)}</h3>${b[slot]
      .map((p, i) => {
        const o = gOption(slot, p.id);
        const noStat = Boolean(o) && !gStatsOf(p).length;
        return `<div class="g-piece g-gear"><button class="g-item${
          badAt(slot, i) && !noStat ? ' refused' : ''
        }" type="button" data-act="pick" data-slot="${slot}" data-i="${i}" aria-haspopup="dialog" title="Choisir les ${one}s du build">${gPieceTile(o, 44)}${gName(
          o ? o.label : p.id ? `⚠ ${p.id}` : '— choisir —',
          o?.grade,
          'g-item-n',
        )}${o && !gFits(o) ? '<span class="badge warn">hors classe</span>' : ''}</button>${gStats(slot, i, p, one, noStat)}${rm('rm', `data-slot="${slot}" data-i="${i}"`, `l’${one} ${i + 1}`)}</div>${iss(`${slot}:${i}`, 'div')}`;
      })
      .join(
        '',
      )}<div class="g-foot"><button class="btn ghost sm" type="button" data-act="pick" data-slot="${slot}" data-i="-1" aria-haspopup="dialog">＋ ${one}</button></div></div>`;

  // Les talismans : leurs tuiles, et le `$slug` sous lequel la liste s'écrit —
  // celui que le disque cite tant qu'elle n'a pas bougé, sinon celui du preset
  // de même contenu.
  const talismans = `<div class="${slotClass('talismans')}"><h3>${G_SLOTS.talismans}${
    b.tal.preset || b.tal.pieces.length
      ? gPresetBadge(b.tal.preset || gTwin.talismans(b.tal.pieces))
      : ''
  }${iss('talismans')}</h3><div class="g-tals">${b.tal.pieces
    .map((t, i) => {
      const o = gOption('talismans', t);
      return `<span class="g-item g-tal${badAt('talismans', i) ? ' refused' : ''}">${gPieceTile(o, 44)}<span class="g-item-col">${gName(
        o ? o.label : t ? `⚠ ${t}` : '— non choisi —',
        o?.grade,
        'g-item-n',
      )}${iss(`talismans:${i}`)}</span>${rm('rm', `data-slot="talismans" data-i="${i}"`, `le talisman ${i + 1}`)}</span>`;
    })
    .join(
      '',
    )}</div><div class="g-foot"><button class="btn ghost sm" type="button" data-act="pick" data-slot="talismans" aria-haspopup="dialog">＋ talisman</button></div></div>`;

  // Un combo : une rangée de tuiles (`ComboLineView`, fiche perso) — les pièces
  // que chaque set y occupe, son nom, son nombre — puis le `$slug` sous lequel
  // il s'écrit. Les sets ne s'éditent que par « Composer un mix… ».
  const sets = `<div class="${slotClass('sets')}"><h3>${G_SLOTS.sets}</h3>${b.sets
    .map(
      (c, ci) =>
        `<div class="g-combo">${c.pieces
          .map((p, pi) => {
            const o = gOption('sets', p.set);
            return `${pi ? '<span class="g-plus" aria-hidden="true">+</span>' : ''}<span class="g-combo-set">${setRow(
              gEnv(),
              o,
              { count: p.count, idx: pi },
              32,
            )}${gName(
              o ? o.label : p.set ? `⚠ ${p.set}` : '— set —',
              o ? 'unique' : '',
              'g-set-n',
            )}<span class="lbl">${p.count}p</span></span>`;
          })
          .join(
            '',
          )}${iss(`sets:${ci}`)}<span class="g-combo-end">${gPresetBadge(c.preset || gTwin.sets(c.pieces))}${rm('rm-combo', `data-c="${ci}"`, `le combo ${ci + 1}`)}</span></div>`,
    )
    .join(
      '',
    )}<div class="g-foot"><button class="btn ghost sm" type="button" data-act="pick" data-slot="sets" aria-haspopup="dialog" title="Un set principal, seul (4 pièces) ou avec des secondaires (un combo 2 + 2 par secondaire). Remplace les combos du build.">Composer un mix…</button>${iss('sets')}</div></div>`;

  const text = (t, lang) =>
    t === 'name' ? now.name : t === 'sub' ? (now.substats ?? '') : (now.note?.[lang] ?? '');
  const was = (t, lang) =>
    t === 'name' ? base.name : t === 'sub' ? (base.substats ?? '') : (base.note?.[lang] ?? '');
  const cls = (t, lang, bad) =>
    [base && text(t, lang) !== was(t, lang) && 'dirty', bad && 'refused'].filter(Boolean).join(' ');

  const substats = `<div class="${slotClass('substats')}"><h3>${G_SLOTS.substats}<span data-preset="sub">${
    b.sub.preset ? slug(b.sub.preset) : ''
  }</span>${iss('substats')}${b.sub.preset ? free('data-slot="substats"') : ''}</h3>
    <div class="g-piece g-sub">${gSelect({
      attrs: 'data-s="sub-preset" aria-label="Preset de substats"',
      cur: b.sub.preset,
      none: '— texte libre —',
      list: gSubPresets(),
      bad: badSlot('substats'),
    })}<input data-t="sub" class="${[cls('sub'), b.sub.preset && 'g-dim'].filter(Boolean).join(' ')}" value="${esc(b.sub.text)}" placeholder="ATK>CHC=CHD>SPD" aria-label="Ordre des substats" /></div>
    <p class="g-ro" data-twin>${b.sub.preset ? '' : gTwinText(gTwin.substats(b.sub.text))}</p></div>`;

  // Le saut de ligne après `<textarea>` est mangé par le navigateur : sans
  // lui, c'est celui d'une note qui commence par une ligne vide qui le serait.
  const def = gear.langs.default;
  const area = (lang, attrs) =>
    `<textarea id="${b.k}-${lang}" data-t="note" data-lang="${lang}" ${attrs} class="${cls(
      'note',
      lang,
      lang === def && badSlot('note'),
    )}">\n${esc(b.note[lang] ?? '')}</textarea>`;
  // L'anglais seul se saisit ; « Traduire » vaut pour TOUS les builds du perso.
  const note = `<div class="${slotClass('note', true)}"><h3>${G_SLOTS.note}<span class="badge off">${def}</span>${iss('note')}</h3>
    ${area(def, 'aria-label="Note, en anglais"')}
    <div class="g-tr"><button class="btn ghost${gTr.busy ? ' busy' : ''}" data-act="translate"${gTr.busy ? ' disabled' : ''} title="Traduit les notes de tous les builds du perso : les langues qui manquent, ou toutes quand l’anglais a changé (DeepL, puis Claude Haiku). Rien ne s’écrit avant « Enregistrer ».">Traduire</button><span class="badge error" data-tr-error>${esc(gTr.error)}</span><span class="lbl g-push" data-len>${gLen(b)}</span></div>
    <details${gTrOpen.has(b.k) ? ' open' : ''}>
      <summary><span class="btn ghost sm">Traductions (${gTrLangs().length})</span><span class="badge warn" data-stale>${gStale(b) ? 'à retraduire' : ''}</span><span class="lbl" data-tally>${gTally(b)}</span></summary>
      <div class="g-notes">${gTrLangs()
        .map(
          (lang) =>
            `<div class="field"><label for="${b.k}-${lang}">${lang}</label>${area(lang, 'placeholder="— (repli sur l’anglais au rendu)"')}</div>`,
        )
        .join('')}</div>
    </details></div>`;

  return `<div class="${gCardClass(b, issues)}" data-k="${b.k}">
    <div class="card-head">
      <span class="lbl">Build</span>
      <input data-t="name" class="g-name ${cls('name', undefined, badSlot('name'))}" value="${esc(b.name)}" placeholder="Nom du build (Speed, PvP…)" aria-label="Nom du build" />
      <span class="badge edit" data-badge>${gStatus(b)}</span>
      ${iss('name')}${iss('*')}
      <div class="g-tools">
        <button class="btn icon" data-act="dup" title="Dupliquer" aria-label="Dupliquer le build">${G_ICONS.dup}</button>
        <button class="btn icon" data-act="up"${at ? '' : ' disabled'} title="Monter" aria-label="Monter le build">${G_ICONS.up}</button>
        <button class="btn icon" data-act="down"${at < gBuilds.length - 1 ? '' : ' disabled'} title="Descendre" aria-label="Descendre le build">${G_ICONS.down}</button>
        <button class="btn icon del" data-act="del" title="Supprimer" aria-label="Supprimer le build">✕</button>
      </div>
    </div>
    <div class="g-grid">
      <div class="g-col">${picks('weapons', 'arme')}${picks('amulets', 'amulette')}</div>
      <div class="g-col">${talismans}${sets}${substats}</div>
      ${note}
    </div>
    ${gPvBlock(b)}
  </div>`;
}

/** Le contenu d'un aperçu : le refus, sinon le dernier rendu reçu pour ce build. */
function gPvBody(b) {
  if (gPv.error) return `<p class="g-pv-ko">Aperçu refusé : ${esc(gPv.error)}</p>`;
  const view = gPv.builds.get(b.k);
  if (!view) return '<p class="lbl">Aperçu en cours…</p>';
  return (
    previewHtml(gEnv(), view, gPv.labels, gear.statIcons ?? {}) ||
    '<p class="lbl">Rien à montrer : ni pièce, ni set, ni substats, ni note.</p>'
  );
}

/**
 * L'aperçu d'un build, en bas de sa carte : dépliable, ouvert d'office. Une
 * carte redessinée — ou montrée par son onglet — reprend le dernier rendu
 * reçu pour son build, atténué tant qu'une requête court (`.busy`).
 */
function gPvBlock(b) {
  const open = !gPv.shut.has(b.k);
  return `<div class="g-pv"><button class="g-pv-head" type="button" data-act="pv" aria-expanded="${open}"><span class="g-pv-caret" aria-hidden="true">▾</span>Aperçu<span class="lbl">ce que la fiche perso montrera</span></button><div class="g-pv-body pv${
    gPv.busy ? ' busy' : ''
  }" data-pv${open ? '' : ' hidden'}>${gPvBody(b)}</div></div>`;
}

/** L'aperçu de la carte en place (le build montré) : son atténuation, et `redraw` son contenu. */
function gPvPaint(redraw) {
  for (const b of gBuilds) {
    const at = gCardEl(b)?.querySelector('[data-pv]');
    if (!at) continue;
    at.classList.toggle('busy', gPv.busy);
    if (redraw) at.innerHTML = gPvBody(b);
  }
}

/**
 * Demande l'aperçu de TOUS les builds du perso, tels qu'ils partiraient à
 * l'enregistrement — montrés ou non : la réponse est gardée par clé de build,
 * et changer d'onglet redessine depuis elle, sans requête. Pendant la requête
 * le bloc garde son rendu, atténué ; une réponse arrivée après une requête plus
 * récente est ignorée ; un refus (400) ou un échec réseau s'affiche dans le
 * bloc, et se retente au prochain changement.
 */
async function gPvFetch() {
  if (!gChar || !gBuilds.length) return;
  const keys = gBuilds.map((b) => b.k);
  const body = JSON.stringify({ builds: gBuilds.map(gToBuild), lang: gPv.lang });
  // Les clés comptent : un perso relu du disque a les mêmes builds sous d'autres clés.
  const sent = `${keys.join()} ${body}`;
  if (sent === gPv.sent) return;
  gPv.sent = sent;
  const seq = ++gPv.seq;
  gPv.busy = true;
  gPvPaint(false);
  let error = '';
  try {
    const res = await fetch('/api/gear-reco/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const r = await res.json();
    if (seq !== gPv.seq) return;
    if (!res.ok || !r.builds) throw new Error(r.error ?? r.log?.[0] ?? `réponse ${res.status}`);
    gPv.builds = new Map(keys.map((k, i) => [k, r.builds[i]]));
    gPv.labels = r.labels;
  } catch (e) {
    if (seq !== gPv.seq) return;
    error = e instanceof Error ? e.message : String(e);
    gPv.sent = '';
  }
  gPv.error = error;
  gPv.busy = false;
  gPvPaint(true);
}

/** L'aperçu suit un changement : aussitôt, ou `delay` ms après la dernière frappe. */
function gPvAsk(delay = 0) {
  clearTimeout(gPv.timer);
  if (delay) gPv.timer = setTimeout(gPvFetch, delay);
  else gPvFetch();
}

/** Le groupe des langues de l'aperçu, dans la barre : les langues du site. */
function gPvLangs() {
  $('g-pv-lang').innerHTML = `<span class="lbl">Aperçu</span>${gSeg(
    'Langue de l’aperçu',
    'lang',
    gPv.lang,
    gLangs().map((l) => [l, l]),
  )}`;
}
$('g-pv-lang').onclick = (e) => {
  const el = e.target.closest('button[data-lang]');
  if (!el || el.dataset.lang === gPv.lang) return;
  gPv.lang = el.dataset.lang;
  gSegPress(el);
  gPvAsk();
};

/** Le perso choisi : portrait, nom, élément, classe, rareté. */
function gWho() {
  const meta = gChar && gMeta.get(gChar.id);
  const trait = (kind, slug) => `<span class="g-trait">${gIcon(kind, slug)}${esc(slug)}</span>`;
  $('g-who').innerHTML = gChar
    ? `<img class="g-face" src="${gSrc(`characters/portrait/CT_${esc(gChar.id)}`)}" alt="" aria-hidden="true" width="56" height="56" />
      <div class="g-id"><strong>${esc(gChar.name)}</strong>
        <span class="g-traits">${meta ? trait('element', meta.element) : ''}${trait('class', gChar.class)}${
          meta
            ? `<span class="g-stars" title="${meta.rarity}★">${`<img src="${gSrc('ui/star/CM_icon_star_y')}" alt="" aria-hidden="true" />`.repeat(meta.rarity)}</span>`
            : ''
        }<span class="badge off" id="g-sum"></span></span>
      </div>`
    : '<span class="lbl">Aucun perso choisi.</span>';
  $('g-pick-label').textContent = gChar ? 'Changer de perso' : 'Choisir un perso';
}

function gBar() {
  const n = gearChanges();
  const bad = gBad();
  $('g-bar').hidden = !gChar;
  $('g-count').innerHTML =
    `${n ? `<span class="badge edit">${gPlural(n, 'changement')}</span>` : ''}${
      bad.length ? `<span class="badge error">${gPlural(bad.length, 'erreur')}</span>` : ''
    }<span class="g-msg" title="${esc(bad.join('\n'))}">${esc(bad[0] ?? (n ? '' : 'aucune modification'))}</span>`;
  if (gChar) {
    const notes = gBuilds.filter((b) => Object.values(b.note).some(Boolean)).length;
    $('g-sum').textContent = `${gPlural(gBuilds.length, 'build')} · ${gPlural(notes, 'note')}`;
  }
  $('g-add').disabled = !gChar;
  $('g-save').disabled = $('g-reset').disabled = !n;
}

/** La carte d'un build — `null` s'il n'est pas le build montré. */
const gCardEl = (b) => $('g-list').querySelector(`[data-k="${b.k}"]`);

/** Retient, avant de redessiner ou de remplacer la carte en place, si ses « Traductions » sont dépliées. */
function gTrKeep() {
  const card = $('g-list').querySelector('[data-k]');
  if (!card) return;
  if (card.querySelector('details').open) gTrOpen.add(card.dataset.k);
  else gTrOpen.delete(card.dataset.k);
}

/**
 * La rangée d'onglets : un par build, dans leur ordre — son nom, ou « Build n ».
 * Un point dit ce qu'un onglet caché ne montre pas : accent, le build est
 * nouveau ou modifié et pas encore enregistré (ce que compte la savebar) ;
 * rouge, il porte une erreur. Sans build, pas de rangée.
 */
function gTabs() {
  const row = $('g-tabs');
  const list = $('g-list');
  // La rangée est réécrite : l'onglet actif reprend le focus qu'elle avait.
  const focused = row.contains(document.activeElement);
  row.hidden = !gChar || !gBuilds.length;
  row.innerHTML = row.hidden
    ? ''
    : gBuilds
        .map((b, i) => {
          const bad = gIssues(b).length;
          const dot = bad
            ? ['ko', gPlural(bad, 'erreur')]
            : gStatus(b)
              ? ['edit', `${gStatus(b)}, pas encore enregistré`]
              : null;
          return `<button class="tab" type="button" role="tab" id="${b.k}-tab" data-i="${i}" aria-selected="${i === gActive}" aria-controls="g-list" tabindex="${i === gActive ? 0 : -1}">${esc(
            b.name || `Build ${i + 1}`,
          )}${dot ? `<span class="dot ${dot[0]}" role="img" aria-label="${dot[1]}" title="${dot[1]}"></span>` : ''}</button>`;
        })
        .join('');
  if (row.hidden) {
    list.removeAttribute('role');
    list.removeAttribute('aria-labelledby');
  } else {
    list.setAttribute('role', 'tabpanel');
    list.setAttribute('aria-labelledby', `${gBuilds[gActive].k}-tab`);
  }
  if (focused) row.children[gActive]?.focus();
}

/**
 * La rangée d'onglets et LA carte, celle du build montré : un build ajouté,
 * retiré ou déplacé, un autre onglet, un autre perso.
 */
function gRender() {
  gTrKeep();
  gActive = Math.max(0, Math.min(gActive, gBuilds.length - 1));
  const b = gBuilds[gActive];
  $('g-list').innerHTML = !gChar
    ? ''
    : b
      ? gCard(b)
      : '<div class="empty">Aucun build pour ce perso : « ＋ build » en ajoute un.</div>';
  gTabs();
  gBar();
  gPvAsk();
}

/**
 * La carte d'un build : un menu a changé, une pièce est ajoutée ou retirée.
 * Un build qui n'est pas montré n'a pas de carte : seuls sa rangée d'onglets
 * et la savebar suivent.
 */
function gRedraw(b) {
  if (gCardEl(b)) {
    gTrKeep();
    gCardEl(b).outerHTML = gCard(b);
  }
  gTabs();
  gBar();
  gPvAsk();
}

/** Montre le build `i` : la carte change, pas les builds — l'aperçu ne repart pas. */
function gShow(i) {
  if (i === gActive || !gBuilds[i]) return;
  gActive = i;
  gRender();
}
$('g-tabs').onclick = (e) => {
  const el = e.target.closest('[role="tab"]');
  if (el) gShow(Number(el.dataset.i));
};
// Flèches, Début, Fin : l'onglet voisin (les bouts se rejoignent), le premier,
// le dernier — montré aussitôt, et il prend le focus (`gTabs`).
$('g-tabs').onkeydown = (e) => {
  const n = gBuilds.length;
  const to = {
    ArrowLeft: (gActive + n - 1) % n,
    ArrowRight: (gActive + 1) % n,
    Home: 0,
    End: n - 1,
  }[e.key];
  if (to === undefined) return;
  e.preventDefault();
  gShow(to);
};

const gOf = (el) => {
  const k = el?.closest('[data-k]')?.dataset.k;
  return gBuilds.find((b) => b.k === k);
};
// Un build retouché ne porte plus les erreurs du dernier enregistrement.
const gTouched = (b) => (gServer = gServer.filter((x) => x.k !== b.k));

// Frappe : l'état suit, la carte n'est PAS redessinée — le champ y perdrait
// le curseur. Seuls ses marques, ses erreurs et le compteur sont remis à jour.
$('g-list').oninput = (e) => {
  const el = e.target.closest('[data-t]');
  const b = gOf(el);
  if (!b) return;
  gTouched(b);
  const { t, lang } = el.dataset;
  const card = gCardEl(b);
  if (t === 'name') b.name = el.value.trim();
  else if (t === 'sub') {
    // Un texte saisi détache le preset.
    b.sub = { preset: '', text: el.value.trim() };
    card.querySelector('[data-s="sub-preset"]').value = '';
    card.querySelector('[data-preset="sub"]').innerHTML = '';
    card.querySelector('[data-act="free"][data-slot="substats"]')?.remove();
    el.classList.remove('g-dim');
    card.querySelector('[data-twin]').textContent = gTwinText(gTwin.substats(b.sub.text));
  } else b.note[lang] = el.value.trim() ? el.value : '';

  const issues = gIssues(b);
  const base = gBase.get(b.k)?.build;
  const now = gToBuild(b);
  const was = t === 'name' ? base?.name : t === 'sub' ? base?.substats : base?.note?.[lang];
  const is = t === 'name' ? now.name : t === 'sub' ? now.substats : now.note?.[lang];
  el.classList.toggle('dirty', Boolean(base) && (is ?? '') !== (was ?? ''));
  const key = t === 'sub' ? 'substats' : 'note';
  el.closest('.g-slot')?.classList.toggle(
    'dirty',
    Boolean(base) && JSON.stringify(now[key] ?? null) !== JSON.stringify(base[key] ?? null),
  );
  card.querySelector('[data-t="name"]').classList.toggle(
    'refused',
    issues.some((x) => x.slot === 'name'),
  );
  card.querySelector(`[data-t="note"][data-lang="${gear.langs.default}"]`).classList.toggle(
    'refused',
    issues.some((x) => x.slot === 'note'),
  );
  card.className = gCardClass(b, issues);
  card.querySelector('[data-badge]').textContent = gStatus(b);
  for (const at of card.querySelectorAll('[data-iss]'))
    at.innerHTML = gIssueBadges(b, issues, at.dataset.iss);
  if (t === 'note') {
    card.querySelector('[data-len]').textContent = gLen(b);
    card.querySelector('[data-stale]').textContent = gStale(b) ? 'à retraduire' : '';
    card.querySelector('[data-tally]').textContent = gTally(b);
  }
  gTabs();
  gBar();
  gPvAsk(G_PV_DELAY);
};

/**
 * « Traduire » : les notes anglaises de TOUS les builds du perso, d'un seul
 * appel. Le résultat se pose dans le modèle de la page — il compte dans la
 * savebar et ne part au disque qu'à « Enregistrer », où le serveur contrôle
 * les tags des traductions comme ceux de l'anglais.
 */
async function gTranslate() {
  if (gTr.busy) return;
  const todo = gBuilds
    .filter(gToTranslate)
    .map((b) => ({ k: b.k, en: b.note[gear.langs.default] }));
  gTr = { busy: Boolean(todo.length), error: '' };
  for (const el of $('g-list').querySelectorAll('[data-act="translate"]')) {
    el.disabled = gTr.busy;
    el.classList.toggle('busy', gTr.busy);
  }
  for (const el of $('g-list').querySelectorAll('[data-tr-error]')) el.textContent = '';
  if (!todo.length)
    return log(
      ['Rien à traduire : pas de note anglaise retouchée, ni de langue qui manque.'],
      true,
    );

  log([], undefined, `traduction de ${gPlural(todo.length, 'note')}`);
  const done = [];
  try {
    const res = await fetch('/api/gear-reco/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texts: todo.map((x) => x.en) }),
    });
    const r = await res.json();
    if (!r.results) throw new Error(r.error ?? r.log?.[0] ?? `réponse ${res.status}`);
    let filled = 0;
    todo.forEach((x, i) => {
      // Un build supprimé pendant l'appel n'attend plus rien.
      const b = gBuilds.find((y) => y.k === x.k);
      if (!b) return;
      const n = gApply(b, x.en, r.results[i] ?? {});
      if (!n) return;
      filled += n;
      gTouched(b);
      done.push(b);
    });
    log(
      [
        filled
          ? `${gPlural(done.length, 'note')} : ${gPlural(filled, 'traduction')} posée${filled > 1 ? 's' : ''} par ${
              r.provider === 'haiku' ? 'Claude Haiku (quota DeepL vide)' : 'DeepL'
            } — à relire, puis « Enregistrer ».`
          : 'Le traducteur n’a rien rendu de neuf.',
      ],
      true,
    );
  } catch (e) {
    gTr.error = e instanceof Error ? e.message : String(e);
    log([`Traduction refusée : ${gTr.error}`], false);
  } finally {
    gTr.busy = false;
    gRender();
    // Ce qui vient d'être traduit s'ouvre : c'est à relire — la carte en
    // place aussitôt, les autres quand leur onglet les montrera.
    for (const b of done) {
      gTrOpen.add(b.k);
      const d = gCardEl(b)?.querySelector('details');
      if (d) d.open = true;
    }
  }
}

$('g-list').onchange = (e) => {
  const el = e.target.closest('select[data-s]');
  const b = gOf(el);
  if (!b) return;
  gTouched(b);
  // Le seul menu de la carte : le preset des substats. Choisi, il pose son
  // texte ; « texte libre » garde le texte pour départ.
  if (el.dataset.s === 'sub-preset')
    b.sub = { preset: el.value, text: gear.presets.substats[el.value] ?? b.sub.text };
  gRedraw(b);
};

$('g-list').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  const b = gOf(el);
  if (!b) return;
  const { act, slot, c } = el.dataset;
  const i = Number(el.dataset.i);
  const at = gBuilds.indexOf(b);

  if (act === 'translate') return gTranslate();
  // « Aperçu » : replie ou déplie le bloc, sans toucher au build.
  if (act === 'pv') {
    const open = gPv.shut.delete(b.k);
    if (!open) gPv.shut.add(b.k);
    el.setAttribute('aria-expanded', String(open));
    el.nextElementSibling.hidden = !open;
    return;
  }
  // Une tuile de pièce, « ＋ arme », « ＋ talisman », « Composer un mix… ».
  if (act === 'pick') return gPickSlot(b, slot, i);
  if (act === 'up' || act === 'down') {
    const to = at + (act === 'up' ? -1 : 1);
    if (to < 0 || to >= gBuilds.length) return;
    [gBuilds[at], gBuilds[to]] = [gBuilds[to], gBuilds[at]];
    // L'onglet suit son build.
    gActive = to;
    return gRender();
  }
  if (act === 'del') {
    gBuilds.splice(at, 1);
    gTouched(b);
    // Le voisin précédent prend la place, ou le premier.
    gActive = Math.max(0, at - 1);
    return gRender();
  }
  if (act === 'dup') {
    const copy = structuredClone(b);
    copy.k = `g${++gSeq}`;
    if (copy.name) copy.name += ' (copie)';
    gBuilds.splice(at + 1, 0, copy);
    gActive = at + 1;
    return gRender();
  }

  gTouched(b);
  // Un talisman retiré : la liste n'est plus celle de son preset.
  if (act === 'rm' && slot === 'talismans')
    b.tal = { preset: '', pieces: b.tal.pieces.filter((_, k) => k !== i) };
  else if (act === 'rm') b[slot].splice(i, 1);
  // Une bascule de stat : active, elle se retire ; sinon elle s'ajoute.
  else if (act === 'stat') {
    const on = gStatsOf(b[slot][i]);
    const { stat } = el.dataset;
    b[slot][i].mainStat = (on.includes(stat) ? on.filter((x) => x !== stat) : [...on, stat]).join(
      '/',
    );
  }
  // « régler à la pièce » : les substats quittent leur preset et gardent son
  // texte pour départ, comme le premier choix de leur menu.
  else if (act === 'free') b.sub = { preset: '', text: b.sub.text };
  else if (act === 'rm-combo') b.sets.splice(c, 1);
  gRedraw(b);
  // La carte est redessinée : la bascule cliquée reprend le focus (clavier).
  if (act === 'stat')
    [...gCardEl(b).querySelectorAll(`[data-act="stat"][data-slot="${slot}"][data-i="${i}"]`)]
      .find((x) => x.dataset.stat === el.dataset.stat)
      ?.focus();
};

/**
 * Les builds d'un perso, relus du disque : c'est lui qui fait foi. `at` : le
 * build à montrer — le premier pour un autre perso, celui en place pour le même
 * (« Annuler », un enregistrement), borné par `gRender`.
 */
async function gLoad(id, at = 0) {
  const s = await (await fetch(`/api/gear-reco/state?id=${encodeURIComponent(id)}`)).json();
  if (s.error) return log([s.error], false);
  gear = s;
  gChar = s.roster.find((c) => c.id === id);
  gBuilds = s.disk.map((disk, i) => gFromDisk(disk, s.builds[i]));
  gBase = new Map(
    gBuilds.map((b) => {
      const build = gToBuild(b);
      return [b.k, { build, json: JSON.stringify(build) }];
    }),
  );
  gOrder = gBuilds.map((b) => b.k);
  gServer = [];
  gTr.error = '';
  gPv.builds = new Map();
  gPv.shut.clear();
  gTrOpen.clear();
  gActive = at;
  gWho();
  gRender();
}

// ------------------------------------------------------------- le picker
// UNE modale (`#g-modal`), trois usages, tous en multi-choix : les armes ou
// les amulettes, les talismans, les sets. Le perso, lui, se choisit dans le
// picker de héros partagé (`hero-picker.mjs`, cf. `gOpenChar`).
// `gPkOpen(cfg)` l'ouvre sur :
//   title, search (le placeholder de la recherche), none (rien ne correspond) ;
//   grid     la classe de la grille (`gear` : des tuiles d'équipement) ;
//   multi    plusieurs tuiles se cochent (`aria-pressed`), un pied valide ;
//   opener() l'élément qui reprend le focus à la fermeture ;
//   tally()  le badge de tête ;
//   filters() la rangée de filtres, filter(el) un clic sur un de ses boutons ;
//   items()  les tuiles — { id, label, html, title?, on?, disabled?, cls?,
//            grade? (la couleur du nom), tag? (un badge sous le nom) } —, la
//            recherche porte sur `label` ;
//   pick(id) une tuile choisie : à lui de fermer (`gPkClose`) ou non ;
//   foot()   le pied d'un multi-choix (son récapitulatif, `data-pk="cancel"`,
//            `data-pk="ok"`), done() son « ok ».
// Échap, la croix et un clic sur le voile ferment sans rien poser ; Entrée dans
// la recherche VALIDE (Ctrl + Entrée aussi) ; Entrée ou Espace sur une tuile la
// coche ou la décoche (c'est un bouton) ; Tab reste dans le panneau.
let gPk = null;

const gTile = (it) =>
  `<button class="g-tile${it.cls ? ` ${it.cls}` : ''}" type="button" data-id="${esc(it.id)}" title="${esc(it.title ?? it.label)}"${
    gPk.multi ? ` aria-pressed="${Boolean(it.on)}"` : it.on ? ' aria-current="true"' : ''
  }${it.disabled ? ' disabled' : ''}><span class="g-ring${it.on ? ' on' : ''}">${it.html}</span>${gName(it.label, it.grade, 'g-n')}${it.tag ?? ''}</button>`;

/** La grille, le badge et le pied ; `all` : la rangée de filtres aussi. */
function gPkDraw(all) {
  if (!gPk) return;
  const q = $('g-q').value.trim().toLowerCase();
  const rows = gPk.items().filter((it) => !q || it.label.toLowerCase().includes(q));
  // La tuile cliquée est redessinée : elle reprend le focus (clavier).
  const at = document.activeElement?.closest('#g-results .g-tile')?.dataset.id;
  $('g-tally').textContent = gPk.tally?.() ?? '';
  if (all) $('g-filters').innerHTML = gPk.filters?.() ?? '';
  $('g-results').innerHTML = rows.map(gTile).join('');
  $('g-none').hidden = rows.length > 0;
  $('g-foot').innerHTML = gPk.foot?.() ?? '';
  if (at !== undefined) [...$('g-results').children].find((t) => t.dataset.id === at)?.focus();
}

function gPkOpen(cfg) {
  gPk = cfg;
  $('g-modal-title').textContent = cfg.title;
  $('g-q').value = '';
  $('g-q').placeholder = cfg.search;
  $('g-q').setAttribute('aria-label', cfg.search.replace(/…$/, ''));
  $('g-none').textContent = cfg.none;
  $('g-results').className = `g-tiles${cfg.grid ? ` ${cfg.grid}` : ''}`;
  $('g-foot').hidden = !cfg.foot;
  $('g-modal').hidden = false;
  gPkDraw(true);
  $('g-q').focus();
}

function gPkClose() {
  if (!gPk) return;
  const { opener } = gPk;
  gPk = null;
  $('g-modal').hidden = true;
  $('g-foot').innerHTML = '';
  opener?.()?.focus();
}

/** Une tuile choisie. `pick` ferme ou non : ouverte, la modale est redessinée. */
function gPkPick(id) {
  gPk.pick(id);
  gPkDraw(true);
}

$('g-close').onclick = gPkClose;
$('g-q').oninput = () => gPkDraw();
$('g-modal').onclick = (e) => {
  // Un clic sur le voile, hors du panneau, ferme.
  if (e.target === $('g-modal')) return gPkClose();
  if (!gPk) return;
  const tile = e.target.closest('.g-tile');
  if (tile) return gPkPick(tile.dataset.id);
  const act = e.target.closest('[data-pk]');
  if (act) return act.dataset.pk === 'ok' ? gPk.done() : gPkClose();
  const tog = e.target.closest('#g-filters button');
  if (!tog) return;
  gPk.filter(tog);
  gPkDraw();
};
$('g-modal').onkeydown = (e) => {
  if (!gPk) return;
  // Entrée dans la recherche valide, comme « Valider » (Ctrl + Entrée aussi).
  if (e.key === 'Enter' && e.target === $('g-q')) return gPk.done();
  // Tab reste dans le panneau.
  if (e.key !== 'Tab') return;
  const stops = [...$('g-modal').querySelectorAll('button:not([disabled]), input')];
  const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
  if (document.activeElement !== edge) return;
  e.preventDefault();
  (e.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') gPkClose();
});

/** Un groupe segmenté de la rangée de filtres : un seul bouton enfoncé. */
const gSeg = (label, key, cur, list) =>
  `<div class="g-seg" role="group" aria-label="${label}">${list
    .map(
      ([value, text, off]) =>
        `<button type="button" data-${key}="${value}" aria-pressed="${value === cur}"${off ? ' disabled' : ''}>${text}</button>`,
    )
    .join('')}</div>`;
const gSegPress = (el) => {
  for (const b of el.parentElement.children) b.setAttribute('aria-pressed', String(b === el));
};

/**
 * Un perso choisi dans le picker. Rend `false` pour le garder ouvert : des
 * changements en attente, et l'abandon refusé.
 */
function gChoose(id) {
  if (id === gChar?.id) return;
  const n = gearChanges();
  if (
    n &&
    !confirm(
      `Abandonner ${gPlural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${gChar.name} ?`,
    )
  )
    return false;
  gLoad(id);
}

// Le picker de perso : celui de « Fiche perso » (`hero-picker.mjs`), avec en
// plus le filtre des recos, et sur chaque vignette son nombre de builds.
function gOpenChar() {
  openHeroPicker({
    title: 'Choisir un perso',
    // L'élément vient de « Rangs » (`gMeta`) : le roster des recos ne le porte pas.
    roster: gear.roster.map((c) => ({ ...c, element: gMeta.get(c.id)?.element })),
    imgBase: state.imgBase,
    chosen: gChar?.id,
    filters: gPick,
    opener: () => $('g-pick'),
    tally: () => {
      const done = gear.roster.filter((c) => c.builds).length;
      return `${gPlural(gear.roster.length, 'perso')} · ${done} avec recos · ${gear.roster.length - done} sans`;
    },
    seg: {
      label: 'Recos',
      options: [
        ['', 'Tous'],
        ['with', 'Avec recos'],
        ['without', 'Sans recos'],
      ],
      test: (c, has) => (has === 'with' ? c.builds > 0 : has === 'without' ? !c.builds : true),
    },
    count: (c) => c.builds,
    hint: (c) => `${c.name} — ${c.builds ? gPlural(c.builds, 'build') : 'sans reco'}`,
    onPick: gChoose,
  });
}

/** Le pied d'un multi-choix de pièces : la liste, puis « Annuler » et « Valider ». */
const gPkFoot = (recap, twin) =>
  `<div class="g-recap"><span>${esc(recap)}</span>${
    twin ? `<span class="badge preset">$${esc(twin)}</span>` : ''
  }</div><button class="btn ghost" type="button" data-pk="cancel">Annuler</button><button class="btn primary" type="button" data-pk="ok" title="Entrée dans la recherche, ou Ctrl + Entrée">Valider</button>`;
const G_CHECK = '<span class="g-cnt">✓</span>';

/**
 * Le picker des armes ou des amulettes d'un build, en multi-choix, sur le
 * modèle de celui des talismans : il s'ouvre sur la liste du slot (pièces
 * cochées, dans l'ordre du build), un clic coche ou décoche (ordre des clics),
 * « Valider » remplace la liste. Proposées : les pièces de la classe du perso,
 * plus celles déjà posées. `i` : la tuile qui l'a ouvert, -1 pour « ＋ arme ».
 *
 * Une pièce gardée reste telle quelle, ses stats avec elle — citée deux fois
 * dans le build (une entrée par stat), ses deux entrées. Une pièce nouvelle
 * prend la stat de son pool s'il n'en a qu'une ; sinon aucune : l'erreur à la
 * pièce le dit.
 */
function gOpenGear(b, slot, i) {
  const [one, many] = slot === 'weapons' ? ['arme', 'armes'] : ['amulette', 'amulettes'];
  const sel = [...new Set(b[slot].map((p) => p.id).filter(Boolean))];
  const list = gGearList(slot, sel);
  gPkOpen({
    multi: true,
    title: `Choisir les ${many}`,
    search: `Chercher une ${one}…`,
    none: `Aucune ${one} ne correspond.`,
    grid: 'gear',
    opener: () =>
      gCardEl(b)?.querySelector(`[data-act="pick"][data-slot="${slot}"][data-i="${i}"]`) ??
      gCardEl(b)?.querySelector(`[data-act="pick"][data-slot="${slot}"][data-i="-1"]`),
    tally: () => `${gPlural(sel.length, 'choisie')} sur ${list.length} · ${gChar.class}`,
    items: () =>
      list.map((o) => ({
        id: o.id,
        label: o.label,
        grade: o.grade,
        title: `${o.label}${gFits(o) ? '' : ' (hors classe)'} — ${(o.mainStats ?? []).join(', ')}`,
        on: sel.includes(o.id),
        html: `${gPieceTile(o, 64)}${sel.includes(o.id) ? G_CHECK : ''}`,
        tag: gFits(o) ? '' : '<span class="badge warn">hors classe</span>',
      })),
    pick: (id) => {
      const at = sel.indexOf(id);
      if (at < 0) sel.push(id);
      else sel.splice(at, 1);
    },
    foot: () =>
      gPkFoot(sel.length ? sel.map((id) => gLabel(slot, id)).join(', ') : `Aucune ${one}.`),
    done: () => {
      const next = sel.flatMap((id) => {
        const kept = b[slot].filter((p) => p.id === id);
        if (kept.length) return kept;
        const pool = gOption(slot, id)?.mainStats ?? [];
        return [{ id, mainStat: pool.length === 1 ? pool[0] : '' }];
      });
      // La même liste : rien ne bouge.
      if (JSON.stringify(next) !== JSON.stringify(b[slot])) {
        b[slot] = next;
        gTouched(b);
        gRedraw(b);
      }
      gPkClose();
    },
  });
}

/** Le picker de talismans, en multi-choix : la liste du build, dans l'ordre des clics. */
function gOpenTalismans(b) {
  // Un `$slug` que le fichier des presets ne connaît pas n'est pas une pièce.
  const sel = b.tal.pieces.filter((t) => t && !t.startsWith('$'));
  gPkOpen({
    multi: true,
    title: 'Choisir les talismans',
    search: 'Chercher un talisman…',
    none: 'Aucun talisman ne correspond.',
    grid: 'gear',
    opener: () => gCardEl(b)?.querySelector('[data-act="pick"][data-slot="talismans"]'),
    tally: () => `${gPlural(sel.length, 'choisi')} sur ${gear.options.talismans.length}`,
    items: () =>
      gear.options.talismans.map((o) => ({
        id: o.id,
        label: o.label,
        grade: o.grade,
        on: sel.includes(o.id),
        html: `${gPieceTile(o, 64)}${sel.includes(o.id) ? G_CHECK : ''}`,
        // Le type de points du talisman, comme sur sa carte de /equipment.
        tag: o.mode ? `<span class="badge off">${esc(o.mode)}</span>` : '',
      })),
    pick: (id) => {
      const at = sel.indexOf(id);
      if (at < 0) sel.push(id);
      else sel.splice(at, 1);
    },
    foot: () => gPkFoot(sel.length ? gTalText(sel) : 'Aucun talisman.', gTwin.talismans(sel)),
    done: () => {
      // La même liste : rien ne bouge, un slot sous preset y reste.
      if (sel.join('|') !== b.tal.pieces.join('|')) {
        b.tal = { preset: '', pieces: [...sel] };
        gTouched(b);
        gRedraw(b);
      }
      gPkClose();
    },
  });
}

/**
 * Le picker de sets : UN set principal et des secondaires, d'où les combos du
 * build (`composeSetCombos` — le principal seul en 4 pièces, sinon un combo
 * 2 + 2 par secondaire). Il s'ouvre sur le mix que le build porte déjà, s'il en
 * porte un, et REMPLACE ses combos — sur confirmation s'il en avait.
 */
function gOpenSets(b) {
  const st = { role: 'main', ...splitSetCombos(b.sets.map((c) => c.pieces)) };
  if (st.main) st.role = 'sub';
  const mix = () => composeSetCombos(st.main, st.secondaries);
  const hint = () =>
    st.role === 'main'
      ? 'Un clic pose le set principal.'
      : 'Un clic ajoute ou retire un secondaire ; sans secondaire, le principal est en 4 pièces.';
  gPkOpen({
    multi: true,
    title: 'Composer les sets',
    search: 'Chercher un set…',
    none: 'Aucun set ne correspond.',
    grid: 'gear',
    opener: () => gCardEl(b)?.querySelector('[data-act="pick"][data-slot="sets"]'),
    tally: () =>
      st.main
        ? `${gLabel('sets', st.main)} · ${
            st.secondaries.length ? gPlural(st.secondaries.length, 'secondaire') : '4 pièces'
          }`
        : 'pas de set principal',
    // Le rôle que prend le set cliqué. Pas de secondaire sans principal.
    filters: () =>
      `${gSeg('Rôle du set cliqué', 'role', st.role, [
        ['main', 'Principal'],
        ['sub', 'Secondaires', !st.main],
      ])}<span class="lbl">${hint()}</span>`,
    filter: (el) => {
      st.role = el.dataset.role;
      gSegPress(el);
      el.parentElement.nextElementSibling.textContent = hint();
    },
    items: () =>
      gear.options.sets.map((o) => {
        const main = o.id === st.main;
        const sub = st.secondaries.includes(o.id);
        // Sans bonus 2 pièces (Revenge, Patience), un set ne s'apparie pas en
        // 2 + 2 : grisé parmi les secondaires — sauf déjà posé, pour le retirer.
        const alone = st.role === 'sub' && !o.has2P && !main && !sub;
        return {
          id: o.id,
          label: o.label,
          grade: 'unique',
          title: alone
            ? 'pas de bonus 2 pièces'
            : [o.label, o.p2 && `2p : ${o.p2}`, o.p4 && `4p : ${o.p4}`]
                .filter(Boolean)
                .join('\n')
                .replaceAll('\\n', '\n'),
          on: main || sub,
          // Le principal ne peut pas être aussi secondaire.
          disabled: (main && st.role === 'sub') || alone,
          cls: main ? 'keep' : '',
          html: `${setGrid(gEnv(), o, 34)}${
            main
              ? '<span class="g-cnt">principal</span>'
              : sub
                ? '<span class="g-cnt sub">2p</span>'
                : ''
          }`,
        };
      }),
    pick: (id) => {
      if (st.role === 'main') {
        st.main = st.main === id ? '' : id;
        st.secondaries = st.secondaries.filter((x) => x !== id);
        if (st.main) st.role = 'sub';
      } else if (id !== st.main) {
        const at = st.secondaries.indexOf(id);
        if (at < 0) st.secondaries.push(id);
        else st.secondaries.splice(at, 1);
      }
    },
    // Les combos qui seront posés, chacun avec le preset qui le repliera.
    foot: () => {
      const { combos, error } = mix();
      return `<div class="g-recap">${
        error
          ? '<span>Choisir le set principal.</span>'
          : combos
              .map(
                (pieces) =>
                  `<span class="g-mix">${esc(gSetText(pieces))}${gPresetBadge(gTwin.sets(pieces))}</span>`,
              )
              .join('')
      }</div><button class="btn ghost" type="button" data-pk="cancel">Annuler</button><button class="btn primary" type="button" data-pk="ok" title="Entrée dans la recherche, ou Ctrl + Entrée"${error ? ' disabled' : ''}>${
        error ? 'Poser' : `Poser ${gPlural(combos.length, 'combo')}`
      }</button>`;
    },
    done: () => {
      const { combos, error } = mix();
      if (error) return;
      const old = b.sets;
      const same =
        combos.length === old.length &&
        combos.every((pieces, i) => gSetKey(pieces) === gSetKey(old[i].pieces));
      if (!same) {
        if (
          old.length &&
          !confirm(
            `Remplacer ${gPlural(old.length, 'combo')} du build${b.name ? ` « ${b.name} »` : ''} par ${gPlural(combos.length, 'combo')} ?`,
          )
        )
          return;
        // Un combo déjà là garde son entrée, et le `$slug` que le disque cite.
        b.sets = combos.map(
          (pieces) =>
            old.find((c) => gSetKey(c.pieces) === gSetKey(pieces)) ?? { preset: '', pieces },
        );
        gTouched(b);
        gRedraw(b);
      }
      gPkClose();
    },
  });
}

/** Le picker d'un slot d'un build ; `i` : la tuile d'arme ou d'amulette cliquée, -1 pour « ＋ ». */
function gPickSlot(b, slot, i) {
  if (slot === 'talismans') gOpenTalismans(b);
  else if (slot === 'sets') gOpenSets(b);
  else gOpenGear(b, slot, i);
}

$('g-pick').onclick = gOpenChar;

/**
 * Le roster, les presets et les listes ; à côté, l'élément et la rareté de
 * chaque perso. `open` : le perso à ouvrir d'emblée (`#gear/<id>`) ; `build` :
 * celui de ses builds à montrer, à partir de 1 (`#gear/<id>/build/<n>`) ;
 * `picker` : le picker à ouvrir sur lui (`…/picker/<slot>` — `char`, ou un slot
 * du build montré : `weapons`, `amulets`, `talismans`, `sets`).
 */
async function loadGear(open, build, picker) {
  const [s, ranks] = await Promise.all([
    fetch('/api/gear-reco/state').then((r) => r.json()),
    fetch('/api/ranks')
      .then((r) => r.json())
      .catch(() => null),
  ]);
  gear = s;
  gMeta = new Map((ranks?.rows ?? []).map((r) => [r.id, { element: r.element, rarity: r.rarity }]));
  if (!gMeta.size)
    log(['Gear reco : éléments et raretés illisibles (/api/ranks), le picker s’en passe.'], false);
  gWho();
  gBar();
  gPvLangs();
  $('g-pick').disabled = false;
  if (open && gear.roster.some((c) => c.id === open)) await gLoad(open, build ? build - 1 : 0);
  const b = gBuilds[gActive];
  if (picker === 'char') gOpenChar();
  else if (b && ['weapons', 'amulets', 'talismans', 'sets'].includes(picker))
    gPickSlot(b, picker, b[picker]?.length ? 0 : -1);
}

$('g-add').onclick = () => {
  const b = gNewBuild();
  gBuilds.push(b);
  gActive = gBuilds.length - 1;
  gRender();
  gCardEl(b).querySelector('[data-t="name"]').focus();
};

$('g-reset').onclick = () => gLoad(gChar.id, gActive);

$('g-save').onclick = async () => {
  if (!gChar || !gearChanges()) return;
  const bad = gBad();
  if (bad.length) return log(['Rien n’est envoyé tant qu’il reste des erreurs :', ...bad], false);
  // Une liste vide retire le perso du fichier, sans rien demander : un commit
  // local se défait, et le journal le dit (« gear-reco : … retiré du fichier »).

  $('g-save').disabled = $('g-reset').disabled = true;
  $('g-save').classList.add('busy');
  log([], undefined, 'envoi des builds au serveur');
  const sent = gBuilds.map((b) => b.k);
  try {
    const r = await post('/api/gear-reco', { id: gChar.id, builds: gBuilds.map(gToBuild) });
    // Écrit (même si le commit a échoué ensuite) : le disque fait foi, on le
    // relit. Refusé : rien n'a bougé, les builds restent en attente et les
    // erreurs du serveur se posent sur les leurs.
    if (r.written) await gLoad(gChar.id, gActive);
    else
      gServer = (r.issues ?? [])
        .filter((x) => x.build !== null && sent[x.build])
        .map((x) => ({ ...x, k: sent[x.build] }));
  } finally {
    $('g-save').classList.remove('busy');
    gRender();
  }
};

sections.register('gear', {
  init: () => {
    // `#gear/<id>` ouvre l'onglet sur ce perso (un lien, le banc de captures),
    // `#gear/<id>/build/<n>` sur son n-ième build, `…/picker/<slot>` y ouvre
    // en plus un picker (le banc ne clique pas). Une entrée seulement : la
    // page n'écrit pas le build montré dans l'adresse. `lib.js` ne connaît
    // que `#gear` : c'est le clic sur l'onglet qui l'ouvre.
    const [, open, build, picker] =
      /^#gear\/([^/]+)(?:\/build\/(\d+))?(?:\/picker\/([a-z]+))?$/.exec(location.hash) ?? [];
    if (open) document.querySelector('#tabs [data-tab="gear"]')?.click();
    // Les icônes sont sous `imgBase`, connu avec `/api/state` : reposées alors.
    stateLoaded.then(() => {
      gWho();
      if (gChar) gRender();
      else gBar();
    });
    return loadGear(open && decodeURIComponent(open), Number(build ?? 0), picker).catch((e) =>
      log([`Gear reco illisible : ${e}`], false),
    );
  },
  // Les builds en attente ne survivent pas à un rechargement de la page.
  dirty: gearChanges,
  canLeave: gearLeave,
});
