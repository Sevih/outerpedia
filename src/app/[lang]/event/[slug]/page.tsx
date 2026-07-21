/**
 * PAGE d'un événement communautaire (`/event/<slug>`).
 *
 * La V2 pliait tous les événements dans `/event#slug` : rien n'était indexable
 * ni partageable (un seul titre et une seule carte OG pour l'ensemble). Ici
 * chaque événement a son URL, sa meta description, sa carte de partage (sa
 * bannière) et son fil d'Ariane.
 *
 * Les slugs viennent de la donnée CURÉE, lue au runtime : un événement publié
 * après le déploiement n'a pas de `staticParams`, il est rendu à la demande
 * puis mis en cache par l'ISR — c'est ce qui permet de publier sans redéployer.
 */
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { LANGS, normalizeLang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';
import { buildUrl } from '@/lib/site';
import { IS_DEV } from '@/lib/admin/guard';
import {
  formatEventDate,
  formatEventDeadline,
  getEventView,
  listEventSlugs,
} from '@/lib/data/events';
import JsonLd from '@/components/seo/JsonLd';
import { EventBlocks } from '@/components/events/EventBlocks';
import { EVENT_STATUS_BADGE, EVENT_TYPE_BADGE } from '@/components/events/presentation';

export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await listEventSlugs();
  return LANGS.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = normalizeLang(raw);
  const view = await getEventView(slug, { includeDrafts: IS_DEV });
  if (!view) return {};
  const { event, teased } = view;
  const t = await getT(lang);
  // TEASER : le titre et le résumé ne doivent pas fuir non plus par la balise
  // meta, l'aperçu de partage ou l'onglet du navigateur.
  if (teased) {
    return createPageMetadata({
      lang,
      path: `/event/${slug}`,
      title: `${t('tools.event.status.upcoming')} — ${t(`tools.event.type.${event.type}`)}`,
      description: t('tools.event.upcoming_placeholder'),
    });
  }
  return createPageMetadata({
    lang,
    path: `/event/${slug}`,
    title: lRec(event.title, lang),
    description: lRec(event.summary, lang),
    ...(event.cover && { ogImage: img.asset(event.cover) }),
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = normalizeLang(raw);
  const view = await getEventView(slug, { includeDrafts: IS_DEV });
  if (!view) notFound();
  const { event, status, phase, now, teased } = view;

  const t = await getT(lang);
  // TEASER : rien du contenu ne descend dans le HTML — ni le titre, ni la
  // bannière, ni un seul bloc. Seuls la famille et la date de début sont
  // annoncées, c'est tout l'intérêt de l'annonce.
  const title = teased
    ? `${t('tools.event.status.upcoming')} — ${t(`tools.event.type.${event.type}`)}`
    : lRec(event.title, lang);
  const summary = teased ? '' : lRec(event.summary, lang);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: t('nav.home'), url: buildUrl(lang, '/') },
    { name: t('tools.event'), url: buildUrl(lang, '/event') },
    { name: title, url: buildUrl(lang, `/event/${slug}`) },
  ]);

  return (
    <div className="px-4 py-6 md:px-6">
      <JsonLd data={breadcrumb} id="ld-breadcrumb" />
      <article className="mx-auto max-w-3xl">
        <Link
          href={'/event' as Route}
          className="text-content-muted hover:text-content-strong inline-flex items-center gap-1 text-sm transition-colors"
        >
          &larr; {t('tools.event')}
        </Link>

        <header className="mt-3 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${EVENT_STATUS_BADGE[status]}`}
            >
              {t(`tools.event.status.${status}`)}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${EVENT_TYPE_BADGE[event.type]}`}
            >
              {t(`tools.event.type.${event.type}`)}
            </span>
            {event.draft && (
              <span className="bg-warn/15 text-warn rounded px-2 py-0.5 text-xs font-medium">
                {t('tools.event.draft')}
              </span>
            )}
          </div>

          <h1 className="text-content-strong mx-auto text-center text-3xl font-bold tracking-tight">
            {title}
          </h1>

          {event.cover && !teased && (
            <div className="relative mx-auto aspect-video w-full max-w-md">
              <Image
                src={img.asset(event.cover)}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                priority
                className="rounded-lg object-contain"
              />
            </div>
          )}

          <div className="text-content-muted flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
            <span>
              {formatEventDate(event.start, lang)} — {formatEventDate(event.end, lang)}
            </span>
            {event.organizer && !teased && (
              <span>
                {t('tools.event.organizer')}:{' '}
                <span className="text-content-strong">{event.organizer}</span>
              </span>
            )}
          </div>

          {phase && (
            <p className="text-accent text-center text-sm font-medium">
              {t('tools.event.next_step', {
                step: lRec(phase.label, lang),
                date: formatEventDate(phase.until, lang),
              })}
            </p>
          )}

          {summary && (
            <p className="text-content-muted mx-auto max-w-2xl text-center leading-relaxed text-pretty">
              {summary}
            </p>
          )}
        </header>

        <div className="mt-8">
          {teased ? (
            <div className="border-line-subtle bg-surface-raised/50 flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
              <span className="text-4xl" aria-hidden>
                🔒
              </span>
              <p className="text-content-muted max-w-md">{t('tools.event.upcoming_placeholder')}</p>
              <p className="text-content-subtle text-sm">
                {t('tools.event.starts', { date: formatEventDeadline(event.start, lang) })}
              </p>
            </div>
          ) : (
            <EventBlocks event={event} lang={lang} t={t} now={now} />
          )}
        </div>
      </article>
    </div>
  );
}
