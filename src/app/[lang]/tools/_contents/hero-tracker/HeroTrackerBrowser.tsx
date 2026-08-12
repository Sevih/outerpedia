'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { FusionLevelStep } from '@datagen/generators/hero-growth';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { img, STAR_SPRITE } from '@/lib/images';
import { useStoredState, type StoreSpec } from '@/lib/client-storage';
import {
  accountNeed,
  foodBreakdown,
  giftBreakdown,
  hasWork,
  heroNeed,
  mergeBreakdowns,
  NEED_AXES,
  type GrowthRules,
  type HeroNeed,
  type HeroProgress,
  type NeedAxis,
  type TrackedHero,
  type TranscendCost,
} from './engine';

/**
 * Suivi de compte — écran CLIENT. L'état vit dans le localStorage (aucun
 * compte, aucune écriture serveur) ; le calcul est délégué au moteur pur voisin.
 *
 * Parti pris de la refonte (maquette « 2a — édition en place ») : LE RÉCAP EST
 * L'ÉCRAN. Il reste collant pendant qu'on saisit, parce que voir le total bouger
 * est la seule raison de remplir ce formulaire. La saisie tient dans la rangée
 * du héros, dépliée ; le roster complet vit dans un tiroir « ajouter », pour que
 * les 119 héros ne noient plus les cinq qu'on monte vraiment.
 */

/** Un palier de transcendance tel qu'il s'AFFICHE (l'étoile du jeu, pas l'index). */
export interface TranscendStep extends TranscendCost {
  /** Étoile INTERNE (1→9) : c'est elle que le barème de fusion référence. */
  star: number;
  /** Étoiles pleines affichées en jeu (1→6). */
  showStar: number;
  /** Petits « + » au-delà de l'étoile pleine (4★+1…). */
  starPlus: number;
  /** Couleur de l'étoile du palier (`STAR_SPRITE`) — jaune, puis orange/rouge/violet. */
  starColor: string;
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
  /** Icônes des 4 skills améliorables, dans l'ordre S1 / S2 / ultime / chain. */
  skillIcons: string[];
  /** Équipements exclusifs portés : l'hérité d'abord pour un fusionné, puis le sien. */
  ee: ItemAsset[];
  /** Paliers de Core Fusion si CE héros est un fusionné. */
  fusionLevels?: FusionLevelStep[];
  /** Étoile interne exigée pour fusionner : un fusionné ne peut PAS être en deçà. */
  requiredStar?: number;
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
  untrack: string;
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
  shoppingList: string;
  myHeroes: string;
  addHero: string;
  untracked: string;
  heroNeeds: string;
  doneHero: string;
  emptyTitle: string;
  emptyCta: string;
  itemCount: string;
  itemUnit: string;
  axisAll: string;
  piecesNote: string;
  skillHint: string;
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
/** Au-delà, l'appui devient « je vise » plutôt que « j'en suis là ». */
const LONG_PRESS_MS = 450;

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

const fmt = (n: number): string => n.toLocaleString('en-US');
/** 38 400 000 → « 38.4M » : la liste de courses n'a pas la place des zéros. */
const short = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 10_000
      ? `${Math.round(n / 1000)}K`
      : fmt(n);

const starLabel = (s?: TranscendStep): string =>
  s ? `${s.showStar}★${s.starPlus > 0 ? `+${s.starPlus}` : ''}` : '—';

export function HeroTrackerBrowser({ heroes, rules, transcend, items, labels }: HeroTrackerData) {
  const [store, setStore, ready] = useStoredState(SPEC);
  const [query, setQuery] = useState('');
  const [axis, setAxis] = useState<NeedAxis | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [element, setElement] = useState<string | null>(null);

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

  /**
   * PLANCHER de transcendance : on ne fusionne qu'un héros déjà monté à
   * l'étoile exigée (5★ en jeu), donc un fusionné ne peut pas être en deçà.
   */
  const minTranscend = useCallback(
    (hero: HeroRow): number => {
      if (!hero.requiredStar) return 0;
      const i = ladder(asTracked(hero)).findIndex((s) => s.star === hero.requiredStar);
      return i < 0 ? 0 : i;
    },
    [ladder, asTracked],
  );

  /** Le PLAFOND de chaque axe — cible par défaut, et cible tout court en mode max. */
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
      const floor = minTranscend(h);
      const state = { ...entry.state, transcend: Math.max(entry.state.transcend, floor) };
      out.set(h.id, heroNeed(asTracked(h), state, target, fullRules));
    }
    return out;
  }, [heroes, tracked, hidden, store.alwaysMax, maxTarget, minTranscend, asTracked, fullRules]);

  const total = useMemo(() => accountNeed([...needs.values()]), [needs]);

  const defaults = useCallback(
    (hero: HeroRow): HeroEntry => ({
      state: {
        level: START_LEVEL,
        skills: Array(SKILL_SLOTS).fill(1),
        fusion: 0,
        affinity: 1,
        transcend: minTranscend(hero),
        ee: Array(hero.fusionLevels ? 2 : 1).fill(0),
      },
      target: maxTarget(hero),
    }),
    [maxTarget, minTranscend],
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

  const withTarget = !store.alwaysMax;
  const giftBonus = store.preferredGift ? PREFERRED_GIFT_BONUS : 0;

  // Plats et cadeaux ne sont pas des coûts stockés : ce sont des CONVERSIONS de
  // l'XP et des points, faites HÉROS PAR HÉROS avant d'être totalisées — un plat
  // ne se coupe pas en deux, le reste de chacun s'arrondit chez lui.
  const food = useMemo(
    () => mergeBreakdowns(total.heroes.map((n) => foodBreakdown(n.xp, rules.xpFood))),
    [total.heroes, rules.xpFood],
  );
  const gifts = useMemo(
    () =>
      mergeBreakdowns(
        total.heroes.map((n) =>
          giftBreakdown(n.affinityPoints, rules.gifts, heroById.get(n.heroId)?.gift, giftBonus),
        ),
      ),
    [total.heroes, rules.gifts, heroById, giftBonus],
  );

  /** La liste de courses : items des barèmes + conversions, filtrée par axe. */
  const shopping = useMemo(() => {
    const source = axis === 'all' ? total.items : total.itemsByAxis[axis];
    const rows = Object.entries(source)
      .map(([id, count]) => ({ id, count, asset: items[id] }))
      .filter((r) => r.asset);
    if (axis === 'all' || axis === 'level') {
      for (const b of food)
        rows.push({
          id: b.entry.id,
          count: b.count,
          asset: { name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade },
        });
    }
    if (axis === 'all') {
      for (const b of gifts)
        rows.push({
          id: b.entry.id,
          count: b.count,
          asset: { name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade },
        });
    }
    return rows.sort((a, b) => b.count - a.count);
  }, [axis, total.items, total.itemsByAxis, items, food, gifts]);

  const itemTotal = shopping.reduce((sum, r) => sum + r.count, 0);

  /** Suivis d'abord, du plus gourmand au plus léger, les héros finis en dernier. */
  const trackedRows = useMemo(() => {
    const rows = heroes.filter((h) => tracked[h.id] && !hidden.has(h.id));
    const weight = (h: HeroRow) => {
      const n = needs.get(h.id);
      if (!n || !hasWork(n)) return -1;
      return Object.values(n.items).reduce((a, b) => a + b, 0);
    };
    return rows.sort((a, b) => weight(b) - weight(a) || a.name.localeCompare(b.name));
  }, [heroes, tracked, hidden, needs]);

  const q = query.trim().toLowerCase();
  const pickable = useMemo(
    () =>
      heroes.filter(
        (h) =>
          !hidden.has(h.id) &&
          (!element || h.element === element) &&
          (!q || h.searchNames.some((n) => n.toLowerCase().includes(q))),
      ),
    [heroes, hidden, element, q],
  );

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
      {/* ══ Colonne récap — collante : on voit le total bouger pendant la saisie ══ */}
      <div className="sticky top-0 z-20 -mx-4 space-y-3 px-4 sm:mx-0 sm:px-0 lg:top-4">
        <SummaryPanel
          total={total}
          shopping={shopping}
          itemTotal={itemTotal}
          heroById={heroById}
          axis={axis}
          onAxis={setAxis}
          preferredGift={store.preferredGift}
          labels={labels}
        />
        <Settings
          store={store}
          setStore={setStore}
          fusionPairs={fusionPairs}
          trackedCount={trackedRows.length}
          labels={labels}
        />
      </div>

      {/* ══ Colonne héros ══ */}
      <div className="space-y-3" aria-busy={!ready}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-content-strong text-base font-semibold">
            {labels.myHeroes}{' '}
            <span className="text-content-muted font-normal">{trackedRows.length}</span>
          </h2>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setPicking((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              picking
                ? 'border-line text-content-muted hover:bg-line/40 border'
                : 'bg-accent text-accent-fg hover:brightness-110'
            }`}
          >
            {picking ? '×' : '+'} {labels.addHero}
          </button>
        </div>

        {trackedRows.length === 0 && !picking ? (
          <EmptyState labels={labels} onPick={() => setPicking(true)} />
        ) : (
          <ul className="space-y-2">
            {trackedRows.map((hero) => (
              <HeroCard
                key={hero.id}
                hero={hero}
                entry={tracked[hero.id]}
                need={needs.get(hero.id)}
                steps={ladder(asTracked(hero))}
                minTranscend={minTranscend(hero)}
                rules={rules}
                items={items}
                withTarget={withTarget}
                giftBonus={giftBonus}
                expanded={open === hero.id}
                onExpand={() => setOpen((v) => (v === hero.id ? null : hero.id))}
                onUntrack={() => toggle(hero)}
                onChange={(side, patch) => update(hero, side, patch)}
                labels={labels}
              />
            ))}
          </ul>
        )}

        {picking && (
          <HeroPicker
            rows={pickable}
            tracked={tracked}
            query={query}
            onQuery={setQuery}
            element={element}
            onElement={setElement}
            onToggle={toggle}
            labels={labels}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Récapitulatif ─────────────────────────── */

interface ShoppingRow {
  id: string;
  count: number;
  asset?: ItemAsset;
}

function SummaryPanel({
  total,
  shopping,
  itemTotal,
  heroById,
  axis,
  onAxis,
  preferredGift,
  labels,
}: {
  total: ReturnType<typeof accountNeed>;
  shopping: ShoppingRow[];
  itemTotal: number;
  heroById: Map<string, HeroRow>;
  axis: NeedAxis | 'all';
  onAxis: (a: NeedAxis | 'all') => void;
  preferredGift: boolean;
  labels: HeroTrackerLabels;
}) {
  const axisLabel: Record<NeedAxis, string> = {
    level: labels.level,
    skills: labels.skills,
    ee: labels.ee,
  };
  const pieces = Object.entries(total.pieces);

  return (
    <details
      open
      className="border-line bg-surface-raised overflow-hidden rounded-xl border shadow-lg"
    >
      <summary className="bg-surface-overlay border-line-subtle flex cursor-pointer list-none items-center gap-3 border-b px-3 py-2 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="text-content-muted block font-mono text-[11px] tracking-wide uppercase">
            {labels.needTitle} ·{' '}
            {labels.trackedCount.replace('{count}', String(total.heroes.length))}
          </span>
          <span className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-content-strong font-mono text-lg font-bold">
              {fmt(itemTotal)}
            </span>
            <span className="text-content-muted text-xs">{labels.itemUnit}</span>
            {total.gold > 0 && (
              <>
                <span className="bg-line-subtle h-3 w-px" />
                <span className="text-warn font-mono text-sm font-semibold">
                  {short(total.gold)}
                </span>
              </>
            )}
          </span>
        </span>
        <span className="flex gap-1">
          {shopping.slice(0, 3).map((r) => (
            <EquipmentIcon
              key={r.id}
              src={img.item(r.asset?.icon ?? '')}
              grade={r.asset?.grade ?? 'normal'}
              alt={r.asset?.name ?? ''}
              size={26}
            />
          ))}
        </span>
      </summary>

      <div className="space-y-3 p-3">
        <div className="grid grid-cols-3 gap-2">
          <Tile label={labels.gold} value={short(total.gold)} accent />
          <Tile label={labels.xp} value={short(total.xp)} />
          <Tile label={labels.affinityPoints} value={short(total.affinityPoints)} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <h3 className="text-content-strong text-sm font-semibold">{labels.shoppingList}</h3>
          <div className="border-line-subtle bg-surface-sunken flex gap-0.5 rounded-lg border p-0.5">
            {(['all', ...NEED_AXES] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onAxis(a)}
                className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${
                  axis === a
                    ? 'bg-surface-overlay text-content-strong font-semibold'
                    : 'text-content-muted hover:text-content-strong'
                }`}
              >
                {a === 'all' ? labels.axisAll : axisLabel[a]}
              </button>
            ))}
          </div>
        </div>

        {shopping.length === 0 ? (
          <p className="text-content-subtle text-sm">{labels.needEmpty}</p>
        ) : (
          <ul className="border-line-subtle divide-line-subtle divide-y overflow-hidden rounded-lg border">
            {shopping.map((r) => (
              <li key={r.id} className="bg-surface-raised flex items-center gap-2.5 px-2.5 py-1.5">
                <EquipmentIcon
                  src={img.item(r.asset?.icon ?? '')}
                  grade={r.asset?.grade ?? 'normal'}
                  alt=""
                  size={32}
                />
                <span className="text-content min-w-0 flex-1 text-[13px] leading-tight wrap-break-word">
                  {r.asset?.name}
                </span>
                <span className="text-content-strong font-mono text-sm font-semibold">
                  ×{fmt(r.count)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {total.affinityPoints > 0 && (
          <p className="text-content-subtle text-[11px]">
            {preferredGift ? labels.giftNoteBonus : labels.giftNote}
          </p>
        )}

        {pieces.length > 0 && (
          <div className="border-line-subtle bg-surface-sunken rounded-lg border border-dashed p-2.5">
            <h3 className="text-content-muted mb-1.5 font-mono text-[11px] tracking-wide uppercase">
              {labels.piecesNote}
            </h3>
            <ul className="space-y-1">
              {pieces.map(([heroId, { pieces: count, steps }]) => (
                <li key={heroId} className="flex items-center gap-2 text-xs">
                  <span className="text-content-muted min-w-0 flex-1 truncate">
                    {heroById.get(heroId)?.name ?? heroId}
                  </span>
                  <span className="text-content-strong font-mono font-semibold">×{count}</span>
                  <span className="text-content-subtle">
                    {labels.dupes.replace('{count}', String(steps))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

function Tile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-line-subtle bg-surface-sunken rounded-lg border px-2 py-1.5">
      <div className="text-content-muted truncate font-mono text-[10px] tracking-wide uppercase">
        {label}
      </div>
      <div
        className={`mt-0.5 font-mono text-sm font-bold ${accent ? 'text-warn' : 'text-content-strong'}`}
      >
        {value}
      </div>
    </div>
  );
}

/* ─────────────────────────── Réglages ─────────────────────────── */

function Settings({
  store,
  setStore,
  fusionPairs,
  trackedCount,
  labels,
}: {
  store: TrackerState;
  setStore: (fn: (prev: TrackerState) => TrackerState) => void;
  fusionPairs: { base: HeroRow; fusion: HeroRow }[];
  trackedCount: number;
  labels: HeroTrackerLabels;
}) {
  const check = (key: 'alwaysMax' | 'preferredGift', text: string) => (
    <label className="text-content-muted flex cursor-pointer items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={store[key]}
        onChange={(e) => setStore((prev) => ({ ...prev, [key]: e.target.checked }))}
        className="accent-accent"
      />
      {text}
    </label>
  );

  return (
    <details className="border-line-subtle bg-surface-raised rounded-xl border">
      <summary className="text-content-strong cursor-pointer px-3 py-2 text-xs font-semibold">
        {labels.settings}
      </summary>
      <div className="space-y-3 px-3 pt-1 pb-3">
        {check('alwaysMax', labels.alwaysMax)}
        {check('preferredGift', labels.preferredGift)}

        <div>
          <h3 className="text-content-strong text-xs font-semibold">{labels.settingsFusion}</h3>
          <p className="text-content-subtle mt-0.5 text-[11px]">{labels.settingsFusionHint}</p>
          <ul className="mt-1.5 space-y-1">
            {fusionPairs.map(({ base }) => {
              const isFused = Boolean(store.fused[base.id]);
              return (
                <li key={base.id} className="flex items-center gap-2">
                  <span className="text-content-muted min-w-0 flex-1 truncate text-xs">
                    {base.name}
                  </span>
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
                        className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                          isFused === value
                            ? 'border-accent bg-accent/15 text-content-strong'
                            : 'border-line-subtle text-content-muted hover:bg-line/40'
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {trackedCount > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(labels.resetConfirm))
                setStore((prev) => ({ ...prev, heroes: {} }));
            }}
            className="border-line text-content-muted hover:border-danger hover:text-danger rounded border px-2 py-1 text-[11px] transition-colors"
          >
            {labels.reset}
          </button>
        )}
      </div>
    </details>
  );
}

/* ─────────────────────────── Rangée de héros ─────────────────────────── */

function HeroCard({
  hero,
  entry,
  need,
  steps,
  minTranscend,
  rules,
  items,
  withTarget,
  giftBonus,
  expanded,
  onExpand,
  onUntrack,
  onChange,
  labels,
}: {
  hero: HeroRow;
  entry: HeroEntry;
  need?: HeroNeed;
  steps: TranscendStep[];
  minTranscend: number;
  rules: Omit<GrowthRules, 'transcendLadder'>;
  items: Record<string, ItemAsset>;
  withTarget: boolean;
  giftBonus: number;
  expanded: boolean;
  onExpand: () => void;
  onUntrack: () => void;
  onChange: (side: 'state' | 'target', patch: Partial<HeroProgress>) => void;
  labels: HeroTrackerLabels;
}) {
  const done = !need || !hasWork(need);
  const objects = need ? Object.values(need.items).reduce((a, b) => a + b, 0) : 0;
  const { state, target } = entry;

  /**
   * Sauts de niveau proposés : le plafond AVANT limit break (100 — là où
   * beaucoup de comptes s'arrêtent), puis chaque palier de limit break.
   * Tout est dérivé du barème ; aucun de ces nombres n'est écrit en dur.
   */
  const jumps = useMemo(() => {
    const set = new Set<number>([rules.xpCurve.length]);
    for (const s of rules.limitBreak[`${hero.rarity}_${hero.element}`] ?? []) {
      set.add(s.maxLevel);
      set.add(s.fromLevel);
    }
    return [...set].sort((a, b) => a - b);
  }, [rules, hero.rarity, hero.element]);

  const summary = done
    ? labels.doneHero
    : [
        `${labels.level} ${state.level}→${withTarget ? target.level : rules.xpCurve.length}`,
        `${starLabel(steps[state.transcend])}→${starLabel(steps[withTarget ? target.transcend : steps.length - 1])}`,
        labels.itemCount.replace('{count}', fmt(objects)),
      ].join(' · ');

  return (
    <li
      className={`overflow-hidden rounded-xl border ${
        done
          ? 'border-success/35 bg-success/5'
          : expanded
            ? 'border-line bg-surface-raised'
            : 'border-line-subtle bg-surface-raised'
      }`}
    >
      <div
        className={`flex items-center gap-2.5 px-2.5 py-2 ${expanded ? 'bg-surface-overlay' : ''}`}
      >
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span className={`w-11 shrink-0 ${done ? 'opacity-70' : ''}`}>
            <CharacterPortrait
              id={hero.id}
              name={hero.name}
              element={hero.element}
              classType={hero.class}
              rarity={hero.rarity}
              size={44}
              showName={false}
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-content-strong block text-sm leading-tight font-semibold wrap-break-word">
              {hero.name}
              {hero.fusionLevels && (
                <span className="text-accent ml-1.5 text-[10px] uppercase">
                  {labels.coreFusion}
                </span>
              )}
            </span>
            <span
              className={`mt-0.5 block font-mono text-[11px] ${done ? 'text-success' : 'text-content-muted'}`}
            >
              {summary}
            </span>
          </span>
          <span className="text-content-muted shrink-0 text-sm">{expanded ? '▴' : '▾'}</span>
        </button>
      </div>

      {expanded && (
        <div className="space-y-3.5 px-2.5 py-3 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-5 md:*:mb-3.5">
          {/* ── Niveau ── */}
          <Field
            label={labels.level}
            value={`${state.level}`}
            target={withTarget ? `${target.level}` : undefined}
          >
            <div className="flex items-center gap-1.5">
              <Stepper
                value={state.level}
                min={START_LEVEL}
                max={rules.xpCurve.length}
                onChange={(v) => onChange('state', { level: v })}
              />
              <div className="flex gap-1">
                {jumps.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onChange(withTarget ? 'target' : 'state', { level: n })}
                    className={`h-9 rounded-lg border px-2 font-mono text-[11px] transition-colors ${
                      (withTarget ? target.level : state.level) === n
                        ? 'border-accent bg-accent/15 text-accent font-semibold'
                        : 'border-line-subtle bg-surface-sunken text-content-muted hover:border-line'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          {/* ── Compétences (ou palier de fusion) ── */}
          {hero.fusionLevels ? (
            <Field
              label={labels.fusionLevel}
              value={`${state.fusion}`}
              target={withTarget ? `${target.fusion}` : undefined}
            >
              <Scale
                values={Array.from({ length: hero.fusionLevels.length + 1 }, (_, i) => i)}
                current={state.fusion}
                target={withTarget ? target.fusion : hero.fusionLevels.length}
                withTarget={withTarget}
                onCurrent={(v) => onChange('state', { fusion: v })}
                onTarget={(v) => onChange('target', { fusion: v })}
              />
            </Field>
          ) : (
            <Field label={labels.skills} hint={withTarget ? labels.skillHint : undefined}>
              <div className="space-y-1.5">
                {Array.from({ length: SKILL_SLOTS }, (_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {hero.skillIcons[i] ? (
                      <img
                        src={img.skill(hero.skillIcons[i])}
                        alt=""
                        aria-hidden
                        width={26}
                        height={26}
                        className="border-line-subtle bg-surface-sunken h-6.5 w-6.5 shrink-0 rounded border"
                      />
                    ) : (
                      <span className="border-line-subtle bg-surface-sunken text-content-muted flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded border font-mono text-[10px]">
                        {i === SKILL_SLOTS - 1 ? 'CP' : `S${i + 1}`}
                      </span>
                    )}
                    <Scale
                      values={[1, 2, 3, 4, 5]}
                      current={state.skills[i] ?? 1}
                      target={withTarget ? (target.skills[i] ?? 1) : MAX_SKILL}
                      withTarget={withTarget}
                      onCurrent={(v) => onChange('state', { skills: replace(state.skills, i, v) })}
                      onTarget={(v) => onChange('target', { skills: replace(target.skills, i, v) })}
                    />
                  </div>
                ))}
              </div>
            </Field>
          )}

          {/* ── Transcendance ── */}
          <Field
            label={labels.transcend}
            value={starLabel(steps[state.transcend])}
            target={withTarget ? starLabel(steps[target.transcend]) : undefined}
          >
            <Scale
              values={steps.map((_, i) => i).filter((i) => i >= minTranscend)}
              current={state.transcend}
              target={withTarget ? target.transcend : steps.length - 1}
              withTarget={withTarget}
              tone="star"
              // Le sprite d'étoile DU JEU, à la couleur que la donnée déclare
              // pour ce palier (jaune, puis orange/rouge/violet sur les « + »)
              // — la même image que le slider de la fiche perso.
              icon={(i, reached) => (
                <img
                  src={img.transcendStar(
                    reached
                      ? (STAR_SPRITE[steps[i].starColor] ?? STAR_SPRITE.yellow)
                      : STAR_SPRITE.gray,
                  )}
                  alt=""
                  aria-hidden
                  width={14}
                  height={14}
                />
              )}
              render={(i) =>
                `${steps[i].showStar}${steps[i].starPlus > 0 ? `+${steps[i].starPlus}` : ''}`
              }
              onCurrent={(v) => onChange('state', { transcend: v })}
              onTarget={(v) => onChange('target', { transcend: v })}
            />
          </Field>

          {/* ── Affinité ── */}
          <Field
            label={labels.affinity}
            value={`${state.affinity}`}
            target={withTarget ? `${target.affinity}` : undefined}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="range"
                min={1}
                max={rules.affinityCurve.length}
                value={state.affinity}
                onChange={(e) => onChange('state', { affinity: Number(e.target.value) })}
                className="accent-accent h-9 min-w-0 flex-1"
                aria-label={labels.affinity}
              />
              <NumberField
                value={state.affinity}
                min={1}
                max={rules.affinityCurve.length}
                onChange={(v) => onChange('state', { affinity: v })}
              />
            </div>
          </Field>

          {/* ── Équipement(s) exclusif(s) ── */}
          {state.ee.map((_, i) => (
            <Field
              key={i}
              label={i === 0 ? labels.ee : labels.eeFusion}
              value={`+${state.ee[i] ?? 0}`}
              target={withTarget ? `+${target.ee[i] ?? 0}` : undefined}
            >
              <div className="flex items-center gap-2">
                {hero.ee[i] && (
                  <EquipmentIcon
                    src={img.equipment(hero.ee[i].icon)}
                    grade={hero.ee[i].grade}
                    alt={hero.ee[i].name}
                    size={30}
                  />
                )}
                <Scale
                  values={Array.from({ length: rules.eeEnchant.length + 1 }, (_, n) => n)}
                  current={state.ee[i] ?? 0}
                  target={withTarget ? (target.ee[i] ?? 0) : rules.eeEnchant.length}
                  withTarget={withTarget}
                  tone="star"
                  compact
                  onCurrent={(v) => onChange('state', { ee: replace(state.ee, i, v) })}
                  onTarget={(v) => onChange('target', { ee: replace(target.ee, i, v) })}
                />
                <NumberField
                  value={state.ee[i] ?? 0}
                  min={0}
                  max={rules.eeEnchant.length}
                  onChange={(v) => onChange('state', { ee: replace(state.ee, i, v) })}
                />
              </div>
            </Field>
          ))}

          {/* ── Ce qui manque à CE héros ── */}
          <div className="border-line-subtle border-t pt-2.5 md:col-span-2">
            <div className="flex items-center gap-2">
              <h4 className="text-content-muted font-mono text-[11px] tracking-wide uppercase">
                {need && !done ? labels.heroNeeds : labels.doneHero}
              </h4>
              <div className="flex-1" />
              <button
                type="button"
                onClick={onUntrack}
                className="border-line-subtle text-content-muted hover:border-danger hover:text-danger rounded border px-2 py-0.5 text-[11px] transition-colors"
              >
                {labels.untrack}
              </button>
            </div>
            {need && !done && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(need.items).map(([id, count]) => (
                  <NeedChip key={id} asset={items[id]} count={count} />
                ))}
                {foodBreakdown(need.xp, rules.xpFood).map((b) => (
                  <NeedChip
                    key={b.entry.id}
                    asset={{ name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade }}
                    count={b.count}
                  />
                ))}
                {giftBreakdown(need.affinityPoints, rules.gifts, hero.gift, giftBonus).map((b) => (
                  <NeedChip
                    key={b.entry.id}
                    asset={{ name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade }}
                    count={b.count}
                  />
                ))}
                {need.pieces > 0 && (
                  <span className="border-line-subtle bg-surface-sunken text-content-muted rounded-lg border px-2 py-1 text-[11px]">
                    {labels.pieces} ×{need.pieces}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/** Un axe : intitulé, valeur courante → cible, et son contrôle. */
function Field({
  label,
  value,
  target,
  hint,
  children,
}: {
  label: string;
  value?: string;
  target?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-content-muted text-xs">{label}</span>
        {hint && <span className="text-content-subtle font-mono text-[10px]">{hint}</span>}
        {value !== undefined && (
          <span className="text-content-strong font-mono text-xs font-semibold">
            <span className="text-accent">{value}</span>
            {target !== undefined && <span className="text-content-muted"> → {target}</span>}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function NeedChip({ asset, count }: { asset?: ItemAsset; count: number }) {
  if (!asset) return null;
  return (
    <span
      title={asset.name}
      className="border-line-subtle bg-surface-sunken flex items-center gap-1.5 rounded-lg border py-1 pr-2 pl-1"
    >
      <EquipmentIcon src={img.item(asset.icon)} grade={asset.grade} alt={asset.name} size={22} />
      <span className="text-content-strong font-mono text-[11px] font-semibold">×{count}</span>
    </span>
  );
}

/* ─────────────────────────── Contrôles ─────────────────────────── */

/** Remplace la i-ème valeur d'un axe multiple (skills, EE d'un fusionné). */
function replace(list: number[], index: number, value: number): number[] {
  const next = [...list];
  next[index] = value;
  return next;
}

/**
 * Échelle à segments : un segment par valeur atteignable. Le clic pose l'état
 * COURANT ; maj+clic (ou appui long au doigt) pose la CIBLE — deux marqueurs sur
 * une seule rangée, au lieu des deux champs numériques jumeaux d'avant.
 */
function Scale({
  values,
  current,
  target,
  withTarget,
  tone = 'accent',
  compact = false,
  render,
  icon,
  onCurrent,
  onTarget,
}: {
  values: number[];
  current: number;
  target: number;
  withTarget: boolean;
  /** `star` = or (transcendance, enchantement), `accent` = bleu (niveaux). */
  tone?: 'accent' | 'star';
  /** Segments fins et muets — l'échelle d'EE en a onze. */
  compact?: boolean;
  render?: (v: number) => string;
  /** Visuel posé au-dessus du libellé (les étoiles du jeu, pour la transcendance). */
  icon?: (v: number, reached: boolean) => React.ReactNode;
  onCurrent: (v: number) => void;
  onTarget: (v: number) => void;
}) {
  const held = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reached =
    tone === 'star' ? 'border-warn bg-warn/20 text-warn' : 'border-accent bg-accent/20 text-accent';

  const press = (v: number) => ({
    onPointerDown: () => {
      if (!withTarget) return;
      held.current = false;
      timer.current = setTimeout(() => {
        held.current = true;
        onTarget(v);
      }, LONG_PRESS_MS);
    },
    onPointerUp: () => {
      if (timer.current) clearTimeout(timer.current);
    },
    onPointerLeave: () => {
      if (timer.current) clearTimeout(timer.current);
    },
    onClick: (e: React.MouseEvent) => {
      if (held.current) {
        held.current = false;
        return; // l'appui long a déjà posé la cible
      }
      if (withTarget && e.shiftKey) onTarget(v);
      else onCurrent(v);
    },
  });

  return (
    <div className={`flex min-w-0 flex-1 ${compact ? 'gap-px' : 'gap-1'}`}>
      {values.map((v) => {
        const isReached = v <= current;
        const isAimed = v <= target;
        return (
          <button
            key={v}
            type="button"
            {...press(v)}
            aria-label={String(render ? render(v) : v)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-px rounded-md border font-mono text-[11px] leading-none font-semibold transition-colors ${
              compact ? 'h-8' : icon ? 'h-10' : 'h-9'
            } ${
              isReached
                ? reached
                : isAimed
                  ? 'border-line bg-surface-sunken text-content-muted'
                  : 'border-line-subtle bg-surface-sunken text-line'
            }`}
          >
            {icon?.(v, isReached)}
            {!compact && (render ? render(v) : v)}
          </button>
        );
      })}
    </div>
  );
}

/** − valeur + : le pas d'un niveau, au pouce. */
function Stepper({
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
  const btn =
    'border-line bg-surface-sunken text-content-muted hover:border-accent hover:text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-base transition-colors';
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <button type="button" onClick={() => onChange(Math.max(value - 1, min))} className={btn}>
        −
      </button>
      <NumberField value={value} min={min} max={max} onChange={onChange} grow />
      <button type="button" onClick={() => onChange(Math.min(value + 1, max))} className={btn}>
        +
      </button>
    </div>
  );
}

function NumberField({
  value,
  min,
  max,
  onChange,
  grow = false,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  grow?: boolean;
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
      className={`border-line-subtle bg-surface-sunken text-content-strong focus:border-accent h-9 rounded-lg border px-1.5 text-center font-mono text-sm font-semibold outline-none ${
        grow ? 'min-w-0 flex-1' : 'w-14 shrink-0'
      }`}
    />
  );
}

/* ─────────────────────────── Roster & état vide ─────────────────────────── */

const ELEMENTS = ['fire', 'water', 'earth', 'light', 'dark'] as const;
const ELEMENT_TEXT: Record<string, string> = {
  fire: 'text-fire',
  water: 'text-water',
  earth: 'text-earth',
  light: 'text-light',
  dark: 'text-dark-elem',
};

function HeroPicker({
  rows,
  tracked,
  query,
  onQuery,
  element,
  onElement,
  onToggle,
  labels,
}: {
  rows: HeroRow[];
  tracked: Record<string, HeroEntry>;
  query: string;
  onQuery: (v: string) => void;
  element: string | null;
  onElement: (v: string | null) => void;
  onToggle: (hero: HeroRow) => void;
  labels: HeroTrackerLabels;
}) {
  const untracked = rows.filter((h) => !tracked[h.id]).length;
  return (
    <div className="border-line-subtle bg-surface-sunken space-y-2.5 rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-content-strong text-sm font-semibold">{labels.addHero}</h3>
        <span className="text-content-subtle font-mono text-[11px]">
          {labels.untracked.replace('{count}', String(untracked))}
        </span>
        <div className="flex-1" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={labels.search}
          className="border-line-subtle bg-surface-raised text-content-strong placeholder:text-content-subtle focus:border-accent h-8 w-full min-w-0 rounded-lg border px-2.5 text-xs outline-none sm:w-52"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onElement(null)}
          className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
            element === null
              ? 'border-accent bg-accent/15 text-accent font-semibold'
              : 'border-line-subtle text-content-muted hover:border-line'
          }`}
        >
          {labels.axisAll}
        </button>
        {ELEMENTS.map((el) => (
          <button
            key={el}
            type="button"
            onClick={() => onElement(element === el ? null : el)}
            className={`rounded-md border px-2 py-1 text-[11px] capitalize transition-colors ${
              element === el ? 'border-accent bg-accent/15' : 'border-line-subtle hover:border-line'
            } ${ELEMENT_TEXT[el]}`}
          >
            {el}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
        {rows.map((hero) => (
          <li key={hero.id}>
            <button
              type="button"
              onClick={() => onToggle(hero)}
              title={hero.name}
              className={`relative block w-full transition-opacity ${
                tracked[hero.id] ? 'opacity-45' : 'hover:brightness-110'
              }`}
            >
              <CharacterPortrait
                id={hero.id}
                name={hero.name}
                element={hero.element}
                classType={hero.class}
                rarity={hero.rarity}
                size={44}
                showName={false}
              />
              {tracked[hero.id] && (
                <span className="bg-success text-accent-fg absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                  ✓
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ labels, onPick }: { labels: HeroTrackerLabels; onPick: () => void }) {
  return (
    <div className="border-line-subtle bg-surface-raised flex flex-col items-center gap-3 rounded-xl border px-4 py-8 text-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="border-line bg-surface-sunken h-10 w-10 rounded-lg border border-dashed"
          />
        ))}
      </div>
      <h3 className="text-content-strong text-base font-bold">{labels.emptyTitle}</h3>
      <p className="text-content-muted max-w-xs text-sm text-pretty">{labels.intro}</p>
      <button
        type="button"
        onClick={onPick}
        className="bg-accent text-accent-fg rounded-lg px-4 py-2.5 text-sm font-semibold hover:brightness-110"
      >
        {labels.emptyCta}
      </button>
    </div>
  );
}
