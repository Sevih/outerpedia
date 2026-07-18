import { ExtractorReview } from '@/components/admin/ExtractorReview';
import { equipmentReviewProps } from '@/lib/admin/equipment-review';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Extractor · Amulet</h1>
        <p className="text-content-muted text-sm">
          Diff « data du jeu ↔ data du site » — nouveau / vrai écart / typo.
        </p>
      </div>
      <ExtractorReview {...equipmentReviewProps('amulet')} />
    </div>
  );
}
