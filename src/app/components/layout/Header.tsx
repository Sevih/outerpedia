'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useTenant } from '@/lib/contexts/TenantContext'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '@/lib/contexts/I18nContext'

const nav = [
  { key: 'nav.characters', href: '/characters', icon: 'CM_EtcMenu_Colleague' },
  { key: 'nav.equipment', href: '/equipments', icon: 'CM_EtcMenu_Inventory' },
  { key: 'nav.tierlist', href: '/tierlist', icon: 'CM_Mission_Icon_Weekly' },
  { key: 'nav.utilities', href: '/tools', icon: 'CM_EtcMenu_Setting' },
  { key: 'nav.guides', href: '/guides', icon: 'CM_EtcMenu_Character_Book' },
] as const

export default function Header() {
  const [open, setOpen] = useState(false)
  const { key } = useTenant()
  const { t } = useI18n()

  return (
    // ↑ z-[60] pour passer devant la bannière/hero (plus haut que z-50)
    <header className="sticky top-0 z-[60] bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40 border-b border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/favicon.ico"
            alt="Outerpedia"
            width={28}
            height={28}
            priority
            unoptimized
          />
          <span className="font-semibold tracking-wide">Outerpedia</span>
          <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
            {key.toUpperCase()}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {nav.map(i => (
            <Link
              key={i.href}
              href={i.href}
              className="px-3 py-2 rounded-md hover:bg-zinc-800/60 flex items-center gap-2"
              aria-label={t(i.key)}
            >
              <span className="relative inline-block h-[18px] w-[18px]">
                <Image
                  src={`/images/ui/nav/${i.icon}.webp`}
                  alt=""
                  fill
                  sizes="18px"
                  className="object-contain"
                />
              </span>
              <span>{t(i.key)}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        <button
          className="md:hidden px-3 py-2 rounded hover:bg-zinc-800"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        // ↑ position + z pour garantir l’empilement au-dessus du hero
        <div className="md:hidden border-t border-zinc-800 relative z-[60]">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {nav.map(i => (
              <Link
                key={i.href}
                href={i.href}
                className="px-3 py-2 rounded hover:bg-zinc-800 flex items-center gap-2"
                onClick={() => setOpen(false)}
                aria-label={t(i.key)}
              >
                <span className="relative inline-block h-[18px] w-[18px]">
                  <Image
                    src={`/images/ui/nav/${i.icon}.webp`}
                    alt=""
                    fill
                    sizes="18px"
                    className="object-contain"
                  />
                </span>
                <span>{t(i.key)}</span>
              </Link>
            ))}
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
