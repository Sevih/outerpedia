import guides from '@/data/guides/guides-ref.json';
import GuideCardGrid from '@/app/components/GuideCardGrid';
import UnderConstruction from '@/app/components/UnderConstruction';
import rawCategoryMeta from '@/data/guides/categories.json';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SortSelector from '@/app/components/SortSelector';
import AdventureGuideGrid from '@/app/components/AdventureGuideGrid';


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

  filtered.sort((a, b) => {
    const dateDiff = new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.title.localeCompare(a.title); // Z → A
  });



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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-4 text-center w-full max-w-[90%]">
          <h1 className="text-white font-bold drop-shadow-sm leading-tight uppercase tracking-wide text-balance text-[clamp(1.25rem,5vw,2.25rem)]">
            {meta.title}
          </h1>
        </div>
      </div>
      {category !== 'adventure' && (
        <div className="mb-4 flex justify-end items-center gap-2">
          <label className="text-sm text-white">Sort by:</label>
          <SortSelector />
        </div>
      )}


      {/** if cat adventure regroup par saison et spoiler trigger*/}

      {category === 'adventure' ? (
        <AdventureGuideGrid items={filtered} />
      ) : (
        <GuideCardGrid items={filtered} />
      )}


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
    </div>
  );
}
