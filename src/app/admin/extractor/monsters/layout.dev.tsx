import { ExtractorSidebar } from '@/components/admin/ExtractorSidebar';
import { buildMonsterRows } from '@/lib/admin/monster-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Extractor monstres : même UX que les personnages. */
export default function ExtractorMonstersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <ExtractorSidebar rows={buildMonsterRows()} basePath="/admin/extractor/monsters" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
