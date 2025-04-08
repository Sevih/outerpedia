import Image from 'next/image'
import Link from 'next/link'

const navItems = [
  { label: 'Characters', href: '/characters', icon: 'characters' },
  { label: 'Equipment', href: '/equipments', icon: 'equipments' },
  { label: 'Tier List', href: '/tierlist', icon: 'tierlist' },
  { label: 'Guides', href: '/guides', icon: 'guides' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-sm shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold hover:text-cyan-300 transition"
        >
          <Image src="/images/logo.png" alt="Outerpedia Logo" width={40} height={40} />
          Outerpedia
        </Link>

        <div className="flex gap-4 text-sm sm:text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1 hover:text-cyan-300 transition text-white"
            >
              <Image
                src={`/images/ui/nav/${item.icon}.png`}
                alt={item.label}
                width={18}
                height={18}
                style={{ width: 18, height: 18 }}
              />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
