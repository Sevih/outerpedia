// app/guides/[category]/[slug]/GuideContentWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import GuideLoading from '@/app/components/GuideLoading';
import type { TenantKey } from '@/tenants/config';

type Props = {
  category: string;
  slug: string;
  lang?: TenantKey;
};

const GuideContentWrapper = ({ category, slug, lang = 'en' }: Props) => {
  // Import dynamique côté client avec préchargement
  // Essaie d'abord le fichier avec la langue dans un sous-dossier (nouveau système)
  // Puis fallback vers le fichier langue direct
  // Puis fallback vers le fichier sans langue (ancien système)
  // Puis fallback vers anglais
  const GuideComponent = dynamic(
    () => import(`@/app/guides/_contents/${category}/${slug}/${lang}`)
      .catch(() => import(`@/app/guides/_contents/${category}/${slug}/en`))
      .catch(() => import(`@/app/guides/_contents/${category}/${slug}`))
      .catch(() => {
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
