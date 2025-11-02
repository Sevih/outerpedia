const fs = require('fs');
const path = require('path');

const buffs = require('../src/data/buffs.json');
const debuffs = require('../src/data/debuffs.json');

const buffNames = buffs.map(b => `  | '${b.name}'`).join('\n');
const debuffNames = debuffs.map(d => `  | '${d.name}'`).join('\n');

const content = `// Auto-generated file - DO NOT EDIT MANUALLY
// Run 'node scripts/generate-effect-types.js' to regenerate

export type BuffName =
${buffNames}

export type DebuffName =
${debuffNames}
`;

const outputPath = path.join(__dirname, '../src/types/effect-names.ts');
fs.writeFileSync(outputPath, content, 'utf-8');

console.log(`✅ Generated ${outputPath}`);
console.log(`   - ${buffs.length} buff names`);
console.log(`   - ${debuffs.length} debuff names`);
