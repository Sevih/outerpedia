const fs = require('fs');
const path = require('path');

const buffsPath = path.join(__dirname, '../src/data/buffs.json');
const debuffsPath = path.join(__dirname, '../src/data/debuffs.json');
const countsPath = path.join(__dirname, '../src/data/effects-count.json');

const buffsData = JSON.parse(fs.readFileSync(buffsPath, 'utf8'));
const debuffsData = JSON.parse(fs.readFileSync(debuffsPath, 'utf8'));
const countsData = JSON.parse(fs.readFileSync(countsPath, 'utf8'));

// Trouver les buffs non utilisés
const unusedBuffs = buffsData
    .filter(buff => !buff.name.startsWith('UNIQUE'))
    .filter(buff => !countsData.buffs[buff.name])
    .map(buff => buff.name);

// Trouver les debuffs non utilisés
const unusedDebuffs = debuffsData
    .filter(debuff => !debuff.name.startsWith('UNIQUE'))
    .filter(debuff => !countsData.debuffs[debuff.name])
    .map(debuff => debuff.name);

console.log('🔍 Unused Buffs:');
console.log(JSON.stringify(unusedBuffs, null, 2));

console.log('\n🔍 Unused Debuffs:');
console.log(JSON.stringify(unusedDebuffs, null, 2));

console.log(`\n📊 Summary:`);
console.log(`   ${unusedBuffs.length} unused buffs`);
console.log(`   ${unusedDebuffs.length} unused debuffs`);
