// Onglet « 4-comics ».
import { $, log, post, sections, state, stateLoaded } from '../lib.js';

let files = []; // planches choisies, {name, data}

const renderFiles = () => {
  $('k-chips').innerHTML = files
    .map((f, i) => `<span class="chip">${f.name}<button data-i="${i}">×</button></span>`)
    .join('');
  for (const b of $('k-chips').querySelectorAll('button'))
    b.onclick = () => {
      files.splice(Number(b.dataset.i), 1);
      renderFiles();
    };
};

const readFiles = async (list) => {
  for (const f of list) {
    const buf = await f.arrayBuffer();
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    files.push({ name: f.name, data: btoa(bin) });
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
  $('k-send').disabled = true;
  log([], undefined, 'envoi des planches au serveur');
  const r = await post('/api/comics', { lang: $('k-lang').value, files });
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
