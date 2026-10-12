// L'ajout d'une vidéo YouTube, partagé : la carte Vidéos d'une fiche de perso
// et le sous-onglet Vidéos d'un guide portent LE MÊME formulaire — chercher sur
// la chaîne officielle (`GET /api/youtube`, cinq candidats, « choisir » pose
// l'id), une URL ou un id, « ＋ vidéo ». L'ajout est LOCAL : `POST
// /api/character/video-meta` ne fait que lire les métadonnées de YouTube, et la
// vidéo rendue est remise à l'onglet (`onAdd`), qui la pose dans SA liste —
// elle ne part au disque qu'à son « Enregistrer ». Un doublon, un id illisible,
// YouTube injoignable : dits SOUS le formulaire (`.va-err`), pas au journal —
// rien n'a été tenté sur le disque.
import { esc, state, stateLoaded } from './lib.js';

/** La miniature d'une vidéo YouTube, dérivée de son id (jamais stockée). */
export const videoThumb = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;

const NO_KEY = 'YOUTUBE_API_KEY absente de .env.local : pas de recherche sur la chaîne';

/** Le refus que porte une réponse du serveur, ou son code. */
const refusal = (res, body) => body?.error ?? body?.log?.[0] ?? `réponse ${res.status}`;

/**
 * Un formulaire d'ajout, branché UNE fois sur `root` (le panneau de l'onglet,
 * qui se redessine) : `html()` rend son markup sous l'id `id`, la saisie y
 * survit aux redessins.
 *
 * - `label` : le champ « Libellé d'onglet » (un guide ; un perso n'en a pas) ;
 * - `has(id)` : la liste de l'onglet porte déjà cette vidéo ;
 * - `scope()` : ce à quoi l'ajout se destine (le perso, la version du guide) —
 *   s'il a changé pendant l'appel, la réponse est abandonnée ;
 * - `onAdd(video, label)` : la vidéo résolue (`{ id, title, author,
 *   uploadDate }`), à poser dans la liste — l'onglet redessine.
 */
export function videoAdder({ root, id, label = false, has, scope, onAdd }) {
  let q = '';
  let url = '';
  let tab = '';
  let cands = [];
  let said = '';
  let busy = '';

  const host = () => document.getElementById(id);
  const inner = () => {
    const off = state.hasYoutubeKey ? '' : ` disabled title="${esc(NO_KEY)}"`;
    const wait = busy ? ' disabled' : '';
    return `<div class="form">
      <div class="field"><label for="${id}-q">Chercher sur la chaîne officielle</label><input id="${id}-q" class="w-search" data-va="q" placeholder="nom du perso / du boss" value="${esc(q)}"${off} /></div>
      <button class="btn ghost${busy === 'search' ? ' busy' : ''}" type="button" data-va="search"${off || wait}>Chercher</button>
    </div>
    <div class="va-cands">${cands
      .map(
        (c) => `<div class="card va-cand">
        <img src="${esc(videoThumb(c.id))}" alt="" aria-hidden="true" width="120" height="68" loading="lazy" />
        <div><strong>${esc(c.title)}</strong><span>${esc([c.author, c.uploadDate?.slice(0, 10)].filter(Boolean).join(' · '))}</span></div>
        ${
          has(c.id)
            ? '<span class="badge off">déjà dans la liste</span>'
            : `<button class="btn ghost sm" type="button" data-va="pick" data-id="${esc(c.id)}">choisir</button>`
        }
      </div>`,
      )
      .join('')}</div>
    <div class="form">
      <div class="field"><label for="${id}-url">URL ou id YouTube</label><input id="${id}-url" class="w-url" data-va="url" placeholder="https://youtu.be/…" value="${esc(url)}" /></div>
      ${
        label
          ? `<div class="field"><label for="${id}-tab">Libellé d’onglet (option)</label><input id="${id}-tab" class="w-text" data-va="tab" value="${esc(tab)}" /></div>`
          : ''
      }
      <button class="btn ghost${busy === 'add' ? ' busy' : ''}" type="button" data-va="add"${wait}>＋ vidéo</button>
    </div>
    <p class="va-err" data-va-err>${esc(said)}</p>`;
  };
  /** Le formulaire seul, redessiné : le reste de la carte ne bouge pas. Le focus va au premier de `focus` qui existe. */
  const draw = (...focus) => {
    const el = host();
    if (!el) return;
    el.innerHTML = inner();
    focus
      .map((selector) => el.querySelector(selector))
      .find(Boolean)
      ?.focus();
  };

  async function search() {
    if (busy || !q.trim()) return;
    busy = 'search';
    said = '';
    draw();
    try {
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(q.trim())}`);
      const r = await res.json();
      if (!r.candidates) throw new Error(refusal(res, r));
      cands = r.candidates;
      if (!cands.length) said = 'Aucune vidéo de la chaîne officielle ne répond à cette recherche.';
    } catch (e) {
      cands = [];
      said = `Recherche refusée : ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      busy = '';
      draw('[data-va="pick"]', '[data-va="q"]');
    }
  }

  async function add() {
    const raw = url.trim();
    if (busy) return;
    said = '';
    if (!raw) {
      said = 'URL ou id requis.';
      return draw('[data-va="url"]');
    }
    // Un id nu déjà dans la liste (un candidat choisi) : refusé sans appeler YouTube.
    if (has(raw)) {
      said = 'Déjà dans la liste.';
      return draw('[data-va="url"]');
    }
    const at = scope();
    busy = 'add';
    draw();
    let video = null;
    try {
      const res = await fetch('/api/character/video-meta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input: raw }),
      });
      const r = await res.json();
      if (!r.video) throw new Error(refusal(res, r));
      if (has(r.video.id)) throw new Error(`déjà dans la liste (${r.video.title || r.video.id})`);
      video = r.video;
    } catch (e) {
      said = `Vidéo refusée : ${e instanceof Error ? e.message : String(e)}`;
    }
    busy = '';
    // Un autre perso, une autre version pendant l'appel : la vidéo n'est pas pour lui.
    if (scope() !== at) return draw();
    if (!video) return draw('[data-va="url"]');
    const tabLabel = tab.trim();
    url = tab = '';
    cands = [];
    onAdd(video, tabLabel);
  }

  const inside = (e) => {
    const el = host();
    return el && el.contains(e.target) ? el : null;
  };
  root.addEventListener('input', (e) => {
    const field = inside(e) && e.target.closest('input[data-va]');
    if (!field) return;
    const { va } = field.dataset;
    if (va === 'q') q = field.value;
    else if (va === 'url') url = field.value;
    else if (va === 'tab') tab = field.value;
  });
  root.addEventListener('click', (e) => {
    const btn = inside(e) && e.target.closest('button[data-va]');
    if (!btn) return;
    const { va } = btn.dataset;
    if (va === 'search') return search();
    if (va === 'add') return add();
    if (va === 'pick') {
      // Le candidat choisi pose son id : « ＋ vidéo » l'ajoute, comme une URL collée.
      url = btn.dataset.id;
      cands = [];
      said = '';
      draw('[data-va="add"]');
    }
  });
  // Entrée dans un champ : son bouton.
  root.addEventListener('keydown', (e) => {
    const field = e.key === 'Enter' && inside(e) && e.target.closest('input[data-va]');
    if (!field) return;
    e.preventDefault();
    if (field.dataset.va === 'q') search();
    else add();
  });
  // La clé YouTube n'est connue qu'avec `/api/state` : la recherche se dégrise alors.
  stateLoaded.then(() => draw());

  return {
    /** Le formulaire, dans son hôte : à poser dans la carte de l'onglet. */
    html: () => `<div class="va" id="${id}">${inner()}</div>`,
    /** Un autre perso, un autre guide : la saisie et les candidats ne sont plus les siens. */
    reset: () => {
      q = url = tab = said = '';
      cands = [];
    },
  };
}
