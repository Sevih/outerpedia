// scripts/postbuild.js
require('./generate-sitemap.cjs');
const { exec } = require("child_process");

exec("ts-node scripts/generate-sitemap.ts", (err, stdout, stderr) => {
  if (err) {
    console.error("Erreur génération sitemap :", err);
    return;
  }
  if (stderr) {
    console.error("stderr :", stderr);
  }
  console.log(stdout);
});
