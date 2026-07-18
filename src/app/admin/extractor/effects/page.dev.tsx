import Link from 'next/link';
import type { Route } from 'next';
import { getMergedEffects } from '@/lib/data/effects';
import { reviewBuckets, reviewEntities, reviewTarget } from '@/lib/admin/review-store';
import { ExtractorReview, type NamedReviewEntity } from '@/components/admin/ExtractorReview';

export const dynamic = 'force-dynamic';

/**
 * Extractor · Effect = diff « data du jeu ↔ data du site » (committé vs
 * extraction fraîche), classé new / diff / typo. La curation/catalogue
 * (renommage, création, masquage) vit côté Editor.
 */
export default function ExtractorEffectsControl() {
  const review = reviewTarget('effect');
  const buckets = reviewBuckets(review.diff);
  const nameById = new Map(getMergedEffects().map((e) => [e.id, e.name.en || e.id]));
  const entities: NamedReviewEntity[] = reviewEntities(review.diff).map((e) => ({
    ...e,
    name: nameById.get(e.key) ?? e.key,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-content-strong text-xl font-semibold">Extractor · Effect</h1>
          <p className="text-content-muted text-sm">
            Diff « data du jeu ↔ data du site » — nouveau / vrai écart / typo (coquille).
          </p>
        </div>
        <Link
          href={'/admin/editor/effects' as Route}
          className="border-line bg-surface-raised hover:border-accent rounded-md border px-3 py-1.5 text-sm"
        >
          Catalogue &amp; curation (Editor) →
        </Link>
      </div>

      <ExtractorReview id="effect" file={review.file} entities={entities} buckets={buckets} />
    </div>
  );
}
