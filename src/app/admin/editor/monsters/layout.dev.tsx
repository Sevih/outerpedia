import { ExtractorSidebar } from '@/components/admin/ExtractorSidebar';
import { buildMonsterRows } from '@/lib/admin/monster-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Editor monstres : même liste que l'Extractor, liens curation. */
export default function EditorMonstersLayout({ children }: { children: React.ReactNode }) {
  const { rows, modeOptions } = buildMonsterRows();
  return (
    <div className="flex gap-6">
      <ExtractorSidebar
        rows={rows}
        basePath="/admin/editor/monsters"
        toggles={[{ flag: 'site', label: 'Used by the site', defaultOn: true }]}
        tagFilter={{ allLabel: 'all modes', options: modeOptions }}
        iconSize={48}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
