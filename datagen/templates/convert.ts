/**
 * convert — parse tous les .bytes extraits en JSON, dans `.gamedata/parsed/`.
 *
 *   .gamedata/extracted/bytes/*.bytes  →  .gamedata/parsed/*.json
 *
 * Remplace l'ancien scripts/convert_bytes.py (100% TS désormais).
 *
 * Usage : pnpm datagen:convert
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseBytes } from './bytes-parser';

const IN = resolve('.gamedata/extracted/bytes');
const OUT = resolve('.gamedata/parsed');

mkdirSync(OUT, { recursive: true });
const files = readdirSync(IN).filter((f) => f.endsWith('.bytes'));

let ok = 0;
const errors: string[] = [];
for (const file of files) {
  try {
    const { rows } = parseBytes(readFileSync(join(IN, file)));
    writeFileSync(join(OUT, `${basename(file, '.bytes')}.json`), JSON.stringify(rows, null, 2));
    ok += 1;
  } catch (e) {
    errors.push(`${file} : ${(e as Error).message}`);
  }
}

console.log(`✅ Converti : ${ok}/${files.length} → ${OUT}`);
if (errors.length) {
  console.log(`⚠️  Erreurs (${errors.length}) :`);
  for (const e of errors) console.log(`  ${e}`);
}
