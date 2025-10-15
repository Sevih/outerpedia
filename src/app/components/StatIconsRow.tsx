'use client'

import Image from "next/image";
import stats from "@/data/stats.json";
import { useI18n } from '@/lib/contexts/I18nContext'


interface Props {
  statsList: string[];
  size?: number;
}

export default function StatIconsRow({ statsList, size = 28 }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <p className="text-yellow-300 font-semibold text-sm">{t("items.mainstats")}</p>
      <div className="flex justify-center flex-wrap gap-2">
        {statsList.map((stat, i) => {
          const data = stats[stat as keyof typeof stats];
          if (!data) return null;
          // Nettoyage de la clé (on enlève %, +, espace, etc.)
          const cleanStat = stat.replace(/[%+\s]/g, '_PERCENT').toUpperCase();
          const statKey = `SYS_STAT_${cleanStat}`;

          return (
            <div
              key={i}
              className="relative group"
              title={`${t(statKey)}`}
            >
              <Image
                src={`/images/ui/effect/${data.icon}`}
                alt={data.label}
                width={size}
                height={size}
                style={{ width: size, height: size }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
