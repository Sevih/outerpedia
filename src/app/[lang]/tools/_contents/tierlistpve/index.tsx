import type { Lang } from '@/lib/i18n/config';
import { TierListTool } from '../_shared/TierListTool';

/** Tier list PvE — tout le socle vit dans `_shared/TierListTool` (mode `pve`). */
export default async function TierlistPve({ lang }: { lang: Lang }) {
  return <TierListTool lang={lang} mode="pve" />;
}
