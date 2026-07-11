'use client';

import { useState } from 'react';
import { statAbbr } from '@/lib/stats';
import {
  dedupSpawnContexts,
  formatMonsterStat,
  orderedStats,
  statAt,
  type SpawnContext,
  type StatRange,
} from '@/lib/monster-stats';

/**
 * Stats d'un boss À LA RENCONTRE — calcul partagé avec la carte admin
 * (src/lib/monster-stats) : ordre de l'écran du jeu, EFF/RES en valeur brute,
 * modificateurs du donjon appliqués (adv per-mille, PV réels du mode).
 */
export function BossStats({
  stats,
  scales,
  spawns,
  levelLabel,
  quirkMods,
}: {
  stats: Record<string, StatRange>;
  /** Échelle d'affichage par slug (`percent` = per-mille → %). */
  scales: Record<string, string>;
  /** Rencontres réelles du boss (contexte de donjon inclus). */
  spawns: SpawnContext[];
  /** Libellé « Level » déjà localisé. */
  levelLabel: string;
  /** Quirks de compte réduisant les stats du boss (`glossaries.bossQuirkMods`). */
  quirkMods?: Record<string, number>;
}) {
  const options = dedupSpawnContexts(spawns);
  const [selected, setSelected] = useState<number>(options.length ? options.length - 1 : -1);
  const ctx: SpawnContext = options[selected] ?? { level: 100 };

  return (
    <div className="space-y-2">
      {options.length > 1 && (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-content-muted mr-1">{levelLabel}</span>
          {options.map((s, i) => (
            <button
              key={i}
              type="button"
              title={s.label}
              onClick={() => setSelected(i)}
              className={`rounded px-2 py-0.5 transition-colors ${
                i === selected
                  ? 'bg-accent/15 text-accent ring-accent/40 ring-1'
                  : 'bg-surface-raised text-content-muted hover:text-content-strong'
              }`}
            >
              {s.rank ? `${s.rank} · ` : ''}
              {s.level}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:grid-cols-5">
        {orderedStats(stats).map(([slug, r]) => (
          <div
            key={slug}
            className="border-line-subtle bg-surface-raised rounded-md border px-3 py-1.5"
          >
            <div className="text-content-muted text-xs">{statAbbr(slug)}</div>
            <div className="text-content-strong">
              {formatMonsterStat(slug, statAt(slug, r, ctx, quirkMods), scales)}
              {slug === 'hp' && ctx.hpLines ? (
                <span className="text-content-muted ml-1 text-xs">× {ctx.hpLines}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {options.length === 1 && (
        <p className="text-content-muted text-xs">
          {levelLabel} {ctx.level}
          {ctx.label ? ` — ${ctx.label}` : ''}
        </p>
      )}
    </div>
  );
}
