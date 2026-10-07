// Onglet « Codes promo ».
import { $, log, post, sections, state, stateLoaded } from '../lib.js';

let pending = []; // récompenses du code en cours de saisie

const rewardName = (id) => state.rewards.find((r) => r.id === id)?.name ?? id;

function status(c) {
  const today = new Date().toISOString().slice(0, 10);
  if (today < c.start) return ['upcoming', 'à venir'];
  if (today > c.end) return ['expired', 'expiré'];
  return ['active', 'actif'];
}

function renderCoupons() {
  const order = { active: 0, upcoming: 1, expired: 2 };
  const rows = [...state.coupons].sort(
    (a, b) => order[status(a)[0]] - order[status(b)[0]] || b.start.localeCompare(a.start),
  );
  $('c-list').innerHTML = rows
    .map((c) => {
      const [cls, label] = status(c);
      const rewards = Object.entries(c.description)
        .map(([k, v]) => `${rewardName(k)} ×${v}`)
        .join(', ');
      return `<tr>
        <td class="code">${c.code}</td>
        <td>${c.start} → ${c.end}</td>
        <td>${rewards}</td>
        <td><span class="badge ${cls}">${label}</span></td>
        <td><button class="ghost" data-del="${c.code}">supprimer</button></td>
      </tr>`;
    })
    .join('');
  for (const b of $('c-list').querySelectorAll('[data-del]'))
    b.onclick = () => {
      state.coupons = state.coupons.filter((c) => c.code !== b.dataset.del);
      renderCoupons();
      save();
    };
}

function renderChips() {
  $('c-chips').innerHTML = pending
    .map(
      (p, i) =>
        `<span class="chip">${rewardName(p.id)} ×${p.qty}<button data-i="${i}">×</button></span>`,
    )
    .join('');
  for (const b of $('c-chips').querySelectorAll('button'))
    b.onclick = () => {
      pending.splice(Number(b.dataset.i), 1);
      renderChips();
    };
}

let chosen = null;
// Le classement vit côté serveur (`/api/rewards` → `item-search`, partagé
// avec le picker de l'admin) : filtrer ici redonnerait l'ordre du
// CATALOGUE, où « Gold » arrive après les vingt coffres qui le contiennent
// et se retrouve coupé de la liste.
let seq = 0;
$('c-reward').oninput = async () => {
  const q = $('c-reward').value.trim();
  chosen = null;
  if (q.length < 2) return ($('c-results').hidden = true);
  // Une frappe rapide lance plusieurs requêtes : seule la DERNIÈRE compte,
  // sinon une réponse en retard réaffiche la recherche précédente.
  const mine = ++seq;
  const { hits } = await (await fetch(`/api/rewards?q=${encodeURIComponent(q)}`)).json();
  if (mine !== seq) return;
  $('c-results').innerHTML = hits.map((r) => `<div data-id="${r.id}">${r.name}</div>`).join('');
  $('c-results').hidden = !hits.length;
  for (const d of $('c-results').children)
    d.onclick = () => {
      chosen = d.dataset.id;
      $('c-reward').value = d.textContent;
      $('c-results').hidden = true;
    };
};

$('c-add-reward').onclick = () => {
  if (!chosen) return log(['Choisir une récompense dans la liste.'], false);
  pending.push({ id: chosen, qty: $('c-qty').value.trim() || '1' });
  chosen = null;
  $('c-reward').value = '';
  renderChips();
};

// La liste vit sur R2 (le staff en ajoute depuis Discord) : l'écriture est
// conditionnelle à `couponsEtag`. Refusée si la liste a changé → recharger.
async function save() {
  $('c-add').disabled = true;
  const data = await post('/api/coupons', { list: state.coupons, etag: state.couponsEtag });
  if (data.etag) state.couponsEtag = data.etag;
  $('c-add').disabled = !state.couponsEtag;
}

$('c-add').onclick = async () => {
  const code = $('c-code').value.trim().toUpperCase();
  if (!code || !$('c-start').value || !$('c-end').value)
    return log(['Code, début et fin sont requis.'], false);
  if (!pending.length) return log(['Au moins une récompense est requise.'], false);
  state.coupons = [
    {
      code,
      start: $('c-start').value,
      end: $('c-end').value,
      description: Object.fromEntries(pending.map((p) => [p.id, String(p.qty)])),
    },
    ...state.coupons.filter((c) => c.code !== code),
  ];
  pending = [];
  $('c-code').value = '';
  renderChips();
  renderCoupons();
  await save();
};

sections.register('coupons', {
  async init() {
    await stateLoaded;
    if (state.couponsError) {
      log([`${state.couponsError} — instantané local affiché, enregistrement bloqué.`], false);
      $('c-add').disabled = true;
    }
    renderCoupons();
  },
});
