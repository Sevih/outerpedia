import toolDescriptions from '@/lib/toolDescriptions.json';
import type { Metadata } from 'next';
import { getToolRoutes } from "@/lib/getToolRoutes";
import Link from "next/link";
import Image from "next/image";
import { headers } from 'next/headers'
import { getServerI18n, detectLangFromHost } from '@/lib/contexts/server-i18n'

const tools = Object.values(toolDescriptions) as {
  name: string;
  description: string;
}[];

// 🔁 Titre & description alignés sur "Utilities"
const title = 'Outerplane Utilities | Outerpedia';
const description = `Use Outerplane utilities like ${tools.map(t => t.name).join(', ')}, and more to optimize your builds and gear.`;

const stopwords = new Set([
  'the', 'and', 'their', 'with', 'which', 'use', 'using', 'helps', 'help', 'considered', 'effects', 'star', 'list', 'tool', 'tools', 'tier', 'gear', 'recommended',
  'complete', 'based', 'most', 'best', 'this', 'that', 'your', 'unsure', 'builds', 'character', 'evaluations', 'usage', 'exclusive', 'discover',
  'characters', 'match', 'impact', 'level', 'usefulness', 'find', 'finder', 'amulets', 'weapons', 'sets', 'transcends', 'outerplane', 'priority',
  'ranking', 'statistics', 'equipment', 'gear'
]);

const keywords = new Set<string>();
for (const t of tools) {
  keywords.add(t.name.toLowerCase().replace(/\s*-\s*/g, ' '));
  t.name.toLowerCase().split(/\W+/).forEach(w => {
    if (w.length > 3 && !stopwords.has(w)) keywords.add(w);
  });
  t.description.toLowerCase().split(/\W+/).forEach(w => {
    if (w.length > 3 && !stopwords.has(w)) keywords.add(w);
  });
}

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://outerpedia.com/tools' },
  keywords: ['outerpedia', 'outerplane tools', 'outerplane utilities', 'mobile rpg tools', ...Array.from(keywords).sort()],
  openGraph: {
    title,
    description,
    url: 'https://outerpedia.com/tools',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default async function ToolsPage() {
  const h = await headers()
  const host = h.get('host') ?? ''         // ex: 'jp.outerpedia.local'
  const lang = detectLangFromHost(host)    // 'en' | 'jp' | 'kr'

  const { t } = await getServerI18n(lang)
  const tools = getToolRoutes();

  return (
    <main className="p-6">
      {/* 🏷️ Heading mis à "Utilities" */}
      <h1 className="text-3xl font-bold mb-6">{t('nav.utilities')}</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-2xl border p-6 hover:shadow-lg transition bg-card hover:bg-muted/20"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <Image
                  src={`/images/ui/${tool.icon}`}
                  alt={`${tool.name} icon`}
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{tool.name}</h2>
                <p className="text-sm text-muted-foreground leading-snug">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
