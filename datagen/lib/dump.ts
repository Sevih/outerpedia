/**
 * dump — lecture de `dump.cs` (sortie Il2CppDumper) avec message clair s'il manque.
 *
 * C'est un artefact LOCAL, jamais committé, généré par `pnpm datagen:dump`. Les
 * générateurs (goods, recruit) y lisent des enums du client (ASSET_TYPE…).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const DUMP_PATH = resolve(process.cwd(), '.gamedata/apk/dumped/dump.cs');

/** Contenu de `dump.cs`, ou lève en pointant vers `datagen:dump`. */
export function readDump(): string {
  try {
    return readFileSync(DUMP_PATH, 'utf8');
  } catch {
    throw new Error(
      `dump.cs manquant (${DUMP_PATH}). Génère-le : \`pnpm datagen:dump\` ` +
        `(voir docs/procedure/installation.md).`,
    );
  }
}
