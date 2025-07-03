'use client';

import Image from 'next/image';
import * as HoverCard from '@radix-ui/react-hover-card';
import rawItems from '@/data/items.json';

const items = rawItems as {
  name: string;
  rarity: 'normal' | 'superior' | 'epic' | 'legendary';
  description: string;
}[];

type Props = {
  names: string[] | string;
  text?: boolean
  size?: number
};

function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .toLowerCase();
}

export default function ItemInlineDisplay({ names, text = true, size = 25 }: Props) {
  const normalized = Array.isArray(names) ? names : names ? [names] : [];
  const sizePixel = `${size}px`
  const itemList = normalized
    .map((name) => items.find((item) => item.name === name))
    .filter((item): item is typeof items[number] => !!item);

  return (
    <span className="inline-flex items-center gap-1 align-middle cursor-help">

      {itemList.map((item, idx) => {
        const iconBase = toKebabCase(item.name);
        const webpIcon = `/images/items/${iconBase}.webp`;
        const pngIcon = `/images/items/${iconBase}.png`;

        return (
          <HoverCard.Root key={`${item.name}-${idx}`} openDelay={0} closeDelay={0}>
            <HoverCard.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-1 py-0.5 text-white cursor-help focus:outline-none align-middle"
              >


                <span className={`relative rounded shrink-0`} style={{ width: size, height: size }} >
                  <Image
                    src={`/images/bg/CT_Slot_${item.rarity}.webp`}
                    alt="rarity background"
                    fill
                    className="absolute inset-0 z-0 object-cover rounded"
                    sizes={`${sizePixel}`}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = `/images/bg/CT_Slot_${item.rarity}.png`;
                    }}
                  />
                  <Image
                    src={webpIcon}
                    alt={item.name}
                    fill
                    className="relative z-10 object-contain"
                    sizes={`${sizePixel}`}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = pngIcon;
                    }}
                  />
                </span>
                {text && (
                  <span className="leading-none align-middle mb-0.5 underline cursor-help">{item.name}</span>
                )}



              </button>
            </HoverCard.Trigger>

            <HoverCard.Portal>
              <HoverCard.Content
                side="top"
                align="center"
                sideOffset={8}
                className="z-50 px-3 py-2 rounded shadow-lg max-w-[265px] flex items-start gap-2 outline-none focus:outline-none bg-neutral-800"
              >
                <span className="relative w-[50px] h-[50px] rounded shrink-0">
                  <Image
                    src={`/images/bg/CT_Slot_${item.rarity}.webp`}
                    alt="rarity background"
                    fill
                    className="absolute inset-0 z-0 object-cover rounded"
                    sizes="50px"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = `/images/bg/CT_Slot_${item.rarity}.png`;
                    }}
                  />
                  <Image
                    src={webpIcon}
                    alt={item.name}
                    fill
                    className="relative z-10 object-contain"
                    sizes="50px"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = pngIcon;
                    }}
                  />
                </span>

                <span className="flex flex-col text-white">
                  <span className="font-bold text-sm leading-tight drop-shadow-sm">{item.name}</span>
                  <span className="text-xs leading-snug whitespace-pre-line drop-shadow-sm">{item.description}</span>
                </span>
                <HoverCard.Arrow className="w-3 h-2 fill-current text-black" />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
        );
      })}
    </span>
  );
}
