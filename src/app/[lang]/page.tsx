import Link from 'next/link';
import type { Metadata } from 'next';
import type { Route } from 'next';
import { isValidLang, type Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { localePath } from '@/lib/navigation';
import { getCharacterListItems } from '@/lib/data/characters';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);
  const meta = createPageMetadata({
    lang,
    path: '/',
    title: t('page.home.title'),
    description: t('page.home.description'),
  });
  return { ...meta, title: { absolute: t('page.home.title') } };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);
  const count = getCharacterListItems().length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="space-y-2">
        <h1 className="text-content-strong text-3xl font-bold">Outerpedia</h1>
        <p className="text-content-muted">{t('page.home.description')}</p>
      </section>

      <Link
        href={localePath(lang, '/characters') as Route}
        className="border-line bg-surface-raised hover:border-accent block max-w-sm rounded-lg border p-4 transition"
      >
        <div className="text-content-strong font-medium">{t('nav.characters')}</div>
        <div className="text-content-subtle text-sm">{count} personnages</div>
      </Link>
    </div>
  );
}
