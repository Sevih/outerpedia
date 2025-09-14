'use client';

import { useState } from 'react';
import Image from 'next/image';

export type BannerTab = {
  key: string;
  image: string;
  label: string;
  badgeImg?: string; // chemin de l’image badge (sans extension)
  badgePosition?: string; // ex: 'top-2 right-2'
  content: React.ReactNode;
};

type BannerTabCardsProps = {
  tabs: BannerTab[];
  defaultKey?: string;
  imagePath?: string; // ex: /images/banners/
  badgePath?: string; // ex: /images/ui/badges/
};

export default function BannerTabCards({
  tabs,
  defaultKey,
  imagePath = '/images/guides/general-guides/banner/',
  badgePath = '/images/guides/general-guides/banner/',
}: BannerTabCardsProps) {
  const [selected, setSelected] = useState(defaultKey || tabs[0].key);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Colonne des onglets (verticale) */}
      <div className="flex flex-col gap-4 w-[280px] md:max-w-[280px]">
        {tabs.map((tab) => {
          const isActive = tab.key === selected;
          const imgName = tab.image;

          return (
            <button
              key={tab.key}
              onClick={() => setSelected(tab.key)}
              className={`relative group overflow-visible transition-all duration-300 w-full rounded-[12px] ${isActive
                ? 'ring-2 ring-yellow-400 ring-offset-black shadow-[0_0_8px_rgba(255,215,0,0.6)]'
                : 'ring-2 ring-transparent hover:ring-yellow-100'
                }`}
            >
              <div className="relative w-[280px] h-[80px] rounded-[12px] overflow-hidden">
                <Image
                  src={`${imagePath}${imgName}.webp`}
                  alt={tab.label}
                  width={280}
                  height={80}
                  style={{ width: 280, height: 80 }}
                  className="object-cover"
                />
                <div className="absolute bottom-2 right-3 text-white font-bold text-sm sm:text-base drop-shadow-md text-left custom-text-shadow pointer-events-none">
                  {tab.label}
                </div>
              </div>

              {tab.badgeImg && (
                <div className={`absolute ${tab.badgePosition || 'top-2 right-2'} w-[90px] h-[45px]`}>
                  <Image
                    src={`${badgePath}${tab.badgeImg}.webp`}
                    alt="badge"
                    width={90}
                    height={45}
                    style={{ width: 90, height: 45 }}
                    className="object-contain"
                  />
                </div>
              )}
            </button>



          );
        })}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1">{tabs.find((t) => t.key === selected)?.content}</div>
    </div>
  );
}

