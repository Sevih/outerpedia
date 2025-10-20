// app/guides/[category]/[slug]/GuideContentWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import GuideLoading from '@/app/components/GuideLoading';

type Props = {
  category: string;
  slug: string;
};

const GuideContentWrapper = ({ category, slug }: Props) => {
  // Import dynamique côté client avec préchargement
  const GuideComponent = dynamic(
    () => import(`@/app/guides/_contents/${category}/${slug}`).catch(() => {
      // Fallback en cas d'erreur d'import
      return { default: () => <div>Guide not found</div> };
    }),
    {
      loading: () => <GuideLoading />,
      // SSR activé pour le pré-rendu initial
      ssr: true,
    }
  );

  return (
    <Suspense fallback={<GuideLoading />}>
      <GuideComponent />
    </Suspense>
  );
};

export default GuideContentWrapper;