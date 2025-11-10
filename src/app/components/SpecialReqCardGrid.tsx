'use client';

import { useState, useMemo } from 'react';
import { AnimatedTabs } from '@/app/components/AnimatedTabs';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { l } from '@/lib/localize';
import setsData from '@/data/sets.json';
import amuletData from '@/data/amulet.json';
import weaponData from '@/data/weapon.json';

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

const TABS: { key: 'identification' | 'ecology'; label: string }[] = [
  { key: 'identification', label: 'Identification' },
  { key: 'ecology', label: 'Ecology Study' },
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

// Récompenses par boss (chemin de base: /images/ui/effect/)
const BOSS_REWARDS: Record<string, string[]> = {
  // Identification missions (10 récompenses chacune) - ordre inversé pour dir="rtl"
  'beatles': [
    'UO_Accessary_09', // Saint's Ring
    'UO_Accessary_14', // Memento Mori
    'UO_Accessary_13',    // Clear Mind
    'UO_Accessary_12', // Charmer's Necklace
    'UO_Accessary_11', // Dancer's Bracelet
    'UO_Weapon_15',    // Iron Messiah
    'UO_Weapon_14',    // Thumping Knuckle Dusters
    'UO_Weapon_13',    // Meteor Mashers
    'UO_Weapon_12',    // Token of the Supreme Witch
    'UO_Weapon_26', // Violent Sledgehammer
  ],
  'glicys': [
    'UO_Accessary_10', // Resurrection Token
    'UO_Accessary_15', // Search and Destroy
    'UO_Accessary_05', // Combination Simulator
    'UO_Accessary_07', // Blue-Gems White Ring
    'UO_Accessary_06', // Clock Up
    'UO_Weapon_10',    // Emblem of Dominance
    'UO_Weapon_09',    // Noblewoman's Guile
    'UO_Weapon_08',    // Rampaging Caracal
    'UO_Weapon_07',    // Force Field Generator
    'UO_Weapon_06',    // Twin B
  ],
  'meteos': [
    'UO_Accessary_08', // Overdrive
    'UO_Accessary_04', // Spirit of Unification
    'UO_Accessary_03', // Burning Soul
    'UO_Accessary_02', // Coward's Treasure
    'UO_Accessary_01', // Death's Hold
    'UO_Weapon_05',    // Royal Stinger
    'UO_Weapon_04',    // Fire Fists
    'UO_Weapon_03',    // Heartunder's Blade
    'UO_Weapon_02',    // Talisman of Animosities
    'UO_Weapon_11',    // Surefire Javelin
  ],
  'ars-nova': [
    'UO_Accessary_20', // Physical Exorcism
    'UO_Accessary_19', // Queen of Prism
    'UO_Accessary_18', // Starlight Road
    'UO_Accessary_17', // Fool's Dawn
    'UO_Accessary_16', // Glorious Radiance Orb
    'UO_Weapon_20',    // Barrage of Truth
    'UO_Weapon_19',    // Last Hope
    'UO_Weapon_18',    // Legacy of the Dream
    'UO_Weapon_17',    // God Hand Crush
    'UO_Weapon_16',    // Snow-white Embrace
  ],
  'amadeus': [
    'UO_Accessary_25', // Absolute Music
    'UO_Accessary_24', // Dies Irae
    'UO_Accessary_23', // Obsidian Oath
    'UO_Accessary_22', // Unholy Exsultet
    'UO_Accessary_21', // A Prima Vista
    'UO_Weapon_25',    // Fierce Soloist
    'UO_Weapon_24',    // Sublime Melody
    'UO_Weapon_23',    // Immortal Pride
    'UO_Weapon_22',    // Exquisite Death
    'UO_Weapon_21',    // Phantasm Necrosis
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
  const { lang } = useI18n();
  const [selected, setSelected] = useState<'identification' | 'ecology'>('identification');

  // Fonction helper pour obtenir le nom localisé d'une récompense
  const getRewardName = (iconName: string): string => {
    // Chercher dans sets
    const set = setsData.find(s => s.set_icon === iconName);
    if (set) return l(set, 'name', lang);

    // Chercher dans amulet
    const amulet = amuletData.find(a => a.effect_icon === iconName);
    if (amulet) return l(amulet, 'name', lang);

    // Chercher dans weapon
    const weapon = weaponData.find(w => w.effect_icon === iconName);
    if (weapon) return l(weapon, 'name', lang);

    return iconName;
  };

  const filteredItems = useMemo(() => {
    let list = items;

    if (selected === 'identification') {
      list = list.filter((item) =>
        item.description.toLowerCase().includes('identification')
      );
    } else {
      list = list.filter((item) =>
        item.description.toLowerCase().includes('ecology study')
      );
    }

    // Trier selon l'ordre dans ICON_MAPPING
    const mappingOrder = Object.keys(ICON_MAPPING);
    return list.sort((a, b) => {
      const indexA = mappingOrder.indexOf(a.slug);
      const indexB = mappingOrder.indexOf(b.slug);
      return indexA - indexB;
    });
  }, [items, selected]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center mb-4">
        <AnimatedTabs<'identification' | 'ecology'>
          tabs={TABS}
          selected={selected}
          onSelect={setSelected}
          pillColor="#0ea5e9"
        />
      </div>
      <div
        data-special-req-grid
        className="flex flex-col gap-4 max-w-[545px] mx-auto w-full"
      >
        {filteredItems.map(({ slug, title, category }) => {
          const rewardIconUrl = `/images/characters/boss/portrait-H/CLG_Raid_${ICON_MAPPING[slug]}.webp`;
          const rewards = BOSS_REWARDS[slug] || [];

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

              {/* Rewards - right side - 2 rows (5 cols for Identification 10 items, 2 cols for Ecology 4 items) */}
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 grid gap-1 ${
                rewards.length === 10 ? 'grid-cols-5' : 'grid-cols-2'
              }`} dir="rtl">
                {rewards.map((rewardIcon, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-[35px] lg:h-[35px] rounded flex items-center justify-center overflow-hidden ${
                      rewardIcon ? '' : 'bg-neutral-700/80 border border-neutral-600'
                    }`}
                  >
                    {rewardIcon ? (
                      <Image
                        src={`/images/ui/effect/TI_Icon_${rewardIcon}.webp`}
                        alt={getRewardName(`TI_Icon_${rewardIcon}`)}
                        aria-label={getRewardName(`TI_Icon_${rewardIcon}`)}
                        title={getRewardName(`TI_Icon_${rewardIcon}`)}
                        width={35}
                        height={35}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-neutral-400 text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] font-bold">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
