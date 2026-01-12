import ItemInlineDisplay from '@/app/components/ItemInline';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';

type RewardEntry = {
  stars: 1 | 2 | 3;
  wildcard: number;
  heroPiece: number;
  note?: string;
};

type Props = {
  rewards: RewardEntry[];
  title?: string;
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

export default function BannerRewards({ rewards, title }: Props) {
  const { t } = useI18n();
  const displayTitle = title || t('banner.rewards.title');

  return (
    <div className="space-y-2 max-w-xl mx-auto">
      <p className="text-sm font-semibold text-gray-200">{displayTitle}:</p>
      <div className="bg-neutral-800/30 rounded-lg border border-neutral-700/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800/70">
            <tr className="border-b border-neutral-700/50">
              <th className="px-3 py-2 text-left text-gray-300 font-semibold">{t('banner.rewards.rarity')}</th>
              <th className="px-3 py-2 text-left text-gray-300 font-semibold">
                <ItemInlineDisplay names="Wildcard Pieces" />
              </th>
              <th className="px-3 py-2 text-left text-gray-300 font-semibold">
                <ItemInlineDisplay names="Hero Piece" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward, idx) => (
              <tr
                key={idx}
                className={idx !== rewards.length - 1 ? 'border-b border-neutral-700/30' : ''}
              >
                <td className="px-3 py-2.5 text-gray-200">
                  {reward.stars}
                  {star}
                </td>
                <td className="px-3 py-2.5 text-gray-200">{reward.wildcard}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-200">{reward.heroPiece}</span>
                    {reward.note && (
                      <span className="text-xs text-gray-400">{reward.note}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
