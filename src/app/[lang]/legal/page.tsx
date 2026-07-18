import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/legal',
    title: t('page.legal.title'),
    description: t('page.legal.description'),
  });
}

/**
 * Mentions légales & clause de non-responsabilité (lien de la barre basse du
 * footer). Page statique, purement éditoriale — le contenu vit dans les clés
 * `legal.*` (pré-seedées ×5). `p5` relève de l'hébergeur, précédé de son titre.
 */
export default async function LegalPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-content-strong text-3xl font-bold">{t('legal.heading')}</h1>

      <div className="text-content-muted mt-6 space-y-4 leading-relaxed">
        <p>{t('legal.p1')}</p>
        <p>{t('legal.p2')}</p>
        <p>{t('legal.p3')}</p>
        <p>{t('legal.p4')}</p>

        <h2 className="text-content-strong pt-4 text-xl font-semibold">{t('legal.hosting')}</h2>
        <p>{t('legal.p5')}</p>
      </div>
    </div>
  );
}
