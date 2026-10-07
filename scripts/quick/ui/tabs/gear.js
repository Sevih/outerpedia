// Onglet « Gear reco ».
import { $, esc, log, post, sections, state, stateLoaded } from '../lib.js';

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
// Élément et rareté par perso : le roster des recos ne les porte pas, celui
// de « Rangs » (`/api/ranks`) si. Sans lui, le picker se passe d'élément.
let gMeta = new Map();
// Les filtres du picker : ils survivent à sa fermeture, pas la recherche.
const gPick = { elements: new Set(), classes: new Set(), has: '' };
// L'ordre des pastilles, celui du site (`ELEMENT_ORDER`, `CLASS_ORDER`).
const G_ELEMENTS = ['fire', 'water', 'earth', 'light', 'dark'];
const G_CLASSES = ['defender', 'striker', 'ranger', 'mage', 'healer'];

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
/** Où se pose une erreur dans la carte : sa pièce, sinon son slot, sinon l'en-tête. */
function gPlace(b, x) {
  if (!Object.hasOwn(G_SLOTS, x.slot)) return '*';
  const rows = {
    weapons: b.weapons.length,
    amulets: b.amulets.length,
    talismans: b.tal.preset ? 0 : b.tal.pieces.length,
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

/**
 * Stat principale : celles du pool de CETTE pièce. Plusieurs possibles
 * (« PEN%/CHD ») : le menu en pose une, ou en ajoute et en retire une de
 * celles posées. Une stat hors pool reste dans le menu, marquée.
 */
function gStats(slot, i, p) {
  const pool = gear.options[slot].find((o) => o.id === p.id)?.mainStats ?? [];
  const on = gStatsOf(p);
  const out = on.filter((stat) => !pool.includes(stat));
  const cur = on.join('/');
  const group = (label, list) =>
    list.length ? `<optgroup label="${label}">${list.join('')}</optgroup>` : '';
  return `<select data-s="stat" data-slot="${slot}" data-i="${i}" aria-label="Stat principale"${
    out.length ? ` class="out" title="Hors du pool de cette pièce : ${esc(out.join(', '))}."` : ''
  }>${gOpt('', '— stat —', cur)}${
    cur && (on.length > 1 || out.length) ? gOpt(cur, `${out.length ? '⚠ ' : ''}${cur}`, cur) : ''
  }${pool.map((stat) => gOpt(stat, stat, cur)).join('')}${
    on.length
      ? group(
          'Ajouter',
          pool
            .filter((stat) => !on.includes(stat))
            .map((stat) => gOpt(`add:${stat}`, `＋ ${stat}`)),
        )
      : ''
  }${
    on.length > 1
      ? group(
          'Retirer',
          on.map((stat) => gOpt(`rm:${stat}`, `− ${stat}`)),
        )
      : ''
  }</select>`;
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
  // Un slot sous preset : son `$slug`, et le bouton qui le rend aux pièces.
  const slug = (preset) => `<span class="badge preset">$${esc(preset)}</span>`;
  const free = (data) =>
    `<button class="btn ghost sm g-push" data-act="free" ${data}>régler à la pièce</button>`;
  const dim = (label, cls = '') => `<span class="g-dim${cls}">${esc(label)}</span>`;
  const at = gBuilds.indexOf(b);

  const picks = (slot, one) =>
    `<div class="${slotClass(slot)}"><h3>${G_SLOTS[slot]}${iss(slot)}</h3>${b[slot]
      .map(
        (p, i) =>
          `<div class="g-piece">${gSelect({
            attrs: `data-s="pick" data-slot="${slot}" data-i="${i}" aria-label="${one} ${i + 1}"`,
            cur: p.id,
            none: '— choisir —',
            list: gGearList(slot, p.id),
            bad: badAt(slot, i),
          })}${gStats(slot, i, p)}${rm('rm', `data-slot="${slot}" data-i="${i}"`, `l’${one} ${i + 1}`)}</div>${iss(`${slot}:${i}`, 'div')}`,
      )
      .join(
        '',
      )}<div class="g-foot"><button class="btn ghost sm" data-act="add" data-slot="${slot}">＋ ${one}</button></div></div>`;

  const talPreset = gSelect({
    attrs: 'data-s="tal-preset" aria-label="Preset de talismans"',
    cur: b.tal.preset,
    none: '— pièces une à une —',
    list: gPresetList('talismans'),
    bad: b.tal.preset && badSlot('talismans'),
  });
  const talismans = `<div class="${slotClass('talismans')}"><h3>${G_SLOTS.talismans}${
    b.tal.preset ? slug(b.tal.preset) : ''
  }${iss('talismans')}${b.tal.preset ? free('data-slot="talismans"') : ''}</h3>${
    b.tal.preset
      ? `${(gear.presets.talismans[b.tal.preset] ?? [])
          .map((t) => `<div class="g-piece">${dim(gLabel('talismans', t))}</div>`)
          .join('')}<div class="g-foot">${talPreset}</div>`
      : `${b.tal.pieces
          .map(
            (t, i) =>
              `<div class="g-piece">${gSelect({
                attrs: `data-s="tal" data-i="${i}" aria-label="talisman ${i + 1}"`,
                cur: t,
                none: '— choisir —',
                list: gear.options.talismans,
                bad: badAt('talismans', i),
              })}${rm('rm', `data-slot="talismans" data-i="${i}"`, `le talisman ${i + 1}`)}</div>${iss(`talismans:${i}`, 'div')}`,
          )
          .join('')}<p class="g-ro">${gTwinText(gTwin.talismans(b.tal.pieces))}</p>
          <div class="g-foot"><button class="btn ghost sm" data-act="add" data-slot="talismans">＋ talisman</button>${talPreset}</div>`
  }</div>`;

  const sets = `<div class="${slotClass('sets')}"><h3>${G_SLOTS.sets}</h3>${b.sets
    .map((c, ci) => {
      const preset = gSelect({
        attrs: `data-s="set-preset" data-c="${ci}" aria-label="Preset du combo ${ci + 1}"`,
        cur: c.preset,
        none: '— paires set + nombre —',
        list: gPresetList('sets'),
        bad: badAt('sets', ci) && (c.preset || !c.pieces.length),
      });
      return `<div class="g-combo"><div class="g-combo-head"><span class="lbl">Combo ${ci + 1}</span>${
        c.preset ? slug(c.preset) : ''
      }${iss(`sets:${ci}`)}<span class="g-push"></span>${
        c.preset
          ? `<button class="btn ghost sm" data-act="free" data-slot="sets" data-c="${ci}">régler à la pièce</button>`
          : ''
      }${rm('rm-combo', `data-c="${ci}"`, `le combo ${ci + 1}`)}</div>${
        c.preset
          ? `${(gear.presets.sets[c.preset] ?? [])
              .map(
                (p) =>
                  `<div class="g-piece">${dim(gLabel('sets', p.set))}${dim(`${p.count}p`, ' count')}</div>`,
              )
              .join('')}<div class="g-foot">${preset}</div>`
          : `${c.pieces
              .map(
                (p, pi) =>
                  `<div class="g-piece">${gSelect({
                    attrs: `data-s="set" data-c="${ci}" data-j="${pi}" aria-label="set ${pi + 1}"`,
                    cur: p.set,
                    none: '— set —',
                    list: gear.options.sets,
                    bad: !p.set,
                  })}<select class="count" data-s="count" data-c="${ci}" data-j="${pi}" aria-label="Nombre de pièces">${[
                    ...new Set([2, 4, p.count]),
                  ]
                    .map((n) => gOpt(String(n), `${n}p`, String(p.count)))
                    .join(
                      '',
                    )}</select>${rm('rm-pair', `data-c="${ci}" data-j="${pi}"`, `la paire ${pi + 1}`)}</div>`,
              )
              .join('')}<p class="g-ro">${gTwinText(gTwin.sets(c.pieces))}</p>
              <div class="g-foot"><button class="btn ghost sm" data-act="add-pair" data-c="${ci}">＋ paire</button>${preset}</div>`
      }</div>`;
    })
    .join(
      '',
    )}<div class="g-foot"><button class="btn ghost sm" data-act="add-combo">＋ combo</button>${iss('sets')}</div></div>`;

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
      list: gPresetList('substats'),
      bad: badSlot('substats'),
    })}<input data-t="sub" class="${[cls('sub'), b.sub.preset && 'g-dim'].filter(Boolean).join(' ')}" value="${esc(b.sub.text)}" placeholder="ATK>CHC=CHD>SPD" aria-label="Ordre des substats" /></div>
    <p class="g-ro" data-twin>${b.sub.preset ? '' : gTwinText(gTwin.substats(b.sub.text))}</p></div>`;

  // Le saut de ligne après `<textarea>` est mangé par le navigateur : sans
  // lui, c'est celui d'une note qui commence par une ligne vide qui le serait.
  const area = (lang) =>
    `<div class="field"><label for="${b.k}-${lang}">${lang}</label><textarea id="${b.k}-${lang}" data-t="note" data-lang="${lang}" class="${cls(
      'note',
      lang,
      lang === gear.langs.default && badSlot('note'),
    )}">\n${esc(b.note[lang] ?? '')}</textarea></div>`;
  const note = `<div class="${slotClass('note', true)}"><h3>${G_SLOTS.note}<span class="badge off">${gear.langs.main.join(' · ')}</span>${iss('note')}</h3>
    <div class="g-notes">${gear.langs.main.map(area).join('')}</div>
    <details${gear.langs.extra.some((l) => b.note[l]) ? ' open' : ''}>
      <summary><span class="btn ghost sm">＋ autres langues</span><span class="lbl">${gear.langs.extra.join(' / ')} — optionnelles, repli sur « ${gear.langs.default} »</span></summary>
      <div class="g-notes">${gear.langs.extra.map(area).join('')}</div>
    </details></div>`;

  return `<div class="${gCardClass(b, issues)}" data-k="${b.k}">
    <div class="card-head">
      <span class="lbl">Build</span>
      <input data-t="name" class="g-name ${cls('name', undefined, badSlot('name'))}" value="${esc(b.name)}" placeholder="Nom du build (Speed, PvP…)" aria-label="Nom du build" />
      <span class="badge off">${at + 1} / ${gBuilds.length}</span>
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
  </div>`;
}

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

const gCardEl = (b) => $('g-list').querySelector(`[data-k="${b.k}"]`);

/** Toute la liste : un build ajouté, retiré ou déplacé, ou un autre perso. */
function gRender() {
  const open = [...$('g-list').querySelectorAll('details[open]')].map(
    (d) => d.closest('[data-k]').dataset.k,
  );
  $('g-list').innerHTML = !gChar
    ? ''
    : gBuilds.map(gCard).join('') ||
      '<div class="empty">Aucun build pour ce perso : « ＋ build » en ajoute un.</div>';
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
  else if (s === 'stat') {
    // « ＋ » ajoute une stat à celles posées, « − » en retire une ; une stat
    // seule les remplace.
    const on = gStatsOf(b[slot][i]);
    const [op, stat] = v.includes(':') ? v.split(':') : ['', v];
    b[slot][i].mainStat = (
      op === 'add' ? [...on, stat] : op === 'rm' ? on.filter((x) => x !== stat) : [stat]
    )
      .filter(Boolean)
      .join('/');
  }
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
  const { act, slot, c, j } = el.dataset;
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
  // « régler à la pièce » : le slot quitte son preset et garde ses pièces pour
  // départ, comme le premier choix de son menu.
  else if (act === 'free') {
    if (slot === 'talismans') b.tal = { preset: '', pieces: [...b.tal.pieces] };
    else if (slot === 'sets')
      b.sets[c] = { preset: '', pieces: b.sets[c].pieces.map((p) => ({ ...p })) };
    else b.sub = { preset: '', text: b.sub.text };
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
  gWho();
  gRender();
}

// Le picker de perso : une modale. La grille suit la recherche, les pastilles
// d'élément et de classe (aucune = toutes) et le filtre des recos ; chaque
// vignette porte son nombre de builds, le perso en cours son anneau.
function gResults() {
  const q = $('g-q').value.trim().toLowerCase();
  const rows = gear.roster.filter(
    (c) =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (!gPick.elements.size || gPick.elements.has(gMeta.get(c.id)?.element)) &&
      (!gPick.classes.size || gPick.classes.has(c.class)) &&
      (gPick.has === 'with' ? c.builds > 0 : gPick.has === 'without' ? !c.builds : true),
  );
  const done = gear.roster.filter((c) => c.builds).length;
  $('g-tally').textContent =
    `${gPlural(gear.roster.length, 'perso')} · ${done} avec recos · ${gear.roster.length - done} sans`;
  $('g-results').innerHTML = rows
    .map((c) => {
      const element = gMeta.get(c.id)?.element;
      return `<button class="g-tile" type="button" data-id="${esc(c.id)}" title="${esc(c.name)} — ${
        c.builds ? gPlural(c.builds, 'build') : 'sans reco'
      }"><span class="g-ring${c.id === gChar?.id ? ' on' : ''}"><img class="g-fi" src="${gSrc(
        `characters/faceicon/FI_${esc(c.id)}`,
      )}" alt="" aria-hidden="true" width="64" height="64" loading="lazy" />${
        element ? gIcon('element', element, 'g-el') : ''
      }<span class="g-cnt${c.builds ? '' : ' zero'}">${c.builds}</span></span><span class="g-n">${esc(c.name)}</span></button>`;
    })
    .join('');
  $('g-none').hidden = rows.length > 0;
}

/** Les pastilles à bascule du picker, d'après ce que le roster porte. */
function gFilters() {
  const tog = (kind, slug, on) =>
    `<button class="g-tog" type="button" data-${kind}="${slug}" aria-pressed="${on}" title="${gCap(slug)}" aria-label="${gCap(slug)}">${gIcon(kind, slug)}</button>`;
  const elements = new Set([...gMeta.values()].map((m) => m.element));
  const classes = new Set(gear.roster.map((c) => c.class));
  $('g-elements').innerHTML = G_ELEMENTS.filter((e) => elements.has(e))
    .map((e) => tog('element', e, gPick.elements.has(e)))
    .join('');
  $('g-classes').innerHTML = G_CLASSES.filter((c) => classes.has(c))
    .map((c) => tog('class', c, gPick.classes.has(c)))
    .join('');
}

function gOpen() {
  $('g-q').value = '';
  $('g-modal').hidden = false;
  gResults();
  $('g-q').focus();
}

function gClose() {
  if ($('g-modal').hidden) return;
  $('g-modal').hidden = true;
  $('g-pick').focus();
}

async function gChoose(id) {
  if (id === gChar?.id) return gClose();
  const n = gearChanges();
  if (
    n &&
    !confirm(
      `Abandonner ${gPlural(n, 'changement')} non enregistré${n > 1 ? 's' : ''} sur ${gChar.name} ?`,
    )
  )
    return;
  gClose();
  await gLoad(id);
}

$('g-pick').onclick = gOpen;
$('g-close').onclick = gClose;
$('g-q').oninput = gResults;
$('g-modal').onclick = (e) => {
  // Un clic sur le voile, hors du panneau, ferme.
  if (e.target === $('g-modal')) return gClose();
  const tile = e.target.closest('[data-id]');
  if (tile) return gChoose(tile.dataset.id);
  const tog = e.target.closest('.g-tog');
  const has = e.target.closest('[data-has]');
  if (tog) {
    const [set, slug] = tog.dataset.element
      ? [gPick.elements, tog.dataset.element]
      : [gPick.classes, tog.dataset.class];
    if (!set.delete(slug)) set.add(slug);
    tog.setAttribute('aria-pressed', String(set.has(slug)));
  } else if (has) {
    gPick.has = has.dataset.has;
    for (const b of $('g-has').children)
      b.setAttribute('aria-pressed', String(b.dataset.has === gPick.has));
  } else return;
  gResults();
};
$('g-modal').onkeydown = (e) => {
  // Entrée dans la recherche : le premier de la grille.
  const first = $('g-results').firstElementChild;
  if (e.key === 'Enter' && e.target === $('g-q') && first) gChoose(first.dataset.id);
  // Tab reste dans le panneau.
  if (e.key !== 'Tab') return;
  const stops = [...$('g-modal').querySelectorAll('button, input')];
  const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
  if (document.activeElement !== edge) return;
  e.preventDefault();
  (e.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') gClose();
});

/**
 * Le roster, les presets et les listes ; à côté, l'élément et la rareté de
 * chaque perso. `open` : le perso à ouvrir d'emblée (`#gear/<id>`).
 */
async function loadGear(open) {
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
  gFilters();
  gWho();
  gBar();
  $('g-pick').disabled = false;
  if (open && gear.roster.some((c) => c.id === open)) await gLoad(open);
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
  const bad = gBad();
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
  $('g-save').classList.add('busy');
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
    $('g-save').classList.remove('busy');
    gRender();
  }
};

sections.register('gear', {
  init: () => {
    // `#gear/<id>` ouvre l'onglet sur ce perso (un lien, le banc de captures).
    // `lib.js` ne connaît que `#gear` : c'est le clic sur l'onglet qui l'ouvre.
    const open = /^#gear\/(.+)$/.exec(location.hash)?.[1];
    if (open) document.querySelector('#tabs [data-tab="gear"]')?.click();
    // Les icônes sont sous `imgBase`, connu avec `/api/state` : reposées alors.
    stateLoaded.then(() => {
      gFilters();
      gWho();
      gBar();
    });
    return loadGear(open && decodeURIComponent(open)).catch((e) =>
      log([`Gear reco illisible : ${e}`], false),
    );
  },
  // Les builds en attente ne survivent pas à un rechargement de la page.
  dirty: gearChanges,
  canLeave: gearLeave,
});
