/**
 * Accès aux POSTS de patch notes Major9 (`data/patch-notes/posts.json`, scrape
 * getNews, 6,7 Mo — toutes langues). Serveur : l'outil n'en passe au client que
 * la langue courante. L'archive Smilegate a son propre module
 * (`patch-legacy.ts`, chargement à la demande).
 */
import postsData from '@data/patch-notes/posts.json';

/** Un post tel que stocké (HTML WordPress dans `content`). */
export interface PatchNotePost {
  id: number | string;
  date: string;
  slug: string;
  lang: string;
  type: string;
  title: string;
  content: string;
}

const POSTS = (postsData as { posts: PatchNotePost[] }).posts;

export function getPatchPosts(): PatchNotePost[] {
  return POSTS;
}
