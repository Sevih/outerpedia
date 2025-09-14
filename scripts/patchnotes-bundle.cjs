#!/usr/bin/env node
// scripts/patchnotes-bundle.cjs  (multi-sections + références .webp)
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/* ============================ Sections ============================ */
const SECTIONS = [
  'patchnotes',
  'compendium',
  'developer-notes',
  'official-4-cut-cartoon',
  'probabilities',
  'world-introduction',
  'event'
];
// Clé JSON: par défaut "items" ; pour patchnotes on garde "patches"
const JSON_KEYS = { patchnotes: 'items' };

const BASE_URL = 'https://page.onstove.com';

/* ============================ FS utils ============================ */
const ensureDir = p => fs.mkdirSync(p, { recursive: true });
const walkFiles = (dir, out = []) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkFiles(p, out); else out.push(p);
  }
  return out;
};
const buildFileIndex = RAW_DIR => {
  if (!fs.existsSync(RAW_DIR)) return new Map();
  const all = walkFiles(RAW_DIR, []);
  const idx = new Map();
  for (const full of all) {
    const fname = path.basename(full);
    if (!idx.has(fname)) idx.set(fname, []);
    idx.get(fname).push(full);
  }
  return idx;
};

/* ============================ URL/HTML helpers ============================ */
function stripHeadNoise(html) {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/@import[^;]+;/gi, '')
    .replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}
function absolutizeUrl(u, base = BASE_URL) { try { return new URL(u, base).toString(); } catch { return u; } }
function stripTrackingParams(u) {
  try {
    const url = new URL(u, 'https://example.com');
    for (const k of Array.from(url.searchParams.keys())) {
      if (/^(utm_|fbclid|gclid|mc_|ref|ref_src)$/i.test(k)) url.searchParams.delete(k);
    }
    if (u.startsWith('//')) return 'https:' + u;
    return url.toString().replace('https://example.com', '');
  } catch { return u.startsWith('//') ? 'https:' + u : u; }
}
function isCloudfront(url) { try { return /cloudfront\.net/i.test(new URL(url, 'https://x/').hostname); } catch { return false; } }
function toKebabCase(s) {
  return s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

/* === changer extension -> .webp (jpg/jpeg/png/webp uniquement) === */
function toWebpPath(u) {
  return u.replace(/\.(jpe?g|png|webp)(?=([?#]|$))/i, '.webp');
}

/* ============================ Dates ============================ */
function parseProfileDateMDY(text) {
  if (!text) return null;
  const s = String(text).replace(/\u00A0/g, ' ').trim();
  const norm = s.replace(/[^\d]/g, '-');
  const parts = norm.split('-').filter(Boolean);
  if (parts.length < 3) return null;
  const mm = parseInt(parts[0], 10), dd = parseInt(parts[1], 10), yyyy = parseInt(parts[2], 10);
  if (!(yyyy && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31)) return null;
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0));
  return isNaN(+dt) ? null : dt.toISOString();
}
function extractDate(raw, fallbackName) {
  const tryStr = (str) => {
    if (!str) return null;
    const iso = str.match(/\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?)?/);
    if (iso) { const d = new Date(iso[0]); if (!isNaN(+d)) return d.toISOString(); }
    const ymd = str.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (ymd) { const d = new Date(Date.UTC(+ymd[1], +ymd[2] - 1, +ymd[3])); if (!isNaN(+d)) return d.toISOString(); }
    const parsed = new Date(str); if (!isNaN(+parsed)) return parsed.toISOString();
    return null;
  };
  return tryStr(raw) || tryStr(fallbackName) || new Date().toISOString();
}
function toMDYFromISO(iso) {
  const d = new Date(iso);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/* ============================ Pick & merge ============================ */
function pickFrViews(doc) { return Array.from(doc.querySelectorAll('.s-detail .fr-view')); }
function cleanAndMergeFrViews(doc) {
  const views = pickFrViews(doc);
  if (!views.length) return { html: '', images: [] };
  let mergedHtml = '';
  const imgs = [];
  for (const el of views) {
    el.querySelectorAll('script, style, noscript').forEach(n => n.remove());
    el.querySelectorAll('*').forEach(node => {
      node.removeAttribute?.('style');
      node.removeAttribute?.('onclick');
      node.removeAttribute?.('onerror');
      if (node.tagName === 'A') {
        const href = node.getAttribute('href');
        if (href) node.setAttribute('href', absolutizeUrl(href));
        node.setAttribute('rel', 'noopener noreferrer');
        node.setAttribute('target', '_blank');
      }
      if (node.tagName === 'IMG') {
        const src = node.getAttribute('src') || node.getAttribute('data-src') || '';
        if (src) node.setAttribute('src', absolutizeUrl(src));
        node.removeAttribute('width'); node.removeAttribute('height');
      }
    });
    const part = el.innerHTML.trim();
    if (part) {
      mergedHtml += (mergedHtml ? '\n<hr/>\n' : '') + part;
      imgs.push(...Array.from(el.querySelectorAll('img')).map(i => i.getAttribute('src')).filter(Boolean));
    }
  }
  return { html: mergedHtml, images: Array.from(new Set(imgs)) };
}

/* ============================ Sanitize ============================ */
function unwrapSpans(root) {
  root.querySelectorAll('span').forEach(sp => {
    if (![...sp.attributes].length) {
      const parent = sp.parentNode;
      while (sp.firstChild) parent.insertBefore(sp.firstChild, sp);
      sp.remove();
    }
  });
}
function sanitizeAttributes(root) {
  const allowed = {
    'a': new Set(['href', 'title', 'target', 'rel', 'class']),
    'img': new Set(['src', 'alt', 'title', 'srcset', 'sizes', 'loading', 'decoding', 'class']),
    'table': new Set([]),
    'thead': new Set([]), 'tbody': new Set([]), 'tfoot': new Set([]),
    'tr': new Set([]),
    'td': new Set(['colspan', 'rowspan']),
    'th': new Set(['colspan', 'rowspan', 'scope']),
    'div': new Set([]), 'p': new Set([]), 'ul': new Set([]), 'ol': new Set([]), 'li': new Set([]),
    'h1': new Set([]), 'h2': new Set([]), 'h3': new Set([]), 'h4': new Set([]), 'h5': new Set([]), 'h6': new Set([]),
    'strong': new Set([]), 'em': new Set([]), 'u': new Set([]), 's': new Set([]),
    'pre': new Set([]), 'code': new Set([]), 'blockquote': new Set([]), 'hr': new Set([]),
    'figure': new Set([]), 'figcaption': new Set([]), 'details': new Set([]), 'summary': new Set([]),
  };
  root.querySelectorAll('*').forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'link', 'meta', 'iframe', 'youtube-embed'].includes(tag)) { el.remove(); return; }
    const keep = allowed[tag] || new Set();
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      if (!keep.has(name)) el.removeAttribute(name);
    });
  });
}
function compressBreaks(root) { root.querySelectorAll('br + br + br').forEach(br => br.remove()); }
function removeEmptyBlocks(root) {
  const isMeaningful = (el) => {
    if (el.querySelector('img, table, pre, code, video, audio, li, hr')) return true;
    const t = (el.textContent || '').replace(/\u00A0/g, ' ').trim();
    return t.length > 0;
  };
  root.querySelectorAll('p, div, span').forEach(el => { if (!isMeaningful(el)) el.remove(); });
}
function replaceInSrcset(srcset, replacer) {
  return srcset.split(',').map(part => {
    const seg = part.trim().split(/\s+/);
    if (!seg.length) return part;
    try { seg[0] = replacer(seg[0]); return seg.join(' '); } catch { return part; }
  }).join(', ');
}

/*================================== Unicité d'ID ============================================*/
function tinyHash(s = '') {
  let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24); }
  return (h >>> 0).toString(36);
}

function choosePreferred(a, b) {
  const lenA = (a.html || '').length, lenB = (b.html || '').length;
  if (lenA !== lenB) return lenA > lenB ? a : b;
  const tA = Date.parse(a.date_iso || a.date) || 0;
  const tB = Date.parse(b.date_iso || b.date) || 0;
  if (tA !== tB) return tA > tB ? a : b;
  const editedA = /\bedited?\b/i.test(a.title || '') ? 1 : 0;
  const editedB = /\bedited?\b/i.test(b.title || '') ? 1 : 0;
  if (editedA !== editedB) return editedA > editedB ? a : b;
  return (tinyHash(a.html) >= tinyHash(b.html)) ? a : b;
}

function dedupeById(items) {
  const byId = new Map(), dupes = [];
  for (const it of items) {
    const prev = byId.get(it.id);
    if (!prev) { byId.set(it.id, it); continue; }
    const keep = choosePreferred(prev, it);
    const drop = keep === prev ? it : prev;
    byId.set(it.id, keep);
    dupes.push({ kept: keep.id, dropped: drop.id });
  }
  return { unique: Array.from(byId.values()), dupes };
}

/* ============================ Images (copy + rewrite .webp) ============================ */
function pickBestMatch(paths, key) {
  if (!paths || paths.length === 0) return null;
  if (paths.length === 1) return paths[0];
  const k = (key || '').toLowerCase().replace(/[^\w]+/g, '');
  const scored = paths.map(p => {
    const flat = p.toLowerCase().replace(/[^\w]+/g, '');
    const score = flat.includes(k) ? 2 : 1;
    return { p, score, len: p.length };
  });
  scored.sort((a, b) => b.score - a.score || a.len - b.len);
  return scored[0].p;
}

function copyAssetsAndRewrite(patch, fileIndex, PUB_DIR, section) {
  const dom = new JSDOM(`<div id="root">${patch.html}</div>`);
  const doc = dom.window.document;
  const root = doc.getElementById('root');

  const copied = new Set();
  const localBase = `/${section}/${patch.id}`;
  const destDir = path.join(PUB_DIR, patch.id);
  ensureDir(destDir);

  function copyByFilename(filename) {
    const list = fileIndex.get(filename);
    if (!list) return null;
    const best = pickBestMatch(list, patch.title || patch.id);
    if (!best) return null;
    const dest = path.join(destDir, filename);
    if (!copied.has(dest)) { fs.copyFileSync(best, dest); copied.add(dest); }
    return `${localBase}/${filename}`;
  }


  // 1) supprimer toutes les vidéos/miroirs
  root.querySelectorAll('iframe, youtube-embed').forEach(n => n.remove());
  root.querySelectorAll('a[href]').forEach(a => {
    const href = (a.getAttribute('href') || '').trim();
    if (!href) return;
    if (/youtube\.com|youtu\.be|_fichiers\/[\w-]{6,15}\.html?/i.test(href)) {
      if (a.childElementCount === 1 && a.firstElementChild?.tagName.toLowerCase() === 'img') {
        const img = a.firstElementChild; a.parentNode.insertBefore(img, a); a.remove();
      } else {
        const tn = a.ownerDocument.createTextNode(a.textContent || '');
        a.parentNode.replaceChild(tn, a);
      }
    }
  });

  // 2) images -> chemin local + extension .webp
  root.querySelectorAll('img').forEach(img => {
    const original = img.getAttribute('src') || img.getAttribute('data-src') || '';
    const filename = path.basename((original || '').split('?')[0]);
    if (!filename) return;
    const localUrl = copyByFilename(filename);           // copie l’original (ton autre script fera le .webp)
    if (!localUrl) return;
    img.setAttribute('src', toWebpPath(localUrl));       // **forcé en .webp**
    img.removeAttribute('data-src');
    img.removeAttribute('width'); img.removeAttribute('height');

    const srcset = img.getAttribute('srcset');
    if (srcset) {
      img.setAttribute('srcset', replaceInSrcset(srcset, (url) => {
        const fn = path.basename((url || '').split('?')[0]);
        const local = copyByFilename(fn) || url;
        return toWebpPath(local);                        // **.webp dans srcset**
      }));
    }
  });

  // 3) <source srcset> (picture)
  root.querySelectorAll('source[srcset]').forEach(source => {
    const srcset = source.getAttribute('srcset'); if (!srcset) return;
    source.setAttribute('srcset', replaceInSrcset(srcset, (url) => {
      const fn = path.basename((url || '').split('?')[0]);
      const local = copyByFilename(fn) || url;
      return toWebpPath(local);
    }));
  });

  // 4) liens → nettoyage tracking + si lien image cloudfront → local .webp
  root.querySelectorAll('a[href]').forEach(a => {
    let href = a.getAttribute('href') || '';
    href = stripTrackingParams(href);
    const fname = (href || '').split('?')[0].split('/').pop() || '';
    if (isCloudfront(href) && /\.(png|jpe?g|webp)$/i.test(fname)) {
      const local = copyByFilename(fname);
      if (local) href = toWebpPath(local);               // **.webp dans les <a> images**
    }
    a.setAttribute('href', href.startsWith('//') ? 'https:' + href : href);
    if (/^https?:\/\//i.test(href)) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // 5) sanitize + unwrap <a><img>
  unwrapSpans(root);
  sanitizeAttributes(root);
  compressBreaks(root);
  removeEmptyBlocks(root);
  root.querySelectorAll('a > img').forEach(img => {
    const a = img.parentElement; if (!a) return;
    a.parentNode.insertBefore(img, a); a.remove();
  });

  // 6) maj patch (images[] en .webp)
  patch.html = root.innerHTML.trim();
  patch.images = Array.from(root.querySelectorAll('img'))
    .map(i => i.getAttribute('src'))
    .filter(Boolean);
}

/* ============================ Section ============================ */
function processSection(section) {
  const RAW_DIR = path.resolve(process.cwd(), `data/${section}/raw`);
  const JSON_OUT = path.resolve(process.cwd(), `data/${section}.bundled.json`);
  const PUB_DIR = path.resolve(process.cwd(), `public/${section}`);
  const KEY = JSON_KEYS[section] || 'items';

  if (!fs.existsSync(RAW_DIR)) {
    console.warn(`⚠️  data/${section}/raw introuvable — sauté.`);
    return;
  }

  const files = fs.readdirSync(RAW_DIR)
    .filter(f => !f.startsWith('.') && !f.toLowerCase().endsWith('.json'))
    .map(f => path.join(RAW_DIR, f))
    .filter(p => fs.statSync(p).isFile())
    .sort();

  const results = [];
  const fileIndex = buildFileIndex(RAW_DIR);
  ensureDir(PUB_DIR);

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const html = stripHeadNoise(raw);
    const dom = new JSDOM(html, { url: BASE_URL });
    const doc = dom.window.document;

    const profileDateText = doc.querySelector('.s-profile-date')?.textContent || '';
    const dateFromProfile = parseProfileDateMDY(profileDateText);
    const timeMeta = doc.querySelector('time[datetime]')?.getAttribute('datetime') || '';
    const metaDate = doc.querySelector("meta[property='article:published_time']")?.content || timeMeta || '';
    const fallbackIso = extractDate(metaDate, path.basename(filePath));
    const dateIso = dateFromProfile || fallbackIso;
    const dateMdy = toMDYFromISO(dateIso);

    const titleRaw = (doc.querySelector("meta[property='og:title']")?.content)
      || (doc.querySelector('title')?.textContent)
      || path.basename(filePath);
    const title = titleRaw.replace(/\s+/g, ' ').trim();

    const { html: mergedHtml } = cleanAndMergeFrViews(doc);
    if (!mergedHtml) {
      console.warn(`⚠️  .fr-view introuvable/vide: ${section} → ${path.basename(filePath)}`);
      continue;
    }

    const id = `${dateIso.slice(0, 10)}-${toKebabCase(title)}`.slice(0, 120);
    const item = {
      id,
      title,
      date: dateMdy,
      date_iso: dateIso,
      author: null,
      sourceUrl: doc.querySelector("meta[property='og:url']")?.content || null,
      coverImage: null,
      html: mergedHtml,
      images: []
    };

    copyAssetsAndRewrite(item, fileIndex, PUB_DIR, section);
    results.push(item);
  }

  // dédoublonne par id dans la section
  let prev = [];
  if (fs.existsSync(JSON_OUT)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(JSON_OUT, 'utf8'));
      prev = Array.isArray(parsed[KEY]) ? parsed[KEY] : [];
    } catch { }
  }

  // 2) fusion ancien + nouveaux (les nouveaux écrasent les anciens de même id)
  const merged = [...prev, ...results];
  const { unique, dupes } = dedupeById(merged);
  if (dupes.length) {
    console.warn(`⚠️  [${section}] ${dupes.length} doublon(s) d'id supprimé(s)`);
  }

  // 3) tri du plus récent au plus ancien
  unique.sort((a, b) => (b.date_iso || '').localeCompare(a.date_iso || ''));

  // 4) uid stable pour le front
  for (const it of unique) it.uid = `${section}:${it.id}`;

  // 5) écrire seulement si changement
  let prevRaw = '';
  if (fs.existsSync(JSON_OUT)) prevRaw = fs.readFileSync(JSON_OUT, 'utf8');
  const nextRaw = JSON.stringify({ [KEY]: unique }, null, 2);

  if (prevRaw === nextRaw) {
    console.log(`ℹ️  [${section}] aucun changement — JSON conservé tel quel.`);
  } else {
    fs.writeFileSync(JSON_OUT, nextRaw, 'utf8');
    console.log(`✅ [${section}] ${unique.length} élément(s) → ${JSON_OUT}`);
  }
  console.log(`🗂  Assets copiés dans: ${PUB_DIR}/<id>/`);


  console.log(`✅ [${section}] ${unique.length} élément(s) → ${JSON_OUT}`);
  console.log(`🗂  Assets copiés dans: ${PUB_DIR}/<id>/`);
}

/* ============================ Main ============================ */
(function main() {
  const wanted = process.argv.slice(2);
  const list = wanted.length ? wanted : SECTIONS;
  list.forEach(processSection);
})();
