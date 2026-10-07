// Onglet « Vidéos ».
import { $, log, post, sections, state, stateLoaded } from '../lib.js';

$('v-search').onclick = async () => {
  const q = $('v-query').value.trim();
  if (!q) return;
  const res = await fetch(`/api/youtube?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  if (!data.candidates) return log([data.error ?? 'recherche impossible'], false);
  $('v-cands').innerHTML = data.candidates
    .map(
      (c) => `<div class="cand">
        <img src="https://i.ytimg.com/vi/${c.id}/mqdefault.jpg" alt="" />
        <div><strong>${c.title}</strong><span>${c.author} · ${c.uploadDate.slice(0, 10)}</span></div>
        <button class="ghost" data-id="${c.id}">choisir</button>
      </div>`,
    )
    .join('');
  for (const b of $('v-cands').querySelectorAll('[data-id]'))
    b.onclick = () => {
      $('v-input').value = b.dataset.id;
      $('v-cands').innerHTML = '';
    };
};

$('v-add').onclick = async () => {
  if (!$('v-input').value.trim()) return log(['URL ou id requis.'], false);
  $('v-add').disabled = true;
  log([], undefined, 'envoi au serveur');
  const r = await post('/api/video', {
    target: $('v-target').value,
    input: $('v-input').value.trim(),
    label: $('v-label').value.trim() || undefined,
  });
  if (r.ok) $('v-input').value = '';
  $('v-add').disabled = false;
};

sections.register('videos', {
  async init() {
    await stateLoaded;
    $('v-target').innerHTML =
      `<optgroup label="Personnages">${state.targets.characters
        .map((t) => `<option value="${t.value}">${t.label}</option>`)
        .join('')}</optgroup>` +
      `<optgroup label="Guides">${state.targets.guides
        .map((t) => `<option value="${t.value}">${t.label}</option>`)
        .join('')}</optgroup>`;
  },
});
