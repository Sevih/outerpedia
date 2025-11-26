'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '@/lib/contexts/I18nContext'
import type { EventMeta } from '@/data/events/registry.types'


const nav = [
  { key: 'nav.characters', href: '/characters', icon: 'CM_EtcMenu_Colleague', short: 'Chars' },
  { key: 'nav.equipment', href: '/equipments', icon: 'CM_EtcMenu_Inventory', short: 'Equip' },
  { key: 'nav.tierlist', href: '/tierlist', icon: 'CM_Mission_Icon_Weekly', short: 'Tier' },
  { key: 'nav.utilities', href: '/tools', icon: 'CM_EtcMenu_Setting', short: 'Tools' },
  { key: 'nav.guides', href: '/guides', icon: 'CM_EtcMenu_Character_Book', short: 'Guides' },
] as const



type Props = { activeEvent: EventMeta | null; extraActiveCount?: number }

export default function HeaderClient({ activeEvent }: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-[60] bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40 border-b border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* groupe gauche : logo + event btn */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-block w-[28px] h-[28px] relative align-bottom">
              <Image
                src="/favicon.ico"
                alt="Outerpedia"
                fill
                sizes='28px'
                className="object-contain"
                priority
                unoptimized
              />
            </span>
            <span className="font-semibold tracking-wide">Outerpedia</span>
          </Link>

          {activeEvent && (
            <Link href="/event" className="ml-2 shrink-0" aria-label="Open event">
              <div
                className="relative h-[25px] w-[120px] min-w-[120px] shrink-0" // <- largeur réservée
              >
                <Image
                  src="/images/ui/event.webp"
                  alt="Current event"
                  fill
                  className="object-contain pointer-events-none select-none"
                  priority
                  style={{
                    WebkitMaskImage:
                      'radial-gradient(circle at center, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                    maskImage:
                      'radial-gradient(circle at center, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: '100% 100%',
                    maskSize: '100% 100%',
                  }}
                />
              </div>
            </Link>
          )}

        </div>

        {/* Desktop nav */}
        {/* Desktop nav : normal → compact → no-icon */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {nav.map(i => (
            <Link
              key={i.href}
              href={i.href}

              className="px-2 lg:px-3 py-2 rounded-md hover:bg-zinc-800/60 flex items-center gap-1.5 lg:gap-2 text-sm"
              aria-label={t(i.key)}
              title={t(i.key)} // utile quand texte masqué/abrégé
            >
              {/* Icône : affichée à partir de lg seulement */}
              <span className="hidden lg:inline-block relative h-[18px] w-[18px] shrink-0">
                <Image
                  src={`/images/ui/nav/${i.icon}.webp`}
                  alt={t(i.key)}
                  fill
                  sizes="18px"
                  className="object-contain"
                />
              </span>

              {/* Label md-only : court, sans icône */}
              <span className="hidden md:inline lg:hidden whitespace-nowrap">
                {t(i.key + '_short', { defaultValue: i.short })}
              </span>

              {/* Label lg-only : court (avec icône) */}
              <span className="hidden lg:inline xl:hidden whitespace-nowrap">
                {t(i.key + '_short', { defaultValue: i.short })}
              </span>

              {/* Label xl+ : complet (avec icône) */}
              <span className="hidden xl:inline whitespace-nowrap">
                {t(i.key)}
              </span>
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
        <div className="md:hidden border-t border-zinc-800 relative z-[60]">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {nav.map(i => (
              <Link key={i.href} href={i.href} className="px-3 py-2 rounded hover:bg-zinc-800 flex items-center gap-2" onClick={() => setOpen(false)} aria-label={t(i.key)}>
                <span className="relative inline-block h-[18px] w-[18px]">
                  <Image src={`/images/ui/nav/${i.icon}.webp`} alt={`${i.short}`} fill sizes="18px" className="object-contain" />
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
