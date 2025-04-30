const fs = require('fs');
const path = require('path');

const domain = 'https://outerpedia.com';

// 📁 Chemin vers les personnages
const characterDir = path.join(__dirname, '../src/data/char');
const charFiles = fs.readdirSync(characterDir).filter(f => f.endsWith('.json'));

// 📁 TOOL_METADATA depuis ton fichier
const TOOL_METADATA = require('../src/lib/toolDescriptions.json');

// 📄 Pages statiques manuelles
const staticPages = [
  '/',
  '/characters',
  '/equipments',
  '/guides',
  '/changelog',
  '/tools',
  '/about',
];

// 📄 Pages tierlist spécifiques
const tierlistTabs = ['/tierlist/dps', '/tierlist/support', '/tierlist/sustain'];

// 📄 Pages personnages
const characterPages = charFiles.map((filename) => {
  const slug = filename.replace('.json', '');
  return `/characters/${slug}`;
});

// 📄 Pages outils (URL publiques comme /tierlist, /assets-dl)
const toolPages = Object.keys(TOOL_METADATA).map((slug) => `/${slug}`);

// 🧾 Construction du sitemap
const urls = [
  ...staticPages,
  ...tierlistTabs,
  ...toolPages,
  ...characterPages,
].map((page) => `${domain}${page}`);

// 🧾 Format XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>
`;

// 📦 Écriture du fichier
const outPath = path.join(__dirname, '../public/sitemap.xml');
console.log('📄 Generating sitemap at:', outPath);
fs.writeFileSync(outPath, sitemap);
console.log('✅ Sitemap generated');
