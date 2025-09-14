'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

type Props = {
  transcendData: Record<string, string | null>;
};

type Step = {
  label: string;
  key: string;
};

const starIcons = {
  gray: "/images/ui/CM_icon_star_w.webp",
  yellow: "/images/ui/CM_icon_star_y.webp",
  orange: "/images/ui/CM_icon_star_o.webp",
  red: "/images/ui/CM_icon_star_r.webp",
  purple: "/images/ui/CM_icon_star_v.webp",
};

const replaceablePatterns: RegExp[] = [

];

const cumulablePatterns: RegExp[] = [

];

const mergeablePatterns: { regex: RegExp; prefix: string; suffix: string }[] = [
  {
    regex: /^Reduces efficiency of Priority increase effects of the enemy by (\d+)%$/,
    prefix: "Reduces efficiency of Priority increase effects of the enemy by ",
    suffix: "%",
  },
];

function TranscendenceStars({ levelLabel }: { levelLabel: string }) {
  const stars: string[] = [];
  switch (levelLabel) {
    case "Lv 1": stars.push(...Array(1).fill(starIcons.yellow), ...Array(5).fill(starIcons.gray)); break;
    case "Lv 2": stars.push(...Array(2).fill(starIcons.yellow), ...Array(4).fill(starIcons.gray)); break;
    case "Lv 3": stars.push(...Array(3).fill(starIcons.yellow), ...Array(3).fill(starIcons.gray)); break;
    case "Lv 4": stars.push(...Array(4).fill(starIcons.yellow), ...Array(2).fill(starIcons.gray)); break;
    case "Lv 4+": stars.push(...Array(3).fill(starIcons.yellow), starIcons.orange, ...Array(2).fill(starIcons.gray)); break;
    case "Lv 5": stars.push(...Array(5).fill(starIcons.yellow), starIcons.gray); break;
    case "Lv 5+": stars.push(...Array(4).fill(starIcons.yellow), starIcons.red, starIcons.gray); break;
    case "Lv 5++": stars.push(...Array(4).fill(starIcons.yellow), starIcons.purple, starIcons.gray); break;
    case "Lv 6": stars.push(...Array(6).fill(starIcons.yellow)); break;
    default: stars.push(...Array(6).fill(starIcons.gray)); break;
  }
  return (
    <div className="flex gap-[1px]">
      {stars.map((src, idx) => (
        <Image key={idx} src={src} alt="star" width={18} height={18} style={{ width: 18, height: 18 }} className="object-contain" />
      ))}
    </div>
  );
}

export default function TranscendenceSlider({ transcendData }: Props) {
  const steps = useMemo(() => {
    const s: Step[] = [];
    if (transcendData["1"]) s.push({ label: "Lv 1", key: "1" });
    if (transcendData["2"]) s.push({ label: "Lv 2", key: "2" });
    if (transcendData["3"]) s.push({ label: "Lv 3", key: "3" });
    if (transcendData["4"]) s.push({ label: "Lv 4", key: "4" });
    if (transcendData["4_1"]) s.push({ label: "Lv 4", key: "4_1" });
    if (transcendData["4_2"]) s.push({ label: "Lv 4+", key: "4_2" });
    if (transcendData["5"]) s.push({ label: "Lv 5", key: "5" });
    if (transcendData["5_1"]) s.push({ label: "Lv 5", key: "5_1" });
    if (transcendData["5_2"]) s.push({ label: "Lv 5+", key: "5_2" });
    if (transcendData["5_3"]) s.push({ label: "Lv 5++", key: "5_3" });
    if (transcendData["6"]) s.push({ label: "Lv 6", key: "6" });
    return s;
  }, [transcendData]);

  const [index, setIndex] = useState(0);
  const currentLabel = steps[index]?.label ?? "";

  const activeBonuses = useMemo(() => {
    let lastAtkDefHpLine: string | null = null;
    const bonusMap: Record<string, number> = {};
    const uniqueEffects: Map<string, string> = new Map();
    const otherBonuses: Set<string> = new Set();

    for (let i = 0; i <= index; i++) {
      const raw = transcendData[steps[i].key];
      if (!raw) continue;
      const lines = raw.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^ATK DEF HP \+\d+%$/.test(trimmed)) {
          lastAtkDefHpLine = trimmed;
          continue;
        }
        const matchFlat = trimmed.match(/^\+(\d+) (.+)$/);
        if (matchFlat) {
          const amount = parseInt(matchFlat[1]);
          const label = matchFlat[2];
          bonusMap[`flat|${label}`] = (bonusMap[`flat|${label}`] || 0) + amount;
          continue;
        }


        const match = trimmed.match(/^\+(\d+)% (.+)$/);
        if (match) {
          const amount = parseInt(match[1]);
          const label = match[2];
          bonusMap[label] = (bonusMap[label] || 0) + amount;
          continue;
        }




        let handled = false;

        for (const regex of replaceablePatterns) {
          if (regex.test(trimmed)) {
            uniqueEffects.set(regex.source, trimmed);
            handled = true;
            break;
          }
        }

        if (handled) continue;

        for (const { regex, prefix, suffix } of mergeablePatterns) {
          const match = trimmed.match(regex);
          if (match) {
            const value = parseInt(match[1]);
            const key = `${prefix}|${suffix}`;
            bonusMap[key] = (bonusMap[key] || 0) + value;
            handled = true;
            break;
          }
        }

        if (handled) continue;

        for (const regex of cumulablePatterns) {
          if (regex.test(trimmed)) {
            otherBonuses.add(trimmed);
            handled = true;
            break;
          }
        }

        if (!handled) otherBonuses.add(trimmed);
      }
    }

    if (["Lv 5", "Lv 5+", "Lv 5++", "Lv 6"].includes(currentLabel)) {
      otherBonuses.add("Burst Lv3");
    } else if (["Lv 3", "Lv 4", "Lv 4+"].includes(currentLabel)) {
      otherBonuses.add("Burst Lv2");
    }

    const result: string[] = [];
    if (lastAtkDefHpLine) result.push(lastAtkDefHpLine);
    for (const [label, value] of Object.entries(bonusMap)) {
      if (label.startsWith("flat|")) {
        result.push(`+${value} ${label.replace("flat|", "")}`);
      } else if (label.includes("|")) {
        const [prefix, suffix] = label.split("|");
        result.push(`${prefix}${value}${suffix}`);
      } else {
        result.push(`+${value}% ${label}`);
      }

    }
    for (const effect of uniqueEffects.values()) {
      result.push(effect);
    }
    for (const effect of otherBonuses) {
      result.push(effect);
    }

    return result;
  }, [index, transcendData, steps, currentLabel]);

  if (steps.length === 0) return null;

  return (
    <div className="bg-[#1a1c28] border border-gray-700 p-4 space-y-3 text-white max-w-[400px] w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-grow max-w-[260px]">
          <button onClick={() => setIndex((prev) => Math.max(prev - 1, 0))} className="text-sm bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 flex items-center justify-center rounded">–</button>
          <div className="relative flex-grow max-w-[260px] h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-300" style={{ width: `${(index / (steps.length - 1)) * 100}%` }} />
            <input type="range" min={0} max={steps.length - 1} value={index} onChange={(e) => setIndex(Number(e.target.value))} className="w-full h-2 opacity-0 cursor-pointer absolute top-0 left-0" />
          </div>
          <button onClick={() => setIndex((prev) => Math.min(prev + 1, steps.length - 1))} className="text-sm bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 flex items-center justify-center rounded">+</button>
        </div>
        <TranscendenceStars levelLabel={currentLabel} />
      </div>

      <div className="space-y-1.5">
        {activeBonuses.map((bonus, idx) => {
          const match = bonus.match(/^ATK DEF HP \+(\d+)%$/);
          if (match) {
            const value = match[1];
            return (
              <div key={idx} className="text-xs text-white flex items-center gap-1">
                <Image src="/images/ui/effect/CM_Stat_Icon_ATK.webp" alt="ATK" width={16} height={16} style={{ width: 16, height: 16 }} className="object-contain" />
                <Image src="/images/ui/effect/CM_Stat_Icon_DEF.webp" alt="DEF" width={16} height={16} style={{ width: 16, height: 16 }} className="object-contain" />
                <Image src="/images/ui/effect/CM_Stat_Icon_HP.webp" alt="HP" width={16} height={16} style={{ width: 16, height: 16 }} className="object-contain" />
                <span className="ml-1">+{value}%</span>
              </div>
            );
          }
          return (
            <div key={idx} className="text-xs text-white whitespace-pre-line leading-tight">{bonus}</div>
          );
        })}
      </div>
    </div>
  );
}