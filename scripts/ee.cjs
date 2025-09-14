const fs = require('fs');
const path = require('path');

const eePath = path.join(__dirname, '..', 'src', 'data', 'ee.json'); // adapte si besoin

const eeData = JSON.parse(fs.readFileSync(eePath, 'utf-8'));

const correctedData = Object.fromEntries(
  Object.entries(eeData).map(([key, value]) => {
    return [
      key,
      {
        ...value,
        buff: Array.isArray(value.buff) ? value.buff : value.buff ? [value.buff] : [],
        debuff: Array.isArray(value.debuff) ? value.debuff : value.debuff ? [value.debuff] : [],
      },
    ];
  })
);

fs.writeFileSync(eePath, JSON.stringify(correctedData, null, 2), 'utf-8');

console.log('✅ Correction terminée.');
