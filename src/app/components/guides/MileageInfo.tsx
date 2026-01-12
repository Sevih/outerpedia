import ItemInlineDisplay from '@/app/components/ItemInline';
import { useI18n } from '@/lib/contexts/I18nContext';

type Props = {
  mileageItem: string;
  cost: number;
  isPersistent?: boolean;
};

export default function MileageInfo({ mileageItem, cost, isPersistent = true }: Props) {
  const { t } = useI18n();
  return (
    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 space-y-3 max-w-xl mx-auto">
      {isPersistent && (
        <div className="flex items-start gap-2">
          <div className="text-blue-400 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-blue-200">
            <ItemInlineDisplay names={mileageItem} /> {t('banner.mileage.keptUntilUse')}
          </p>
        </div>
      )}

      <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
        <p className="text-sm text-gray-200 font-semibold mb-2">{t('banner.mileage.exchangeOptions')}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{t('banner.mileage.featuredHero')}</span>
            <div className="flex items-center gap-1 text-yellow-400 font-semibold">
              {cost} <ItemInlineDisplay names={mileageItem} size={20} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              150 <ItemInlineDisplay names="Hero Piece" size={18} />
            </span>
            <div className="flex items-center gap-1 text-yellow-400 font-semibold">
              {cost} <ItemInlineDisplay names={mileageItem} size={20} />
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-700/30">
          <p className="text-xs text-gray-400">
            {t('banner.mileage.ownedBonus')}{' '}
            <ItemInlineDisplay names="Wildcard Pieces" size={18} />
          </p>
        </div>
      </div>
    </div>
  );
}
