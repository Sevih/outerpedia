// scripts/generateSitemap.cjs
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SITE_URL = process.env.SITE_URL || 'https://outerpedia.com';
const OUTPUT_DIR = path.resolve(process.cwd(), 'public');
const MAX_URLS_PER_SITEMAP = 48000; // < 50k
const PRETTY_XML = true;

// ====== Chemins (alignés sur ton ancien script) ======
const ROOT = process.cwd();
const CHAR_DIR = path.join(ROOT, 'src', 'data', 'char');
const TOOL_META_PATH = path.join(ROOT, 'src', 'lib', 'toolDescriptions.json');
const GUIDE_REF_PATH = path.join(ROOT, 'src', 'data', 'guides', 'guides-ref.json');
const ITEM_FILES = [
  { file: 'weapon', url: 'weapon' },
  { file: 'amulet', url: 'accessory' },
  { file: 'sets', url: 'set' },
];

const STATIC_PAGES = [
  '/',
  '/characters',
  '/equipments',
  '/tierlist',
  '/guides',
  '/changelog',
  '/tools',
  '/legal',
  '/coupons',
];

// ====== Helpers ======
const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const xml = (s) => (PRETTY_XML ? s.replace(/></g, '>\n<') : s);
const sha = (str) => crypto.createHash('sha1').update(str).digest('hex');
const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
const writeFile = (p, content) => { fs.writeFileSync(p, content, 'utf8'); console.log('✓', path.relative(process.cwd(), p)); };
const statMtime = (p) => { try { return fs.statSync(p).mtime; } catch { return null; } };
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i*size, (i+1)*size));
const toKebabCase = (str='') => String(str).toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

// ====== URL entry ======
const urlXml = (u) => {
  const parts = ['<url>', `<loc>${esc(u.loc)}</loc>`];
  if (u.lastmod) parts.push(`<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>`);
  if (u.changefreq) parts.push(`<changefreq>${u.changefreq}</changefreq>`);
  if (typeof u.priority === 'number') parts.push(`<priority>${u.priority.toFixed(1)}</priority>`);
  parts.push('</url>');
  return parts.join('');
};

const buildUrlset = (urls) => xml(
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
  urls.map(urlXml).join('') +
  `</urlset>`
);

const buildIndex = (sitemaps) => xml(
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
  sitemaps.map(f => `<sitemap><loc>${esc(f.loc)}</loc><lastmod>${new Date(f.lastmod).toISOString()}</lastmod></sitemap>`).join('') +
  `</sitemapindex>`
);

// ====== Collectors (mêmes sources que ton ancien script) ======
function collectStatic() {
  const mtime = statMtime(path.join(ROOT, 'src', 'app', 'page.tsx')) ||
                statMtime(path.join(ROOT, 'src', 'app', 'layout.tsx')) ||
                new Date();
  return STATIC_PAGES.map(p => ({
    loc: `${SITE_URL}${p}`,
    lastmod: mtime,
    changefreq: 'daily',
    priority: p === '/' ? 1.0 : 0.7,
  }));
}

function collectTools() {
  if (!fs.existsSync(TOOL_META_PATH)) return { urls: [], slugs: new Set() };
  const meta = readJson(TOOL_META_PATH);
  const slugs = new Set(Object.keys(meta));
  const lastmod = statMtime(TOOL_META_PATH) || new Date();
  const urls = [...slugs].map(slug => ({
    loc: `${SITE_URL}/${slug}`,
    lastmod,
    changefreq: 'monthly',
    priority: 0.5,
  }));
  return { urls, slugs };
}

function collectCharacters() {
  if (!fs.existsSync(CHAR_DIR)) return [];
  const files = fs.readdirSync(CHAR_DIR).filter(f => f.endsWith('.json')).sort();
  return files.map(filename => ({
    loc: `${SITE_URL}/characters/${filename.replace(/\.json$/, '')}`,
    lastmod: statMtime(path.join(CHAR_DIR, filename)) || new Date(),
    changefreq: 'weekly',
    priority: 0.8,
  }));
}

function collectItems() {
  const out = [];
  for (const { file, url } of ITEM_FILES) {
    const filePath = path.join(ROOT, 'src', 'data', `${file}.json`);
    if (!fs.existsSync(filePath)) { console.warn(`❌ Fichier manquant : ${filePath}`); continue; }
    let data;
    try { data = readJson(filePath); } catch (e) { console.error(`❌ Erreur JSON dans ${file}.json :`, e.message); continue; }
    const list = Array.isArray(data) ? data : Object.values(data);
    const lastmod = statMtime(filePath) || new Date();
    for (const entry of list) {
      const slug = toKebabCase(entry?.name || entry?.Name || '');
      if (!slug) continue;
      out.push({
        loc: `${SITE_URL}/item/${url}/${slug}`,
        lastmod,
        changefreq: 'monthly',
        priority: 0.55,
      });
    }
  }
  return out;
}

function collectGuides() {
  if (!fs.existsSync(GUIDE_REF_PATH)) return [];
  const raw = readJson(GUIDE_REF_PATH); // { [slug]: { category, last_updated? } }
  const fileMtime = statMtime(GUIDE_REF_PATH) || new Date();
  return Object.entries(raw).map(([slug, data]) => {
    const loc = `${SITE_URL}/guides/${data.category}/${slug}`;
    const lastmod = data.last_updated && !Number.isNaN(Date.parse(data.last_updated))
      ? new Date(data.last_updated)
      : fileMtime;
    return { loc, lastmod, changefreq: 'weekly', priority: 0.6 };
  });
}

// ====== Segmented write ======
function writeSegment(name, urls) {
  if (!urls.length) return [];
  const dir = path.join(OUTPUT_DIR, 'sitemaps');
  ensureDir(dir);
  const chunks = chunk(urls, MAX_URLS_PER_SITEMAP);
  const out = [];
  chunks.forEach((list, i) => {
    const content = buildUrlset(list);
    const hash = sha(content).slice(0, 8);
    const filename = `${name}-${i + 1}.${hash}.xml`;
    const full = path.join(dir, filename);
    writeFile(full, content);
    out.push({ loc: `${SITE_URL}/sitemaps/${filename}`, lastmod: new Date() });
  });
  return out;
}

// ====== Main ======
(async function main() {
  ensureDir(OUTPUT_DIR);

  const staticUrls = collectStatic();
  const { urls: toolUrls, slugs: toolSlugs } = collectTools();
  const charUrls = collectCharacters();
  const itemUrls = collectItems();
  const guideUrls = collectGuides();

  // Dédup globale (par loc, garde le lastmod le + récent)
  const byLoc = new Map();
  for (const u of [...staticUrls, ...toolUrls, ...charUrls, ...itemUrls, ...guideUrls]) {
    const prev = byLoc.get(u.loc);
    if (!prev) byLoc.set(u.loc, u);
    else {
      const newer = !prev.lastmod || (u.lastmod && u.lastmod > prev.lastmod) ? u : prev;
      byLoc.set(u.loc, { ...prev, ...newer });
    }
  }

  // Répartition en segments (priorité: static > characters > items > guides > tools)
  const remaining = new Map(byLoc);
  const take = (pred) => {
    const res = [];
    for (const [k, v] of remaining) if (pred(v)) { res.push(v); remaining.delete(k); }
    return res;
  };

  const staticLocs = new Set(STATIC_PAGES.map(p => `${SITE_URL}${p}`));
  const segStatic = take(u => staticLocs.has(u.loc));
  const segChars  = take(u => u.loc.includes('/characters/'));
  const segItems  = take(u => u.loc.includes('/item/'));
  const segGuides = take(u => u.loc.includes('/guides/'));
  const segTools  = take(u => {
    const suffix = u.loc.startsWith(`${SITE_URL}/`) ? u.loc.slice(SITE_URL.length + 1) : '';
    return toolSlugs.has(suffix);
  });
  const segMisc   = take(() => true); // tout ce qui reste (devrait être vide)

  const indexEntries = [];
  indexEntries.push(...writeSegment('static',      segStatic));
  indexEntries.push(...writeSegment('characters',  segChars));
  indexEntries.push(...writeSegment('items',       segItems));
  indexEntries.push(...writeSegment('guides',      segGuides));
  indexEntries.push(...writeSegment('tools',       segTools));
  indexEntries.push(...writeSegment('misc',        segMisc));

  // sitemap index
  const indexXml = buildIndex(indexEntries);
  writeFile(path.join(OUTPUT_DIR, 'sitemap.xml'), indexXml);

  // robots.txt (si absent)
  const robotsPath = path.join(OUTPUT_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    writeFile(robotsPath, `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  }

  console.log('\n✅ Sitemaps générés.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
