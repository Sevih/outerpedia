'use client'

import Link from 'next/link'
import { changelog } from "@/data/changelog"
import { renderMarkdown } from "@/utils/markdown"
import Image from 'next/image'

const categories = [
  { name: 'Characters', path: '/characters' },
  { name: 'Equipments', path: '/equipments' },
  { name: 'Tier List', path: '/tierlist' },
  { name: 'Guides', path: '/guides' },
]

const recentChanges = changelog.slice(0, 10)

export default function HomeClient() {
  return (
    <div className="space-y-12">
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Outerpedia",
          "url": "https://outerpedia.com",
          "description": "Outerpedia is a complete database for the mobile RPG Outerplane. Discover characters, gear builds, exclusive equipment, sets and more.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://outerpedia.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>

      {/* SECTION CATEGORIES */}
      <section className="text-center">
        <h2 className="text-2xl font-extrabold tracking-wide text-white mb-6 relative">
          <span className="z-10 relative">Categories</span>
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
        </h2>

        <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
          {categories.map((cat) => {
            const iconMap: Record<string, string> = {
              Characters: 'CM_Lobby_Button_Character.png',
              Equipments: 'CM_Lobby_Button_Inventory.png',
              'Tier List': 'CM_Lobby_Button_Misson.png',
              Guides: 'CM_Lobby_Button_Organization.png',
            }

            const icon = iconMap[cat.name] || ''

            return (
              <li key={cat.path} className="w-full max-w-[180px]">
                <Link href={cat.path}>
                  <div className="flex flex-col items-center bg-gray-800 hover:bg-gray-700 p-4 rounded-xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer">
                    <Image
                      src={`/images/ui/nav/${icon}`}
                      height={340}
                      width={600}
                      alt={cat.name}
                      className="w-18 h-18 object-contain mb-2"
                    />
                    <span className="text-lg font-semibold text-white">{cat.name}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* SECTION RECENT UPDATES */}
      <section className="mt-12">
  <h2 className="text-2xl font-bold mb-6 text-white text-center relative">
    <span className="relative z-10">Recent Updates</span>
    <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
  </h2>

  <div className="relative border-l border-gray-700 pl-6 space-y-8">
  {recentChanges.map((entry, index) => (
  <div key={index} className="relative bg-gray-800/50 p-4 rounded-xl border border-gray-700">
    <span className="absolute left-[-11px] top-5 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white" />

    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
      <span className="font-mono">{entry.date}</span>
      <span
        className={`uppercase text-xs font-bold px-2 py-0.5 rounded bg-opacity-20 ${
          entry.type.toUpperCase() === 'FEATURE'
            ? 'bg-green-800 text-green-100'
            : entry.type.toUpperCase() === 'UPDATE'
            ? 'bg-blue-800 text-blue-100'
            : entry.type.toUpperCase() === 'FIX'
            ? 'bg-red-800 text-red-100'
            : 'bg-gray-800 text-gray-100'
        }`}
      >
        {entry.type.toUpperCase()}
      </span>
    </div>

    <div className="text-white font-semibold text-lg mb-1">{entry.title}</div>
    <div
      className="text-sm text-gray-300 markdown leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) }}
    />
  </div>
))}

  </div>

  <div className="mt-6 text-center">
    <Link href="/changelog" className="text-sm text-primary hover:underline">
      View full changelog →
    </Link>
  </div>
</section>

    </div>
  )
}
