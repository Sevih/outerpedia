import rawGuides from '@/data/guides/guides-ref.json';
import rawCategoryMeta from '@/data/guides/categories.json';
import { notFound } from 'next/navigation';
import GuideContentWrapper from './GuideContentWrapper';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

type Guide = {
  category: string;
  title: string;
  description: string;
  icon: string;
  last_updated: string;
  author: string;
  second_image?: string;
};

type Props = {
  params: {
    category: string;
    slug: string;
  };
};

const categoryMeta: Record<string, {
  title: string;
  description: string;
  icon: string;
  valid: boolean;
}> = rawCategoryMeta;

const guides: Record<string, Guide> = rawGuides;

// 📌 Génération des routes statiques
export async function generateStaticParams() {
  return Object.entries(guides).map(([slug, guide]) => ({
    category: guide.category,
    slug,
  }));
}

// 📌 Métadonnées dynamiques pour SEO
export async function generateMetadata({ params }: { params: Promise<Props["params"]> }): Promise<Metadata> {
  const { category, slug } = await params;
  const guide = guides[slug];


  if (!guide || guide.category !== category) {
    return {
      title: 'Guide not found',
      description: 'This guide does not exist.',
    };
  }

  const meta = categoryMeta[category];

  const url = `https://outerpedia.com/guides/${guide.category}/${slug}`;
  let image: string;

  switch (guide.category) {
    case 'monad-gate':
      image = `https://outerpedia.com/images/guides/monad-gate/CM_Adventure_MonadGate.png`;
      break;
    default:
      image = `https://outerpedia.com/images/guides/${guide.category}/${slug}_portrait.png`;
      break;
  }


  return {
    title: `${guide.title} |  ${meta.title} | Outerpedia`,
    description: `${meta.title} ${guide.title} ${guide.description}`,
    keywords: generateGuideKeywords(guide, slug),
    alternates: {
      canonical: `https://outerpedia.com/guides/${guide.category}/${slug}`,
    },
    openGraph: {
      title: `${guide.title} | ${meta.title} | Outerpedia`,
      description: `${meta.title} ${guide.title} ${guide.description}`,
      type: 'article',
      url,
      images: [
        {
          url: image,
          width: 150,
          height: 150,
          alt: `${guide.title} portrait`,
        },
      ]
    },
    twitter: {
      card: 'summary',
      title: `${guide.title} |  ${meta.title} | Outerpedia`,
      description: `${meta.title} ${guide.title} ${guide.description}`,
      images: [image],
    },
  };
}


// 📌 Rendu principal de la page
export default async function GuidePage({ params }: { params: Promise<Props["params"]> }) {
  const { category, slug } = await params;
  const guide = guides[slug];

  if (!guide || guide.category !== category) {
    notFound();
  }

  const meta = categoryMeta[category];

  let image: string;
  let secondeimage: string | undefined;

  switch (guide.category) {
    case 'monad-gate':
      image = `/images/guides/monad-gate/CM_Adventure_MonadGate.webp`;
      secondeimage = `/images/guides/monad-gate/CM_Adventure_MonadGate.webp`;
      break;
    default:
      image = `/images/guides/${guide.category}/${slug}_banner.webp`;
      secondeimage = guide.second_image
        ? `/images/guides/${guide.category}/${guide.second_image}_banner.webp`
        : undefined;
      break;
  }


  return (

    <div className="p-6">
      <div className="sr-only">
        <h1>{`${guide.title} | ${meta.title}`}</h1>
      </div>
      <div className="relative w-full h-[150px] rounded-2xl overflow-hidden mb-6">
        {/* Image centrée */}

        {
          !secondeimage ? (
            // 🟦 Cas 1 : une seule bannière
            <Image
              src={image}
              alt={`${guide.title} banner`}
              fill
              sizes="100vw"
              className="object-contain z-0"
              priority
            />
          ) : (
            // 🟪 Cas 2 : deux images
            <>
              <Image
                src={image}
                alt={`${guide.title} banner`}
                fill
                sizes="100vw"
                className="object-contain"
                style={{ left: '20%' }}
                priority
              />
              <Image
                src={secondeimage}
                alt={`${guide.title} second banner`}
                fill
                sizes="100vw"
                className="object-contain"
                style={{ left: '-20%' }}
              />
            </>
          )
        }




        {/* Flèche retour */}
        <div className="absolute top-4 left-4 z-20 h-[32px] w-[32px]">
          <Link href={`/guides/${category}`} className="relative block h-full w-full">
            <Image
              src="/images/ui/CM_TopMenu_Back.webp"
              alt="Back"
              fill
              sizes='32px'
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Texte positionné sur la zone rouge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white text-center px-4">
          <div className="text-xs sm:text-sm uppercase tracking-wide font-semibold mb-3">
            <span className="guide-title">{category.replace(/-/g, ' ')}</span>
          </div>
          <div className="text-base sm:text-lg md:text-xl font-bold leading-tight max-w-full break-words">
            <span className="guide-title mt-4">{guide.title}</span>
          </div>
        </div></div>

      <div className="text-sm text-neutral-400 mb-6">
        ✍️ {guide.author} · 🕒 {new Date(guide.last_updated).toLocaleDateString()}
      </div>

      {category === 'general-guides' ? (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This guide provides information and advice about <strong>{guide.title}</strong> in Outerplane.<br />
          If you have additional tips or notice any missing details, feel free to share them with us on&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            EvaMains Discord
          </Link>.
        </p>
      ) : category === 'special-request' ? (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This guide provides strategies and tips for defeating the <strong>{guide.title}</strong> gear boss in Outerplane.<br />
          If you know any additional tactics, team compositions, or optimizations, feel free to share them with us on&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            EvaMains Discord
          </Link>.
        </p>) : (
        <p className="text-sm text-gray-300 max-w-3xl mt-2 m-auto text-center mb-4">
          This guide covers all currently available information and advice for <strong>{category.replace(/-/g, ' ')}</strong> – <strong>{guide.title}</strong> in Outerplane.<br />
          If you know any additional strategies, tips, or missing details, feel free to share them with us on&nbsp;
          <Link
            href="https://discord.gg/keGhVQWsHv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1 text-amber-300"
          >
            EvaMains Discord
          </Link>.
        </p>
      )}


      <div className="mt-6">
        <GuideContentWrapper category={category} slug={slug} />
      </div>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            author: {
              '@type': 'Person',
              name: guide.author,
            },
            datePublished: guide.last_updated,
            url: `https://outerpedia.com/guides/${category}/${slug}`,
          }),
        }}
      />
    </div>
  );


}

function generateGuideKeywords(guide: Guide, slug: string): string[] {
  const { category, title, description, last_updated } = guide;

  const base = [
    'outerplane',
    'outerpedia',
    'outerplane wiki',
    'outerplane guide',
    title,
    `${title} guide`,
    slug,
    'turn-based rpg',
    'mobile rpg',
    'character builds'
  ];

  const extras: Record<string, string[]> = {
    'adventure': ['spoiler-free', 'map strategy', 'chapter walkthrough', 'adventure mode', 'stage progression', 'pve'],
    'world-boss': ['world boss', 'extreme league', 'boss strategy', 'team building', 'gear recommendation', 'pve'],
    'joint-boss': ['joint boss', 'raid build', 'high score', 'damage optimization', 'pve'],
    'adventure-license': ['promotion license', 'promotion battle', 'AL', 'stage', 'pve'],
    'special-request': ['request', 'gear boss', 'identification', 'ecology study', 'special Request'],
    'irregular-extermination': ['irregular extermination', 'limited time event', 'event build', 'pve'],
    'guild-raid': ['guild raid', 'co-op boss', 'guild damage', 'weekly ranking', 'pve'],
    'general-guides': ['beginner guide', 'resource management', 'daily', 'system overview', 'pve'],
  };

  const normalizedCat = category.toLowerCase();
  let categoryKeywords: string[] = [];


  for (const key in extras) {
    if (normalizedCat.includes(key)) {
      categoryKeywords = extras[key];
      break;
    }
  }

  // Analyse de la description
  const desc = description?.toLowerCase() ?? '';
  const descriptionKeywords = [];

  if (desc.includes('video')) descriptionKeywords.push('video guide');
  if (desc.includes('full run')) descriptionKeywords.push('full run');
  if (desc.includes('combat')) descriptionKeywords.push('combat footage');
  if (desc.includes('strategy')) descriptionKeywords.push('strategy');
  if (desc.includes('boss')) descriptionKeywords.push('boss fight');

  // Ajout des éléments temporels
  const date = new Date(last_updated);
  const year = date.getFullYear();
  const monthName = date.toLocaleString('en-US', { month: 'long' });

  const dateKeywords = [
    `updated ${year}`,
    `${monthName} ${year}`,
    `guide ${year}`
  ];

  return [...base, ...categoryKeywords, ...descriptionKeywords, ...dateKeywords];
}
