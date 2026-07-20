import JsonLd from '@/components/seo/JsonLd';
import { buildVideoObjectJsonLd } from '@/lib/seo';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';
import videoMetaData from '@data/generated/video-meta.json';

type VideoMeta = { uploadDate: string; title: string; author: string };
const VIDEO_META = videoMetaData as Record<string, VideoMeta>;

/**
 * JSON-LD VideoObject des vidéos embarquées — le pendant SEO de
 * `MultiVideoEmbed`, émis CÔTÉ SERVEUR par la page/le moteur qui la rend
 * (MultiVideoEmbed est client et ne s'en occupe pas, cf. son en-tête).
 *
 * Google exige `uploadDate` : elle vient de `data/generated/video-meta.json`
 * (cache YouTube maintenu par `pnpm datagen:video-meta`, collecte data-driven).
 * Une vidéo sans meta (non-YouTube, id pas encore fetché, vidéo disparue)
 * n'émet RIEN — mieux vaut pas de schéma qu'un schéma invalide.
 */
export function VideoJsonLd({ videos }: { videos: VideoItem[] }) {
  const nodes = videos.flatMap((v) => {
    const meta = VIDEO_META[v.id];
    const node = buildVideoObjectJsonLd({
      platform: v.platform,
      id: v.id,
      title: v.title || meta?.title || '',
      author: v.author ?? meta?.author,
      uploadDate: meta?.uploadDate,
    });
    return node ? [{ id: v.id, node }] : [];
  });
  if (!nodes.length) return null;
  return (
    <>
      {nodes.map(({ id, node }) => (
        <JsonLd key={id} id={`ld-video-${id}`} data={node} />
      ))}
    </>
  );
}
