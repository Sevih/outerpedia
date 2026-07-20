'use client';

import { useCallback, useMemo, useState } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { FitText } from '@/components/ui/FitText';
import {
  BANNER_CONFIGS,
  canUseMileage,
  createSession,
  performPulls,
  redeemMileage,
  type BannerType,
  type PullResult,
} from '@/lib/gacha';

export type GachaCategory = 'normal' | 'premium' | 'limited';

/** Perso mineur (rareté 1-2) : juste de quoi afficher un résultat. */
export interface GachaMinor {
  id: string;
  name: string;
  /** Préfixe de titre (surnom affiché — rendu au-dessus du nom). */
  prefix?: string;
}

/** Perso 3★ tirable, catégorisé pour les pools de bannière. */
export interface GachaChar extends GachaMinor {
  category: GachaCategory;
  /** Noms recherchables normalisés (toutes langues + alias). */
  searchNames: string[];
}

export interface PullSimLabels {
  banners: Record<BannerType, string>;
  etherCost: string;
  guarantee: string;
  yes: string;
  no: string;
  selectFocus: string;
  searchPlaceholder: string;
  pull1: string;
  pull10: string;
  reset: string;
  mileage: string;
  useMileage: string;
  results: string;
  focus: string;
  noPulls: string;
  stats: string;
  totalPulls: string;
  totalEther: string;
  first3Star: string;
  firstFocus: string;
  never: string;
  history: string;
  batch: string;
}

const BANNER_TYPES: BannerType[] = ['custom', 'rateup', 'premium', 'limited'];

/** Catégorie sélectionnable comme focus par bannière (null = pas de focus). */
const BANNER_FOCUS_CATEGORY: Record<BannerType, GachaCategory | null> = {
  custom: null,
  rateup: 'normal',
  premium: 'premium',
  limited: 'limited',
};

/** Catégories présentes dans le pool hors focus. */
const BANNER_POOL: Record<BannerType, Set<GachaCategory>> = {
  custom: new Set(['normal', 'premium', 'limited']),
  rateup: new Set(['normal']),
  premium: new Set(['normal', 'premium']),
  limited: new Set(['normal']),
};

/** Nombre de focus autorisés par bannière. */
const BANNER_FOCUS_COUNT: Record<BannerType, number> = {
  custom: 0,
  rateup: 1,
  premium: 1,
  limited: 1,
};

/** Poids de sélection hors focus par catégorie (parité V2). */
const BANNER_CATEGORY_WEIGHT: Record<BannerType, Record<GachaCategory, number>> = {
  custom: { normal: 1, premium: 1, limited: 1 },
  rateup: { normal: 1, premium: 1, limited: 1 },
  premium: { normal: 1, premium: 0.5, limited: 1 },
  limited: { normal: 1, premium: 1, limited: 1 },
};

/** Couleurs de rareté des cartes de résultat (couleurs de donnée, parité V2). */
const RARITY_COLORS: Record<1 | 2 | 3, string> = {
  1: 'border-line-subtle/60 bg-surface-sunken/40',
  2: 'border-blue-500/50 bg-blue-900/20',
  3: 'border-violet-300/50 bg-violet-900/15',
};
const RARITY_GLOW: Record<1 | 2 | 3, string> = {
  1: '',
  2: 'shadow-[0_0_8px_rgba(59,130,246,0.25)]',
  3: 'shadow-[0_0_10px_rgba(167,139,250,0.3)]',
};
const FOCUS_STYLE =
  'ring-2 ring-amber-400/60 border-amber-500/50 bg-amber-900/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]';

/** Tirage au sort pondéré par catégorie. */
function weightedPick(pool: GachaChar[], weights: Record<GachaCategory, number>): GachaChar {
  const total = pool.reduce((sum, c) => sum + weights[c.category], 0);
  let roll = Math.random() * total;
  for (const c of pool) {
    roll -= weights[c.category];
    if (roll <= 0) return c;
  }
  return pool[pool.length - 1];
}

/** Résultat enrichi du perso résolu (affichage). */
type ResolvedPull = PullResult & { charId: string | null };

/**
 * Simulateur de gacha (portage V2) : 4 bannières aux taux officiels, choix du
 * focus (combobox multilingue), tirages x1/x10 avec garantie 2★, mileage,
 * résultats en cartes, statistiques de session et historique par batch. Tout
 * est local et éphémère — on tire pour voir, rien n'est persisté.
 */
export function PullSimulatorBrowser({
  characters,
  pool1,
  pool2,
  labels,
}: {
  characters: GachaChar[];
  pool1: GachaMinor[];
  pool2: GachaMinor[];
  labels: PullSimLabels;
}) {
  const [bannerType, setBannerType] = useState<BannerType>('rateup');
  const [session, setSession] = useState(() => createSession('rateup'));
  const [lastResults, setLastResults] = useState<ResolvedPull[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusSearch, setFocusSearch] = useState('');
  const [focusOpen, setFocusOpen] = useState(false);

  const config = BANNER_CONFIGS[bannerType];
  const maxFocus = BANNER_FOCUS_COUNT[bannerType];
  const focusCategory = BANNER_FOCUS_CATEGORY[bannerType];
  const poolCategories = BANNER_POOL[bannerType];
  const weights = BANNER_CATEGORY_WEIGHT[bannerType];

  const focusPool = useMemo(
    () => (focusCategory === null ? [] : characters.filter((c) => c.category === focusCategory)),
    [characters, focusCategory],
  );
  const pullPool = useMemo(
    () => characters.filter((c) => poolCategories.has(c.category)),
    [characters, poolCategories],
  );
  const focusChars = useMemo(
    () =>
      selectedIds
        .map((id) => focusPool.find((c) => c.id === id))
        .filter((c): c is GachaChar => c !== undefined),
    [selectedIds, focusPool],
  );
  // Index id → perso (résolution des cartes de résultat).
  const charById = useMemo(() => {
    const m = new Map<string, GachaMinor>();
    for (const list of [characters, pool1, pool2] as GachaMinor[][])
      for (const c of list) m.set(c.id, c);
    return m;
  }, [characters, pool1, pool2]);

  // La bannière custom n'a pas de focus ; les autres en exigent au moins un.
  const canPull = maxFocus === 0 || focusChars.length > 0;

  const handleBannerChange = useCallback((type: BannerType) => {
    setBannerType(type);
    setSession(createSession(type));
    setLastResults(null);
    setSelectedIds([]);
    setFocusSearch('');
  }, []);

  const toggleCharacter = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev.filter((s) => s !== id);
        if (prev.length >= BANNER_FOCUS_COUNT[bannerType]) return prev;
        return [...prev, id];
      });
    },
    [bannerType],
  );

  // Qui sort : rareté 1/2 au hasard des pools mineurs ; 3★ focus parmi les
  // vedettes choisies, sinon tirage pondéré du pool hors focus.
  const resolveChar = useCallback(
    (pull: PullResult): string | null => {
      if (pull.rarity === 1)
        return pool1.length ? pool1[Math.floor(Math.random() * pool1.length)].id : null;
      if (pull.rarity === 2)
        return pool2.length ? pool2[Math.floor(Math.random() * pool2.length)].id : null;
      if (pull.isFocus && focusChars.length > 0)
        return focusChars[Math.floor(Math.random() * focusChars.length)].id;
      const offPool = pullPool.filter((c) => !selectedIds.includes(c.id));
      return offPool.length ? weightedPick(offPool, weights).id : null;
    },
    [pool1, pool2, focusChars, pullPool, selectedIds, weights],
  );

  const handlePull = useCallback(
    (count: 1 | 10) => {
      setSession((prev) => {
        const { results, session: next } = performPulls(prev, count);
        setLastResults(results.map((r) => ({ ...r, charId: resolveChar(r) })));
        return next;
      });
    },
    [resolveChar],
  );

  const handleMileage = useCallback(() => {
    setSession((prev) => {
      const next = redeemMileage(prev);
      if (!next) return prev;
      const focus =
        focusChars.length > 0 ? focusChars[Math.floor(Math.random() * focusChars.length)] : null;
      setLastResults([{ rarity: 3, isFocus: true, charId: focus?.id ?? null }]);
      return next;
    });
  }, [focusChars]);

  const handleReset = useCallback(() => {
    setSession(createSession(bannerType));
    setLastResults(null);
  }, [bannerType]);

  const mileageReady = maxFocus > 0 && canUseMileage(session);
  const mileagePercent = Math.min((session.mileage / config.mileageCap) * 100, 100);
  const needle = focusSearch.normalize('NFKC').toLowerCase().trim();
  const displayName = (c: GachaMinor) => (c.prefix ? `${c.prefix} ${c.name}` : c.name);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Bannières */}
      <div className="flex flex-wrap justify-center gap-2">
        {BANNER_TYPES.map((type) => (
          <FilterPill
            key={type}
            active={type === bannerType}
            onClick={() => handleBannerChange(type)}
            className="h-9 px-4"
          >
            {labels.banners[type]}
          </FilterPill>
        ))}
      </div>

      {/* Taux et règles de la bannière */}
      <div className="border-line-subtle bg-surface-raised/30 text-content-muted space-y-2 rounded-lg border p-3 text-xs">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {config.focus3Rate > 0 && (
            <span>
              3★ {labels.focus}:{' '}
              <span className="font-semibold text-yellow-400">{config.focus3Rate}%</span>
            </span>
          )}
          <span>
            3★: <span className="font-semibold text-yellow-400">{config.offFocus3Rate}%</span>
          </span>
          <span>
            2★: <span className="font-semibold text-purple-400">{config.rate2}%</span>
          </span>
          <span>
            1★: <span className="text-content font-semibold">{config.rate1}%</span>
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>
            {labels.etherCost}:{' '}
            <span className="text-content font-semibold">{config.etherCost}</span>
          </span>
          <span>
            {labels.guarantee}:{' '}
            <span className="text-content font-semibold">
              {config.tenPullGuarantee ? labels.yes : labels.no}
            </span>
          </span>
        </div>
      </div>

      {/* Choix du focus (absent de la bannière custom) */}
      {maxFocus > 0 && (
        <div>
          <h2 className="text-content-muted mb-2 text-sm font-semibold">{labels.selectFocus}</h2>

          {focusChars.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {focusChars.map((char) => (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => toggleCharacter(char.id)}
                  className="group flex cursor-pointer items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 transition hover:border-red-500/40 hover:bg-red-500/10"
                >
                  {/* Largeur fixe : le span racine du portrait est en w-full. */}
                  <span className="w-7 shrink-0">
                    <CharacterPortrait id={char.id} name={char.name} size={28} showName={false} />
                  </span>
                  <span className="text-xs font-medium text-amber-300 group-hover:text-red-300">
                    {displayName(char)}
                  </span>
                  <span className="text-content-subtle text-[10px] group-hover:text-red-400">
                    ✕
                  </span>
                </button>
              ))}
            </div>
          )}

          {focusChars.length < maxFocus && (
            <div className="relative">
              <input
                type="text"
                value={focusSearch}
                onChange={(e) => {
                  setFocusSearch(e.target.value);
                  setFocusOpen(true);
                }}
                onFocus={() => setFocusOpen(true)}
                onBlur={() => setFocusOpen(false)}
                placeholder={labels.searchPlaceholder}
                className="border-line-subtle bg-surface-sunken/70 text-content placeholder:text-content-subtle w-full rounded-lg border px-3 py-2 text-sm focus:border-amber-500/40 focus:outline-none"
              />
              {focusOpen && (
                <div className="border-line-subtle bg-surface-overlay/95 absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border shadow-xl backdrop-blur-sm">
                  {focusPool
                    .filter((c) => !needle || c.searchNames.some((n) => n.includes(needle)))
                    .filter((c) => !selectedIds.includes(c.id))
                    .map((char) => (
                      <button
                        key={char.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          toggleCharacter(char.id);
                          setFocusSearch('');
                          setFocusOpen(false);
                        }}
                        className="hover:bg-surface-raised/80 flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition"
                      >
                        <span className="w-8 shrink-0">
                          <CharacterPortrait
                            id={char.id}
                            name={char.name}
                            size={32}
                            showName={false}
                          />
                        </span>
                        <span className="text-content text-sm">{displayName(char)}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Boutons de tirage + mileage */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handlePull(1)}
            disabled={!canPull}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
              canPull
                ? 'border-line-strong bg-surface-overlay/50 text-content-strong hover:bg-surface-overlay cursor-pointer border active:scale-95'
                : 'border-line-subtle/30 bg-surface-raised/30 text-content-subtle border opacity-60'
            }`}
          >
            {labels.pull1}
          </button>
          <button
            type="button"
            onClick={() => handlePull(10)}
            disabled={!canPull}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
              canPull
                ? 'cursor-pointer border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 active:scale-95'
                : 'border-line-subtle/30 bg-surface-raised/30 text-content-subtle border opacity-60'
            }`}
          >
            {labels.pull10}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="border-line-subtle bg-surface-raised/30 text-content-subtle hover:text-content hover:bg-surface-overlay/40 cursor-pointer rounded-lg border px-4 py-2.5 text-sm transition"
          >
            {labels.reset}
          </button>
        </div>

        {maxFocus > 0 && (
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-xs">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-content-muted">{labels.mileage}</span>
                <span className={mileageReady ? 'font-semibold text-amber-300' : 'text-content'}>
                  {session.mileage} / {config.mileageCap}
                </span>
              </div>
              <div className="bg-surface-overlay h-2 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${mileageReady ? 'bg-amber-400' : 'bg-amber-600/60'}`}
                  style={{ width: `${mileagePercent}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleMileage}
              disabled={!mileageReady}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                mileageReady
                  ? 'cursor-pointer border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 active:scale-95'
                  : 'border-line-subtle/30 bg-surface-raised/30 text-content-subtle border opacity-60'
              }`}
            >
              {labels.useMileage}
            </button>
          </div>
        )}
      </div>

      {/* Derniers résultats */}
      {lastResults ? (
        <div>
          <h2 className="text-content-muted mb-3 text-sm font-semibold">{labels.results}</h2>
          <div className="grid grid-cols-5 gap-2">
            {lastResults.map((pull, i) => {
              const char = pull.charId ? charById.get(pull.charId) : undefined;
              const textColor = pull.isFocus
                ? 'text-amber-300'
                : pull.rarity === 3
                  ? 'text-violet-200'
                  : pull.rarity === 2
                    ? 'text-blue-300/80'
                    : 'text-content-subtle';
              return (
                <div
                  key={i}
                  className={`flex min-w-0 flex-col items-center overflow-hidden rounded-lg border p-1.5 transition-all ${
                    pull.isFocus
                      ? FOCUS_STYLE
                      : `${RARITY_COLORS[pull.rarity]} ${RARITY_GLOW[pull.rarity]}`
                  }`}
                >
                  {char && (
                    <CharacterPortrait id={char.id} name={char.name} size={56} showName={false} />
                  )}
                  <div className="mt-1 w-full text-center leading-tight">
                    {char ? (
                      <>
                        {char.prefix && (
                          <FitText
                            max={9}
                            min={5}
                            center
                            className={`w-full font-medium ${textColor} opacity-70`}
                          >
                            {char.prefix}
                          </FitText>
                        )}
                        <FitText
                          max={11}
                          min={5}
                          center
                          className={`w-full font-medium ${textColor}`}
                        >
                          {char.name}
                        </FitText>
                      </>
                    ) : (
                      <span className="text-content-subtle text-[10px]">{pull.rarity}★</span>
                    )}
                  </div>
                  {pull.isFocus && (
                    <span className="text-[10px] font-bold text-amber-400">{labels.focus}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-content-subtle text-center text-sm">{labels.noPulls}</p>
      )}

      {/* Statistiques de session */}
      {session.totalPulls > 0 && (
        <div>
          <h2 className="text-content-muted mb-3 text-sm font-semibold">{labels.stats}</h2>
          <div
            className={`grid gap-2 ${maxFocus > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}
          >
            <StatCard label={labels.totalPulls} value={session.totalPulls} />
            {maxFocus > 0 && (
              <StatCard label={labels.totalEther} value={session.totalEther.toLocaleString()} />
            )}
            <StatCard
              label={labels.first3Star}
              value={session.pullsToFirst3Star ?? labels.never}
              highlight={session.pullsToFirst3Star !== null}
            />
            {maxFocus > 0 && (
              <StatCard
                label={labels.firstFocus}
                value={session.pullsToFocus ?? labels.never}
                highlight={session.pullsToFocus !== null}
              />
            )}
          </div>

          <div className={`mt-3 grid gap-2 ${maxFocus > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <RarityBar
              label="1★"
              count={session.counts.star1}
              total={session.totalPulls}
              color="bg-content-subtle/60"
            />
            <RarityBar
              label="2★"
              count={session.counts.star2}
              total={session.totalPulls}
              color="bg-blue-500"
            />
            <RarityBar
              label="3★"
              count={session.counts.star3}
              total={session.totalPulls}
              color="bg-violet-400"
            />
            {maxFocus > 0 && (
              <RarityBar
                label={`3★ ${labels.focus}`}
                count={session.counts.star3Focus}
                total={session.totalPulls}
                color="bg-amber-400"
              />
            )}
          </div>
        </div>
      )}

      {/* Historique */}
      {session.history.length > 0 && (
        <div>
          <h2 className="text-content-muted mb-3 text-sm font-semibold">{labels.history}</h2>
          <div className="border-line-subtle bg-surface-raised/20 max-h-64 space-y-1.5 overflow-y-auto rounded-lg border p-3">
            {[...session.history].reverse().map((batch, revIdx) => {
              const batchIdx = session.history.length - 1 - revIdx;
              return (
                <div key={batchIdx} className="flex items-center gap-2 text-xs">
                  <span className="text-content-subtle w-16 shrink-0">
                    {labels.batch} {batchIdx + 1}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {batch.map((pull, j) => (
                      <span
                        key={j}
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          pull.rarity === 3
                            ? pull.isFocus
                              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40'
                              : 'bg-violet-500/15 text-violet-300'
                            : pull.rarity === 2
                              ? 'bg-blue-500/15 text-blue-300'
                              : 'bg-surface-overlay/40 text-content-subtle'
                        }`}
                      >
                        {pull.rarity}★{pull.isFocus ? ' ✦' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="border-line-subtle bg-surface-raised/30 rounded-lg border p-3 text-center">
      <p className="text-content-subtle text-xs">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${highlight ? 'text-amber-300' : 'text-content-strong'}`}
      >
        {value}
      </p>
    </div>
  );
}

function RarityBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="border-line-subtle bg-surface-raised/30 rounded-lg border p-2 text-center">
      <p className="text-content-subtle text-[10px]">{label}</p>
      <p className="text-content text-sm font-bold">{count}</p>
      <div className="bg-surface-overlay mt-1 h-1.5 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-content-subtle mt-0.5 text-[10px]">{pct.toFixed(1)}%</p>
    </div>
  );
}
