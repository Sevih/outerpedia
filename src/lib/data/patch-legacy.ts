/**
 * Chargement À LA DEMANDE de l'archive Smilegate des patch notes
 * (`data/patch-notes/legacy-posts.json`, 2,8 Mo, EN only, figée) : `import()`
 * dynamique, donc un chunk séparé — rien dans le bundle initial. Ce module ne
 * doit JAMAIS l'importer statiquement. La mémoïsation reste chez l'appelant.
 */
import type { PatchNotePost } from '@/lib/data/patch-posts';

export async function loadLegacyPosts(): Promise<PatchNotePost[]> {
  const m = await import('@data/patch-notes/legacy-posts.json');
  return (m.default as { posts: PatchNotePost[] }).posts;
}
