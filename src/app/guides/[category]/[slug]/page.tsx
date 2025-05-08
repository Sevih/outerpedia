import rawGuides from '@/data/guides/guides-ref.json';
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

  const url = `https://outerpedia.com/guides/${guide.category}/${slug}`;
  const image = `https://outerpedia.com/images/guides/${guide.category}/${slug}_portrait.png`;

  return {
    title: `${guide.title} | Outerpedia`,
    description: guide.description,
    openGraph: {
      title: `${guide.title} | Outerpedia`,
      description: guide.description,
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
      title: `${guide.title} | Outerpedia`,
      description: guide.description,
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

  return (
    <div className="p-6">
      <div className="relative w-full h-[150px] rounded-2xl overflow-hidden mb-6">
        {/* Image centrée */}

        {
          !guide.second_image ? (
            // 🟦 Cas 1 : une seule bannière
            <Image
              src={`/images/guides/${guide.category}/${slug}_banner.webp`}
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
                src={`/images/guides/${guide.category}/${slug}_banner.webp`}
                alt={`${guide.title} banner`}
                fill
                sizes="100vw"
                className="object-contain"
                style={{ left: '20%' }}
                priority
              />
              <Image
                src={`/images/guides/${guide.category}/${guide.second_image}_banner.webp`}
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




      <p className="text-neutral-300 mb-2">{guide.description}</p>

      <div className="text-sm text-neutral-400 mb-6">
        ✍️ {guide.author} · 🕒 {new Date(guide.last_updated).toLocaleDateString()}
      </div>

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
