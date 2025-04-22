'use client'
import Link from 'next/link'
import { changelog } from "@/data/changelog";
import { renderMarkdown } from "@/utils/markdown";
import WarningBanner from "@/app/components/WarningBanner";

const categories = [
  { name: 'Characters', path: '/characters' },
  { name: 'Equipment', path: '/equipment' },
  { name: 'Tier List', path: '/tierlist' },
  { name: 'Guides', path: '/guides' },
];

const recentChanges = changelog.slice(0, 10);

export default function Home() {
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
      <WarningBanner />

      <section className="text-center">
        <h1 className="text-5xl font-bold mb-2">Welcome to Outerpedia</h1>
        <p className="text-gray-400">Your ultimate Outerplane companion wiki</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <li key={cat.path}>
              <Link href={cat.path}>
                <div className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl text-center shadow-lg transition cursor-pointer">
                  <span className="text-xl font-medium">{cat.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Current Banners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          Coming Soon ...
        </div>
      </section>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Recent Updates</h2>
        <div className="space-y-2">
          {recentChanges.map((entry, index) => (
            <div key={index} className="border-l-4 pl-4 border-primary">
              <div className="text-sm text-muted-foreground">
                {entry.date} — <span className="uppercase text-xs">{entry.type}</span>
              </div>
              <div className="font-medium">{entry.title}</div>
              <div
                className="text-sm text-muted-foreground markdown"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) }}
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Link href="/changelog" className="text-sm text-primary hover:underline">
            View full changelog →
          </Link>
        </div>
      </div>
    </div>
  )
}
