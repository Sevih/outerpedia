'use client';

/**
 * Calculateur de revenus d'Ether (portage V2, re-stylé V3) — tout le TEXTE et
 * toutes les DONNÉES arrivent déjà localisés/résolus du serveur (index.tsx) :
 * ce composant ne fait que l'état des sélecteurs et l'arithmétique V2
 * (totaux quotidiens/hebdo/mensuels + projection jusqu'à une date).
 */
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

export interface LadderOption {
  label: string;
  ether: number;
}

export interface SourceRow {
  id: string;
  label: string;
  note: string;
  amount: number;
  /** Jours actifs par semaine (daily seulement, défaut 7). */
  daysPerWeek?: number;
  /** Cadence en mois (monthly seulement, défaut 1) — guild raid et world boss
   *  alternent : la colonne et les totaux affichent la MOYENNE mensuelle. */
  monthsPerCycle?: number;
  ranked?: 'arena' | 'guildRaid' | 'worldBoss' | 'singularity';
}

export interface CalculatorModel {
  labels: Record<
    | 'dailyIncome'
    | 'weeklyIncome'
    | 'monthlyIncome'
    | 'weeklyTotal'
    | 'monthlyTotal'
    | 'perDay'
    | 'advancedAdjustments'
    | 'arena'
    | 'guild'
    | 'worldBoss'
    | 'singularity'
    | 'tableDaily'
    | 'tableWeekly'
    | 'tableMonthly'
    | 'source'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'weeklyApprox'
    | 'monthlyApprox'
    | 'monthlyApprox4'
    | 'notes'
    | 'dailySubtotal'
    | 'weeklySubtotal'
    | 'monthlySubtotal'
    | 'variableExcluded'
    | 'variableTitle'
    | 'projection'
    | 'endDate'
    | 'currentEther'
    | 'days'
    | 'weeks'
    | 'months'
    | 'fromDaily'
    | 'fromWeekly'
    | 'fromMonthly'
    | 'projectedTotal',
    string
  >;
  daily: SourceRow[];
  weekly: SourceRow[];
  monthly: SourceRow[];
  /** Sources variables (exclues des totaux) ; `couponHref` ajoute le lien. */
  variable: { text: string; couponHref?: string; couponLabel?: string }[];
  arena: { options: LadderOption[]; defaultIdx: number };
  guildRaid: { options: LadderOption[]; defaultIdx: number };
  worldBoss: {
    leagues: { name: string; options: LadderOption[]; defaultIdx: number }[];
    defaultLeagueIdx: number;
  };
  singularity: { options: LadderOption[]; defaultIdx: number };
  /** Icône de l'item Ether (résolue serveur). */
  etherIconSrc: string;
}

// Locale FIXE : le rendu serveur (locale du process node) et le client (locale
// du navigateur) doivent produire le même texte — sinon mismatch d'hydratation.
const fmt = (n?: number): string => (n === undefined ? '–' : n.toLocaleString('en-US'));

function EtherAmount({ value, icon }: { value: number; icon: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
      <span className="text-content-strong text-xs font-semibold tabular-nums">{fmt(value)}</span>
      <img src={icon} alt="Ether" className="h-4 w-4 object-contain" width={16} height={16} />
    </span>
  );
}

const TH = 'border-line border px-3 py-2';
const TD = 'border-line border px-3 py-2 align-middle';
const FIELD = 'border-line bg-surface-overlay rounded-md border px-2 text-xs h-8';

function SectionTable({
  title,
  head,
  rows,
  footerLabel,
  footerValues,
}: {
  title: string;
  head: string[];
  rows: (string | number)[][];
  footerLabel: string;
  footerValues: (string | number)[];
}) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <h2 className="text-content-strong mb-2 text-center text-lg font-semibold">{title}</h2>
        <div className="overflow-x-auto">
          <table className="border-line mx-auto w-auto rounded-md border text-center text-sm">
            <thead className="bg-surface-raised">
              <tr>
                {head.map((h, i) => (
                  <th key={i} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="even:bg-surface-raised/40">
                  {r.map((c, j) => (
                    <td key={j} className={cn(TD, j === 0 && 'text-left', 'text-content')}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-surface-raised font-bold">
                <td className={cn(TD, 'text-content-strong text-left')}>{footerLabel}</td>
                {footerValues.map((v, i) => (
                  <td key={i} className={cn(TD, 'text-content-strong')}>
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-line rounded-md border p-3 text-center">
      <div className="text-content-subtle text-xs tracking-wide uppercase">{label}</div>
      <div className="text-content-strong mt-1 font-bold">{value}</div>
    </div>
  );
}

export function EtherCalculator({ model }: { model: CalculatorModel }) {
  const L = model.labels;
  const [arenaIdx, setArenaIdx] = useState(model.arena.defaultIdx);
  const [guildIdx, setGuildIdx] = useState(model.guildRaid.defaultIdx);
  const [leagueIdx, setLeagueIdx] = useState(model.worldBoss.defaultLeagueIdx);
  const [wbIdx, setWbIdx] = useState(
    model.worldBoss.leagues[model.worldBoss.defaultLeagueIdx]?.defaultIdx ?? 0,
  );
  const [singIdx, setSingIdx] = useState(model.singularity.defaultIdx);
  const [target, setTarget] = useState('');
  const [stock, setStock] = useState(0);

  const league = model.worldBoss.leagues[leagueIdx];
  const picked: Record<string, LadderOption | undefined> = {
    arena: model.arena.options[arenaIdx],
    guildRaid: model.guildRaid.options[guildIdx],
    worldBoss: league?.options[wbIdx],
    singularity: model.singularity.options[singIdx],
  };

  /** Montant effectif d'une ligne (palier sélectionné pour les `ranked`). */
  const amountOf = (s: SourceRow): number =>
    s.ranked ? (picked[s.ranked]?.ether ?? s.amount) : s.amount;
  /** Contribution MENSUELLE (moyenne si la source n'a pas lieu chaque mois). */
  const monthlyOf = (s: SourceRow): number => Math.round(amountOf(s) / (s.monthsPerCycle ?? 1));
  /** Libellé effectif (palier sélectionné entre parenthèses, comme en V2). */
  const labelOf = (s: SourceRow): string => {
    if (!s.ranked) return s.label;
    const opt = picked[s.ranked];
    if (!opt) return s.label;
    const tier = s.ranked === 'worldBoss' ? `${league?.name} ${opt.label}` : opt.label;
    return `${s.label} (${tier})`;
  };

  const totals = useMemo(() => {
    const dailyBase = model.daily.reduce((acc, s) => acc + amountOf(s), 0);
    const weeklyFromDaily = model.daily.reduce(
      (acc, s) => acc + amountOf(s) * (s.daysPerWeek ?? 7),
      0,
    );
    const weeklySpike = model.weekly.reduce((acc, s) => acc + amountOf(s), 0);
    const monthlySpike = model.monthly.reduce((acc, s) => acc + monthlyOf(s), 0);
    return {
      dailyBase,
      weeklyFromDaily,
      weeklySpike,
      monthlySpike,
      weeklyTotal: weeklyFromDaily + weeklySpike,
      monthlyTotal: Math.round((weeklyFromDaily * 30) / 7) + weeklySpike * 4 + monthlySpike,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- amountOf dérive des index sélectionnés
  }, [model, arenaIdx, guildIdx, leagueIdx, wbIdx, singIdx]);

  const projection = useMemo(() => {
    if (!target) return undefined;
    const end = new Date(`${target}T23:59:59`);
    const ms = end.getTime() - Date.now();
    const days = Math.max(0, Math.floor(ms / 86400000) + 1);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const fromDaily = Math.round((totals.weeklyFromDaily * days) / 7);
    const fromWeekly = totals.weeklySpike * weeks;
    const fromMonthly = totals.monthlySpike * months;
    return {
      days,
      weeks,
      months,
      fromDaily,
      fromWeekly,
      fromMonthly,
      total: stock + fromDaily + fromWeekly + fromMonthly,
    };
  }, [target, stock, totals]);

  const rankedSummary = [
    `${L.arena}: ${picked.arena?.label}`,
    `${L.guild}: ${picked.guildRaid?.label}`,
    `WB: ${league?.name} ${picked.worldBoss?.label}`,
    `${L.singularity}: ${picked.singularity?.label}`,
  ].join(' · ');

  const select = (
    value: number,
    onChange: (v: number) => void,
    options: LadderOption[],
    width: string,
  ) => (
    <select
      className={cn(FIELD, 'shrink-0', width)}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((opt, i) => (
        <option key={i} value={i}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      {/* Tuiles de synthèse */}
      <div className="flex justify-center">
        <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              [L.dailyIncome, `${fmt(totals.dailyBase)}${L.perDay}`, 'col-span-2 sm:col-span-1'],
              [L.weeklyIncome, fmt(totals.weeklySpike), ''],
              [L.monthlyIncome, fmt(totals.monthlySpike), ''],
              [L.weeklyTotal, fmt(totals.weeklyTotal), ''],
              [L.monthlyTotal, fmt(totals.monthlyTotal), ''],
            ] as const
          ).map(([label, value, extra], i) => (
            <div
              key={i}
              className={cn(
                'border-line bg-surface-raised/60 rounded-2xl border p-4 text-center',
                extra,
              )}
            >
              <div className="text-content-subtle text-xs">{label}</div>
              <div className="text-content-strong mt-1 text-lg font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ajustements de rang */}
      <details className="border-line mx-auto max-w-3xl rounded-xl border">
        <summary className="text-content cursor-pointer px-3 py-2 text-xs select-none">
          <span className="font-medium">{L.advancedAdjustments}</span>
          <br />
          <span className="text-content-subtle ml-2 inline-block align-middle text-[11px]">
            ({rankedSummary})
          </span>
        </summary>
        <div className="space-y-3 px-3 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-content-subtle w-16 shrink-0 whitespace-nowrap">{L.arena}</span>
            {select(arenaIdx, setArenaIdx, model.arena.options, 'w-40 min-w-36')}
            <EtherAmount value={picked.arena?.ether ?? 0} icon={model.etherIconSrc} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-content-subtle w-16 shrink-0 whitespace-nowrap">{L.guild}</span>
            {select(guildIdx, setGuildIdx, model.guildRaid.options, 'w-44 min-w-40')}
            <EtherAmount value={picked.guildRaid?.ether ?? 0} icon={model.etherIconSrc} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-content-subtle w-16 shrink-0 whitespace-nowrap">
              {L.worldBoss}
            </span>
            <select
              className={cn(FIELD, 'w-28 shrink-0')}
              value={leagueIdx}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setLeagueIdx(idx);
                setWbIdx(model.worldBoss.leagues[idx]?.defaultIdx ?? 0);
              }}
            >
              {model.worldBoss.leagues.map((lg, i) => (
                <option key={i} value={i}>
                  {lg.name}
                </option>
              ))}
            </select>
            {league && select(wbIdx, setWbIdx, league.options, 'w-28 min-w-20')}
            <EtherAmount value={picked.worldBoss?.ether ?? 0} icon={model.etherIconSrc} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-content-subtle w-16 shrink-0 whitespace-nowrap">
              {L.singularity}
            </span>
            {select(singIdx, setSingIdx, model.singularity.options, 'w-44 min-w-40')}
            <EtherAmount value={picked.singularity?.ether ?? 0} icon={model.etherIconSrc} />
          </div>
        </div>
      </details>

      {/* Tables */}
      <SectionTable
        title={L.tableDaily}
        head={[L.source, L.daily, L.weeklyApprox, L.monthlyApprox, L.notes]}
        rows={model.daily.map((s) => {
          const amount = amountOf(s);
          const dpw = s.daysPerWeek ?? 7;
          return [
            labelOf(s),
            fmt(amount),
            fmt(amount * dpw),
            fmt(Math.round((amount * dpw * 30) / 7)),
            s.note,
          ];
        })}
        footerLabel={L.dailySubtotal}
        footerValues={[
          fmt(totals.dailyBase),
          fmt(totals.weeklyFromDaily),
          fmt(Math.round((totals.weeklyFromDaily * 30) / 7)),
        ]}
      />
      <SectionTable
        title={L.tableWeekly}
        head={[L.source, L.weekly, L.monthlyApprox4, L.notes]}
        rows={model.weekly.map((s) => [labelOf(s), fmt(amountOf(s)), fmt(amountOf(s) * 4), s.note])}
        footerLabel={L.weeklySubtotal}
        footerValues={[fmt(totals.weeklySpike), fmt(totals.weeklySpike * 4)]}
      />
      <SectionTable
        title={L.tableMonthly}
        head={[L.source, L.monthly, L.notes]}
        rows={model.monthly.map((s) => [labelOf(s), fmt(monthlyOf(s)), s.note])}
        footerLabel={L.monthlySubtotal}
        footerValues={[fmt(totals.monthlySpike)]}
      />

      {/* Variables (exclues) */}
      <details className="border-line mx-auto w-full max-w-3xl rounded-xl border">
        <summary className="text-content cursor-pointer px-4 py-2 text-sm select-none">
          {L.variableExcluded}
        </summary>
        <div className="p-3 text-sm">
          <div className="border-line rounded-2xl border p-4">
            <div className="text-content-strong mb-2 font-medium">{L.variableTitle}</div>
            <ul className="text-content list-disc space-y-1 pl-5">
              {model.variable.map((item, i) => (
                <li key={i}>
                  {item.text}
                  {item.couponHref && (
                    <>
                      {' — '}
                      <a href={item.couponHref} className="text-rose-400 underline">
                        {item.couponLabel}
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      {/* Projection */}
      <div className="flex justify-center">
        <div className="border-line w-full max-w-3xl rounded-2xl border p-4">
          <div className="text-content-strong mb-2 text-center font-semibold">{L.projection}</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-content text-sm">
              {L.endDate}
              <input
                type="date"
                className={cn(FIELD, 'mt-1 h-auto w-full p-2')}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>
            <label className="text-content text-sm">
              {L.currentEther}
              <input
                type="number"
                className={cn(FIELD, 'mt-1 h-auto w-full p-2')}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value || 0))}
              />
            </label>
            <div className="flex items-end text-sm">
              <div className={cn(FIELD, 'text-content h-auto w-full p-3')}>
                {L.daily}: {fmt(totals.dailyBase)} <br /> {L.weekly}: {fmt(totals.weeklySpike)}{' '}
                <br /> {L.monthly}: {fmt(totals.monthlySpike)}
              </div>
            </div>
          </div>
          {projection && (
            <div className="mt-3 text-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <Stat label={L.days} value={fmt(projection.days)} />
                <Stat label={L.weeks} value={fmt(projection.weeks)} />
                <Stat label={L.months} value={fmt(projection.months)} />
                <Stat label={L.fromDaily} value={fmt(projection.fromDaily)} />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat label={L.fromWeekly} value={fmt(projection.fromWeekly)} />
                <Stat label={L.fromMonthly} value={fmt(projection.fromMonthly)} />
                <Stat label={L.projectedTotal} value={fmt(projection.total)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
