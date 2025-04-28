const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // 📦 npm install chalk (facultatif mais recommandé pour couleurs)

const charDir = path.join(__dirname, '../src/data/char');
const charFiles = fs.readdirSync(charDir).filter(f => f.endsWith('.json'));

let ok = true;
let errorCount = 0;

console.log(chalk.blue('🔎 Checking character JSONs and assets...\n'));

for (const file of charFiles) {
  const content = fs.readFileSync(path.join(charDir, file), 'utf-8');
  const data = JSON.parse(content);
  const slug = file.replace('.json', '');
  const expectedUrl = `https://outerpedia.com/characters/${slug}`;

  if (!data.Fullname || !data.ID) {
    console.warn(chalk.red(`❌ ${file} is missing Fullname or ID`));
    errorCount++;
    ok = false;
  }

  if (data.slug && data.slug !== slug) {
    console.warn(chalk.red(`❌ ${file} has mismatched slug: found "${data.slug}" but expected "${slug}"`));
    errorCount++;
    ok = false;
  }

  const imagePath = path.join(__dirname, `../public/images/characters/atb/IG_Turn_${data.ID}.png`);
  if (!fs.existsSync(imagePath)) {
    console.warn(chalk.yellow(`⚠️ Missing OpenGraph image for ${file} (ID: ${data.ID})`));
    ok = false;
  }
}

console.log('\n');

if (ok && errorCount === 0) {
  console.log(chalk.green('✅ All character JSONs and images are valid for SEO!'));
} else {
  console.log(chalk.red(`❌ Found ${errorCount} critical issue(s).`));
  process.exit(1);
}
