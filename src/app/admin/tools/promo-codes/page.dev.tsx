import { PromoCodesEditor } from '@/components/admin/PromoCodesEditor';
import { loadCoupons } from '@/lib/admin/promo-banner-store';
import { catalogOptions } from '@/lib/data/item-catalog';

export const dynamic = 'force-dynamic';

export default function ToolPromoCodes() {
  // Items + monnaies, fusionnés avec la couche curée (icône/desc/nom).
  const rewardOptions = catalogOptions();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Tools · Code promo</h1>
        <p className="text-content-muted text-sm">
          Source V3 (rewards par id d&apos;item). « Regen depuis V2 » réimporte et mappe les noms V2
          vers les ids d&apos;item.
        </p>
      </div>
      <PromoCodesEditor initial={loadCoupons()} items={rewardOptions} />
    </div>
  );
}
