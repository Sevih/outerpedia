const fs = require('fs');
const path = require('path');

const domain = 'https://outerpedia.com';
const characterDir = path.join(__dirname, '../src/data/char');
const charFiles = fs.readdirSync(characterDir).filter(f => f.endsWith('.json'));

const staticPages = [
  '/',
  '/characters',
  '/equipments',
  '/guides',
  '/tierlist',
  '/tierlist/dps',
  '/tierlist/support',
  '/tierlist/sustain',
  '/changelog',
  '/about'
];

const urls = [
  ...staticPages.map((page) => `${domain}${page}`),
  ...charFiles.map((filename) => {
    const slug = filename.replace('.json', '');
    return `${domain}/characters/${slug}`;
  }),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>
`;

const outPath = path.join(__dirname, '../public/sitemap.xml');
console.log('📄 Generating sitemap at:', outPath);
fs.writeFileSync(outPath, sitemap);
console.log('✅ Sitemap generated');
