/**
 * Les notes officielles de l'onglet Discord, lues dans
 * `data/patch-notes/posts.json` (le fichier que `pnpm getNews` réécrit) par le
 * serveur de quick lui-même — pas par `@/lib/data/patch-posts`, dont l'import
 * JSON statique fige la liste au chargement du module : le site le veut ainsi
 * (le build embarque la donnée), quick non.
 *
 * Le cache est tenu par la mtime et la taille du fichier, relues à chaque
 * demande : un « Get news » lancé de l'onglet Patch, d'un terminal ou d'ailleurs
 * est vu à la demande suivante, sans redémarrer l'outil. Les 7 Mo de JSON ne
 * sont lus qu'à la première demande, puis à chaque changement du fichier.
 */
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { NotePost } from './discord';

/** Le même chemin que `OUT_DIR` de `scripts/get-news.ts`. */
export const POSTS_FILE = resolve('data/patch-notes/posts.json');

export interface PatchPostsDeps {
  readFile?: (file: string) => Promise<string>;
  stat?: (file: string) => Promise<{ mtimeMs: number; size: number }>;
  warn?: (message: string) => void;
}

/**
 * Le lecteur des notes de `file`. Un fichier absent, illisible ou d'une autre
 * forme rend une liste vide et un avertissement — une fois par état du fichier,
 * pas à chaque demande de l'onglet.
 */
export function patchPostsReader(
  file: string = POSTS_FILE,
  deps: PatchPostsDeps = {},
): () => Promise<NotePost[]> {
  const read = deps.readFile ?? ((f: string) => readFile(f, 'utf8'));
  const look = deps.stat ?? stat;
  const warn = deps.warn ?? ((m: string) => console.warn(m));
  // La promesse est gardée, pas son résultat : deux demandes simultanées
  // partagent la même lecture.
  let cached: { key: string; posts: Promise<NotePost[]> } | null = null;

  const load = async (): Promise<NotePost[]> => {
    try {
      const data = JSON.parse(await read(file)) as { posts?: unknown };
      if (Array.isArray(data?.posts)) return data.posts as NotePost[];
      warn(`[quick] notes de patch : ${file} sans tableau « posts », liste vide`);
    } catch (e) {
      warn(`[quick] notes de patch : ${file} illisible (${String(e)}), liste vide`);
    }
    return [];
  };

  return async () => {
    let key: string;
    try {
      const s = await look(file);
      key = `${s.mtimeMs}:${s.size}`;
    } catch (e) {
      if (cached?.key !== 'absent')
        warn(`[quick] notes de patch : ${file} introuvable (${String(e)}), liste vide`);
      cached = { key: 'absent', posts: Promise.resolve([]) };
      return [];
    }
    if (cached?.key !== key) cached = { key, posts: load() };
    return cached.posts;
  };
}
