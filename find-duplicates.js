const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src', 'i18n', 'locales', 'en.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract all key-value pairs
const regex = /^\s*['"]([^'"]+)['"]\s*:\s*(.+?),?\s*$/gm;
const entries = [];
let match;

while ((match = regex.exec(content)) !== null) {
  const key = match[1];
  const value = match[2].trim().replace(/,$/, '');
  entries.push({ key, value, line: content.substring(0, match.index).split('\n').length });
}

// Group by value
const valueMap = new Map();
for (const entry of entries) {
  if (!valueMap.has(entry.value)) {
    valueMap.set(entry.value, []);
  }
  valueMap.get(entry.value).push(entry);
}

// Filter duplicates and sort by number of occurrences
const duplicates = Array.from(valueMap.entries())
  .filter(([_, entries]) => entries.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Total duplicate values found: ${duplicates.length}\n`);
console.log('='.repeat(80));

duplicates.forEach(([value, entries]) => {
  console.log(`\n📋 Value: ${value}`);
  console.log(`   Found ${entries.length} times:`);
  entries.forEach(entry => {
    console.log(`   - '${entry.key}' (line ${entry.line})`);
  });
});
