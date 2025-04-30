const fs = require('fs');
const path = require('path');

// ✅ On charge directement le JS (plus de .ts ici !)
const { TOOL_METADATA } = require('../src/lib/toolDescriptions.js');

const outPath = path.join(__dirname, '../src/lib/toolDescriptions.json');
fs.writeFileSync(outPath, JSON.stringify(TOOL_METADATA, null, 2));

console.log('✅ toolDescriptions.json exported.');
