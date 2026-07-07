'use client';

import { Tabs } from './Tabs';

/**
 * Lecteur vidéo embarqué (portage V2) : iframe 16/9 par plateforme, onglets
 * quand plusieurs vidéos (seule l'active est montée), ligne titre + auteur.
 * Le JSON-LD VideoObject est émis par la page (SEO), pas ici.
 */
export type VideoPlatform = 'youtube' | 'twitch' | 'bilibili';

export interface VideoItem {
  platform: VideoPlatform;
  id: string;
  title: string;
  author?: string;
  /** Libellé court d'onglet (repli : titre). */
  label?: string;
}

const TWITCH_PARENTS = ['outerpedia.com', 'localhost'];

function embedUrl(v: VideoItem): string {
  switch (v.platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${v.id}`;
    case 'twitch': {
      const parents = TWITCH_PARENTS.map((p) => `parent=${p}`).join('&');
      return `https://player.twitch.tv/?video=${v.id}&${parents}&autoplay=false`;
    }
    case 'bilibili':
      return `https://player.bilibili.com/player.html?bvid=${v.id}&high_quality=1`;
  }
}

function VideoPane({ video }: { video: VideoItem }) {
  return (
    <div className="space-y-2">
      {(video.author || video.title) && (
        <div className="text-content-muted flex flex-wrap items-center gap-3 text-xs">
          <span className="text-content-strong font-medium">{video.title}</span>
          {video.author && <span>by {video.author}</span>}
        </div>
      )}
      <div className="border-line-subtle aspect-video w-full overflow-hidden rounded-xl border">
        <iframe
          src={embedUrl(video)}
          title={video.title}
          allow="fullscreen"
          allowFullScreen
          className="h-full w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function MultiVideoEmbed({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) return null;
  if (videos.length === 1) return <VideoPane video={videos[0]} />;
  return (
    <Tabs
      tabs={videos.map((v) => ({
        id: `${v.platform}-${v.id}`,
        label: v.label ?? v.title,
        content: <VideoPane video={v} />,
      }))}
    />
  );
}
