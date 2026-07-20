import type { Lang } from '@/lib/i18n/config';
import { TierListTool } from '../_shared/TierListTool';

/** Priorité des EE (+10) — socle commun `_shared/TierListTool` (mode `ee-plus10`). */
export default async function EePriorityPlus10({ lang }: { lang: Lang }) {
  return <TierListTool lang={lang} mode="ee-plus10" />;
}
