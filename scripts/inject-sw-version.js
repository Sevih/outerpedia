// scripts/inject-sw-version.js
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const swPath = path.join(__dirname, '../public/service-worker.js');
const content = fs.readFileSync(swPath, 'utf-8');

const version = pkg.version;
const replaced = content.replace(/const CACHE_NAME = 'outerpedia-cache-[^']+'/,
  `const CACHE_NAME = 'outerpedia-cache-v${version}'`);

fs.writeFileSync(swPath, replaced);
console.log(`✅ Service Worker cache version set to v${version}`);
