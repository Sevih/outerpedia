// app/(tools)/coupons/page.tsx
import type { Metadata } from 'next'
import promoCodes from '@/data/promo-codes.json'
import CopyButton from '@/app/components/ui/CopyButton'
import ItemInlineDisplay from '@/app/components/ItemInline'
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { websiteLd, breadcrumbLd, couponsListLd } from './jsonld'
import { getTenantServer } from '@/tenants/tenant.server'
import { getServerI18n } from '@/lib/contexts/server-i18n'

type RawPromoCode = {
  code: string
  description?: Record<string, unknown>
  start: string
  end: string
}

type PromoCode = {
  code: string
  description: Record<string, string>
  start: string
  end: string
}

function getStatus(code: PromoCode): 'active' | 'expired' | 'upcoming' {
  const today = new Date()
  const start = new Date(code.start)
  const end = new Date(code.end)
  if (today < start) return 'upcoming'
  if (today > end) return 'expired'
  return 'active'
}

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/coupons',
    titleKey: 'coupons.meta.title',
    descKey: 'coupons.meta.desc',
    ogTitleKey: 'coupons.og.title',
    ogDescKey: 'coupons.og.desc',
    twitterTitleKey: 'coupons.twitter.title',
    twitterDescKey: 'coupons.twitter.desc',
    keywords: [
      'outerplane',
      'outerpedia',
      'outerplane coupon',
      'outerplane code',
      'outerplane promo code',
      'outerplane redeem code',
      'outerplane rewards',
    ],
    // garde ton visuel actuel (tu pourras passer en .png si tu as un équivalent)
    image: {
      url: 'https://outerpedia.com/images/ui/og_home.jpg',
      width: 1200,
      height: 630,
      altKey: 'coupons.og.imageAlt',
      altFallback: 'Outerpedia Coupon Codes',
    },
  })
}

export default async function CouponsPage() {
  const { key: langKey, domain } = await getTenantServer()
  const { t } = await getServerI18n(langKey)

  const raw = promoCodes as RawPromoCode[]
  const allCodes: (PromoCode & { status: 'active' | 'expired' | 'upcoming' })[] = raw.map((c) => {
    const desc = Object.fromEntries(
      Object.entries(c.description ?? {}).filter(
        ([, v]) => typeof v === 'string'
      )
    ) as Record<string, string>
    const pc: PromoCode = { code: c.code, start: c.start, end: c.end, description: desc }
    return { ...pc, status: getStatus(pc) }
  })

  const sortByStartDesc = (a: PromoCode, b: PromoCode) =>
    new Date(b.start).getTime() - new Date(a.start).getTime()

  const sorted = [
    ...allCodes.filter((c) => c.status === 'active').sort(sortByStartDesc),
    ...allCodes.filter((c) => c.status === 'upcoming').sort(sortByStartDesc),
    ...allCodes.filter((c) => c.status === 'expired').sort(sortByStartDesc),
  ]

  return (
    <div className="px-4 md:px-16 py-10 text-white">
      <JsonLd
        json={[
          websiteLd(domain),
          breadcrumbLd(domain, {
            home: t('nav.home') ?? 'Home',
            current: t('titles.main.coupon') ?? 'Coupon Codes',
            currentPath: '/coupons',
          }),
          couponsListLd(domain, {
            title: t('coupons.itemList.title') ?? 'Outerplane Coupon Codes',
            description:
              t('coupons.itemList.desc') ??
              'List of valid, upcoming, and expired coupon codes for Outerplane.',
            list: sorted.map(({ code, start, end, status }) => ({ code, start, end, status })),
          }),
        ]}
      />

      <h1 className="text-3xl font-bold mb-6 text-center">
        {t('titles.main.coupon') ?? 'Coupon Codes'}
      </h1>

      <p
        className="text-sm text-gray-300 max-w-4xl mt-2 text-center m-auto"
        // Tu as déjà ces entrées HTML dans les locales → on les rend telles quelles
        dangerouslySetInnerHTML={{
          __html:
            (t('coupon.redeem.android') ?? '') +
            '<br />' +
            (t('coupon.redeem.ios') ?? ''),
        }}
      />

      <div className="bg-gray-900 rounded-xl p-6 divide-y divide-white/10 mt-6">
        {sorted.map(({ code, description, start, end, status }) => (
          <div key={code} id={code} className="py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-lg font-semibold px-1 ${status === 'active'
                    ? 'bg-green-600'
                    : status === 'expired'
                      ? 'bg-red-400'
                      : 'bg-yellow-300 text-black'
                    }`}
                >
                  {code}
                </span>
                <CopyButton code={code} />
              </div>

              <span
                className={`text-sm font-medium mt-2 sm:mt-0 ${status === 'active'
                  ? 'text-green-400'
                  : status === 'expired'
                    ? 'text-red-400'
                    : 'text-yellow-300'
                  }`}
              >
                {status === 'active'
                  ? t('coupon.status.active') ?? '✅ Active'
                  : status === 'expired'
                    ? t('coupon.status.expired') ?? '❌ Expired'
                    : t('coupon.status.upcoming') ?? '⏳ Upcoming'}
              </span>
            </div>

            <ul className="text-sm text-gray-300 space-y-1 mt-1">
              {Object.entries(description).map(([key, value]) => (
                <li key={key}>
                  → <strong><ItemInlineDisplay names={key} /></strong>: {value}
                </li>
              ))}
            </ul>
            <p
              className="text-xs text-gray-500 mt-2"
              dangerouslySetInnerHTML={{
                __html: t('coupon.validity', { start, end }),
              }}
            />

          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        {t('coupon.note.disclaimer') ??
          'Note: Some codes are platform or region-limited. Always check in-game notices.'}
      </p>
    </div>
  )
}
