'use client'

import { useMemo } from 'react'
import { TENANTS, type TenantKey, BASE_DOMAIN } from '@/tenants/config'
import { useTenant } from '@/lib/contexts/TenantContext'

export default function LanguageSwitcher() {
  const { key } = useTenant()   // ✅ on s’aligne sur TenantContext

  const options = useMemo(
    () => ([
      { key: 'en', label: '🇬🇧 English' },
      { key: 'fr', label: '🇫🇷 Français (WIP)' },
      { key: 'jp', label: '🇯🇵 日本語 (WIP)' },
      { key: 'kr', label: '🇰🇷 한국어 (WIP)' },
    ] as { key: TenantKey; label: string }[]),
    []
  )

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target.value as TenantKey
    const { protocol, pathname, search, hash } = window.location
    const host = window.location.host.toLowerCase()

    const isOnBaseDomain =
      host === BASE_DOMAIN || host.endsWith(`.${BASE_DOMAIN}`)

    if (isOnBaseDomain) {
      const nextHost = TENANTS[target].domain
      window.location.href = `${protocol}//${nextHost}${pathname}${search}${hash}`
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.set('lang', target)
    window.location.href = url.toString()
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1"
        value={key}   // ✅ TenantContext comme valeur
        onChange={onChange}
      >
        {options.map(o => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
