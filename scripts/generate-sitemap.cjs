/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const DOMAIN_EN = 'https://outerpedia.com';
const DOMAIN_JP = 'https://jp.outerpedia.com';
const DOMAIN_KR = 'https://kr.outerpedia.com';

// ---- helpers
const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function toKebabCase(input) {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function fmtDateISO(d) {
  return new Date(d).toISOString().split('T')[0];
}

// ---- data paths
const ROOT = path.join(__dirname, '..');
const characterDir = path.join(ROOT, 'src/data/char');
const TOOL_METADATA = require(path.join(ROOT, 'src/lib/toolDescriptions.json'));
const guideRef = require(path.join(ROOT, 'src/data/guides/guides-ref.json'));

// ---- collect pages
const staticPages = [
  '/', '/characters', '/equipments', '/tierlist', '/guides',
  '/changelog', '/tools', '/legal', '/coupons',
];

const charFiles = fs.readdirSync(characterDir).filter(f => f.endsWith('.json'));

const characterPages = charFiles.map((filename) => {
  const slug = filename.replace('.json', '');
  const filePath = path.join(characterDir, filename);
  const mtime = fs.statSync(filePath).mtime;
  return { path: `/characters/${slug}`, lastmod: fmtDateISO(mtime) };
});

// items: weapon, amulet, sets
const categories = [
  { file: 'weapon', url: 'weapon' },
  { file: 'amulet', url: 'accessory' },
  { file: 'sets', url: 'set' },
];

const itemPages = categories.flatMap(({ file, url }) => {
  const filePath = path.join(ROOT, `src/data/${file}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`❌ Missing file: ${filePath}`);
    return [];
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`❌ JSON error in ${file}.json:`, err.message);
    return [];
  }
  const entries = Array.isArray(data) ? data : Object.values(data);
  return entries.map((entry) => {
    const slug = toKebabCase(entry.name || entry.Name || '');
    return { path: `/item/${url}/${slug}` };
  });
});

// tool public pages
const toolPages = Object.keys(TOOL_METADATA).map((slug) => ({ path: `/${slug}` }));

// guides (use last_updated if present)
const guidePages = Object.entries(guideRef).map(([slug, data]) => ({
  path: `/guides/${data.category}/${slug}`,
  lastmod: data.last_updated ? fmtDateISO(data.last_updated) : undefined,
}));

// merge + dedupe (by path)
const mapByPath = new Map();
[
  ...staticPages.map(p => ({ path: p })),
  ...toolPages,
  ...characterPages,
  ...itemPages,
  ...guidePages,
].forEach(entry => {
  // prefer entries that carry lastmod
  if (!mapByPath.has(entry.path) || (entry.lastmod && !mapByPath.get(entry.path).lastmod)) {
    mapByPath.set(entry.path, entry);
  }
});

const pages = Array.from(mapByPath.values());

// ---- build XML entries with hreflang alternates (EN/JP/KR)
function buildUrlBlock(p) {
  const locEN = `${DOMAIN_EN}${p.path}`;
  const locJP = `${DOMAIN_JP}${p.path}`;
  const locKR = `${DOMAIN_KR}${p.path}`;
  const lastmod = p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : '';

  // xhtml alternates (keep simple: en/jp/kr + x-default=en)
  return `
  <url>
    <loc>${xmlEscape(locEN)}</loc>
    ${lastmod}
    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(locEN)}"/>
    <xhtml:link rel="alternate" hreflang="ja" href="${xmlEscape(locJP)}"/>
    <xhtml:link rel="alternate" hreflang="ko" href="${xmlEscape(locKR)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(locEN)}"/>
  </url>`.trim();
}

// ---- chunking (50k URLs max / file, keep buffer)
const CHUNK_SIZE = 45000;
const chunks = [];
for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
  chunks.push(pages.slice(i, i + CHUNK_SIZE));
}

// ---- write sitemaps
const publicDir = path.join(ROOT, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

if (chunks.length === 1) {
  const body = pages.map(buildUrlBlock).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
  const outPath = path.join(publicDir, 'sitemap.xml');
  console.log('📄 Generating sitemap at:', outPath);
  fs.writeFileSync(outPath, xml);
  console.log('✅ Sitemap generated');
} else {
  // multiple files + index
  const indexEntries = [];
  chunks.forEach((chunk, idx) => {
    const filename = `sitemap-${idx + 1}.xml`;
    const body = chunk.map(buildUrlBlock).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
    fs.writeFileSync(path.join(publicDir, filename), xml);
    indexEntries.push(`
  <sitemap>
    <loc>${xmlEscape(`${DOMAIN_EN}/${filename}`)}</loc>
    <lastmod>${fmtDateISO(new Date())}</lastmod>
  </sitemap>`.trim());
  });

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>
`;
  const outIndex = path.join(publicDir, 'sitemap.xml');
  console.log('📄 Generating sitemap index at:', outIndex);
  fs.writeFileSync(outIndex, indexXml);
  console.log('✅ Sitemap index + parts generated');
}
