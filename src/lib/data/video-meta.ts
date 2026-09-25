/**
 * Accès aux MÉTADONNÉES des vidéos embarquées (`data/generated/video-meta.json`,
 * id YouTube → date/titre/auteur) — le JSON-LD VideoObject.
 */
import type { VideoMeta } from '@datagen/video-meta';
import videoMetaData from '@data/generated/video-meta.json';

const VIDEO_META = videoMetaData as Record<string, VideoMeta>;

export function getVideoMeta(id: string): VideoMeta | undefined {
  return VIDEO_META[id];
}
