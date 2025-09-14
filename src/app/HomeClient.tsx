'use client'

import Link from 'next/link'
import { changelog } from "@/data/changelog"
import { renderMarkdown } from "@/utils/markdown"

const recentChanges = changelog.slice(0, 5)

export default function HomeClient() {
  return (
    <div className="space-y-16 px-4 md:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Outerpedia",
              "url": "https://outerpedia.com",
              "description": "Outerpedia is a complete database for the mobile RPG Outerplane. Discover characters, gear builds, exclusive equipment, sets and more."
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Outerpedia",
              "url": "https://outerpedia.com",
              "logo": "https://outerpedia.com/images/icons/icon-192x192.png",
              "sameAs": [
                "https://discord.gg/keGhVQWsHv"
              ],
              "description": "Fan-made wiki for Outerplane: tier list, character builds, equipment database and more."
            }
          ])
        }}
      />


      {/* SECTION RECENT UPDATES */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-8 text-white text-center relative">
          <span className="relative z-10">Latest Outerpedia Updates & Features</span>
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
        </h2>

        <div className="relative border-l border-gray-700 pl-6 space-y-8">
          {recentChanges.map((entry, index) => (
            <div key={index} className="relative bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <span className="absolute left-[-11px] top-5 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white" />

              <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                <span className="font-mono">{entry.date}</span>
                <span
                  className={`uppercase text-xs font-bold px-2 py-0.5 rounded bg-opacity-20 ${entry.type.toUpperCase() === 'FEATURE'
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
                dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content.join('\n')) }}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/changelog" className="text-sm text-primary hover:underline">
            View full changelog →
          </Link>
        </div>
        <h2 className="sr-only">Outerpedia Outerplane database changelog and feature log</h2>
      </section>
    </div>
  )
}
