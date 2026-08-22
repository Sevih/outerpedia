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
import { importRoster, type HeroEntry, type ImportHero } from './roster-import';

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
  /** Tags (`premium`, `festival`…) — ils disent comment le héros s'obtient. */
  tags: string[];
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
  giftNoteBonus: string;
  reset: string;
  resetConfirm: string;
  trackedCount: string;
  settings: string;
  settingsFusion: string;
  settingsFusionHint: string;
  base: string;
  coreFusion: string;
  alwaysMax: string;
  hideMaxed: string;
  hideDone: string;
  rarityRules: string;
  hideShort: string;
  skipShort: string;
  notCounted: string;
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
  importTitle: string;
  importHint: string;
  importPick: string;
  importDone: string;
  importUnknown: string;
  importEmpty: string;
  sort: string;
  sortNeed: string;
  sortName: string;
  noMatch: string;
  piecesPremium: string;
  piecesLimited: string;
  scaleHint: string;
  now: string;
  goal: string;
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
  /** Nom traduit de chaque élément — les pièces se groupent comme on les farme. */
  elementNames: Record<string, string>;
  /** Tags de la famille « limited » du glossaire (festival/seasonal/collab). */
  limitedTags: string[];
  /** Nom traduit de chaque classe — infobulle des filtres du roster. */
  classNames: Record<string, string>;
  labels: HeroTrackerLabels;
}

interface TrackerState {
  heroes: Record<string, HeroEntry>;
  /** id du héros de BASE → on possède sa Core Fusion plutôt que lui. */
  fused: Record<string, boolean>;
  /** Tout viser au maximum : les cibles ne se saisissent plus, l'écran s'allège. */
  alwaysMax: boolean;
  /** Sortir de la liste les héros déjà au PLAFOND de chaque axe. */
  hideMaxed: boolean;
  /** Sortir de la liste les héros qui n'ont plus rien à farmer POUR LEUR cible. */
  hideDone: boolean;
  /** Laisser les héros 1★ / 2★ HORS des totaux (leur carte reste éditable). */
  ignore1Star: boolean;
  ignore2Star: boolean;
  /** Les sortir de l'écran — roster suivi ET tiroir « ajouter ». */
  hide1Star: boolean;
  hide2Star: boolean;
}

/** Schéma v1 : les entrées à plat, un seul EE, trois slots de skill. */
interface LegacyEntry {
  state: Omit<HeroProgress, 'ee' | 'fusion'> & { ee: number };
  target: Omit<HeroProgress, 'ee' | 'fusion'> & { ee: number };
}

/** Ce sur quoi on trie le roster suivi. `need` = le volume qu'il reste à farmer. */
type SortKey = 'need' | 'level' | 'affinity' | 'name';
interface RosterFilters {
  element: string | null;
  class: string | null;
  rarity: number | null;
}
/** Le sens NATUREL de chaque critère : le plus gros besoin d'abord, les niveaux
 *  et affinités les plus BAS d'abord (c'est ce qu'il reste à monter), noms A→Z. */
const SORT_DESC: Record<SortKey, boolean> = {
  need: true,
  level: false,
  affinity: false,
  name: false,
};

/** Les réglages qui sont de simples cases à cocher. */
type BoolSetting =
  | 'alwaysMax'
  | 'hideMaxed'
  | 'hideDone'
  | 'ignore1Star'
  | 'ignore2Star'
  | 'hide1Star'
  | 'hide2Star';

const SKILL_SLOTS = 4;
const MAX_SKILL = 5;
/** Un héros se recrute au niveau 5 : rien en dessous n'existe en jeu. */
const START_LEVEL = 5;
/**
 * Bonus du cadeau préféré (curé dans le guide heroes-growth, aucune table).
 * TOUJOURS appliqué : offrir autre chose que son cadeau préféré à un héros qu'on
 * monte n'a aucune raison d'arriver — le compter serait un majorant pour rien.
 */
const PREFERRED_GIFT_BONUS = 0.5;
/** Au-delà, l'appui devient « je vise » plutôt que « j'en suis là ». */
const LONG_PRESS_MS = 450;
/**
 * Héros dont les pièces NE tombent PAS dans les donjons d'élément : elles ne se
 * farment pas, elles s'achètent ou se gagnent en bannière. Les grouper avec un
 * élément promettrait une source qui n'existe pas.
 *
 * Deux familles, et pas une : « limité » au sens du joueur couvre TOUT ce qui ne
 * revient pas — festival, saisonnier, collaboration — là où les tags les
 * distinguent par occasion. Le premium, lui, reste achetable.
 *
 * La composition de la famille arrive en prop (`limitedTags`) : elle se déclare
 * dans `data/curated/tags.json` et se lit avec `tagsInGroup`, côté serveur —
 * ce composant est client et n'a pas accès au glossaire.
 */
const piecesApart = (limitedTags: string[]): { key: string; tags: string[] }[] => [
  { key: 'premium', tags: ['premium'] },
  { key: 'limited', tags: limitedTags },
];

/**
 * Paliers d'affinité où l'on s'arrête vraiment : 10 débloque l'équipement
 * exclusif, puis 20/40/60/80/100 donnent des stats. Aucune table ne les porte
 * (cf. le générateur hero-growth) — les paliers 30 et 70, qui n'ajoutent qu'une
 * conversation, ne sont une raison de viser pour personne.
 */
const AFFINITY_PRESETS = [10, 20, 40, 60, 80, 100];

const SPEC: StoreSpec<TrackerState> = {
  key: 'outerpedia:hero-tracker',
  version: 2,
  fallback: {
    heroes: {},
    fused: {},
    alwaysMax: false,
    hideMaxed: false,
    hideDone: false,
    ignore1Star: false,
    ignore2Star: false,
    hide1Star: false,
    hide2Star: false,
  },
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
    return {
      heroes,
      fused: {},
      alwaysMax: false,
      hideMaxed: false,
      hideDone: false,
      ignore1Star: false,
      ignore2Star: false,
      hide1Star: false,
      hide2Star: false,
    };
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

export function HeroTrackerBrowser({
  heroes,
  rules,
  transcend,
  items,
  elementNames,
  limitedTags,
  classNames,
  labels,
}: HeroTrackerData) {
  const [stored, writeStore, ready] = useStoredState(SPEC);
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

  /**
   * Le stockage peut venir d'un état écrit AVANT l'ajout d'un réglage : le champ
   * manquant rendrait sa case NON CONTRÔLÉE (React proteste, et la case cesse de
   * répondre). On complète donc aux DEUX bouts — à la lecture pour l'affichage,
   * à l'écriture pour que le stockage se répare au premier changement. Bumper la
   * version du schéma pour une case à cocher se paierait en saisie perdue.
   */
  const store = useMemo(() => ({ ...SPEC.fallback, ...stored }), [stored]);
  const setStore = useCallback(
    (fn: (prev: TrackerState) => TrackerState) =>
      writeStore((prev) => fn({ ...SPEC.fallback, ...prev })),
    [writeStore],
  );

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
        if (r.imported === 0) throw new Error(labels.importEmpty);
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
        setImportState({ ok: false, message: e instanceof Error ? e.message : String(e) });
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

  const q = query.trim().toLowerCase();
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
          (!q || h.searchNames.some((n) => n.toLowerCase().includes(q))),
      ),
    [heroes, tracked, hidden, shown, element, q],
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
          elementNames={elementNames}
          limitedTags={limitedTags}
          axis={axis}
          onAxis={setAxis}
          labels={labels}
        />
        <Settings
          store={store}
          setStore={setStore}
          fusionPairs={fusionPairs}
          trackedCount={trackedRows.length}
          onImport={onImport}
          importState={importState}
          labels={labels}
        />
      </div>

      {/* ══ Colonne héros ══ */}
      <div className="space-y-3" aria-busy={!ready}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-content-strong text-base font-semibold">
            {labels.myHeroes}{' '}
            <span className="text-content-muted font-normal">
              {/* « 4 / 12 » quand un réglage en masque : sans ça, des héros
                  disparaissent sans que rien ne le dise. */}
              {trackedRows.length}
              {trackedRows.length !== trackedTotal && ` / ${trackedTotal}`}
            </span>
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

        {trackedTotal > 0 && (
          <RosterBar
            filters={filters}
            onFilters={(f) => {
              setFrozen(null);
              setFilters(f);
            }}
            sort={sort}
            onSort={(s) => {
              setFrozen(null);
              setSort(s);
            }}
            elementNames={elementNames}
            classNames={classNames}
            labels={labels}
          />
        )}

        {trackedTotal === 0 && !picking ? (
          <EmptyState labels={labels} onPick={() => setPicking(true)} />
        ) : sortedRows.length === 0 ? (
          // Suivre des héros et n'en voir aucun est un ÉTAT DE FILTRE, pas un
          // roster vide : proposer « choisir mes héros » ici serait un contresens.
          <p className="border-line-subtle text-content-subtle rounded-xl border border-dashed px-4 py-6 text-center text-sm">
            {labels.noMatch}
          </p>
        ) : (
          <ul className="space-y-2">
            {sortedRows.map((hero) => (
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
                counted={counted(hero)}
                expanded={open === hero.id}
                onExpand={() => {
                  setFrozen((f) => f ?? sortedRows.map((h) => h.id));
                  setOpen((v) => (v === hero.id ? null : hero.id));
                }}
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
  elementNames,
  limitedTags,
  axis,
  onAxis,
  labels,
}: {
  total: ReturnType<typeof accountNeed>;
  shopping: ShoppingRow[];
  itemTotal: number;
  heroById: Map<string, HeroRow>;
  elementNames: Record<string, string>;
  limitedTags: string[];
  axis: NeedAxis | 'all';
  onAxis: (a: NeedAxis | 'all') => void;
  labels: HeroTrackerLabels;
}) {
  const axisLabel: Record<NeedAxis, string> = {
    level: labels.level,
    skills: labels.skills,
    ee: labels.ee,
  };
  /**
   * Les pièces se farment par ÉLÉMENT : on les groupe comme on les récolte, du
   * plus gros besoin au plus petit. Premium et limités n'ont pas cette porte de
   * sortie et font leurs propres groupes — sinon la colonne « feu » promettrait
   * un donjon qui ne les donnera jamais.
   */
  const pieceGroups = useMemo(() => {
    const apart = piecesApart(limitedTags);
    const rows = Object.entries(total.pieces).map(([id, { pieces: count, steps }]) => ({
      id,
      count,
      steps,
      hero: heroById.get(id),
    }));
    const family = (r: (typeof rows)[number]) =>
      apart.find((f) => r.hero?.tags?.some((t) => f.tags.includes(t)))?.key;
    const order = (a: { count: number }, b: { count: number }) => b.count - a.count;
    const groups: {
      key: string;
      /** `null` = un groupe à part : aucun donjon d'élément derrière lui. */
      element: string | null;
      label: string;
      rows: typeof rows;
    }[] = ELEMENTS.map((el) => ({
      key: el,
      element: el,
      label: elementNames[el] ?? el,
      rows: rows.filter((r) => !family(r) && r.hero?.element === el).sort(order),
    }));
    const apartLabel: Record<string, string> = {
      premium: labels.piecesPremium,
      limited: labels.piecesLimited,
    };
    for (const f of apart) {
      groups.push({
        key: f.key,
        element: null,
        label: apartLabel[f.key],
        rows: rows.filter((r) => family(r) === f.key).sort(order),
      });
    }
    return groups.filter((g) => g.rows.length > 0);
  }, [
    total.pieces,
    heroById,
    elementNames,
    limitedTags,
    labels.piecesPremium,
    labels.piecesLimited,
  ]);

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
          <p className="text-content-subtle text-[11px]">{labels.giftNoteBonus}</p>
        )}

        {pieceGroups.length > 0 && (
          <div className="border-line-subtle bg-surface-sunken rounded-lg border border-dashed p-2.5">
            <h3 className="text-content-muted font-mono text-[11px] tracking-wide uppercase">
              {labels.piecesNote}
            </h3>
            <div className="mt-2 space-y-2.5">
              {pieceGroups.map((g) => (
                <div key={g.key}>
                  <h4 className="text-content-subtle flex items-center gap-1 font-mono text-[10px] tracking-wide uppercase">
                    {g.element && (
                      <img
                        src={img.element(g.element)}
                        alt=""
                        aria-hidden
                        width={14}
                        height={14}
                        className="h-3.5 w-3.5"
                      />
                    )}
                    {g.label}
                  </h4>
                  {/* L'icône porte le héros, le nombre porte le besoin : le nom
                      n'apporterait qu'une colonne de texte tronqué. */}
                  <ul className="mt-1 grid grid-cols-3 gap-1.5">
                    {g.rows.map((r) => (
                      <li
                        key={r.id}
                        title={`${r.hero?.name ?? r.id} — ×${fmt(r.count)} ${labels.dupes.replace(
                          '{count}',
                          String(r.steps),
                        )}`}
                        className="border-line-subtle bg-surface-raised flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5"
                      >
                        <PieceIcon id={r.id} large />
                        <span className="text-content-strong font-mono text-[11px] font-semibold">
                          ×{fmt(r.count)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
  onImport,
  importState,
  labels,
}: {
  store: TrackerState;
  setStore: (fn: (prev: TrackerState) => TrackerState) => void;
  fusionPairs: { base: HeroRow; fusion: HeroRow }[];
  trackedCount: number;
  onImport: (file: File) => void;
  /** Compte rendu du dernier import — il ne survit pas au rechargement. */
  importState: { ok: boolean; message: string } | null;
  labels: HeroTrackerLabels;
}) {
  const check = (key: BoolSetting, text: string) => (
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
        {check('hideDone', labels.hideDone)}
        {check('hideMaxed', labels.hideMaxed)}

        {/* Les petites raretés en GRILLE : quatre phrases entières auraient rempli
            la colonne pour dire deux fois la même chose sur deux raretés. */}
        <div>
          <h3 className="text-content-strong text-xs font-semibold">{labels.rarityRules}</h3>
          <table className="mt-1.5 w-full text-[11px]">
            <thead>
              <tr className="text-content-subtle">
                <th />
                <th className="font-normal">{labels.hideShort}</th>
                <th className="font-normal">{labels.skipShort}</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  [1, 'hide1Star', 'ignore1Star'],
                  [2, 'hide2Star', 'ignore2Star'],
                ] as const
              ).map(([star, hideKey, skipKey]) => (
                <tr key={star}>
                  <td className="text-warn font-mono">{star}★</td>
                  {[hideKey, skipKey].map((key) => (
                    <td key={key} className="text-center">
                      <input
                        type="checkbox"
                        aria-label={`${star}★ — ${key === hideKey ? labels.hideShort : labels.skipShort}`}
                        checked={store[key]}
                        onChange={(e) => setStore((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="accent-accent"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

        <div className="border-line-subtle border-t pt-2.5">
          <h3 className="text-content-strong text-xs font-semibold">{labels.importTitle}</h3>
          <p className="text-content-subtle mt-0.5 text-[11px]">{labels.importHint}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <label className="border-line text-content-muted hover:border-accent hover:text-accent cursor-pointer rounded border px-2 py-1 text-[11px] transition-colors">
              {labels.importPick}
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // Le champ garde son fichier : sans reset, réimporter LE MÊME
                  // après correction ne déclencherait aucun événement.
                  e.target.value = '';
                  if (file) onImport(file);
                }}
              />
            </label>
            {importState && (
              <span
                className={`text-[11px] ${importState.ok ? 'text-success' : 'text-danger'}`}
                role="status"
              >
                {importState.message}
              </span>
            )}
          </div>
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
  counted,
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
  /** Ce héros entre-t-il dans les totaux ? (réglages « ignorer les 1★/2★ ») */
  counted: boolean;
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
   * Paliers de niveau proposés : le plafond AVANT limit break (100 — là où
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

  /**
   * Paliers d'enchantement qui CHANGENT quelque chose : celui qui ouvre un slot
   * de gemme (5) et le maximum (10, qui débloque la passive). Dérivés du barème
   * plutôt qu'écrits à la main.
   */
  const eeStops = useMemo(() => {
    const set = new Set<number>([rules.eeEnchant.length]);
    for (const r of rules.eeEnchant) if (r.gemSlot > 0) set.add(r.level);
    return [...set].sort((a, b) => a - b);
  }, [rules.eeEnchant]);

  // Même code couleur que les axes dépliés : en clair ce qu'on a, en accent ce
  // qu'on vise. Deux nombres nus séparés d'une flèche ne se distinguaient pas.
  const aim = (from: string, to: string) => (
    <>
      <span className="text-content-strong">{from}</span>
      <span className="text-content-subtle"> → </span>
      <span className="text-accent">{to}</span>
    </>
  );
  /**
   * Le résumé ne dit QUE ce qu'il reste : un axe déjà à sa cible n'y figure pas.
   * « 6★ → 6★ » occupait la ligne pour annoncer qu'il n'y avait rien à faire.
   */
  const goalLevel = withTarget ? target.level : rules.xpCurve.length;
  const goalTranscend = withTarget ? target.transcend : steps.length - 1;
  const parts: React.ReactNode[] = [];
  if (state.level < goalLevel) {
    parts.push(
      <>
        {labels.level} {aim(`${state.level}`, `${goalLevel}`)}
      </>,
    );
  }
  if (state.transcend < goalTranscend) {
    parts.push(aim(starLabel(steps[state.transcend]), starLabel(steps[goalTranscend])));
  }
  // L'affinité ne se paie qu'en cadeaux : elle n'apparaît dans AUCUN décompte
  // d'objets, et sans ce segment un héros à qui il ne manque qu'elle n'aurait
  // rien à dire.
  const goalAffinity = withTarget ? target.affinity : rules.affinityCurve.length;
  if (state.affinity < goalAffinity) {
    parts.push(
      <>
        {labels.affinity} {aim(`${state.affinity}`, `${goalAffinity}`)}
      </>,
    );
  }
  if (objects > 0) parts.push(labels.itemCount.replace('{count}', fmt(objects)));
  // Reste l'or seul (une transcendance déjà couverte en doublons, par exemple) :
  // il y a du travail, la ligne ne peut pas rester vide.
  if (parts.length === 0 && need && need.gold > 0) parts.push(`${short(need.gold)} ${labels.gold}`);
  const summary = done ? (
    labels.doneHero
  ) : (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && ' · '}
          {part}
        </span>
      ))}
    </>
  );

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
              // Les étoiles du portrait suivent la TRANSCENDANCE saisie : un héros
              // 6★ affiché à sa rareté de base, c'est l'écran qui dément la saisie.
              transcendence={steps[state.transcend]?.star}
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
              {!counted && (
                <span className="text-content-subtle border-line-subtle ml-1.5 rounded border px-1 text-[10px] uppercase">
                  {labels.notCounted}
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
        // Deux COLONNES, pas une grille : les axes n'ont pas la même hauteur (les
        // skills en font quatre rangées), et une grille alignait leurs lignes —
        // le niveau se retrouvait seul en haut d'une case vide. Le flux de
        // colonnes les enchaîne, chacun gardant sa hauteur.
        <div className="px-2.5 py-3">
          <div className="space-y-3.5 md:columns-2 md:space-y-0 md:gap-x-5 md:*:mb-3.5 md:*:break-inside-avoid">
            {/* ── Niveau ── */}
            <Field
              label={labels.level}
              value={`${state.level}`}
              target={`${withTarget ? target.level : rules.xpCurve.length}`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <Rail role={labels.now}>
                  <Stepper
                    value={state.level}
                    min={START_LEVEL}
                    max={rules.xpCurve.length}
                    onChange={(v) => onChange('state', { level: v })}
                  />
                </Rail>
                <Rail role={withTarget ? labels.goal : labels.now} aim={withTarget}>
                  <Presets
                    values={jumps}
                    active={withTarget ? target.level : state.level}
                    aim={withTarget}
                    onPick={(v) => onChange(withTarget ? 'target' : 'state', { level: v })}
                  />
                </Rail>
              </div>
            </Field>

            {/* ── Compétences (ou palier de fusion) ── */}
            {hero.fusionLevels ? (
              <Field
                label={labels.fusionLevel}
                value={`${Math.max(state.fusion, 1)}`}
                target={`${withTarget ? Math.max(target.fusion, 1) : hero.fusionLevels.length}`}
                hint={withTarget ? labels.scaleHint : undefined}
              >
                <Scale
                  // Les skills d'un fusionné DÉMARRENT au niveau 1 : posséder le
                  // fusionné, c'est l'avoir débloqué. Le palier 1 du barème (les
                  // 300 cores de la fusion) est donc déjà payé, jamais compté, et
                  // ni l'état ni la cible ne peuvent redescendre à 0.
                  values={Array.from({ length: hero.fusionLevels.length }, (_, i) => i + 1)}
                  current={Math.max(state.fusion, 1)}
                  target={withTarget ? Math.max(target.fusion, 1) : hero.fusionLevels.length}
                  withTarget={withTarget}
                  onCurrent={(v) => onChange('state', { fusion: v })}
                  onTarget={(v) => onChange('target', { fusion: v })}
                />
              </Field>
            ) : (
              <Field label={labels.skills} hint={withTarget ? labels.scaleHint : undefined}>
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
                        onCurrent={(v) =>
                          onChange('state', { skills: replace(state.skills, i, v) })
                        }
                        onTarget={(v) =>
                          onChange('target', { skills: replace(target.skills, i, v) })
                        }
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
              target={starLabel(steps[withTarget ? target.transcend : steps.length - 1])}
              hint={withTarget ? labels.scaleHint : undefined}
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
              target={`${withTarget ? target.affinity : rules.affinityCurve.length}`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <Rail role={labels.now}>
                  <Stepper
                    value={state.affinity}
                    min={1}
                    max={rules.affinityCurve.length}
                    onChange={(v) => onChange('state', { affinity: v })}
                  />
                </Rail>
                <Rail role={withTarget ? labels.goal : labels.now} aim={withTarget}>
                  <Presets
                    values={AFFINITY_PRESETS.filter((n) => n <= rules.affinityCurve.length)}
                    active={withTarget ? target.affinity : state.affinity}
                    aim={withTarget}
                    onPick={(v) => onChange(withTarget ? 'target' : 'state', { affinity: v })}
                  />
                </Rail>
              </div>
            </Field>

            {/* ── Équipement(s) exclusif(s) ── */}
            {state.ee.map((_, i) => (
              <Field
                key={i}
                label={i === 0 ? labels.ee : labels.eeFusion}
                value={`+${state.ee[i] ?? 0}`}
                target={`+${withTarget ? (target.ee[i] ?? 0) : rules.eeEnchant.length}`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {hero.ee[i] && (
                    <EquipmentIcon
                      src={img.equipment(hero.ee[i].icon)}
                      grade={hero.ee[i].grade}
                      alt={hero.ee[i].name}
                      size={30}
                    />
                  )}
                  {/* Onze crans muets ne disaient rien : un pas à pas se lit. */}
                  <Rail role={labels.now}>
                    <Stepper
                      value={state.ee[i] ?? 0}
                      min={0}
                      max={rules.eeEnchant.length}
                      onChange={(v) => onChange('state', { ee: replace(state.ee, i, v) })}
                    />
                  </Rail>
                  <Rail role={withTarget ? labels.goal : labels.now} aim={withTarget}>
                    <Presets
                      values={eeStops}
                      active={withTarget ? (target.ee[i] ?? 0) : (state.ee[i] ?? 0)}
                      aim={withTarget}
                      format={(v) => `+${v}`}
                      onPick={(v) =>
                        onChange(withTarget ? 'target' : 'state', {
                          ee: replace(withTarget ? target.ee : state.ee, i, v),
                        })
                      }
                    />
                  </Rail>
                </div>
              </Field>
            ))}
          </div>

          {/* ── Ce qui manque à CE héros ── */}
          <div className="border-line-subtle mt-3.5 border-t pt-2.5">
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
                {giftBreakdown(
                  need.affinityPoints,
                  rules.gifts,
                  hero.gift,
                  PREFERRED_GIFT_BONUS,
                ).map((b) => (
                  <NeedChip
                    key={b.entry.id}
                    asset={{ name: b.entry.name.en, icon: b.entry.icon, grade: b.entry.grade }}
                    count={b.count}
                  />
                ))}
                {need.pieces > 0 && (
                  <span
                    title={labels.pieces}
                    className="border-line-subtle bg-surface-sunken flex items-center gap-1.5 rounded-lg border py-1 pr-2 pl-1"
                  >
                    <PieceIcon id={hero.id} />
                    <span className="text-content-strong font-mono text-[11px] font-semibold">
                      ×{need.pieces}
                    </span>
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

/**
 * Un axe : intitulé, « j'en suis là → je vise ça », et son contrôle.
 *
 * Un seul code couleur dans tout l'écran, sinon les deux nombres se confondent :
 * ce qu'on POSSÈDE est écrit en clair, ce qu'on VISE est en accent.
 */
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
          <span className="font-mono text-xs font-semibold">
            <span className="text-content-strong">{value}</span>
            {target !== undefined && (
              <>
                <span className="text-content-subtle"> → </span>
                <span className="text-accent">{target}</span>
              </>
            )}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Étiquette de rôle collée au contrôle : « Actuel » devant le champ, « Objectif »
 * devant les paliers. Sans elle, deux rangées de chiffres se ressemblent et on ne
 * sait plus laquelle dit ce qu'on a.
 */
function Rail({
  role,
  aim = false,
  children,
}: {
  role: string;
  /** Ce contrôle pose la CIBLE — même accent que la cible dans l'en-tête. */
  aim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`font-mono text-[10px] tracking-wide uppercase ${
          aim ? 'text-accent/80' : 'text-content-subtle'
        }`}
      >
        {role}
      </span>
      {children}
    </span>
  );
}

/**
 * Pièce d'un héros. Elle n'est PAS un item — aucune ligne d'inventaire, aucun
 * sprite : son icône se compose (portrait masqué + cadre du jeu) au datagen, et
 * porte donc déjà son cadre. La reposer dans une tuile de rareté en ferait deux.
 */
function PieceIcon({ id, large = false }: { id: string; large?: boolean }) {
  const px = large ? 40 : 22;
  return (
    <img
      src={img.piece(id)}
      alt=""
      aria-hidden
      width={px}
      height={px}
      className={`shrink-0 ${large ? 'h-10 w-10' : 'h-5.5 w-5.5'}`}
    />
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
    <div className="flex min-w-0 flex-1 gap-1">
      {values.map((v) => {
        const isReached = v <= current;
        // Trois états, trois looks : ACQUIS (plein), RESTE À FAIRE (accent
        // discret — la couleur de la cible partout ailleurs), HORS CIBLE (éteint).
        // Deux gris presque identiques ne se distinguaient pas.
        const isAimed = v <= target;
        const tint = isReached
          ? reached
          : isAimed
            ? 'border-accent/40 bg-accent/10 text-accent/80'
            : 'border-line-subtle bg-surface-sunken text-line';
        return (
          <button
            key={v}
            type="button"
            {...press(v)}
            aria-label={String(render ? render(v) : v)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-px rounded-md border font-mono text-[11px] leading-none font-semibold transition-colors ${
              icon ? 'h-10' : 'h-9'
            } ${tint} ${
              // Le cran visé porte un liseré, même s'il est déjà acquis.
              withTarget && v === target ? 'ring-accent ring-1' : ''
            }`}
          >
            {icon?.(v, isReached)}
            {render ? render(v) : v}
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
  // Largeur NATURELLE : ces axes tiennent en trois chiffres au plus, un champ
  // étiré sur toute la rangée pour afficher « 0 » ne sert personne.
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button type="button" onClick={() => onChange(Math.max(value - 1, min))} className={btn}>
        −
      </button>
      <NumberField value={value} min={min} max={max} onChange={onChange} />
      <button type="button" onClick={() => onChange(Math.min(value + 1, max))} className={btn}>
        +
      </button>
    </div>
  );
}

/**
 * Paliers d'un axe : les valeurs auxquelles on s'arrête vraiment. Ils posent la
 * CIBLE — ce sont des objectifs (« je le monte à 110 »), pas des états qu'on
 * déclare ; quand les cibles sont masquées, ils deviennent un raccourci d'état.
 */
function Presets({
  values,
  active,
  aim,
  onPick,
  format,
}: {
  values: number[];
  active: number;
  /** Ces paliers posent la CIBLE (accent) plutôt que l'état (clair). */
  aim: boolean;
  onPick: (v: number) => void;
  format?: (v: number) => string;
}) {
  const picked = aim
    ? 'border-accent bg-accent/15 text-accent font-semibold'
    : 'border-line bg-surface-overlay text-content-strong font-semibold';
  return (
    <span className="flex flex-wrap gap-1">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={`h-9 min-w-10 rounded-lg border px-2 font-mono text-[11px] transition-colors ${
            active === v
              ? picked
              : 'border-line-subtle bg-surface-sunken text-content-muted hover:border-line'
          }`}
        >
          {format ? format(v) : v}
        </button>
      ))}
    </span>
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
      className="border-line-subtle bg-surface-sunken text-content-strong focus:border-accent h-9 w-14 shrink-0 rounded-lg border px-1.5 text-center font-mono text-sm font-semibold outline-none"
    />
  );
}

/* ─────────────────────────── Roster & état vide ─────────────────────────── */

const ELEMENTS = ['fire', 'water', 'earth', 'light', 'dark'] as const;
/** Les cinq classes et les trois raretés du jeu — filtres du roster suivi. */
const CLASSES = ['striker', 'defender', 'ranger', 'mage', 'healer'] as const;
const RARITIES = [3, 2, 1] as const;
const ELEMENT_TEXT: Record<string, string> = {
  fire: 'text-fire',
  water: 'text-water',
  earth: 'text-earth',
  light: 'text-light',
  dark: 'text-dark-elem',
};

/**
 * Barre du roster suivi : filtrer (élément / classe / rareté) et choisir l'ordre.
 * Un compte se remplit par paquets — « mes cinq feu », « mes soigneurs » — et une
 * liste de trente héros sans prise se parcourt à la molette.
 */
function RosterBar({
  filters,
  onFilters,
  sort,
  onSort,
  elementNames,
  classNames,
  labels,
}: {
  filters: RosterFilters;
  onFilters: (f: RosterFilters) => void;
  sort: { by: SortKey; desc: boolean };
  onSort: (s: { by: SortKey; desc: boolean }) => void;
  elementNames: Record<string, string>;
  classNames: Record<string, string>;
  labels: HeroTrackerLabels;
}) {
  const chip = (active: boolean) =>
    `flex h-7 items-center justify-center gap-1 rounded-md border px-1.5 transition-colors ${
      active
        ? 'border-accent bg-accent/15'
        : 'border-line-subtle hover:border-line opacity-70 hover:opacity-100'
    }`;

  const sorts: { key: SortKey; label: string }[] = [
    { key: 'need', label: labels.sortNeed },
    { key: 'level', label: labels.level },
    { key: 'affinity', label: labels.affinity },
    { key: 'name', label: labels.sortName },
  ];

  return (
    <div className="border-line-subtle bg-surface-sunken flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-2.5 py-2">
      <span className="flex gap-1">
        {ELEMENTS.map((el) => (
          <button
            key={el}
            type="button"
            title={elementNames[el] ?? el}
            onClick={() => onFilters({ ...filters, element: filters.element === el ? null : el })}
            className={chip(filters.element === el)}
          >
            <img src={img.element(el)} alt={elementNames[el] ?? el} width={18} height={18} />
          </button>
        ))}
      </span>

      <span className="flex gap-1">
        {CLASSES.map((cl) => (
          <button
            key={cl}
            type="button"
            title={classNames[cl] ?? cl}
            onClick={() => onFilters({ ...filters, class: filters.class === cl ? null : cl })}
            className={chip(filters.class === cl)}
          >
            <img src={img.klass(cl)} alt={classNames[cl] ?? cl} width={18} height={18} />
          </button>
        ))}
      </span>

      <span className="flex gap-1">
        {RARITIES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onFilters({ ...filters, rarity: filters.rarity === r ? null : r })}
            className={`${chip(filters.rarity === r)} text-warn font-mono text-[11px]`}
          >
            {r}★
          </button>
        ))}
      </span>

      <div className="flex-1" />

      <span className="flex flex-wrap items-center gap-1">
        <span className="text-content-subtle font-mono text-[10px] tracking-wide uppercase">
          {labels.sort}
        </span>
        {sorts.map((s) => {
          const active = sort.by === s.key;
          return (
            <button
              key={s.key}
              type="button"
              // Recliquer le critère actif inverse le sens — et c'est aussi ce
              // qui redonne un ordre frais quand la saisie l'a périmé.
              onClick={() =>
                onSort(
                  active ? { by: s.key, desc: !sort.desc } : { by: s.key, desc: SORT_DESC[s.key] },
                )
              }
              className={`h-7 rounded-md border px-2 text-[11px] transition-colors ${
                active
                  ? 'border-accent bg-accent/15 text-accent font-semibold'
                  : 'border-line-subtle text-content-muted hover:border-line'
              }`}
            >
              {s.label}
              {active && <span className="ml-0.5 font-mono">{sort.desc ? '↓' : '↑'}</span>}
            </button>
          );
        })}
      </span>
    </div>
  );
}

function HeroPicker({
  rows,
  query,
  onQuery,
  element,
  onElement,
  onToggle,
  labels,
}: {
  rows: HeroRow[];
  query: string;
  onQuery: (v: string) => void;
  element: string | null;
  onElement: (v: string | null) => void;
  onToggle: (hero: HeroRow) => void;
  labels: HeroTrackerLabels;
}) {
  return (
    <div className="border-line-subtle bg-surface-sunken space-y-2.5 rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-content-strong text-sm font-semibold">{labels.addHero}</h3>
        <span className="text-content-subtle font-mono text-[11px]">
          {labels.untracked.replace('{count}', String(rows.length))}
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
              className="block w-full hover:brightness-110"
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
