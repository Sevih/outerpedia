const fs = require('fs');
const path = require('path');

const charDir = path.join(__dirname, '../src/data/char');
const eePath = path.join(__dirname, '../src/data/EE.json');
const outputPath = path.join(__dirname, '../src/data/effects-count.json');

// Compter le nombre de personnages uniques qui ont chaque buff/debuff
const buffCharacters = {}; // { buffName: Set<characterId> }
const debuffCharacters = {}; // { debuffName: Set<characterId> }

// Lire tous les fichiers de personnages
const files = fs.readdirSync(charDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(charDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Set pour tracker les buffs/debuffs déjà vus pour ce personnage
    const characterBuffs = new Set();
    const characterDebuffs = new Set();

    // Parcourir les compétences
    if (data.skills) {
        Object.values(data.skills).forEach(skill => {
            // Collecter les buffs uniques de ce personnage
            if (skill.buff && Array.isArray(skill.buff)) {
                skill.buff.forEach(buffName => {
                    characterBuffs.add(buffName);
                });
            }

            // Collecter les debuffs uniques de ce personnage
            if (skill.debuff && Array.isArray(skill.debuff)) {
                skill.debuff.forEach(debuffName => {
                    characterDebuffs.add(debuffName);
                });
            }
        });
    }

    // Ajouter ce personnage au compte de chaque buff qu'il possède
    characterBuffs.forEach(buffName => {
        if (!buffCharacters[buffName]) {
            buffCharacters[buffName] = new Set();
        }
        buffCharacters[buffName].add(data.ID || file);
    });

    // Ajouter ce personnage au compte de chaque debuff qu'il possède
    characterDebuffs.forEach(debuffName => {
        if (!debuffCharacters[debuffName]) {
            debuffCharacters[debuffName] = new Set();
        }
        debuffCharacters[debuffName].add(data.ID || file);
    });
});

// Lire les Exclusive Equipment
const eeData = JSON.parse(fs.readFileSync(eePath, 'utf8'));

Object.entries(eeData).forEach(([charId, ee]) => {
    // Collecter les buffs de l'EE
    if (ee.buff && Array.isArray(ee.buff)) {
        ee.buff.forEach(buffName => {
            if (!buffCharacters[buffName]) {
                buffCharacters[buffName] = new Set();
            }
            buffCharacters[buffName].add(charId);
        });
    }

    // Collecter les debuffs de l'EE
    if (ee.debuff && Array.isArray(ee.debuff)) {
        ee.debuff.forEach(debuffName => {
            if (!debuffCharacters[debuffName]) {
                debuffCharacters[debuffName] = new Set();
            }
            debuffCharacters[debuffName].add(charId);
        });
    }
});

// Convertir les Sets en nombres
const buffCounts = {};
Object.keys(buffCharacters).forEach(buffName => {
    buffCounts[buffName] = buffCharacters[buffName].size;
});

const debuffCounts = {};
Object.keys(debuffCharacters).forEach(debuffName => {
    debuffCounts[debuffName] = debuffCharacters[debuffName].size;
});

// Écrire le résultat
const result = {
    buffs: buffCounts,
    debuffs: debuffCounts
};

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log(`✅ Effect counts written to ${outputPath}`);
console.log(`📊 ${Object.keys(buffCounts).length} unique buffs found`);
console.log(`📊 ${Object.keys(debuffCounts).length} unique debuffs found`);
console.log(`👤 ${files.length} character files processed`);
console.log(`⚔️  ${Object.keys(eeData).length} EE processed`);
