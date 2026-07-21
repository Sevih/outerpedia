import { ExtractorSidebar } from '@/components/admin/ExtractorSidebar';
import { buildGearRows, gearReviewCounts } from '@/lib/admin/gear-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Extractor (même UX que les personnages). */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <ExtractorSidebar
        rows={buildGearRows('sets')}
        counts={gearReviewCounts('sets')}
        basePath="/admin/extractor/sets"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
