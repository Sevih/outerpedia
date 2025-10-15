// AccessoryCard.tsx (tailles harmonisées avec WeaponCard)
'use client'

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { toKebabCase } from "@/utils/formatText";
import type { Accessory } from "@/types/equipment";
import StatIconsRow from "@/app/components/StatIconsRow";
import { useI18n } from '@/lib/contexts/I18nContext'
import type { TenantKey } from "@/tenants/config";

function formatEffectTextAndHighlightNum(text: string): React.ReactElement {
  if (!text) return <></>;
  const tokens = text.split(/(<[^>]+>)/g);
  const numRe = /(\d+(?:\.\d+)?)(\s*%?)/g;

  let html = tokens
    .map(tok => (tok.startsWith('<') && tok.endsWith('>')) ? tok
      : tok.replace(numRe, (_m, n, pct) => `<color=#28d9ed>${n}${pct}</color>`))
    .join('');

  const colorTagRe = /<color=(#[0-9a-fA-F]{6})>([\s\S]*?)<\/color>/;
  while (colorTagRe.test(html)) {
    html = html.replace(colorTagRe, (_m, color, inner) => `<span style="color:${color}">${inner}</span>`);
  }
  html = html.replace(/\\n|\\\\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function pickByLang(base: string, jp?: string, kr?: string, langue?: TenantKey) {
  if (langue === "jp" && jp && jp.trim()) return jp;
  if (langue === "kr" && kr && kr.trim()) return kr;
  return base;
}

export default function AccessoryCard({
  accessory,
  langue,
}: {
  accessory: Accessory;
  langue: TenantKey;
}) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();

  const displayName       = pickByLang(accessory.name,        accessory.name_jp,        accessory.name_kr,        langue);
  const displayEffectName = pickByLang(accessory.effect_name, accessory.effect_name_jp, accessory.effect_name_kr, langue);
  const displayDesc1      = pickByLang(accessory.effect_desc1,accessory.effect_desc1_jp,accessory.effect_desc1_kr,langue);
  const displayDesc4      = pickByLang(accessory.effect_desc4,accessory.effect_desc4_jp,accessory.effect_desc4_kr,langue);
  const displaySource     = pickByLang(accessory.source,      accessory.source_jp,      accessory.source_kr,      langue);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative bg-white/5 p-[0.6rem] rounded-2xl shadow flex flex-col items-center text-center transition-all duration-300 ${expanded ? "w-[145px]" : "w-[130px]"} cursor-pointer`}
    >
      {/* Image centrale (80x80 + fond CT_Slot_{rarity} comme WeaponCard) */}
      <div className="relative w-[80px] h-[80px]">
        <Image
          src={`/images/bg/CT_Slot_${accessory.rarity}.webp`}
          alt="background"
          fill
          sizes="80px"
          className="absolute inset-0 z-0"
        />
        <Image
          src={`/images/equipment/${accessory.image}.webp`}
          alt={displayName}
          fill
          sizes="80px"
          className="relative z-10 object-contain"
        />

        {/* étoiles (15px) */}
        {accessory.level > 0 && (
          <div className="absolute bottom-1 -translate-x-1/2 inline-flex justify-center mt-0.5 z-50">
            {Array.from({ length: accessory.level }).map((_, i) => (
              <Image
                key={i}
                src="/images/ui/CM_icon_star_y.webp"
                alt="star"
                width={15}
                height={15}
                className={`object-contain ${i > 0 ? "-ml-1" : ""} z-11`}
              />
            ))}
          </div>
        )}

        {/* icône d’effet (20x20) */}
        {accessory.effect_icon && (
          <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
            <Image
              src={`/images/ui/effect/${accessory.effect_icon}.webp`}
              alt="Effect"
              width={20}
              height={20}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )}

        {/* icône de classe (20x20) */}
        {accessory.class && (
          <div className="absolute top-8 right-2 -translate-y-1/3 z-20 translate-x-1/3">
            <Image
              src={`/images/ui/class/${accessory.class.toLowerCase()}.webp`}
              alt="Class"
              width={20}
              height={20}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )}
      </div>

      {/* Nom (12px) avec split sur '[' ; slug basé sur le nom EN */}
      <h3 className="text-[12px] font-bold text-red-400 mt-1.5 leading-tight">
        <Link href={`/item/accessory/${toKebabCase(accessory.name)}`}>
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

      {/* Badge effet (11px + icône 13x13) */}
      <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[11px] text-white font-medium mt-1">
        <div className="relative w-[13px] h-[13px]">
          <Image
            src={`/images/ui/effect/SC_Buff_Effect_Freeze.webp`}
            alt={displayEffectName}
            fill
            className="object-contain"
            sizes="13px"
          />
        </div>
        <span>{displayEffectName}</span>
      </div>

      {/* Indicateur (10px) */}
      <div className="text-white/40 text-[10px] mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Bloc étendu (11px, titres 12px) */}
      {expanded && (
        <div className="rounded-xl text-[11px] text-white/90 w-full flex flex-col gap-1">
          {accessory.mainStats?.length > 0 && (
            <StatIconsRow statsList={accessory.mainStats} size={18} />
          )}

          <div>
            <p className="text-cyan-400 font-semibold text-[12px]">
              {t('items.tier0', { defaultValue: 'Tier 0' })}
            </p>
            <p className="leading-snug">
              {formatEffectTextAndHighlightNum(displayDesc1)}
            </p>
          </div>

          <div>
            <p className="text-yellow-300 font-semibold text-[12px]">
              {t('items.tier4', { defaultValue: 'Tier 4' })}
            </p>
            <p className="leading-snug">
              {formatEffectTextAndHighlightNum(displayDesc4)}
            </p>
          </div>

          <div className="mt-1">
            <p className="text-gray-400 font-semibold text-[10px]">
              {t('items.obtained', { defaultValue: 'Obtained :' })}
            </p>
            <p className="text-gray-400 text-[10px]">
              {displaySource} <br />
              {accessory.boss || accessory.mode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
