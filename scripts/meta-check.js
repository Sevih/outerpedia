const axios = require('axios');
const cheerio = require('cheerio');
const { parseStringPromise } = require('xml2js');
const fs = require('fs');

// Choix base URL selon environnement
const BASE_URL = 'https://outerpedia.com';

const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

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

async function checkMetaTags(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const keywords = $('meta[name="keywords"]').attr('content') || null;
    const canonical = $('link[rel="canonical"]').attr('href') || null;

    return {
      url,
      keywords,
      canonical,
      canonicalIsValid: canonical ? canonical === url : false,
    };
  } catch (error) {
    console.error(`Erreur analyse ${url}:`, error.message);
    return {
      url,
      keywords: null,
      canonical: null,
      canonicalIsValid: false,
      error: error.message
    };
  }
}

(async () => {
  const urls = await getUrlsFromSitemap(SITEMAP_URL);
  const results = [];

  console.log(`🔍 Analyse de ${urls.length} pages...\n`);

  for (const url of urls) {
    const result = await checkMetaTags(url);
    results.push(result);
    console.log(`[${result.keywords ? '✓' : '✗'}|${result.canonicalIsValid ? '✓' : '✗'}] ${url}`);
  }

  // Sauvegarde JSON
  fs.writeFileSync('keywords-report.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Rapport exporté : keywords-report.json');
})();
