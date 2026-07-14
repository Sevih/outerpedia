import { EncounterBossGuide } from '@/components/guides/EncounterBossGuide';
import type { GuideContentProps } from '@/lib/data/guides';

/** Guide de boss à rencontres — tout le rendu vit dans `EncounterBossGuide`. */
export default function Guide(props: GuideContentProps) {
  return <EncounterBossGuide {...props} />;
}
