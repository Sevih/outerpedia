import promoCodes from '@/data/promo-codes.json'
import { Metadata } from 'next'
import CopyButton from '@/app/components/ui/CopyButton'
import ItemInlineDisplay from '@/app/components/ItemInline'
type RawPromoCode = {
  code: string
  description?: Record<string, unknown>
  start: string
  end: string
}

const rawCodes = promoCodes as RawPromoCode[]


export const metadata: Metadata = {
  title: 'Outerplane Coupon Codes – Outerpedia',
  description: 'List of all valid, expired, and upcoming coupon codes for Outerplane. Updated regularly.',
  keywords: [
    'outerplane',
    'outerpedia',
    'outerplane coupon',
    'outerplane code',
    'outerplane promo code',
    'outerplane redeem code',
    'outerplane rewards',
    'outerplane coupon list',
    'mobile rpg coupon',
    'turn-based rpg code',
  ],
  openGraph: {
    title: 'Outerplane Coupon Codes – Outerpedia',
    description: 'Get all valid, expired, and upcoming promo codes for Outerplane. Updated regularly on Outerpedia.',
    url: 'https://outerpedia.com/coupons',
    type: 'article',
    siteName: 'Outerpedia',
    images: [
      {
        url: 'https://outerpedia.com/images/ui/og_home.jpg',
        width: 1200,
        height: 630,
        alt: 'Outerpedia Coupon Codes',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outerplane Coupon Codes – Outerpedia',
    description: 'Browse all working and expired coupon codes for Outerplane. Easily copy and redeem your rewards.',
    images: ['https://outerpedia.com/images/ui/og_home.jpg'],
  },
  alternates: {
    canonical: 'https://outerpedia.com/coupons',
  },
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

export default function CouponsPage() {
  const allCodes: (PromoCode & { status: 'active' | 'expired' | 'upcoming' })[] = rawCodes.map(c => ({
  code: c.code,
  start: c.start,
  end: c.end,
  description: Object.fromEntries(
    Object.entries(c.description ?? {}).filter(([v]) => typeof v === 'string')
  ) as Record<string, string>,
  status: getStatus(c as PromoCode)
}))



  const sorted = [
    ...allCodes.filter(c => c.status === 'active'),
    ...allCodes.filter(c => c.status === 'upcoming'),
    ...allCodes.filter(c => c.status === 'expired')
  ]

  return (
    <div className="px-4 md:px-16 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">🎁 All Coupon Codes</h1>

      <div className="bg-gray-900 rounded-xl p-6 divide-y divide-white/10">
        {sorted.map(({ code, description, start, end, status }) => (
          <div key={code} className="py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold">{code}</span>
                <CopyButton code={code} />
              </div>

              <span className={`text-sm font-medium mt-2 sm:mt-0 ${
                status === 'active'
                  ? 'text-green-400'
                  : status === 'expired'
                  ? 'text-red-400'
                  : 'text-yellow-300'
              }`}>
                {status === 'active' ? '✅ Active' : status === 'expired' ? '❌ Expired' : '⏳ Upcoming'}
              </span>
            </div>

            <ul className="text-sm text-gray-300 space-y-1 mt-1">
              {Object.entries(description).map(([key, value]) => (
                <li key={key}>→ <strong><ItemInlineDisplay names={key} /></strong>: {value}</li>
              ))}
            </ul>

            <p className="text-xs text-gray-500 mt-2">
              Valid from <time>{start}</time> to <time>{end}</time>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
