'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { TenantKey } from '@/tenants/config';

type Lang = TenantKey;

type Props = {
  transcendData: Record<string, string | null>; // déjà localisé côté data
  lang: Lang;
  t: (key: string) => string; // fonction de traduction
};

type LevelId =
  | '1' | '2' | '3'
  | '4' | '4_1' | '4_2'
  | '5' | '5_1' | '5_2' | '5_3'
  | '6';

type Step = { label: string; key: LevelId };

const starIcons = {
  gray: "/images/ui/CM_icon_star_w.webp",
  yellow: "/images/ui/CM_icon_star_y.webp",
  orange: "/images/ui/CM_icon_star_o.webp",
  red: "/images/ui/CM_icon_star_r.webp",
  purple: "/images/ui/CM_icon_star_v.webp",
} as const;

/** Mapping des IDs de niveau vers les clés i18n */
const LEVEL_KEYS: Record<LevelId, string> = {
  '1': 'transcend.level1',
  '2': 'transcend.level2',
  '3': 'transcend.level3',
  '4': 'transcend.level4',
  '4_1': 'transcend.level4',
  '4_2': 'transcend.level4plus',
  '5': 'transcend.level5',
  '5_1': 'transcend.level5',
  '5_2': 'transcend.level5plus',
  '5_3': 'transcend.level5plusplus',
  '6': 'transcend.level6',
};

/** Règles regex par langue (exemple) */
const REPLACEABLE_PATTERNS: Record<Lang, RegExp[]> = {
  en: [],
  jp: [],
  kr: [],
  zh: [],
};

const CUMULABLE_PATTERNS: Record<Lang, RegExp[]> = {
  en: [],
  jp: [],
  kr: [],
  zh: [],
};

const MERGEABLE_PATTERNS: Record<Lang, { regex: RegExp; prefix: string; suffix: string }[]> = {
  en: [
    {
      regex: /^Reduces efficiency of Priority increase effects of the enemy by (\d+)%$/,
      prefix: "Reduces efficiency of Priority increase effects of the enemy by ",
      suffix: "%",
    },
  ],
  jp: [
    {
      regex: /^敵の行動ゲージUPの効率(\d+)%DOWN$/,
      prefix: "敵の行動ゲージUPの効率",
      suffix: "%DOWN",
    }
  ],
  kr: [
    {
      regex: /^적의 행동 게이지 증가 효율 (\d+)% 감소$/,
      prefix: "적의 행동 게이지 증가 효율 ",
      suffix: "% 감소",
    }
  ],
  zh: [],
};

/** Génère les 6 étoiles en fonction du levelKey, incluant les variantes colorées (+/++) */
function starRowFor(levelKey: LevelId): string[] {
  const g = starIcons.gray, y = starIcons.yellow, o = starIcons.orange, r = starIcons.red, p = starIcons.purple;

  switch (levelKey) {
    case '1': return [y, g, g, g, g, g];
    case '2': return [y, y, g, g, g, g];
    case '3': return [y, y, y, g, g, g];
    case '4': return [y, y, y, y, g, g];
    case '4_1': return [y, y, y, y, g, g];                 // même rendu que 4
    case '4_2': return [y, y, y, o, g, g];                  // 4+
    case '5': return [y, y, y, y, y, g];
    case '5_1': return [y, y, y, y, y, g];                  // même rendu que 5
    case '5_2': return [y, y, y, y, r, g];                  // 5+
    case '5_3': return [y, y, y, y, p, g];                  // 5++
    case '6': return [y, y, y, y, y, y];
    default: return [g, g, g, g, g, g];
  }
}

function TranscendenceStars({ levelKey }: { levelKey: LevelId }) {
  const stars = starRowFor(levelKey);
  return (
    <div className="flex gap-[1px]">
      {stars.map((src, idx) => (
        <Image key={idx} src={src} alt="star" width={18} height={18} style={{ width: 18, height: 18 }} className="object-contain" />
      ))}
    </div>
  );
}

// helper local
function parseNumericBonus(s: string):
  | { kind: 'pct' | 'flat'; label: string; amount: number }
  | null {
  // +X% Label   (valeur d'abord, pour EN)
  let m = s.match(/^\+(\d+)%\s+(.+)$/);
  if (m) return { kind: 'pct', amount: parseInt(m[1], 10), label: m[2].trim() };

  // +X Label    (valeur d'abord, flat)
  m = s.match(/^\+(\d+)\s+(.+)$/);
  if (m) return { kind: 'flat', amount: parseInt(m[1], 10), label: m[2].trim() };

  // Label +X%   (valeur à la fin, pour JP/KR/EN mixtes)
  m = s.match(/^(.+?)\s*\+(\d+)%$/);
  if (m) return { kind: 'pct', amount: parseInt(m[2], 10), label: m[1].trim() };

  // Label +X    (valeur à la fin, flat)
  m = s.match(/^(.+?)\s*\+(\d+)$/);
  if (m) return { kind: 'flat', amount: parseInt(m[2], 10), label: m[1].trim() };

  return null;
}


export default function TranscendenceSlider({ transcendData, lang, t }: Props) {
  /** Construit la liste des steps à partir des clés présentes (logic IDs) */

  const steps = useMemo<Step[]>(() => {
    const order: LevelId[] = ['1', '2', '3', '4', '4_1', '4_2', '5', '5_1', '5_2', '5_3', '6'];
    return order
      .filter((k) => transcendData[k] != null)
      .map((k) => ({ key: k, label: t(LEVEL_KEYS[k]) }));
  }, [transcendData, t]);

  const [index, setIndex] = useState(0);
  const currentKey = steps[index]?.key as LevelId | undefined;

  const activeBonuses = useMemo(() => {
    if (!steps.length) return [] as string[];

    let lastAtkDefHpLine: string | null = null;
    const bonusMap: Record<string, number> = {};
    const uniqueEffects: Map<string, string> = new Map();
    const otherBonuses: Set<string> = new Set();

    for (let i = 0; i <= index; i++) {
      const raw = transcendData[steps[i].key];
      if (!raw) continue;

      const lines = raw.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();

        // EN seulement pour triple stat

        const mStats = trimmed.match(/^(?:ATK|Atk)\s+(?:DEF|Def)\s+(?:HP|Hp)\s*\+(\d+)%$/);
        if (mStats) {
          lastAtkDefHpLine = `ATK DEF HP +${mStats[1]}%`;
          continue;
        }

        // cumul générique EN/JP/KR
        const parsed = parseNumericBonus(trimmed);
        // On normalise un peu le label (éviter doubles espaces)
        const normalizeLabel = (s: string) => s.replace(/\s+/g, ' ').trim();

        if (parsed) {
          const keyLabel = normalizeLabel(parsed.label);
          if (parsed.kind === 'flat') {
            bonusMap[`flat|${keyLabel}`] = (bonusMap[`flat|${keyLabel}`] || 0) + parsed.amount;
          } else {
            // pct
            bonusMap[keyLabel] = (bonusMap[keyLabel] || 0) + parsed.amount;
          }
          continue;
        }


        let handled = false;

        for (const rx of REPLACEABLE_PATTERNS[lang] ?? []) {
          if (rx.test(trimmed)) {
            uniqueEffects.set(rx.source, trimmed);
            handled = true;
            break;
          }
        }
        if (handled) continue;

        for (const { regex, prefix, suffix } of MERGEABLE_PATTERNS[lang] ?? []) {
          const m = trimmed.match(regex);
          if (m) {
            const value = parseInt(m[1], 10);
            const key = `${prefix}|${suffix}`;
            bonusMap[key] = (bonusMap[key] || 0) + value;
            handled = true;
            break;
          }
        }
        if (handled) continue;

        for (const rx of CUMULABLE_PATTERNS[lang] ?? []) {
          if (rx.test(trimmed)) {
            otherBonuses.add(trimmed);
            handled = true;
            break;
          }
        }
        if (handled) continue;

        otherBonuses.add(trimmed);
      }
    }

    // Burst already included in JSON — no extra line added here

    const result: string[] = [];
    if (lastAtkDefHpLine) result.push(lastAtkDefHpLine);

    for (const [label, value] of Object.entries(bonusMap)) {
      if (label.startsWith('flat|')) {
        result.push(`+${value} ${label.slice(5)}`);
      } else if (label.includes('|')) {
        const [prefix, suffix] = label.split('|');
        result.push(`${prefix}${value}${suffix}`);
      } else {
        result.push(`+${value}% ${label}`);
      }
    }

    for (const v of uniqueEffects.values()) result.push(v);
    for (const v of otherBonuses) result.push(v);

    return result;
  }, [index, steps, transcendData, lang]);


  if (!steps.length || !currentKey) return null;

  return (
    <div className="bg-[#1a1c28] border border-gray-700 p-4 space-y-3 text-white max-w-[400px] w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-grow max-w-[260px]">
          <button
            onClick={() => setIndex((p) => Math.max(p - 1, 0))}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 flex items-center justify-center rounded"
            aria-label="Previous"
          >
            –
          </button>

          <div className="relative flex-grow max-w-[260px] h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${(index / (steps.length - 1)) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className="w-full h-2 opacity-0 cursor-pointer absolute top-0 left-0"
              aria-label="Transcendence level"
            />
          </div>

          <button
            onClick={() => setIndex((p) => Math.min(p + 1, steps.length - 1))}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-white w-6 h-6 flex items-center justify-center rounded"
            aria-label="Next"
          >
            +
          </button>
        </div>

        <TranscendenceStars levelKey={currentKey} />
      </div>
      <div className="space-y-1.5">
        {activeBonuses.map((bonus, idx) => {
          // rendu spécial “ATK DEF HP +X%” (EN)
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
            <div key={idx} className="text-xs text-white whitespace-pre-line leading-tight">
              {bonus}
            </div>
          );
        })}
      </div>
    </div>
  );
}
