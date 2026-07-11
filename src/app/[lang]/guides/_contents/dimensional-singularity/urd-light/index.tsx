import { BossGuide, type BossGuideContent } from '@/components/guides/BossGuide';
import type { GuideContentProps } from '@/lib/data/guides';
import content from './content.json';

/** Guide de boss — tout le rendu vit dans `BossGuide` (cf. son en-tête). */
export default function Guide(props: GuideContentProps) {
  return <BossGuide {...props} content={content as BossGuideContent} />;
}
