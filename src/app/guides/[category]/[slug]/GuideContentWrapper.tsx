'use client';

import dynamic from 'next/dynamic';
import GuideLoading from '@/app/components/GuideLoading';

type Props = {
  category: string;
  slug: string;
};

const GuideContentWrapper = ({ category, slug }: Props) => {
  const GuideComponent = dynamic(
    () => import(`@/app/guides/_contents/${category}/${slug}`),
    {
      loading: () => <GuideLoading />,
      ssr: false,
    }
  );

  return <GuideComponent />;
};

export default GuideContentWrapper;
