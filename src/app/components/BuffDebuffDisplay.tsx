'use client';

import Image from 'next/image';
import * as HoverCard from '@radix-ui/react-hover-card'; // ✅ On utilise HoverCard directement
import buffs from '@/data/buffs.json';
import debuffs from '@/data/debuffs.json';

const effectsData: Effect[] = [
  ...buffs.map((e) => ({ ...e, type: 'buff' as const })),
  ...debuffs.map((e) => ({ ...e, type: 'debuff' as const }))
];

export type BuffDebuffDisplayProps = {
  buffs?: string[] | string;
  debuffs?: string[] | string;
};

type Effect = {
  name: string;
  type: 'buff' | 'debuff';
  label: string;
  icon: string;
  description: string;
};

export default function BuffDebuffDisplay({ buffs = [], debuffs = [] }: BuffDebuffDisplayProps) {
  const normalizedBuffs = Array.isArray(buffs) ? buffs : buffs ? [buffs] : [];
  const normalizedDebuffs = Array.isArray(debuffs) ? debuffs : debuffs ? [debuffs] : [];

  const getEffects = (names: string[], type: 'buff' | 'debuff') =>
    names
      .map((name) => effectsData.find((e: Effect) => e.name === name && e.type === type))
      .filter((e): e is Effect => !!e);

  const buffList = getEffects(normalizedBuffs, 'buff');
  const debuffList = getEffects(normalizedDebuffs, 'debuff');

  const renderEffect = (effect: Effect, idx: number) => {
    const iconPath = `/images/ui/effect/${effect.icon}.webp`;
    const baseColor = effect.type === 'buff' ? 'bg-[#1a69a7]' : 'bg-[#a72a27]';
    const showEffectColor = !effect.description.toLowerCase().includes('cannot be removed');
    const imageClass = showEffectColor ? effect.type : '';

    return (
      <HoverCard.Root key={`${effect.type}-${effect.name}-${idx}`} openDelay={0} closeDelay={0}>
        <HoverCard.Trigger asChild>
          <button
            type="button"
            className={`flex items-center gap-1 ${baseColor} px-1 py-0.5 rounded text-xs cursor-pointer text-white focus:outline-none`}
          >
            <div className="bg-black p-0.5 rounded shrink-0">
              <Image
                src={iconPath}
                alt={effect.name}
                width={16}
                height={16}
                style={{ width: 16, height: 16 }}
                className={`object-contain ${imageClass}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span>{effect.label}</span>
          </button>
        </HoverCard.Trigger>

        <HoverCard.Portal>
          <HoverCard.Content
            side="top"
            align="center"
            sideOffset={8}
            className={`z-50 px-3 py-2 rounded shadow-lg max-w-[265px] flex items-start gap-2 ${baseColor} outline-none focus:outline-none`}
          >
            <div className="bg-black p-1 rounded shrink-0">
              <Image
                src={iconPath}
                alt={effect.name}
                width={28}
                height={28}
                style={{ width: 28, height: 28 }}
                className={`object-contain ${imageClass}`}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm leading-tight">{effect.label}</span>
              <span className="text-white text-xs leading-snug whitespace-pre-line">{effect.description}</span>
            </div>
            <HoverCard.Arrow
              className={`w-3 h-2 ${effect.type === 'buff' ? 'fill-[#2196f3]' : 'fill-[#e53935]'}`}
            />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    );
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {buffList.map(renderEffect)}
      {debuffList.map(renderEffect)}
    </div>
  );
}
