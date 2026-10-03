'use client';

/**
 * Ce que l'écran MONTRE du compte — la liste de courses (barèmes +
 * conversions en plats et cadeaux), le roster suivi filtré puis trié (ordre
 * gelé pendant l'édition), les héros proposés par le tiroir « ajouter ».
 * Extrait du composant principal (découpage du 03/10/2026 — déplacement
 * mécanique ; seule adaptation : ce que ces dérivés lisaient dans la portée
 * du composant arrive en paramètres, sous les MÊMES noms).
 */
import { useCallback, useMemo } from 'react';
import { normalizeSearchText } from '@/lib/search-text';
import {
  PREFERRED_GIFT_BONUS,
  type HeroRow,
  type HeroTrackerData,
  type RosterFilters,
  type SortKey,
  type TrackerState,
} from './contracts';
import {
  foodBreakdown,
  giftBreakdown,
  hasWork,
  mergeBreakdowns,
  type accountNeed,
  type HeroNeed,
  type HeroProgress,
  type NeedAxis,
} from './engine';
import type { HeroEntry } from './roster-import';

export function useRosterView({
  heroes,
  rules,
  items,
  store,
  tracked,
  heroById,
  hidden,
  shown,
  maxTarget,
  needs,
  total,
  axis,
  filters,
  sort,
  frozen,
  query,
  element,
}: Pick<HeroTrackerData, 'heroes' | 'rules' | 'items'> & {
  /** Tout ce qui suit sort de `useTrackerState`, tel quel. */
  store: TrackerState;
  tracked: Record<string, HeroEntry>;
  heroById: Map<string, HeroRow>;
  hidden: Set<string>;
  shown: (hero: HeroRow) => boolean;
  maxTarget: (hero: HeroRow) => HeroProgress;
  needs: Map<string, HeroNeed>;
  total: ReturnType<typeof accountNeed>;
  axis: NeedAxis | 'all';
  filters: RosterFilters;
  sort: { by: SortKey; desc: boolean };
  frozen: string[] | null;
  query: string;
  element: string | null;
}) {
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
          giftBreakdown(
            n.affinityPoints,
            rules.gifts,
            heroById.get(n.heroId)?.gift,
            PREFERRED_GIFT_BONUS,
          ),
        ),
      ),
    [total.heroes, rules.gifts, heroById],
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

  /**
   * Un héros au PLAFOND de chaque axe. À distinguer de « plus rien à farmer » :
   * un héros peut avoir atteint une cible modeste sans être au maximum, d'où
   * deux réglages de masquage plutôt qu'un.
   */
  const isMaxed = useCallback(
    (hero: HeroRow, state: HeroProgress): boolean => {
      const max = maxTarget(hero);
      const skillsDone = hero.fusionLevels
        ? state.fusion >= max.fusion
        : max.skills.every((v, i) => (state.skills[i] ?? 1) >= v);
      return (
        state.level >= max.level &&
        state.affinity >= max.affinity &&
        state.transcend >= max.transcend &&
        skillsDone &&
        max.ee.every((v, i) => (state.ee[i] ?? 0) >= v)
      );
    },
    [maxTarget],
  );

  /** Ce que les filtres du roster laissent passer, réglages de masquage compris. */
  const trackedRows = useMemo(
    () =>
      heroes.filter((h) => {
        const entry = tracked[h.id];
        if (!entry || hidden.has(h.id) || !shown(h)) return false;
        if (filters.element && h.element !== filters.element) return false;
        if (filters.class && h.class !== filters.class) return false;
        if (filters.rarity && h.rarity !== filters.rarity) return false;
        if (store.hideMaxed && isMaxed(h, entry.state)) return false;
        const need = needs.get(h.id);
        if (store.hideDone && (!need || !hasWork(need))) return false;
        return true;
      }),
    [heroes, tracked, hidden, shown, filters, needs, store.hideMaxed, store.hideDone, isMaxed],
  );

  /**
   * L'ORDRE est figé tant que la question posée ne change pas — critère, sens,
   * filtres, ensemble des héros suivis. Un tri recalculé à chaque frappe faisait
   * sauter la carte qu'on est en train de remplir sous le curseur : monter un
   * niveau déplaçait le héros, et on éditait le suivant sans l'avoir voulu.
   * Recliquer le critère actif inverse le sens — et redonne donc un ordre frais.
   */
  /** L'ordre demandé, recalculé à chaque saisie — c'est lui qu'on fige au besoin. */
  const liveSorted = useMemo(() => {
    const value = (h: HeroRow): number => {
      const entry = tracked[h.id];
      if (sort.by === 'level') return entry?.state.level ?? 0;
      if (sort.by === 'affinity') return entry?.state.affinity ?? 0;
      const n = needs.get(h.id);
      // Un héros fini passe DERRIÈRE, quel que soit le sens : il n'a plus de
      // besoin à comparer.
      return !n || !hasWork(n) ? -1 : Object.values(n.items).reduce((a, b) => a + b, 0);
    };
    const rows = [...trackedRows].sort((a, b) =>
      sort.by === 'name'
        ? a.name.localeCompare(b.name)
        : value(a) - value(b) || a.name.localeCompare(b.name),
    );
    return sort.desc ? rows.reverse() : rows;
  }, [trackedRows, sort, tracked, needs]);

  /**
   * ÉDITER GÈLE L'ORDRE. Trier par niveau ou par besoin, c'est trier sur ce que
   * l'on est justement en train de changer : la carte ouverte se déplaçait sous
   * le curseur à chaque « + ». Déplier un héros fige donc la liste telle qu'elle
   * est ; changer de tri, de filtre ou de roster la dégèle.
   */
  const sortedRows = useMemo(() => {
    if (!frozen) return liveSorted;
    const rank = new Map(frozen.map((id, i) => [id, i]));
    // Un héros absent du gel (ajouté depuis) se range à la fin, sans bousculer
    // ceux qu'on a sous les yeux.
    return [...liveSorted].sort(
      (a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity),
    );
  }, [liveSorted, frozen]);

  /** Suivis en tout — pour dire combien les réglages en escamotent. */
  const trackedTotal = useMemo(
    () => heroes.filter((h) => tracked[h.id] && !hidden.has(h.id)).length,
    [heroes, tracked, hidden],
  );

  const q = normalizeSearchText(query);
  const pickable = useMemo(
    () =>
      heroes.filter(
        (h) =>
          // Un héros déjà suivi n'a rien à faire dans « ajouter » : il vit
          // dans la liste au-dessus, avec son bouton pour en sortir.
          !tracked[h.id] &&
          !hidden.has(h.id) &&
          shown(h) &&
          (!element || h.element === element) &&
          (!q || h.searchNames.some((n) => n.includes(q))),
      ),
    [heroes, tracked, hidden, shown, element, q],
  );

  return { shopping, itemTotal, trackedRows, sortedRows, trackedTotal, pickable };
}
