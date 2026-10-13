/**
 * L'ajout d'une vidéo par URL ou par id (lots B48, A48) : `resolveVideo` ne
 * fait que lire, et ne lève jamais — la route de quick rend ses refus tels
 * quels à la page. YouTube est FACTICE : aucun test n'appelle l'API (quota), et
 * une vidéo Twitch ou Bilibili ne l'appelle JAMAIS — son titre est saisi.
 */
import { describe, expect, it, vi } from 'vitest';
import { isVideoPlatform, resolveVideo, youtubeId, type FetchVideoMeta } from './video-add';

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
        platform: 'youtube',
        id: ID,
        title: 'Slacking Surfer, Aer',
        author: 'OUTERPLANE',
        uploadDate: '2025-09-22T10:00:00Z',
      },
    });
    expect(fetchMeta.mock.calls).toEqual([[[ID]]]);
  });

  it('YouTube : le titre saisi n’y change rien, c’est celui de YouTube qui est rendu', async () => {
    const out = await resolveVideo(ID, youtube(), 'Un autre titre');
    expect(out).toMatchObject({ video: { platform: 'youtube', title: 'Slacking Surfer, Aer' } });
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

describe('resolveVideo — Twitch et Bilibili : le titre saisi, aucun appel réseau', () => {
  const VOD = '2222222222';
  const BV = 'BV11EXHBNEt2';

  it('une VOD Twitch : l’id numérique, sans le `v`, et le titre saisi — ni auteur ni date', async () => {
    const fetchMeta = youtube();
    for (const url of [
      `https://www.twitch.tv/videos/${VOD}`,
      `twitch.tv/videos/${VOD}?t=1h2m3s`,
      ` https://m.twitch.tv/videos/v${VOD}/ `,
    ]) {
      const out = await resolveVideo(url, fetchMeta, '  Guild Raid VOD ');
      expect(out, url).toEqual({ video: { platform: 'twitch', id: VOD, title: 'Guild Raid VOD' } });
      expect(Object.keys((out as { video: object }).video)).toEqual(['platform', 'id', 'title']);
    }
    expect(fetchMeta).not.toHaveBeenCalled();
  });

  it('une vidéo Bilibili : l’id `BV…` de l’URL et le titre saisi — ni auteur ni date', async () => {
    const fetchMeta = youtube();
    for (const url of [
      `https://www.bilibili.com/video/${BV}`,
      `https://www.bilibili.com/video/${BV}/?spm_id_from=333.1007&vd_source=abc`,
      `m.bilibili.com/video/${BV}#reply`,
    ]) {
      const out = await resolveVideo(url, fetchMeta, '异域战记');
      expect(out, url).toEqual({ video: { platform: 'bilibili', id: BV, title: '异域战记' } });
      expect(Object.keys((out as { video: object }).video)).toEqual(['platform', 'id', 'title']);
    }
    expect(fetchMeta).not.toHaveBeenCalled();
  });

  it('sans titre (absent, vide, pas une chaîne) : refusé, pour l’une comme pour l’autre', async () => {
    const fetchMeta = youtube();
    for (const url of [
      `https://www.twitch.tv/videos/${VOD}`,
      `https://www.bilibili.com/video/${BV}`,
    ])
      for (const title of [undefined, '', '   ', null, 42])
        expect(await resolveVideo(url, fetchMeta, title), `${url} · ${String(title)}`).toEqual({
          error: 'titre requis pour une vidéo Twitch ou Bilibili',
        });
    expect(fetchMeta).not.toHaveBeenCalled();
  });

  it('ce qui ne s’embarque pas est refusé en citant la saisie, titre donné ou non : chaîne, live, clip, `av…`', async () => {
    const fetchMeta = youtube();
    const channel = "une chaîne ou un live Twitch n'est pas une VOD (twitch.tv/videos/<n>)";
    const clip = "un clip Twitch n'est pas une VOD";
    const notBilibili = 'pas une vidéo Bilibili (bilibili.com/video/BV…)';
    for (const [input, error] of [
      // Une chaîne — son live est à la même adresse.
      ['https://www.twitch.tv/outerplane', channel],
      ['https://player.twitch.tv/?channel=outerplane', channel],
      ['https://www.twitch.tv/videos', channel],
      ['https://clips.twitch.tv/BraveSlug-abc123', clip],
      ['https://www.twitch.tv/outerplane/clip/BraveSlug-abc123', clip],
      ['https://live.bilibili.com/22625025', "un live Bilibili n'est pas une vidéo"],
      [
        'https://www.bilibili.com/video/av170001',
        "un id « av… » Bilibili ne s'embarque pas, colle l'URL en BV…",
      ],
      ['https://www.bilibili.com/', notBilibili],
      ['https://b23.tv/abc123', notBilibili],
      // Un id `BV…` tronqué n'en est pas un.
      ['https://www.bilibili.com/video/BV11EXHBNE', notBilibili],
    ] as const)
      for (const title of [undefined, 'Un titre'])
        expect(await resolveVideo(input, fetchMeta, title), input).toEqual({
          error: `${error} : ${input}`,
        });
    expect(fetchMeta).not.toHaveBeenCalled();
  });

  it('un id nu ambigu — des chiffres seuls, un `av…` : refusé sans appeler YouTube, même sur onze caractères', async () => {
    const fetchMeta = youtube();
    for (const input of [VOD, '12345678901', 'av170001', 'av123456789'])
      expect(await resolveVideo(input, fetchMeta, 'Un titre'), input).toEqual({
        error: `id nu ambigu, colle l'URL complète de la vidéo : ${input}`,
      });
    // Un `BV…` nu n'est pas une des formes reconnues : l'URL est attendue.
    expect(await resolveVideo(BV, fetchMeta, 'Un titre')).toEqual({
      error: `pas un id YouTube : ${BV}`,
    });
    expect(fetchMeta).not.toHaveBeenCalled();
  });
});

describe('isVideoPlatform — les plateformes qu’un curé porte', () => {
  it('les trois que le site rend, rien d’autre', () => {
    for (const platform of ['youtube', 'twitch', 'bilibili'])
      expect(isVideoPlatform(platform), platform).toBe(true);
    for (const other of ['vimeo', 'YouTube', '', 'toString', undefined, null, 3])
      expect(isVideoPlatform(other), String(other)).toBe(false);
  });
});
