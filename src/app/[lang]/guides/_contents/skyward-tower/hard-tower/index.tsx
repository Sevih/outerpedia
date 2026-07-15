import { TowerGuide } from '@/components/guides/TowerGuide';
import type { GuideContentProps } from '@/lib/data/guides';

/** Guide de tour — tout le rendu vit dans `TowerGuide` (cf. son en-tête). */
export default function Guide(props: GuideContentProps) {
  return <TowerGuide {...props} />;
}
