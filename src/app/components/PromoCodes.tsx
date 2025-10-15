'use client'

import { useEffect, useState } from 'react'
import promoCodes from '@/data/promo-codes.json'
import { Copy } from 'lucide-react'
import Accordion from '@/app/components/ui/Accordion'
import Link from 'next/link'
import ItemInlineDisplay from './ItemInline'
import { useI18n } from '@/lib/contexts/I18nContext'

type PromoCode = {
  code: string
  description: Record<string, string>
  start: string
  end: string
}

export default function PromoCodes() {
  const { t } = useI18n()
  const [validCodes, setValidCodes] = useState<PromoCode[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const today = new Date()
    const filtered = promoCodes.filter(c => {
      const start = new Date(c.start)
      const end = new Date(c.end)
      return start <= today && today <= end
    })
    setValidCodes(
      filtered.map(code => ({
        ...code,
        description: Object.fromEntries(
          Object.entries(code.description).filter(([v]) => typeof v === 'string')
        )
      }))
    )
  }, [])

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  if (validCodes.length === 0) return null

  return (
    <section className="px-4 md:px-16 mb-12">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-xl">🎁</span>{' '}
        <Link href="/coupons" className="underline text-cyan-400">
          {t('titles.main.coupon')}
        </Link>
      </h2>

      <div className="bg-gray-900 rounded-xl p-4 divide-y divide-white/10 space-y-2">
        {validCodes.map(({ code, description }) => (
          <div key={code} className="pt-2">
            <div className="flex justify-between items-center">
              <span className="font-mono font-semibold text-white">{code}</span>
              <button
                onClick={() => copyToClipboard(code)}
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
              >
                <Copy size={16} />
                {copied === code ? t('coupon.copied') : t('coupon.copy')}
              </button>
            </div>
            <ul className="mt-1 text-sm text-gray-300 space-y-1">
              {Object.entries(description).map(([key, value]) => (
                <li key={key}>→ <strong><ItemInlineDisplay names={key} /></strong>: {value}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Accordion
        items={[
          {
            key: 'redeem',
            title: t('coupon.redeem.title'),
            content: (
              <ul className="list-disc list-inside mt-2">
                <li dangerouslySetInnerHTML={{ __html: t('coupon.redeem.android') }} />
                <li dangerouslySetInnerHTML={{ __html: t('coupon.redeem.ios') }} />
              </ul>
            )
          }
        ]}
      />

    </section>
  )
}
