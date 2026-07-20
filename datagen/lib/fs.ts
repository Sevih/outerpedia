/**
 * fs — helpers de parcours de fichiers partagés (assets, extract).
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Parcours récursif des FICHIERS d'un dossier — la descente que hero-full-art,
 * source, extract-audio et pull-gamedata recopiaient chacun. Le FILTRE et
 * l'accumulation restent chez l'appelant (callback).
 *
 * - `rel` est le chemin relatif à la racine du parcours, séparateur `/` (clé
 *   portable — pull-gamedata compare ces clés à des listings Android).
 * - `sorted` fige l'ordre de descente (localeCompare par dossier) : à activer
 *   UNIQUEMENT quand un « premier vu gagne » en dépend (index d'images de
 *   source.ts). Les autres parcours gardent l'ordre naturel du FS — le trier
 *   changerait quel doublon gagne (hero-full-art).
 */
export function walkFiles(
  root: string,
  onFile: (abs: string, rel: string) => void,
  opts: { sorted?: boolean } = {},
): void {
  const walk = (dir: string, prefix: string): void => {
    let entries = readdirSync(dir, { withFileTypes: true });
    if (opts.sorted) entries = entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entries) {
      const abs = join(dir, e.name);
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(abs, rel);
      else if (e.isFile()) onFile(abs, rel);
    }
  };
  walk(root, '');
}
