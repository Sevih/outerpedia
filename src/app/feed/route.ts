import { DEFAULT_LANG } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { buildUrl } from '@/lib/site';
import { guideUpdatedDate, listGuides } from '@/lib/data/guides';

/**
 * Flux RSS des guides (lien de la barre basse du footer, `/feed`). Route à la
 * RACINE, hors `[lang]` : le proxy l'exclut nommément (cf. proxy.ts), donc un
 * flux unique en langue par défaut. Statique + revalidation 24 h.
 *
 * Contenu : les guides NON masqués, du plus récemment mis à jour au plus ancien
 * (`guideUpdatedDate` — même date de fraîcheur que le sitemap). Le lien de
 * chaque item pointe la fiche en langue par défaut.
 */
export const revalidate = 86400;
export const dynamic = 'force-static';

/** Échappe les 5 entités XML — titres/descriptions sont du texte libre. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** `YYYY-MM-DD` → date RFC-822 (format attendu par les lecteurs RSS). */
function rfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export async function GET() {
  const t = await getT(DEFAULT_LANG);
  const home = buildUrl(DEFAULT_LANG, '/');
  const self = buildUrl(DEFAULT_LANG, '/feed');

  const guides = listGuides()
    .filter((g) => !g.hidden)
    .map((g) => ({ g, date: guideUpdatedDate(g) }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const items = guides
    .map(({ g, date }) => {
      const link = buildUrl(DEFAULT_LANG, `/guides/${g.category}/${g.slug}`);
      return [
        '    <item>',
        `      <title>${esc(g.title.en)}</title>`,
        `      <link>${esc(link)}</link>`,
        `      <guid isPermaLink="true">${esc(link)}</guid>`,
        `      <description>${esc(g.description.en)}</description>`,
        `      <pubDate>${rfc822(date)}</pubDate>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const lastBuild = guides[0] ? rfc822(guides[0].date) : new Date().toUTCString();

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Outerpedia</title>',
    `    <link>${esc(home)}</link>`,
    `    <description>${esc(t('footer.tagline'))}</description>`,
    '    <language>en</language>',
    `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
    `    <atom:link href="${esc(self)}" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
