import type { Lang } from '@/lib/i18n/config';
import { TierListTool } from '../_shared/TierListTool';

/** Tier list PvP — tout le socle vit dans `_shared/TierListTool` (mode `pvp`). */
export default async function TierlistPvp({ lang }: { lang: Lang }) {
  return <TierListTool lang={lang} mode="pvp" />;
}
