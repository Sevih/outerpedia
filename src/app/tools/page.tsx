import toolDescriptions from '@/lib/toolDescriptions.json'; // Assurez-vous que le chemin est correct
import type { Metadata } from 'next';
import { getToolRoutes } from "@/lib/getToolRoutes";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-static";

// src/app/tools/metadata.ts (ou à la racine du fichier page.tsx)


const tools = Object.values(toolDescriptions) as {
    name: string;
    description: string;
  }[];

  const title = 'Outerplane Tools | Outerpedia';

  const description = `Use Outerplane tools like ${tools.map(t => t.name).join(', ')}, and more to optimize your builds and gear.`;

const stopwords = new Set([
  'the', 'and', 'their', 'with', 'which', 'use', 'using', 'helps', 'help','considered','effects','star','list', 'tool', 'tier','gear','recommended',
  'complete', 'based', 'most', 'best', 'this', 'that', 'your', 'unsure','builds','character','evaluations','usage','exclusive','discover',
  'characters', 'match', 'impact', 'level', 'usefulness', 'find', 'finder','amulets','weapons','sets','transcends','outerplane','priority',
  'ranking', 'statistics','equipment', 'gear'
]);


const keywords = new Set<string>();

for (const t of tools) {
  // Ajoute l'expression complète (titre)
  keywords.add(t.name.toLowerCase().replace(/\s*-\s*/g, ' '));

  // Ajoute les mots significatifs extraits du nom
  t.name.toLowerCase().split(/\W+/).forEach(w => {
    if (w.length > 3 && !stopwords.has(w)) {
      keywords.add(w);
    }
  });

  // Ajoute les mots significatifs extraits de la description
  t.description.toLowerCase().split(/\W+/).forEach(w => {
    if (w.length > 3 && !stopwords.has(w)) {
      keywords.add(w);
    }
  });
}

export const metadata: Metadata = {
  
    title,
    description,
    alternates: {
    canonical: 'https://outerpedia.com/tools',
  },
    keywords: ['outerpedia','outerplane tools', 'mobile rpg tools', ...Array.from(keywords).sort()],
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


export default function ToolsPage() {
  const tools = getToolRoutes();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tools</h1>
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
