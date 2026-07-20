import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata, buildItemListJsonLd, buildUrl } from '@/lib/seo';
import { getChangelog } from '@/lib/data/changelog';
import { changelogHref } from '@/components/changelog/presentation';
import { ChangelogEntryCard } from '@/components/changelog/ChangelogEntryCard';
import JsonLd from '@/components/seo/JsonLd';

// Journal du site. La `date` d'une entrée est aussi sa mise en ligne : la page
// se régénère à la purge de cache de 00:05 UTC, donc une entrée programmée
// datée du jour bascule pile à ce moment (cf. src/lib/data/changelog.ts).
export const revalidate = 86400;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/changelog',
    title: t('changelog.title'),
    description: t('changelog.description'),
  });
}

export default async function ChangelogPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  const entries = getChangelog(lang);

  const jsonLd = buildItemListJsonLd({
    name: t('changelog.title'),
    description: t('changelog.description'),
    url: buildUrl(lang, '/changelog'),
    itemListOrder: 'Descending',
    items: entries.map((e) => ({
      name: e.title,
      url: buildUrl(lang, changelogHref(e.link) ?? '/changelog'),
    })),
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <JsonLd data={jsonLd} id="ld-changelog" />

      <header className="mb-8 text-center">
        <h1 className="text-content-strong text-3xl font-bold">{t('changelog.title')}</h1>
        <p className="text-content-muted mx-auto mt-2 max-w-xl text-sm">
          {t('changelog.description')}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {entries.map((entry, i) => (
          <ChangelogEntryCard key={`${entry.date}-${i}`} entry={entry} lang={lang} t={t} />
        ))}
      </div>
    </main>
  );
}
