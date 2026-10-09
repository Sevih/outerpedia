// Onglet « Tableau de bord » : l'accueil de quick — ce qui demande une action.
// Il montre et renvoie, il ne fait rien : aucune route n'est postée d'ici.
import { $, GROUPS, esc, gitBar, log, sections, state } from '../lib.js';

// `/api/dashboard` : cinq blocs indépendants (`inbox`, `git`, `game`,
// `banners`, `coupons`), chacun `null` avec sa raison dans `errors` quand sa
// lecture a levé, et `today`, le jour UTC du serveur.
let seq = 0;

/** Les teintes qu'une pastille sait prendre ; le reste est neutre. */
const TONES = new Set(['ok', 'warn', 'danger', 'info', 'muted']);

const plural = (n, one, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

/** Une ligne : la pastille de la teinte, puis son contenu. `tint` teinte aussi le libellé. */
const row = (tone, html, tint = false) => {
  const t = TONES.has(tone) ? tone : 'muted';
  return `<li class="h-row ${t}${tint ? ' tint' : ''}"><i class="dot ${t}" aria-hidden="true"></i>${html}</li>`;
};
const label = (text) => `<span class="h-label">${esc(text)}</span>`;
const detail = (text) => `<span class="h-detail">${esc(text)}</span>`;
const list = (rows) => `<ul class="h-list">${rows.join('')}</ul>`;
const note = (text, cls = '') => `<p class="h-note${cls ? ` ${cls}` : ''}">${esc(text)}</p>`;
/** Un bloc que le serveur n'a pas pu lire : sa raison, dans SA carte. */
const unreadable = (error) => note(`Illisible : ${error ?? 'erreur inconnue'}`, 'ko');

const hasSection = (id) => GROUPS.some((g) => g.sections.some((s) => s.id === id));
const goButton = (tab, text) =>
  `<button class="btn ghost sm h-end" data-go="${esc(tab)}">${esc(text)}</button>`;

// Le visage du jeu, comme dans Bannières ; décoratif, le nom est à côté.
const face = (id) =>
  `<img class="face" src="${esc(state.imgBase)}/images/characters/faceicon/FI_${esc(id)}.webp" alt="" aria-hidden="true" width="24" height="24" loading="lazy" />`;

// ------------------------------------------------------ « À faire »
/**
 * L'inbox de l'admin, dans son ordre : la plus urgente d'abord. Un item que
 * quick sait situer (`sheet` : les tags morts d'un perso) ouvre sa fiche dans
 * un nouvel onglet — elle ne lit `#character/<id>/<sous-onglet>` qu'à son
 * chargement, et la page d'ici garde ce qu'elle a en attente.
 */
function renderInbox(inbox, error) {
  $('h-inbox-count').innerHTML = inbox?.length
    ? `<span class="badge ${inbox.some((i) => i.tone === 'danger') ? 'ko' : 'warn'}">${inbox.length}</span>`
    : '';
  if (!inbox) return ($('h-inbox').innerHTML = unreadable(error));
  $('h-inbox').innerHTML = inbox.length
    ? list(
        inbox.map((item) =>
          row(
            item.tone,
            label(item.label) +
              detail(item.detail) +
              (item.sheet
                ? `<a class="h-out" href="#${esc(item.sheet)}" target="_blank" rel="noopener">fiche du perso ↗</a>`
                : item.inQuick
                  ? goButton(item.tab, 'Ouvrir')
                  : `<a class="h-out" href="${esc(item.href)}" target="_blank" rel="noopener">dans l’admin ↗</a>`),
          ),
        ),
      )
    : '<div class="empty">Rien à faire.</div>';
}

// ------------------------------------------------------ « Dépôt »
/** Le compte de « Pousser », la règle de `gitBar` : pas d'amont, du retard, N à pousser. */
function renderGit(git, error) {
  $('h-git-branch').textContent = git?.branch ?? '';
  if (!git) return ($('h-git').innerHTML = unreadable(error));
  const commits = (n) => plural(n, 'commit');
  const rows = [];
  if (git.ahead === null)
    rows.push(row('muted', label('pas d’amont') + detail('rien ne peut partir d’ici')));
  else
    rows.push(
      git.ahead
        ? row(
            'info',
            label(`${commits(git.ahead)} à pousser`) + detail('« Pousser », dans l’en-tête'),
          )
        : row('ok', label('rien à pousser')),
    );
  if (git.ahead !== null && git.behind > 0)
    rows.push(
      row(
        'warn',
        label(`${commits(git.behind)} de retard sur origin`) +
          detail('`git pull --rebase` d’abord, au terminal'),
        true,
      ),
    );
  if (git.last)
    rows.push(
      row(
        'muted',
        `<span class="mono">${esc(git.last.hash)}</span>${detail(`${git.last.subject} · ${git.last.when}`)}`,
      ),
    );
  // Un compte, sans risque derrière : `commitPaths` ne committe que ses chemins.
  rows.push(
    git.dirty
      ? row(
          'warn',
          label(plural(git.dirty, 'fichier modifié', 'fichiers modifiés')) +
            detail('ou non suivis — un enregistrement ne committe que ses fichiers'),
          true,
        )
      : row('ok', label('aucun fichier modifié')),
  );
  $('h-git').innerHTML = list(rows);
}

// ------------------------------------------------------ « Jeu »
/** La version du site contre celle du client installé, et la proposition en attente. */
function renderGame(game, error) {
  if (!game) return ($('h-game').innerHTML = unreadable(error));
  const versions = label(`site ${game.site} · client ${game.version ?? '—'}`);
  const rows = [];
  if (game.client === 'same') rows.push(row('ok', versions + detail('à jour'), true));
  else if (game.client === 'ahead')
    rows.push(
      row(
        'warn',
        versions +
          (hasSection('patch')
            ? detail('un patch attend') + goButton('patch', 'Onglet Patch')
            : detail('un patch attend : onglet Patch')),
        true,
      ),
    );
  else if (game.client === 'behind')
    rows.push(row('muted', versions + detail('le client de ce poste est en retard'), true));
  else rows.push(row('muted', versions + detail('pas de client Steam sur ce poste'), true));
  if (game.proposal)
    rows.push(
      row(
        'warn',
        label('proposition d’extraction en attente') +
          detail('data/extracted/ : à revoir, puis promouvoir'),
        true,
      ),
    );
  $('h-game').innerHTML = list(rows);
}

// ------------------------------------------------------ « Bannières », « Codes promo »
/** Comme l'onglet Bannières : « 12 j restants », « dernier jour » à zéro. */
const left = (n) => (n ? `${n} j restant${n > 1 ? 's' : ''}` : 'dernier jour');

function renderBanners(banners, error) {
  $('h-banners-count').innerHTML = banners
    ? (banners.active.length
        ? `<span class="badge active">${plural(banners.active.length, 'active')}</span>`
        : '') +
      (banners.upcoming.length
        ? `<span class="badge upcoming">${banners.upcoming.length} à venir</span>`
        : '')
    : '';
  if (!banners) return ($('h-banners').innerHTML = unreadable(error));
  const rows = [
    ...banners.active.map((b) =>
      row(
        'ok',
        `${face(b.id)}${label(b.name)}<span class="badge active h-end">${left(b.daysLeft)}</span>`,
      ),
    ),
    ...banners.upcoming.map((b) =>
      row(
        'info',
        `${face(b.id)}${label(b.name)}<span class="badge upcoming h-end">dans ${b.inDays} j</span>`,
      ),
    ),
  ];
  const todo = [
    banners.missing ? `${banners.missing} à insérer` : '',
    banners.drift ? `${banners.drift} à aligner` : '',
  ].filter(Boolean);
  if (todo.length)
    rows.push(row('warn', label(todo.join(' · ')) + detail('d’après la table du jeu'), true));
  $('h-banners').innerHTML =
    (rows.length ? list(rows) : note('Aucune bannière active ni à venir.')) +
    (banners.gameError ? note(banners.gameError) : '');
}

function renderCoupons(coupons, error) {
  $('h-coupons-count').innerHTML = coupons
    ? `<span class="badge ${coupons.active ? 'active' : 'off'}">${plural(coupons.active, 'actif')}</span>`
    : '';
  if (!coupons) return ($('h-coupons').innerHTML = unreadable(error));
  $('h-coupons').innerHTML =
    (coupons.expiring.length
      ? list(
          coupons.expiring.map((c) =>
            row(
              'warn',
              `<span class="mono h-label">${esc(c.code)}</span><span class="badge warn h-end">${
                c.daysLeft ? `expire dans ${c.daysLeft} j` : 'dernier jour'
              }</span>`,
            ),
          ),
        )
      : note(`Aucun code n’expire sous ${coupons.within} jours.`)) +
    // R2 injoignable : le compte est celui de l'instantané local.
    (coupons.error ? note(`${coupons.error} — instantané local.`) : '');
}

// ------------------------------------------------------ la lecture
function render(data) {
  const errors = data.errors ?? {};
  $('h-today').textContent = data.today ? `au ${data.today} (UTC)` : '';
  renderInbox(data.inbox, errors.inbox);
  renderGit(data.git, errors.git);
  renderGame(data.game, errors.game);
  renderBanners(data.banners, errors.banners);
  renderCoupons(data.coupons, errors.coupons);
  // L'en-tête dit le même compte : un commit fait au terminal s'y voit aussi.
  if (data.git) gitBar(data.git);
}

/** Relit `/api/dashboard`. Seule la DERNIÈRE demande se dessine. */
async function load() {
  const mine = ++seq;
  const btn = $('h-refresh');
  btn.disabled = true;
  btn.classList.add('busy');
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    if (!res.ok) throw new Error(data.log?.[0] ?? data.error ?? 'réponse en erreur');
    if (mine === seq) render(data);
  } catch (e) {
    if (mine === seq) log([`Tableau de bord illisible : ${e}`], false);
  } finally {
    if (mine === seq) {
      btn.disabled = false;
      btn.classList.remove('busy');
    }
  }
}

$('h-refresh').onclick = load;

// Les boutons qui renvoient à une section de quick.
$('tab-dashboard').onclick = (e) => {
  const to = e.target.closest('[data-go]')?.dataset.go;
  if (to) sections.go(to);
};

// Un geste a committé ou poussé (`post()` de `lib.js`) : le tableau se relit
// s'il est à l'écran — caché, il se relira en revenant (`open`).
document.addEventListener('quick:saved', () => {
  if (!$('tab-dashboard').hidden) load();
});

sections.register('dashboard', {
  // À chaque venue à l'écran : au démarrage si c'est lui qui s'ouvre, puis à
  // chaque retour sur l'onglet.
  open: load,
});
