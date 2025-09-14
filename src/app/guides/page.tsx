import GuideCategoryList from '@/app/components/CategoryCard';
import type { Metadata } from 'next';
import rawCategories from '@/data/guides/categories.json';


export const dynamic = 'force-static'; // ou 'auto'

const categoryMeta = Object.values(rawCategories);

const dynamicKeywords = categoryMeta
  .filter(cat => cat.valid)
  .flatMap(cat => [
    cat.title,
    cat.title.replace(' Guides', '').toLowerCase(), // e.g. "joint boss"
  ]);


const description =
  'Browse all strategy guides for Outerplane: ' +
  categoryMeta.map(c => c.title.replace(' Guides', '')).join(', ') +
  '. Updated regularly with boss tips, adventure help, and event walkthroughs.';


export const metadata: Metadata = {
  title: 'Outerplane Guides | Outerpedia',
  description,
  keywords: [
    'outerplane guides',
    'strategy guides',
    'outerpedia',
    ...dynamicKeywords,
    'turn-based rpg',
    'mobile rpg'
  ],
  alternates: {
    canonical: 'https://outerpedia.com/guides',
  },
  openGraph: {
    title: 'Outerplane Guides | Outerpedia',
    description,
    url: 'https://outerpedia.com/guides',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outerplane Guides | Outerpedia',
    description
  }
};



export default function GuidesHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Guides</h1>
      <GuideCategoryList />
    </div>
  );
}
