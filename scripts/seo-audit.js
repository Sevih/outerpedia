const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'https://outerpedia.local';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const TIMEOUT = 10000;

// Ignorer les erreurs SSL en dev (certificat self-signed)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fetch HTTP avec timeout et suivi des redirections
function fetchUrl(url, followRedirects = true, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects === 0) {
            return reject(new Error('Too many redirects'));
        }

        const protocol = url.startsWith('https') ? https : http;
        const startTime = Date.now();

        const options = {
            timeout: TIMEOUT,
            rejectUnauthorized: false // Accepte les certificats self-signed
        };

        const req = protocol.get(url, options, (res) => {
            // Gestion des redirections
            if (followRedirects && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const redirectUrl = res.headers.location.startsWith('http') 
                    ? res.headers.location 
                    : `${BASE_URL}${res.headers.location}`;
                
                return fetchUrl(redirectUrl, true, maxRedirects - 1)
                    .then(resolve)
                    .catch(reject);
            }

            let data = '';
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const loadTime = Date.now() - startTime;
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    loadTime,
                    redirectUrl: res.headers.location,
                });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Parse le sitemap XML et extrait les URLs
function parseSitemap(xml) {
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [];
    let match;

    while ((match = urlRegex.exec(xml)) !== null) {
        const url = match[1].trim();
        // Ne garde que les URLs contenant /guides/
        if (url.includes('/guides/')) {
            urls.push(url);
        }
    }

    return urls;
}

// Parsers HTML légers (sans dépendance)
function getTagContent(html, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([^<]+)<\/${tagName}>`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : null;
}

function getMetaContent(html, name, isProperty = false) {
    const attr = isProperty ? 'property' : 'name';
    const regex = new RegExp(`<meta\\s+${attr}=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
}

function getLinkHref(html, rel) {
    const regex = new RegExp(`<link\\s+rel=["']${rel}["']\\s+href=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
}

function countTags(html, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>`, 'gi');
    return (html.match(regex) || []).length;
}

function getImagesWithoutAlt(html) {
    const imgRegex = /<img[^>]*>/gi;
    const images = html.match(imgRegex) || [];
    const withoutAlt = images.filter(img => !img.match(/alt=["'][^"']*["']/i));
    return { total: images.length, withoutAlt: withoutAlt.length };
}

function getTextContent(html) {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Analyse SEO du HTML rendu
function analyzeSEO(html, url, response) {
    const issues = [];
    const warnings = [];
    const successes = [];
    let score = 100;

    // 1. Status Code
    if (response.statusCode === 200) {
        successes.push('✅ Status 200 OK');
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
        warnings.push(`⚠️  Redirection ${response.statusCode} vers ${response.redirectUrl}`);
        score -= 10;
    } else {
        issues.push(`❌ Status ${response.statusCode}`);
        score -= 30;
    }

    // 2. Load Time
    if (response.loadTime < 1000) {
        successes.push(`✅ Temps de chargement: ${response.loadTime}ms`);
    } else if (response.loadTime < 3000) {
        warnings.push(`⚠️  Temps de chargement: ${response.loadTime}ms`);
        score -= 5;
    } else {
        issues.push(`❌ Temps de chargement lent: ${response.loadTime}ms`);
        score -= 15;
    }

    // 3. Title
    const title = getTagContent(html, 'title');
    if (!title) {
        issues.push('❌ Balise <title> manquante ou vide');
        score -= 20;
    } else {
        const titleLength = title.length;
        if (titleLength >= 30 && titleLength <= 60) {
            successes.push(`✅ Title optimisée (${titleLength} car.)`);
        } else if (titleLength < 30) {
            warnings.push(`⚠️  Title trop courte (${titleLength} car.)`);
            score -= 5;
        } else {
            warnings.push(`⚠️  Title trop longue (${titleLength} car.)`);
            score -= 5;
        }
    }

    // 4. Meta Description
    const metaDesc = getMetaContent(html, 'description');
    if (!metaDesc) {
        issues.push('❌ Meta description manquante');
        score -= 15;
    } else {
        const descLength = metaDesc.length;
        if (descLength >= 120 && descLength <= 160) {
            successes.push(`✅ Meta description optimisée (${descLength} car.)`);
        } else if (descLength < 120) {
            warnings.push(`⚠️  Meta description trop courte (${descLength} car.)`);
            score -= 5;
        } else {
            warnings.push(`⚠️  Meta description trop longue (${descLength} car.)`);
            score -= 5;
        }
    }

    // 5. Canonical URL
    const canonical = getLinkHref(html, 'canonical');
    if (canonical) {
        successes.push('✅ Canonical URL présente');
    } else {
        warnings.push('⚠️  Canonical URL manquante');
        score -= 5;
    }

    // 6. Open Graph
    const ogTitle = getMetaContent(html, 'og:title', true);
    const ogDesc = getMetaContent(html, 'og:description', true);
    const ogImage = getMetaContent(html, 'og:image', true);
    
    if (ogTitle && ogDesc && ogImage) {
        successes.push('✅ Open Graph complet');
    } else {
        warnings.push('⚠️  Open Graph incomplet');
        score -= 5;
    }

    // 7. Structured Data (JSON-LD)
    const jsonLdCount = countTags(html, 'script type="application/ld\\+json"');
    if (jsonLdCount > 0) {
        successes.push(`✅ Données structurées présentes (${jsonLdCount})`);
    } else {
        warnings.push('⚠️  Pas de données structurées JSON-LD');
        score -= 10;
    }

    // 8. Headings
    const h1Count = countTags(html, 'h1');
    if (h1Count === 0) {
        issues.push('❌ Aucun H1');
        score -= 15;
    } else if (h1Count === 1) {
        successes.push('✅ Un seul H1 (idéal)');
    } else {
        warnings.push(`⚠️  Plusieurs H1 (${h1Count})`);
        score -= 5;
    }

    const h2Count = countTags(html, 'h2');
    if (h2Count > 0) {
        successes.push(`✅ Structure avec ${h2Count} H2`);
    } else {
        warnings.push('⚠️  Aucun H2');
        score -= 5;
    }

    // 9. Images sans alt
    const imageStats = getImagesWithoutAlt(html);
    if (imageStats.withoutAlt === 0 && imageStats.total > 0) {
        successes.push(`✅ Toutes les images ont un alt (${imageStats.total})`);
    } else if (imageStats.withoutAlt > 0) {
        warnings.push(`⚠️  ${imageStats.withoutAlt}/${imageStats.total} images sans alt`);
        score -= Math.min(imageStats.withoutAlt * 2, 10);
    }

    // 10. Contenu textuel
    const textContent = getTextContent(html);
    const wordCount = textContent.split(' ').length;
    if (wordCount >= 300) {
        successes.push(`✅ Contenu substantiel (${wordCount} mots)`);
    } else {
        warnings.push(`⚠️  Contenu léger (${wordCount} mots)`);
        score -= 10;
    }

    // 11. Headers HTTP
    if (response.headers['cache-control']) {
        successes.push('✅ Cache-Control configuré');
    } else {
        warnings.push('⚠️  Pas de Cache-Control');
        score -= 3;
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        issues,
        warnings,
        successes,
        loadTime: response.loadTime,
        statusCode: response.statusCode,
    };
}

function printReport(url, result) {
    const { score, issues, warnings, successes } = result;
    const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';

    console.log('\n' + '='.repeat(80));
    log(`🌐 ${url}`, 'blue');
    log(`Score SEO: ${score}/100`, color);
    console.log('='.repeat(80));

    if (successes.length > 0) {
        log('\n✨ Points forts:', 'green');
        successes.forEach(s => console.log(`  ${s}`));
    }

    if (warnings.length > 0) {
        log('\n⚠️  Avertissements:', 'yellow');
        warnings.forEach(w => console.log(`  ${w}`));
    }

    if (issues.length > 0) {
        log('\n🚨 Problèmes critiques:', 'red');
        issues.forEach(i => console.log(`  ${i}`));
    }
}

async function main() {
    log('🔍 Audit SEO HTTP des Guides Outerpedia\n', 'magenta');

    // 1. Récupérer le sitemap
    log(`📥 Récupération du sitemap: ${SITEMAP_URL}`, 'blue');
    
    let sitemapResponse;
    try {
        sitemapResponse = await fetchUrl(SITEMAP_URL);
    } catch (error) {
        log(`❌ Impossible de récupérer le sitemap: ${error.message}`, 'red');
        process.exit(1);
    }

    if (sitemapResponse.statusCode !== 200) {
        log(`❌ Sitemap inaccessible (Status ${sitemapResponse.statusCode})`, 'red');
        process.exit(1);
    }

    // 2. Parser le sitemap
    const urls = parseSitemap(sitemapResponse.body);

    if (urls.length === 0) {
        log('⚠️  Aucune URL /guides/ trouvée dans le sitemap', 'yellow');
        process.exit(0);
    }

    log(`✅ ${urls.length} URL(s) /guides/ trouvée(s)\n`, 'green');

    // 3. Analyser chaque URL
    const results = [];

    for (const url of urls) {
        try {
            log(`🔄 Vérification: ${url}`, 'blue');
            const response = await fetchUrl(url);
            const result = analyzeSEO(response.body, url, response);
            printReport(url, result);
            results.push({ url, ...result });
        } catch (error) {
            log(`❌ Erreur: ${url} - ${error.message}`, 'red');
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. Résumé global
    console.log('\n\n' + '='.repeat(80));
    log('📊 RÉSUMÉ GLOBAL', 'magenta');
    console.log('='.repeat(80));

    const total = results.length;
    const avg = results.reduce((s, r) => s + r.score, 0) / total;
    const avgLoadTime = results.reduce((s, r) => s + r.loadTime, 0) / total;

    console.log(`\n📚 Pages analysées: ${total}`);
    log(`📈 Score moyen: ${avg.toFixed(1)}/100`, avg >= 80 ? 'green' : avg >= 60 ? 'yellow' : 'red');
    log(`⏱️  Temps de chargement moyen: ${avgLoadTime.toFixed(0)}ms`, avgLoadTime < 2000 ? 'green' : 'yellow');

    const excellent = results.filter(r => r.score >= 80).length;
    const good = results.filter(r => r.score >= 60 && r.score < 80).length;
    const needsWork = results.filter(r => r.score < 60).length;

    console.log('\n📊 Distribution:');
    log(`  🌟 Excellents (80+): ${excellent}`, 'green');
    log(`  👍 Bons (60-79): ${good}`, 'yellow');
    log(`  ⚠️  À améliorer (<60): ${needsWork}`, 'red');

    if (needsWork > 0) {
        console.log('\n🔧 Priorités:');
        results
            .filter(r => r.score < 60)
            .sort((a, b) => a.score - b.score)
            .slice(0, 5)
            .forEach(r => log(`  • ${r.url} (${r.score}/100)`, 'red'));
    }

    process.exit(avg >= 60 ? 0 : 1);
}

main();