const fs = require('fs');
const path = require('path');

const domain = 'https://outerpedia.com';

// 📁 Chemin vers les personnages
const characterDir = path.join(__dirname, '../src/data/char');
const charFiles = fs.readdirSync(characterDir).filter(f => f.endsWith('.json'));

// 📁 TOOL_METADATA depuis ton fichier
const TOOL_METADATA = require('../src/lib/toolDescriptions.json');
const guideRef = require('../src/data/guides/guides-ref.json');
const guidePages = Object.entries(guideRef).map(
  ([slug, data]) => `/guides/${data.category}/${slug}`
);

// 📄 Pages statiques manuelles
const staticPages = [
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

// 📄 Pages personnages
const characterPages = charFiles.map((filename) => {
  const slug = filename.replace('.json', '');
  return `/characters/${slug}`;
});

const categories = [
  { file: 'weapon', url: 'weapon' },
  { file: 'amulet', url: 'accessory' },
  { file: 'sets', url: 'set' }
];

const itemPages = categories.flatMap(({ file, url }) => {
  const filePath = path.join(__dirname, `../src/data/${file}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`❌ Fichier manquant : ${filePath}`);
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;

  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Erreur JSON dans ${file}.json :`, err.message);
    return [];
  }

  const entries = Array.isArray(data) ? data : Object.values(data);
  return entries.map((entry) => {
    const slug = toKebabCase(entry.name || entry.Name || '');
    return `/item/${url}/${slug}`;
  });
});


// utilitaire
function toKebabCase(input) {
  if (typeof input !== 'string') {
    console.warn('toKebabCase: input not a string:', input);
    return '';
  }

  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}


// 📄 Pages outils (URL publiques comme /tierlist, /assets-dl)
const toolPages = Object.keys(TOOL_METADATA).map((slug) => `/${slug}`);

// 🧾 Construction du sitemap
const urls = [
  ...staticPages.map((page) => ({ loc: `${domain}${page}` })),
  ...toolPages.map((page) => ({ loc: `${domain}${page}` })),
  ...characterPages.map((page) => ({ loc: `${domain}${page}` })),
  ...itemPages.map((page) => ({ loc: `${domain}${page}` })),
  ...Object.entries(guideRef).map(([slug, data]) => ({
    loc: `${domain}/guides/${data.category}/${slug}`,
    lastmod: new Date(data.last_updated).toISOString().split('T')[0],
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map((entry) => {
      const lastmod = entry.lastmod
        ? `<lastmod>${entry.lastmod}</lastmod>`
        : '';
      return `<url><loc>${entry.loc}</loc>${lastmod}</url>`;
    })
    .join('\n  ')}
</urlset>
`;


// 📦 Écriture du fichier
const outPath = path.join(__dirname, '../public/sitemap.xml');
console.log('📄 Generating sitemap at:', outPath);
fs.writeFileSync(outPath, sitemap);
console.log('✅ Sitemap generated');
