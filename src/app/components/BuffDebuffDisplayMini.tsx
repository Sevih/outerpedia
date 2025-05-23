'use client'

import Image from 'next/image'
import * as Tooltip from '@radix-ui/react-tooltip'
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'

const effectsData: Effect[] = [
  ...buffs.map((e) => ({ ...e, type: 'buff' as const })),
  ...debuffs.map((e) => ({ ...e, type: 'debuff' as const }))
]


type BuffDebuffDisplayProps = {
  buffs?: string[] | string;
  debuffs?: string[] | string;
};

type Effect = {
  name: string
  type: 'buff' | 'debuff'
  label: string
  icon: string
  description: string
}

export default function BuffDebuffDisplayMini({ buffs = [], debuffs = [] }: BuffDebuffDisplayProps) {
  const normalizedBuffs = Array.isArray(buffs) ? buffs : buffs ? [buffs] : [];
  const normalizedDebuffs = Array.isArray(debuffs) ? debuffs : debuffs ? [debuffs] : [];

  const getEffects = (names: string[], type: 'buff' | 'debuff') =>
    names
      .map((name) => effectsData.find((e: Effect) => e.name === name && e.type === type))
      .filter((e): e is Effect => !!e);

  const buffList = getEffects(normalizedBuffs, 'buff');
  const debuffList = getEffects(normalizedDebuffs, 'debuff');

  const renderEffect = (effect: Effect, idx: number) => {
    const iconPath = `/images/ui/effect/${effect.icon}.webp`
    const baseColor = effect.type === 'buff' ? 'bg-[#1a69a7]' : 'bg-[#a72a27]'
    const showEffectColor = !effect.description.toLowerCase().includes('cannot be removed')
    const imageClass = showEffectColor ? effect.type : ''

    return (
      <Tooltip.Provider delayDuration={1} skipDelayDuration={0} disableHoverableContent={false} key={`${effect.type}-${effect.name}-${idx}`}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="flex items-center p-0 rounded cursor-help">
              <div className="bg-black p-0.5 rounded shrink-0">
                <Image
                  src={iconPath}
                  alt={effect.name}
                  width={24}
                  height={24}
                  style={{ width: 24, height: 24 }}
                  className={`object-contain ${imageClass}`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </Tooltip.Trigger>

          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              align="center"
              className={`z-50 px-3 py-2 rounded shadow-lg max-w-[260px] flex items-start gap-2 ${baseColor}`}
            >

              <div className="relative w-[28px] h-[28px] bg-black p-1 rounded shrink-0">
                    <Image
                      src={iconPath}
                      alt={effect.name}
                      fill
                      sizes="28px"
                      className={`object-contain ${imageClass}`}
                    />
                  </div>

              <div className="flex flex-col">
                <span className="font-bold text-white text-sm leading-tight">{effect.label}</span>
                <span className="text-white text-xs leading-snug whitespace-pre-line">{effect.description}</span>
              </div>
              <Tooltip.Arrow className={effect.type === 'buff' ? 'fill-[#2196f3]' : 'fill-[#e53935]'} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    )
  }

  return (
    <div className="flex flex-wrap">
      {buffList.map((effect, idx) => renderEffect(effect, idx))}
      {debuffList.map((effect, idx) => renderEffect(effect, idx))}
    </div>
  )
}
