/**
 * fs — helpers de fichiers partagés (assets, extract) : parcours, suppression.
 */
import { readdirSync, rmSync } from 'node:fs';
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

/**
 * Suppression récursive AVEC nouvel essai — pour les sorties de `.gamedata`
 * reparties de zéro (extract, extract-audio, extract-wallpapers).
 *
 * Le 24/10/2026 sur le fixe Windows (Node 24.13.1), vider `extracted/images`
 * a planté en EPERM : le fichier du premier dossier traité était parti, puis
 * le `rmdir` du dossier vide refusé — un handle tenu un instant par un autre
 * processus (indexeur, Defender, Syncthing, Explorer). Avec `maxRetries`,
 * Node réessaie de lui-même sur EPERM, EBUSY et ENOTEMPTY (et EMFILE/ENFILE),
 * l'attente croissant de `retryDelay` à chaque essai (doc Node) : 5 essais à
 * 200 ms de pas, ≈ 3 s de patience au pire. Pas de boucle maison.
 * `force` garde le « rien à faire » quand le chemin manque.
 *
 * Si le plantage revient au même endroit à chaque relance, ce n'est plus un
 * blocage passager : trouver le processus qui tient le dossier, ne pas
 * monter les essais.
 */
export function rmTree(
  path: string,
  opts: { maxRetries?: number; retryDelay?: number } = {},
): void {
  rmSync(path, {
    recursive: true,
    force: true,
    maxRetries: opts.maxRetries ?? 5,
    retryDelay: opts.retryDelay ?? 200,
  });
}
