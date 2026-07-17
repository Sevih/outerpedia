import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { getRequestLang } from '@/lib/i18n/server';
import { getT, type TranslationKey, type TFunction } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { DEFAULT_LANG, LANGS, LANGUAGES, type Lang } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';
import { GUIDE_CATEGORIES, GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { getGameVersion } from '@/lib/data/game-version';

/**
 * Pied de page global (structure V2, tokens V3) : marque + versions + chips
 * sociaux + chips de langues, 4 colonnes (Database / Tools / Guides /
 * Community — repliables en mobile via <details>, zéro JS), bandeau des liens
 * officiels Outerplane, disclaimer, barre légale. Les cibles pas encore
 * portées (/tierlist, /coupons, /tools, /contributors, /changelog, /legal,
 * /feed) sont ASSUMÉES 404 — cf. TODO « Pages manquantes » (idem les icônes
 * de marque Discord/GitHub…, en attente d'une stratégie d'icônes).
 */

/** Les 6 outils mis en avant (mêmes que la V2 ; libellés `tools.*` pré-seedés). */
const FEATURED_TOOLS = [
  'most-used-units',
  'tierlistpve',
  'tierlistpvp',
  'ee-priority-base',
  'ee-priority-plus10',
  'gear-usage-statistics',
] as const;

interface FooterLink {
  label: string;
  href: string;
}

const isExternal = (href: string): boolean => /^https?:\/\//.test(href);

function renderLink(link: FooterLink, className: string): ReactNode {
  return isExternal(link.href) ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href as Route} className={className}>
      {link.label}
    </Link>
  );
}

function buildColumns(lang: Lang, t: TFunction): Array<{ title: string; links: FooterLink[] }> {
  return [
    {
      title: t('footer.col.database'),
      links: [
        { label: t('nav.characters'), href: localePath(lang, '/characters') },
        { label: t('nav.equipment'), href: localePath(lang, '/equipment') },
        { label: t('nav.tierlist'), href: localePath(lang, '/tierlist') },
        { label: t('page.coupons.title'), href: localePath(lang, '/coupons') },
      ],
    },
    {
      title: t('footer.col.tools'),
      links: FEATURED_TOOLS.map((slug) => ({
        label: t(`tools.${slug}` as TranslationKey),
        href: localePath(lang, `/tools#${slug}`),
      })),
    },
    {
      title: t('footer.col.guides'),
      links: GUIDE_CATEGORY_SLUGS.slice(0, 6).map((slug) => ({
        label: lRec(GUIDE_CATEGORIES[slug].label, lang) || GUIDE_CATEGORIES[slug].label.en,
        href: localePath(lang, `/guides/${slug}`),
      })),
    },
    {
      title: t('footer.col.community'),
      links: [
        {
          label: t('footer.social.evamains_discord'),
          href: 'https://discord.com/invite/PNMd5mkAV8',
        },
        { label: t('footer.social.github'), href: 'https://github.com/Sevih/outerpediaV2' },
        { label: t('contributors.title'), href: localePath(lang, '/contributors') },
        { label: t('changelog.title'), href: localePath(lang, '/changelog') },
        { label: t('footer.social.rss'), href: '/feed' },
      ],
    },
  ];
}

/**
 * Colonne : <details> repliable en mobile, liste ouverte en desktop —
 * utilitaires responsives seulement, aucun JS client.
 */
function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  const linkClass = 'block py-1 text-sm text-content-muted transition hover:text-content-strong';
  return (
    <div>
      <details className="group border-line-subtle border-b md:hidden">
        <summary className="text-content flex cursor-pointer list-none items-center justify-between py-3 font-mono text-[11px] tracking-widest uppercase">
          {title}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="text-content-subtle transition-transform group-open:rotate-180"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <ul className="pt-1 pb-3">
          {links.map((l) => (
            <li key={`${l.label}|${l.href}`}>{renderLink(l, linkClass)}</li>
          ))}
        </ul>
      </details>
      <div className="hidden md:block">
        <p className="text-content-subtle mb-3 font-mono text-[10px] tracking-widest uppercase">
          {title}
        </p>
        <ul className="flex flex-col gap-1">
          {links.map((l) => (
            <li key={`${l.label}|${l.href}`}>{renderLink(l, linkClass)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Chips de langues (racine de chaque langue — même sémantique que la V2). */
function FooterLanguages({ lang, label }: { lang: Lang; label: string }) {
  return (
    <div>
      <p className="text-content-subtle mb-2 font-mono text-[10px] tracking-widest uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {LANGS.map((l) => {
          const cfg = LANGUAGES[l];
          const isCurrent = l === lang;
          return (
            <Link
              key={l}
              href={(l === DEFAULT_LANG ? '/' : `/${l}`) as Route}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition ${
                isCurrent
                  ? 'border-accent/60 bg-accent/10 text-accent'
                  : 'border-line bg-surface-base text-content-muted hover:text-content'
              }`}
              aria-current={isCurrent ? 'true' : undefined}
              hrefLang={cfg.htmlLang}
            >
              <span className="font-mono">{cfg.abbrev}</span>
              {cfg.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export async function Footer() {
  const lang = getRequestLang();
  const t = await getT(lang);
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
  const gameVersion = getGameVersion();
  const columns = buildColumns(lang, t);

  const officialLinks: FooterLink[] = [
    { label: t('footer.official_website'), href: t('link.officialwebsite') },
    { label: t('footer.social.official_discord'), href: 'https://discord.com/invite/77mVJcJByq' },
    { label: t('footer.social.reddit'), href: 'https://www.reddit.com/r/OUTERPLANE_Publisher/' },
    { label: t('footer.social.youtube'), href: 'https://www.youtube.com/@OUTERPLANE_OFFICIAL' },
    { label: t('footer.social.official_x'), href: 'https://x.com/outerplane' },
    { label: t('footer.social.publisher_x'), href: 'https://x.com/M9_outerplane' },
  ];

  const quickSocial: FooterLink[] = [
    { label: 'Discord', href: 'https://discord.com/invite/PNMd5mkAV8' },
    { label: 'GitHub', href: 'https://github.com/Sevih/outerpediaV2' },
    { label: 'RSS', href: '/feed' },
  ];

  return (
    <footer className="border-line-subtle bg-surface-raised/60 mt-12 border-t">
      <div className="mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-14">
        {/* Haut : marque + 4 colonnes (grid desktop | repliables mobile) */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)] md:gap-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- favicon local */}
              <img src="/favicon.ico" alt="Outerpedia" className="size-9 shrink-0 object-contain" />
              <div>
                <p className="text-content-strong font-semibold tracking-wide">Outerpedia</p>
                <p className="text-content-subtle font-mono text-[10px] tracking-widest uppercase">
                  v{appVersion}
                </p>
                <p
                  className="text-content-subtle font-mono text-[10px] tracking-widest uppercase"
                  title={`Game version ${gameVersion}`}
                >
                  GV {gameVersion}
                </p>
              </div>
            </div>
            <p className="text-content-muted mb-5 max-w-sm text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            {/* Rangée sociale rapide */}
            <div className="mb-6 flex gap-2">
              {quickSocial.map((link) => (
                <span key={link.href}>
                  {renderLink(
                    link,
                    'inline-flex items-center gap-2 rounded-md border border-line bg-surface-base px-3 py-1.5 text-xs text-content transition hover:border-accent/50 hover:bg-surface-overlay',
                  )}
                </span>
              ))}
            </div>
            <FooterLanguages lang={lang} label={t('common.language')} />
          </div>

          {columns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Liens officiels Outerplane — bandeau distinct */}
        <div className="border-line-subtle mt-10 border-t pt-6">
          <p className="text-content-subtle mb-3 font-mono text-[10px] tracking-widest uppercase">
            {t('footer.col.official')} · Outerplane
          </p>
          <div className="flex flex-wrap gap-2">
            {officialLinks.map((link) => (
              <span key={link.href}>
                {renderLink(
                  link,
                  'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-base/50 px-2.5 py-1 text-xs text-content-subtle transition hover:bg-surface-overlay hover:text-content',
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="border-line-subtle text-content-subtle mt-8 border-t pt-6 text-xs leading-relaxed">
          {t('footer.disclaimer')}
        </p>

        {/* Barre basse */}
        <div className="text-content-subtle mt-6 flex flex-col gap-3 py-5 font-mono text-[11px] sm:flex-row sm:items-center sm:gap-5">
          <span>© {new Date().getFullYear()} Outerpedia</span>
          <Link href={localePath(lang, '/legal')} className="hover:text-content-strong transition">
            {t('footer.legal_notice')}
          </Link>
          <Link
            href={localePath(lang, '/changelog')}
            className="hover:text-content-strong transition"
          >
            {t('changelog.title')}
          </Link>
          <div className="flex-1" />
          <span className="inline-flex items-center gap-2">
            <span className="bg-success shadow-success/50 size-1.5 rounded-full shadow-sm" />v
            {appVersion}
            <span title={`Game version ${gameVersion}`}>· GV {gameVersion}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
