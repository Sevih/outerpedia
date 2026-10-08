/**
 * quick/ui/lib — ce que les sections de la page ont en commun : les helpers
 * (`$`, `esc`, `log`, `post`), l'état de `/api/state`, le bouton « Pousser » de
 * l'en-tête (`gitBar`), le menu à deux niveaux (`GROUPS`) et le registre des
 * sections avec la bascule.
 *
 * UNE SECTION = UN ONGLET, dans ses fichiers : `tabs/<nom>.html` (son markup,
 * posé dans la page par `ui-serve.ts`), `tabs/<nom>.css` (son style) et
 * `tabs/<nom>.js` (un module que `index.html` importe). Les sections ne se
 * connaissent pas : chacune s'inscrit ici (`sections.register`) et dit ce que la
 * page doit savoir d'elle — comment se charger, si elle a du travail en attente,
 * si on peut la quitter. Ajouter une section : une entrée dans `GROUPS`, ses
 * trois fichiers, son marqueur et ses deux lignes dans `index.html`.
 *
 * Servi tel quel par `GET /ui/…` (`no-store`) : du JavaScript nu, sans build —
 * éditer et rafraîchir suffit.
 */

export const $ = (id) => document.getElementById(id);

/**
 * Le menu. Un GROUPE = un onglet de l'en-tête ; ses SECTIONS = la rangée du
 * dessous. `wide` : la section prend toute la largeur de la fenêtre (le
 * `<main>` est sinon centré à 1200 px). `soon` : le groupe est annoncé mais
 * vide — quick doit absorber à terme les éditeurs, les guides et les outils de
 * l'admin, et la place se voit dès maintenant.
 */
export const GROUPS = [
  {
    id: 'publication',
    label: 'Publication',
    sections: [
      { id: 'coupons', label: 'Codes promo' },
      { id: 'banners', label: 'Bannières' },
      { id: 'comics', label: '4-comics' },
      { id: 'videos', label: 'Vidéos' },
      { id: 'discord', label: 'Discord', wide: true },
    ],
  },
  {
    id: 'data',
    label: 'Données',
    sections: [
      { id: 'ranks', label: 'Rangs', wide: true },
      { id: 'gear', label: 'Gear reco', wide: true },
    ],
  },
  { id: 'editors', label: 'Éditeurs', soon: true, sections: [] },
  { id: 'guides', label: 'Guides', soon: true, sections: [] },
  { id: 'tools', label: 'Outils', sections: [{ id: 'names', label: 'Noms' }] },
];

/**
 * `/api/state`, demandé une fois au démarrage (`sections.start`) : codes promo,
 * catalogue des récompenses, langues des 4-comics et plafond d'un envoi, cibles
 * des vidéos, ce que `.env.local` permet, le poste, la base des images et
 * l'état de git. Les sections qui en dépendent attendent `stateLoaded`.
 */
export const state = {
  coupons: [],
  rewards: [],
  langs: [],
  targets: { characters: [], guides: [] },
  imgBase: 'https://img.outerpedia.com',
};
let loaded;
export const stateLoaded = new Promise((resolve) => (loaded = resolve));

/** Une pastille de service : prête ou absente, et pourquoi, au survol. */
const service = (id, ok, yes, no) => {
  const pill = $(id);
  pill.classList.toggle('ok', ok);
  pill.title = ok ? yes : no;
  pill.querySelector('.dot').className = ok ? 'dot ok' : 'dot';
};

const plural = (n) => `${n} commit${n > 1 ? 's' : ''}`;

/** Le dernier état de git posé : « Pousser » y revient si sa réponse se perd. */
let lastGit = null;

/**
 * Le bouton « Pousser » de l'en-tête, d'après `{ branch, ahead, behind }`
 * (`gitState` côté serveur) : le compte des commits en attente, éteint à zéro.
 * Les enregistrements ne font que committer ; lui seul pousse, et lance la CI.
 *
 * `behind` est ce que le dépôt sait sans `git fetch` : s'il y a du retard, le
 * push sera refusé — le bouton le dit (badge ambre, `title`) sans s'éteindre,
 * le refus du journal donnant la marche à suivre. `ahead` à `null` : la branche
 * n'a pas d'amont, rien ne peut partir d'ici.
 */
export const gitBar = (git) => {
  lastGit = git;
  const btn = $('push');
  const count = $('push-count');
  const none = git.ahead === null;
  const late = !none && git.behind > 0;
  count.textContent = none ? 'pas d’amont' : String(git.ahead);
  count.classList.toggle('warn', late);
  btn.disabled = !git.ahead;
  btn.title = none
    ? `La branche ${git.branch} n’a pas d’amont : rien à pousser d’ici`
    : late
      ? `${plural(git.behind)} sur origin que tu n’as pas : \`git pull --rebase\` d’abord`
      : git.ahead
        ? `${plural(git.ahead)} à pousser sur ${git.branch} — lance la CI`
        : 'Rien à pousser';
};

async function loadState() {
  Object.assign(state, await (await fetch('/api/state')).json());
  if (state.git) gitBar(state.git);
  service('svc-r2', state.hasR2, 'Bucket R2 joignable', 'R2_BUCKET absent de .env.local');
  service(
    'svc-youtube',
    state.hasYoutubeKey,
    'Clé YouTube présente',
    'YOUTUBE_API_KEY absente de .env.local : pas de recherche sur la chaîne',
  );
  service(
    'svc-discord',
    state.hasDiscord,
    'Jeton du bot présent',
    "Pas de jeton : l'onglet Discord est en lecture",
  );
  $('env').textContent = `${state.host} · :${state.port}`;
  loaded();
}

export const esc = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** L'icône d'un item ou d'une monnaie du catalogue (24 px), ou rien. */
export const itemIcon = (icon) =>
  icon
    ? `<img class="ico" src="${esc(state.imgBase)}/images/items/${esc(icon)}.webp" alt="" aria-hidden="true" width="24" height="24" />`
    : '';

// ------------------------------------------------------ journal
const COPY = 'Copier';

/** Les lignes du journal, telles que « Copier » les rend. */
let shown = [];

/** Déplié, la ligne laisse sa place au titre : la dernière étape est dans `#log`. */
const journalOpen = (open) => {
  $('log').hidden = !open;
  $('journal-last').hidden = open;
  $('journal-title').hidden = !open;
  $('journal-toggle').setAttribute('aria-expanded', String(open));
};

/**
 * `ok` à `undefined` = opération EN COURS : les lignes restent neutres,
 * elles ne sont ni un succès ni un échec tant que rien n'est tranché.
 * `doing` est l'étape commencée, affichée en dernière ligne et remplacée
 * par la suivante — l'empiler doublerait la longueur du journal.
 *
 * Le journal est une bande en haut de la page, absente au repos, et il a
 * deux visages. Tant que l'opération court (`run`) et quand elle passe
 * (`ok`) : UNE ligne — l'étape en cours, pastille qui bat, puis la dernière
 * ligne, verte, l'action faite. Quand elle échoue (`ko`) : TOUT le journal,
 * déplié d'office, la dernière ligne en rouge, et « Copier ». Chaque appel
 * repart de zéro, et la page remonte au journal quand l'opération est finie.
 */
export const log = (lines, ok, doing) => {
  const esc = (l) => String(l).replace(/</g, '&lt;');
  const state = ok === undefined ? (doing || lines.length ? 'run' : 'idle') : ok ? 'ok' : 'ko';
  const done = state === 'ok' || state === 'ko';
  shown = doing ? [...lines, doing] : [...lines];
  // Les étapes passées restent neutres : seule la dernière porte l'état.
  const cls = done ? state : doing ? 'run' : '';
  $('log').innerHTML = shown
    .map((l, i) => `<div class="${i === shown.length - 1 ? cls : ''}">${esc(l)}</div>`)
    .join('');
  const journal = $('journal');
  journal.dataset.state = state;
  journal.hidden = state === 'idle';
  $('journal-last').textContent = shown[shown.length - 1] ?? '';
  $('journal-dot').className = `dot ${state === 'idle' ? '' : state}`;
  $('journal-copy').hidden = state !== 'ko';
  journalOpen(state === 'ko');
  $('log').scrollTop = $('log').scrollHeight;
  // On a pu défiler (Gear reco, Discord) : `nearest` ne bouge rien s'il se voit.
  if (done) journal.scrollIntoView({ block: 'nearest' });
};

let copyTimer;

/**
 * « Copier » : le journal en texte brut dans le presse-papiers. Le bouton dit
 * deux secondes ce qu'il en a été — « impossible » si la permission est
 * refusée ou la page non sécurisée (`navigator.clipboard` y manque).
 */
async function copyJournal() {
  const btn = $('journal-copy');
  let said = 'copié';
  try {
    await navigator.clipboard.writeText(shown.join('\n'));
  } catch {
    said = 'impossible';
  }
  btn.textContent = said;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (btn.textContent = COPY), 2000);
}

/** Branche la ligne — elle déplie, sauf pendant une opération — et « Copier ». */
export const journalWire = () => {
  $('journal-toggle').onclick = () => {
    if ($('journal').dataset.state !== 'run') journalOpen($('log').hidden);
  };
  $('journal-copy').onclick = copyJournal;
};

/**
 * Lit la réponse AU FIL (NDJSON, cf. `stream` dans server.ts) : chaque
 * étape s'affiche dès qu'elle est franchie. Le journal existait déjà mais
 * arrivait d'un bloc au retour — déposer une 4-comic laissait donc deux
 * minutes de texte figé, où rien ne distinguait une étape lente d'un
 * plantage.
 *
 * Une réponse JSON d'une seule pièce (un 409 d'etag, `/api/quit`) n'a ni
 * `step` ni `done` : elle EST le résultat. Les deux formes se lisent donc
 * ici, plutôt qu'en tenant à jour la liste des routes qui streament.
 *
 * Un geste qui committe (et « Pousser ») rend aussi `git`, l'état d'après :
 * le bouton de l'en-tête se met à jour ici, aucune section n'a rien à faire.
 */
export async function post(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  const steps = [];
  let doing = null;
  let done = null;
  let buf = '';

  const eat = (raw) => {
    if (!raw.trim()) return;
    const m = JSON.parse(raw);
    if (m.done) done = m.done;
    else if (m.doing) doing = m.step;
    else if (m.step !== undefined) {
      steps.push(m.step);
      doing = null;
    } else done = m;
    log(steps, done ? done.ok : undefined, doing);
  };

  for (;;) {
    const { value, done: end } = await reader.read();
    if (end) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n');
    buf = parts.pop(); // ligne encore incomplète : elle attend la suite
    for (const p of parts) eat(p);
  }
  eat(buf); // réponse sans saut de ligne final (JSON d'une seule pièce)

  const data = done ?? { ok: false, log: ['réponse interrompue'] };
  log(data.log ?? [data.error ?? 'erreur'], data.ok);
  if (data.git) gitBar(data.git);
  return data;
}

// ------------------------------------------------------ sections
const registry = new Map();

/** Le groupe d'une section, par son id. */
const groupOf = (tab) => GROUPS.find((g) => g.sections.some((s) => s.id === tab));

/** Les deux rangées du menu, d'après `GROUPS`. */
function buildMenu() {
  $('groups').innerHTML = GROUPS.map((g) =>
    g.soon
      ? `<button class="gtab soon" disabled title="Pas encore dans quick">${g.label} <span class="badge soon">à venir</span></button>`
      : `<button class="gtab" data-group="${g.id}" aria-selected="false">${g.label}</button>`,
  ).join('');
  $('tabs').innerHTML = GROUPS.flatMap((g) =>
    g.sections.map(
      (s) =>
        `<button class="tab" data-tab="${s.id}" data-group="${g.id}" aria-selected="false" hidden>${s.label}</button>`,
    ),
  ).join('');
}

export const sections = {
  /**
   * Inscrit la section `name` — son id dans `GROUPS`, et `tab-<name>` l'id de
   * sa `<section>`. Tout est facultatif :
   *   - `init()`     : son chargement, appelé une fois au démarrage ;
   *   - `dirty()`    : vrai tant qu'elle porte du travail non enregistré (le
   *                    navigateur demande alors avant de recharger la page) ;
   *   - `canLeave()` : faux pour rester sur elle (à elle de demander confirmation).
   */
  register(name, section) {
    registry.set(name, section);
  },

  /** Branche le menu et la page, puis charge les sections dans l'ordre d'inscription. */
  start() {
    buildMenu();
    const groups = [...document.querySelectorAll('#groups button[data-group]')];
    const tabs = [...document.querySelectorAll('#tabs button[data-tab]')];
    const panels = [...document.querySelectorAll('main > section')];
    let current = null;

    const show = (tab) => {
      const group = groupOf(tab);
      const wide = Boolean(group?.sections.find((s) => s.id === tab)?.wide);
      for (const b of groups)
        b.setAttribute('aria-selected', String(b.dataset.group === group?.id));
      for (const b of tabs) {
        b.hidden = b.dataset.group !== group?.id;
        b.setAttribute('aria-selected', String(b.dataset.tab === tab));
      }
      for (const s of panels) s.hidden = s.id !== `tab-${tab}`;
      document.querySelector('main').classList.toggle('wide', wide);
      current = tab;
    };
    const go = (tab) => {
      if (tab === current) return;
      if (!(registry.get(current)?.canLeave?.() ?? true)) return;
      show(tab);
      // La section ouverte est dans l'adresse : recharger y revient.
      history.replaceState(null, '', `#${tab}`);
    };
    for (const b of tabs) b.onclick = () => go(b.dataset.tab);
    // Un groupe ouvre sa première section.
    for (const b of groups)
      b.onclick = () => go(GROUPS.find((g) => g.id === b.dataset.group).sections[0].id);

    // `#ranks` ouvre « Rangs », groupe compris. Hash absent ou inconnu : la
    // page reste sur la section que son HTML laisse visible, la première.
    const wanted = location.hash.slice(1);
    const open = panels.find((s) => !s.hidden)?.id.slice(4);
    show(groupOf(wanted) ? wanted : open);

    // Du travail en attente ne survit pas à un rechargement de la page.
    window.onbeforeunload = (e) => {
      if ([...registry.values()].some((s) => s.dirty?.())) e.preventDefault();
    };

    journalWire();

    // « Pousser » : le journal suit, et `post` repose le bouton d'après l'état
    // rendu. Réponse perdue : il revient à ce qu'il montrait.
    $('push').onclick = async () => {
      const btn = $('push');
      btn.disabled = true;
      btn.classList.add('busy');
      log([], undefined, 'git push');
      try {
        await post('/api/push', {});
      } finally {
        btn.classList.remove('busy');
        if (lastGit) gitBar(lastGit);
      }
    };

    // Arrêt : lancé par l'icône, l'outil n'a aucune fenêtre pour le faire.
    $('quit').onclick = async () => {
      await post('/api/quit', {});
      document.body.style.opacity = 0.5;
      for (const b of document.querySelectorAll('button')) b.disabled = true;
    };

    for (const s of registry.values()) s.init?.();
    loadState();
  },
};
