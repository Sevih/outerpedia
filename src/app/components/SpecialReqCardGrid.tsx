'use client';

import { useState, useMemo } from 'react';
import { AnimatedTabs } from '@/app/components/AnimatedTabs';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { l } from '@/lib/localize';
import setsData from '@/data/sets.json';
import statsData from '@/data/stats.json';

type GuideItem = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  last_updated: string;
  author: string;
  weight?: number;
};

type Props = {
  items: GuideItem[];
};

const getTabs = (t: (key: string) => string): { key: 'all' | 'identification' | 'ecology'; label: string; icon?: string }[] => [
  { key: 'all', label: t('filters.common.all'), icon:'/images/ui/nav/CM_Tab_Icon_Shop_Star.png' },
  { key: 'identification', label: t('SYS_PVE_RAID_B'), icon: '/images/ui/nav/accessory.webp' },
  { key: 'ecology', label: t('SYS_PVE_RAID_A'), icon: '/images/ui/nav/armor.webp' },
];

// Mapping des icônes pour les Special Requests
const ICON_MAPPING: Record<string, string> = {
  // Identification missions -> Weapon icons
  'beatles': 'Weapon_Earth',
  'glicys': 'Weapon_Water',
  'meteos': 'Weapon_Fire',
  'ars-nova': 'Weapon_Light',
  'amadeus': 'Weapon_Dark',

  // Ecology Study missions -> Armor icons
  'guardian': 'Armor_Fire',
  'tyrant': 'Armor_Water',
  'chimera': 'Armor_Earth',
  'sacreed': 'Armor_Light',
  'grand-calamari': 'Armor_Dark',
};

// Slugs par catégorie (basé sur ICON_MAPPING)
const IDENTIFICATION_SLUGS = ['beatles', 'glicys', 'meteos', 'ars-nova', 'amadeus'];
const ECOLOGY_SLUGS = ['guardian', 'tyrant', 'chimera', 'sacreed', 'grand-calamari'];

// Récompenses par boss
const BOSS_REWARDS: Record<string, string[]> = {
  // Identification missions (5 accessoires chacune) - ordre inversé pour dir="rtl"
  'beatles': [
    'ACC', 'EVA', 'HH', 'ATK%'
  ],
  'glicys': [
    'DEF%', 'SPD', 'CHC', 'RES'
  ],
  'meteos': [
    'EFF', 'CHD', 'PEN%', 'HP%'
  ],
  'ars-nova': [
    'HP%', 'EVA', 'EFF', 'CHD', 'PEN', 'HH'
  ],
  'amadeus': [
    'DEF%', 'ACC', 'RES', 'CHC', 'SPD', 'ATK%'
  ],

  // Ecology Study missions (4 récompenses chacune) - ordre inversé pour dir="rtl"
  'guardian': [
    'Set_Enchant_05', // Effectiveness Set
    'Set_Enchant_09', // Evasion Set
    'Set_Enchant_13', // Critical Hit Set
    'Set_Enchant_01', // Attack Set
  ],
  'tyrant': [
    'Set_Enchant_10', // Lifesteal Set
    'Set_Enchant_06', // Resilience Set
    'Set_Enchant_02', // Defense Set
    'Set_Enchant_03', // Life Set
  ],
  'chimera': [
    'Set_Enchant_04', // Critical Strike Set
    'Set_Enchant_15', // Speed Set
    'Set_Enchant_08', // Accuracy Set
    'Set_Enchant_07', // Counterattack Set
  ],
  'sacreed': [
    'Set_Enchant_18', // Pulverization Set
    'Set_Enchant_17', // Patience Set
    'Set_Enchant_16', // Revenge Set
    'Set_Enchant_11', // Penetration Set
  ],
  'grand-calamari': [
    'Set_Enchant_22', // Augmentation Set
    'Set_Enchant_21', // Weakness Set
    'Set_Enchant_20', // Swiftness Set
    'Set_Enchant_19', // Immunity Set
  ],
};

export default function SpecialReqCardGrid({ items }: Props) {
  const { lang, t } = useI18n();
  const [selected, setSelected] = useState<'all' | 'identification' | 'ecology'>('all');

  // Fonction helper pour obtenir la clé i18n d'une stat
  const getStatI18nKey = (stat: string): string => {
    const normalizedStat = stat.replace('%', '_PERCENT').toUpperCase();
    return `SYS_STAT_${normalizedStat}`;
  };

  // Fonction helper pour obtenir le nom localisé d'une récompense
  const getRewardName = (iconName: string): string => {
    // Chercher dans sets (pour Ecology Study)
    const set = setsData.find(s => s.set_icon === iconName);
    if (set) return l(set, 'name', lang);

    return iconName;
  };

  // Séparer les items par catégorie
  const { identificationItems, ecologyItems } = useMemo(() => {
    const sortItems = (itemsList: GuideItem[], slugOrder: string[]) =>
      itemsList.sort((a, b) => {
        const indexA = slugOrder.indexOf(a.slug);
        const indexB = slugOrder.indexOf(b.slug);
        return indexA - indexB;
      });

    const identification = sortItems(
      items.filter((item) => IDENTIFICATION_SLUGS.includes(item.slug)),
      IDENTIFICATION_SLUGS
    );

    const ecology = sortItems(
      items.filter((item) => ECOLOGY_SLUGS.includes(item.slug)),
      ECOLOGY_SLUGS
    );

    return { identificationItems: identification, ecologyItems: ecology };
  }, [items]);

  const renderItemCard = (slug: string, title: string, category: string) => {
    const rewardIconUrl = `/images/characters/boss/portrait-H/CLG_Raid_${ICON_MAPPING[slug]}.webp`;
    const rewards = BOSS_REWARDS[slug] || [];
    const isIdentification = ['beatles', 'glicys', 'meteos', 'ars-nova', 'amadeus'].includes(slug);

    return (
      <Link
        key={slug}
        href={`/guides/${category}/${slug}`}
        className="group block relative rounded-lg overflow-hidden border-2 border-transparent hover:border-cyan-400 transition-all shadow-lg hover:shadow-cyan-400/60 hover:shadow-xl"
        style={{
          backgroundImage: `url(${rewardIconUrl})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          aspectRatio: '540 / 100',
          transition: 'background-size 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundSize = '105%';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundSize = 'contain';
        }}
      >
        {/* Titre overlay */}
        <div className="absolute -bottom-2 left-0 right-0 p-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-black/60 px-1 py-0 rounded inline-block transition-all duration-300 group-hover:scale-105">{title}</h2>
        </div>

        {/* Rewards - right side */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 grid gap-1 ${
          isIdentification
            ? rewards.length > 5 ? 'grid-cols-3' : `grid-cols-${rewards.length}`
            : 'grid-cols-2'
        }`} dir="rtl">
          {rewards.map((reward, i) => {
            // Pour Identification, afficher les icônes des stats
            if (isIdentification) {
              const statData = statsData[reward as keyof typeof statsData];
              const statLabel = t(getStatI18nKey(reward));

              return (
                <div
                  key={i}
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-full bg-black flex items-center justify-center overflow-hidden"
                >
                  {statData ? (
                    <Image
                      src={`/images/ui/effect/${statData.icon}`}
                      alt={statLabel}
                      aria-label={statLabel}
                      title={statLabel}
                      width={36}
                      height={36}
                      className="object-contain w-full h-full p-0.5"
                    />
                  ) : (
                    <span className="text-white text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-semibold">
                      {reward}
                    </span>
                  )}
                </div>
              );
            }

            // Pour Ecology, garder l'affichage des icônes
            return (
              <div
                key={i}
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-[35px] lg:h-[35px] rounded flex items-center justify-center overflow-hidden ${
                  reward ? '' : 'bg-neutral-700/80 border border-neutral-600'
                }`}
              >
                {reward ? (
                  <Image
                    src={`/images/ui/effect/TI_Icon_${reward}.webp`}
                    alt={getRewardName(`TI_Icon_${reward}`)}
                    aria-label={getRewardName(`TI_Icon_${reward}`)}
                    title={getRewardName(`TI_Icon_${reward}`)}
                    width={35}
                    height={35}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-neutral-400 text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] font-bold">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </Link>
    );
  };

  const filteredItems = useMemo(() => {
    if (selected === 'identification') {
      return identificationItems;
    } else {
      return ecologyItems;
    }
  }, [identificationItems, ecologyItems, selected]);

  const tabs = getTabs(t);

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex justify-center mb-4">
        <AnimatedTabs<'all' | 'identification' | 'ecology'>
          tabs={tabs}
          selected={selected}
          onSelect={setSelected}
          pillColor="#0ea5e9"
        />
      </div>

      {/* Vue avec onglet "All" - deux colonnes côte à côte */}
      {selected === 'all' && (
        <div className="flex gap-6 justify-center flex-col xl:flex-row">
          {/* Section Identification */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white text-center mb-2">{t('SYS_PVE_RAID_B')}</h3>
            <div data-special-req-grid className="flex flex-col gap-4 max-w-[545px] mx-auto w-full xl:w-[545px]">
              {identificationItems.map(({ slug, title, category }) => renderItemCard(slug, title, category))}
            </div>
          </div>

          {/* Section Ecology Study */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white text-center mb-2">{t('SYS_PVE_RAID_A')}</h3>
            <div data-special-req-grid className="flex flex-col gap-4 max-w-[545px] mx-auto w-full xl:w-[545px]">
              {ecologyItems.map(({ slug, title, category }) => renderItemCard(slug, title, category))}
            </div>
          </div>
        </div>
      )}

      {/* Vue avec onglet spécifique (Identification ou Ecology) */}
      {selected !== 'all' && (
        <div
          data-special-req-grid
          className="flex flex-col gap-4 max-w-[545px] mx-auto w-full"
        >
          {filteredItems.map(({ slug, title, category }) => renderItemCard(slug, title, category))}
        </div>
      )}
    </div>
  );
}
