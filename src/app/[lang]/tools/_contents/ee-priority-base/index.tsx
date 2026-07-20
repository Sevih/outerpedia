import type { Lang } from '@/lib/i18n/config';
import { TierListTool } from '../_shared/TierListTool';

/** Priorité des EE (base) — socle commun `_shared/TierListTool` (mode `ee-base`). */
export default async function EePriorityBase({ lang }: { lang: Lang }) {
  return <TierListTool lang={lang} mode="ee-base" />;
}
