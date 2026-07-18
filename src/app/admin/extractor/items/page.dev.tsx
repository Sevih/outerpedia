import { ExtractorReview } from '@/components/admin/ExtractorReview';
import { itemReviewProps } from '@/lib/admin/item-review';

export const dynamic = 'force-dynamic';

/**
 * Extracteur d'items = catalogue unifié (items + goods + costumes) issu des
 * fichiers du jeu, confronté au committé. Diff « data du jeu ↔ data du site »
 * (nouveau / vrai écart / typo). L'édition curée passe par l'Éditeur d'items.
 */
export default function Page() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Extractor · Item</h1>
        <p className="text-content-muted text-sm">
          Catalogue d’items (hors équipement) — diff « data du jeu ↔ data du site » : nouveau / vrai
          écart / typo.
        </p>
      </div>
      <ExtractorReview {...itemReviewProps()} integrateKind="item" />
    </div>
  );
}
