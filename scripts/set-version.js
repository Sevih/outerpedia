const fs = require('fs');
const version = require('../package.json').version;

const content = `NEXT_PUBLIC_APP_VERSION=${version}\n`;
fs.writeFileSync('.env.version', content);

console.log(`✅ .env.version generated: ${content.trim()}`);
