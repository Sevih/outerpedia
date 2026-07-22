import type { Metadata } from 'next';
import { LANGS, normalizeLang } from '@/lib/i18n/config';
import { setRequestLang } from '@/lib/i18n/server';
import { getT } from '@/i18n';
import { getBaseUrl, buildSiteJsonLd } from '@/lib/seo';
import { SITE_INDEXABLE } from '@/lib/site';
import JsonLd from '@/components/seo/JsonLd';
import { Header } from '@/components/layout/Header';
import { EventBanner } from '@/components/layout/EventBanner';
import { Footer } from '@/components/layout/Footer';
import { RootDocument } from '../root-document';

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: { default: 'Outerpedia', template: '%s | Outerpedia' },
  description: 'Community-driven wiki and database for Outerplane.',
  openGraph: { siteName: 'Outerpedia', type: 'website' },
  twitter: { card: 'summary_large_image' },
  // Hors index par défaut sur un build de production (staging VPS) ; la prod
  // finale l'active via NEXT_PUBLIC_SITE_INDEXABLE=true (cf. src/lib/site.ts).
  // `follow: true` : crawlers et Googlebot parcourent le site (et VOIENT donc le
  // noindex) — d'où AUCUN `Disallow` dans robots.ts, qui les aveuglerait.
  // Hérité par toutes les pages ; une page peut le surcharger (createPageMetadata).
  ...(SITE_INDEXABLE ? {} : { robots: { index: false, follow: true } }),
  /*
   * Icônes DÉCLARÉES, pas devinées.
   *
   * La convention de fichier de l'app router (`src/app/apple-icon.png`) émettait
   * bien son `<link rel="apple-touch-icon">`, mais l'URL renvoyait 404 — en dev
   * comme en prod. La cause n'est pas Next : c'est notre proxy i18n, qui 404 tout
   * chemin contenant un point (garde-fou anti-sondes de bots, cf. proxy.ts).
   * `favicon.ico` n'y survit que parce que le `matcher` du proxy l'exclut nommément.
   *
   * D'où `/icons/…` : un préfixe que le proxy laisse déjà passer, et `public/` est
   * copié tel quel dans l'image Docker. Toute icône ajoutée doit vivre là.
   */
  icons: { apple: '/icons/apple-touch-icon.png' },
  // iOS : Safari ignore le manifest pour le mode standalone sur les anciens iOS
  // (les récents le lisent) — ces metas restent le filet. L'icône d'accueil iOS
  // vient de l'apple-touch-icon ci-dessus, jamais du manifest.
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Outerpedia' },
};

/** SSG : une variante par langue. */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/**
 * Layout RACINE du site public : c'est LUI qui rend `<html lang>` (via
 * RootDocument), pour que le HTML servi porte la vraie langue — l'ancien
 * `app/layout.tsx` global figeait `lang="en"` partout (audit du 21/07) et un
 * patch client (`HtmlLang`) rattrapait après coup. En navigation client entre
 * langues, le param du segment change : React met l'attribut à jour tout seul.
 */
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  // PAS de notFound() ici : interdit dans un layout racine. Inutile de toute
  // façon — le proxy réécrit tout préfixe invalide vers /en/… (un lang inconnu
  // n'arrive jamais jusqu'ici) ; on dégrade en `normalizeLang`, comme les pages.
  const lang = normalizeLang(raw);
  setRequestLang(lang);
  const t = await getT(lang);

  return (
    <RootDocument lang={lang}>
      <JsonLd id="ld-site" data={buildSiteJsonLd(lang, t('page.home.description'))} />
      <Header />
      <EventBanner lang={lang} />
      {/* Pas de conteneur global : chaque page pose le sien (la fiche perso est
          full-bleed, comme en V2). `page-container` = l'ancien gabarit. */}
      <main>{children}</main>
      <Footer />
    </RootDocument>
  );
}
