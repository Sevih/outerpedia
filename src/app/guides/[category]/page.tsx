import guides from '@/data/guides/guides-ref.json';
import GuideCardGrid from '@/app/components/GuideCardGrid';
import UnderConstruction from '@/app/components/UnderConstruction';
import rawCategoryMeta from '@/data/guides/categories.json';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';


type Guide = {
  category: string;
  title: string;
  description: string;
  icon: string;
  last_updated: string;
  author: string;
};

const categoryMeta: Record<string, {
  title: string;
  description: string;
  icon: string;
  valid: boolean;
}> = rawCategoryMeta;


type Props = {
  params: { category: string };
};

export async function generateMetadata({ params }: { params: Promise<Props["params"]> }): Promise<Metadata> {
  const { category } = await params;

  const meta = categoryMeta[category];
  if (!meta) {
    return {
      title: 'Category not found',
      description: 'This guide category does not exist.',
    };
  }

  return {
    title: `${meta.title} | Outerpedia`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | Outerpedia`,
      description: meta.description,
      images: [`https://outerpedia.com${meta.icon}.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} | Outerpedia`,
      description: meta.description,
      images: [`https://outerpedia.com${meta.icon}.png`],
    },
  };
}


export default async function CategoryPage({ params }: { params: Promise<Props["params"]> }) {
  const { category } = await params;

  const meta = categoryMeta[category];
  if (!meta) return <UnderConstruction />;
  const filtered = Object.entries(guides)
    .filter(([, g]) => g.category === category)
    .map(([slug, g]: [string, Guide]) => ({
      slug,
      title: g.title,
      description: g.description,
      icon: g.icon,
      category: g.category,
      last_updated: g.last_updated,
      author: g.author,
    }));

  if (filtered.length === 0) {
    return <UnderConstruction />;
  }

  filtered.sort((a, b) =>
  new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
);


  return (
    <div className="p-6">
      <div className="relative w-full h-[150px] rounded-2xl overflow-hidden mb-6">

  {/* Flèche retour */}
  <div className="absolute top-4 left-4 z-10 h-[32px] w-[32px]">
    <Link href="/guides" className="relative block h-full w-full">
      <Image
        src="/images/ui/CM_TopMenu_Back.webp"
        alt="Back"
        fill
        sizes="32px"
        className="opacity-80 hover:opacity-100 transition-opacity"
      />
    </Link>
  </div>

  {/* Titre de la catégorie */}
  <div className="absolute top-1/2 left-[32%] -translate-y-1/2 z-10">
    <h1 className="text-white text-2xl font-bold drop-shadow-sm leading-tight text-left uppercase tracking-wide">
      {meta.title}
    </h1>
  </div>
</div>
<div className="mb-4 flex justify-end items-center gap-2">
  <label className="text-sm text-white">Sort by:</label>
  <select
    id="sortSelector"
    className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1 text-sm"
  >
    <option value="date-desc">Date (Newest)</option>
    <option value="date-asc">Date (Oldest)</option>
    <option value="title-asc">Title A→Z</option>
    <option value="title-desc">Title Z→A</option>
    <option value="author-asc">Author A→Z</option>
    <option value="author-desc">Author Z→A</option>
  </select>
</div>


      <GuideCardGrid items={filtered} />

      {/* Bloc JSON-LD pour la catégorie */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: meta.title,
            description: meta.description,
            mainEntity: filtered.map((g) => ({
              '@type': 'Article',
              headline: g.title,
              author: {
                '@type': 'Person',
                name: g.author,
              },
              datePublished: g.last_updated,
              description: g.description,
            })),
          }),
        }}
      />
      <script
  suppressHydrationWarning
  dangerouslySetInnerHTML={{
    __html: `
      document.getElementById('sortSelector')?.addEventListener('change', (e) => {
        const value = e.target.value;
        const [key, order] = value.split('-');
        const container = document.querySelector('[data-guide-grid]');
        if (!container) return;

        const cards = Array.from(container.children);
        cards.sort((a, b) => {
          const va = a.dataset[key];
          const vb = b.dataset[key];
          if (key === 'date') {
            return order === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
          } else {
            return order === 'asc'
              ? va.localeCompare(vb)
              : vb.localeCompare(va);
          }
        });

        cards.forEach((el) => container.appendChild(el));
      });
    `,
  }}
/>


    </div>
    
    
  );
}
