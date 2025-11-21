'use client';

import Image from 'next/image';
import * as HoverCard from '@radix-ui/react-hover-card';
import rawItems from '@/data/items.json';
import { useI18n } from '@/lib/contexts/I18nContext';
import { l, lRec } from '@/lib/localize';
import { getAvailableLanguages, type TenantKey } from '@/tenants/config';
import type { Item } from '@/types/item';

type Lng = TenantKey;

type LangMap = Record<Lng, string>;

const items = rawItems as Item[];

type Props = {
  names: string[] | string;   // ⚠️ correspond aux "name" (EN canon)
  text?: boolean;
  size?: number;
};

function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .toLowerCase();
}

function isLangMap(v: unknown): v is LangMap {
  if (!v || typeof v !== 'object') return false;
  const m = v as Record<string, unknown>;
  const availableLanguages = getAvailableLanguages();
  return availableLanguages.every(k => typeof m[k] === 'string');
}

export default function ItemInlineDisplay({ names, text = true, size = 25 }: Props) {
  const { lang } = useI18n(); // TenantKey
  const normalized = Array.isArray(names) ? names : names ? [names] : [];
  const sizePixel = `${size}px`;

  // Recherche par "name" canon EN
  const itemList = normalized
    .map((name) => items.find((item) => item.name === name))
    .filter((item): item is Item => !!item);

  return (
    <span className="inline-flex items-center gap-1 align-middle cursor-help">
      {itemList.map((item, idx) => {
        const iconBase = item.icon
          ? `/images/item/${item.icon}.webp`
          : `/images/items/${toKebabCase(item.name)}.webp`;
        const iconFallback = iconBase.replace(/\.webp$/, '.png');


        // Nom localisé via l() : gère name/name_jp/name_kr
        const label = l(item, 'name', lang as Lng);

        // Description : accepte soit champs plats *_jp/_kr, soit map {en,jp,kr}
        const description = isLangMap(item.description)
          ? lRec(item.description, lang as Lng, { allowEmpty: true })
          : l(item, 'description', lang as Lng, { allowEmpty: true });

        return (
          <HoverCard.Root key={`${item.name}-${idx}`} openDelay={0} closeDelay={0}>
            <HoverCard.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-1 py-0.5 text-white cursor-help focus:outline-none align-middle"
              >
                <span className="relative rounded shrink-0" style={{ width: size, height: size }}>
                  <Image
                    src={`/images/bg/CT_Slot_${item.rarity}.webp`}
                    alt="rarity background"
                    fill
                    className="absolute inset-0 z-0 object-cover rounded"
                    sizes={sizePixel}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = `/images/bg/CT_Slot_${item.rarity}.png`;
                    }}
                  />
                  <Image
                    src={iconBase}
                    alt={label}
                    fill
                    className="relative z-10 object-contain"
                    sizes={sizePixel}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = iconFallback;
                    }}
                  />
                </span>

                {text && (
                  <span className="leading-none align-middle mb-0.5 underline cursor-help">
                    {label}
                  </span>
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
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = `/images/bg/CT_Slot_${item.rarity}.png`;
                    }}
                  />
                  <Image
                    src={iconBase}
                    alt={label}
                    fill
                    className="relative z-10 object-contain"
                    sizes="50px"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = iconFallback;
                    }}
                  />
                </span>

                <span className="flex flex-col text-white">
                  <span className="font-bold text-sm leading-tight drop-shadow-sm">{label}</span>
                  <span className="text-xs leading-snug whitespace-pre-line drop-shadow-sm">
                    {description.replace(/\\n/g, '\n')}
                  </span>
                </span>
                <HoverCard.Arrow className="w-3 h-2 fill-neutral-800" />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
        );
      })}
    </span>
  );
}
