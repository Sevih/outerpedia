import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { getAllCoupons } from '@/lib/home';
import { CouponsList } from '@/components/coupons/CouponsList';

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
    path: '/coupons',
    title: t('page.coupons.title'),
    description: t('page.coupons.description'),
  });
}

/**
 * Codes promo Outerplane — liste complète (actifs/à venir/expirés) depuis le curé
 * `coupons.json`, récompenses résolues. Instructions de rachat manuel en tête
 * (Android / lien iOS). Le rachat one-click de la V2 reste désactivé (`redeem`,
 * en attente d'accord VA Games) — non porté. Page statique i18n, revalidation 24 h.
 */
export default async function CouponsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  const coupons = getAllCoupons(lang);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-6">
      {/* fit-content (globals.css) : le centrage passe par mx-auto, pas text-center. */}
      <h1 className="text-content-strong mx-auto mb-3 text-center text-3xl font-bold">
        {t('page.coupons.title')}
      </h1>
      <p className="text-content-muted mx-auto mb-6 max-w-xl text-center">
        {t('page.coupons.description')}
      </p>

      {/* Rachat MANUEL (le one-click reste OFF) : rappel Android + lien iOS officiel. */}
      <div className="border-line-subtle bg-surface-raised text-content-muted mb-8 rounded-lg border p-4 text-sm">
        <p>{t('coupons.redeem_android')}</p>
        {/* Contenu i18n propre (lien officiel) — HTML de confiance. */}
        <p className="mt-1" dangerouslySetInnerHTML={{ __html: t('coupons.redeem_ios') }} />
      </div>

      <CouponsList
        coupons={coupons}
        strings={{
          copy: t('home.codes.copy'),
          copied: t('common.copied'),
          empty: t('home.codes.empty'),
          active: t('coupons.active'),
          upcoming: t('coupons.upcoming'),
          expired: t('coupons.expired'),
          validity: t('coupons.validity'),
        }}
      />
    </main>
  );
}
