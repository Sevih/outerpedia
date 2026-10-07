// Onglet « Discord ».
import { $, esc, log, post, sections } from '../lib.js';

// Brouillon, serveur, salon, cases, mode et messages postés survivent au
// rechargement. Tout passe par `mem` : un stockage refusé (navigation
// privée) ne doit pas casser l'onglet. `null` efface.
const mem = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`quick.discord.${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      if (value === null) localStorage.removeItem(`quick.discord.${key}`);
      else localStorage.setItem(`quick.discord.${key}`, JSON.stringify(value));
    } catch {}
  },
};

let dState = {
  hasToken: false,
  hint: null,
  guilds: null,
  defaultGuild: null,
  invite: null,
  notes: [],
  standard: [],
  palette: { groups: [], error: null },
  history: { count: 0, paired: 0, last: null, importedAt: null, items: [] },
  requestExamples: { default: 3, max: 6 },
};
// Le serveur où l'on poste : le dernier choisi (au premier lancement,
// celui de DISCORD_GUILD_ID), et ses salons.
let dGuild = String(mem.get('guild', '') ?? '');
let dChannels = [];
let dChannelsError = null;
// Les serveurs dont on prend les emojis. `null` : rien n'a encore été
// coché à la main — le choix SUIT alors le serveur où l'on poste.
const savedEmojiGuilds = mem.get('emojiGuilds', null);
let dEmojiGuilds = Array.isArray(savedEmojiGuilds) ? savedEmojiGuilds.map(String) : null;
// Emojis lus cette session, par serveur : { emojis } ou { emojis: [], error }.
const gEmojis = new Map();
let dMode = mem.get('mode', 'simple') === 'embed' ? 'embed' : 'simple';
// Dernier aperçu rendu par le serveur ; `null` pendant qu'un autre arrive —
// on n'envoie pas sur la foi d'un découpage qui n'est plus celui du texte.
let dPreview = null;
// Gabarit portant le lien de la note choisie : { simple, embed: { text, buttons } }.
let dTemplate = null;
// Après un envoi COMPLET : { guildId, guildName, channelId, channelName,
// ids, urls, mode } — ce que « Mettre à jour » modifie en place, LÀ où
// c'est parti et dans le mode où c'est parti.
let posted = mem.get('posted', null);
// Après un envoi INTERROMPU : la même chose avec `total` — le prochain
// clic reprend au message fautif, dans le même salon et le même mode.
let partial = mem.get('partial', null);
let dBusy = false;

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const sendJson = async (path, payload) =>
  (
    await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  ).json();

const guildName = (id) => dState.guilds?.find((g) => g.id === id)?.name ?? 'un serveur inconnu';
/** Les serveurs cochés que le bot connaît, dans l'ordre de la liste. */
const checkedGuilds = () => {
  const ids = dEmojiGuilds ?? (dGuild ? [dGuild] : []);
  return (dState.guilds ?? []).filter((g) => ids.includes(g.id)).map((g) => g.id);
};
const channelOf = (id) => dChannels.find((c) => c.id === id);
/** Le serveur et le salon choisis, avec leurs noms (gardés avec les ids postés). */
const here = () => {
  const c = channelOf($('d-channel').value);
  return {
    guildId: dGuild,
    guildName: guildName(dGuild),
    channelId: c?.id ?? '',
    channelName: c?.name ?? '',
  };
};
const whereLabel = (w) =>
  `#${w.channelName || channelOf(w.channelId)?.name || 'salon inconnu'} (${w.guildName || guildName(w.guildId)})`;
const MODE_NAME = { simple: 'message simple', embed: 'embed' };

// -- formulaire d'embed --
const E_FIELDS = {
  title: 'e-title',
  url: 'e-url',
  color: 'e-color',
  thumbnail: 'e-thumb',
  image: 'e-image',
  footer: 'e-footer',
  content: 'e-content',
};
const BUTTON_MAX = 5;
// Couleur par défaut de la barre : le jeton `--accent` du site.
const EMBED_COLOR = '#38bdf8';
$('e-buttons').innerHTML = Array.from(
  { length: BUTTON_MAX },
  (_, i) =>
    `<div class="d-btn-row"><input type="text" autocomplete="off" placeholder="Libellé du bouton ${i + 1}" /><input type="url" autocomplete="off" placeholder="https://" /></div>`,
).join('');
const buttonRows = () => [...$('e-buttons').children];

function readEmbed() {
  const form = {};
  for (const [key, id] of Object.entries(E_FIELDS)) form[key] = $(id).value;
  form.buttons = buttonRows().map((r) => ({
    label: r.children[0].value,
    url: r.children[1].value,
  }));
  return form;
}
/** Une rangée de bouton ne se montre que si la précédente est entamée. */
function showButtonRows() {
  let open = true;
  for (const r of buttonRows()) {
    r.hidden = !open;
    open = open && Boolean(r.children[0].value.trim() || r.children[1].value.trim());
  }
}
function writeButtons(buttons) {
  buttonRows().forEach((r, i) => {
    r.children[0].value = buttons[i]?.label ?? '';
    r.children[1].value = buttons[i]?.url ?? '';
  });
  showButtonRows();
}
function writeEmbed(form) {
  for (const [key, id] of Object.entries(E_FIELDS))
    $(id).value = typeof form?.[key] === 'string' ? form[key] : '';
  // Un sélecteur de couleur vidé retombe sur le noir, pas sur « rien » :
  // la couleur par défaut se pose donc ici, pas après coup.
  $('e-color').value = /^#[0-9a-f]{6}$/i.test(form?.color ?? '') ? form.color : EMBED_COLOR;
  writeButtons(Array.isArray(form?.buttons) ? form.buttons : []);
}

/** Ce que la page joint à CHAQUE demande : le serveur local ne retient rien. */
const draft = () => ({
  text: $('d-text').value,
  mode: dMode,
  embed: readEmbed(),
  guildId: dGuild,
  emojiGuilds: checkedGuilds(),
});

/** Sous la liste des serveurs : ce qu'il faut pour qu'un emoji externe s'affiche. */
function renderExternal() {
  const c = channelOf($('d-channel').value);
  $('d-external').innerHTML = checkedGuilds().some((id) => id !== dGuild)
    ? 'Emoji d’un autre serveur que celui où l’on poste : il ne s’affiche que si le bot a « Utiliser des emojis externes » dans le salon — sinon Discord l’écrit en toutes lettres, sans erreur.' +
      (c?.externalEmojis === false
        ? ` <span class="ko">Le bot ne l’a PAS dans #${esc(c.name)}.</span>`
        : c?.externalEmojis === true
          ? ` Il l’a dans #${esc(c.name)}.`
          : '')
    : '';
}

function refreshDiscord() {
  const p = dPreview;
  const embed = dMode === 'embed';
  // Envoi interrompu : serveur, salon et mode restent ceux de la reprise.
  const locked = Boolean(partial);
  $('d-guild').disabled = $('d-channel').disabled = locked;
  if (partial) $('d-channel').value = partial.channelId;
  for (const r of document.getElementsByName('d-mode')) {
    r.checked = r.value === dMode;
    r.disabled = locked;
  }
  const channel = $('d-channel').value;
  $('d-embed').hidden = !embed;
  // En mode embed le drapeau n'est JAMAIS posé : il masquerait l'embed.
  $('d-noembed').disabled = embed;
  $('d-noembed-why').textContent = embed
    ? ' — inactif en mode embed : il masquerait l’embed lui-même'
    : '';
  renderExternal();

  $('d-count').textContent = !p
    ? '…'
    : embed
      ? `description : ${p.length}${p.messages > 1 ? ` caractères · ${p.messages} messages (${p.limit} au plus par embed)` : ` / ${p.limit} caractères`} · textes de l’embed${p.messages > 1 ? ' le plus chargé' : ''} : ${p.total} / 6000`
      : p.messages > 1
        ? `${p.length} caractères · ${p.messages} messages (2000 au plus chacun)`
        : `${p.length} / 2000 caractères`;

  // Un message posté se met à jour LÀ où il est parti, et dans son mode.
  const away = posted && (posted.guildId !== dGuild || posted.channelId !== channel);
  const otherMode = posted && posted.mode !== dMode;

  // Ce qui retient l'envoi, dans l'ordre où il faut s'en occuper.
  const hasText = Boolean($('d-text').value.trim());
  const silent = !hasText && p?.blocker === 'Message vide.';
  const why = dState.hint
    ? ['warn', dState.hint]
    : p?.blocker && !silent
      ? ['ko', p.blocker]
      : posted || partial
        ? null
        : !dGuild
          ? ['warn', 'Choisir un serveur.']
          : !channel
            ? ['warn', dChannelsError ?? 'Choisir un salon.']
            : null;
  // Signalé, pas bloquant : la permission se lit, elle ne se garantit pas.
  const c = channelOf(channel);
  const foreign =
    p?.external?.length && c?.externalEmojis === false
      ? `<span class="warn">${esc(p.external.map((n) => `:${n}:`).join(', '))} : pris sur un autre serveur, et le bot n’a pas « Utiliser des emojis externes » dans #${esc(c.name)} — Discord l’écrirait en toutes lettres.</span> `
      : '';
  const links = (urls) =>
    urls.map((u, i) => `<a href="${esc(u)}" target="_blank">message ${i + 1}</a>`).join(', ');
  // Signalé, pas bloquant non plus : un horodatage là où Discord ne le rend pas.
  const warned = (p?.warnings ?? []).map((w) => `<span class="warn">${esc(w)}</span> `).join('');
  $('d-status').innerHTML =
    (why ? `<span class="${why[0]}">${esc(why[1])}</span> ` : '') +
    foreign +
    warned +
    (posted
      ? `Posté dans ${esc(whereLabel(posted))} : ${links(posted.urls)}. ` +
        (away
          ? '<span class="warn">Pour le mettre à jour, reviens à ce serveur et à ce salon</span> ; « Nouveau message » pour en poster un autre.'
          : otherMode
            ? `<span class="warn">Il est parti en « ${MODE_NAME[posted.mode]} » et ne change pas de mode : repasse-y pour le mettre à jour</span> ; « Nouveau message » pour en poster un autre.`
            : '« Mettre à jour » le modifie en place ; « Nouveau message » pour en poster un autre.')
      : partial
        ? `Envoi interrompu dans ${esc(whereLabel(partial))} : ${plural(partial.ids.length, 'message')} sur ${partial.total} en place. « Reprendre » poste la suite sans les renvoyer.`
        : '');

  const blocked = dBusy || !dState.hasToken || !p || Boolean(p.blocker);
  $('d-send').disabled = blocked || !dGuild || !channel || Boolean(posted);
  $('d-send').textContent = partial
    ? `Reprendre l'envoi (message ${partial.ids.length + 1}/${partial.total})`
    : 'Envoyer';
  $('d-update').hidden = !posted;
  $('d-update').disabled = blocked || Boolean(away || otherMode);
  $('d-new').hidden = !posted && !partial;
  $('d-history-import').disabled = dBusy;
}

// Le rendu vient du serveur (`/api/discord/preview`) : c'est la fonction
// testée, et le même découpage que l'envoi. Seule la DERNIÈRE frappe compte.
let dSeq = 0;
let dTimer = 0;
async function previewDiscord() {
  const mine = ++dSeq;
  const data = await sendJson('/api/discord/preview', draft());
  if (mine !== dSeq) return;
  dPreview = data;
  $('d-preview').innerHTML = data.html || '<div class="dc-cut">rien à afficher</div>';
  refreshDiscord();
}
/** Le brouillon a changé : l'aperçu en cours ne vaut plus, un autre est demandé. */
function staleDiscord() {
  dPreview = null;
  refreshDiscord();
  clearTimeout(dTimer);
  dTimer = setTimeout(previewDiscord, 250);
}

$('d-text').oninput = () => {
  mem.set('draft', $('d-text').value);
  $('d-dates-info').textContent = '';
  staleDiscord();
};
$('d-embed').oninput = () => {
  mem.set('embed', readEmbed());
  showButtonRows();
  staleDiscord();
};
for (const r of document.getElementsByName('d-mode'))
  r.onchange = () => {
    dMode = r.value === 'embed' ? 'embed' : 'simple';
    mem.set('mode', dMode);
    staleDiscord();
  };

let dNoteSeq = 0;
async function loadNote() {
  const id = $('d-note').value;
  if (!id) return;
  const mine = ++dNoteSeq;
  const data = await (await fetch(`/api/discord/note?id=${encodeURIComponent(id)}`)).json();
  if (mine !== dNoteSeq) return;
  if (data.error) return log([data.error], false);
  $('d-frame').srcdoc = data.srcdoc;
  $('d-open').href = data.url;
  dTemplate = { simple: data.template, embed: data.embedTemplate };
}
$('d-note').onchange = loadNote;

// -- serveur où poster, salons, serveurs d'emojis --
// Salons du serveur choisi, groupés par catégorie dans l'ordre de Discord.
// Le serveur local les lit une fois par serveur et par session.
let dChannelSeq = 0;
async function loadChannels() {
  const mine = ++dChannelSeq;
  const got =
    dGuild && dState.hasToken
      ? await (await fetch(`/api/discord/channels?guild=${encodeURIComponent(dGuild)}`)).json()
      : {};
  if (mine !== dChannelSeq) return;
  dChannels = got.channels ?? [];
  dChannelsError = got.error ?? null;
  const option = (c) =>
    `<option value="${esc(c.id)}">#${esc(c.name)}${c.announcement ? ' (annonces)' : ''}</option>`;
  // Suites de salons d'une même catégorie (deux catégories peuvent porter
  // le même nom : on ne regroupe pas par nom).
  const runs = [];
  for (const c of dChannels) {
    const last = runs[runs.length - 1];
    if (last && last.category === c.category) last.options += option(c);
    else runs.push({ category: c.category, options: option(c) });
  }
  // AUCUN salon n'est choisi d'office : le premier envoi demande de le faire.
  $('d-channel').innerHTML =
    '<option value="">— choisir un salon —</option>' +
    runs
      .map((r) =>
        r.category ? `<optgroup label="${esc(r.category)}">${r.options}</optgroup>` : r.options,
      )
      .join('');
  const saved = partial ? partial.channelId : mem.get('channel', '');
  if (channelOf(saved)) $('d-channel').value = saved;
  refreshDiscord();
}

/** Les cases « prendre les emojis de », avec ce que chaque serveur a rendu. */
function renderEmojiGuilds() {
  const on = new Set(checkedGuilds());
  const guilds = dState.guilds ?? [];
  $('d-emoji-guilds').innerHTML = guilds.length
    ? guilds
        .map((g) => {
          const got = gEmojis.get(g.id);
          const note = !on.has(g.id)
            ? ''
            : !got
              ? '<small>…</small>'
              : got.error
                ? `<small class="ko">${esc(got.error)}</small>`
                : `<small>${plural(got.emojis.length, 'emoji')}</small>`;
          return `<label class="check"><input type="checkbox" data-guild="${esc(g.id)}"${on.has(g.id) ? ' checked' : ''} /> ${esc(g.name)} ${note}</label>`;
        })
        .join('')
    : `<small>${dState.hasToken ? 'liste des serveurs non lue' : 'indisponible sans jeton'}</small>`;
  renderExternal();
}

/**
 * Lit les emojis des serveurs COCHÉS que la page n'a pas encore — un
 * serveur décoché n'est jamais lu, un serveur lu ne l'est pas deux fois.
 * Un refus est gardé et affiché à côté de sa case, sans gêner les autres.
 */
async function loadEmojis() {
  const need = checkedGuilds().filter((id) => !gEmojis.has(id));
  renderEmojiGuilds();
  if (need.length && dState.hasToken) {
    const data = await sendJson('/api/discord/emojis', { guilds: need });
    for (const g of data.guilds ?? []) gEmojis.set(g.id, g);
  }
  renderEmojiGuilds();
  renderPalette();
}

$('d-guild').onchange = async () => {
  dGuild = $('d-guild').value;
  mem.set('guild', dGuild);
  // Changer de serveur vide le salon : il se rechoisit, il ne se devine pas.
  mem.set('channel', '');
  await Promise.all([loadChannels(), loadEmojis()]);
  await previewDiscord();
};
$('d-channel').onchange = () => {
  mem.set('channel', $('d-channel').value);
  refreshDiscord();
};
$('d-noembed').onchange = () => mem.set('noEmbeds', $('d-noembed').checked);

$('d-emoji-guilds').onchange = async (e) => {
  const box = e.target.closest('input[data-guild]');
  if (!box) return;
  const id = box.dataset.guild;
  // Dès qu'une case est touchée, le choix est le sien : il ne suit plus
  // le serveur où l'on poste.
  const on = new Set(checkedGuilds());
  if (box.checked) on.add(id);
  else on.delete(id);
  dEmojiGuilds = [...on];
  mem.set('emojiGuilds', dEmojiGuilds);
  // Recoché après un échec : on redemande.
  if (gEmojis.get(id)?.error) gEmojis.delete(id);
  await loadEmojis();
  await previewDiscord();
};

/**
 * La liste des serveurs du bot, puis les salons et les emojis qui en
 * dépendent. `reload` (« recharger la liste ») : le serveur local oublie
 * tout ce qu'il a lu de Discord, la page aussi — un serveur où le bot
 * vient d'être invité apparaît sans redémarrer l'outil.
 */
async function loadServers(reload) {
  dState = await (await fetch(`/api/discord/state${reload ? '?reload=1' : ''}`)).json();
  if (reload) gEmojis.clear();
  $('d-hint').textContent = [dState.hint, dState.palette?.error].filter(Boolean).join(' — ');
  const guilds = dState.guilds ?? [];
  // Messages gardés par une version d'avant le choix du serveur : ils
  // sont partis sur celui de DISCORD_GUILD_ID, en message simple.
  for (const w of [posted, partial])
    if (w && !w.guildId && dState.defaultGuild)
      Object.assign(w, { guildId: dState.defaultGuild, mode: w.mode ?? 'simple' });
  if (partial) {
    dGuild = partial.guildId;
    dMode = partial.mode === 'embed' ? 'embed' : 'simple';
  } else if (!guilds.some((g) => g.id === dGuild)) dGuild = dState.defaultGuild ?? '';
  $('d-guild').innerHTML =
    '<option value="">— choisir un serveur —</option>' +
    guilds.map((g) => `<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('');
  $('d-guild').value = dGuild;
  $('d-invite').hidden = !dState.invite;
  if (dState.invite) $('d-invite').href = dState.invite;
  await Promise.all([loadChannels(), loadEmojis()]);
}
$('d-reload').onclick = async () => {
  $('d-reload').disabled = true;
  try {
    await loadServers(true);
    await previewDiscord();
  } catch (e) {
    log([`Liste des serveurs illisible : ${e}`], false);
  } finally {
    $('d-reload').disabled = false;
  }
};

$('d-template').onclick = () => {
  if (!dTemplate) return log(['Choisir une note officielle d’abord.'], false);
  const embed = dMode === 'embed';
  const filled =
    $('d-text').value.trim() || (embed && readEmbed().buttons.some((b) => b.label || b.url));
  const ask = embed
    ? 'Remplacer le brouillon et les boutons par le gabarit ?'
    : 'Remplacer le brouillon par le gabarit ?';
  if (filled && !confirm(ask)) return;
  // En mode embed, « Full Patch Note » est un bouton de lien, pas un sous-texte.
  if (embed) {
    writeButtons(dTemplate.embed.buttons);
    mem.set('embed', readEmbed());
  }
  $('d-text').value = embed ? dTemplate.embed.text : dTemplate.simple;
  $('d-text').oninput();
};

// -- la demande à coller dans claude.ai --
// Le texte est bâti par le serveur local (`/api/discord/request`), du
// disque seul : consignes, exemples, note choisie, gabarit. Ici : le
// presse-papiers, et ce qu'on en dit.
const requestCount = () => {
  const { max } = dState.requestExamples;
  // Champ vidé : le nombre par défaut, pas zéro.
  const typed = String($('d-request-k').value).trim();
  const v = typed ? Number(typed) : NaN;
  return Number.isInteger(v) ? Math.min(max, Math.max(0, v)) : dState.requestExamples.default;
};
$('d-request-k').onchange = () => {
  $('d-request-k').value = requestCount();
  mem.set('requestExamples', requestCount());
};
$('d-draft').onclick = async () => {
  const noteId = $('d-note').value;
  if (!noteId) return log(['Choisir une note officielle d’abord.'], false);
  if (!editor) return;
  // Demandé AVANT : inutile de faire rédiger un jet qu'on ne posera pas.
  if ($('d-text').value.trim() && !confirm('Remplacer le brouillon par le premier jet de Claude ?'))
    return;
  $('d-draft').disabled = true;
  log([], undefined, 'demande à Claude');
  try {
    const r = await post('/api/discord/draft', { noteId, examples: requestCount() });
    if (!r.ok || !r.text) return;
    // Par `applyEdit` : Ctrl+Z rend l'ancien brouillon. Puis les dates,
    // que le modèle écrit en clair faute de savoir les calculer.
    applyEdit({ text: r.text, start: r.text.length, end: r.text.length });
    const d = editor.convertDates(editState());
    if (d.count) applyEdit(d.edit);
    $('d-request-info').textContent =
      `Premier jet posé — ${r.text.length.toLocaleString('fr-FR')} caractères, ${d.count} date${d.count > 1 ? 's' : ''} convertie${d.count > 1 ? 's' : ''}. À relire contre la note avant d’envoyer.`;
  } finally {
    $('d-draft').disabled = false;
  }
};
$('d-request').onclick = async () => {
  const noteId = $('d-note').value;
  if (!noteId) return log(['Choisir une note officielle d’abord.'], false);
  $('d-request').disabled = true;
  try {
    const r = await sendJson('/api/discord/request', { noteId, examples: requestCount() });
    if (r.error) return log([r.error], false);
    let copied = true;
    try {
      await navigator.clipboard.writeText(r.text);
    } catch {
      copied = false;
    }
    // Presse-papiers refusé : le texte est là, sélectionné, à copier à la main.
    const box = $('d-request-text');
    box.value = copied ? '' : r.text;
    box.hidden = copied;
    if (!copied) {
      box.focus();
      box.select();
    }
    const size = (n) => n.toLocaleString('fr-FR');
    const examples = r.examples
      ? plural(r.examples, 'exemple') +
        (r.examples < r.wanted && !r.dropped ? ` (${r.wanted} demandés)` : '')
      : !r.wanted
        ? 'sans exemple (0 demandé)'
        : !r.summaries
          ? 'aucun exemple : importe d’abord tes anciens résumés'
          : !r.paired
            ? 'aucun exemple : aucun résumé importé n’est apparié à sa note'
            : 'aucun exemple';
    const dropped = r.dropped
      ? ` — ${plural(r.dropped, 'exemple')} parmi les plus anciens ${r.dropped > 1 ? 'ont' : 'a'} sauté : la demande dépassait ${size(r.budget)} caractères`
      : '';
    const over =
      r.length > r.budget
        ? ` — <span class="ko">la note à elle seule dépasse ${size(r.budget)} caractères</span>`
        : '';
    $('d-request-info').innerHTML =
      (copied
        ? 'Demande copiée'
        : '<span class="warn">Presse-papiers refusé : copie le texte ci-dessous à la main (Ctrl+C)</span>') +
      ` — ${size(r.length)} caractères, ${esc(examples)}${esc(dropped)}${over}. À coller dans claude.ai ; le brouillon rendu se colle ici, puis « convertir les dates ».`;
  } finally {
    $('d-request').disabled = false;
  }
};

// -- anciens résumés --
const isoDay = (iso) => String(iso ?? '').slice(0, 10);
function renderHistory() {
  const h = dState.history;
  const s = (n) => (n > 1 ? 's' : '');
  $('d-history-state').textContent = h.count
    ? `${h.count} résumé${s(h.count)} importé${s(h.count)} (dernier : ${isoDay(h.last)}), ${h.paired} apparié${s(h.paired)} à ${h.paired > 1 ? 'leur' : 'sa'} note` +
      (h.importedAt ? ` — import du ${isoDay(h.importedAt)}.` : '.')
    : 'Aucun résumé importé : « copier la demande » part sans exemple.';
  $('d-history-list').hidden = !h.count;
  $('d-history-list').querySelector('ul').innerHTML = h.items
    .map(
      (i) =>
        `<li>${esc(isoDay(i.date))} · ${esc(i.first)}<small>${i.note ? `note : ${esc(i.note)}` : 'sans note appariée'}</small></li>`,
    )
    .join('');
}
$('d-history-import').onclick = async () => {
  const where = here();
  // Sans jeton il n'y a ni serveur ni salon à choisir : le serveur local le dira.
  if (dState.hasToken && (!where.guildId || !where.channelId))
    return log(['Choisir le serveur et le salon dont lire l’historique.'], false);
  if (
    dState.hasToken &&
    !confirm(
      `Lire l’historique de ${whereLabel(where)} pour y retrouver mes anciens résumés ?\n(lecture seule : les 1 000 messages les plus récents au plus, rien n’est posté)`,
    )
  )
    return;
  dBusy = true;
  refreshDiscord();
  log([], undefined, 'lecture de l’historique du salon');
  try {
    const r = await post('/api/discord/history', {
      guildId: where.guildId,
      channelId: where.channelId,
    });
    if (r.history) {
      dState.history = r.history;
      renderHistory();
    }
  } finally {
    dBusy = false;
    refreshDiscord();
  }
};

$('d-send').onclick = async () => {
  if (!dPreview) return;
  const where = partial ?? here();
  const left = dPreview.messages - (partial ? partial.ids.length : 0);
  const ask =
    `Poster ${plural(left, 'message')}${dMode === 'embed' ? ' (embed)' : ''} dans ${whereLabel(where)} ?` +
    (partial ? `\n(reprise : ${plural(partial.ids.length, 'message')} déjà en place)` : '');
  if (!confirm(ask)) return;
  dBusy = true;
  refreshDiscord();
  log([], undefined, 'envoi à Discord');
  try {
    const r = await post('/api/discord/send', {
      ...draft(),
      guildId: where.guildId,
      channelId: where.channelId,
      suppressEmbeds: $('d-noembed').checked,
      already: partial ? partial.ids : [],
      total: partial ? partial.total : undefined,
    });
    const kept = {
      guildId: where.guildId,
      guildName: where.guildName,
      channelId: where.channelId,
      channelName: where.channelName,
      mode: dMode,
    };
    if (r.ok) {
      posted = { ...kept, ids: r.ids, urls: r.urls };
      partial = null;
    } else if (r.ids?.length) {
      // Le compte d'ORIGINE reste la référence d'une reprise, même si le
      // serveur vient de refuser parce que le découpage a changé.
      partial = { ...kept, ids: r.ids, total: partial ? partial.total : r.total };
    }
    mem.set('posted', posted);
    mem.set('partial', partial);
  } finally {
    dBusy = false;
    refreshDiscord();
  }
};

$('d-update').onclick = async () => {
  if (!posted || !dPreview) return;
  const ask = `Modifier en place ${plural(posted.ids.length, 'message')} dans ${whereLabel(posted)} ?`;
  if (!confirm(ask)) return;
  dBusy = true;
  refreshDiscord();
  log([], undefined, 'modification dans Discord');
  try {
    // Le serveur et le salon CHOISIS partent avec ceux d'origine : le
    // serveur local refuse s'ils diffèrent, comme il refuse un autre mode.
    await post('/api/discord/edit', {
      ...draft(),
      channelId: $('d-channel').value,
      ids: posted.ids,
      suppressEmbeds: $('d-noembed').checked,
      posted: { guildId: posted.guildId, channelId: posted.channelId, mode: posted.mode },
    });
  } finally {
    dBusy = false;
    refreshDiscord();
  }
};

$('d-new').onclick = () => {
  if (
    partial &&
    !confirm('Oublier l’envoi interrompu ? Les messages déjà postés restent dans Discord.')
  )
    return;
  posted = partial = null;
  mem.set('posted', null);
  mem.set('partial', null);
  refreshDiscord();
};

// -- outils d'édition : barre, sélecteur d'emojis, autocomplétion --
// La logique (ce que chaque outil fait du texte et de la sélection, le
// filtre des emojis, la détection du `:xx` à compléter) est PURE et vit
// dans `discord-editor.mjs`, que les tests importent aussi. Ici, rien que
// le branchement sur la page.
let editor = null;
const editorReady = import('/discord-editor.mjs').then(
  (m) => (editor = m),
  (e) => log([`Outils d’édition illisibles : ${e}`], false),
);

const editState = () => ({
  text: $('d-text').value,
  start: $('d-text').selectionStart,
  end: $('d-text').selectionEnd,
});

/**
 * Pose le résultat d'un outil dans la zone de texte. PAS en réécrivant
 * `value` : l'historique d'annulation du navigateur serait vidé, et
 * Ctrl+Z ne rendrait plus rien. `execCommand('insertText')` est la seule
 * écriture qu'il y range — donnée en UN remplacement (`diffEdit`), donc
 * défaite d'un seul Ctrl+Z. L'événement `input` qu'elle émet enregistre
 * le brouillon et relance l'aperçu, comme une frappe.
 */
let applying = false;
function applyEdit(edit) {
  const ta = $('d-text');
  const d = editor.diffEdit(ta.value, edit.text);
  applying = true;
  try {
    ta.focus();
    if (d) {
      ta.setSelectionRange(d.from, d.to);
      const done = d.insert
        ? document.execCommand('insertText', false, d.insert)
        : document.execCommand('delete');
      if (!done || ta.value !== edit.text) {
        // Navigateur sans `execCommand` : le texte passe, sans annulation.
        ta.value = edit.text;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    ta.setSelectionRange(edit.start, edit.end);
  } finally {
    applying = false;
  }
  closeComplete();
}

function runTool(tool) {
  if (!editor) return;
  const e = editState();
  if (tool !== 'link') return applyEdit(editor.applyTool(e, tool));
  // Le lien : un second clic le défait ; sinon il lui faut une adresse,
  // sauf si la sélection en est déjà une.
  const link = editor.linkAt(e);
  if (link) return applyEdit(editor.unlink(e, link));
  let url = '';
  if (!editor.isUrl(e.text.slice(e.start, e.end))) {
    url = prompt('Adresse du lien', 'https://');
    if (url === null) return $('d-text').focus();
  }
  applyEdit(editor.insertLink(e, url));
}

// `mousedown` retenu : le clic ne prend pas le focus à la zone de texte,
// dont la sélection reste à l'écran.
$('d-tools').onmousedown = (e) => e.preventDefault();
$('d-tools').onclick = (e) => {
  const b = e.target.closest('button[data-tool]');
  if (b) runTool(b.dataset.tool);
};

// Horodatages. « date » ouvre un petit formulaire — date et heure en UTC,
// celles de la note — et pose `<t:instant:format>` à la place de la
// sélection ; une sélection qui EST une date le préremplit. La conversion
// est dans `discord-editor.mjs` (`utcToUnix`), testée à part.
let stampAt = { start: 0, end: 0 };
function stampUnix() {
  return editor.utcToUnix($('d-stamp-date').value, $('d-stamp-time').value || '00:00');
}
function renderStamp() {
  const unix = stampUnix();
  $('d-stamp-info').textContent =
    unix === null ? 'date ou heure à compléter' : `<t:${unix}:${$('d-stamp-style').value}>`;
  $('d-stamp-ok').disabled = unix === null;
}
function closeStamp(refocus) {
  $('d-stamp').hidden = true;
  $('d-date').setAttribute('aria-expanded', 'false');
  if (refocus) $('d-text').focus();
}
function openStamp() {
  if (!editor) return;
  closeComplete();
  closePicker(false);
  const e = editState();
  const found = editor.dateAt(e);
  stampAt = found ?? e;
  // Sans date sélectionnée : aujourd'hui (UTC), à minuit.
  $('d-stamp-date').value = found?.date ?? new Date().toISOString().slice(0, 10);
  $('d-stamp-time').value = found?.time ?? '00:00';
  $('d-stamp').hidden = false;
  $('d-date').setAttribute('aria-expanded', 'true');
  renderStamp();
  // Une date impossible (le 30 février) : le champ la refuse, on dit laquelle.
  if (found && stampUnix() === null)
    $('d-stamp-info').textContent = `« ${found.date} ${found.time} » n’existe pas`;
  $('d-stamp-date').focus();
}
function insertStamp() {
  const unix = stampUnix();
  if (unix === null) return renderStamp();
  closeStamp(false);
  applyEdit(
    editor.insertTimestamp(
      { text: $('d-text').value, start: stampAt.start, end: stampAt.end },
      unix,
      $('d-stamp-style').value,
    ),
  );
}
$('d-date').onclick = () => ($('d-stamp').hidden ? openStamp() : closeStamp(true));
$('d-stamp').oninput = renderStamp;
$('d-stamp-ok').onclick = insertStamp;
$('d-stamp-cancel').onclick = () => closeStamp(true);
$('d-stamp').onkeydown = (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeStamp(true);
  } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
    // Entrée dans un champ insère ; sur un bouton, elle reste son clic.
    e.preventDefault();
    insertStamp();
  }
};
document.addEventListener('mousedown', (e) => {
  if (!$('d-stamp').hidden && !e.target.closest('#d-stamp, #d-date')) closeStamp(false);
});

// « Copier le message » : Sevih poste lui-même. Le texte du brouillon ne
// porte pas les ESC des couleurs (invisibles, perdus au collage) ; le bot
// les remet à l'envoi, ce bouton les remet dans le presse-papiers.
$('d-copy').onclick = async () => {
  if (!editor) return;
  const text = editor.restoreAnsi($('d-text').value.replace(/\r\n?/g, '\n'));
  if (!text.trim()) return log(['Rien à copier : le brouillon est vide.'], false);
  let copied = true;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    copied = false;
  }
  const box = $('d-request-text');
  box.value = copied ? '' : text;
  box.hidden = copied;
  if (!copied) {
    box.focus();
    box.select();
  }
  $('d-request-info').innerHTML =
    (copied
      ? 'Message copié'
      : '<span class="warn">Presse-papiers refusé : copie le texte ci-dessous à la main (Ctrl+C)</span>') +
    ` — ${text.length.toLocaleString('fr-FR')} caractères, couleurs comprises. À coller dans Discord : les <code>:codes:</code> d’emoji et les dates y sont convertis à l’envoi.`;
};

// « convertir les dates » : chaque `AAAA-MM-JJ HH:MM UTC` du brouillon
// devient un horodatage — la forme sous laquelle un modèle écrit ses dates.
$('d-dates').onclick = () => {
  if (!editor) return;
  const r = editor.convertDates(editState());
  if (r.count) applyEdit(r.edit);
  const s = (n) => (n > 1 ? 's' : '');
  // Après `applyEdit` : sa frappe simulée vient d'effacer cette ligne.
  $('d-dates-info').textContent =
    (r.count
      ? `${r.count} date${s(r.count)} convertie${s(r.count)} en horodatage Discord.`
      : 'Aucune date convertie : la forme attendue est « AAAA-MM-JJ » ou « AAAA-MM-JJ HH:MM », lue en UTC.') +
    (r.invalid.length
      ? ` Laissée${s(r.invalid.length)} telle${s(r.invalid.length)} quelle${s(r.invalid.length)}, la date n’existe pas : ${r.invalid.join(', ')}.`
      : '');
};

// Emojis : ceux des serveurs COCHÉS (lus avec le jeton seulement, par
// `/api/discord/emojis`) réunis dans l'ordre de la liste — un même nom sur
// deux serveurs, le premier gagne, comme à l'envoi — et la table standard.
const emojiLists = () => ({
  guild: editor.mergeGuildEmojis(
    checkedGuilds().map((id) => ({
      id,
      name: guildName(id),
      emojis: gEmojis.get(id)?.emojis ?? [],
    })),
  ),
  standard: dState.standard ?? [],
});
const savedRecent = mem.get('recentEmojis', []);
let recent = Array.isArray(savedRecent) ? savedRecent.filter((n) => typeof n === 'string') : [];

/** Un emoji à l'écran : l'image du CDN de Discord, ou son caractère. */
const emojiFace = (em) =>
  em.id
    ? `<img alt="" loading="lazy" src="https://cdn.discordapp.com/emojis/${esc(em.id)}.${em.animated ? 'gif' : 'webp'}?size=48">`
    : esc(em.char);

/** Écrit `:nom:` — au curseur, ou à la place du `:xx` tapé (`from`). */
function useEmoji(em, from) {
  applyEdit(editor.insertEmoji(editState(), em.name, from));
  recent = editor.pushRecent(recent, em.name);
  mem.set('recentEmojis', recent);
}

// Palette : les emojis de `discord-palette.json`, toujours sous la main.
// Un nom que ni un serveur coché ni la table standard ne porte n'est pas
// un bouton — il est nommé dessous, pour être corrigé dans le fichier.
let paletteItems = [];
function renderPalette() {
  if (!editor) return;
  const { groups, missing } = editor.resolvePalette(dState.palette?.groups ?? [], emojiLists());
  paletteItems = [];
  $('d-palette').innerHTML = groups
    .map(
      (g) =>
        `<div class="grp"><span>${esc(g.label)}</span>${g.items
          .map((em) => {
            const i = paletteItems.push(em) - 1;
            return `<button class="em" data-i="${i}" title=":${esc(em.name)}:">${emojiFace(em)}</button>`;
          })
          .join('')}</div>`,
    )
    .join('');
  // Sans jeton, ou tant qu'un serveur coché n'est pas lu, « absent » ne
  // veut pas encore dire « mal nommé ».
  const unread = !dState.hasToken || checkedGuilds().some((id) => !gEmojis.get(id)?.emojis);
  $('d-palette-missing').textContent = missing.length
    ? `absents${unread ? ' (emojis de serveur non lus)' : ''} : ${missing.join(', ')} — ni sur un serveur coché ni standard ; les noms se corrigent dans scripts/quick/discord-palette.json`
    : '';
}
// `mousedown` retenu, comme pour la barre : la zone de texte garde sa sélection.
$('d-palette').onmousedown = (e) => e.preventDefault();
$('d-palette').onclick = (e) => {
  const b = e.target.closest('button.em');
  const em = b && paletteItems[Number(b.dataset.i)];
  if (em && editor) useEmoji(em);
};

// Sélecteur. `offered` : les emojis qu'il affiche, dans l'ordre — Entrée
// prend le premier. Les standards (des centaines) ne sont pas déroulés
// d'office : par la recherche, ou en dépliant leur section (état retenu).
let offered = [];
let standardOpen = mem.get('standardOpen', false) === true;
function renderPicker() {
  const q = $('d-picker-q').value;
  const lists = emojiLists();
  offered = [];
  const grid = (items) =>
    `<div class="em-grid">${items
      .map((em) => {
        const i = offered.push(em) - 1;
        return `<button class="em${i ? '' : ' first'}" data-i="${i}" title=":${esc(em.name)}:">${emojiFace(em)}</button>`;
      })
      .join('')}</div>`;
  const none = (why) => `<p class="hint">${esc(why)}</p>`;
  // Section d'un serveur vide : dire pourquoi.
  const noGuild = (id) => {
    const got = gEmojis.get(id);
    return q.trim() && got?.emojis?.length
      ? 'Aucun emoji à ce nom.'
      : got?.error
        ? `Emojis indisponibles — ${got.error}.`
        : !got
          ? 'Emojis non lus.'
          : got.emojis.length
            ? 'Ses emojis portent tous le nom d’un emoji d’un serveur coché avant lui.'
            : 'Ce serveur n’a pas d’emoji.';
  };

  const guilds = checkedGuilds().map((id) => ({ id, name: guildName(id) }));
  const sections = editor.pickerSections(lists, guilds, q, recent, standardOpen);
  $('d-picker-list').innerHTML =
    (guilds.length
      ? ''
      : none(
          dState.hint
            ? `Emojis de serveur indisponibles — ${dState.hint}.`
            : 'Aucun serveur coché : seuls les emojis standard sont proposés.',
        )) +
    sections
      .map((sec) => {
        if (sec.key === 'standard' && !q.trim())
          return (
            `<h3><button data-fold aria-expanded="${!sec.folded}">${sec.folded ? '▸' : '▾'} Standards (${lists.standard.length})</button></h3>` +
            (sec.folded ? '' : grid(sec.items))
          );
        const empty =
          sec.key === 'standard'
            ? 'Aucun emoji standard à ce nom.'
            : noGuild(sec.key.slice('guild:'.length));
        return `<h3>${esc(sec.title)}</h3>${sec.items.length ? grid(sec.items) : none(empty)}`;
      })
      .join('');
}

function closePicker(refocus) {
  $('d-picker').hidden = true;
  $('d-emoji').setAttribute('aria-expanded', 'false');
  if (refocus) $('d-text').focus();
}
function openPicker() {
  if (!editor) return;
  closeComplete();
  $('d-picker').hidden = false;
  $('d-emoji').setAttribute('aria-expanded', 'true');
  $('d-picker-q').value = '';
  renderPicker();
  $('d-picker-q').focus();
}
function pickEmoji(i) {
  const em = offered[i];
  if (!em) return;
  closePicker(false);
  useEmoji(em);
}
$('d-emoji').onclick = () => ($('d-picker').hidden ? openPicker() : closePicker(true));
$('d-picker-q').oninput = renderPicker;
$('d-picker-q').onkeydown = (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closePicker(true);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    pickEmoji(0);
  }
};
$('d-picker-list').onclick = (e) => {
  if (e.target.closest('[data-fold]')) {
    standardOpen = !standardOpen;
    mem.set('standardOpen', standardOpen);
    return renderPicker();
  }
  const b = e.target.closest('button.em');
  if (b) pickEmoji(Number(b.dataset.i));
};
// Un clic ailleurs le referme.
document.addEventListener('mousedown', (e) => {
  if (!$('d-picker').hidden && !e.target.closest('#d-picker, #d-emoji')) closePicker(false);
});

// Autocomplétion : `:` et deux lettres ouvrent la liste. `items` vide =
// fermée, et les touches ne sont alors PAS interceptées (un Entrée reste
// un saut de ligne).
let complete = { from: 0, items: [], index: 0 };
function closeComplete() {
  complete = { from: 0, items: [], index: 0 };
  $('d-complete').hidden = true;
}

/**
 * Où tombe, dans la zone de texte, le caractère n° `at` (coin bas-gauche,
 * en pixels) ? Le navigateur ne le dit pas : le texte qui le précède est
 * recopié dans un calque invisible de même police et de même largeur, et
 * on mesure où il s'arrête.
 */
function caretPoint(ta, at) {
  const cs = getComputedStyle(ta);
  const ghost = document.createElement('div');
  for (const p of [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'lineHeight',
    'letterSpacing',
    'tabSize',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
  ])
    ghost.style[p] = cs[p];
  Object.assign(ghost.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    visibility: 'hidden',
    boxSizing: 'border-box',
    width: `${ta.clientWidth}px`,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  });
  ghost.textContent = ta.value.slice(0, at);
  const mark = document.createElement('span');
  mark.textContent = '​';
  ghost.append(mark);
  ta.parentNode.append(ghost);
  const point = {
    left: ta.offsetLeft + ta.clientLeft + mark.offsetLeft - ta.scrollLeft,
    top: ta.offsetTop + ta.clientTop + mark.offsetTop + mark.offsetHeight - ta.scrollTop,
  };
  ghost.remove();
  return point;
}

function renderComplete() {
  $('d-complete').innerHTML = complete.items
    .map(
      (em, i) =>
        `<li role="option" data-i="${i}" aria-selected="${i === complete.index}"><span class="face">${emojiFace(em)}</span>:${esc(em.name)}:</li>`,
    )
    .join('');
}
function refreshComplete() {
  const ta = $('d-text');
  const q =
    editor && ta.selectionStart === ta.selectionEnd
      ? editor.emojiQueryAt(ta.value, ta.selectionStart)
      : null;
  const items = q ? editor.searchEmojis(emojiLists(), q.query, recent, 8) : [];
  if (!items.length) return closeComplete();
  complete = { from: q.from, items, index: 0 };
  renderComplete();
  // Sous le `:` qui ouvre le code, sans sortir de l'éditeur par la droite.
  const list = $('d-complete');
  list.hidden = false;
  const at = caretPoint(ta, q.from);
  const room = ta.parentNode.clientWidth - list.offsetWidth;
  list.style.left = `${Math.max(0, Math.min(at.left, room))}px`;
  list.style.top = `${at.top + 2}px`;
}
function pickComplete(i) {
  const em = complete.items[i];
  const from = complete.from;
  closeComplete();
  if (em) useEmoji(em, from);
}

$('d-text').addEventListener('input', () => {
  if (!applying) refreshComplete();
});
$('d-text').addEventListener('blur', closeComplete);
// `mousedown` retenu : cliquer une ligne ne retire pas le focus à la zone
// de texte (ce qui fermerait la liste avant le clic).
$('d-complete').onmousedown = (e) => e.preventDefault();
$('d-complete').onclick = (e) => {
  const li = e.target.closest('li');
  if (li) pickComplete(Number(li.dataset.i));
};

$('d-text').onkeydown = (e) => {
  if (e.isComposing) return;
  if (complete.items.length) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = complete.items.length;
      complete.index = (complete.index + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
      return renderComplete();
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      return pickComplete(complete.index);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      return closeComplete();
    }
    // Le curseur s'en va : la liste ne le suit pas.
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key))
      closeComplete();
  }
  const tool = editor?.shortcutTool(e);
  if (tool) {
    e.preventDefault();
    runTool(tool);
  }
};

async function loadDiscord() {
  // Le brouillon d'abord : il doit revenir même si l'état ne se charge pas.
  $('d-text').value = mem.get('draft', '');
  $('d-noembed').checked = mem.get('noEmbeds', true);
  writeEmbed(mem.get('embed', null));
  refreshDiscord();

  // La palette et le sélecteur ont besoin du module d'édition.
  await editorReady;
  if (editor)
    $('d-stamp-style').innerHTML = editor.TIMESTAMP_STYLES.map(
      ([style, label]) =>
        `<option value="${style}"${style === 'f' ? ' selected' : ''}>${style} — ${label}</option>`,
    ).join('');
  await loadServers(false);
  renderHistory();
  // Nombre d'exemples de « copier la demande » : le dernier choisi.
  $('d-request-k').max = dState.requestExamples.max;
  $('d-request-k').value = mem.get('requestExamples', dState.requestExamples.default);
  $('d-request-k').value = requestCount();
  $('d-note').innerHTML = dState.notes
    .map((n) => `<option value="${esc(n.id)}">${esc(n.date)} · ${esc(n.title)}</option>`)
    .join('');
  // La note de patch la plus récente sous la main : c'est elle qu'on résume.
  const patch = dState.notes.find((n) => n.type === 'update');
  if (patch) $('d-note').value = patch.id;

  await Promise.all([loadNote(), previewDiscord()]);
}

sections.register('discord', {
  init: () => loadDiscord().catch((e) => log([`Onglet Discord illisible : ${e}`], false)),
});
