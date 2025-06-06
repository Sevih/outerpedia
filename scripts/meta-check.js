const axios = require('axios');
const cheerio = require('cheerio');
const { parseStringPromise } = require('xml2js');
const fs = require('fs');

const SITEMAP_URL = 'https://outerpedia.com/sitemap.xml';

async function getUrlsFromSitemap(sitemapUrl) {
  try {
    const { data } = await axios.get(sitemapUrl);
    const parsed = await parseStringPromise(data);
    const urls = parsed.urlset.url.map(entry => entry.loc[0]);
    return urls;
  } catch (error) {
    console.error('Erreur récupération sitemap:', error.message);
    return [];
  }
}

async function checkMetaKeywords(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const keywords = $('meta[name="keywords"]').attr('content') || null;
    return { url, keywords };
  } catch (error) {
    console.error(`Erreur analyse ${url}:`, error.message);
    return { url, keywords: null, error: error.message };
  }
}

(async () => {
  const urls = await getUrlsFromSitemap(SITEMAP_URL);
  const results = [];

  console.log(`Analyse de ${urls.length} pages...`);

  for (const url of urls) {
    const result = await checkMetaKeywords(url);
    results.push(result);
    console.log(`[${result.keywords ? '✓' : '✗'}] ${url}`);
  }

  // Sauvegarde dans un fichier JSON
  fs.writeFileSync('keywords-report.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Rapport exporté : keywords-report.json');
})();
