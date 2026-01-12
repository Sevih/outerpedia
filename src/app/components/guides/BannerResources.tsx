import ItemInlineDisplay from '@/app/components/ItemInline';
import { useI18n } from '@/lib/contexts/I18nContext';

type ResourceEntry = {
  items: string | string[];
  cost: number;
  mileageItem: string | null;
  note?: string;
};

type Props = {
  resources: ResourceEntry[];
  title?: string;
  warning?: string;
};

export default function BannerResources({ resources, title, warning }: Props) {
  const { t } = useI18n();
  const displayTitle = title || t('banner.resources.title');
  return (
    <div className="space-y-2 max-w-2xl mx-auto">
      <p className="text-sm font-semibold text-gray-200">{displayTitle}:</p>
      <div className="space-y-2">
        {resources.map((resource, idx) => (
          <div
            key={idx}
            className="bg-neutral-800/30 rounded-lg border border-neutral-700/50 p-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                {Array.isArray(resource.items) ? (
                  <>
                    <ItemInlineDisplay names={resource.items[0]} />
                    {resource.items.length > 1 && (
                      <>
                        <span className="text-gray-400">and</span>
                        <ItemInlineDisplay names={resource.items[1]} />
                      </>
                    )}
                  </>
                ) : (
                  <ItemInlineDisplay names={resource.items} />
                )}
              </div>
              <div className="flex flex-col sm:items-end gap-1">
                <div className="text-sm text-gray-200">
                  <span className="font-semibold text-yellow-400">{resource.cost}</span> {t('banner.resources.perRecruit')}
                </div>
                {resource.mileageItem ? (
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    {t('banner.resources.grants')} 1 <ItemInlineDisplay names={resource.mileageItem} size={18} />
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">{t('banner.resources.noMileage')}</div>
                )}
              </div>
            </div>
            {resource.note && (
              <p className="text-xs text-gray-400 mt-2 border-t border-neutral-700/30 pt-2">
                {resource.note}
              </p>
            )}
          </div>
        ))}
      </div>
      {warning && (
        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-2.5 mt-3">
          <p className="text-sm text-orange-200">{warning}</p>
        </div>
      )}
    </div>
  );
}
