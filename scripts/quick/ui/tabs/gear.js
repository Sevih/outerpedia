// Onglet « Gear reco ».
import { $, esc, log, post, sections } from '../lib.js';

// Les builds d'UN perso, édités ici puis envoyés d'un bloc : la liste
// complète remplace celle du disque (contrat de `upsertGearReco`).
//
// Un slot à preset garde le `$slug` que le DISQUE cite et, à côté, ses
// pièces dépliées : tant qu'on ne le règle pas à la pièce il repart sous
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
let gBase = new Map(); // clé de build → ce qui partirait sans y toucher
let gOrder = []; // les clés dans l'ordre du disque
let gServer = []; // erreurs du dernier enregistrement, par clé de build
let gSeq = 0;

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
// les sets). Dit à l'écran, pour que le `$slug` du commit ne surprenne pas.
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
/** Les presets d'un slot en lignes de menu : le slug, puis ce qu'il contient. */
const gPresetList = (slot) =>
  Object.entries(gear.presets[slot]).map(([slug, v]) => ({
    id: slug,
    label: `$${slug} — ${slot === 'talismans' ? gTalText(v) : slot === 'sets' ? gSetText(v) : v}`,
  }));

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
const gIssueItems = (issues) => issues.map((x) => `<li>${esc(gIssueText(x))}</li>`).join('');
const gCardClass = (b, issues) =>
  `g-build${issues.length ? ' refused' : gStatus(b) ? ' dirty' : ''}`;

const gOpt = (value, label, cur) =>
  `<option value="${esc(value)}"${value === cur ? ' selected' : ''}>${esc(label)}</option>`;

/** Un menu. La valeur courante y reste même hors liste, pour ne pas la perdre. */
function gSelect({ attrs, cur, none, list, bad }) {
  const stray = cur && !list.some((o) => o.id === cur);
  return `<select ${attrs}${bad ? ' class="refused"' : ''}>${gOpt('', none, cur)}${
    stray ? gOpt(cur, `⚠ ${cur} (hors liste)`, cur) : ''
  }${list.map((o) => gOpt(o.id, o.label, cur)).join('')}</select>`;
}

/** Armes et amulettes du perso : celles de sa classe, plus la pièce déjà posée. */
function gGearList(slot, cur) {
  const fits = (o) => !o.classLimits?.length || o.classLimits.includes(gChar.class);
  const off = gear.options[slot].find((o) => o.id === cur && !fits(o));
  return [
    ...(off ? [{ id: off.id, label: `${off.label} (hors classe)` }] : []),
    ...gear.options[slot].filter(fits),
  ];
}

const gStatsOf = (p) =>
  p.mainStat
    .split('/')
    .map((x) => x.trim())
    .filter(Boolean);

/** Stats principales : celles du pool de CETTE pièce, plusieurs possibles. */
function gStats(slot, i, p) {
  const pool = gear.options[slot].find((o) => o.id === p.id)?.mainStats ?? [];
  const on = gStatsOf(p);
  const chip = (stat, cls, title) =>
    `<button class="g-stat ${cls}" data-act="stat" data-slot="${slot}" data-i="${i}" data-stat="${esc(stat)}"${
      title ? ` title="${title}"` : ''
    }>${esc(stat)}</button>`;
  return `<span class="g-stats">${pool
    .map((stat) => chip(stat, on.includes(stat) ? 'on' : ''))
    .join('')}${on
    .filter((stat) => !pool.includes(stat))
    .map((stat) => chip(stat, 'out', 'Hors du pool de cette pièce — cliquer pour la retirer.'))
    .join('')}</span>`;
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
  const rm = (act, data) =>
    `<button class="ghost" data-act="${act}" ${data} title="Retirer">✕</button>`;
  const at = gBuilds.indexOf(b);

  const picks = (slot, one) =>
    `<div class="${slotClass(slot)}"><h3>${G_SLOTS[slot]}</h3>${b[slot]
      .map(
        (p, i) =>
          `<div class="g-piece">${gSelect({
            attrs: `data-s="pick" data-slot="${slot}" data-i="${i}"`,
            cur: p.id,
            none: '— choisir —',
            list: gGearList(slot, p.id),
            bad: badAt(slot, i),
          })}${rm('rm', `data-slot="${slot}" data-i="${i}"`)}${gStats(slot, i, p)}</div>`,
      )
      .join('')}<button class="ghost" data-act="add" data-slot="${slot}">＋ ${one}</button></div>`;

  const talismans = `<div class="${slotClass('talismans')}"><h3>${G_SLOTS.talismans}</h3>
    <div class="g-piece">${gSelect({
      attrs: 'data-s="tal-preset"',
      cur: b.tal.preset,
      none: '— pièces une à une —',
      list: gPresetList('talismans'),
      bad: b.tal.preset && badSlot('talismans'),
    })}</div>${
      b.tal.preset
        ? `<p class="g-ro">${esc(gTalText(gear.presets.talismans[b.tal.preset] ?? []))}</p>`
        : `${b.tal.pieces
            .map(
              (t, i) =>
                `<div class="g-piece">${gSelect({
                  attrs: `data-s="tal" data-i="${i}"`,
                  cur: t,
                  none: '— choisir —',
                  list: gear.options.talismans,
                  bad: badAt('talismans', i),
                })}${rm('rm', `data-slot="talismans" data-i="${i}"`)}</div>`,
            )
            .join('')}<p class="g-ro">${gTwinText(gTwin.talismans(b.tal.pieces))}</p>
            <button class="ghost" data-act="add" data-slot="talismans">＋ talisman</button>`
    }</div>`;

  const sets = `<div class="${slotClass('sets')}"><h3>${G_SLOTS.sets}</h3>${b.sets
    .map(
      (c, ci) =>
        `<div class="g-combo"><div class="g-piece">${gSelect({
          attrs: `data-s="set-preset" data-c="${ci}"`,
          cur: c.preset,
          none: '— paires set + nombre —',
          list: gPresetList('sets'),
          bad: badAt('sets', ci) && (c.preset || !c.pieces.length),
        })}${rm('rm-combo', `data-c="${ci}"`)}</div>${
          c.preset
            ? `<p class="g-ro">${esc(gSetText(gear.presets.sets[c.preset] ?? []))}</p>`
            : `${c.pieces
                .map(
                  (p, pi) =>
                    `<div class="g-piece">${gSelect({
                      attrs: `data-s="set" data-c="${ci}" data-j="${pi}"`,
                      cur: p.set,
                      none: '— set —',
                      list: gear.options.sets,
                      bad: !p.set,
                    })}<select class="count" data-s="count" data-c="${ci}" data-j="${pi}">${[
                      ...new Set([2, 4, p.count]),
                    ]
                      .map((n) => gOpt(String(n), `${n}p`, String(p.count)))
                      .join('')}</select>${rm('rm-pair', `data-c="${ci}" data-j="${pi}"`)}</div>`,
                )
                .join('')}<p class="g-ro">${gTwinText(gTwin.sets(c.pieces))}</p>
                <button class="ghost" data-act="add-pair" data-c="${ci}">＋ paire</button>`
        }</div>`,
    )
    .join(
      '',
    )}<div class="g-combo"><button class="ghost" data-act="add-combo">＋ combo</button></div></div>`;

  const text = (t, lang) =>
    t === 'name' ? now.name : t === 'sub' ? (now.substats ?? '') : (now.note?.[lang] ?? '');
  const was = (t, lang) =>
    t === 'name' ? base.name : t === 'sub' ? (base.substats ?? '') : (base.note?.[lang] ?? '');
  const cls = (t, lang, bad) =>
    [base && text(t, lang) !== was(t, lang) && 'dirty', bad && 'refused'].filter(Boolean).join(' ');

  const substats = `<div class="${slotClass('substats', true)}"><h3>${G_SLOTS.substats}</h3>
    <div class="g-piece">${gSelect({
      attrs: 'data-s="sub-preset"',
      cur: b.sub.preset,
      none: '— texte libre —',
      list: gPresetList('substats'),
      bad: badSlot('substats'),
    })}<input data-t="sub" class="${cls('sub')}" value="${esc(b.sub.text)}" placeholder="ATK>CHC=CHD>SPD" /></div>
    <p class="g-ro" data-twin>${b.sub.preset ? '' : gTwinText(gTwin.substats(b.sub.text))}</p></div>`;

  // Le saut de ligne après `<textarea>` est mangé par le navigateur : sans
  // lui, c'est celui d'une note qui commence par une ligne vide qui le serait.
  const area = (lang) =>
    `<div><label>Note ${lang}</label><textarea data-t="note" data-lang="${lang}" class="${cls(
      'note',
      lang,
      lang === gear.langs.default && badSlot('note'),
    )}">\n${esc(b.note[lang] ?? '')}</textarea></div>`;
  const note = `<div class="${slotClass('note', true)}"><h3>${G_SLOTS.note}</h3>
    <div class="g-notes">${gear.langs.main.map(area).join('')}</div>
    <details${gear.langs.extra.some((l) => b.note[l]) ? ' open' : ''}>
      <summary>${gear.langs.extra.join(' / ')} — optionnelles, repli sur « ${gear.langs.default} »</summary>
      <div class="g-notes">${gear.langs.extra.map(area).join('')}</div>
    </details></div>`;

  return `<div class="${gCardClass(b, issues)}" data-k="${b.k}">
    <div class="g-head">
      <input data-t="name" class="${cls('name', undefined, badSlot('name'))}" value="${esc(b.name)}" placeholder="Nom du build (Speed, PvP…)" />
      <span class="badge" data-badge>${gStatus(b)}</span>
      <button class="ghost" data-act="up"${at ? '' : ' disabled'} title="Monter">↑</button>
      <button class="ghost" data-act="down"${at < gBuilds.length - 1 ? '' : ' disabled'} title="Descendre">↓</button>
      <button class="ghost" data-act="dup">Dupliquer</button>
      <button class="ghost" data-act="del">Supprimer</button>
    </div>
    <ul class="g-issues">${gIssueItems(issues)}</ul>
    <div class="g-grid">${picks('weapons', 'arme')}${picks('amulets', 'amulette')}${talismans}${sets}${substats}${note}</div>
  </div>`;
}

function gBar() {
  const n = gearChanges();
  const bad = gBuilds.reduce((sum, b) => sum + gIssues(b).length, 0);
  $('g-count').textContent = gChar
    ? `${gChar.name} · ${gPlural(gBuilds.length, 'build')} · ${
        n ? gPlural(n, 'changement') : 'aucune modification'
      }${bad ? ` · ${gPlural(bad, 'erreur')}` : ''}`
    : 'Aucun perso choisi.';
  $('g-add').disabled = !gChar;
  $('g-save').disabled = $('g-reset').disabled = !n;
}

const gCardEl = (b) => $('g-list').querySelector(`[data-k="${b.k}"]`);

/** Toute la liste : un build ajouté, retiré ou déplacé, ou un autre perso. */
function gRender() {
  const open = [...$('g-list').querySelectorAll('details[open]')].map(
    (d) => d.closest('[data-k]').dataset.k,
  );
  $('g-list').innerHTML = !gChar
    ? ''
    : gBuilds.map(gCard).join('') ||
      '<p class="hint" style="margin: 12px 0 0">Aucun build pour ce perso : « ＋ build » en ajoute un.</p>';
  for (const k of open) {
    const d = $('g-list').querySelector(`[data-k="${k}"] details`);
    if (d) d.open = true;
  }
  gBar();
}

/** UNE carte : un menu a changé, une pièce est ajoutée ou retirée. */
function gRedraw(b) {
  const open = gCardEl(b).querySelector('details').open;
  gCardEl(b).outerHTML = gCard(b);
  if (open) gCardEl(b).querySelector('details').open = true;
  gBar();
}

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
  card.querySelector('.g-issues').innerHTML = gIssueItems(issues);
  gBar();
};

$('g-list').onchange = (e) => {
  const el = e.target.closest('select[data-s]');
  const b = gOf(el);
  if (!b) return;
  gTouched(b);
  const { s, slot, i, c, j } = el.dataset;
  const v = el.value;
  const { presets } = gear;
  if (s === 'pick') b[slot][i].id = v;
  // Un preset choisi pose ses pièces ; « une à une » les garde pour départ.
  else if (s === 'tal-preset')
    b.tal = { preset: v, pieces: [...(presets.talismans[v] ?? b.tal.pieces)] };
  else if (s === 'tal') b.tal.pieces[i] = v;
  else if (s === 'set-preset')
    b.sets[c] = {
      preset: v,
      pieces: (presets.sets[v] ?? b.sets[c].pieces).map((p) => ({ ...p })),
    };
  else if (s === 'set') b.sets[c].pieces[j].set = v;
  else if (s === 'count') b.sets[c].pieces[j].count = Number(v);
  else if (s === 'sub-preset') b.sub = { preset: v, text: presets.substats[v] ?? b.sub.text };
  gRedraw(b);
};

$('g-list').onclick = (e) => {
  const el = e.target.closest('[data-act]');
  const b = gOf(el);
  if (!b) return;
  const { act, slot, c, j, stat } = el.dataset;
  const i = Number(el.dataset.i);
  const at = gBuilds.indexOf(b);

  if (act === 'up' || act === 'down') {
    const to = at + (act === 'up' ? -1 : 1);
    if (to < 0 || to >= gBuilds.length) return;
    [gBuilds[at], gBuilds[to]] = [gBuilds[to], gBuilds[at]];
    return gRender();
  }
  if (act === 'del') {
    gBuilds.splice(at, 1);
    gTouched(b);
    return gRender();
  }
  if (act === 'dup') {
    const copy = structuredClone(b);
    copy.k = `g${++gSeq}`;
    if (copy.name) copy.name += ' (copie)';
    gBuilds.splice(at + 1, 0, copy);
    return gRender();
  }

  gTouched(b);
  if (act === 'add') {
    if (slot === 'talismans') b.tal.pieces.push('');
    else b[slot].push({ id: '', mainStat: '' });
  } else if (act === 'rm') (slot === 'talismans' ? b.tal.pieces : b[slot]).splice(i, 1);
  else if (act === 'stat') {
    const on = gStatsOf(b[slot][i]);
    b[slot][i].mainStat = (on.includes(stat) ? on.filter((x) => x !== stat) : [...on, stat]).join(
      '/',
    );
  } else if (act === 'add-combo') b.sets.push({ preset: '', pieces: [] });
  else if (act === 'rm-combo') b.sets.splice(c, 1);
  else if (act === 'add-pair') b.sets[c].pieces.push({ set: '', count: 2 });
  else if (act === 'rm-pair') b.sets[c].pieces.splice(j, 1);
  gRedraw(b);
};

/** Les builds d'un perso, relus du disque : c'est lui qui fait foi. */
async function gLoad(id) {
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
  $('g-q').value = gChar.name;
  gRender();
}

// Sélecteur de perso : la liste filtrée par le nom, les persos qui ont des
// recos marqués de leur nombre de builds.
function gResults() {
  const raw = $('g-q').value.trim().toLowerCase();
  // Le nom du perso en cours n'est pas une recherche : toute la liste.
  const q = raw === gChar?.name.toLowerCase() ? '' : raw;
  const rows = gear.roster.filter(
    (c) => (!q || c.name.toLowerCase().includes(q)) && (!$('g-has').checked || c.builds),
  );
  $('g-results').innerHTML = rows
    .map(
      (c) =>
        `<div data-id="${esc(c.id)}">${esc(c.name)}${
          c.builds ? `<span class="badge">${gPlural(c.builds, 'build')}</span>` : ''
        }</div>`,
    )
    .join('');
  $('g-results').hidden = !rows.length;
}

async function gChoose(id) {
  $('g-results').hidden = true;
  if (id === gChar?.id) return void ($('g-q').value = gChar.name);
  const n = gearChanges();
  if (
    n &&
    !confirm(
      `Abandonner ${gPlural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${gChar.name} ?`,
    )
  )
    return void ($('g-q').value = gChar.name);
  await gLoad(id);
}

$('g-q').oninput = gResults;
$('g-q').onfocus = () => {
  $('g-q').select();
  gResults();
};
$('g-has').onchange = gResults;
$('g-q').onkeydown = (e) => {
  if (e.key === 'Escape') $('g-results').hidden = true;
  // Entrée : le premier de la liste.
  const first = $('g-results').firstElementChild;
  if (e.key === 'Enter' && !$('g-results').hidden && first) gChoose(first.dataset.id);
};
$('g-results').onclick = (e) => {
  const d = e.target.closest('[data-id]');
  if (d) gChoose(d.dataset.id);
};
// Un clic ailleurs referme la liste et rend au champ le nom du perso en cours.
document.addEventListener('click', (e) => {
  if (e.target.closest('#tab-gear .row') || $('g-results').hidden) return;
  $('g-results').hidden = true;
  if (gChar) $('g-q').value = gChar.name;
});

async function loadGear() {
  gear = await (await fetch('/api/gear-reco/state')).json();
  gBar();
}

$('g-add').onclick = () => {
  const b = gNewBuild();
  gBuilds.push(b);
  gRender();
  gCardEl(b).querySelector('[data-t="name"]').focus();
};

$('g-reset').onclick = () => gLoad(gChar.id);

$('g-save').onclick = async () => {
  if (!gChar || !gearChanges()) return;
  const bad = gBuilds.flatMap((b, i) =>
    gIssues(b).map((x) => `build ${i + 1}${b.name ? ` « ${b.name} »` : ''} · ${gIssueText(x)}`),
  );
  if (bad.length) return log(['Rien n’est envoyé tant qu’il reste des erreurs :', ...bad], false);
  // Une liste vide retire le perso du fichier : jamais sans le dire.
  if (
    !gBuilds.length &&
    !confirm(
      `Supprimer TOUTES les recos de ${gChar.name} ? Sa clé est retirée de gear-reco.json, committé et poussé.`,
    )
  )
    return;

  $('g-save').disabled = $('g-reset').disabled = true;
  log([], undefined, 'envoi des builds au serveur');
  const sent = gBuilds.map((b) => b.k);
  try {
    const r = await post('/api/gear-reco', { id: gChar.id, builds: gBuilds.map(gToBuild) });
    // Écrit (même si le push a échoué ensuite) : le disque fait foi, on le
    // relit. Refusé : rien n'a bougé, les builds restent en attente et les
    // erreurs du serveur se posent sur les leurs.
    if (r.written) await gLoad(gChar.id);
    else
      gServer = (r.issues ?? [])
        .filter((x) => x.build !== null && sent[x.build])
        .map((x) => ({ ...x, k: sent[x.build] }));
  } finally {
    gRender();
  }
};

sections.register('gear', {
  init: () => loadGear().catch((e) => log([`Gear reco illisible : ${e}`], false)),
  // Les builds en attente ne survivent pas à un rechargement de la page.
  dirty: gearChanges,
  canLeave: gearLeave,
});
