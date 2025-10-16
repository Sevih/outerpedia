'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/lib/contexts/I18nContext'

export default function CopyButton({ code }: { code: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  const label = copied ? t('coupon.copied') ?? 'Copied!' : t('coupon.copy') ?? 'Copy'

  return (
    <button
      onClick={copyToClipboard}
      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
      aria-live="polite"
      aria-label={label}
    >
      <Copy size={16} />
      {label}
    </button>
  )
}
