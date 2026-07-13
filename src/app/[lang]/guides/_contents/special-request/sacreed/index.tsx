import { StagedBossGuide } from '@/components/guides/StagedBossGuide';
import type { GuideContentProps } from '@/lib/data/guides';

/** Guide de boss à stages — tout le rendu vit dans `StagedBossGuide`. */
export default function Guide(props: GuideContentProps) {
  return <StagedBossGuide {...props} />;
}
