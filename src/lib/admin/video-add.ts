/**
 * L'ajout d'une vidéo YouTube par son URL ou son id — outil de CURATION local
 * (quick : la carte Vidéos d'une fiche de perso, le sous-onglet Vidéos d'un
 * guide).
 *
 * `resolveVideo` ne fait que LIRE : il tire l'id de ce qui a été collé,
 * demande ses métadonnées à YouTube (`fetchMeta`, injecté — 1 unité de quota)
 * et les rend. Rien n'est écrit : la page pose l'entrée dans sa liste, qui part
 * avec « Enregistrer ». Le DOUBLON n'est pas jugé ici — c'est l'appelant qui
 * connaît la liste où la vidéo irait.
 */
import type { VideoMeta } from '@/lib/admin/youtube';

/** Id YouTube d'une URL collée, ou l'id lui-même s'il est déjà nu. */
export function youtubeId(input: string): string | null {
  const raw = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const m = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** Une vidéo résolue : de quoi écrire une entrée du curé d'un perso ou d'un guide. */
export interface ResolvedVideo {
  id: string;
  title: string;
  author: string;
  uploadDate: string;
}

/** `fetchMeta` de `youtube.ts`, tel que `resolveVideo` s'en sert. */
export type FetchVideoMeta = (ids: string[]) => Promise<Record<string, VideoMeta>>;

/**
 * La vidéo que désigne `input` (une URL YouTube, ou un id nu), métadonnées
 * comprises. Tout refus est RENDU, jamais levé : pas un id YouTube, vidéo
 * introuvable, YouTube injoignable (clé absente, quota, réseau).
 */
export async function resolveVideo(
  input: unknown,
  fetchMeta: FetchVideoMeta,
): Promise<{ video: ResolvedVideo } | { error: string }> {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return { error: 'URL ou id requis' };
  const id = youtubeId(raw);
  if (!id) return { error: `pas un id YouTube : ${raw}` };
  let meta: VideoMeta | undefined;
  try {
    meta = (await fetchMeta([id]))[id];
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  if (!meta) return { error: `vidéo introuvable : YouTube ne connaît pas ${id}` };
  return { video: { id, title: meta.title, author: meta.author, uploadDate: meta.uploadDate } };
}
