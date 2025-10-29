'use client'

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { toKebabCase } from "@/utils/formatText";
import type { ArmorSet } from "@/types/equipment";
import type { TenantKey } from "@/tenants/config";
import { useI18n } from "@/lib/contexts/I18nContext";
import { l } from "@/lib/localize";

// ---- Helpers ----
function formatEffectTextAndHighlightNum(text?: string | null) {
  if (!text || !text.trim()) return <></>;

  const tokens = text.split(/(<[^>]+>)/g);
  const numRe = /(\d+(?:\.\d+)?)(\s*%?)/g;

  let html = tokens
    .map(tok => {
      if (tok.startsWith('<') && tok.endsWith('>')) return tok;
      return tok.replace(numRe, (_m, n, pct) => `<color=#28d9ed>${n}${pct}</color>`);
    })
    .join('');

  const colorTagRe = /<color=(#[0-9a-fA-F]{6})>([\s\S]*?)<\/color>/;
  while (colorTagRe.test(html)) {
    html = html.replace(colorTagRe, (_m, color, inner) => `<span style="color:${color}">${inner}</span>`);
  }

  html = html.replace(/\\n|\\\\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ---- Composant ----
export default function SetCard({ set, langue }: { set: ArmorSet; langue: TenantKey }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();
  const parts = ["Helmet", "Armor", "Gloves", "Shoes"];

  const displayName = l(set, "name", langue);

  // Effets par langue
  const e2_1 = l(set, "effect_2_1", langue);
  const e4_1 = l(set, "effect_4_1", langue);
  const e2_4 = l(set, "effect_2_4", langue);
  const e4_4 = l(set, "effect_4_4", langue);

  const noExtra = <em className="text-zinc-400">{t('items.noAdditional', { defaultValue: 'No additional effect' })}</em>;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative bg-white/5 p-1 rounded-2xl shadow flex flex-col items-center text-center transition-all duration-300 ${expanded ? "w-[200px]" : "w-[140px]"} cursor-pointer`}
    >
      {/* Miniatures */}
      <div className="grid grid-cols-2 gap-1">
        {parts.map((part, i) => (
          <div key={i} className="relative w-[50px] h-[50px]">
            <Image
              src={`/images/bg/CT_Slot_${set.rarity}.webp`}
              alt="bg"
              fill
              className="absolute inset-0 z-0"
              sizes="50px"
            />
            <div className="relative w-[50px] h-[50px]">
              <Image
                src={`/images/equipment/TI_Equipment_${part}_${set.image_prefix}.webp`}
                alt={part}
                fill
                className="relative z-10 object-contain"
                sizes="40px"
              />
            </div>

            {/* Logo effet set */}
            <div className="absolute top-1.5 right-1.5 z-20 translate-x-1/4 -translate-y-1/4">
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src={`/images/ui/effect/${set.set_icon}.webp`}
                  alt="Set Icon"
                  fill
                  className="relative z-10 object-contain"
                  sizes="20px"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Classe */}
      {set.class && (
        <div className="absolute top-0 left-0 z-20 -translate-x-1/3 -translate-y-1/3 w-[24px] h-[24px]">
          <Image
            src={`/images/ui/class/${set.class.toLowerCase()}.webp`}
            alt="Class"
            fill
            className="object-contain"
            sizes="24px"
          />
        </div>
      )}

      {/* Nom */}
      <h3 className="text-sm font-bold text-red-400 mt-2 leading-tight">
        <Link href={`/item/set/${toKebabCase(set.name)}`}>
          <span className="hover:underline cursor-pointer">
            {displayName.includes('[') ? (
              <>
                {displayName.split('[')[0].trim()}
                <br />
                [{displayName.split('[')[1]}
              </>
            ) : (
              displayName
            )}
          </span>
        </Link>
      </h3>

      {/* Flèche */}
      <div className="text-white/40 text-lg mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Effets */}
      {expanded && (
        <div className="bg-gray-800/90 rounded-xl px-4 py-3 text-xs text-white/90 w-full mt-2 flex flex-col gap-2">
          <p className="text-yellow-300 font-semibold text-sm">
            {t('items.setEffects', { defaultValue: 'Set Effects' })}
          </p>

          {/* --- Tier 0 --- */}
          {(e2_1 || e4_1) && (
            <div className="space-y-1">
              <p className="text-cyan-400 font-semibold text-sm">
                {t('items.tier0', { defaultValue: 'Tier 0' })}
              </p>
              {e2_1 && (
                <p className="leading-snug">
                  <span className="text-white/70 mr-1">
                    [{t('items.set.twoPiece', { defaultValue: '2-Piece' })}]
                  </span>
                  {formatEffectTextAndHighlightNum(e2_1)}
                </p>
              )}
              {e4_1 && (
                <p className="leading-snug">
                  <span className="text-white/70 mr-1">
                    [{t('items.set.fourPiece', { defaultValue: '4-Piece' })}]
                  </span>
                  {formatEffectTextAndHighlightNum(e4_1)}
                </p>
              )}
              {!e2_1 && !e4_1 && noExtra}
            </div>
          )}

          {/* --- Tier 4 --- */}
          {(e2_4 || e4_4) && (
            <div className="space-y-1">
              <p className="text-yellow-300 font-semibold text-sm">
                {t('items.tier4', { defaultValue: 'Tier 4' })}
              </p>
              {e2_4 && (
                <p className="leading-snug">
                  <span className="text-white/70 mr-1">
                    [{t('items.set.twoPiece', { defaultValue: '2-Piece' })}]
                  </span>
                  {formatEffectTextAndHighlightNum(e2_4)}
                </p>
              )}
              {e4_4 && (
                <p className="leading-snug">
                  <span className="text-white/70 mr-1">
                    [{t('items.set.fourPiece', { defaultValue: '4-Piece' })}]
                  </span>
                  {formatEffectTextAndHighlightNum(e4_4)}
                </p>
              )}
              {!e2_4 && !e4_4 && noExtra}
            </div>
          )}

          {/* Source */}
          <div className="mt-2">
            <p className="text-gray-400 font-semibold text-xs">
              {t('items.obtained', { defaultValue: 'Obtained :' })}
            </p>
            <p className="text-gray-400 text-xs">
              {set.source || '-'} <br />
              {set.boss || set.mode || ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
