import { StoryBossGuide, type StoryGuideContent } from '@/components/guides/StoryBossGuide';
import type { GuideContentProps } from '@/lib/data/guides';
import content from './content.json';

/** Guide de stage d'histoire — tout le rendu vit dans `StoryBossGuide`. */
export default function Guide(props: GuideContentProps) {
  return <StoryBossGuide {...props} content={content as StoryGuideContent} />;
}
