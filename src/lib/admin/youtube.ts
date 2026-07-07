/**
 * Client YouTube Data API v3 — outil de CURATION local (dev-only).
 *
 * Deux usages complémentaires :
 *   - `searchOfficial` : DÉCOUVERTE — cherche la vidéo d'un perso sur la/les
 *     chaîne(s) officielle(s) Outerplane. Le snippet de `/search` porte déjà
 *     titre + chaîne + date + miniature → un seul appel suffit pour proposer un
 *     candidat complet (match flou → l'humain valide sur la fiche).
 *   - `fetchMeta` : ENRICHISSEMENT — pour un id déjà connu (saisi à la main),
 *     récupère titre/auteur/date via `/videos` (1 unité, batch de 50).
 *
 * Clé lue depuis `process.env.YOUTUBE_API_KEY` (Next charge `.env.local`).
 * Coût : `/search` = 100 unités/appel, quota gratuit 10 000/jour (~100 persos).
 */

/** Chaînes officielles Outerplane (extensible : KR/JP/TW). */
export const OFFICIAL_CHANNELS: Record<string, string> = {
  Global: 'UCj3n-ek2lSiQygcnV37GVTg', // @OUTERPLANE_OFFICIAL
};

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Métadonnées récupérées d'une vidéo. */
export interface VideoMeta {
  title: string;
  author: string;
  uploadDate: string;
  thumbnail?: string;
}

/** Candidat proposé par la recherche (méta + provenance). */
export interface VideoCandidate extends VideoMeta {
  platform: 'youtube';
  id: string;
  /** Région de la chaîne officielle où il a été trouvé. */
  channel: string;
}

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY manquante (à définir dans .env.local).');
  return key;
}

interface SearchSnippet {
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails?: { medium?: { url: string }; default?: { url: string } };
}

function thumbOf(s: { thumbnails?: SearchSnippet['thumbnails'] }): string | undefined {
  return s.thumbnails?.medium?.url ?? s.thumbnails?.default?.url;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status} : ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/**
 * Cherche `query` sur les chaînes officielles. Renvoie les candidats dont le
 * titre contient le nom (match prioritaire), sinon les plus pertinents, dédupés.
 */
export async function searchOfficial(query: string): Promise<VideoCandidate[]> {
  const key = apiKey();
  const seen = new Set<string>();
  const out: VideoCandidate[] = [];

  for (const [channel, channelId] of Object.entries(OFFICIAL_CHANNELS)) {
    const params = new URLSearchParams({
      part: 'snippet',
      channelId,
      q: query,
      type: 'video',
      maxResults: '5',
      order: 'relevance',
      key,
    });
    const data = await getJson<{
      items?: Array<{ id: { videoId?: string }; snippet: SearchSnippet }>;
    }>(`${SEARCH_URL}?${params}`);

    for (const item of data.items ?? []) {
      const id = item.id.videoId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({
        platform: 'youtube',
        id,
        channel,
        title: item.snippet.title,
        author: item.snippet.channelTitle,
        uploadDate: item.snippet.publishedAt,
        thumbnail: thumbOf(item.snippet),
      });
    }
  }

  // Titre contenant le nom d'abord (match exact-ish), puis le reste.
  const q = query.toLowerCase();
  return out.sort(
    (a, b) => Number(b.title.toLowerCase().includes(q)) - Number(a.title.toLowerCase().includes(q)),
  );
}

/** Récupère les métadonnées d'ids déjà connus (batch de 50). */
export async function fetchMeta(ids: string[]): Promise<Record<string, VideoMeta>> {
  const valid = ids.filter((id) => YT_ID.test(id));
  if (!valid.length) return {};
  const key = apiKey();
  const out: Record<string, VideoMeta> = {};

  for (let i = 0; i < valid.length; i += 50) {
    const params = new URLSearchParams({
      part: 'snippet',
      fields: 'items(id,snippet(publishedAt,title,channelTitle,thumbnails))',
      id: valid.slice(i, i + 50).join(','),
      key,
    });
    const data = await getJson<{
      items?: Array<{ id: string; snippet: SearchSnippet }>;
    }>(`${VIDEOS_URL}?${params}`);
    for (const item of data.items ?? []) {
      out[item.id] = {
        title: item.snippet.title,
        author: item.snippet.channelTitle,
        uploadDate: item.snippet.publishedAt,
        thumbnail: thumbOf(item.snippet),
      };
    }
  }
  return out;
}
