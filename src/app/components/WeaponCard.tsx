'use client'

import Image from "next/image";
import { useState } from "react";
import type { Weapon } from "@/types/equipment";
import { toKebabCase } from "@/utils/formatText";
import Link from "next/link";
import { useI18n } from '@/lib/contexts/I18nContext'
import type { TenantKey } from "@/tenants/config";


function formatEffectTextAndHighlightNum(text: string): React.ReactElement {
  if (!text) return <></>;

  // 1) Séparer balises et texte: [texte | <tag> | texte | <tag> | ...]
  const tokens = text.split(/(<[^>]+>)/g);

  // nombres: 30, 30%, 30 %, 10.5, 10.5%
  const numRe = /(\d+(?:\.\d+)?)(\s*%?)/g;

  // 2) Dans les segments TEXTE seulement, on entoure les nombres avec <color=#28d9ed>
  let html = tokens
    .map(tok => {
      if (tok.startsWith('<') && tok.endsWith('>')) return tok; // on ne touche pas aux balises
      return tok.replace(numRe, (_m, n, pct) => `<color=#28d9ed>${n}${pct}</color>`);
    })
    .join('');

  // 3) Convertir toutes les balises <color=...>...</color> en <span style="color:...">
  //    Boucle pour gérer les occurrences imbriquées/juxtaposées
  const colorTagRe = /<color=(#[0-9a-fA-F]{6})>([\s\S]*?)<\/color>/;
  while (colorTagRe.test(html)) {
    html = html.replace(colorTagRe, (_m, color, inner) => {
      return `<span style="color:${color}">${inner}</span>`;
    });
  }

  // 4) Sauts de ligne -> <br>
  html = html.replace(/\\n|\\\\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}


function pickByLang(base: string, jp?: string, kr?: string, langue?: TenantKey) {
  if (langue === "jp" && jp && jp.trim().length) return jp;
  if (langue === "kr" && kr && kr.trim().length) return kr;
  return base;
}

export default function WeaponCard({
  weapon,
  langue,
}: {
  weapon: Weapon;
  langue: TenantKey;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const displayName = pickByLang(weapon.name, weapon.name_jp, weapon.name_kr, langue);
  const displayEffectName = pickByLang(weapon.effect_name, weapon.effect_name_jp, weapon.effect_name_kr, langue);
  const displayDesc1 = pickByLang(weapon.effect_desc1, weapon.effect_desc1_jp, weapon.effect_desc1_kr, langue);
  const displayDesc4 = pickByLang(weapon.effect_desc4, weapon.effect_desc4_jp, weapon.effect_desc4_kr, langue);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`relative bg-white/5 p-[0.6rem] rounded-2xl shadow flex flex-col items-center text-center transition-all duration-300 ${expanded ? "w-[145px]" : "w-[130px]"
        } cursor-pointer`}
    >
      {/* Image centrale */}
      <div className="relative w-[80px] h-[80px]">
        <Image
          src={`/images/bg/CT_Slot_${weapon.rarity}.webp`}
          alt="background"
          fill
          sizes="80px"
          className="absolute inset-0 z-0"
        />
        <Image
          src={`/images/equipment/${weapon.image}.webp`}
          alt={displayName}
          fill
          sizes="80px"
          className="relative z-10 object-contain"
        />

        {/* étoiles de niveau */}
        {weapon.level && weapon.level > 0 && (
          <div className="absolute bottom-1 -translate-x-1/2 inline-flex justify-center mt-0.5 z-50">
            {Array.from({ length: weapon.level }).map((_, i) => (
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

        {/* icône d’effet */}
        {weapon.effect_icon && (
          <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
            <Image
              src={`/images/ui/effect/${weapon.effect_icon}.webp`}
              alt="Effect"
              width={20}
              height={20}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )}

        {/* icône de classe */}
        {weapon.class && (
          <div className="absolute top-8 right-2 -translate-y-1/3 z-20 translate-x-1/3">
            <Image
              src={`/images/ui/class/${weapon.class.toLowerCase()}.webp`}
              alt="Class"
              width={20}
              height={20}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )}
      </div>

      {/* Nom de l’arme */}
      <h3 className="text-[12px] font-bold text-red-400 mt-1.5 leading-tight">
        <Link href={`/item/weapon/${toKebabCase(weapon.name)}`}>
          <span className="hover:underline cursor-pointer">
            {displayName.includes("[") ? (
              <>
                {displayName.split("[")[0].trim()}
                <br />
                [{displayName.split("[")[1]}
              </>
            ) : (
              displayName
            )}
          </span>
        </Link>
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
        <span>{displayEffectName}</span>
      </div>

      {/* Indicateur visuel */}
      <div className="text-white/40 text-[10px] mt-1">{expanded ? "▲" : "▼"}</div>

      {/* Contenu des effets */}
      {expanded && (
        <div className="rounded-xl text-[11px] text-white/90 w-full flex flex-col gap-1">
          <div>
            <p className="text-cyan-400 font-semibold text-[12px]">
              {t('items.tier0', { defaultValue: 'Tier 0' })}
            </p>
            <p className="leading-snug">{formatEffectTextAndHighlightNum(displayDesc1)}</p>
          </div>
          <div>
            <p className="text-yellow-300 font-semibold text-[12px]">
              {t('items.tier4', { defaultValue: 'Tier 4' })}
            </p>
            <p className="leading-snug">{formatEffectTextAndHighlightNum(displayDesc4)}</p>
          </div>

          {/* Source */}
          <div className="mt-1">
            <p className="text-gray-400 font-semibold text-[10px]">
              {t('items.obtained', { defaultValue: 'Obtained :' })}
            </p>
            <p className="text-gray-400 text-[10px]">
              {weapon.source} <br />
              {weapon.boss || weapon.mode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
