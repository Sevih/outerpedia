'use client';

/**
 * État du COMPTE suivi — extrait du composant principal (découpage du
 * 03/10/2026 — déplacement mécanique, logique inchangée). Le hook possède :
 *   - le store localStorage (héros suivis, choix de fusion, réglages) et les
 *     états de session de l'écran (recherche, axe, carte dépliée, tiroir,
 *     filtres, tri, gel de l'ordre — `onImport` et `toggle` en remettent à
 *     zéro, c'est pour ça qu'ils vivent ici) ;
 *   - les barèmes rendus au moteur (`ladder`, `fullRules`, planchers et
 *     plafonds), le besoin de chaque héros, puis celui du compte ;
 *   - les écritures : `update`, `toggle`, `onImport`.
 * Le composant principal DESTRUCTURE le retour sous les MÊMES noms que les
 * anciennes déclarations : le JSX n'a pas bougé d'une ligne.
 */
import { useCallback, useMemo, useState } from 'react';
import { useStoredState } from '@/lib/client-storage';
import {
  MAX_SKILL,
  SKILL_SLOTS,
  START_LEVEL,
  type HeroRow,
  type HeroTrackerData,
  type RosterFilters,
  type SortKey,
  type TranscendStep,
} from './contracts';
import {
  accountNeed,
  heroNeed,
  type GrowthRules,
  type HeroNeed,
  type HeroProgress,
  type NeedAxis,
  type TrackedHero,
} from './engine';
import {
  FORMAT as ROSTER_FORMAT,
  importRoster,
  RosterImportError,
  type HeroEntry,
  type ImportHero,
} from './roster-import';
import { SPEC } from './stores';

export function useTrackerState({
  heroes,
  rules,
  transcend,
  labels,
}: Pick<HeroTrackerData, 'heroes' | 'rules' | 'transcend' | 'labels'>) {
  const [store, setStore, ready] = useStoredState(SPEC);
  const [query, setQuery] = useState('');
  const [axis, setAxis] = useState<NeedAxis | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [element, setElement] = useState<string | null>(null);
  /** Filtres du roster suivi — de session : ils trient un écran, pas un compte. */
  const [filters, setFilters] = useState<RosterFilters>({
    element: null,
    class: null,
    rarity: null,
  });
  const [sort, setSort] = useState<{ by: SortKey; desc: boolean }>({ by: 'need', desc: true });

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
      const raw = store.alwaysMax ? maxTarget(h) : entry.target;
      const target = h.fusionLevels ? { ...raw, fusion: Math.max(raw.fusion, 1) } : raw;
      // Planchers du jeu : un fusionné a forcément franchi l'étoile exigée et
      // le premier palier de fusion. Une saisie plus basse (ou antérieure à ces
      // règles) facturerait des coûts que le jeu impose d'avoir déjà payés.
      const state = {
        ...entry.state,
        transcend: Math.max(entry.state.transcend, minTranscend(h)),
        fusion: h.fusionLevels ? Math.max(entry.state.fusion, 1) : entry.state.fusion,
      };
      out.set(h.id, heroNeed(asTracked(h), state, target, fullRules));
    }
    return out;
  }, [heroes, tracked, hidden, store.alwaysMax, maxTarget, minTranscend, asTracked, fullRules]);

  /**
   * Un héros DÉCOMPTÉ : sa carte se remplit et affiche son besoin (il est vrai),
   * mais il n'entre dans aucun total. Personne ne farme les manuels d'un 1★ —
   * les compter noyait la liste de courses sous des lignes qu'on n'achètera pas.
   */
  /** Masqué par réglage : le héros disparaît de l'écran, suivi ou non. */
  const shown = useCallback(
    (hero: HeroRow): boolean =>
      !(hero.rarity === 1 && store.hide1Star) && !(hero.rarity === 2 && store.hide2Star),
    [store.hide1Star, store.hide2Star],
  );

  const counted = useCallback(
    (hero: HeroRow): boolean =>
      !(hero.rarity === 1 && store.ignore1Star) && !(hero.rarity === 2 && store.ignore2Star),
    [store.ignore1Star, store.ignore2Star],
  );

  const total = useMemo(() => {
    const kept: HeroNeed[] = [];
    for (const [id, need] of needs) {
      const hero = heroById.get(id);
      if (hero && counted(hero)) kept.push(need);
    }
    return accountNeed(kept);
  }, [needs, counted, heroById]);

  const defaults = useCallback(
    (hero: HeroRow): HeroEntry => ({
      state: {
        level: START_LEVEL,
        skills: Array(SKILL_SLOTS).fill(1),
        // Un fusionné qu'on possède est déjà fusionné : ses skills partent de 1.
        fusion: hero.fusionLevels ? 1 : 0,
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

  /** Ordre gelé pendant l'édition (cf. `sortedRows`) — `null` = on suit le tri. */
  const [frozen, setFrozen] = useState<string[] | null>(null);

  /**
   * IMPORT d'un roster capturé. Le fichier ne parle qu'en termes de jeu (étoile
   * interne, niveau de fusion) : c'est ici qu'on lui donne les barèmes — échelle
   * de transcendance du héros, plafonds de chaque axe — puisque le module
   * d'import, lui, ne connaît aucune table.
   */
  const [importState, setImportState] = useState<{ ok: boolean; message: string } | null>(null);
  const onImport = useCallback(
    async (file: File) => {
      try {
        const raw: unknown = JSON.parse(await file.text());
        const byId = new Map<string, ImportHero>(
          heroes.map((h) => [
            h.id,
            {
              id: h.id,
              ...(h.fusionId ? { fusionId: h.fusionId } : {}),
              ...(h.fusionLevels ? { fusionSteps: h.fusionLevels.length } : {}),
              stars: ladder(asTracked(h)).map((s) => s.star),
              max: maxTarget(h),
            },
          ]),
        );
        const r = importRoster(raw, byId);
        if (r.imported === 0) {
          setImportState({ ok: false, message: labels.importEmpty });
          return;
        }
        // Le roster est REMPLACÉ, pas fusionné : un import partiel qui laisserait
        // des héros d'une capture précédente donnerait un total invérifiable.
        setStore((prev) => ({ ...prev, heroes: r.heroes, fused: r.fused }));
        setOpen(null);
        setFrozen(null);
        setImportState({
          ok: true,
          message:
            labels.importDone.replace('{count}', String(r.imported)) +
            (r.unknown.length
              ? ` · ${labels.importUnknown.replace('{count}', String(r.unknown.length))}`
              : ''),
        });
      } catch (e) {
        // Un JSON illisible n'est pas un roster non plus : même message que
        // l'enveloppe inconnue, plutôt que l'erreur brute (anglaise) du parseur.
        const err =
          e instanceof RosterImportError
            ? e
            : new RosterImportError('format', { format: ROSTER_FORMAT });
        const template = {
          format: labels.importErrFormat,
          version: labels.importErrVersion,
          heroes: labels.importErrHeroes,
        }[err.code];
        setImportState({
          ok: false,
          message: template.replace(/\{(\w+)\}/g, (m, k: string) => err.params[k] ?? m),
        });
      }
    },
    [heroes, ladder, asTracked, maxTarget, setStore, labels],
  );

  const toggle = (hero: HeroRow) => {
    setFrozen(null);
    setStore((prev) => {
      const next = { ...prev.heroes };
      if (next[hero.id]) delete next[hero.id];
      else next[hero.id] = defaults(hero);
      return { ...prev, heroes: next };
    });
  };

  const withTarget = !store.alwaysMax;

  return {
    store,
    setStore,
    ready,
    query,
    setQuery,
    axis,
    setAxis,
    open,
    setOpen,
    picking,
    setPicking,
    element,
    setElement,
    filters,
    setFilters,
    sort,
    setSort,
    tracked,
    heroById,
    ladder,
    asTracked,
    hidden,
    fusionPairs,
    minTranscend,
    maxTarget,
    needs,
    shown,
    counted,
    total,
    update,
    frozen,
    setFrozen,
    importState,
    onImport,
    toggle,
    withTarget,
  };
}
