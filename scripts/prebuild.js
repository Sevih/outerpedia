#!/usr/bin/env node
/**
 * Script de préparation avant build
 * Regroupe tous les scripts de génération de données
 */

const { execSync } = require('child_process');
const path = require('path');

// Liste des scripts à exécuter dans l'ordre
const scripts = [
  { name: 'Version', cmd: 'node scripts/set-version.js' },
  { name: 'Events', cmd: 'node scripts/generateEventRegistry.js' },
  { name: 'SW Version', cmd: 'node scripts/inject-sw-version.js' },
  { name: 'All Characters', cmd: 'tsx scripts/generateAllCharacters.ts' },
  { name: 'Slug to Char', cmd: 'tsx scripts/generateLinkSlugChar.ts' },
  { name: 'Gear Stats', cmd: 'node scripts/generateGearUsageStats.js' },
  { name: 'Guide Characters', cmd: 'node scripts/extract-guide-characters.js' },
  { name: 'Pool Data', cmd: 'node scripts/generate-pool-data.cjs' },
  { name: 'Gear Submap', cmd: 'node scripts/generateSubstatsMap.js' },
  { name: 'Effects Index', cmd: 'node scripts/buildEffectIndex.mjs' },
  { name: 'Effect Types', cmd: 'node scripts/generate-effect-types.js' },
  { name: 'News Cache', cmd: 'node scripts/generateNewsCache.js' },
  { name: 'Validate Effects', cmd: 'node scripts/validate-effects.js' },
  { name: 'Boss Index', cmd: 'node scripts/generateBossIndex.js' },
];

console.log('🚀 Préparation du build...\n');

const startTime = Date.now();
let successCount = 0;
let errorCount = 0;

for (const script of scripts) {
  try {
    const scriptStart = Date.now();
    process.stdout.write(`⏳ ${script.name.padEnd(20, ' ')} `);

    const output = execSync(script.cmd, {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
    });

    const duration = ((Date.now() - scriptStart) / 1000).toFixed(2);

    // Extract summary from output
    const summary = extractSummary(output, script.name);
    console.log(`✅ (${duration}s) ${summary}`);
    successCount++;
  } catch (error) {
    console.log('❌');
    console.error(`   Error: ${error.message}`);
    errorCount++;
  }
}

/**
 * Extract useful summary from script output
 */
function extractSummary(output, scriptName) {

  // Version script
  if (scriptName === 'Version') {
    const match = output.match(/NEXT_PUBLIC_APP_VERSION=(\S+)/);
    if (match) return `v${match[1]}`;
  }

  // Events
  if (scriptName === 'Events') {
    const match = output.match(/Generated (\d+) events/);
    if (match) return `${match[1]} event(s)`;
  }

  // SW Version
  if (scriptName === 'SW Version') {
    const match = output.match(/cache version set to (v[\d.]+)/);
    if (match) return match[1];
  }

  // All Characters
  if (scriptName === 'All Characters') {
    const match = output.match(/Successfully generated/);
    if (match) return '_allCharacters.json';
  }

  // Slug to Char
  if (scriptName === 'Slug to Char') {
    const match = output.match(/with (\d+) entries/);
    if (match) return `${match[1]} entries`;
  }

  // Gear Stats
  if (scriptName === 'Gear Stats') {
    const match = output.match(/généré avec (\d+) objets/);
    if (match) return `${match[1]} items`;
  }

  // Guide Characters
  if (scriptName === 'Guide Characters') {
    const match = output.match(/Total: (\d+) guides/);
    if (match) return `${match[1]} guides`;
  }

  // Pool Data
  if (scriptName === 'Pool Data') {
    const regular = output.match(/characters_regular.*\((\d+)\)/);
    const premium = output.match(/characters_premium.*\((\d+)\)/);
    const limited = output.match(/characters_limited.*\((\d+)\)/);
    if (regular && premium && limited) {
      return `${regular[1]}R/${premium[1]}P/${limited[1]}L`;
    }
  }

  // Gear Submap
  if (scriptName === 'Gear Submap') {
    const match = output.match(/généré avec (\d+) personnages/);
    if (match) return `${match[1]} chars`;
  }

  // Effects Index
  if (scriptName === 'Effects Index') {
    const buffMatch = output.match(/Buff keys: (\d+)/);
    const debuffMatch = output.match(/Debuff keys: (\d+)/);
    if (buffMatch && debuffMatch) {
      return `${buffMatch[1]}B/${debuffMatch[1]}D`;
    }
  }

  // Effect Types
  if (scriptName === 'Effect Types') {
    const buffMatch = output.match(/(\d+) buff names/);
    const debuffMatch = output.match(/(\d+) debuff names/);
    if (buffMatch && debuffMatch) {
      return `${buffMatch[1]}B/${debuffMatch[1]}D`;
    }
  }

  // News Cache
  if (scriptName === 'News Cache') {
    const match = output.match(/(\d+) total articles/);
    if (match) return `${match[1]} articles`;
  }

  // Validate Effects
  if (scriptName === 'Validate Effects') {
    const match = output.match(/(\d+) références vérifiées/);
    if (match) return `${match[1]} refs OK`;
  }

  // Boss Index
  if (scriptName === 'Boss Index') {
    const match = output.match(/Total de boss: (\d+)/);
    if (match) return `${match[1]} boss`;
  }

  return '';
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n' + '─'.repeat(50));
console.log(`✅ ${successCount}/${scripts.length} scripts réussis en ${totalDuration}s`);

if (errorCount > 0) {
  console.log(`❌ ${errorCount} script(s) en erreur`);
  process.exit(1);
}

console.log('🎉 Préparation terminée !\n');
