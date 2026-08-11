'use client';

import { useEffect, useDeferredValue, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { img } from '@/lib/images';
import { CharacterCard } from '@/components/character/CharacterCard';
import { joinDisplayName } from '@/lib/data/characters';
import {
  CharactersFiltersBar,
  type FiltersBarLabels,
} from '@/components/character/filters/CharactersFiltersBar';
import { FilterPill } from '@/components/character/filters/FilterPill';
import type { FilterOption } from '@/components/character/filters/AdvancedFiltersPanel';
import {
  transcendenceFullSteps,
  transcendenceLabel,
  transcendenceStars,
} from '@/lib/transcendence';
import { TIERS, TIER_COLORS, type Tier } from './tiers';

/**
 * LES PALIERS DU SÉLECTEUR (PvE) — les VRAIS, ceux du jeu (`TransStar`).
 *
 * Ce tableau valait `[3, 4, 5, 6]`, et ces nombres n'étaient PAS des paliers :
 * c'était le compte d'étoiles affichées, une lecture humaine. Le portrait, lui,
 * ne connaît que le palier — et les deux ne coïncident pas au-delà de 4 (le
 * palier 6 montre 5 étoiles, le palier 9 en montre 6). La pastille « 6★ »
 * rendait donc des portraits à 5 étoiles, et la « 5★ » des 4 étoiles avec un
 * « + » orange. La donnée curée portait la même lecture humaine et a été migrée
 * avec ce fichier ; son contrat, lui, disait déjà « transStar → tier ».
 *
 * Les paliers se LISENT dans la table du jeu plutôt que de se réécrire ici —
 * c'est justement cette réécriture qui avait divergé. On ne garde que les PLEINS
 * (3, 4, 6, 9 → 3★, 4★, 5★, 6★) : c'est la granularité à laquelle un rang
 * éditorial bascule, et trois pastilles à cinq étoiles qui ne se distingueraient
 * qu'à la teinte de la dernière ne feraient pas un filtre lisible.
 */
const PILL_RARITY = 3;
const TRANSCEND_STEPS = transcendenceFullSteps(PILL_RARITY);
/** Le palier de défaut : le plus haut, celui que `rank` décrit (6★). */
const TOP_STEP = TRANSCEND_STEPS[TRANSCEND_STEPS.length - 1];

/** Ligne allégée pour l'affichage + le filtrage (rang déjà résolu par MODE). */
export interface TierListRow {
  id: string;
  slug: string;
  /** Nom NU localisé — le titre est à part, cf. `prefix`. */
  name: string;
  /** Titre affiché au-dessus du nom (« Core Fusion », surnom). */
  prefix?: string | null;
  /** Nom court curé — le libellé sous la carte s'y rabat s'il déborde 2 lignes. */
  shortName?: string;
  /** Noms recherchables (toutes langues + id + slug), déjà normalisés. */
  searchNames: string[];
  element: string;
  class: string;
  rarity: number;
  role?: string;
  tags: string[];
  /** Rang du mode courant (PvE : `rank` 6★ ; PvP : `rankPvp`). */
  rank?: string;
  /**
   * Surcharges par PALIER de transcendance (PvE uniquement) — clés `TransStar`,
   * pas des comptes d'étoiles, et SPARSES : la curation ne note que les paliers
   * où la valeur change (cf. `atStep`).
   */
  rankByTranscend?: Record<string, string>;
  roleByTranscend?: Record<string, string>;
}

/**
 * La valeur curée au palier demandé — un ESCALIER, pas une table complète.
 *
 * La curation ne note QUE les paliers où le rang bascule : sur les sept crans,
 * les 14 persos concernés en portent quatre. Demander 5★+ quand seuls 3★, 4★,
 * 5★ et 6★ sont notés doit donc rendre le 5★ — le palier curé le plus haut qui
 * ne dépasse pas celui demandé. Sous le premier palier curé, c'est ce premier
 * qui s'applique ; aucun palier curé du tout → la valeur de base.
 *
 * Se rabattre directement sur la base (`?? rank`, ce que faisait ce composant
 * quand les quatre clés couvraient tout le sélecteur) donnerait à un 5★+ le rang
 * du 6★ : exactement l'inverse de ce que le cran veut dire.
 */
export function atStep(map: Record<string, string> | undefined, step: number, base?: string) {
  const steps = Object.keys(map ?? {})
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!steps.length) return base;
  const floor = steps.filter((s) => s <= step).pop() ?? steps[0];
  return map![String(floor)] ?? base;
}

export interface TierListBrowserLabels {
  disclaimer: string;
  /** Titre du sélecteur de transcendance (PvE uniquement). */
  transcendLevel?: string;
  charactersCount: string;
  bar: FiltersBarLabels;
  /** Options de rôle (valeur → libellé), ordre canonique — absent = pas de groupe. */
  roles?: FilterOption[];
  /** Légende sous le disclaimer (outils EE) : sens de chaque tier. */
  legend?: { tier: Tier; label: string }[];
}

/** Sérialise une liste en paramètre d'URL (vide → absent). */
const enc = (arr: (string | number)[]) => (arr.length ? arr.join(',') : undefined);

/**
 * Tier list par personnage (portage V2 — PvE/PvP/EE) : barre de filtres
 * (recherche, élément, classe, rareté, rôle si fourni), légende optionnelle
 * (outils EE), sélecteur de transcendance si `withTranscend` (PvE : le
 * rang/rôle d'un perso peut changer avec ses étoiles — repli sur le rang 6★),
 * rangées S→E. Filtres synchronisés à l'URL en paramètres à plat (idiome
 * `CharactersBrowser`, pas le `?z=` compressé de la V2).
 *
 * LES PORTRAITS SONT RENDUS AU PALIER QUE LA LISTE SUPPOSE, et c'est le rôle de
 * `atStep`/`step` : PvE le laisse choisir, PvP le FIXE au 6★ que son avertisse-
 * ment annonce (« assumes 6-star transcends »), les listes EE ne supposent rien
 * et montrent la rareté. Un portrait à 3 étoiles sous un texte qui promet du 6★
 * n'est pas un détail : c'est la page qui se contredit.
 */
export function TierListBrowser({
  rows,
  labels,
  withTranscend = false,
  fixedTranscend,
}: {
  rows: TierListRow[];
  labels: TierListBrowserLabels;
  withTranscend?: boolean;
  /**
   * Palier (`TransStar`) auquel rendre les portraits quand il n'y a pas de
   * sélecteur — l'hypothèse que la liste énonce. Omis = la rareté du perso.
   */
  fixedTranscend?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState('');
  const query = useDeferredValue(q);
  const [element, setElement] = useState<string[]>([]);
  const [klass, setKlass] = useState<string[]>([]);
  const [rarity, setRarity] = useState<number[]>([]);
  const [role, setRole] = useState<string[]>([]);
  const [transcend, setTranscend] = useState(TOP_STEP);

  const hydrated = useRef(false);
  const lastUrl = useRef('');

  const elements = useMemo(() => [...new Set(rows.map((r) => r.element))].sort(), [rows]);
  const classes = useMemo(() => [...new Set(rows.map((r) => r.class))].sort(), [rows]);
  const rarities = useMemo(
    () => [...new Set(rows.map((r) => r.rarity))].sort((a, b) => b - a),
    [rows],
  );

  const toggle =
    <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    (value: T) =>
      setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  // ── Hydratation depuis l'URL (au montage) ──
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const p = new URLSearchParams(window.location.search);
    const list = (k: string) => (p.get(k) ? p.get(k)!.split(',').filter(Boolean) : []);
    setQ(p.get('q') ?? '');
    setElement(list('el'));
    setKlass(list('cl'));
    setRarity(
      list('r')
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    );
    setRole(list('role'));
    const tr = Number(p.get('tr'));
    setTranscend(TRANSCEND_STEPS.includes(tr) ? tr : TOP_STEP);
    // (`tr` n'est écrit que si `withTranscend` — le lire sans est inoffensif.)
    // `tr` porte désormais un PALIER et non un compte d'étoiles : un vieux lien
    // `tr=5` disait 5★ et dit maintenant 4★+. Les deux valeurs restent valides,
    // rien ne casse — et une URL de filtre ne se conserve pas.
  }, []);

  // ── Sync filtres → URL (débattu) ──
  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    const set = (k: string, v?: string) => v && params.set(k, v);
    set('q', q.trim() || undefined);
    set('el', enc(element));
    set('cl', enc(klass));
    set('r', enc(rarity));
    set('role', enc(role));
    if (withTranscend && transcend !== TOP_STEP) set('tr', String(transcend));
    const search = params.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    const handle = setTimeout(() => {
      if (lastUrl.current === url) return;
      lastUrl.current = url;
      // URL dynamique (filtres) → hors du typage des routes statiques de Next.
      router.replace(url as Parameters<typeof router.replace>[0], { scroll: false });
    }, 150);
    return () => clearTimeout(handle);
  }, [q, element, klass, rarity, role, transcend, withTranscend, pathname, router]);

  /** Le palier auquel la liste se lit — choisi (PvE), imposé (PvP) ou aucun (EE). */
  const step = withTranscend ? transcend : fixedTranscend;

  // ── Rang/rôle résolus au palier de transcendance courant ──
  const resolved = useMemo(() => {
    if (!withTranscend) return rows;
    return rows.map((r) => ({
      ...r,
      rank: atStep(r.rankByTranscend, transcend, r.rank),
      role: atStep(r.roleByTranscend, transcend, r.role),
    }));
  }, [rows, withTranscend, transcend]);

  // ── Filtrage ──
  const filtered = useMemo(() => {
    const needle = query.normalize('NFKC').toLowerCase().trim();
    const elS = new Set(element);
    const clS = new Set(klass);
    const rS = new Set(rarity);
    const roS = new Set(role);
    return resolved.filter((row) => {
      if (needle && !row.searchNames.some((n) => n.includes(needle))) return false;
      if (elS.size && !elS.has(row.element)) return false;
      if (clS.size && !clS.has(row.class)) return false;
      if (rS.size && !rS.has(row.rarity)) return false;
      if (roS.size && (!row.role || !roS.has(row.role))) return false;
      return true;
    });
  }, [resolved, query, element, klass, rarity, role]);

  // ── Groupement par tier (tri alphabétique dans chaque rangée) ──
  const grouped = useMemo(() => {
    const map = new Map<Tier, TierListRow[]>();
    for (const tier of TIERS) map.set(tier, []);
    for (const row of filtered) {
      const tier = row.rank as Tier;
      if (map.has(tier)) map.get(tier)!.push(row);
    }
    // Tri sur le nom COMPLET, comme avant que la rangée ne porte le nom nu.
    for (const list of map.values())
      list.sort((a, b) =>
        joinDisplayName(a.prefix, a.name).localeCompare(joinDisplayName(b.prefix, b.name)),
      );
    return map;
  }, [filtered]);

  return (
    <div className="mx-auto max-w-350 space-y-3">
      {/* Avertissement */}
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-200/90">
        <span className="mr-1.5">⚠️</span>
        {labels.disclaimer}
      </div>

      {/* Légende des tiers (outils EE) */}
      {labels.legend && labels.legend.length > 0 && (
        <div className="text-content-muted flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          {labels.legend.map(({ tier, label }) => (
            <div key={tier} className="flex items-center gap-1">
              <img src={img.rank(tier)} alt={tier} width={20} height={20} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Barre : recherche + élément + classe + rareté + rôles */}
      <CharactersFiltersBar
        query={q}
        onQueryChange={setQ}
        elements={elements}
        elementFilter={element}
        onToggleElement={toggle(setElement)}
        classes={classes}
        classFilter={klass}
        onToggleClass={toggle(setKlass)}
        rarities={rarities}
        rarityFilter={rarity}
        onToggleRarity={toggle(setRarity)}
        roles={labels.roles}
        roleFilter={role}
        onToggleRole={toggle(setRole)}
        labels={labels.bar}
      />

      {/* Sélecteur de transcendance — rangée centrée dédiée (PvE) */}
      {withTranscend && (
        <div className="border-line-subtle bg-surface-raised/60 flex flex-col items-center gap-2 rounded-xl border p-4">
          <p className="text-content-muted text-center font-mono text-[10px] font-semibold tracking-[0.16em] uppercase">
            {labels.transcendLevel}
          </p>
          {/* Les pastilles peignent la RANGÉE DU JEU, pas un compte : le cran 5★ (le
              palier 6) montre cinq étoiles, le 6★ (palier 9) en montre six — c'est
              ce que le portrait rendra juste en dessous. `title` porte le nom
              lisible, et fait l'étiquette a11y du bouton (qui n'a pas de texte). */}
          <div className="flex flex-wrap justify-center gap-2">
            {TRANSCEND_STEPS.map((s) => (
              <FilterPill
                key={s}
                active={transcend === s}
                onClick={() => setTranscend(s)}
                title={transcendenceLabel(PILL_RARITY, s)}
                className="h-8 px-3"
              >
                <span className="flex items-center -space-x-1">
                  {transcendenceStars(PILL_RARITY, s).map((tone, i) => (
                    <img key={i} src={img.star(tone)} alt="" aria-hidden width={16} height={16} />
                  ))}
                </span>
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {/* Rangées de tiers */}
      <div className="mt-6 space-y-4">
        {TIERS.map((tier) => {
          const chars = grouped.get(tier);
          if (!chars || chars.length === 0) return null;
          return (
            <div
              key={tier}
              className={`rounded-xl border bg-linear-to-r ${TIER_COLORS[tier]} overflow-hidden`}
            >
              <div className="flex items-center gap-3">
                {/* Glyphe de rang */}
                <div className="flex min-h-20 w-16 shrink-0 items-center justify-center md:w-20">
                  <img
                    src={img.rank(tier)}
                    alt={`Tier ${tier}`}
                    className="size-12 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] md:size-14"
                    width={48}
                    height={48}
                  />
                </div>

                {/* Grille de personnages */}
                <div className="flex flex-wrap gap-2 py-3 pr-3 lg:gap-3">
                  {chars.map((row, index) => (
                    <CharacterCard
                      key={row.id}
                      id={row.id}
                      name={row.name}
                      prefix={row.prefix}
                      shortName={row.shortName}
                      element={row.element}
                      classType={row.class}
                      rarity={row.rarity}
                      // Le palier passe par `transcendence`, sa vraie prop : il
                      // décide du nombre d'étoiles ET de la teinte du « + ». Il
                      // était passé À LA PLACE de la rareté pour obtenir le bon
                      // compte (accident, teinte perdue), puis sous forme de
                      // compte d'étoiles — ce qui décalait le rendu d'un cran.
                      // C'est un PALIER, maintenant, des deux côtés.
                      transcendence={step}
                      tags={row.tags}
                      href={`/characters/${row.slug}`}
                      starAriaLabel={labels.bar.starAria}
                      scale="dense"
                      priority={tier === 'S' && index <= 5}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compteur */}
      <p className="text-content-subtle text-center text-xs">
        {filtered.length} {labels.charactersCount}
      </p>
    </div>
  );
}
