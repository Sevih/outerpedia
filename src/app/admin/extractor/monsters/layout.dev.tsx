import { ExtractorSidebar } from '@/components/admin/ExtractorSidebar';
import { buildMonsterRows } from '@/lib/admin/monster-rows';
import { siteMonsterCounts } from '@/lib/admin/monster-review';

export const dynamic = 'force-dynamic';

/** Master-detail Extractor monstres : même UX que les personnages. */
export default function ExtractorMonstersLayout({ children }: { children: React.ReactNode }) {
  const { rows, modeOptions } = buildMonsterRows();
  return (
    <div className="flex gap-6">
      <ExtractorSidebar
        rows={rows}
        counts={siteMonsterCounts()}
        basePath="/admin/extractor/monsters"
        toggles={[{ flag: 'site', label: 'Used by the site', defaultOn: true }]}
        tagFilter={{ allLabel: 'all modes', options: modeOptions }}
        iconSize={48}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
