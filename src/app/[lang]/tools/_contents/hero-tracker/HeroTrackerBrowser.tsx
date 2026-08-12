'use client';

import { useCallback, useMemo, useState } from 'react';
import type { FusionLevelStep } from '@datagen/generators/hero-growth';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { useStoredState, type StoreSpec } from '@/lib/client-storage';
import {
  accountNeed,
  foodBreakdown,
  giftBreakdown,
  hasWork,
  heroNeed,
  type GrowthRules,
  type HeroNeed,
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

/** Un palier de transcendance tel qu'il s'AFFICHE (l'étoile du jeu, pas l'index). */
export interface TranscendStep extends TranscendCost {
  /** Étoiles pleines affichées en jeu (1→6). */
  showStar: number;
  /** Petits « + » au-delà de l'étoile pleine (4★+1…). */
  starPlus: number;
}

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
  /** Paliers de Core Fusion si CE héros est un fusionné. */
  fusionLevels?: FusionLevelStep[];
  /** Le fusionné qui remplace ce héros de base, si le jeu en propose un. */
  fusionId?: string;
  /** Le héros de base dont ce fusionné est issu. */
  baseId?: string;
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
  fusionLevel: string;
  affinity: string;
  transcend: string;
  ee: string;
  eeFusion: string;
  needTitle: string;
  needEmpty: string;
  gold: string;
  xp: string;
  affinityPoints: string;
  pieces: string;
  dupes: string;
  giftNote: string;
  giftNoteBonus: string;
  reset: string;
  resetConfirm: string;
  trackedCount: string;
  settings: string;
  settingsFusion: string;
  settingsFusionHint: string;
  base: string;
  coreFusion: string;
  preferredGift: string;
  alwaysMax: string;
}

export interface HeroTrackerData {
  heroes: HeroRow[];
  rules: Omit<GrowthRules, 'transcendLadder'>;
  /** Échelles de transcendance : barème par rareté + paliers propres à un héros. */
  transcend: {
    byStar: Record<string, TranscendStep[]>;
    overrides: Record<string, TranscendStep[]>;
  };
  /** Items référencés par les coûts (manuels, mémoires, matériaux EE, cores). */
  items: Record<string, ItemAsset>;
  labels: HeroTrackerLabels;
}

/** Ce que l'utilisateur saisit pour un héros suivi. */
interface HeroEntry {
  state: HeroProgress;
  target: HeroProgress;
}

interface TrackerState {
  heroes: Record<string, HeroEntry>;
  /** id du héros de BASE → on possède sa Core Fusion plutôt que lui. */
  fused: Record<string, boolean>;
  /** Compter les cadeaux au tarif du cadeau PRÉFÉRÉ (+50 %). */
  preferredGift: boolean;
  /** Tout viser au maximum : les cibles ne se saisissent plus, l'écran s'allège. */
  alwaysMax: boolean;
}

/** Schéma v1 : les entrées à plat, un seul EE, trois slots de skill. */
interface LegacyEntry {
  state: Omit<HeroProgress, 'ee' | 'fusion'> & { ee: number };
  target: Omit<HeroProgress, 'ee' | 'fusion'> & { ee: number };
}

const SKILL_SLOTS = 4;
const MAX_SKILL = 5;
/** Un héros se recrute au niveau 5 : rien en dessous n'existe en jeu. */
const START_LEVEL = 5;
/** Bonus du cadeau préféré, curé dans le guide heroes-growth (aucune table). */
const PREFERRED_GIFT_BONUS = 0.5;

const SPEC: StoreSpec<TrackerState> = {
  key: 'outerpedia:hero-tracker',
  version: 2,
  fallback: { heroes: {}, fused: {}, preferredGift: false, alwaysMax: false },
  // v1 ignorait la chain passive, les Core Fusion et le second EE. Une saisie
  // déjà faite vaut mieux qu'un écran remis à zéro : on la relève.
  migrate: (data, from) => {
    if (from !== 1 || typeof data !== 'object' || data === null) return undefined;
    const lift = (p: LegacyEntry['state']): HeroProgress => ({
      level: p.level,
      skills: Array.from({ length: SKILL_SLOTS }, (_, i) => p.skills?.[i] ?? 1),
      fusion: 0,
      affinity: p.affinity,
      transcend: p.transcend,
      ee: [p.ee ?? 0],
    });
    const heroes: Record<string, HeroEntry> = {};
    for (const [id, e] of Object.entries(data as Record<string, LegacyEntry>)) {
      if (!e?.state || !e?.target) continue;
      heroes[id] = { state: lift(e.state), target: lift(e.target) };
    }
    return { heroes, fused: {}, preferredGift: false, alwaysMax: false };
  },
};

export function HeroTrackerBrowser({ heroes, rules, transcend, items, labels }: HeroTrackerData) {
  const [store, setStore, ready] = useStoredState(SPEC);
  const [query, setQuery] = useState('');
  const [onlyTracked, setOnlyTracked] = useState(false);

  const tracked = store.heroes;

  const heroById = useMemo(() => new Map(heroes.map((h) => [h.id, h])), [heroes]);

  const ladder = useCallback(
    (hero: TrackedHero): TranscendStep[] =>
      transcend.overrides[hero.id] ?? transcend.byStar[String(hero.rarity)] ?? [],
    [transcend],
  );

  const fullRules: GrowthRules = useMemo(
    () => ({ ...rules, transcendLadder: ladder }),
    [rules, ladder],
  );

  /** La forme d'un héros pour le moteur — c'est ELLE qui porte le régime de fusion. */
  const asTracked = useCallback(
    (h: HeroRow): TrackedHero => ({
      id: h.id,
      rarity: h.rarity,
      element: h.element,
      ...(h.fusionLevels ? { fusionLevels: h.fusionLevels } : {}),
    }),
    [],
  );

  /**
   * Un couple base/fusion ne se possède JAMAIS entier : la version non retenue
   * disparaît du roster (règle du jeu, réglable dans les settings).
   */
  const hidden = useMemo(() => {
    const out = new Set<string>();
    for (const h of heroes) {
      if (!h.fusionId) continue;
      out.add(store.fused[h.id] ? h.id : h.fusionId);
    }
    return out;
  }, [heroes, store.fused]);

  const fusionPairs = useMemo(
    () =>
      heroes
        .filter((h) => h.fusionId)
        .map((h) => ({ base: h, fusion: heroById.get(h.fusionId as string) }))
        .filter((p): p is { base: HeroRow; fusion: HeroRow } => Boolean(p.fusion))
        .sort((a, b) => a.base.name.localeCompare(b.base.name)),
    [heroes, heroById],
  );

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      heroes.filter(
        (h) =>
          !hidden.has(h.id) &&
          (!onlyTracked || tracked[h.id]) &&
          (!q || h.searchNames.some((n) => n.toLowerCase().includes(q))),
      ),
    [heroes, hidden, tracked, onlyTracked, q],
  );

  /**
   * Le PLAFOND de chaque axe pour ce héros — la cible par défaut, et la cible
   * TOUT COURT quand le réglage « toujours viser le max » est actif. Cette
   * surcharge ne TOUCHE PAS les cibles saisies : décocher le réglage les rend.
   */
  const maxTarget = useCallback(
    (hero: HeroRow): HeroProgress => ({
      level: rules.xpCurve.length,
      skills: Array(SKILL_SLOTS).fill(MAX_SKILL),
      fusion: hero.fusionLevels?.length ?? 0,
      affinity: rules.affinityCurve.length,
      transcend: Math.max(ladder(asTracked(hero)).length - 1, 0),
      ee: Array(hero.fusionLevels ? 2 : 1).fill(rules.eeEnchant.length),
    }),
    [rules, ladder, asTracked],
  );

  const needs = useMemo(() => {
    const out = new Map<string, HeroNeed>();
    for (const h of heroes) {
      const entry = tracked[h.id];
      if (!entry || hidden.has(h.id)) continue;
      const target = store.alwaysMax ? maxTarget(h) : entry.target;
      out.set(h.id, heroNeed(asTracked(h), entry.state, target, fullRules));
    }
    return out;
  }, [heroes, tracked, hidden, store.alwaysMax, maxTarget, asTracked, fullRules]);

  const total = useMemo(() => accountNeed([...needs.values()]), [needs]);

  const defaults = useCallback(
    (hero: HeroRow): HeroEntry => ({
      state: {
        level: START_LEVEL,
        skills: Array(SKILL_SLOTS).fill(1),
        fusion: 0,
        affinity: 1,
        transcend: 0,
        ee: Array(hero.fusionLevels ? 2 : 1).fill(0),
      },
      // La cible vise le plafond : c'est la question que pose l'outil (« que me
      // reste-t-il pour finir ce héros ? »), à rabaisser héros par héros.
      target: maxTarget(hero),
    }),
    [maxTarget],
  );

  const update = (hero: HeroRow, side: 'state' | 'target', patch: Partial<HeroProgress>) =>
    setStore((prev) => {
      const entry = prev.heroes[hero.id] ?? defaults(hero);
      return {
        ...prev,
        heroes: { ...prev.heroes, [hero.id]: { ...entry, [side]: { ...entry[side], ...patch } } },
      };
    });

  const toggle = (hero: HeroRow) =>
    setStore((prev) => {
      const next = { ...prev.heroes };
      if (next[hero.id]) delete next[hero.id];
      else next[hero.id] = defaults(hero);
      return { ...prev, heroes: next };
    });

  const trackedIds = Object.keys(tracked).filter((id) => !hidden.has(id));
  const giftBonus = store.preferredGift ? PREFERRED_GIFT_BONUS : 0;
  /** Viser le max partout retire la colonne de cible : plus rien à y saisir. */
  const withTarget = !store.alwaysMax;

  // Les plats et cadeaux ne sont pas des coûts stockés : ce sont des CONVERSIONS
  // de l'XP et des points, faites à l'affichage.
  const food = foodBreakdown(total.xp, rules.xpFood);

  return (
    <div className="space-y-6" aria-busy={!ready}>
      <p className="text-content-muted text-sm">{labels.intro}</p>

      {/* ── Réglages ── */}
      <details className="border-line-subtle bg-surface-raised rounded-lg border">
        <summary className="text-content-strong cursor-pointer px-4 py-2 text-sm font-semibold">
          {labels.settings}
        </summary>
        <div className="space-y-4 px-4 pt-1 pb-4">
          <label className="text-content-muted flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={store.alwaysMax}
              onChange={(e) => setStore((prev) => ({ ...prev, alwaysMax: e.target.checked }))}
              className="accent-accent"
            />
            {labels.alwaysMax}
          </label>
          <label className="text-content-muted flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={store.preferredGift}
              onChange={(e) => setStore((prev) => ({ ...prev, preferredGift: e.target.checked }))}
              className="accent-accent"
            />
            {labels.preferredGift}
          </label>

          <div>
            <h3 className="text-content-strong text-sm font-semibold">{labels.settingsFusion}</h3>
            <p className="text-content-subtle mt-0.5 text-xs">{labels.settingsFusionHint}</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {fusionPairs.map(({ base, fusion }) => {
                const isFused = Boolean(store.fused[base.id]);
                return (
                  <li key={base.id} className="flex items-center justify-between gap-2">
                    <span className="text-content-muted truncate text-sm">{base.name}</span>
                    <span className="flex shrink-0 gap-1">
                      {(
                        [
                          [false, labels.base],
                          [true, labels.coreFusion],
                        ] as const
                      ).map(([value, text]) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() =>
                            setStore((prev) => ({
                              ...prev,
                              fused: { ...prev.fused, [base.id]: value },
                            }))
                          }
                          className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                            isFused === value
                              ? 'border-accent bg-accent/15 text-content-strong'
                              : 'border-line text-content-muted hover:bg-line/50'
                          }`}
                        >
                          {text}
                        </button>
                      ))}
                    </span>
                    <span className="sr-only">{fusion.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </details>

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
              <p className="text-content-subtle text-xs">
                {store.preferredGift ? labels.giftNoteBonus : labels.giftNote}
              </p>
            )}

            {Object.keys(total.pieces).length > 0 && (
              <div>
                <h3 className="text-content-strong text-sm font-semibold">{labels.pieces}</h3>
                <ul className="text-content-muted mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {Object.entries(total.pieces).map(([heroId, { pieces, steps }]) => (
                    <li key={heroId}>
                      {heroById.get(heroId)?.name ?? heroId} : <strong>{pieces}</strong>{' '}
                      <span className="text-content-subtle text-xs">
                        ({labels.dupes.replace('{count}', String(steps))})
                      </span>
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
              if (window.confirm(labels.resetConfirm))
                setStore((prev) => ({ ...prev, heroes: {} }));
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
          const need = needs.get(hero.id);
          const steps = ladder(asTracked(hero));
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
                      {hero.fusionLevels && (
                        <span className="text-accent ml-1 text-[10px] uppercase">
                          {labels.coreFusion}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(hero)}
                      className="border-line text-content-muted hover:border-accent shrink-0 rounded border px-2 py-0.5 text-xs transition-colors"
                    >
                      {entry ? labels.untrack : labels.track}
                    </button>
                  </div>

                  {entry && (
                    <div className="mt-2 space-y-1.5">
                      {withTarget && (
                        <div className="text-content-subtle grid grid-cols-[5rem_1fr_1fr] gap-2 text-[10px] uppercase">
                          <span />
                          <span>{labels.current}</span>
                          <span>{labels.target}</span>
                        </div>
                      )}
                      <AxisRow
                        label={labels.level}
                        min={START_LEVEL}
                        max={rules.xpCurve.length}
                        state={entry.state.level}
                        target={entry.target.level}
                        withTarget={withTarget}
                        onState={(v) => update(hero, 'state', { level: v })}
                        onTarget={(v) => update(hero, 'target', { level: v })}
                      />

                      {hero.fusionLevels ? (
                        // Un fusionné n'a pas de slots : ses skills montent d'un
                        // bloc, le palier 1 étant la fusion elle-même.
                        <AxisRow
                          label={labels.fusionLevel}
                          min={0}
                          max={hero.fusionLevels.length}
                          state={entry.state.fusion}
                          target={entry.target.fusion}
                          withTarget={withTarget}
                          onState={(v) => update(hero, 'state', { fusion: v })}
                          onTarget={(v) => update(hero, 'target', { fusion: v })}
                        />
                      ) : (
                        <SkillsRow
                          label={labels.skills}
                          entry={entry}
                          withTarget={withTarget}
                          onChange={(side, skills) => update(hero, side, { skills })}
                        />
                      )}

                      <AxisRow
                        label={labels.affinity}
                        min={1}
                        max={rules.affinityCurve.length}
                        state={entry.state.affinity}
                        target={entry.target.affinity}
                        withTarget={withTarget}
                        onState={(v) => update(hero, 'state', { affinity: v })}
                        onTarget={(v) => update(hero, 'target', { affinity: v })}
                      />
                      <StarRow
                        label={labels.transcend}
                        steps={steps}
                        state={entry.state.transcend}
                        target={entry.target.transcend}
                        withTarget={withTarget}
                        onState={(v) => update(hero, 'state', { transcend: v })}
                        onTarget={(v) => update(hero, 'target', { transcend: v })}
                      />

                      {entry.state.ee.map((_, i) => (
                        <AxisRow
                          key={i}
                          label={i === 0 ? labels.ee : labels.eeFusion}
                          min={0}
                          max={rules.eeEnchant.length}
                          state={entry.state.ee[i] ?? 0}
                          target={entry.target.ee[i] ?? 0}
                          withTarget={withTarget}
                          onState={(v) =>
                            update(hero, 'state', { ee: replace(entry.state.ee, i, v) })
                          }
                          onTarget={(v) =>
                            update(hero, 'target', { ee: replace(entry.target.ee, i, v) })
                          }
                        />
                      ))}

                      {need && hasWork(need) && (
                        <HeroNeedSummary
                          need={need}
                          items={items}
                          gifts={rules.gifts}
                          giftType={hero.gift}
                          giftBonus={giftBonus}
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

/** Remplace la i-ème valeur d'un axe multiple (les EE d'un fusionné). */
function replace(list: number[], index: number, value: number): number[] {
  const next = [...list];
  next[index] = value;
  return next;
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

/**
 * Grille d'une ligne d'axe. La colonne de cible DISPARAÎT quand on vise le max
 * partout : c'est la moitié des champs de l'écran en moins.
 */
const axisGrid = (withTarget: boolean) =>
  `grid items-center gap-2 ${withTarget ? 'grid-cols-[5rem_1fr_1fr]' : 'grid-cols-[5rem_1fr]'}`;

/** Une ligne « axe : actuel → cible » (deux champs numériques bornés). */
function AxisRow({
  label,
  min,
  max,
  state,
  target,
  withTarget,
  onState,
  onTarget,
}: {
  label: string;
  min: number;
  max: number;
  state: number;
  target: number;
  withTarget: boolean;
  onState: (v: number) => void;
  onTarget: (v: number) => void;
}) {
  return (
    <div className={axisGrid(withTarget)}>
      <span className="text-content-muted text-xs">{label}</span>
      <NumberField value={state} min={min} max={max} onChange={onState} />
      {withTarget && <NumberField value={target} min={min} max={max} onChange={onTarget} />}
    </div>
  );
}

/**
 * Transcendance : on saisit l'ÉTOILE telle qu'elle s'affiche en jeu (« 5★+1 »),
 * pas l'index d'une échelle interne que personne ne lit sur son écran.
 */
function StarRow({
  label,
  steps,
  state,
  target,
  withTarget,
  onState,
  onTarget,
}: {
  label: string;
  steps: TranscendStep[];
  state: number;
  target: number;
  withTarget: boolean;
  onState: (v: number) => void;
  onTarget: (v: number) => void;
}) {
  const select = (value: number, onChange: (v: number) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="border-line bg-surface-sunken text-content-strong focus:border-accent w-full min-w-0 rounded border px-1 py-0.5 text-center text-xs outline-none"
    >
      {steps.map((s, i) => (
        <option key={i} value={i}>
          {s.showStar}★{s.starPlus > 0 ? `+${s.starPlus}` : ''}
        </option>
      ))}
    </select>
  );
  return (
    <div className={axisGrid(withTarget)}>
      <span className="text-content-muted text-xs">{label}</span>
      {select(state, onState)}
      {withTarget && select(target, onTarget)}
    </div>
  );
}

function SkillsRow({
  label,
  entry,
  withTarget,
  onChange,
}: {
  label: string;
  entry: HeroEntry;
  withTarget: boolean;
  onChange: (side: 'state' | 'target', skills: number[]) => void;
}) {
  const set = (side: 'state' | 'target', i: number, v: number) =>
    onChange(side, replace(entry[side].skills, i, v));
  const sides = withTarget ? (['state', 'target'] as const) : (['state'] as const);
  return (
    <div className={axisGrid(withTarget)}>
      <span className="text-content-muted text-xs">{label}</span>
      {sides.map((side) => (
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
  giftBonus,
  labels,
}: {
  need: HeroNeed;
  items: Record<string, ItemAsset>;
  gifts: GrowthRules['gifts'];
  giftType?: string;
  giftBonus: number;
  labels: HeroTrackerLabels;
}) {
  const giftPlan = giftBreakdown(need.affinityPoints, gifts, giftType, giftBonus);
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
      {need.pieces > 0 && (
        <span className="text-content-muted">
          {labels.pieces} ×{need.pieces}{' '}
          <span className="text-content-subtle">
            ({labels.dupes.replace('{count}', String(need.transcendSteps))})
          </span>
        </span>
      )}
    </div>
  );
}
