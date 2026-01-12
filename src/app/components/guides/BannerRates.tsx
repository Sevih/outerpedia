import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';

type RateEntry = {
  stars: 1 | 2 | 3;
  rate: number;
  label?: string;
  subtext?: string;
};

type Props = {
  rates: RateEntry[];
  specialFeature?: string;
  freePull?: boolean;
};

const star = (
  <span className="relative align-middle inline-flex w-[15px] h-[15px]">
    <Image
      src="/images/ui/CM_icon_star_y.webp"
      alt="star"
      width={15}
      height={15}
      style={{ width: 15, height: 15 }}
      className="object-contain"
    />
  </span>
);

export default function BannerRates({ rates, specialFeature, freePull }: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 max-w-xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {rates.map((entry, idx) => (
          <div
            key={idx}
            className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-300">
                  {entry.stars}
                  {star}
                </span>
                {entry.label && (
                  <span className="text-xs text-gray-400">{entry.label}</span>
                )}
              </div>
              <span className="text-lg font-bold text-yellow-400">
                {entry.rate}%
              </span>
            </div>
            {entry.subtext && (
              <p className="text-xs text-gray-400 mt-1">{entry.subtext}</p>
            )}
          </div>
        ))}
      </div>

      {(specialFeature || freePull) && (
        <div className="flex flex-col gap-2 mt-3">
          {specialFeature && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-2.5">
              <p className="text-sm text-yellow-200">
                <span className="font-semibold">{t('banner.rates.specialFeature')}</span> {specialFeature}
              </p>
            </div>
          )}
          {freePull && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-2.5">
              <p className="text-sm text-green-200">
                <span className="font-semibold">{t('banner.rates.freePull')}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
