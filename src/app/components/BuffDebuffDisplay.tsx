'use client';

import Image from 'next/image';
import * as HoverCard from '@radix-ui/react-hover-card'; // ✅ On utilise HoverCard directement
import buffs from '@/data/buffs.json';
import debuffs from '@/data/debuffs.json';
import { useTenant } from '@/lib/contexts/TenantContext';
import { l } from '@/lib/localize';
import type { WithLocalizedFields } from '@/types/common';

type BaseEffect = {
  name: string;
  label: string;
  description: string;
  icon: string;
  type: 'buff' | 'debuff';
  group?: string; // Group name if this effect is a variant
};

type Effect = WithLocalizedFields<WithLocalizedFields<BaseEffect, 'label'>, 'description'>;

const effectsData: Effect[] = [
  ...buffs.map((e) => ({ ...e, type: 'buff' as const })),
  ...debuffs.map((e) => ({ ...e, type: 'debuff' as const }))
];

export type BuffDebuffDisplayProps = {
  buffs?: string[] | string;
  debuffs?: string[] | string;
  hideVariants?: boolean; // Hide variant effects and show only main groups (default: true)
};

export default function BuffDebuffDisplay({ buffs = [], debuffs = [], hideVariants = true }: BuffDebuffDisplayProps) {
  const { key: lang } = useTenant();

  const normalizedBuffs = Array.isArray(buffs) ? buffs : buffs ? [buffs] : [];
  const normalizedDebuffs = Array.isArray(debuffs) ? debuffs : debuffs ? [debuffs] : [];

  const getEffects = (names: string[], type: 'buff' | 'debuff') => {
    const effects = names
      .map((name) => effectsData.find((e: Effect) => e.name === name && e.type === type))
      .filter((e): e is Effect => !!e);

    if (!hideVariants) {
      return effects;
    }

    // Helper: check if descriptions differ by more than just "(Irremovable)" or "cannot be removed"
    const hasSubstantiveDifference = (desc1: string, desc2: string): boolean => {
      const normalize = (desc: string) => desc
        .replace(/\(Irremovable\)/gi, '')
        .replace(/;\s*cannot be removed/gi, '')
        .replace(/Cannot be removed/gi, '')
        .trim();

      const normalized1 = normalize(desc1);
      const normalized2 = normalize(desc2);
      return normalized1 !== normalized2;
    };

    // Filter out variants and keep only main groups
    // BUT: show variants if they have a substantive description difference
    const effectsToDisplay = new Set<string>();
    const variantsToShow: Effect[] = [];
    const explicitlyCalledNames = new Set(names);

    for (const effect of effects) {
      if (effect.group) {
        // This effect has a group (it's a variant)
        const isParentExplicitlyCalled = explicitlyCalledNames.has(effect.group);

        // Find the main group effect
        const mainGroupEffect = effectsData.find((e: Effect) =>
          e.name === effect.group && e.type === type && !e.group
        );

        if (mainGroupEffect) {
          const hasRealDifference = hasSubstantiveDifference(effect.description, mainGroupEffect.description);

          if (hasRealDifference) {
            // Substantial difference: show both parent and variant
            if (isParentExplicitlyCalled) {
              effectsToDisplay.add(effect.group);
            }
            variantsToShow.push(effect);
          } else {
            // Only "(Irremovable)" or "cannot be removed" difference
            if (isParentExplicitlyCalled) {
              // Parent explicitly called: show only parent
              effectsToDisplay.add(effect.group);
            } else {
              // Parent not called: show only variant
              variantsToShow.push(effect);
            }
          }
        } else {
          // No parent found in effectsData, but parent was explicitly called
          if (isParentExplicitlyCalled) {
            effectsToDisplay.add(effect.group);
          }
        }
      } else {
        // Regular effect without group, add it directly
        effectsToDisplay.add(effect.name);
      }
    }

    // Get the main group effects
    const mainEffects = Array.from(effectsToDisplay)
      .map(name => effectsData.find((e: Effect) => e.name === name && e.type === type))
      .filter((e): e is Effect => !!e);

    // Combine main effects and variants with different descriptions
    return [...mainEffects, ...variantsToShow];
  };

  const buffList = getEffects(normalizedBuffs, 'buff');
  const debuffList = getEffects(normalizedDebuffs, 'debuff');

  const renderEffect = (effect: Effect, idx: number) => {
    const label = l(effect, 'label', lang);
    const rawDescription = l(effect, 'description', lang);

    // Replace \n and \\n with <br /> tags
    const description = rawDescription.replace(/\\n/g, '<br />').replace(/\n/g, '<br />');

    const iconPath = `/images/ui/effect/${effect.icon}.webp`;
    const baseColor = effect.type === 'buff' ? 'bg-[#1a69a7]' : 'bg-[#a72a27]';
    const showEffectColor = !rawDescription.toLowerCase().includes('cannot be removed');
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
                alt={label}
                width={16}
                height={16}
                style={{ width: 16, height: 16 }}
                className={`object-contain ${imageClass}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span>{label}</span>
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
              <span className="font-bold text-white text-sm leading-tight">{label}</span>
              <span
                className="text-white text-xs leading-snug"
                dangerouslySetInnerHTML={{ __html: description }}
              />
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
