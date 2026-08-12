'use client';

import { useCallback, useMemo, useState } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { useStoredState, type StoreSpec } from '@/lib/client-storage';
import {
  accountNeed,
  foodBreakdown,
  giftBreakdown,
  hasWork,
  heroNeed,
  type GrowthRules,
  type HeroProgress,
  type TrackedHero,
  type TranscendCost,
} from './engine';

/**
 * Suivi de compte — écran CLIENT. L'état vit dans le localStorage (aucun
 * compte, aucune écriture serveur) ; le calcul est délégué au moteur pur voisin.
 *
 * Le roster est affiché EN ENTIER : un héros absent de l'état n'est pas suivi
 * (décision Sevih — on repère ainsi ce qu'on a laissé en friche), et la présence
 * de sa clé dans l'état VAUT suivi.
 */

export interface HeroRow {
  id: string;
  slug: string;
  name: string;
  element: string;
  class: string;
  rarity: number;
  /** Type de cadeau préféré (`present_01`…) — oriente la conversion en cadeaux. */
  gift?: string;
  searchNames: string[];
}

export interface ItemAsset {
  name: string;
  icon: string;
  grade: string;
}

export interface HeroTrackerLabels {
  intro: string;
  search: string;
  trackedOnly: string;
  track: string;
  untrack: string;
  current: string;
  target: string;
  level: string;
  skills: string;
  affinity: string;
  transcend: string;
  ee: string;
  needTitle: string;
  needEmpty: string;
  gold: string;
  xp: string;
  affinityPoints: string;
  fragments: string;
  giftNote: string;
  reset: string;
  resetConfirm: string;
  trackedCount: string;
}

export interface HeroTrackerData {
  heroes: HeroRow[];
  rules: Omit<GrowthRules, 'transcendLadder'>;
  /** Échelles de transcendance : barème par rareté + paliers propres à un héros. */
  transcend: {
    byStar: Record<string, TranscendCost[]>;
    overrides: Record<string, TranscendCost[]>;
  };
  /** Items référencés par les coûts (manuels, mémoires, matériaux EE). */
  items: Record<string, ItemAsset>;
  labels: HeroTrackerLabels;
}

/** Ce que l'utilisateur saisit pour un héros suivi. */
interface HeroEntry {
  state: HeroProgress;
  target: HeroProgress;
}

type TrackerState = Record<string, HeroEntry>;

const SPEC: StoreSpec<TrackerState> = {
  key: 'outerpedia:hero-tracker',
  version: 1,
  fallback: {},
};

const SKILL_SLOTS = 3;
const MAX_SKILL = 5;

/**
 * Défauts d'un héros qu'on commence à suivre. La CIBLE ne vise pas le maximum
 * partout : niveau 100 (le palier avant le limit break, qui coûte des mémoires),
 * skills au max — le vrai levier de puissance —, affinité 20 (premier palier de
 * stats). Transcendance et EE partent ÉGALES à l'état : elles dépendent du gacha,
 * s'en fixer une cible d'office afficherait un besoin que personne n'a demandé.
 */
function defaultEntry(): HeroEntry {
  const state: HeroProgress = {
    level: 1,
    skills: Array(SKILL_SLOTS).fill(1),
    affinity: 1,
    transcend: 0,
    ee: 0,
  };
  return {
    state,
    target: { ...state, level: 100, skills: Array(SKILL_SLOTS).fill(MAX_SKILL), affinity: 20 },
  };
}

export function HeroTrackerBrowser({ heroes, rules, transcend, items, labels }: HeroTrackerData) {
  const [tracked, setTracked, ready] = useStoredState(SPEC);
  const [query, setQuery] = useState('');
  const [onlyTracked, setOnlyTracked] = useState(false);

  const ladder = useCallback(
    (hero: TrackedHero): TranscendCost[] =>
      transcend.overrides[hero.id] ?? transcend.byStar[String(hero.rarity)] ?? [],
    [transcend],
  );

  const fullRules: GrowthRules = useMemo(
    () => ({ ...rules, transcendLadder: ladder }),
    [rules, ladder],
  );

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      heroes.filter(
        (h) =>
          (!onlyTracked || tracked[h.id]) &&
          (!q || h.searchNames.some((n) => n.toLowerCase().includes(q))),
      ),
    [heroes, tracked, onlyTracked, q],
  );

  const total = useMemo(() => {
    const needs = heroes
      .filter((h) => tracked[h.id])
      .map((h) =>
        heroNeed(
          { id: h.id, rarity: h.rarity, element: h.element },
          tracked[h.id].state,
          tracked[h.id].target,
          fullRules,
        ),
      );
    return accountNeed(needs);
  }, [heroes, tracked, fullRules]);

  const trackedIds = Object.keys(tracked);
  const heroById = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes]);

  const update = (id: string, side: 'state' | 'target', patch: Partial<HeroProgress>) =>
    setTracked((prev) => {
      const entry = prev[id] ?? defaultEntry();
      return { ...prev, [id]: { ...entry, [side]: { ...entry[side], ...patch } } };
    });

  const toggle = (id: string) =>
    setTracked((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: defaultEntry() };
    });

  // Les plats et cadeaux ne sont pas des coûts stockés : ce sont des CONVERSIONS
  // de l'XP et des points, faites à l'affichage.
  const food = foodBreakdown(total.xp, rules.xpFood);

  return (
    <div className="space-y-6" aria-busy={!ready}>
      <p className="text-content-muted text-sm">{labels.intro}</p>

      {/* ── Ce qu'il reste à farmer ── */}
      <section className="border-line-subtle bg-surface-raised rounded-lg border p-4">
        <h2 className="text-content-strong text-lg font-semibold">{labels.needTitle}</h2>
        {total.heroes.length === 0 ? (
          <p className="text-content-subtle mt-2 text-sm">{labels.needEmpty}</p>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(total.items)
                .sort((a, b) => b[1] - a[1])
                .map(([id, count]) => (
                  <ItemChip key={id} asset={items[id]} count={count} />
                ))}
              {food.map((b) => (
                <ItemChip
                  key={b.entry.id}
                  asset={{ name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade }}
                  count={b.count}
                />
              ))}
            </div>

            <dl className="text-content-muted flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {total.xp > 0 && <Stat label={labels.xp} value={total.xp.toLocaleString('en-US')} />}
              {total.affinityPoints > 0 && (
                <Stat
                  label={labels.affinityPoints}
                  value={total.affinityPoints.toLocaleString('en-US')}
                />
              )}
              {total.gold > 0 && (
                <Stat label={labels.gold} value={total.gold.toLocaleString('en-US')} />
              )}
            </dl>

            {total.affinityPoints > 0 && (
              <p className="text-content-subtle text-xs">{labels.giftNote}</p>
            )}

            {Object.keys(total.fragments).length > 0 && (
              <div>
                <h3 className="text-content-strong text-sm font-semibold">{labels.fragments}</h3>
                <ul className="text-content-muted mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {Object.entries(total.fragments).map(([heroId, count]) => (
                    <li key={heroId}>
                      {heroById.get(heroId)?.name ?? heroId} : <strong>{count}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Barre ── */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          className="border-line bg-surface-raised text-content-strong placeholder:text-content-subtle focus:border-accent w-full max-w-xs rounded-md border px-3 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setOnlyTracked((v) => !v)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            onlyTracked
              ? 'border-accent bg-accent/15 text-content-strong'
              : 'border-line text-content-muted hover:bg-line/50'
          }`}
        >
          {labels.trackedOnly}
        </button>
        <span className="text-content-subtle text-xs">
          {labels.trackedCount.replace('{count}', String(trackedIds.length))}
        </span>
        {trackedIds.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(labels.resetConfirm)) setTracked({});
            }}
            className="border-line text-content-muted hover:border-accent ml-auto rounded border px-2 py-1 text-xs transition-colors"
          >
            {labels.reset}
          </button>
        )}
      </div>

      {/* ── Roster ── */}
      <ul className="grid gap-3 md:grid-cols-2">
        {visible.map((hero) => {
          const entry = tracked[hero.id];
          const need = entry
            ? heroNeed(
                { id: hero.id, rarity: hero.rarity, element: hero.element },
                entry.state,
                entry.target,
                fullRules,
              )
            : null;
          return (
            <li
              key={hero.id}
              className={`border-line-subtle bg-surface-raised rounded-lg border p-3 ${
                entry ? '' : 'opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 shrink-0">
                  <CharacterPortrait
                    id={hero.id}
                    name={hero.name}
                    element={hero.element}
                    classType={hero.class}
                    rarity={hero.rarity}
                    size={48}
                    showName={false}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-content-strong truncate text-sm font-semibold">
                      {hero.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(hero.id)}
                      className="border-line text-content-muted hover:border-accent shrink-0 rounded border px-2 py-0.5 text-xs transition-colors"
                    >
                      {entry ? labels.untrack : labels.track}
                    </button>
                  </div>

                  {entry && (
                    <div className="mt-2 space-y-1.5">
                      <div className="text-content-subtle grid grid-cols-[5rem_1fr_1fr] gap-2 text-[10px] uppercase">
                        <span />
                        <span>{labels.current}</span>
                        <span>{labels.target}</span>
                      </div>
                      <AxisRow
                        label={labels.level}
                        min={1}
                        max={rules.xpCurve.length}
                        state={entry.state.level}
                        target={entry.target.level}
                        onState={(v) => update(hero.id, 'state', { level: v })}
                        onTarget={(v) => update(hero.id, 'target', { level: v })}
                      />
                      <SkillsRow
                        label={labels.skills}
                        entry={entry}
                        onChange={(side, skills) => update(hero.id, side, { skills })}
                      />
                      <AxisRow
                        label={labels.affinity}
                        min={1}
                        max={rules.affinityCurve.length}
                        state={entry.state.affinity}
                        target={entry.target.affinity}
                        onState={(v) => update(hero.id, 'state', { affinity: v })}
                        onTarget={(v) => update(hero.id, 'target', { affinity: v })}
                      />
                      <AxisRow
                        label={labels.transcend}
                        min={0}
                        max={Math.max(
                          ladder({ id: hero.id, rarity: hero.rarity, element: hero.element })
                            .length - 1,
                          0,
                        )}
                        state={entry.state.transcend}
                        target={entry.target.transcend}
                        onState={(v) => update(hero.id, 'state', { transcend: v })}
                        onTarget={(v) => update(hero.id, 'target', { transcend: v })}
                      />
                      <AxisRow
                        label={labels.ee}
                        min={0}
                        max={rules.eeEnchant.length}
                        state={entry.state.ee}
                        target={entry.target.ee}
                        onState={(v) => update(hero.id, 'state', { ee: v })}
                        onTarget={(v) => update(hero.id, 'target', { ee: v })}
                      />

                      {need && hasWork(need) && (
                        <HeroNeedSummary
                          need={need}
                          items={items}
                          gifts={rules.gifts}
                          giftType={hero.gift}
                          labels={labels}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <dt className="text-content-subtle inline">{label} </dt>
      <dd className="text-content-strong inline font-semibold">{value}</dd>
    </span>
  );
}

function ItemChip({ asset, count }: { asset?: ItemAsset; count: number }) {
  if (!asset) return null;
  return (
    <span className="border-line bg-surface-sunken text-content-strong flex items-center gap-1.5 rounded border px-2 py-1 text-xs">
      <span className="truncate">{asset.name}</span>
      <strong>×{count.toLocaleString('en-US')}</strong>
    </span>
  );
}

/** Une ligne « axe : actuel → cible » (deux champs numériques bornés). */
function AxisRow({
  label,
  min,
  max,
  state,
  target,
  onState,
  onTarget,
}: {
  label: string;
  min: number;
  max: number;
  state: number;
  target: number;
  onState: (v: number) => void;
  onTarget: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[5rem_1fr_1fr] items-center gap-2">
      <span className="text-content-muted text-xs">{label}</span>
      <NumberField value={state} min={min} max={max} onChange={onState} />
      <NumberField value={target} min={min} max={max} onChange={onTarget} />
    </div>
  );
}

function SkillsRow({
  label,
  entry,
  onChange,
}: {
  label: string;
  entry: HeroEntry;
  onChange: (side: 'state' | 'target', skills: number[]) => void;
}) {
  const set = (side: 'state' | 'target', i: number, v: number) => {
    const next = [...entry[side].skills];
    next[i] = v;
    onChange(side, next);
  };
  return (
    <div className="grid grid-cols-[5rem_1fr_1fr] items-center gap-2">
      <span className="text-content-muted text-xs">{label}</span>
      {(['state', 'target'] as const).map((side) => (
        <div key={side} className="flex gap-1">
          {Array.from({ length: SKILL_SLOTS }, (_, i) => (
            <NumberField
              key={i}
              value={entry[side].skills[i] ?? 1}
              min={1}
              max={MAX_SKILL}
              onChange={(v) => set(side, i, v)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function NumberField({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const v = Number(e.target.value);
        // Le moteur borne déjà, mais un champ qui garde une valeur hors plage
        // ferait mentir l'écran par rapport au calcul.
        if (Number.isFinite(v)) onChange(Math.min(Math.max(Math.trunc(v), min), max));
      }}
      className="border-line bg-surface-sunken text-content-strong focus:border-accent w-full min-w-0 rounded border px-1.5 py-0.5 text-center text-xs outline-none"
    />
  );
}

/** Résumé compact de ce qui manque à CE héros. */
function HeroNeedSummary({
  need,
  items,
  gifts,
  giftType,
  labels,
}: {
  need: ReturnType<typeof heroNeed>;
  items: Record<string, ItemAsset>;
  gifts: GrowthRules['gifts'];
  giftType?: string;
  labels: HeroTrackerLabels;
}) {
  const giftPlan = giftBreakdown(need.affinityPoints, gifts, giftType);
  return (
    <div className="border-line-subtle mt-2 flex flex-wrap gap-1.5 border-t pt-2 text-[11px]">
      {Object.entries(need.items).map(([id, count]) => (
        <span key={id} className="text-content-muted">
          {items[id]?.name ?? id} ×{count}
        </span>
      ))}
      {giftPlan.map((b) => (
        <span key={b.entry.id} className="text-content-muted">
          {b.entry.name.en} ×{b.count}
        </span>
      ))}
      {need.fragments > 0 && (
        <span className="text-content-muted">
          {labels.fragments} ×{need.fragments}
        </span>
      )}
    </div>
  );
}
