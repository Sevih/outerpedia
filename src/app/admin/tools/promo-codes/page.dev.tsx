import { PromoCodesEditor } from '@/components/admin/PromoCodesEditor';
import { loadCouponsForEdit } from '@/lib/admin/promo-banner-store';
import { catalogOptions } from '@/lib/data/item-catalog';

export const dynamic = 'force-dynamic';

export default async function ToolPromoCodes() {
  // Items + monnaies, fusionnés avec la couche curée (icône/desc/nom).
  const rewardOptions = catalogOptions();
  // Liste VIVANTE (R2), qui inclut les codes ajoutés par le staff via Discord.
  const { list, etag, error } = await loadCouponsForEdit();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Tools · Code promo</h1>
        <p className="text-content-muted text-sm">Rewards désignés par id d&apos;item.</p>
      </div>
      <PromoCodesEditor initial={list} etag={etag} loadError={error} items={rewardOptions} />
    </div>
  );
}
