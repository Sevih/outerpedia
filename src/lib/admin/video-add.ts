/**
 * L'ajout d'une vidéo par son URL (YouTube, Twitch, Bilibili) ou son id
 * YouTube — outil de CURATION local (quick : la carte Vidéos d'une fiche de
 * perso, le sous-onglet Vidéos d'un guide).
 *
 * `resolveVideo` ne fait que LIRE : il tire la plateforme et l'id de ce qui a
 * été collé. YouTube : ses métadonnées sont demandées à l'API (`fetchMeta`,
 * injecté — 1 unité de quota). Twitch et Bilibili : AUCUN appel réseau, le
 * titre est celui que la page a saisi. Rien n'est écrit : la page pose l'entrée
 * dans sa liste, qui part avec « Enregistrer ». Le DOUBLON n'est pas jugé ici —
 * c'est l'appelant qui connaît la liste où la vidéo irait.
 */
import type { VideoPlatform } from '@/components/ui/MultiVideoEmbed';
import type { VideoMeta } from '@/lib/admin/youtube';

/** Les plateformes que le site sait rendre (`MultiVideoEmbed`) : les seules qu'un curé porte. */
const PLATFORMS: Record<VideoPlatform, true> = { youtube: true, twitch: true, bilibili: true };

export const isVideoPlatform = (value: unknown): value is VideoPlatform =>
  typeof value === 'string' && Object.hasOwn(PLATFORMS, value);

/** Id YouTube d'une URL collée, ou l'id lui-même s'il est déjà nu. */
export function youtubeId(input: string): string | null {
  const raw = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const m = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * La vidéo d'une URL Twitch ou Bilibili — `null` quand la saisie n'est d'aucune
 * des deux. Seules une VOD Twitch (`twitch.tv/videos/<n>`, l'id numérique sans
 * le `v`) et une vidéo Bilibili en `BV…` s'embarquent : une chaîne, un live, un
 * clip, un ancien id `av…` sont refusés, en citant la saisie.
 */
function hostedVideo(
  raw: string,
): { platform: 'twitch' | 'bilibili'; id: string } | { error: string } | null {
  if (/(?:^|[/.])twitch\.tv(?:[/?#]|$)/i.test(raw)) {
    if (/clips\.twitch\.tv|\/clip\//i.test(raw))
      return { error: `un clip Twitch n'est pas une VOD : ${raw}` };
    const vod = raw.match(/twitch\.tv\/videos\/v?(\d+)(?:[/?#]|$)/i);
    if (vod) return { platform: 'twitch', id: vod[1] };
    return {
      error: `une chaîne ou un live Twitch n'est pas une VOD (twitch.tv/videos/<n>) : ${raw}`,
    };
  }
  if (/(?:^|[/.])(?:bilibili\.com|b23\.tv)(?:[/?#]|$)/i.test(raw)) {
    if (/live\.bilibili\.com/i.test(raw))
      return { error: `un live Bilibili n'est pas une vidéo : ${raw}` };
    const bv = raw.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]{10})(?:[/?#]|$)/);
    if (bv) return { platform: 'bilibili', id: bv[1] };
    if (/\/video\/av\d+/i.test(raw))
      return { error: `un id « av… » Bilibili ne s'embarque pas, colle l'URL en BV… : ${raw}` };
    return { error: `pas une vidéo Bilibili (bilibili.com/video/BV…) : ${raw}` };
  }
  return null;
}

/**
 * Une vidéo résolue : de quoi écrire une entrée du curé d'un perso ou d'un
 * guide. `author` et `uploadDate` ne viennent que de YouTube.
 */
export interface ResolvedVideo {
  platform: VideoPlatform;
  id: string;
  title: string;
  author?: string;
  uploadDate?: string;
}

/** `fetchMeta` de `youtube.ts`, tel que `resolveVideo` s'en sert. */
export type FetchVideoMeta = (ids: string[]) => Promise<Record<string, VideoMeta>>;

/**
 * La vidéo que désigne `input` : une URL YouTube ou un id nu (métadonnées
 * comprises), une VOD Twitch ou une vidéo Bilibili (leur `title` saisi,
 * obligatoire — `fetchMeta` n'est pas appelé). Tout refus est RENDU, jamais
 * levé : une forme qui ne s'embarque pas, un titre absent, un id nu ambigu, pas
 * un id YouTube, vidéo introuvable, YouTube injoignable (clé absente, quota,
 * réseau).
 */
export async function resolveVideo(
  input: unknown,
  fetchMeta: FetchVideoMeta,
  title?: unknown,
): Promise<{ video: ResolvedVideo } | { error: string }> {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return { error: 'URL ou id requis' };
  const hosted = hostedVideo(raw);
  if (hosted) {
    if ('error' in hosted) return hosted;
    const named = typeof title === 'string' ? title.trim() : '';
    if (!named) return { error: 'titre requis pour une vidéo Twitch ou Bilibili' };
    return { video: { ...hosted, title: named } };
  }
  // Des chiffres seuls (une VOD Twitch ? un `av…` ?) : onze d'entre eux passeraient pour un id YouTube.
  if (/^(?:av)?\d+$/i.test(raw))
    return { error: `id nu ambigu, colle l'URL complète de la vidéo : ${raw}` };
  const id = youtubeId(raw);
  if (!id) return { error: `pas un id YouTube : ${raw}` };
  let meta: VideoMeta | undefined;
  try {
    meta = (await fetchMeta([id]))[id];
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  if (!meta) return { error: `vidéo introuvable : YouTube ne connaît pas ${id}` };
  return {
    video: {
      platform: 'youtube',
      id,
      title: meta.title,
      author: meta.author,
      uploadDate: meta.uploadDate,
    },
  };
}
