const fs = require('fs');
const path = require('path');

const charDir = path.join(__dirname, '../src/data/char');
const charFiles = fs.readdirSync(charDir).filter(f => f.endsWith('.json'));

let ok = true;

for (const file of charFiles) {
  const content = fs.readFileSync(path.join(charDir, file), 'utf-8');
  const data = JSON.parse(content);
  const slug = file.replace('.json', '');
  const expectedUrl = `https://outerpedia.com/characters/${slug}`;

  if (!data.Fullname || !data.ID) {
    console.warn(`⚠️  ${file} missing Fullname or ID`);
    ok = false;
  }

  if (data.slug && data.slug !== slug) {
    console.warn(`⚠️  ${file} has mismatched slug: ${data.slug}`);
    ok = false;
  }

  const imagePath = path.join(__dirname, `../public/images/characters/atb/IG_Turn_${data.ID}.png`);
  if (!fs.existsSync(imagePath)) {
    console.warn(`⚠️  Missing image for ${file}`);
    ok = false;
  }
}

if (ok) {
  console.log('✅ All character JSONs look good for SEO');
} else {
  process.exit(1);
}
