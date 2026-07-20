/**
 * convert — parse tous les .bytes extraits en JSON, dans `.gamedata/parsed/`.
 *
 *   .gamedata/extracted/bytes/*.bytes  →  .gamedata/parsed/*.json
 *
 * Remplace l'ancien scripts/convert_bytes.py (100% TS désormais).
 *
 * Toutes les tables sont tentées, les erreurs COLLECTÉES puis listées en fin
 * de run ; s'il y en a au moins une, le process sort en code 1 (une table
 * illisible rendrait la génération aval incomplète en silence).
 *
 * Usage : pnpm datagen:convert
 */
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { parseBytes } from './bytes-parser';

const IN = resolve('.gamedata/extracted/bytes');
const OUT = resolve('.gamedata/parsed');

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const files = readdirSync(IN).filter((f) => f.endsWith('.bytes'));

  // PURGE des tables FANTÔMES avant conversion : un .json dont le .bytes source
  // a disparu (table retirée du jeu) resterait sinon servi À VIE par `loadTable`.
  // Après ce run, `parsed/` reflète exactement le corpus extrait.
  const live = new Set(files.map((f) => basename(f, '.bytes')));
  const ghosts = readdirSync(OUT).filter(
    (f) => f.endsWith('.json') && !live.has(basename(f, '.json')),
  );
  for (const f of ghosts) unlinkSync(join(OUT, f));
  if (ghosts.length)
    console.log(`🧹 Tables fantômes purgées (${ghosts.length}) : ${ghosts.join(', ')}`);

  let ok = 0;
  const errors: string[] = [];
  for (const file of files) {
    try {
      const name = basename(file, '.bytes');
      // format auto-descriptif : on garde les COLONNES (depuis l'en-tête) avec les lignes.
      // Les lignes restent creuses (champs vides omis) ; `columns` donne le schéma complet
      // → ne JAMAIS déduire les colonnes depuis row[0].
      const parsed = parseBytes(readFileSync(join(IN, file)));
      writeFileSync(join(OUT, `${name}.json`), JSON.stringify(parsed, null, 2));
      ok += 1;
    } catch (e) {
      errors.push(`${file} : ${(e as Error).message}`);
    }
  }

  console.log(`✅ Converti : ${ok}/${files.length} → ${OUT}`);
  if (errors.length) {
    console.log(`⚠️  Erreurs (${errors.length}) :`);
    for (const e of errors) console.log(`  ${e}`);
    // Une table illisible = donnée générée incomplète en aval (build tournerait
    // sur un corpus troué, promote proposerait des RETRAITS fantômes). On sort
    // donc en échec — mais seulement APRÈS avoir tout converti et tout listé,
    // pour que le rapport couvre l'ensemble des tables en un run. Côté
    // `refresh.ts`, `step()` (execFileSync) propage l'échec : la chaîne s'arrête
    // avant build/promote et le stamp n'est pas écrit → auto-réparation au
    // prochain run, comme pour tout step planté.
    process.exitCode = 1;
  }
}

// Exécution directe seulement (`pnpm datagen:convert`) — un import ne doit pas
// déclencher une conversion (ni la purge des fantômes).
if (isMain(import.meta.url)) main();
