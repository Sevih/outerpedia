'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export type TabDefinition = {
  key: string;
  label: string;
  icon?: string; // ex: "icon_banner_custom.webp"
  content: React.ReactNode;
};

type GenericTabsProps = {
  tabs: TabDefinition[];
  iconPath?: string; // par défaut : /images/ui/nav/
  defaultKey?: string;
};

export default function GenericTabs({ tabs, iconPath = '/images/ui/nav/', defaultKey }: GenericTabsProps) {
  const [selected, setSelected] = useState(defaultKey || tabs[0].key);
  const [activeTabRef, setActiveTabRef] = useState<HTMLButtonElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTabRef && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeTabRef;
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
    }
  }, [selected, activeTabRef]);

  return (
    <div className="mb-6">
      <div className="relative flex justify-center mb-4">
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex gap-1 min-w-[240px] overflow-x-auto no-scrollbar snap-x snap-mandatory">
          <div
            ref={indicatorRef}
            className="absolute top-1 left-0 h-[calc(100%-0.5rem)] bg-sky-500 rounded-full transition-all duration-300 z-0"
          ></div>

          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelected(tab.key)}
              ref={(el) => {
                if (selected === tab.key) setActiveTabRef(el);
              }}
              className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300 snap-start shrink-0 ${
                selected === tab.key
                  ? 'text-white'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon && (
                <div className="relative w-[40px] h-[40px]">
                  <Image
                    src={`${iconPath}${tab.icon}.webp`}
                    alt={tab.label}
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </div>
              )}
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plus de fond ici */}
      <div>{tabs.find((t) => t.key === selected)?.content}</div>
    </div>
  );
}
