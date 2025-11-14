#!/usr/bin/env node
/**
 * Script to find heroes missing pros/cons or partners
 * Usage: node scripts/check-missing-content.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const SLUG_TO_CHAR_PATH = path.join(__dirname, '../src/data/_SlugToChar.json');
const PROS_CONS_PATH = path.join(__dirname, '../src/data/hero-pros-cons.json');
const PARTNERS_PATH = path.join(__dirname, '../src/data/partners.json');

// Load JSON files
const slugToChar = JSON.parse(fs.readFileSync(SLUG_TO_CHAR_PATH, 'utf-8'));
const prosCons = JSON.parse(fs.readFileSync(PROS_CONS_PATH, 'utf-8'));
const partners = JSON.parse(fs.readFileSync(PARTNERS_PATH, 'utf-8'));

// Get all hero slugs (lowercase with hyphens)
const allHeroSlugs = Object.keys(slugToChar);

// Convert hero name to slug format (lowercase with hyphens)
function toKebabCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Find heroes without pros/cons
const heroesWithoutProsCons = allHeroSlugs.filter(slug => {
  const heroData = slugToChar[slug];
  const heroSlug = toKebabCase(heroData.Fullname);
  return !prosCons[heroSlug];
});

// Find heroes without partners
const heroesWithoutPartners = allHeroSlugs.filter(slug => {
  const heroData = slugToChar[slug];
  const heroSlug = toKebabCase(heroData.Fullname);
  return !partners[heroSlug];
});

// Get hero display name
function getHeroName(slug) {
  const heroData = slugToChar[slug];
  return heroData.Fullname;
}

// Display results
console.log('═══════════════════════════════════════════════════════');
console.log('📊 MISSING CONTENT REPORT');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`Total heroes: ${allHeroSlugs.length}`);
console.log(`Heroes with pros/cons: ${Object.keys(prosCons).length}`);
console.log(`Heroes with partners: ${Object.keys(partners).length}\n`);

console.log('───────────────────────────────────────────────────────');
console.log('🎭 HEROES WITHOUT PROS/CONS');
console.log(`Total: ${heroesWithoutProsCons.length}`);
console.log('───────────────────────────────────────────────────────');

if (heroesWithoutProsCons.length === 0) {
  console.log('✅ All heroes have pros/cons!');
} else {
  heroesWithoutProsCons.sort().forEach(slug => {
    const name = getHeroName(slug);
    const heroSlug = toKebabCase(slugToChar[slug].Fullname);
    console.log(`• ${name} (${heroSlug})`);
  });
}

console.log('\n───────────────────────────────────────────────────────');
console.log('🤝 HEROES WITHOUT PARTNERS');
console.log(`Total: ${heroesWithoutPartners.length}`);
console.log('───────────────────────────────────────────────────────');

if (heroesWithoutPartners.length === 0) {
  console.log('✅ All heroes have partners!');
} else {
  heroesWithoutPartners.sort().forEach(slug => {
    const name = getHeroName(slug);
    const heroSlug = toKebabCase(slugToChar[slug].Fullname);
    console.log(`• ${name} (${heroSlug})`);
  });
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('💡 TIP: Use the slug in parentheses for JSON files');
console.log('═══════════════════════════════════════════════════════\n');

// Optional: Save to files
const outputDir = path.join(__dirname, '../.temp');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save missing pros/cons
const missingProsConsOutput = heroesWithoutProsCons.map(slug => {
  const name = getHeroName(slug);
  const heroSlug = toKebabCase(slugToChar[slug].Fullname);
  return { name, slug: heroSlug };
});
fs.writeFileSync(
  path.join(outputDir, 'missing-pros-cons.json'),
  JSON.stringify(missingProsConsOutput, null, 2)
);

// Save missing partners
const missingPartnersOutput = heroesWithoutPartners.map(slug => {
  const name = getHeroName(slug);
  const heroSlug = toKebabCase(slugToChar[slug].Fullname);
  return { name, slug: heroSlug };
});
fs.writeFileSync(
  path.join(outputDir, 'missing-partners.json'),
  JSON.stringify(missingPartnersOutput, null, 2)
);

console.log('📁 Detailed reports saved to:');
console.log(`   • .temp/missing-pros-cons.json`);
console.log(`   • .temp/missing-partners.json\n`);
