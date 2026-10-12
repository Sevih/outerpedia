/**
 * L'ajout d'une vidéo par URL ou par id (lot B48) : `resolveVideo` ne fait que
 * lire, et ne lève jamais — la route de quick rend ses refus tels quels à la
 * page. YouTube est FACTICE : aucun test n'appelle l'API (quota).
 */
import { describe, expect, it, vi } from 'vitest';
import { resolveVideo, youtubeId, type FetchVideoMeta } from './video-add';

const ID = 'zvgoCGKtIfo';
const META = {
  title: 'Slacking Surfer, Aer',
  author: 'OUTERPLANE',
  uploadDate: '2025-09-22T10:00:00Z',
  thumbnail: 'https://i.ytimg.com/vi/zvgoCGKtIfo/mqdefault.jpg',
};
/** YouTube factice : il ne connaît que `ID`, et note ce qu'on lui demande. */
const youtube = () =>
  vi.fn<FetchVideoMeta>(async (ids) => Object.fromEntries(ids.includes(ID) ? [[ID, META]] : []));

describe('youtubeId — l’id d’une URL collée', () => {
  it('rend un id nu tel quel, blancs autour compris', () => {
    expect(youtubeId(ID)).toBe(ID);
    expect(youtubeId(`  ${ID}\n`)).toBe(ID);
  });

  it('le tire de chaque forme d’URL YouTube', () => {
    for (const url of [
      `https://www.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/watch?list=PL1&v=${ID}&t=42s`,
      `https://youtu.be/${ID}?si=abc`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
    ])
      expect(youtubeId(url), url).toBe(ID);
  });

  it('refuse ce qui n’en porte pas', () => {
    for (const bad of ['', 'aer', 'https://vimeo.com/123456', `${ID}x`, ID.slice(1)])
      expect(youtubeId(bad), bad).toBeNull();
  });
});

describe('resolveVideo — la vidéo d’une URL ou d’un id, métadonnées comprises', () => {
  it('une URL : l’id, le titre, l’auteur et la date — sans la miniature, dérivée de l’id', async () => {
    const fetchMeta = youtube();
    expect(await resolveVideo(` https://youtu.be/${ID} `, fetchMeta)).toEqual({
      video: {
        id: ID,
        title: 'Slacking Surfer, Aer',
        author: 'OUTERPLANE',
        uploadDate: '2025-09-22T10:00:00Z',
      },
    });
    expect(fetchMeta.mock.calls).toEqual([[[ID]]]);
  });

  it('une saisie vide ou qui n’est pas une chaîne : refusée, sans appeler YouTube', async () => {
    const fetchMeta = youtube();
    for (const input of ['', '   ', undefined, null, 42, { input: ID }])
      expect(await resolveVideo(input, fetchMeta)).toEqual({ error: 'URL ou id requis' });
    expect(fetchMeta).not.toHaveBeenCalled();
  });

  it('pas un id YouTube : refusé en citant la saisie, sans appeler YouTube', async () => {
    const fetchMeta = youtube();
    expect(await resolveVideo('https://vimeo.com/123456', fetchMeta)).toEqual({
      error: 'pas un id YouTube : https://vimeo.com/123456',
    });
    expect(fetchMeta).not.toHaveBeenCalled();
  });

  it('un id que YouTube ne connaît pas : vidéo introuvable', async () => {
    expect(await resolveVideo('AAAAAAAAAAA', youtube())).toEqual({
      error: 'vidéo introuvable : YouTube ne connaît pas AAAAAAAAAAA',
    });
  });

  it('YouTube injoignable (clé absente, quota) : le refus est rendu, jamais levé', async () => {
    const down: FetchVideoMeta = async () => {
      throw new Error('YOUTUBE_API_KEY missing (set it in .env.local).');
    };
    expect(await resolveVideo(ID, down)).toEqual({
      error: 'YOUTUBE_API_KEY missing (set it in .env.local).',
    });
    const odd: FetchVideoMeta = async () => {
      throw 'quota';
    };
    expect(await resolveVideo(ID, odd)).toEqual({ error: 'quota' });
  });
});
