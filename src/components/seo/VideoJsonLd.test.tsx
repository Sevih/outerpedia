/**
 * La miniature de CHAQUE `VideoObject` est l'image de partage de la page (la
 * prop `thumbnail`), toutes plateformes — jamais la miniature YouTube, qui
 * passait devant l'og:image dans les aperçus Discord (décision du 21/10).
 * `getVideoMeta` est stubé : une `uploadDate` pour tout id sauf `nometa`.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';
import { VideoJsonLd } from './VideoJsonLd';

vi.mock('@/lib/data/video-meta', () => ({
  getVideoMeta: (id: string) =>
    id === 'nometa' ? undefined : { uploadDate: '2026-01-01', title: `T ${id}` },
}));

const THUMB = 'https://img.outerpedia.com/images/characters/faceicon/FI_2000062.png';

const VIDEOS: VideoItem[] = [
  { platform: 'youtube', id: 'yt1', title: 'A' },
  { platform: 'twitch', id: 'v999', title: 'B' },
  { platform: 'bilibili', id: 'BV1x', title: 'C' },
  { platform: 'youtube', id: 'nometa', title: 'D' },
];

const nodes = (videos: VideoItem[]) =>
  [
    ...renderToStaticMarkup(<VideoJsonLd videos={videos} thumbnail={THUMB} />).matchAll(
      /<script[^>]*>(.*?)<\/script>/g,
    ),
  ].map((m) => JSON.parse(m[1]) as { embedUrl: string; thumbnailUrl: string });

describe('VideoJsonLd — miniature = image de partage de la page', () => {
  it('un nœud par vidéo datée, toutes plateformes (Twitch et Bilibili compris)', () => {
    expect(nodes(VIDEOS).map((n) => n.embedUrl)).toEqual([
      'https://www.youtube.com/embed/yt1',
      'https://player.twitch.tv/?video=v999',
      'https://player.bilibili.com/player.html?bvid=BV1x',
    ]);
  });

  it('chaque nœud porte `thumbnailUrl` = la prop, jamais ytimg', () => {
    const all = nodes(VIDEOS);
    expect(all.map((n) => n.thumbnailUrl)).toEqual([THUMB, THUMB, THUMB]);
    expect(JSON.stringify(all)).not.toContain('ytimg');
  });

  it('aucune vidéo datée → rien', () => {
    expect(renderToStaticMarkup(<VideoJsonLd videos={[VIDEOS[3]]} thumbnail={THUMB} />)).toBe('');
  });
});
