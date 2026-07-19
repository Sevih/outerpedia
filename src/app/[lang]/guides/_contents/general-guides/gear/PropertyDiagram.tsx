'use client';

/**
 * Diagramme INTERACTIF des propriétés d'une pièce (onglet Bases) — port de
 * l'`EquipmentIntro` V2 : survoler une ligne de propriété met en surbrillance la
 * zone correspondante de la tuile (étoiles, palier, +N, classe, effet…). La
 * tuile réutilise `EquipmentIcon` (cadre/étoiles/classe/effet/tier/+N déjà gérés).
 */
import { useState } from 'react';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';

export interface PropertyRow {
  key: string;
  label: string;
}

/** Boîtes de surbrillance calées sur la disposition interne d'EquipmentIcon. */
const BOX: Record<string, string> = {
  stars: 'inset-x-[14%] bottom-[2%] h-[22%]',
  reforge: 'left-[14%] bottom-[2%] w-[36%] h-[22%]',
  rarity: 'inset-[2%]',
  upgrade: 'right-[2%] bottom-[16%] w-[38%] h-[24%]',
  tier: 'left-[2%] bottom-[16%] w-[32%] h-[24%]',
  set: 'right-[2%] top-[2%] w-[30%] h-[30%]',
  class: 'right-[2%] top-[28%] w-[28%] h-[28%]',
};

export function PropertyDiagram({
  rows,
  icon,
  classType,
  effectIcon,
}: {
  rows: PropertyRow[];
  icon: string;
  classType?: string;
  effectIcon?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <ul className="flex min-w-0 flex-col gap-0.5">
        {rows.map((r) => (
          <li
            key={r.key}
            onMouseEnter={() => setHover(r.key)}
            onMouseLeave={() => setHover(null)}
            className={`flex cursor-pointer items-start gap-2 rounded px-1.5 py-1 text-sm leading-snug transition-colors ${
              hover === r.key ? 'bg-ed-sky/10 text-content-strong' : 'text-content'
            }`}
          >
            <span className="bg-ed-sky mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
            {r.label}
          </li>
        ))}
      </ul>
      <div className="relative shrink-0">
        <EquipmentIcon
          icon={icon}
          grade="unique"
          stars={6}
          tier={1}
          enhanceLevel={4}
          classType={classType}
          overlayIcon={effectIcon}
          size={112}
        />
        {hover && BOX[hover] && (
          <span
            className={`border-ed-sky bg-ed-sky/25 pointer-events-none absolute animate-pulse rounded border-2 ${BOX[hover]}`}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
