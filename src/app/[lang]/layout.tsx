import { notFound } from 'next/navigation';
import { LANGS, isValidLang, type Lang } from '@/lib/i18n/config';
import { setRequestLang } from '@/lib/i18n/server';
import { getT } from '@/i18n';
import { buildSiteJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { Header } from '@/components/layout/Header';
import { HtmlLang } from '@/components/layout/HtmlLang';
import { Footer } from '@/components/layout/Footer';

/** SSG : une variante par langue. */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  setRequestLang(lang as Lang);
  const t = await getT(lang as Lang);

  return (
    <>
      {/* Aligne <html lang> côté client (le root layout est global, hors [lang]). */}
      <HtmlLang lang={lang as Lang} />
      <JsonLd id="ld-site" data={buildSiteJsonLd(lang as Lang, t('page.home.description'))} />
      <Header />
      {/* Pas de conteneur global : chaque page pose le sien (la fiche perso est
          full-bleed, comme en V2). `page-container` = l'ancien gabarit. */}
      <main>{children}</main>
      <Footer />
    </>
  );
}
