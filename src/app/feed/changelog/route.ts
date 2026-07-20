import { DEFAULT_LANG } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { buildUrl } from '@/lib/site';
import { getChangelog } from '@/lib/data/changelog';
import { changelogHref } from '@/components/changelog/presentation';

/**
 * Flux RSS du JOURNAL DU SITE (page `/changelog`). Route à la RACINE, sous
 * `/feed/*` : le proxy exclut tout `/feed` du préfixe de langue (cf. proxy.ts),
 * donc un flux unique en langue par défaut — distinct du flux des guides (`/feed`).
 *
 * `getChangelog` applique déjà le filtre de PROGRAMMATION (entrées à date future
 * et brouillons exclus) : le flux ne fuite jamais une entrée pas encore publiée.
 * Statique + revalidation 24 h (la purge de 00:05 UTC régénère → une entrée
 * programmée du jour y entre pile à ce moment).
 */
export const revalidate = 86400;
export const dynamic = 'force-static';

const LIMIT = 30;

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

/** Puces → une description plate (markdown gras `**x**` aplati). */
function describe(lines: string[]): string {
  return lines.map((l) => l.replace(/\*\*(.+?)\*\*/g, '$1')).join(' — ');
}

export async function GET() {
  const t = await getT(DEFAULT_LANG);
  const home = buildUrl(DEFAULT_LANG, '/');
  const self = buildUrl(DEFAULT_LANG, '/feed/changelog');
  const page = buildUrl(DEFAULT_LANG, '/changelog');

  const entries = getChangelog(DEFAULT_LANG, { limit: LIMIT });

  const items = entries
    .map((e, i) => {
      const href = changelogHref(e.link);
      const link = href ? buildUrl(DEFAULT_LANG, href) : page;
      return [
        '    <item>',
        `      <title>${esc(e.title)}</title>`,
        `      <link>${esc(link)}</link>`,
        `      <guid isPermaLink="false">changelog-${e.date}-${i}</guid>`,
        `      <category>${esc(e.type)}</category>`,
        `      <description>${esc(describe(e.content))}</description>`,
        `      <pubDate>${rfc822(e.date)}</pubDate>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const lastBuild = entries[0] ? rfc822(entries[0].date) : new Date().toUTCString();

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>Outerpedia — ${esc(t('changelog.title'))}</title>`,
    `    <link>${esc(home)}</link>`,
    `    <description>${esc(t('changelog.description'))}</description>`,
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
