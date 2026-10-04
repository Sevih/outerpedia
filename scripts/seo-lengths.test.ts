import { describe, expect, it } from 'vitest';
import {
  classify,
  crawl,
  CrawlStopped,
  decodeEntities,
  extractMeta,
  pageGroup,
  parseSitemap,
  renderReport,
  textWidth,
  type Fetched,
  type PageMeta,
} from './seo-lengths';

/** Texte de `n` caractères exactement. */
const chars = (n: number, c = 'a'): string => c.repeat(n);

const page = (url: string, title: string | null, description: string | null): PageMeta => ({
  url,
  title,
  description,
});

/** Titre et description dans les bornes, uniques par `seed`. */
const ok = (url: string, seed: string): PageMeta =>
  page(url, `${seed} ${chars(40)}`.slice(0, 40), `${seed} ${chars(100)}`.slice(0, 100));

describe('decodeEntities', () => {
  it('décode les entités nommées et numériques', () => {
    expect(decodeEntities('Wiki &amp; Database')).toBe('Wiki & Database');
    expect(decodeEntities('K&#x27;s &quot;guide&quot; &#39;x&#39;')).toBe(`K's "guide" 'x'`);
    expect(decodeEntities('a&nbsp;b &lt;i&gt;')).toBe('a b <i>');
  });

  it('ne décode qu’une fois et laisse une entité inconnue telle quelle', () => {
    expect(decodeEntities('&amp;lt;')).toBe('&lt;');
    expect(decodeEntities('R&D &foo; &#xZZ;')).toBe('R&D &foo; &#xZZ;');
  });
});

describe('extractMeta', () => {
  it('lit le titre et la description, entités décodées', () => {
    const html = `<!DOCTYPE html><html><head><meta charSet="utf-8"/>
      <title>Outerpedia — Outerplane Wiki &amp; Database</title>
      <meta name="description" content="A community wiki &amp; database for Outerplane."/>
      </head><body><h1>Home</h1></body></html>`;
    expect(extractMeta(html)).toEqual({
      title: 'Outerpedia — Outerplane Wiki & Database',
      description: 'A community wiki & database for Outerplane.',
    });
  });

  it('accepte l’ordre inverse des attributs, les apostrophes et la casse', () => {
    const html = `<head><TITLE>  Tier
      List  </TITLE><META content='Best "units" ranked' NAME='Description'></head>`;
    expect(extractMeta(html)).toEqual({ title: 'Tier List', description: 'Best "units" ranked' });
  });

  it('ignore le <title> d’un <svg> placé avant celui de la page', () => {
    const html = `<html><body><svg viewBox="0 0 1 1"><title>Fire</title></svg>
      <title>K — Outerplane Fire Defender Guide | Outerpedia</title>
      <meta name="description" content="K (Fire Defender)"/></body></html>`;
    expect(extractMeta(html).title).toBe('K — Outerplane Fire Defender Guide | Outerpedia');
  });

  it('ignore ce qui est écrit dans un <script> ou un commentaire', () => {
    const html = `<head><script>var s = '<title>Faux</title><meta name="description" content="faux">';</script>
      <!-- <title>Commenté</title> -->
      <title>Vrai</title><meta name="description" content="vraie"/></head>`;
    expect(extractMeta(html)).toEqual({ title: 'Vrai', description: 'vraie' });
  });

  it('ne confond pas og:description ni twitter:description avec la description', () => {
    const html = `<head><title>T</title>
      <meta property="og:description" content="og"/>
      <meta name="twitter:description" content="tw"/></head>`;
    expect(extractMeta(html)).toEqual({ title: 'T', description: null });
  });

  it('rend null pour un champ absent ou vide', () => {
    expect(extractMeta('<head></head>')).toEqual({ title: null, description: null });
    expect(
      extractMeta('<head><title>  </title><meta name="description" content=" "/></head>'),
    ).toEqual({ title: null, description: null });
  });
});

describe('textWidth', () => {
  it('latin : compte des caractères, pas des unités UTF-16', () => {
    expect(textWidth(null)).toBe(0);
    expect(textWidth('abc')).toBe(3);
    expect(textWidth('🔥a')).toBe(2);
  });

  it('un caractère large (kanji, kana, hangul, pleine chasse) compte 2', () => {
    expect(textWidth('攻略ガイド')).toBe(10);
    expect(textWidth('공략 가이드')).toBe(11);
    expect(textWidth('异域战记 Outerplane')).toBe(19);
  });
});

describe('parseSitemap', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>https://outerpedia.com</loc>
<xhtml:link rel="alternate" hreflang="en" href="https://outerpedia.com" />
<xhtml:link rel="alternate" hreflang="fr" href="https://fr.outerpedia.com" />
<changefreq>weekly</changefreq>
</url>
<url>
<loc>https://outerpedia.com/characters/k</loc>
<xhtml:link rel="alternate" hreflang="en" href="https://outerpedia.com/characters/k" />
<xhtml:link rel="alternate" hreflang="fr" href="https://fr.outerpedia.com/characters/k" />
</url>
</urlset>`;

  it('prend le <loc> sur l’hôte par défaut', () => {
    expect(parseSitemap(xml, 'https://outerpedia.com')).toEqual([
      'https://outerpedia.com',
      'https://outerpedia.com/characters/k',
    ]);
  });

  it('prend l’alternate de l’hôte de langue demandé', () => {
    expect(parseSitemap(xml, 'https://fr.outerpedia.com/')).toEqual([
      'https://fr.outerpedia.com',
      'https://fr.outerpedia.com/characters/k',
    ]);
  });

  it('rejoue le chemin sur un hôte que le sitemap ne connaît pas', () => {
    expect(parseSitemap(xml, 'http://localhost:3000')).toEqual([
      'http://localhost:3000',
      'http://localhost:3000/characters/k',
    ]);
  });
});

describe('pageGroup', () => {
  it('groupe par gabarit d’URL', () => {
    expect(pageGroup('https://outerpedia.com')).toBe('/*');
    expect(pageGroup('https://outerpedia.com/tierlist')).toBe('/*');
    expect(pageGroup('https://outerpedia.com/characters/k')).toBe('/characters/*');
    expect(pageGroup('https://outerpedia.com/guides/general-guides')).toBe('/guides/*');
    expect(pageGroup('https://outerpedia.com/guides/general-guides/gear')).toBe('/guides/*/*');
  });
});

describe('classify', () => {
  const issuesOf = (metas: PageMeta[]): string[][] => classify(metas).pages.map((p) => p.issues);

  it('ne signale rien aux bornes exactes', () => {
    expect(
      issuesOf([
        page('https://x.test/a', chars(30), chars(70)),
        page('https://x.test/b', chars(60, 'b'), chars(160, 'b')),
      ]),
    ).toEqual([[], []]);
  });

  it('signale un caractère en deçà et au-delà des bornes', () => {
    expect(
      issuesOf([
        page('https://x.test/a', chars(29), chars(69)),
        page('https://x.test/b', chars(61, 'b'), chars(161, 'b')),
      ]),
    ).toEqual([
      ['title-short', 'description-short'],
      ['title-long', 'description-long'],
    ]);
  });

  it('mesure en largeur : les mêmes bornes pour 15 à 30 kana que pour 30 à 60 lettres', () => {
    const { pages } = classify([
      page('https://x.test/a', chars(15, 'あ'), chars(35, 'あ')),
      page('https://x.test/b', chars(30, 'い'), chars(80, 'い')),
      page('https://x.test/c', chars(14, 'う'), chars(34, 'う')),
      page('https://x.test/d', chars(31, '가'), chars(81, '가')),
    ]);
    expect(pages.map((p) => p.issues)).toEqual([
      [],
      [],
      ['title-short', 'description-short'],
      ['title-long', 'description-long'],
    ]);
    expect(pages.map((p) => [p.titleWidth, p.descriptionWidth])).toEqual([
      [30, 70],
      [60, 160],
      [28, 68],
      [62, 162],
    ]);
  });

  it('distingue absent de court', () => {
    expect(issuesOf([page('https://x.test/a', null, null)])).toEqual([
      ['title-missing', 'description-missing'],
    ]);
  });

  it('relève les doublons exacts, tous groupes confondus, et eux seuls', () => {
    const title = chars(40);
    const description = chars(100);
    const { pages, duplicateTitles, duplicateDescriptions } = classify([
      page('https://x.test/characters/a', title, description),
      page('https://x.test/equipment/b', title, `${description}!`),
      page('https://x.test/c', `${title}!`, description),
      ok('https://x.test/d', 'seul'),
    ]);
    expect(pages.map((p) => p.issues)).toEqual([
      ['title-duplicate', 'description-duplicate'],
      ['title-duplicate'],
      ['description-duplicate'],
      [],
    ]);
    expect(duplicateTitles).toEqual([
      { text: title, urls: ['https://x.test/characters/a', 'https://x.test/equipment/b'] },
    ]);
    expect(duplicateDescriptions).toEqual([
      { text: description, urls: ['https://x.test/characters/a', 'https://x.test/c'] },
    ]);
  });

  it('classe un champ absent avant un champ court, et le plus court avant le moins court', () => {
    const { pages } = classify([
      page('https://x.test/limite', chars(29), chars(100)),
      page('https://x.test/court', 'K', chars(100, 'b')),
      page('https://x.test/absent', chars(40, 'c'), null),
    ]);
    const worstFirst = [...pages].sort((a, b) => b.score - a.score).map((p) => p.url);
    expect(worstFirst).toEqual([
      'https://x.test/absent',
      'https://x.test/court',
      'https://x.test/limite',
    ]);
  });
});

describe('crawl', () => {
  const html = '<title>T</title><meta name="description" content="D"/>';
  const urls = (n: number): string[] =>
    Array.from({ length: n }, (_, i) => `https://x.test/p/${i}`);
  /** Rend la main à la boucle d'événements, comme une vraie requête. */
  const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

  it('ne lance jamais plus de quatre requêtes de front et garde l’ordre du sitemap', async () => {
    let inFlight = 0;
    let peak = 0;
    const { metas, skipped } = await crawl(urls(20), {
      fetchPage: async () => {
        peak = Math.max(peak, ++inFlight);
        await tick();
        inFlight -= 1;
        return { status: 200, html };
      },
    });
    expect(peak).toBe(4);
    expect(skipped).toEqual([]);
    expect(metas.map((m) => m.url)).toEqual(urls(20));
    expect(metas[0]).toEqual({ url: 'https://x.test/p/0', title: 'T', description: 'D' });
  });

  it('range à part une page qui n’est pas un 200', async () => {
    const { metas, skipped } = await crawl(urls(3), {
      fetchPage: async (url) =>
        url.endsWith('/1') ? { status: 404, html: null } : { status: 200, html },
    });
    expect(metas.map((m) => m.url)).toEqual(['https://x.test/p/0', 'https://x.test/p/2']);
    expect(skipped).toEqual([{ url: 'https://x.test/p/1', status: 404 }]);
  });

  it('s’arrête net au premier 429', async () => {
    const seen: string[] = [];
    const run = crawl(urls(40), {
      concurrency: 1,
      fetchPage: async (url): Promise<Fetched> => {
        seen.push(url);
        return url.endsWith('/2') ? { status: 429, html: null } : { status: 200, html };
      },
    });
    await expect(run).rejects.toBeInstanceOf(CrawlStopped);
    expect(seen).toEqual(urls(3));
  });

  it('rejoue un 5xx isolé une fois et continue', async () => {
    let failed = false;
    const seen: string[] = [];
    const { metas } = await crawl(urls(4), {
      concurrency: 1,
      retryDelayMs: 0,
      fetchPage: async (url): Promise<Fetched> => {
        seen.push(url);
        if (url.endsWith('/1') && !failed) {
          failed = true;
          return { status: 503, html: null };
        }
        return { status: 200, html };
      },
    });
    expect(metas).toHaveLength(4);
    expect(seen.filter((u) => u.endsWith('/1'))).toHaveLength(2);
  });

  it('s’arrête au 5xx répété, erreur réseau comprise', async () => {
    const seen: string[] = [];
    const run = crawl(urls(40), {
      concurrency: 1,
      retryDelayMs: 0,
      fetchPage: async (url): Promise<Fetched> => {
        seen.push(url);
        if (url.endsWith('/1')) throw new Error('délai dépassé');
        return { status: 200, html };
      },
    });
    await expect(run).rejects.toBeInstanceOf(CrawlStopped);
    expect(seen).toEqual(['https://x.test/p/0', 'https://x.test/p/1', 'https://x.test/p/1']);
  });
});

describe('renderReport', () => {
  it('groupe par type de page et ne garde que les dix pires', () => {
    const metas = [
      ...Array.from({ length: 14 }, (_, i) =>
        page(
          `https://x.test/characters/c${String(i).padStart(2, '0')}`,
          chars(i + 1),
          `${i} ${chars(100)}`,
        ),
      ),
      ok('https://x.test/equipment/sword', 'sword'),
      page('https://x.test/tierlist', 'A | B', null),
    ];
    const report = renderReport({
      host: 'https://x.test',
      date: '2026-10-04',
      total: 17,
      classification: classify(metas),
      skipped: [{ url: 'https://x.test/gone', status: 404 }],
    });

    expect(report).toContain('# Titres et descriptions — x.test, 2026-10-04');
    // L'en-tête dit l'unité : une largeur, pas un nombre de caractères.
    expect(report).toContain('> Ce rapport mesure une LARGEUR d’affichage');
    expect(report).toContain('> Bornes, en largeur : titre 30 à 60,');
    expect(report).toContain('| Page | Titre | Larg. | Description | Larg. | Écarts |');
    expect(report).toContain('17 URL(s) au sitemap, 16 mesurée(s), 1 non mesurée(s)');
    expect(report).toContain('## `/characters/*` — 14 page(s), 14 avec écart');
    expect(report).toContain('Les 10 pires sur 14 :');
    // Les plus courts d'abord : c00 (1 caractère) y est, c13 (14) n'y est plus.
    expect(report).toContain('`/characters/c00`');
    expect(report).not.toContain('`/characters/c13`');
    expect(report).toContain('## `/equipment/*` — 1 page(s), 0 avec écart');
    // Le `|` d'un titre ne casse pas le tableau.
    expect(report).toContain('| `/tierlist` | A \\| B | 5 | — | 0 |');
    expect(report).toContain('- `/gone` — 404');
  });
});
