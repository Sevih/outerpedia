import { ExtractorSidebar } from '@/components/admin/ExtractorSidebar';
import { ADMIN_SPRITE_ROUTE } from '@/components/admin/sprite-route';
import { buildGearRows, gearReviewCounts } from '@/lib/admin/gear-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Extractor (même UX que les personnages). */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <ExtractorSidebar
        rows={buildGearRows('weapons', ADMIN_SPRITE_ROUTE)}
        counts={gearReviewCounts('weapons')}
        basePath="/admin/extractor/weapons"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
