import { describe, expect, it } from 'vitest';
import {
  createPageMetadata,
  getMonthYear,
  buildSiteJsonLd,
  buildBreadcrumbJsonLd,
  buildVideoGameCharacterJsonLd,
  buildItemListJsonLd,
  buildVideoObjectJsonLd,
  buildArticleJsonLd,
  buildFaqJsonLd,
} from '@/lib/seo';
import { buildUrl, CANONICAL_ORIGIN } from '@/lib/site';
import { LANGS, LANGUAGES, DEFAULT_LANG } from '@/lib/i18n/config';

/**
 * `seo.ts` — builders de métadonnées et de JSON-LD. On dérive les URLs attendues
 * des MÊMES helpers (`buildUrl`/`CANONICAL_ORIGIN`) que le module sous test :
 * les assertions restent vraies quel que soit le profil de déploiement (l'env
 * d'URL est déjà couvert par `site.test.ts`), on ne teste ici que la LOGIQUE des
 * builders.
 */

describe('createPageMetadata — canonical & hreflang', () => {
  it('canonical = URL de la langue courante ; alternates = toutes les langues + x-default', () => {
    const meta = createPageMetadata({
      lang: 'en',
      path: '/characters',
      title: 'Roster',
      description: 'D',
    });
    expect(meta.alternates?.canonical).toBe(buildUrl('en', '/characters'));
    const langs = meta.alternates?.languages as Record<string, string>;
    for (const l of LANGS) {
      expect(langs[LANGUAGES[l].htmlLang]).toBe(buildUrl(l, '/characters'));
    }
    expect(langs['x-default']).toBe(buildUrl(DEFAULT_LANG, '/characters'));
  });

  it('mappe le hreflang sur le htmlLang (pas la clé de langue) : jp → ja, kr → ko', () => {
    const langs = createPageMetadata({ lang: 'en', path: '/x', title: 'T', description: 'D' })
      .alternates?.languages as Record<string, string>;
    expect(langs['ja']).toBe(buildUrl('jp', '/x'));
    expect(langs['ko']).toBe(buildUrl('kr', '/x'));
    expect(langs['zz']).toBeUndefined();
  });
});

describe('createPageMetadata — titre, OG, Twitter, robots', () => {
  it('suffixe le titre par « | Outerpedia », sauf quand le titre EST le nom du site', () => {
    const page = createPageMetadata({ lang: 'en', path: '/x', title: 'Guides', description: 'D' });
    expect(page.title).toBe('Guides');
    expect(page.openGraph?.title).toBe('Guides | Outerpedia');

    const home = createPageMetadata({
      lang: 'en',
      path: '/',
      title: 'Outerpedia',
      description: 'D',
    });
    expect(home.openGraph?.title).toBe('Outerpedia');
  });

  it('image OG par défaut = 1200×630 + carte Twitter large', () => {
    const meta = createPageMetadata({ lang: 'en', path: '/x', title: 'T', description: 'D' });
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      images: [{ width: 1200, height: 630 }],
    });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('image custom CARRÉE = 150×150 + carte Twitter « summary »', () => {
    const meta = createPageMetadata({
      lang: 'en',
      path: '/x',
      title: 'T',
      description: 'D',
      ogImage: 'https://cdn.example/portrait.png',
    });
    expect(meta.openGraph).toMatchObject({ images: [{ width: 150, height: 150 }] });
    expect(meta.twitter).toMatchObject({ card: 'summary' });
  });

  it('image custom PAYSAGE (via ogImageSize) repasse en carte large', () => {
    const meta = createPageMetadata({
      lang: 'en',
      path: '/x',
      title: 'T',
      description: 'D',
      ogImage: 'https://cdn.example/wide.png',
      ogImageSize: { width: 800, height: 400 },
    });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('noindex pose robots { index:false, follow:false } ; absent sinon', () => {
    const hidden = createPageMetadata({
      lang: 'en',
      path: '/x',
      title: 'T',
      description: 'D',
      noindex: true,
    });
    expect(hidden.robots).toEqual({ index: false, follow: false });

    const visible = createPageMetadata({ lang: 'en', path: '/x', title: 'T', description: 'D' });
    expect(visible.robots).toBeUndefined();
  });

  it('locale OG dérivée du htmlLang (tiret → underscore)', () => {
    const meta = createPageMetadata({ lang: 'jp', path: '/x', title: 'T', description: 'D' });
    expect(meta.openGraph?.locale).toBe(LANGUAGES.jp.htmlLang.replace('-', '_'));
  });

  it('article : og:type=article + published/modified/authors quand fournis', () => {
    const meta = createPageMetadata({
      lang: 'en',
      path: '/g',
      title: 'T',
      description: 'D',
      article: {
        publishedTime: '2026-01-01',
        modifiedTime: '2026-02-02',
        authors: ['Sevih'],
      },
    });
    expect(meta.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-01-01',
      modifiedTime: '2026-02-02',
      authors: ['Sevih'],
    });
  });

  it('article vide : type article mais aucune clé date/auteur parasite', () => {
    const og = createPageMetadata({
      lang: 'en',
      path: '/g',
      title: 'T',
      description: 'D',
      article: {},
    }).openGraph as Record<string, unknown>;
    expect(og.type).toBe('article');
    expect(og).not.toHaveProperty('publishedTime');
    expect(og).not.toHaveProperty('authors');
  });
});

describe('buildSiteJsonLd', () => {
  it('graphe @context/@graph connecté : WebSite→VideoGame→éditeurs, @id sur l’origine canonique', () => {
    const node = buildSiteJsonLd('en', 'Desc du site');
    expect(node['@context']).toBe('https://schema.org');
    expect(node).toMatchObject({
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${CANONICAL_ORIGIN}/#website`,
          url: buildUrl('en', '/'),
          description: 'Desc du site',
          inLanguage: LANGUAGES.en.htmlLang,
          about: { '@id': `${CANONICAL_ORIGIN}/#videogame` },
        },
        { '@type': 'VideoGame', '@id': `${CANONICAL_ORIGIN}/#videogame` },
        { '@type': 'Organization' },
        { '@type': 'Organization', '@id': `${CANONICAL_ORIGIN}/#publisher` },
      ],
    });
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('positions 1-based, name + item préservés', () => {
    const node = buildBreadcrumbJsonLd([
      { name: 'Home', url: 'https://x/' },
      { name: 'Guides', url: 'https://x/guides' },
    ]);
    expect(node).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://x/' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://x/guides' },
      ],
    });
  });
});

describe('buildVideoGameCharacterJsonLd — image absolutisée', () => {
  const base = { lang: 'en' as const, path: '/characters/x', name: 'X', description: 'D' };

  it('lié au VideoGame ; image relative préfixée de l’origine canonique', () => {
    const node = buildVideoGameCharacterJsonLd({ ...base, image: '/images/x.png' });
    expect(node).toMatchObject({
      '@type': 'VideoGameCharacter',
      url: buildUrl('en', '/characters/x'),
      partOf: { '@id': `${CANONICAL_ORIGIN}/#videogame` },
      image: `${CANONICAL_ORIGIN}/images/x.png`,
    });
  });

  it('image déjà absolue (http) : laissée telle quelle', () => {
    const node = buildVideoGameCharacterJsonLd({ ...base, image: 'https://cdn/x.png' });
    expect(node.image).toBe('https://cdn/x.png');
  });

  it('sans image : pas de clé image', () => {
    const node = buildVideoGameCharacterJsonLd(base) as Record<string, unknown>;
    expect(node).not.toHaveProperty('image');
  });
});

describe('buildItemListJsonLd', () => {
  const items = [
    { name: 'A', url: 'https://x/a' },
    { name: 'B', url: 'https://x/b' },
  ];

  it('numberOfItems + positions ; ordre Ascending par défaut', () => {
    const node = buildItemListJsonLd({ name: 'L', items });
    expect(node).toMatchObject({
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: [
        { position: 1, name: 'A', url: 'https://x/a' },
        { position: 2, name: 'B', url: 'https://x/b' },
      ],
    });
  });

  it('ordre Descending / Unordered → URLs schema.org correspondantes', () => {
    expect(
      buildItemListJsonLd({ name: 'L', items, itemListOrder: 'Descending' }).itemListOrder,
    ).toBe('https://schema.org/ItemListOrderDescending');
    expect(
      buildItemListJsonLd({ name: 'L', items, itemListOrder: 'Unordered' }).itemListOrder,
    ).toBe('https://schema.org/ItemListUnordered');
  });

  it('description / url : présents seulement si fournis', () => {
    const bare = buildItemListJsonLd({ name: 'L', items }) as Record<string, unknown>;
    expect(bare).not.toHaveProperty('description');
    expect(bare).not.toHaveProperty('url');
    const full = buildItemListJsonLd({ name: 'L', items, description: 'DD', url: 'https://x/l' });
    expect(full).toMatchObject({ description: 'DD', url: 'https://x/l' });
  });
});

describe('buildVideoObjectJsonLd', () => {
  it('YouTube : embed/content/miniature dérivés de l’id', () => {
    const node = buildVideoObjectJsonLd({
      platform: 'youtube',
      id: 'abc123',
      title: 'V',
      uploadDate: '2026-01-01',
    });
    expect(node).toMatchObject({
      '@type': 'VideoObject',
      embedUrl: 'https://www.youtube.com/embed/abc123',
      contentUrl: 'https://www.youtube.com/watch?v=abc123',
      thumbnailUrl: 'https://i.ytimg.com/vi/abc123/hqdefault.jpg',
      uploadDate: '2026-01-01',
    });
  });

  it('champ requis Google manquant (uploadDate) → null', () => {
    expect(buildVideoObjectJsonLd({ platform: 'youtube', id: 'abc123', title: 'V' })).toBeNull();
  });

  it('Twitch sans miniature dérivable → null ; avec miniature → node, contentUrl sans le « v »', () => {
    expect(
      buildVideoObjectJsonLd({
        platform: 'twitch',
        id: 'v999',
        title: 'V',
        uploadDate: '2026-01-01',
      }),
    ).toBeNull();
    const node = buildVideoObjectJsonLd({
      platform: 'twitch',
      id: 'v999',
      title: 'V',
      uploadDate: '2026-01-01',
      thumbnail: 'https://cdn/t.jpg',
    });
    expect(node).toMatchObject({
      embedUrl: 'https://player.twitch.tv/?video=v999',
      contentUrl: 'https://www.twitch.tv/videos/999',
      thumbnailUrl: 'https://cdn/t.jpg',
    });
  });

  it('Bilibili : embed/content par bvid ; auteur → nœud Person', () => {
    const node = buildVideoObjectJsonLd({
      platform: 'bilibili',
      id: 'BV1x',
      title: 'V',
      uploadDate: '2026-01-01',
      thumbnail: 'https://cdn/b.jpg',
      author: 'Shiraen',
    });
    expect(node).toMatchObject({
      embedUrl: 'https://player.bilibili.com/player.html?bvid=BV1x',
      contentUrl: 'https://www.bilibili.com/video/BV1x',
      author: { '@type': 'Person', name: 'Shiraen' },
    });
  });
});

describe('buildArticleJsonLd', () => {
  it('datePublished retombe sur dateModified quand absent', () => {
    const node = buildArticleJsonLd({
      lang: 'en',
      path: '/g',
      headline: 'H',
      description: 'D',
      author: 'Sevih',
      dateModified: '2026-03-03',
    });
    expect(node).toMatchObject({
      '@type': 'Article',
      author: { '@type': 'Person', name: 'Sevih' },
      datePublished: '2026-03-03',
      dateModified: '2026-03-03',
      mainEntityOfPage: { '@id': buildUrl('en', '/g') },
    });
  });

  it('datePublished explicite conservé ; image relative absolutisée', () => {
    const node = buildArticleJsonLd({
      lang: 'en',
      path: '/g',
      headline: 'H',
      description: 'D',
      author: 'Sevih',
      dateModified: '2026-03-03',
      datePublished: '2026-01-01',
      image: '/images/g.png',
    });
    expect(node).toMatchObject({
      datePublished: '2026-01-01',
      image: `${CANONICAL_ORIGIN}/images/g.png`,
    });
  });
});

describe('buildFaqJsonLd', () => {
  it('mappe questions → Question / acceptedAnswer', () => {
    const node = buildFaqJsonLd([{ question: 'Q1 ?', answer: 'R1.' }]);
    expect(node).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Q1 ?',
          acceptedAnswer: { '@type': 'Answer', text: 'R1.' },
        },
      ],
    });
  });
});

describe('getMonthYear', () => {
  it('renvoie une chaîne localisée contenant l’année', () => {
    const s = getMonthYear('en');
    expect(typeof s).toBe('string');
    expect(s).toMatch(/\d{4}/);
  });
});
