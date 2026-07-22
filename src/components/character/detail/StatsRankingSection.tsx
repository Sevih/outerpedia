'use client';

/**
 * Stats & Ranking (portage V2 + contrôles) : table des stats par palier de
 * niveau (sélecteur d'évolutions) avec les couches optionnelles du jeu —
 * transcendance, codex, quirks (formule CalcFinalStat du client) — le delta
 * vs la portion blanche en ambre, coût du limit break ; colonne droite =
 * tiers éditoriaux (PvE/PvP/EE) + gifts.
 */
import { useState } from 'react';
import { img } from '@/lib/images';
import { STAT_ICON } from '@/lib/stats';
import { ItemInline } from '@/components/inline/ItemInline';
import { StatInline } from '@/components/inline/StatInline';
import { useTranscendTier } from './TranscendTierContext';
import { calcNoGearBattlePower } from '@/lib/combat-power';
import {
  composeStep,
  PERCENT_STEP_KEYS,
  STEP_STAT_KEYS,
  type StatLayersView,
  type StatStepView,
  type StepStatKey,
} from '@/lib/stat-compose';
import type { GiftView } from '@/lib/data/char-progression';

export interface StatsRankingLabels {
  title: string;
  limitBreakCost: string;
  noData: string;
  ranking: string;
  pve: string;
  pvp: string;
  eeRank: string;
  eeRank10: string;
  gifts: string;
  comingSoon: string;
  transcend: string;
  codex: string;
  quirks: string;
  /** Tooltip du CP (l'infobulle explique le contexte du calcul). */
  cpTitle: string;
}

export interface TierEntry {
  label: string;
  rank?: string;
}

export function StatsRankingSection({
  steps,
  layers,
  baseStar,
  fused,
  statMeta,
  recallItems,
  tiers,
  gifts,
  labels,
}: {
  steps: StatStepView[];
  /** Couches optionnelles (transcendance / codex / quirks), résolues côté serveur. */
  layers: StatLayersView;
  /** Rareté de base (étoiles sans transcendance) — terme étoiles du CP. */
  baseStar: number;
  /** Core Fusion active (+5000 CP in-game). */
  fused: boolean;
  /** Nom COMPLET officiel + description du jeu par stat (pré-localisés). */
  statMeta: Record<StepStatKey, { name: string; desc?: string }>;
  /** Id d'item de rappel → vue (icône/nom), résolu côté serveur. */
  recallItems: Record<string, GiftView>;
  tiers: TierEntry[];
  gifts: GiftView[];
  labels: StatsRankingLabels;
}) {
  const [idx, setIdx] = useState(Math.max(0, steps.length - 1));
  // Palier de transcendance : PILOTÉ par le TranscendSlider (contexte partagé).
  const shared = useTranscendTier();
  const tierIdx = Math.min(shared?.idx ?? layers.transcend.length - 1, layers.transcend.length - 1);
  const [codexLevel, setCodexLevel] = useState(layers.codex.length - 1);
  const [quirksOn, setQuirksOn] = useState(true);
  const step = steps[Math.min(idx, steps.length - 1)];
  const composed = step ? composeStep(step, layers, { tierIdx, codexLevel, quirksOn }) : undefined;

  // Combat Power SANS équipement (CalcBattlePower, gear zéroé) sur les stats
  // AFFICHÉES (palier + couches actives) — skills supposés Lv5, étoiles du
  // palier de transcendance sélectionné (« 5+ » → 5 étoiles, +1).
  const tierLabel = tierIdx >= 0 ? layers.transcend[tierIdx]?.label : undefined;
  const cp = composed
    ? calcNoGearBattlePower({
        atk: composed.ATK.value,
        def: composed.DEF.value,
        hp: composed.HP.value,
        spd: composed.SPD.value,
        critRate: composed.CHC.value,
        critDmg: composed.CHD.value,
        eff: composed.EFF.value,
        effRes: composed.RES.value,
        pen: composed['PEN%'].value,
        dmgUp: composed['DMG UP%'].value,
        dmgReduce: composed['DMG RED%'].value,
        critDmgReduce: composed['CDMG RED%'].value,
        showUIStar: tierLabel ? parseInt(tierLabel, 10) || baseStar : baseStar,
        starPlus: tierLabel ? (tierLabel.match(/\+/g)?.length ?? 0) : 0,
        skills: { first: 5, second: 5, ultimate: 5, chainPassive: 5 },
        fused,
      })
    : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
      {/* Base Stats */}
      <div className="card rounded-xl p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-300 uppercase">
            {labels.title}
          </h3>
          <span className="flex items-center gap-3">
            {cp !== undefined && (
              <span
                className="flex items-center gap-1 font-mono text-sm text-zinc-100 tabular-nums"
                title={labels.cpTitle}
              >
                <img
                  src={img.power()}
                  alt="CP"
                  className="h-4 w-4 object-contain"
                  width={16}
                  height={16}
                />
                {cp.toLocaleString('en')}
              </span>
            )}
            {step && <span className="text-xs text-zinc-400">Lv.{step.level}</span>}
          </span>
        </div>

        {!step ? (
          <p className="text-sm text-zinc-500">{labels.noData}</p>
        ) : (
          <>
            {/* Table des stats (valeur composée + delta des couches en ambre) */}
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {STEP_STAT_KEYS.map((key) => {
                const c = composed![key];
                const pct = PERCENT_STEP_KEYS.has(key);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between border-b border-white/6 py-2 text-sm"
                  >
                    <StatInline
                      name={statMeta[key]?.name ?? key}
                      iconSrc={STAT_ICON[key] ? img.statIcon(STAT_ICON[key]) : undefined}
                      desc={statMeta[key]?.desc}
                      color="text-zinc-400"
                      size={16}
                    />
                    <span className="font-mono text-zinc-100 tabular-nums">
                      {c.value}
                      {pct ? '%' : ''}
                      {c.delta > 0 && (
                        <span className="ml-1 text-xs text-amber-300">
                          (+{c.delta}
                          {pct ? '%' : ''})
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Couches optionnelles : codex / quirks (la transcendance suit le
                slider de la section Transcendence) */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              {layers.transcend.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="tracking-wider text-zinc-500 uppercase">{labels.transcend}</span>
                  <span className="font-mono text-amber-300">
                    {layers.transcend[tierIdx]?.label ?? '—'}★
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="tracking-wider text-zinc-500 uppercase">{labels.codex}</span>
                <select
                  value={codexLevel}
                  onChange={(e) => setCodexLevel(Number(e.target.value))}
                  className="rounded border border-white/10 bg-slate-900/60 px-1 py-0.5 font-mono text-zinc-200"
                >
                  {layers.codex.map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="tracking-wider text-zinc-500 uppercase">{labels.quirks}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={quirksOn}
                  onClick={() => setQuirksOn((v) => !v)}
                  className={`rounded border px-1.5 py-0.5 font-mono ${
                    quirksOn
                      ? 'border-amber-400/40 bg-amber-400/20 text-amber-300'
                      : 'border-white/10 text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  {quirksOn ? 'ON' : 'OFF'}
                </button>
              </span>
            </div>

            {/* Sélecteur de paliers (onglets d'évolution du jeu, sous la table — V2) */}
            <div className="mt-4 flex flex-wrap justify-between gap-1">
              {steps.map((s, i) => {
                const on = i === idx;
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setIdx(i)}
                    aria-label={`Lv.${s.level}`}
                    className={`flex flex-col items-center gap-0.5 transition-opacity ${
                      on ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    <span className="relative h-8 w-8">
                      <img
                        src={img.evoTab(false)}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                      {on && (
                        <img
                          src={img.evoTab(true)}
                          alt=""
                          aria-hidden
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      )}
                    </span>
                    <span
                      className={`text-[10px] leading-none ${on ? 'text-amber-300' : 'text-zinc-400'}`}
                    >
                      Lv.{s.level}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Coût du limit break de ce palier (cadre centré — V2) */}
            {step.limitBreak && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200">
                <span className="font-semibold text-zinc-300">{labels.limitBreakCost}</span>
                {recallItems[step.limitBreak.recallItemId] && (
                  <span className="flex items-center gap-1.5">
                    <ItemInline
                      item={{
                        name: recallItems[step.limitBreak.recallItemId].name,
                        iconSrc: img.item(recallItems[step.limitBreak.recallItemId].icon),
                        grade: recallItems[step.limitBreak.recallItemId].grade,
                        desc: recallItems[step.limitBreak.recallItemId].desc,
                      }}
                      size={28}
                      iconOnly
                    />
                    <span className="text-zinc-100">×{step.limitBreak.pieces}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <img
                    src={img.gold()}
                    alt="Gold"
                    className="h-5 w-5 object-contain"
                    width={20}
                    height={20}
                  />
                  <span className="text-zinc-100">
                    {step.limitBreak.price.toLocaleString('en')}
                  </span>
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ranking + Gifts */}
      <div className="flex flex-col gap-4">
        <div className="card rounded-xl p-4">
          <h3 className="mb-3 font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-300 uppercase">
            {labels.ranking}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {tiers.map((tc) => (
              <div
                key={tc.label}
                className="flex flex-col items-center gap-1 rounded-lg border border-white/6 bg-slate-900/40 p-3"
              >
                <span className="text-[10px] tracking-wider text-zinc-400 uppercase">
                  {tc.label}
                </span>
                {tc.rank ? (
                  <img
                    src={img.rank(tc.rank)}
                    alt={tc.rank}
                    className="h-12 w-12"
                    width={48}
                    height={48}
                  />
                ) : (
                  <span className="text-xs text-zinc-600">{labels.comingSoon}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {gifts.length > 0 && (
          <div className="card rounded-xl p-4">
            <h3 className="mb-3 font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-300 uppercase">
              {labels.gifts}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {gifts.map((g) => (
                <div key={g.id} className="flex flex-col items-center gap-1">
                  <ItemInline
                    item={{ name: g.name, iconSrc: img.item(g.icon), grade: g.grade, desc: g.desc }}
                    size={48}
                    iconOnly
                  />
                  <span className="w-full text-center text-[10px] leading-tight text-zinc-400">
                    {g.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
