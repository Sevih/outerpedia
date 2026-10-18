/**
 * quick/ui/lib — ce que les sections de la page ont en commun : les helpers
 * (`$`, `esc`, `log`, `post`), l'état de `/api/state`, le bouton « Pousser » de
 * l'en-tête (`gitBar`), le menu à deux niveaux (`GROUPS`), ses pastilles
 * (`/api/badges`) et le registre des sections avec la bascule.
 *
 * UNE SECTION = UN ONGLET, dans ses fichiers : `tabs/<nom>.html` (son markup,
 * posé dans la page par `ui-serve.ts`), `tabs/<nom>.css` (son style) et
 * `tabs/<nom>.js` (un module que `index.html` importe). Les sections ne se
 * connaissent pas : chacune s'inscrit ici (`sections.register`) et dit ce que la
 * page doit savoir d'elle — comment se charger, quoi faire quand elle vient à
 * l'écran, si elle a du travail en attente, si on peut la quitter. Ajouter une
 * section : une entrée dans `GROUPS`, ses trois fichiers, son marqueur et ses
 * deux lignes dans `index.html`.
 *
 * Servi tel quel par `GET /ui/…` (`no-store`) : du JavaScript nu, sans build —
 * éditer et rafraîchir suffit.
 */

export const $ = (id) => document.getElementById(id);

/**
 * Le menu. Un GROUPE = un onglet de l'en-tête ; ses SECTIONS = la rangée du
 * dessous. Le premier groupe est l'accueil : sa première section est celle
 * que la page ouvre. `wide` : la section prend toute la largeur de la fenêtre
 * (le `<main>` est sinon centré à 1200 px). `soon` : le groupe est annoncé mais
 * vide — quick doit absorber à terme tout l'admin, et la place se voit dès
 * maintenant (plus aucun groupe ne l'est depuis le 11/10 : Guides a sa section).
 */
export const GROUPS = [
  {
    id: 'home',
    label: 'Accueil',
    sections: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'patch', label: 'Patch', wide: true },
    ],
  },
  {
    id: 'publication',
    label: 'Publication',
    sections: [
      { id: 'coupons', label: 'Codes promo' },
      { id: 'banners', label: 'Bannières' },
      { id: 'events', label: 'Événements', wide: true },
      { id: 'changelog', label: 'Journal du site' },
      { id: 'comics', label: '4-comics' },
      { id: 'discord', label: 'Discord', wide: true },
    ],
  },
  {
    id: 'data',
    label: 'Données',
    sections: [
      { id: 'ranks', label: 'Rangs', wide: true },
      { id: 'gamedata', label: 'Tables du jeu', wide: true },
      { id: 'extractor', label: 'Extraction', wide: true },
    ],
  },
  {
    id: 'editors',
    label: 'Éditeurs',
    sections: [
      { id: 'character', label: 'Fiche perso', wide: true },
      { id: 'effects', label: 'Effets', wide: true },
      { id: 'monsters', label: 'Monstres', wide: true },
      { id: 'items', label: 'Items', wide: true },
    ],
  },
  { id: 'guides', label: 'Guides', sections: [{ id: 'guides', label: 'Guides', wide: true }] },
  { id: 'tools', label: 'Outils', sections: [{ id: 'names', label: 'Noms' }] },
];

/**
 * `/api/state`, demandé une fois au démarrage (`sections.start`) : codes promo,
 * catalogue des récompenses, langues des 4-comics et plafond d'un envoi, ce
 * que `.env.local` permet, le poste, la base des images et l'état de git. Les sections qui en dépendent attendent `stateLoaded`.
 */
export const state = {
  coupons: [],
  rewards: [],
  langs: [],
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

let gitReading = null; // la relecture de `/api/git` en cours : une seule à la fois

/**
 * Relit `GET /api/git` (sans réseau, sans attendre R2) et repose « Pousser » :
 * au retour sur la page — un commit ou un `git pull --rebase` au terminal
 * entre-temps — et après un `post()` coupé, le serveur ayant pu committer
 * avant la coupure. Une seule lecture à la fois ; un échec (quick arrêté, ou
 * lancé avant ce code) ne dit rien et garde le dernier état. Pendant un push,
 * le compte suit mais le bouton reste éteint : pas de second push par-dessus.
 */
export function refreshGit() {
  gitReading ??= fetch('/api/git')
    .then((res) => (res.ok ? res.json() : null))
    .then((git) => {
      if (!git || !('ahead' in git)) return;
      gitBar(git);
      if ($('push').classList.contains('busy')) $('push').disabled = true;
    })
    .catch(() => {})
    .finally(() => {
      gitReading = null;
    });
  return gitReading;
}

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
 * Quand il a réussi, la page l'annonce (`quick:saved` sur `document`) : le
 * tableau de bord, s'il est à l'écran, se relit. Les pastilles du menu, elles,
 * ne se relisent (après leur délai, `badgesSoon`) que si le geste a COMMITTÉ
 * (`committed`) : un push ne change pas l'inbox.
 *
 * `onStep` (facultatif) : la section veut les lignes ELLE-MÊME — la sortie
 * d'une commande longue, des milliers de lignes, va dans sa console (« Patch »).
 * Chaque `step` lui est alors remis au lieu d'être empilé ici : le journal ne
 * montre que la ligne en cours, puis le résultat, comme pour tout geste.
 */
/**
 * Un GET en JSON, ou une erreur LISIBLE. L'état d'une section lu sur un
 * serveur qui répond autre chose — le 404 « route inconnue » d'un quick lancé
 * AVANT le code de l'onglet (l'UI est servie à jour depuis le disque, pas le
 * serveur), le 500 du moteur — ne doit pas finir en « data.entries is
 * undefined » : le chemin, le code et le message du serveur, et le remède.
 */
export async function getJson(path) {
  const res = await fetch(path);
  if (res.ok) return res.json();
  let why = `HTTP ${res.status}`;
  try {
    const b = await res.json();
    const said = b.error ?? (Array.isArray(b.log) ? b.log.join(' / ') : '');
    if (said) why += ` — ${said}`;
  } catch {
    /* corps non JSON : le code suffit */
  }
  if (res.status === 404) why += ' (quick lancé avant ce code ? Ctrl-C puis `pnpm quick`)';
  throw new Error(`${path} : ${why}`);
}

/**
 * Le geste a-t-il committé ? Une réponse d'écriture ne porte que `git`, l'état
 * d'APRÈS (`withGit`, server.ts) — aucun `committed` : le signal est le compte
 * de « Pousser » qui MONTE par rapport à celui que l'en-tête montrait avant le
 * geste. Un push le fait descendre, un push refusé ou un enregistrement sans
 * rien à committer le laissent, un lot à moitié refusé qui a committé le reste
 * le monte. Sans amont (`ahead` nul) ou avant le premier état, rien à
 * comparer : la réussite du geste en tient lieu.
 */
const committed = (before, after, ok) =>
  typeof before?.ahead === 'number' && typeof after.ahead === 'number'
    ? after.ahead > before.ahead
    : ok;

export async function post(path, payload, onStep) {
  // Ce que l'en-tête montre AVANT le geste : la réponse dira s'il a committé.
  const before = lastGit;
  const steps = [];
  // Connexion coupée (quick arrêté pendant l'envoi, réseau) : pas de rejet,
  // l'appelant rallume son bouton comme après un refus. Le serveur a pu
  // écrire et committer avant la coupure : le journal le dit, et « Pousser »
  // se relit — `gitBar` n'a ici aucune réponse à poser.
  const cut = (e) => {
    const data = {
      ok: false,
      log: [
        `connexion coupée : ${e instanceof Error ? e.message : String(e)} — l’enregistrement a pu passer, relis l’état avant de recommencer`,
      ],
    };
    log([...steps, ...data.log], false);
    refreshGit();
    return data;
  };
  let res;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return cut(e);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let doing = null;
  let done = null;
  let buf = '';

  const eat = (raw) => {
    if (!raw.trim()) return;
    const m = JSON.parse(raw);
    if (m.done) done = m.done;
    else if (m.doing) doing = m.step;
    else if (m.step !== undefined && onStep) {
      onStep(m.step);
      // Une ligne vide ne remplace pas la ligne en cours du journal.
      if (String(m.step).trim()) doing = m.step;
    } else if (m.step !== undefined) {
      steps.push(m.step);
      doing = null;
    } else done = m;
    log(steps, done ? done.ok : undefined, doing);
  };

  for (;;) {
    let chunk;
    try {
      chunk = await reader.read();
    } catch (e) {
      return cut(e);
    }
    const { value, done: end } = chunk;
    if (end) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n');
    buf = parts.pop(); // ligne encore incomplète : elle attend la suite
    for (const p of parts) eat(p);
  }
  eat(buf); // réponse sans saut de ligne final (JSON d'une seule pièce)

  const data = done ?? { ok: false, log: ['réponse interrompue'] };
  log(data.log ?? [data.error ?? 'erreur'], data.ok);
  if (data.git) {
    gitBar(data.git);
    if (data.ok) document.dispatchEvent(new Event('quick:saved'));
    if (committed(before, data.git, data.ok)) badgesSoon();
  }
  return data;
}

// ------------------------------------------------------ le roster des persos
let heroes = null;

/**
 * Le roster des persos, par id (`/api/character/roster` : la ligne entière —
 * id, nom, rareté, élément, classe —, dans l'ordre du serveur) : LA lecture de
 * la page, partagée. Lu UNE fois, à la première demande — la Fiche perso au
 * démarrage, pour son picker —, puis rendu de mémoire : la même `Map` à chaque
 * appel. Illisible (un quick lancé avant ce code, le moteur), la lecture
 * REJETTE avec sa raison, n'est pas retenue, et la demande suivante réessaie.
 */
export function readHeroRoster() {
  heroes ??= getJson('/api/character/roster')
    .then((r) => new Map(r.roster.map((c) => [c.id, c])))
    .catch((e) => {
      heroes = null;
      throw e;
    });
  return heroes;
}

/**
 * Le même roster, pour ce que la vignette (`heroTile`) lit — son fond de
 * rareté et son coin — dans les sections dont l'état ne porte que des ids
 * (Bannières, Journal du site, Tableau de bord, Noms) : une section le demande
 * en venant à l'écran. Illisible : une `Map` vide, sans un mot au journal — les
 * vignettes restent neutres, rien d'autre n'en dépend.
 */
export const heroRoster = () => readHeroRoster().catch(() => new Map());

// ------------------------------------------------------ sections
const registry = new Map();
/** La bascule de `start`, pour `sections.go`. */
let goTo = null;

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

// ------------------------------------------------------ pastilles du menu
/** La classe de `.badge` d'une teinte de l'inbox ; une teinte inconnue est neutre. */
const BADGE_TONES = { danger: 'ko', warn: 'warn', muted: 'off' };
/** La pire d'abord : la pastille d'un groupe prend la pire de ses sections. */
const TONE_ORDER = ['danger', 'warn', 'muted'];
/**
 * Après une écriture, la relecture attend : dans les deux secondes qui la
 * suivent (`ENGINE_STAMP_TTL_MS`, `admin-inbox.ts`), le diff de l'inbox peut
 * encore être celui d'avant.
 */
const BADGES_AFTER_WRITE_MS = 3000;
let badgeSeq = 0;
let badgeTimer;
/** `#groups` tel que `start` l'a rempli : les pastilles ne se lisent que pour lui. */
let menu = null;

/** Le libellé d'un onglet du menu, et sa pastille quand il y a à faire. */
const menuLabel = (label, badge, title) =>
  badge
    ? `${label} <span class="badge ${BADGE_TONES[badge.tone] ?? 'off'}" title="${esc(title)}">${esc(badge.count)}</span>`
    : label;

/**
 * Pose les pastilles de `/api/badges` (`sections` : `{ <id> : { count, tone } }`)
 * sur les deux rangées : chaque section qui a à faire porte son compte, son
 * groupe la somme des siens et leur pire teinte. Une section absente perd la
 * sienne — le menu redit tout à chaque lecture.
 */
function paintBadges(sections, at) {
  const when = at
    ? ` — relu à ${new Date(at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    : '';
  const title = `À faire, d’après le Tableau de bord${when}`;
  for (const g of GROUPS) {
    const own = g.sections.map((s) => sections[s.id]).filter(Boolean);
    const sum = own.length
      ? {
          count: own.reduce((n, b) => n + b.count, 0),
          tone: TONE_ORDER.find((t) => own.some((b) => b.tone === t)),
        }
      : null;
    const gtab = document.querySelector(`#groups [data-group="${g.id}"]`);
    if (gtab) gtab.innerHTML = menuLabel(g.label, sum, title);
    for (const s of g.sections) {
      const tab = document.querySelector(`#tabs [data-tab="${s.id}"]`);
      if (tab) tab.innerHTML = menuLabel(s.label, sections[s.id], title);
    }
  }
}

/**
 * Relit `/api/badges` et pose les pastilles. Seule la DERNIÈRE demande se
 * dessine. Une lecture qui échoue laisse le menu tel qu'il est, sans un mot :
 * le journal appartient au geste en cours, pas à une pastille. Jamais en
 * boucle — au chargement, en venant au tableau de bord, et après une écriture
 * (`badgesSoon`).
 */
async function loadBadges() {
  const mine = ++badgeSeq;
  clearTimeout(badgeTimer);
  try {
    // Un minuteur qui survit à sa page (les tests en ouvrent une par cas,
    // dans le même processus) n'a plus rien à relire.
    if ($('groups') !== menu) return;
    const res = await fetch('/api/badges');
    if (!res.ok) return;
    const data = await res.json();
    if (mine === badgeSeq) paintBadges(data.sections ?? {}, data.at);
  } catch {
    /* serveur injoignable, réponse illisible : les pastilles restent */
  }
}

/**
 * Une écriture vient d'avoir lieu — un `post()` qui a committé, ou un geste de
 * « Patch » qui écrit dans le dépôt (`quick:changed`) : UNE relecture des
 * pastilles, après le délai. Plusieurs écritures rapprochées n'en font qu'une.
 * Ni « Pousser » ni le dry-run de « Patch » n'en sont : ils n'écrivent rien.
 */
function badgesSoon() {
  clearTimeout(badgeTimer);
  badgeTimer = setTimeout(loadBadges, BADGES_AFTER_WRITE_MS);
}

export const sections = {
  /**
   * Inscrit la section `name` — son id dans `GROUPS`, et `tab-<name>` l'id de
   * sa `<section>`. Tout est facultatif :
   *   - `init()`     : son chargement, appelé une fois au démarrage ;
   *   - `open()`     : appelé chaque fois qu'elle vient à l'écran — au
   *                    démarrage si c'est elle qui s'ouvre, puis à chaque retour ;
   *   - `dirty()`    : vrai tant qu'elle porte du travail non enregistré (le
   *                    navigateur demande alors avant de recharger la page) ;
   *   - `canLeave()` : faux pour rester sur elle (à elle de demander confirmation).
   */
  register(name, section) {
    registry.set(name, section);
  },

  /**
   * Ouvre la section `tab`, groupe compris, comme un clic sur son onglet (la
   * section quittée peut refuser : `canLeave`). Sans effet avant `start`.
   * Un CHEMIN (`extractor/character`) ouvre la section de son premier segment
   * et lui laisse le chemin entier dans l'adresse avant son `open()` : une
   * section qui lit son hash s'ouvre alors sur cet état — même si elle est
   * déjà à l'écran.
   */
  go(tab) {
    goTo?.(tab);
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
    const go = (path) => {
      const tab = path.split('/')[0];
      const within = tab === current && path !== tab;
      if (tab === current && !within) return;
      if (!within && !(registry.get(current)?.canLeave?.() ?? true)) return;
      if (!within) show(tab);
      // La section ouverte est dans l'adresse : recharger y revient. Un chemin
      // y reste entier, pour la section qui le lit à son `open()`.
      history.replaceState(null, '', `#${path}`);
      registry.get(tab)?.open?.();
      // Le tableau de bord se relit en venant à l'écran : les pastilles avec lui.
      if (tab === 'dashboard') loadBadges();
    };
    goTo = go;
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
    registry.get(current)?.open?.();
    loadState();

    // Les pastilles du menu : lues au chargement, puis quand le dépôt a pu
    // changer — `post()` les relance lui-même après un commit, « Patch »
    // l'annonce à la fin d'un geste qui écrit (`quick:changed` sur `document`).
    menu = $('groups');
    loadBadges();
    document.addEventListener('quick:changed', badgesSoon);

    // « Pousser » se relit au retour sur la page : un commit au terminal entre-
    // temps monte le compte sans passer par l'accueil.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshGit();
    });
    window.addEventListener('focus', refreshGit);
  },
};
