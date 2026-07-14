/**
 * Primitive — garde d'EXÉCUTION DIRECTE d'un module ESM.
 *
 * Les générateurs sont importables sans effet de bord par l'orchestrateur
 * (`datagen/build.ts`), mais exécutables seuls pour la revue. Le test naïf
 * `process.argv[1].endsWith('<fichier>.ts')` est fragile : deux fichiers du
 * même nom (generators/equipment.ts vs curated/equipment.ts) se déclencheraient
 * mutuellement. On compare donc les CHEMINS RÉSOLUS complets, comme Node le
 * recommande pour remplacer le `require.main === module` de CommonJS.
 */
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/** Vrai si le module appelant (`import.meta.url`) est le point d'entrée du process. */
export function isMain(moduleUrl: string): boolean {
  return !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(moduleUrl);
}
