"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ExclusiveEquipment } from "@/types/equipment";
import type { TenantKey } from "@/tenants/config";
import formatEffectText from "@/utils/formatText";
import { useI18n } from "@/lib/contexts/I18nContext";
import slugToCharJson from "@/data/_SlugToChar.json";
import { l } from "@/lib/localize";

// --- types ---
type Props = {
  exdata: Record<string, ExclusiveEquipment>;
  lang?: TenantKey;
};

type CharNameEntry = {
  Fullname: string;
  Fullname_jp?: string;
  Fullname_kr?: string;
};
type SlugToCharMap = Record<string, CharNameEntry>;
const SLUG_TO_CHAR = slugToCharJson as SlugToCharMap;

// --- composant principal ---
export default function ExclusiveEquipmentList({ exdata, lang = "en" }: Props) {
  const [search, setSearch] = useState("");
  const { t } = useI18n();

  const entries = useMemo(
    () =>
      Object.entries(exdata).map(([slug, data]) => ({
        slug,
        data,
        name_en: data.name ?? "",
        name_jp: data.name_jp ?? "",
        name_kr: data.name_kr ?? "",
      })),
    [exdata]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(({ slug, name_en, name_jp, name_kr }) =>
      [slug, name_en, name_jp, name_kr].some((s) => s.toLowerCase().includes(q))
    );
  }, [entries, search]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* search bar */}
      <input
        type="text"
        placeholder="Search exclusive equipment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 border border-white/20 rounded-full bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring focus:border-cyan-400 transition"
      />

      <div className="flex flex-wrap gap-4 justify-center">
        {filtered.length === 0 && <p className="text-white/50 italic">No results found.</p>}

        {filtered.map(({ slug, data }) => {
          const name = l(data, "name", lang);
          const effect = l(data, "effect", lang);
          const effect10 = l(data, "effect10", lang);
          const mainStat = l(data, "mainStat", lang);
          const charEntry = SLUG_TO_CHAR[slug];
          const charName = charEntry ? l(charEntry, "Fullname", lang) : "";

          return (
            <Link
              href={`/characters/${slug}`}
              key={slug}
              className="relative bg-white/5 p-4 rounded-2xl shadow flex flex-col items-center text-center gap-2 w-[260px] hover:bg-white/10 transition"
            >
              {/* image */}
              <div className="relative w-[60px] h-[60px]">
                <Image
                  src="/images/ui/bg_item_leg.webp"
                  alt="background"
                  fill
                  sizes="60px"
                  className="absolute inset-0 z-0"
                />
                <div className="relative w-[60px] h-[60px]">
                  <Image
                    src={`/images/characters/ex/${slug}.webp`}
                    alt={name}
                    fill
                    className="object-contain"
                    sizes="60px"
                  />
                </div>
                <div className="absolute top-1.5 right-1.5 z-20 translate-x-1/4 -translate-y-1/4 w-[18px] h-[18px]">
                  <Image
                    src={`/images/ui/effect/CM_UO_EXCLUSIVE.webp`}
                    alt="Effect"
                    fill
                    className="object-contain"
                    sizes="18px"
                  />
                </div>
              </div>

              <h3 className="text-red-400 text-base font-semibold leading-tight text-center">
                {name}
              </h3>

              {/* badge — now uses localized Fullname from _SlugToChar */}
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm text-white font-medium whitespace-nowrap mx-auto justify-center">
                <div className="relative w-[18px] h-[18px]">
                  <Image
                    src={`/images/ui/effect/${data.icon_effect}.webp`}
                    alt="icon"
                    fill
                    className="object-contain"
                    sizes="18px"
                  />
                </div>
                <span className="exclusive-equipment-text text-xs">
                  {t("exclusive_equipment_title", { name: charName })}
                </span>
              </div>

              {/* main stat + effects */}
              <div className="text-white/80 text-xs italic mt-1 text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="text-center text-sky-200 font-semibold">{mainStat}</div>
                </div>
                <p className="mt-2">
                  <span className="font-semibold text-white">{t("effect_label")}</span>{" "}
                  {formatEffectText(effect)}
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-white">{t("effect_lv10_label")}</span>{" "}
                  {formatEffectText(effect10)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
