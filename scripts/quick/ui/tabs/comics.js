// Onglet « 4-comics ».
import { $, esc, log, post, sections, state, stateLoaded } from '../lib.js';
// Le rangement par BD et par langue : le module que le serveur importe aussi.
import { groupByStem, splitComicName } from '../comics-group.mjs';

// Planches choisies, {name, data, type, lang?}. `lang` n'est posé que par une
// correction à la main : sinon la langue est celle du nom, puis celle du
// `select` « langue par défaut ».
let files = [];

/** Les BD à l'écran : une ligne par radical, une case par langue. */
const groups = () => groupByStem(files, state.langs, $('k-lang').value);

/** Ce qui part : les planches de chaque langue, sans ce qui ne sert qu'à l'écran. */
const batchesOf = (rows) =>
  state.langs
    .map((lang) => ({
      lang,
      files: rows.flatMap((g) => {
        const f = g.slots[lang];
        return f ? [{ name: f.name, data: f.data }] : [];
      }),
    }))
    .filter((b) => b.files.length);

const slot = (f, lang) => {
  // Une case vide n'est pas une erreur : une BD ne sort pas toujours partout.
  if (!f) return `<div class="k-slot"><div class="k-thumb empty">${lang} — manquant</div></div>`;
  const i = files.indexOf(f);
  const name = esc(f.name);
  // Ni suffixe ni correction : la langue n'est que celle par défaut, à vérifier.
  const guess = !f.lang && !splitComicName(f.name, state.langs).lang;
  const options = state.langs
    .map((l) => `<option${l === lang ? ' selected' : ''}>${l}</option>`)
    .join('');
  return `<div class="k-slot">
    <div class="k-thumb">
      <img data-i="${i}" alt="" />
      <button data-rm="${i}" title="Retirer cette planche" aria-label="Retirer ${name}">×</button>
    </div>
    <select data-i="${i}" aria-label="Langue de ${name}"${
      guess ? ' class="guess" title="Langue par défaut : le nom ne porte pas de suffixe"' : ''
    }>${options}</select>
    <span class="k-name" title="${name}">${name}</span>
  </div>`;
};

const renderFiles = () => {
  const rows = groups();
  $('k-rows').innerHTML = rows
    .map(
      (g) => `<div class="k-row">
        <strong class="k-stem">${esc(g.stem)}</strong>
        ${state.langs.map((l) => slot(g.slots[l], l)).join('')}
      </div>`,
    )
    .join('');
  // La vignette est l'image déjà lue : posée par propriété, pour ne pas faire
  // transiter des mégaoctets de base64 par le HTML de la liste.
  for (const img of $('k-rows').querySelectorAll('img')) {
    const f = files[Number(img.dataset.i)];
    img.src = `data:${f.type};base64,${f.data}`;
  }
  const langs = state.langs.filter((l) => rows.some((g) => g.slots[l]));
  $('k-send').textContent = files.length
    ? `Publier ${files.length} planche${files.length > 1 ? 's' : ''} — ${rows.length} BD (${langs.join(', ')})`
    : 'Publier les planches';
};

$('k-rows').onclick = (e) => {
  const b = e.target.closest('button[data-rm]');
  if (!b) return;
  files.splice(Number(b.dataset.rm), 1);
  renderFiles();
};
$('k-rows').onchange = (e) => {
  const s = e.target.closest('select[data-i]');
  if (!s) return;
  files[Number(s.dataset.i)].lang = s.value;
  renderFiles();
};
$('k-lang').onchange = renderFiles;

const readFiles = async (list) => {
  // Les langues viennent de `/api/state` : sans elles, rien ne se range.
  await stateLoaded;
  for (const f of list) {
    const buf = await f.arrayBuffer();
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    files.push({ name: f.name, data: btoa(bin), type: f.type });
  }
  renderFiles();
};

$('k-drop').onclick = () => $('k-file').click();
$('k-file').onchange = () => readFiles($('k-file').files);
$('k-drop').ondragover = (e) => (e.preventDefault(), $('k-drop').classList.add('over'));
$('k-drop').ondragleave = () => $('k-drop').classList.remove('over');
$('k-drop').ondrop = (e) => {
  e.preventDefault();
  $('k-drop').classList.remove('over');
  readFiles(e.dataTransfer.files);
};

$('k-send').onclick = async () => {
  if (!files.length) return log(['Aucune planche choisie.'], false);
  // Tout part dans UN corps JSON, que le serveur plafonne : au-delà il coupe la
  // connexion, et rien ne dirait pourquoi. 1 Mo de marge pour ce qui s'ajoute
  // au base64 (les noms, l'enveloppe).
  const size = files.reduce((n, f) => n + f.data.length, 0);
  if (size > state.maxUpload - 1024 * 1024) {
    const mb = (n) => Math.round(n / 1024 / 1024);
    return log(
      [
        `Envoi trop lourd : ${mb(size)} Mo pour un plafond de ${mb(state.maxUpload)} Mo.`,
        'Retirer des planches et publier en deux fois.',
      ],
      false,
    );
  }
  $('k-send').disabled = true;
  log([], undefined, 'envoi des planches au serveur');
  const r = await post('/api/comics', { batches: batchesOf(groups()) });
  if (r.ok) {
    files = [];
    renderFiles();
  }
  $('k-send').disabled = false;
};

sections.register('comics', {
  async init() {
    await stateLoaded;
    $('k-lang').innerHTML = state.langs.map((l) => `<option>${l}</option>`).join('');
  },
});
