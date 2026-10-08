// Onglet « Patch » : la chaîne des données à chaque patch du jeu, en quatre
// gestes — rafraîchir, relire la promotion (dry-run), promouvoir, committer.
// Chacun lance UNE commande du dépôt côté serveur (`patch.ts`), un seul travail
// à la fois ; sa sortie arrive ligne à ligne dans la console du bas.
import { $, gitBar, log, post, sections } from '../lib.js';

/** Les quatre gestes : leur nom dans le journal, et leur route. */
const REFRESH = { label: 'rafraîchissement depuis le jeu', path: '/api/patch/refresh' };
const DRY = { label: 'dry-run de la promotion', path: '/api/patch/promote' };
const APPLY = { label: 'promotion de l’extraction', path: '/api/patch/promote' };
const COMMIT = { label: 'commit des données', path: '/api/patch/commit' };

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

function renderReview() {
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
 * l'issue avant ce redessin.
 */
async function run({ label, path, payload, button, onLine, after }) {
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

$('p-dry').onclick = () => {
  const box = $('p-review');
  box.textContent = '';
  box.hidden = false;
  run({
    ...DRY,
    button: $('p-dry'),
    payload: { apply: false },
    // La revue garde SA copie de la sortie : elle reste après la fin.
    onLine: (line) => write(box, line),
    after: (data) => {
      review = data.ok ? 'ok' : 'ko';
      reviewAt = hhmm();
    },
  });
};

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
