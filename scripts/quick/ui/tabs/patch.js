// Onglet « Patch » : la chaîne des données à chaque patch du jeu, en quatre
// gestes — rafraîchir, relire la promotion (dry-run), promouvoir, committer.
// Chacun lance UNE commande du dépôt côté serveur (`patch.ts`), un seul travail
// à la fois ; sa sortie arrive ligne à ligne dans la console du bas. Le
// dry-run rend en plus sa revue, lue de sa sortie par le serveur : une ligne
// par fichier différent, et ce que « Promouvoir » écrira. Un cinquième, à part :
// « Get news », les notes de patch seules (`pnpm getNews`, qui peut committer).
import { $, esc, gitBar, log, post, sections } from '../lib.js';

/**
 * Les cinq gestes : leur nom dans le journal, leur route, et `writes` pour
 * ceux qui écrivent dans le dépôt — le dry-run ne fait que lire.
 */
const REFRESH = {
  label: 'rafraîchissement depuis le jeu',
  path: '/api/patch/refresh',
  writes: true,
};
const DRY = { label: 'dry-run de la promotion', path: '/api/patch/promote' };
const APPLY = { label: 'promotion de l’extraction', path: '/api/patch/promote', writes: true };
const COMMIT = { label: 'commit des données', path: '/api/patch/commit', writes: true };
/** Le cinquième : `posts.json` / `buff-events.json`, committés s'ils changent. */
const NEWS = { label: 'notes de patch (getNews)', path: '/api/patch/news', writes: true };

/** Le dernier `/api/patch/state` : travail en cours, versions, reprise, dépôt. */
let st = null;
/** Le geste lancé d'ICI tant qu'il court — sa sortie est dans la console. */
let running = null;
/**
 * Où en est la revue, dans cette session de page : `none`, `ok` (un dry-run a
 * réussi : « Promouvoir » s'allume), `ko`, `stale` (la proposition a pu changer
 * depuis), `applied`. Rien n'est retenu au rechargement — la revue se refait.
 */
let review = 'none';
let reviewAt = '';
/**
 * La revue du dernier dry-run réussi, telle que le serveur l'a lue de sa
 * sortie (`promoteReview` de `patch.ts`) ; `null` avant, ou après un échec.
 */
let sheet = null;

/** Toute la sortie reçue, telle que « Copier » la rend. */
const lines = [];
/** Au-delà, la console n'affiche plus que la fin (« Copier » garde tout). */
const MAX_SHOWN = 5000;
/** Un travail lancé ailleurs : l'état est relu à ce rythme jusqu'à sa fin. */
const POLL_MS = 3000;
let seq = 0;
let poll;

const plural = (n, one, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;
const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const source = () => document.querySelector('input[name="p-source"]:checked').value;
/** Le travail qui tient le verrou : celui d'ici, sinon celui que dit le serveur. */
const busy = () => running ?? st?.job ?? null;

// ------------------------------------------------------ la console
/** Collée au bas, la sortie y reste : remonter d'un cran la lâche. */
const stuck = (box) => box.scrollHeight - box.scrollTop - box.clientHeight < 8;

function write(box, line, max = MAX_SHOWN) {
  const follow = stuck(box);
  box.append(`${line}\n`);
  while (box.childNodes.length > max) box.firstChild.remove();
  if (follow) box.scrollTop = box.scrollHeight;
}

function print(line) {
  lines.push(line);
  write($('p-console'), line);
}

// ------------------------------------------------------ l'état
function renderRefresh() {
  const state = $('p-refresh-state');
  if (!st) return;
  const site = `site ${st.site ?? '—'}`;
  // Un client plus récent que le site : c'est le patch à rafraîchir.
  const ahead =
    st.client && st.site && st.client.localeCompare(st.site, 'en', { numeric: true }) > 0;
  state.textContent = st.steam
    ? `client ${st.client ?? '—'} · ${site}${ahead ? ' — un patch attend' : ''}`
    : `pas de client Steam · ${site}`;
  state.className = `p-state${ahead ? ' warn' : ''}`;
  state.title = st.steam
    ? (st.errors?.client ?? st.errors?.site ?? '')
    : 'Aucun client Steam sur ce poste : la source Android reste possible';

  const at = st.checkpoint?.[source()];
  const resume = $('p-resume');
  resume.hidden = !at;
  if (at) {
    const when = new Date(at).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    resume.textContent = `une reprise attend (checkpoint du ${when}) : « Lancer » reprend où la chaîne a cassé, « forcer » repart de zéro.`;
  }
}

const REVIEW_STATES = {
  none: ['pas encore de dry-run', ''],
  ok: ['dry-run réussi', 'ok'],
  ko: ['dry-run en échec', 'ko'],
  stale: ['dry-run à refaire : la proposition a pu changer', 'warn'],
  applied: ['promue — un nouveau dry-run avant une autre promotion', ''],
};

/** Les comptes d'un fichier, comme `promote.ts` les écrit. */
const counts = (f) => `+${f.added} · ~${f.changed} · −${f.removed}`;

/** Une ligne de la revue : le fichier, ses comptes, ce qu'il y a à en savoir, « voir ». */
function fileRow(f) {
  const held = f.status === 'retained';
  const what = held ? 'retenu, non promu' : f.status === 'new' ? 'nouveau fichier' : counts(f);
  const why = [
    f.note,
    f.offSite ? `dont ${f.offSite} hors périmètre du site — aucune action dans Extraction` : '',
  ].filter(Boolean);
  const see = f.target
    ? `<button class="btn ghost sm" data-go="extractor/${esc(f.target)}" title="Ouvrir Extraction sur cette cible">voir</button>`
    : '';
  return `<li class="p-file${held ? ' warn' : ''}"><span class="mono p-name">${esc(f.file)}</span><span class="p-counts${f.status === 'changed' ? '' : ' said'}" title="${esc(f.raw)}">${esc(what)}</span><span class="p-why">${esc(why.join(' · '))}</span>${see}</li>`;
}

/**
 * La revue du dry-run, au-dessus de sa sortie brute. Dessinée quand elle
 * change (un dry-run part, ou rend son issue), pas à chaque `render`.
 */
function renderSheet() {
  const box = $('p-rev');
  box.hidden = !sheet;
  if (!sheet) {
    box.innerHTML = '';
    return;
  }
  if (!sheet.ok) {
    box.innerHTML =
      '<p class="p-note warn">Sortie du dry-run non reconnue : la lire ci-dessous.</p>';
    return;
  }
  const same = plural(sheet.identical, 'fichier identique', 'fichiers identiques');
  const notes = [
    sheet.files.length
      ? `<p class="p-note">${same}.</p>`
      : `<p class="p-note">Rien à promouvoir : la proposition est identique au validé (${same}).</p>`,
  ];
  if (sheet.stripped.length)
    notes.push(
      `<p class="p-note warn">Persos non intégrés, jamais promus — l’intégration se fait par entité, dans Extraction : <span class="mono">${esc(sheet.stripped.join(', '))}</span></p>`,
    );
  if (sheet.orphans.length)
    notes.push(
      `<p class="p-note warn">Validés sans équivalent extrait, à trancher : <span class="mono">${esc(sheet.orphans.join(', '))}</span></p>`,
    );
  notes.push('<p class="p-note">Dry-run : rien n’a été écrit.</p>');
  box.innerHTML =
    (sheet.files.length ? `<ul class="p-files">${sheet.files.map(fileRow).join('')}</ul>` : '') +
    notes.join('');
}

/** Combien de fichiers l'annonce de « Promouvoir » nomme ; le `title` les dit tous. */
const PLAN_SHOWN = 4;

/** Un fichier de l'annonce : « monsters.json (~3) ». */
function planned(f) {
  const n = [f.added && `+${f.added}`, f.changed && `~${f.changed}`, f.removed && `−${f.removed}`]
    .filter(Boolean)
    .join(' ');
  return `${f.file} (${n || (f.status === 'new' ? 'nouveau' : (f.note ?? 'modifié'))})`;
}

/** « Promouvoir » annonce ce qu'il écrira, d'après la revue — tant qu'elle vaut. */
function renderPlan() {
  const text = $('p-apply-plan');
  const usable = review === 'ok' && sheet?.ok;
  text.hidden = !usable;
  text.textContent = '';
  $('p-apply').title = '';
  if (!usable) return;
  const writes = sheet.files.filter((f) => f.status !== 'retained').map(planned);
  const held = sheet.files.length - writes.length;
  const kept = held
    ? ` — ${plural(held, 'retenu', 'retenus')}, non promu${held > 1 ? 's' : ''}`
    : '';
  if (!writes.length) {
    text.textContent = `n’écrira rien${kept || ' : la proposition est identique au validé'}`;
    $('p-apply').title = text.textContent;
    return;
  }
  const head = `écrira ${plural(writes.length, 'fichier')} : `;
  const more = writes.length - PLAN_SHOWN;
  text.textContent =
    head +
    writes.slice(0, PLAN_SHOWN).join(', ') +
    (more > 0 ? `, … et ${plural(more, 'autre')}` : '') +
    kept;
  $('p-apply').title = head + writes.join(', ') + kept;
}

function renderReview() {
  renderPlan();
  const [text, tone] = REVIEW_STATES[review];
  const state = $('p-review-state');
  state.textContent =
    running === DRY.label
      ? 'dry-run en cours…'
      : (review === 'ok' || review === 'ko') && reviewAt
        ? `${text} à ${reviewAt}`
        : text;
  state.className = `p-state${tone ? ` ${tone}` : ''}`;

  const apply = $('p-apply-state');
  apply.textContent =
    review === 'ok'
      ? 'prêt : la revue est au-dessus'
      : review === 'applied'
        ? `promue à ${reviewAt} — reste à committer`
        : 'après un dry-run réussi';
  apply.className = `p-state${review === 'applied' ? ' ok' : ''}`;
}

function renderCommit() {
  const state = $('p-commit-state');
  if (!st) return;
  if (!st.git) {
    state.textContent = `dépôt illisible : ${st.errors?.git ?? 'erreur inconnue'}`;
    state.className = 'p-state ko';
    return;
  }
  const { dirty, ahead } = st.git;
  state.textContent =
    (dirty ? plural(dirty, 'fichier modifié', 'fichiers modifiés') : 'aucun fichier modifié') +
    (ahead ? ` · ${plural(ahead, 'commit')} à pousser — « Pousser », dans l’en-tête` : '');
  state.className = `p-state${dirty ? ' warn' : ''}`;
}

/** Les boutons, « Arrêter », la ligne de la console : d'après le verrou. */
function render() {
  const job = busy();
  const locked = Boolean(job);
  $('p-refresh').disabled = locked;
  $('p-get-news').disabled = locked;
  $('p-dry').disabled = locked;
  $('p-apply').disabled = locked || review !== 'ok';
  // Rien de modifié : rien à committer. Dépôt illisible : on laisse tenter.
  const nothing = st?.git ? st.git.dirty === 0 : false;
  $('p-commit').disabled = locked || nothing || !$('p-message').value.trim();
  $('p-commit').title = nothing && !locked ? 'Aucun fichier modifié : rien à committer' : '';
  // Le 409 du serveur reste la vraie garde ; `gitBar` rallume « Pousser » après.
  if (locked) $('push').disabled = true;
  $('p-stop').hidden = !locked;

  $('p-console-state').textContent = running
    ? `en cours : ${running}`
    : job
      ? `un travail tourne : ${job} — lancé avant, sa sortie n’est pas ici`
      : lines.length
        ? plural(lines.length, 'ligne') +
          (lines.length > MAX_SHOWN ? ` — les ${MAX_SHOWN} dernières affichées` : '')
        : 'au repos';

  renderRefresh();
  renderReview();
  renderCommit();
}

/** Au premier état : la source par défaut du poste, et la borne du message. */
function seed() {
  const radio = document.querySelector(`input[name="p-source"][value="${st.source}"]`);
  if (radio) radio.checked = true;
  if (st.messageMax) $('p-message').maxLength = st.messageMax;
}

/** Relit `/api/patch/state`. Seule la DERNIÈRE demande se dessine. */
async function load() {
  const mine = ++seq;
  clearTimeout(poll);
  try {
    const res = await fetch('/api/patch/state');
    const data = await res.json();
    if (!res.ok) throw new Error(data.log?.[0] ?? data.error ?? 'réponse en erreur');
    if (mine !== seq) return;
    const first = st === null;
    st = data;
    if (first) seed();
    // L'en-tête dit le même compte : un commit fait d'ici ou au terminal s'y voit.
    if (st.git) gitBar(st.git);
  } catch (e) {
    if (mine !== seq) return;
    // Pendant un geste lancé d'ici, le journal est le sien.
    if (!running) log([`Patch : état illisible : ${e}`], false);
  }
  render();
  // Un travail lancé avant (page rechargée, autre onglet) : on attend sa fin
  // pour rallumer les boutons — tant que la section est à l'écran.
  if (st?.job && !running && !$('tab-patch').hidden) poll = setTimeout(load, POLL_MS);
}

// ------------------------------------------------------ les gestes
/**
 * Lance un geste : le journal de l'en-tête suit la ligne en cours, la console
 * reçoit tout (`onStep` de `post()`), puis l'état est relu. `after` voit
 * l'issue avant ce redessin. La fin d'un geste qui écrit (`writes`), réussi ou
 * non, est annoncée (`quick:changed` sur `document`) ; celle du dry-run, non.
 */
async function run({ label, path, payload, button, onLine, after, writes }) {
  running = label;
  button.classList.add('busy');
  // Les sorties s'enchaînent dans la console : une ligne vide les sépare.
  if (lines.length) print('');
  render();
  log([], undefined, label);
  let data;
  try {
    data = await post(path, payload, (line) => {
      print(line);
      onLine?.(line);
    });
  } catch (e) {
    data = { ok: false };
    log([`${label} : ${e}`], false);
  }
  running = null;
  button.classList.remove('busy');
  // Tables, proposition, validé : les fichiers du dépôt ont pu bouger sans
  // commit. Le menu relira ses pastilles (`lib.js`).
  if (writes) document.dispatchEvent(new Event('quick:changed'));
  after?.(data);
  await load();
  return data;
}

/** La proposition va changer, ou a changé : la revue faite ne vaut plus. */
const outdated = () => {
  if (review === 'ok' || review === 'ko') review = 'stale';
};

$('p-refresh').onclick = () => {
  outdated();
  run({
    ...REFRESH,
    button: $('p-refresh'),
    payload: {
      source: source(),
      force: $('p-force').checked,
      noPull: $('p-nopull').checked,
      collect: $('p-collect').checked,
      news: $('p-news').checked,
    },
  });
};

// Pas de `outdated()` : le scrape ne touche pas la proposition d'extraction.
$('p-get-news').onclick = () => run({ ...NEWS, button: $('p-get-news'), payload: {} });

$('p-dry').onclick = () => {
  const box = $('p-review');
  box.textContent = '';
  sheet = null;
  renderSheet();
  // La sortie brute, dépliée tant qu'elle court.
  $('p-raw').hidden = false;
  $('p-raw').open = true;
  run({
    ...DRY,
    button: $('p-dry'),
    payload: { apply: false },
    // La revue garde SA copie de la sortie : elle reste après la fin.
    onLine: (line) => write(box, line),
    after: (data) => {
      review = data.ok ? 'ok' : 'ko';
      reviewAt = hhmm();
      sheet = (data.ok && data.review) || null;
      // La revue est là : la sortie brute se replie dessous, un clic la rouvre.
      $('p-raw').open = !sheet?.ok;
      renderSheet();
    },
  });
};

// « voir » : la cible d'Extraction dont c'est le fichier.
$('p-rev').addEventListener('click', (e) => {
  const to = e.target.closest('[data-go]')?.dataset.go;
  if (to) sections.go(to);
});

// Pas de confirmation : le dry-run EST la revue, et la promotion se défait par git.
$('p-apply').onclick = () =>
  run({
    ...APPLY,
    button: $('p-apply'),
    payload: { apply: true },
    after: (data) => {
      review = data.ok ? 'applied' : 'stale';
      reviewAt = hhmm();
    },
  });

$('p-commit').onclick = () =>
  run({
    ...COMMIT,
    button: $('p-commit'),
    payload: { message: $('p-message').value.trim(), bump: $('p-bump').value },
  });

// « Arrêter » : SIGTERM au travail en cours. Sa réponse va dans la console —
// le journal, lui, appartient au geste, qui se clôt seul en « arrêté ».
$('p-stop').onclick = async () => {
  const button = $('p-stop');
  button.disabled = true;
  try {
    const res = await fetch('/api/patch/stop', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    const out = await res.json();
    print(out.ok ? `— arrêt demandé : ${out.stopped}` : `— ${out.error ?? 'arrêt refusé'}`);
  } catch (e) {
    print(`— arrêt impossible : ${e}`);
  }
  button.disabled = false;
  // Un travail lancé ailleurs : c'est l'état qui dira qu'il est fini.
  if (!running) load();
};

const COPY = 'Copier';
let copyTimer;

// « Copier » : toute la sortie reçue, pas seulement ce que la console affiche.
$('p-copy').onclick = async () => {
  const button = $('p-copy');
  let said = 'copié';
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
  } catch {
    said = 'impossible';
  }
  button.textContent = said;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (button.textContent = COPY), 2000);
};

$('p-clear').onclick = () => {
  lines.length = 0;
  $('p-console').textContent = '';
  render();
};

$('p-message').oninput = render;
for (const radio of document.querySelectorAll('input[name="p-source"]')) radio.onchange = render;

// Le message de tous les patchs, au jour du poste : à retoucher si besoin.
{
  const now = new Date();
  const two = (n) => String(n).padStart(2, '0');
  $('p-message').value = `chore(data): patch du ${two(now.getDate())}/${two(now.getMonth() + 1)}`;
}

sections.register('patch', {
  // À chaque venue à l'écran : un travail lancé avant s'y lit, sans sa sortie.
  open: load,
  // Recharger la page pendant un geste lancé d'ici en perdrait la sortie.
  dirty: () => running !== null,
});
