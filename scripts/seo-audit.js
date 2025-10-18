const fs = require('fs');
const path = require('path');

// Configuration pour votre structure
const GUIDES_DIR = path.join(__dirname, '../src/app/guides/_contents');
const MIN_WORD_COUNT = 300;
const REQUIRED_PATTERNS = {
    h2: /<h2[^>]*>|<GuideHeading level={2}>|GuideTemplate/gi,
    h3: /<h3[^>]*>|<GuideHeading level={3}>/gi,
    h4: /<h4[^>]*>|<GuideHeading level={4}>/gi,
    paragraphs: /<p[^>]*>/gi,
    lists: /<ul[^>]*>/gi,
    guideTemplate: /GuideTemplate/g,
    guideHeading: /GuideHeading/g,
};

// Couleurs pour le terminal
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

function countWords(content) {
    const textContent = content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\{[^}]+\}/g, ' ')
        .replace(/[^a-zA-Z\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);

    return textContent.length;
}

function checkHeadingHierarchy(content) {
    const h2Matches = content.match(REQUIRED_PATTERNS.h2) || [];
    const h3Matches = content.match(REQUIRED_PATTERNS.h3) || [];
    const h4Matches = content.match(REQUIRED_PATTERNS.h4) || [];

    return {
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        h4Count: h4Matches.length,
        hasH2: h2Matches.length > 0,
        hasProperStructure: h2Matches.length > 0 && h3Matches.length > 0,
    };
}

function analyzeGuide(filePath, relativePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const wordCount = countWords(content);
    const headings = checkHeadingHierarchy(content);

    const issues = [];
    const warnings = [];
    const successes = [];

    if (wordCount < MIN_WORD_COUNT) {
        // ✅ Sauf si utilise GuideTemplate
        if (!content.includes('GuideTemplate')) {
            issues.push(`❌ Contenu insuffisant: ${wordCount} mots (minimum: ${MIN_WORD_COUNT})`);
        }
    } else {
        successes.push(`✅ Contenu suffisant: ${wordCount} mots`);
    }

    if (!headings.hasH2) {
        // ✅ Si GuideTemplate, considérer H2 présent
        if (!content.includes('GuideTemplate')) {
            issues.push('❌ Aucun H2 trouvé');
        }
    } else {
        successes.push(`✅ H2 présent`);
    }

    if (!headings.hasProperStructure) {
        // ✅ Ignorer si utilise GuideTemplate (H3 dans versions)
        if (!content.includes('GuideTemplate')) {
            warnings.push('⚠️  Structure de headings incomplète');
        }
    } else {
        successes.push(`✅ Structure hiérarchique complète`);
    }

    const paragraphCount = (content.match(REQUIRED_PATTERNS.paragraphs) || []).length;
    if (paragraphCount < 5) {
        // ✅ Ignorer si GuideTemplate
        if (!content.includes('GuideTemplate')) {
            warnings.push(`⚠️  Peu de paragraphes: ${paragraphCount}`);
        }
    } else {
        successes.push(`✅ Bon nombre de paragraphes: ${paragraphCount}`);
    }

    const usesTemplate = REQUIRED_PATTERNS.guideTemplate.test(content);
    if (usesTemplate) {
        successes.push('✅ Utilise GuideTemplate');
    }

    const usesGuideHeading = REQUIRED_PATTERNS.guideHeading.test(content);
    if (usesGuideHeading) {
        successes.push('✅ Utilise GuideHeading');
    }

    const hasVideo = content.includes('YoutubeEmbed');
    if (hasVideo) {
        successes.push('✅ Contient une vidéo');
    }

    const characterLinks = (content.match(/CharacterLinkCard/g) || []).length;
    if (characterLinks > 0) {
        successes.push(`✅ Liens internes: ${characterLinks}`);
    }

    const score = Math.max(0, Math.min(100,
        100 - (issues.length * 20) - (warnings.length * 5) + Math.min(successes.length * 8, 80) - 40
    ));

    return {
        relativePath,
        wordCount,
        headings,
        issues,
        warnings,
        successes,
        score,
    };
}

function scanDirectory(dir) {
    const results = [];

    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scan(fullPath);
            } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
                const relativePath = path.relative(GUIDES_DIR, fullPath);
                results.push({ path: fullPath, relativePath });
            }
        }
    }

    scan(dir);
    return results;
}

function printReport(result) {
    const { relativePath, score, issues, warnings, successes } = result;
    const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';

    console.log('\n' + '='.repeat(80));
    log(`📄 ${relativePath}`, 'blue');
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
        log('\n🚨 Problèmes:', 'red');
        issues.forEach(i => console.log(`  ${i}`));
    }
}

function printSummary(results) {
    console.log('\n\n' + '='.repeat(80));
    log('📊 RÉSUMÉ GLOBAL', 'magenta');
    console.log('='.repeat(80));

    const total = results.length;
    const avg = results.reduce((s, r) => s + r.score, 0) / total;
    const excellent = results.filter(r => r.score >= 80).length;
    const good = results.filter(r => r.score >= 60 && r.score < 80).length;
    const needsWork = results.filter(r => r.score < 60).length;

    console.log(`\n📚 Guides analysés: ${total}`);
    log(`📈 Score moyen: ${avg.toFixed(1)}/100`, avg >= 80 ? 'green' : avg >= 60 ? 'yellow' : 'red');

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
            .forEach(r => log(`  • ${r.relativePath} (${r.score}/100)`, 'red'));
    }
}

function main() {
    log('🔍 Audit SEO des Guides Outerpedia\n', 'magenta');

    if (!fs.existsSync(GUIDES_DIR)) {
        log(`❌ Dossier introuvable: ${GUIDES_DIR}`, 'red');
        process.exit(1);
    }

    const files = scanDirectory(GUIDES_DIR);

    if (files.length === 0) {
        log('⚠️  Aucun guide trouvé', 'yellow');
        process.exit(0);
    }

    log(`📁 Analyse de ${files.length} fichier(s)...\n`, 'blue');

    const results = files.map(f => {
        try {
            return analyzeGuide(f.path, f.relativePath);
        } catch (error) {
            log(`❌ Erreur: ${f.relativePath}`, 'red');
            return null;
        }
    }).filter(Boolean);

    results.forEach(printReport);
    printSummary(results);

    const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
    process.exit(avg >= 60 ? 0 : 1);
}

main();