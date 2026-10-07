/**
 * quick/ui/lib — ce que les sections de la page ont en commun : les helpers
 * (`$`, `esc`, `log`, `post`), l'état de `/api/state`, et le registre des
 * sections avec la bascule du menu.
 *
 * UNE SECTION = UN ONGLET, dans ses deux fichiers : `tabs/<nom>.html` (son
 * markup, posé dans la page par `ui-serve.ts`) et `tabs/<nom>.js` (un module
 * que `index.html` importe). Les sections ne se connaissent pas : chacune
 * s'inscrit ici (`sections.register`) et dit ce que la page doit savoir d'elle
 * — comment se charger, si elle a du travail en attente, si on peut la quitter.
 *
 * Servi tel quel par `GET /ui/…` (`no-store`) : du JavaScript nu, sans build —
 * éditer et rafraîchir suffit.
 */

export const $ = (id) => document.getElementById(id);

/**
 * `/api/state`, demandé une fois au démarrage (`sections.start`) : codes promo,
 * catalogue des récompenses, langues des 4-comics et plafond d'un envoi, cibles
 * des vidéos, et ce que `.env.local` permet. Les sections qui en dépendent
 * attendent `stateLoaded`.
 */
export const state = {
  coupons: [],
  rewards: [],
  langs: [],
  targets: { characters: [], guides: [] },
};
let loaded;
export const stateLoaded = new Promise((resolve) => (loaded = resolve));

async function loadState() {
  Object.assign(state, await (await fetch('/api/state')).json());
  $('env').textContent =
    `${state.hasR2 ? 'R2 ✓' : 'R2 ✗'} · ${state.hasYoutubeKey ? 'YouTube ✓' : 'YouTube ✗'}`;
  loaded();
}

export const esc = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * `ok` à `undefined` = opération EN COURS : les lignes restent neutres,
 * elles ne sont ni un succès ni un échec tant que rien n'est tranché.
 * `doing` est l'étape commencée, affichée en dernière ligne et remplacée
 * par la suivante — l'empiler doublerait la longueur du journal.
 */
export const log = (lines, ok, doing) => {
  const cls = ok === undefined ? '' : ok ? 'ok' : 'ko';
  const esc = (l) => String(l).replace(/</g, '&lt;');
  $('log').innerHTML =
    lines.map((l) => `<div class="${cls}">${esc(l)}</div>`).join('') +
    (doing ? `<div class="run">${esc(doing)}</div>` : '');
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
  return data;
}

// ------------------------------------------------------ sections
const registry = new Map();

export const sections = {
  /**
   * Inscrit la section `name` — le `data-tab` de son bouton, et `tab-<name>`
   * l'id de sa `<section>`. Tout est facultatif :
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
    const buttons = [...document.querySelectorAll('nav button')];
    const show = (b) => {
      for (const o of buttons) o.setAttribute('aria-selected', String(o === b));
      for (const s of document.querySelectorAll('main section'))
        s.hidden = s.id !== `tab-${b.dataset.tab}`;
    };
    for (const b of buttons) {
      b.onclick = () => {
        const from = document.querySelector('nav button[aria-selected="true"]');
        if (from !== b && !(registry.get(from.dataset.tab)?.canLeave?.() ?? true)) return;
        show(b);
        // La section ouverte est dans l'adresse : recharger y revient.
        history.replaceState(null, '', `#${b.dataset.tab}`);
      };
    }
    // `#ranks` ouvre « Rangs ». Hash absent ou inconnu : la page reste sur la
    // section que son HTML ouvre, la première.
    const wanted = buttons.find((b) => b.dataset.tab === location.hash.slice(1));
    if (wanted) show(wanted);

    // Du travail en attente ne survit pas à un rechargement de la page.
    window.onbeforeunload = (e) => {
      if ([...registry.values()].some((s) => s.dirty?.())) e.preventDefault();
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
