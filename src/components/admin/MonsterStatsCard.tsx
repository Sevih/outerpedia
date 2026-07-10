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
 * Stats d'un monstre À LA RENCONTRE (calcul partagé avec la carte publique,
 * cf. src/lib/monster-stats) : un bouton = une rencontre réelle, ses
 * modificateurs de donjon appliqués (adv per-mille, PV réels du mode). Le
 * niveau LIBRE affiche les valeurs du templet, sans modificateur.
 */
export function MonsterStatsCard({
  stats,
  scales,
  spawns,
}: {
  stats: Record<string, StatRange>;
  /** Échelle d'affichage par slug (`percent` = per-mille → %). */
  scales: Record<string, string>;
  /** Rencontres réelles du monstre. */
  spawns: SpawnContext[];
}) {
  const options = dedupSpawnContexts(spawns);
  const [selected, setSelected] = useState<number>(options.length ? options.length - 1 : -1);
  const [freeLevel, setFreeLevel] = useState<number>(options.at(-1)?.level ?? 100);
  const ctx: SpawnContext = options[selected] ?? { level: freeLevel };
  const modified = Boolean(ctx.adv || ctx.bossHp);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="text-content-subtle mr-1">Rencontre :</span>
        {options.map((s, i) => (
          <button
            key={i}
            type="button"
            title={s.label}
            onClick={() => setSelected(i)}
            className={`rounded px-2 py-0.5 ${
              i === selected
                ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/40'
                : 'bg-surface-raised text-content-subtle hover:text-content'
            }`}
          >
            {s.rank ? `${s.rank} · ` : ''}Lv {s.level}
          </button>
        ))}
        <input
          type="number"
          min={1}
          value={ctx.level}
          onChange={(e) => {
            setSelected(-1);
            setFreeLevel(Math.max(1, Number(e.target.value) || 1));
          }}
          className="border-line-subtle bg-surface-base w-20 rounded-md border px-2 py-0.5"
          title="Niveau libre — valeurs du templet, sans modificateur de donjon"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {orderedStats(stats).map(([slug, r]) => (
          <div key={slug} className="border-line-subtle rounded-md border px-3 py-1.5">
            <div className="text-content-subtle text-xs">{statAbbr(slug)}</div>
            <div className="text-content">
              {formatMonsterStat(slug, statAt(slug, r, ctx), scales)}
              {slug === 'hp' && ctx.hpLines ? (
                <span className="text-content-subtle ml-1 text-xs">× {ctx.hpLines} barres</span>
              ) : null}
            </div>
            {r.min !== r.max && (
              <div className="text-content-subtle text-[10px]">
                {formatMonsterStat(slug, r.min, scales)} → {formatMonsterStat(slug, r.max, scales)}
              </div>
            )}
          </div>
        ))}
      </div>
      {modified && (
        <p className="text-content-subtle text-xs">
          Modificateurs de la rencontre appliqués
          {ctx.adv
            ? ` (${Object.entries(ctx.adv)
                .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v / 10}%`)
                .join(', ')})`
            : ''}
          {ctx.bossHp ? ` · PV du mode : ${ctx.bossHp.toLocaleString('en')}` : ''}
          {ctx.transLevel ? ` · transcendance ${ctx.transLevel}` : ''}
          {ctx.label ? ` — ${ctx.label}` : ''}
          {ctx.rank ? ` (palier ${ctx.rank})` : ''}
        </p>
      )}
      {ctx.options && ctx.options.length > 0 && (
        <p className="text-content-subtle text-xs">
          Passifs additionnels du palier (non résolus — TODO) : {ctx.options.join(', ')}
        </p>
      )}
    </div>
  );
}
