'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const navItems = [
  { label: 'Characters', href: '/characters', icon: 'CM_EtcMenu_Colleague' },
  { label: 'Equipment', href: '/equipments', icon: 'CM_EtcMenu_Inventory' },
  { label: 'Tier List', href: '/tierlist', icon: 'CM_Mission_Icon_Weekly' },
  { label: 'Tools', href: '/tools', icon: 'CM_EtcMenu_Setting' },
  { label: 'Guides', href: '/guides', icon: 'CM_EtcMenu_Character_Book' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-sm shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4 relative z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-cyan-300 transition text-white">
          <Image src="/images/logo.webp" alt="Outerpedia Logo" width={40} height={40} priority />
          Outerpedia
        </Link>

        {/* Burger button */}
        <button
          className="sm:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menu mobile */}
        <div className={`absolute top-16 left-0 w-full bg-black/90 flex-col gap-4 p-6 transition-all duration-300 ease-in-out sm:hidden ${menuOpen ? 'flex' : 'hidden'}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-white hover:text-cyan-300 transition"
              onClick={() => setMenuOpen(false)}
            >

              <div className="relative w-[18px] h-[18px]">
                <Image
                  src={`/images/ui/nav/${item.icon}.webp`}
                  alt={item.label}
                  fill
                  className="object-contain"
                  sizes="18px"

                />
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Menu desktop */}
        <div className="hidden sm:flex gap-6 text-white items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 hover:text-cyan-300 transition"
            >
              <div className="relative w-[18px] h-[18px]">
                <Image
                  src={`/images/ui/nav/${item.icon}.webp`}
                  alt={item.label}
                  fill
                  className="object-contain"
                  sizes="18px"
                />
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* BACKDROP */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  )
}
