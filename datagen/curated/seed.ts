/**
 * Bootstrap one-shot : importe le contenu curé de l'oracle V2 vers
 * `data/curated/characters.json` (clé = ID, trié, mince).
 *
 *   tsx datagen/curated/seed.ts
 *
 * À lancer UNE fois pour amorcer la couche curée. Ensuite l'admin fait foi
 * (re-lancer écraserait les éditions humaines).
 */
import { resolve } from 'node:path';
import { writeJson } from '../lib/json';
import { seedFromLegacy } from './character';

async function main(): Promise<void> {
  const curated = seedFromLegacy();
  // Tri par id pour des diffs stables.
  const sorted = Object.fromEntries(Object.entries(curated).sort(([a], [b]) => a.localeCompare(b)));
  const out = resolve('data/curated/characters.json');
  await writeJson(out, sorted);
  console.log(`seed curated → ${out}`);
  console.log(`  ${Object.keys(sorted).length} personnages curés`);
}

main().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});
