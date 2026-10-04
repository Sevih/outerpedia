import { describe, expect, it } from 'vitest';
import {
  createPageMetadata,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  mentionsName,
  scopedTitle,
  guideCategoryTitle,
  prefixedDescription,
  truncateDescription,
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
import { LANGS, LANGUAGES, DEFAULT_LANG, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { makeT, type Messages } from '@/i18n';
import en from '@/i18n/locales/en';
import fr from '@/i18n/locales/fr';
import es from '@/i18n/locales/es';
import jp from '@/i18n/locales/jp';
import kr from '@/i18n/locales/kr';
import zh from '@/i18n/locales/zh';
import { GUIDE_CATEGORIES, GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';

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

  it('canonicalPath : canonical ET hreflang basculent sur la cible, og:url reste sur la page', () => {
    const floor = '/guides/skyward-tower/light-tower/42';
    const tower = '/guides/skyward-tower/light-tower';
    const meta = createPageMetadata({
      lang: 'fr',
      path: floor,
      canonicalPath: tower,
      title: 'T',
      description: 'D',
    });
    expect(meta.alternates?.canonical).toBe(buildUrl('fr', tower));
    // Les alternates suivent le canonical : un hreflang pointant vers l'étage
    // contredirait le canonical, et Google ignore les paires en conflit.
    const langs = meta.alternates?.languages as Record<string, string>;
    for (const l of LANGS) expect(langs[LANGUAGES[l].htmlLang]).toBe(buildUrl(l, tower));
    expect(langs['x-default']).toBe(buildUrl(DEFAULT_LANG, tower));
    // og:url = l'URL réellement partagée, donc l'étage.
    expect(meta.openGraph?.url).toBe(buildUrl('fr', floor));
  });

  it('sans canonicalPath : la page reste sa propre canonique', () => {
    const meta = createPageMetadata({ lang: 'en', path: '/x', title: 'T', description: 'D' });
    expect(meta.alternates?.canonical).toBe(buildUrl('en', '/x'));
    expect(meta.openGraph?.url).toBe(buildUrl('en', '/x'));
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

  describe('titre trop long : « | Outerpedia » saute au-delà de TITLE_MAX_LENGTH', () => {
    const SUFFIX = ' | Outerpedia';
    /** Métadonnées d'un titre qui, suffixé, fait `total` caractères. */
    const withTotal = (total: number, char = 'a') => {
      const title = char.repeat(total - SUFFIX.length);
      return {
        title,
        meta: createPageMetadata({ lang: 'en', path: '/x', title, description: 'D' }),
      };
    };

    it('sous la borne : titre nu pour le gabarit du layout, OG et Twitter suffixés', () => {
      const { title, meta } = withTotal(TITLE_MAX_LENGTH - 1);
      expect(meta.title).toBe(title);
      expect(meta.openGraph?.title).toBe(`${title}${SUFFIX}`);
      expect(meta.twitter?.title).toBe(`${title}${SUFFIX}`);
    });

    it('pile sur la borne : rien ne change', () => {
      const { title, meta } = withTotal(TITLE_MAX_LENGTH);
      expect(meta.title).toBe(title);
      expect(meta.openGraph?.title).toBe(`${title}${SUFFIX}`);
      expect(meta.twitter?.title).toBe(`${title}${SUFFIX}`);
    });

    it('au-dessus : `absolute` court-circuite le gabarit, OG et Twitter sans suffixe', () => {
      const { title, meta } = withTotal(TITLE_MAX_LENGTH + 1);
      expect(meta.title).toEqual({ absolute: title });
      expect(meta.openGraph?.title).toBe(title);
      expect(meta.twitter?.title).toBe(title);
    });

    it('compte en points de code : un caractère hors BMP vaut un, pas deux', () => {
      // « 𠮷 » pèse deux unités UTF-16 : compté en `.length`, ce titre déborderait.
      const { title, meta } = withTotal(TITLE_MAX_LENGTH, '𠮷');
      expect(meta.title).toBe(title);
      expect(meta.openGraph?.title).toBe(`${title}${SUFFIX}`);
    });

    it('title === SITE_NAME : jamais suffixé, et pas d’`absolute`', () => {
      const meta = createPageMetadata({
        lang: 'en',
        path: '/',
        title: 'Outerpedia',
        description: 'D',
      });
      expect(meta.title).toBe('Outerpedia');
      expect(meta.openGraph?.title).toBe('Outerpedia');
      expect(meta.twitter?.title).toBe('Outerpedia');
    });
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

describe('mentionsName', () => {
  it('à la casse près, où que le nom soit dans le texte', () => {
    expect(mentionsName('Frost Legion Guild Raid Guide', 'Guild Raid')).toBe(true);
    expect(mentionsName('Autres guides', 'Guides')).toBe(true);
    expect(mentionsName('総合ガイド', 'ガイド')).toBe(true);
    expect(mentionsName('Adventure', 'Guides')).toBe(false);
  });

  it('un nom vide ne se trouve nulle part', () => {
    expect(mentionsName('Adventure', '')).toBe(false);
    expect(mentionsName('Adventure', '  ')).toBe(false);
  });
});

describe('scopedTitle — la portée ne se répète pas', () => {
  it('titre qui ne nomme pas sa catégorie : « titre — portée »', () => {
    expect(scopedTitle('Drakhan', 'World Boss')).toBe('Drakhan — World Boss');
  });

  it('titre qui la nomme déjà : la portée saute', () => {
    expect(scopedTitle('Knight of Hope Meteos Joint Challenge Guide', 'Joint Challenge')).toBe(
      'Knight of Hope Meteos Joint Challenge Guide',
    );
    // À la casse près.
    expect(scopedTitle('Guide joint challenge Shichifuja', 'Joint Challenge')).toBe(
      'Guide joint challenge Shichifuja',
    );
  });

  it('le détail (profondeur) suit la portée, et reste seul quand elle saute', () => {
    expect(scopedTitle('Land of Snow and Steel', 'Monad Gate', 'Depth 6')).toBe(
      'Land of Snow and Steel — Monad Gate Depth 6',
    );
    expect(scopedTitle('Monad Gate: Land of Snow', 'Monad Gate', 'Depth 6')).toBe(
      'Monad Gate: Land of Snow — Depth 6',
    );
  });

  it('titre qui n’est QUE la portée : elle reste, sinon il ne dit plus quelle page', () => {
    expect(scopedTitle('Skyward Tower', 'Skyward Tower')).toBe('Skyward Tower — Skyward Tower');
    expect(scopedTitle('Skyward Tower: Hard', 'Skyward Tower')).toBe('Skyward Tower: Hard');
  });
});

describe('guideCategoryTitle — gabarit des pages de catégorie', () => {
  const LOCALES = { en, fr, es, jp, kr, zh } as unknown as Record<Lang, Messages>;

  it('ajoute « Guides » et le nom du jeu au libellé', () => {
    const t = makeT(LOCALES.en);
    expect(guideCategoryTitle('Adventure', t)).toBe('Adventure Guides — Outerplane');
    expect(guideCategoryTitle('Adventure', makeT(LOCALES.fr))).toBe(
      'Guides Adventure — Outerplane',
    );
  });

  it('un libellé qui dit déjà « guides » ne le reçoit pas une seconde fois', () => {
    expect(guideCategoryTitle('Other Guides', makeT(LOCALES.en))).toBe('Other Guides — Outerplane');
    expect(guideCategoryTitle('Autres guides', makeT(LOCALES.fr))).toBe(
      'Autres guides — Outerplane',
    );
    expect(guideCategoryTitle('Otras Guías', makeT(LOCALES.es))).toBe('Otras Guías — Outerplane');
  });

  it.each(LANGS)(
    '%s : chaque catégorie tient entre 30 et TITLE_MAX_LENGTH, nom du site compris',
    (lang) => {
      const t = makeT(LOCALES[lang]);
      for (const slug of GUIDE_CATEGORY_SLUGS) {
        const title = guideCategoryTitle(lRec(GUIDE_CATEGORIES[slug].label, lang), t);
        // `og:title` porte le titre tel qu'il est servi, suffixe compris.
        const served = createPageMetadata({
          lang,
          path: `/guides/${slug}`,
          title,
          description: 'D',
        }).openGraph?.title as string;
        expect(served, `${lang} ${slug}`).toBe(`${title} | Outerpedia`);
        expect([...served].length, `${lang} ${slug} : ${served}`).toBeGreaterThanOrEqual(30);
        expect([...served].length, `${lang} ${slug} : ${served}`).toBeLessThanOrEqual(
          TITLE_MAX_LENGTH,
        );
      }
    },
  );
});

describe('prefixedDescription — le préfixe saute quand il fait déborder', () => {
  const fill = (length: number) => 'd'.repeat(length);

  it('sous la borne et pile dessus : « préfixe — description »', () => {
    expect(prefixedDescription('Amadeus', 'Teams & tips.')).toBe('Amadeus — Teams & tips.');
    // « Boss — » pèse 7 caractères.
    const exact = prefixedDescription('Boss', fill(DESCRIPTION_MAX_LENGTH - 7));
    expect(exact.startsWith('Boss — ')).toBe(true);
    expect(exact).toHaveLength(DESCRIPTION_MAX_LENGTH);
  });

  it('un caractère de trop : la description sort seule', () => {
    const description = fill(DESCRIPTION_MAX_LENGTH - 6);
    expect(prefixedDescription('Boss', description)).toBe(description);
  });

  it('description déjà trop longue : rendue telle quelle, sans préfixe ni coupe', () => {
    const description = fill(DESCRIPTION_MAX_LENGTH + 20);
    expect(prefixedDescription('Boss', description)).toBe(description);
  });
});

describe('truncateDescription — coupe à la limite de mot', () => {
  it('sous la borne et pile dessus : intact', () => {
    expect(truncateDescription('Short summary.')).toBe('Short summary.');
    const exact = 'a'.repeat(DESCRIPTION_MAX_LENGTH);
    expect(truncateDescription(exact)).toBe(exact);
  });

  it('au-delà : dernier mot entier qui tient, puis « … », jamais plus que la borne', () => {
    expect(truncateDescription('alpha beta gamma delta', 12)).toBe('alpha beta…');
    const long = 'word '.repeat(60).trim();
    const cut = truncateDescription(long);
    expect([...cut].length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
    expect(cut.endsWith('word…')).toBe(true);
  });

  it('coupe qui tombe pile entre deux mots : le mot entier est gardé', () => {
    // « alpha beta » = 10 caractères, l'espace suit : il reste la place de « … ».
    expect(truncateDescription('alpha beta gamma', 11)).toBe('alpha beta…');
  });

  it('la ponctuation ne pend pas devant les points de suspension', () => {
    expect(truncateDescription('guides, and more! Send us your videos', 20)).toBe(
      'guides, and more…',
    );
    expect(truncateDescription('heroes — showcases and guides', 12)).toBe('heroes…');
  });

  it('texte sans espaces (japonais, chinois) : coupe au caractère', () => {
    const cut = truncateDescription('あ'.repeat(200));
    expect(cut).toBe(`${'あ'.repeat(DESCRIPTION_MAX_LENGTH - 1)}…`);
  });

  it('une espace lointaine n’est pas une limite de mot : pas de recul au-delà de la fenêtre', () => {
    const cut = truncateDescription(`序文 ${'あ'.repeat(200)}`);
    expect([...cut].length).toBe(DESCRIPTION_MAX_LENGTH);
  });

  it('compte en points de code : un caractère hors BMP vaut un', () => {
    const cut = truncateDescription('𠮷'.repeat(DESCRIPTION_MAX_LENGTH + 5));
    expect([...cut].length).toBe(DESCRIPTION_MAX_LENGTH);
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

  it('logo de l’éditeur : servi par l’app, JAMAIS sous /images (non servi en prod)', () => {
    const graph = buildSiteJsonLd('en', 'D')['@graph'] as Array<Record<string, unknown>>;
    const publisher = graph.find((n) => n['@id'] === `${CANONICAL_ORIGIN}/#publisher`)!;
    const logo = publisher.logo as Record<string, unknown>;
    // `/images/*` n'est servi par personne en prod (les assets vivent sur R2) :
    // un logo écrit là partait en 404 dans le JSON-LD de chaque page.
    expect(logo.url).not.toContain('/images/');
    expect(logo.url).toBe(`${CANONICAL_ORIGIN}/icons/icon-512x512.png`);
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
