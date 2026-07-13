import { VersionedBossGuide } from '@/components/guides/VersionedBossGuide';
import type { GuideContentProps } from '@/lib/data/guides';

/** Guide de boss versionné — tout le rendu vit dans `VersionedBossGuide`. */
export default function Guide(props: GuideContentProps) {
  return <VersionedBossGuide {...props} />;
}
