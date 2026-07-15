import { GuildRaidGuide } from '@/components/guides/GuildRaidGuide';
import type { GuideContentProps } from '@/lib/data/guides';

export default function Guide(props: GuideContentProps) {
  return <GuildRaidGuide {...props} />;
}
