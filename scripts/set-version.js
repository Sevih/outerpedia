const fs = require('fs');
const path = require('path');

const version = require('../package.json').version;
const newVersionLine = `NEXT_PUBLIC_APP_VERSION=${version}`;

// 🔹 Met à jour .env.version
fs.writeFileSync('.env.version', `${newVersionLine}\n`);
console.log(`✅ .env.version generated: ${newVersionLine}`);

// 🔹 Met à jour .env.production (sans écraser les autres variables)
const envProdPath = path.resolve('.env.production');
let envLines = [];

if (fs.existsSync(envProdPath)) {
  envLines = fs.readFileSync(envProdPath, 'utf8').split('\n');
}

// Filtre les lignes existantes sans NEXT_PUBLIC_APP_VERSION
const filtered = envLines.filter(line => !line.startsWith('NEXT_PUBLIC_APP_VERSION=') && line.trim() !== '');

// Ajoute la nouvelle version à la fin
filtered.push(newVersionLine);

// Écrit le fichier final
fs.writeFileSync(envProdPath, filtered.join('\n') + '\n');
console.log(`✅ .env.production updated with: ${newVersionLine}`);
