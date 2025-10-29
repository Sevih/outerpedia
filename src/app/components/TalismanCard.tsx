'use client'

import Image from "next/image";
import { useState } from "react";
import { useI18n } from '@/lib/contexts/I18nContext'
import type { TenantKey } from "@/tenants/config";
import React from "react";
import type { Talisman } from "@/types/equipment";
import { l } from "@/lib/localize";

/* ---------- Helpers identiques à ton WeaponCard ---------- */

function formatEffectTextAndHighlightNum(text: string): React.ReactElement {
  if (!text) return <></>;

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
    html = html.replace(colorTagRe, (_m, color, inner) => {
      return `<span style="color:${color}">${inner}</span>`;
    });
  }

  html = html.replace(/\\n|\\\\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}


/* -------------------- Composant -------------------- */

export default function TalismanCard({ talisman, langue }: { talisman: Talisman, langue: TenantKey }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const displayName = l(talisman, "name", langue);
  const displayEffectName = l(talisman, "effect_name", langue);
  const displayDescBase = l(talisman, "effect_desc1", langue);
  const displayDescLv10 = l(talisman, "effect_desc4", langue);

  // Normalisation multilingue du label d'effet
  // Normalisation multilingue du label d'effet
  let shortEffectName: React.ReactNode = displayEffectName;

  (() => {
    if (!displayEffectName) return;

    // 1) Split prioritaire sur " - ", sinon sur ": "
    const splitPrimary = displayEffectName.split(" - ");
    const parts = splitPrimary.length > 1 ? splitPrimary : displayEffectName.split(": ");

    const first = (parts[0] ?? "").trim();
    const second = (parts[1] ?? "").trim();

    // 2) Détection AP / CP
    const firstLower = first.toLowerCase();
    let tag: "AP" | "CP" | null = null;

    if (firstLower.includes("action point") || firstLower.startsWith("ap")) {
      tag = "AP";
    } else if (firstLower.includes("chain point") || firstLower.startsWith("cp")) {
      tag = "CP";
    }

    // 3) Reformat
    if (tag && second) {
      shortEffectName = (
        <>
          {tag}
          <br />
          {second}
        </>
      );
    } else if (tag && !second) {
      shortEffectName = tag;
    } else {
      shortEffectName = displayEffectName;
    }
  })();



  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative bg-white/5 p-[0.6rem] rounded-2xl shadow flex flex-col items-center text-center transition-all duration-300 ${expanded ? "w-[160px]" : "w-[160px]"} cursor-pointer`}
    >
      {/* Image centrale (basée sur icon_item) */}
      <div className="relative w-[80px] h-[80px]">
        {/* Cadre neutre (si tu as un fond dédié aux talismans, remplace ce bg) */}
        <Image
          src={`/images/bg/CT_Slot_${talisman.rarity}.webp`}
          alt="background"
          fill
          sizes="80px"
          className="absolute inset-0 z-0"
        />
        <Image
          src={`/images/equipment/${talisman.image}.webp`}
          alt={displayName}
          fill
          sizes="80px"
          className="relative z-10 object-contain"
        />

        {/* icône d’effet */}
        {talisman.effect_icon && (
          <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
            <Image
              src={`/images/ui/effect/${talisman.effect_icon}.webp`}
              alt="Effect"
              width={20}
              height={20}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )}

      </div>

      {/* Nom du talisman */}
      <h3 className="text-[12px] font-bold text-rose-300 mt-1.5 leading-tight">
        {displayName}
      </h3>

      {/* Label effet */}
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
        <span>{shortEffectName}</span>
      </div>

      {/* Indicateur visuel */}
      <div className="text-white/40 text-[10px] mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Contenu des effets */}
      {expanded && (
        <div className="rounded-xl text-[11px] text-white/90 w-full flex flex-col gap-1">
          <div>
            <p className="text-cyan-400 font-semibold text-[12px]">
              {t('talisman.base', { defaultValue: 'Base' })}
            </p>
            <p className="leading-snug">{formatEffectTextAndHighlightNum(displayDescBase)}</p>
          </div>
          <div>
            <p className="text-yellow-300 font-semibold text-[12px]">
              {t('talisman.level10', { defaultValue: 'Level 10' })}
            </p>
            <p className="leading-snug">
              {displayDescLv10 && displayDescLv10.trim().length > 0
                ? formatEffectTextAndHighlightNum(displayDescLv10)
                : <span className="text-white/50 italic">{t('talisman.noLv10', { defaultValue: 'No additional effect' })}</span>}
            </p>

          </div>

          {/* Source */}
          <div className="mt-1">
            <p className="text-gray-400 font-semibold text-[10px]">
              {t('items.obtained', { defaultValue: 'Obtained :' })}
            </p>
            <p className="text-gray-400 text-[10px]">
              {talisman.source} <br />
              {talisman.boss || talisman.mode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
